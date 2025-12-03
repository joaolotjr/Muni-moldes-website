import React, { useEffect, useState } from 'react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { db } from '../../services/db';
import { Plus, Trash2, Tag, Edit2, X, Save, AlertTriangle } from 'lucide-react';

export const CollectionManager: React.FC = () => {
  const [collections, setCollections] = useState<string[]>([]);
  const [newCollection, setNewCollection] = useState('');
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  
  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCollectionOldName, setEditingCollectionOldName] = useState('');
  const [editingCollectionNewName, setEditingCollectionNewName] = useState('');

  useEffect(() => {
    refreshList();
  }, []);

  const refreshList = () => {
    setCollections(db.getCollections());
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDeleteError(''); // Clear global errors
    const trimmed = newCollection.trim();
    
    if (!trimmed) return;
    
    if (collections.includes(trimmed)) {
      setError('Esta coleção já existe.');
      return;
    }

    db.addCollection(trimmed);
    setNewCollection('');
    refreshList();
  };

  const handleDelete = (name: string) => {
    // Constraint Check: Is there any product using this collection?
    const products = db.getProducts();
    const productsInCollection = products.filter(p => p.collection === name);

    if (productsInCollection.length > 0) {
        setDeleteError(`Não é possível excluir a coleção "${name}". Existem ${productsInCollection.length} produto(s) associado(s) a ela. Remova ou edite os produtos antes de excluir.`);
        return;
    }

    if (window.confirm(`Excluir a coleção "${name}"?`)) {
      setDeleteError('');
      db.removeCollection(name);
      refreshList();
    }
  };

  const openEditModal = (name: string) => {
      setDeleteError('');
      setEditingCollectionOldName(name);
      setEditingCollectionNewName(name);
      setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingCollectionNewName.trim()) return;

      if (editingCollectionNewName !== editingCollectionOldName) {
          if (collections.includes(editingCollectionNewName)) {
              alert('Já existe uma coleção com este nome.');
              return;
          }
          db.updateCollection(editingCollectionOldName, editingCollectionNewName);
      }
      
      setIsEditModalOpen(false);
      refreshList();
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <AdminSidebar />
      <div className="ml-64 flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Coleções</h1>
        </div>

        {/* Global Error Banner */}
        {deleteError && (
            <div className="mb-8 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl flex items-start gap-4 shadow-sm animate-pulse">
                <div className="bg-red-100 p-2 rounded-full text-red-600">
                    <AlertTriangle size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Ação Bloqueada</h3>
                    <p>{deleteError}</p>
                </div>
                <button onClick={() => setDeleteError('')} className="text-red-400 hover:text-red-700 transition-colors">
                    <X size={24} />
                </button>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Add Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm h-fit">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-brand-600" /> Nova Coleção
            </h2>
            <form onSubmit={handleAdd}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Categoria</label>
                <input
                  type="text"
                  value={newCollection}
                  onChange={(e) => setNewCollection(e.target.value)}
                  placeholder="Ex: Natal, Páscoa..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 bg-white text-black"
                />
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-brand-600 text-white font-bold py-2 rounded-lg hover:bg-brand-700 transition-colors"
              >
                Adicionar
              </button>
            </form>
          </div>

          {/* List */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
             <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Tag size={20} className="text-brand-600" /> Coleções Ativas
                </h2>
             </div>
             
             {collections.length === 0 ? (
               <div className="p-8 text-center text-gray-500">Nenhuma coleção cadastrada.</div>
             ) : (
               <div className="divide-y divide-gray-100">
                 {collections.map((col) => (
                   <div key={col} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                     <span className="font-medium text-gray-700">{col}</span>
                     <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => openEditModal(col)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar Coleção"
                        >
                            <Edit2 size={18} />
                        </button>
                        <button 
                            onClick={() => handleDelete(col)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir Coleção"
                        >
                            <Trash2 size={18} />
                        </button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>

        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                      <h2 className="text-xl font-bold text-gray-900">Editar Coleção</h2>
                      <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                          <X size={24} />
                      </button>
                  </div>
                  <form onSubmit={handleEditSubmit} className="p-6">
                      <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Coleção</label>
                          <input
                              type="text"
                              value={editingCollectionNewName}
                              onChange={(e) => setEditingCollectionNewName(e.target.value)}
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 bg-white text-black"
                              autoFocus
                          />
                          <p className="text-xs text-gray-500 mt-2">
                              Atenção: Todos os produtos desta coleção serão atualizados automaticamente.
                          </p>
                      </div>
                      <div className="flex justify-end gap-3">
                          <button
                              type="button"
                              onClick={() => setIsEditModalOpen(false)}
                              className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                          >
                              Cancelar
                          </button>
                          <button
                              type="submit"
                              className="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-700 flex items-center gap-2"
                          >
                              <Save size={18} /> Salvar
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};