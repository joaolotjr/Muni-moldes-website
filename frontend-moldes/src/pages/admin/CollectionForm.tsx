import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export function CollectionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    is_active: true,
    active_from: '',
    active_until: '',
  });
  const { showToast } = useToast();

  const formatDateForInput = (dateString: string | null) => 
    dateString ? new Date(dateString).toISOString().slice(0, 16) : '';

  useEffect(() => {
    if (id) {
      api.get(`/collections/${id}`).then((res) => {
        setFormData({
          name: res.data.name,
          slug: res.data.slug,
          is_active: res.data.is_active,
          active_from: formatDateForInput(res.data.active_from),
          active_until: formatDateForInput(res.data.active_until),
        });
      }).catch(() => showToast('Erro ao carregar coleção.', 'error'));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      active_from: formData.active_from ? new Date(formData.active_from).toISOString() : null,
      active_until: formData.active_until ? new Date(formData.active_until).toISOString() : null,
    };

    try {
      if (id) {
        await api.put(`/collections/${id}`, payload);
      } else {
        await api.post('/collections', payload);
      }
      navigate('/admin/colecoes');
      showToast('Coleção salva com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao salvar a coleção. Verifique os dados.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link to="/admin/colecoes" className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {id ? 'Editar Coleção' : 'Nova Coleção'}
          </h1>
          <p className="text-slate-500 mt-1">Defina categorias para agrupar seus moldes.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nome da Coleção</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                placeholder="Ex: Páscoa 2024"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Slug (URL)</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Agendar Início (Opcional)</label>
              <input
                type="datetime-local"
                value={formData.active_from}
                onChange={(e) => setFormData({ ...formData, active_from: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Agendar Fim (Opcional)</label>
              <input
                type="datetime-local"
                value={formData.active_until}
                onChange={(e) => setFormData({ ...formData, active_until: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-slate-700">Coleção Ativa</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-70 disabled:pointer-events-none disabled:transform-none"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Salvar Coleção
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
