import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Plus, Edit2, Trash2, FolderTree } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';

export function CollectionsList() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const fetchCollections = async () => {
    try {
      const response = await api.get('/collections');
      setCollections(response.data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleDelete = async (id: string) => {
    confirm({
      title: 'Excluir Coleção',
      message: 'Tem certeza que deseja excluir esta coleção?',
      confirmText: 'Excluir',
      onConfirm: async () => {
        try {
          await api.delete(`/collections/${id}`);
          fetchCollections();
          showToast('Coleção excluída com sucesso.', 'success');
        } catch (error: any) {
          if (error.response?.data?.message) {
            showToast(`Atenção: ${error.response.data.message}`, 'error');
          } else {
            showToast('Erro ao excluir a coleção.', 'error');
          }
        }
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Coleções</h1>
          <p className="text-slate-500 mt-1">Organize os moldes por categorias ou datas comemorativas.</p>
        </div>
        <Link
          to="/admin/colecoes/nova"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm shadow-emerald-600/20"
        >
          <Plus className="w-5 h-5" />
          Nova Coleção
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-sm font-semibold text-slate-600 uppercase tracking-wider">
                <th className="p-4 pl-6">Nome da Coleção</th>
                <th className="p-4">Slug (URL)</th>
                <th className="p-4 pr-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-500">Carregando coleções...</td>
                </tr>
              ) : collections.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-500">Nenhuma coleção cadastrada ainda.</td>
                </tr>
              ) : (
                collections.map((collection) => (
                  <tr key={collection.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 pl-6 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                        <FolderTree className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="font-semibold text-slate-900">{collection.name}</span>
                    </td>
                    <td className="p-4 text-slate-500">
                      /{collection.slug}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/admin/colecoes/${collection.id}`}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(collection.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
