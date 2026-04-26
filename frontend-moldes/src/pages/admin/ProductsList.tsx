import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';

export function ProductsList() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    confirm({
      title: 'Excluir Molde',
      message: 'Tem certeza que deseja excluir este molde permanentemente?',
      confirmText: 'Excluir',
      onConfirm: async () => {
        try {
          await api.delete(`/products/${id}`);
          fetchProducts();
          showToast('Molde excluído com sucesso.', 'success');
        } catch (error) {
          showToast('Erro ao excluir o molde.', 'error');
        }
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Moldes</h1>
          <p className="text-slate-500 mt-1">Gerencie o catálogo de produtos da Muni Moldes.</p>
        </div>
        <Link
          to="/admin/produtos/novo"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm shadow-indigo-600/20"
        >
          <Plus className="w-5 h-5" />
          Novo Molde
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-sm font-semibold text-slate-600 uppercase tracking-wider">
                <th className="p-4 pl-6">Produto</th>
                <th className="p-4">Coleção</th>
                <th className="p-4">Peso</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Carregando moldes...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Nenhum molde cadastrado ainda.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 pl-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                        {product.images && product.images.length > 0 ? (
                          <img src={`http://localhost:3333${product.images[0].image_url}`} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">/{product.slug}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                        {product.collection?.name || 'Sem Coleção'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 text-sm">
                      {product.final_weight || '-'}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${product.is_active ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' : 'bg-slate-100 text-slate-700 ring-1 ring-slate-400/20'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${product.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {product.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/admin/produtos/${product.id}`}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
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
