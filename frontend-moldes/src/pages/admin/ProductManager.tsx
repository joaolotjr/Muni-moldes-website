import React, { useEffect, useState } from 'react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { db } from '../../services/db';
import { Product } from '../../types';
import { Plus, Edit, Trash2, X, Save, Upload, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

export const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({});
  
  // Image Management State
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [tempUrl, setTempUrl] = useState('');

  useEffect(() => {
    refreshList();
  }, []);

  const refreshList = () => {
    setProducts(db.getProducts());
    setCollections(db.getCollections());
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ ...product });
      setImageUrls([...product.images]);
    } else {
      setEditingProduct(null);
      setFormData({
        active: true,
        isNew: true,
        collection: collections[0] || 'Geral',
      });
      setImageUrls([]);
    }
    setTempUrl('');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      db.deleteProduct(id);
      refreshList();
    }
  };

  // Image Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setImageUrls(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAddExternalUrl = () => {
    if (tempUrl.trim()) {
      setImageUrls(prev => [...prev, tempUrl.trim()]);
      setTempUrl('');
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate Slug
    const slug = formData.name?.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') || '';
    
    const finalImages = imageUrls.length > 0 ? imageUrls : ['https://via.placeholder.com/600x600?text=Sem+Imagem'];

    const productToSave: Product = {
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      name: formData.name || '',
      slug: slug,
      collection: formData.collection || collections[0] || 'Geral',
      description: formData.description || '',
      price: Number(formData.price) || 0,
      images: finalImages,
      dimensions: formData.dimensions || '',
      weight: formData.weight || '',
      material: formData.material || '',
      active: formData.active ?? true,
      isNew: formData.isNew ?? false,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString()
    };

    try {
      db.saveProduct(productToSave);
      setIsModalOpen(false);
      refreshList();
    } catch (err) {
      alert('Erro ao salvar: O tamanho das imagens pode ser muito grande para o armazenamento local.');
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <AdminSidebar />
      <div className="ml-64 flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Catálogo</h1>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-brand-700 transition-colors"
          >
            <Plus size={20} /> Novo Produto
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Imagem</th>
                <th className="p-4 font-semibold text-gray-600">Nome</th>
                <th className="p-4 font-semibold text-gray-600">Coleção</th>
                <th className="p-4 font-semibold text-gray-600">Preço</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
                <th className="p-4 font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <img src={product.images[0]} alt="" className="w-12 h-12 rounded object-cover bg-gray-200" />
                  </td>
                  <td className="p-4 font-medium text-gray-900">{product.name}</td>
                  <td className="p-4 text-gray-600">{product.collection}</td>
                  <td className="p-4 text-gray-600">R$ {product.price.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${product.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.active ? 'ATIVO' : 'INATIVO'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenModal(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coleção</label>
                <select
                  value={formData.collection || collections[0]}
                  onChange={e => setFormData({...formData, collection: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 bg-white text-black"
                >
                  {collections.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price || ''}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 bg-white text-black"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description || ''}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 bg-white text-black"
                />
              </div>

              {/* Image Manager Section */}
              <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                   <ImageIcon size={18} /> Galeria de Imagens
                </label>
                
                {/* Image Grid */}
                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mb-4">
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-square group">
                        <img src={url} alt="" className="w-full h-full object-cover rounded-lg border border-gray-300 bg-white" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-1 rounded-b-lg">
                            Capa
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                  
                  {/* Upload Button */}
                  <div className="w-full sm:w-auto">
                    <label className="cursor-pointer bg-white border border-dashed border-gray-400 text-gray-600 px-4 py-2 rounded-lg hover:bg-brand-50 hover:border-brand-500 hover:text-brand-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium h-[42px]">
                      <Upload size={18} />
                      <span>Upload do PC</span>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>

                  {/* URL Input */}
                  <div className="flex-1 w-full flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Ou cole uma URL externa..."
                        value={tempUrl}
                        onChange={e => setTempUrl(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-white text-black"
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddExternalUrl())}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddExternalUrl}
                      className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-bold hover:bg-gray-300"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dimensões</label>
                <input
                  type="text"
                  placeholder="Ex: 10cm x 5cm"
                  value={formData.dimensions || ''}
                  onChange={e => setFormData({...formData, dimensions: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peso</label>
                <input
                  type="text"
                  placeholder="Ex: 200g"
                  value={formData.weight || ''}
                  onChange={e => setFormData({...formData, weight: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                <input
                  type="text"
                  value={formData.material || ''}
                  onChange={e => setFormData({...formData, material: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 bg-white text-black"
                />
              </div>

              <div className="flex items-center gap-6 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active ?? true}
                    onChange={e => setFormData({...formData, active: e.target.checked})}
                    className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 bg-white"
                  />
                  <span className="text-gray-700 font-medium">Produto Ativo</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNew ?? false}
                    onChange={e => setFormData({...formData, isNew: e.target.checked})}
                    className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 bg-white"
                  />
                  <span className="text-gray-700 font-medium">Marcar como Lançamento</span>
                </label>
              </div>

              <div className="md:col-span-2 pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 flex items-center gap-2"
                >
                  <Save size={18} /> Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};