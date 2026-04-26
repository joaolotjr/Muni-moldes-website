import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ArrowLeft, Save, ImagePlus, Loader2, X, Trash2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';

export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    dimensions: '',
    final_weight: '',
    collection_id: '',
    is_active: true,
    active_from: '',
    active_until: '',
  });
  const [images, setImages] = useState<any[]>([]);
  const [localImages, setLocalImages] = useState<File[]>([]);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const formatDateForInput = (dateString: string | null) => 
    dateString ? new Date(dateString).toISOString().slice(0, 16) : '';

  useEffect(() => {
    // Fetch collections for dropdown
    api.get('/collections').then((res) => setCollections(res.data));

    if (id) {
      // Edit mode: fetch product data
      // For MVP we just fetch all and find, or we can use a dedicated endpoint (slug based)
      // Actually we have GET /products/:slug, but here we have ID. Wait, we don't have GET /products/:id in the backend, we have GET /products/:slug. Let's fetch all and filter for MVP simplicity.
      api.get('/products').then((res) => {
        const product = res.data.find((p: any) => p.id === id);
        if (product) {
          setFormData({
            name: product.name,
            slug: product.slug,
            description: product.description || '',
            dimensions: product.dimensions || '',
            final_weight: product.final_weight || '',
            collection_id: product.collection_id || '',
            is_active: product.is_active,
            active_from: formatDateForInput(product.active_from),
            active_until: formatDateForInput(product.active_until),
          });
          setImages(product.images || []);
        }
      });
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
      let productId = id;
      if (id) {
        await api.put(`/products/${id}`, payload);
      } else {
        const res = await api.post('/products', payload);
        productId = res.data.id;
      }

      if (productId && localImages.length > 0) {
        for (let i = 0; i < localImages.length; i++) {
          const formDataObj = new FormData();
          formDataObj.append('file', localImages[i]);
          if (!id && i === 0) formDataObj.append('isCover', 'true');
          await api.post(`/products/${productId}/images`, formDataObj, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      }

      navigate('/admin/produtos');
    } catch (error) {
      showToast('Erro ao salvar produto. Verifique os dados e tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLocalImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      
      if (localImages.some(f => f.name === file.name && f.size === file.size)) {
        showToast('Esta foto já foi adicionada na fila de upload!', 'error');
        e.target.value = '';
        return;
      }
      
      setLocalImages([...localImages, file]);
    }
    e.target.value = '';
  };

  const handleRemoveLocalImage = (index: number) => {
    setLocalImages(localImages.filter((_, i) => i !== index));
  };

  const handleRemoveUploadedImage = async (imageId: string) => {
    confirm({
      title: 'Excluir Foto',
      message: 'Tem certeza que deseja excluir permanentemente esta foto?',
      confirmText: 'Excluir',
      onConfirm: async () => {
        try {
          await api.delete(`/products/${id}/images/${imageId}`);
          setImages(images.filter(img => img.id !== imageId));
          showToast('Foto excluída com sucesso.', 'success');
        } catch (error) {
          showToast('Erro ao excluir foto.', 'error');
        }
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl relative">
      <div className="flex items-center gap-4">
        <Link to="/admin/produtos" className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {id ? 'Editar Molde' : 'Novo Molde'}
          </h1>
          <p className="text-slate-500 mt-1">Preencha os detalhes do produto para o catálogo.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nome do Produto</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                placeholder="Ex: Molde Coração Lapidado"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Slug (URL)</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Descrição</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              placeholder="Descreva os detalhes do molde..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Dimensões (cm)</label>
              <input
                type="text"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                placeholder="10x10x5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Peso Médio do Molde</label>
              <input
                type="text"
                value={formData.final_weight}
                onChange={(e) => setFormData({ ...formData, final_weight: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                placeholder="250g"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Coleção</label>
              <select
                value={formData.collection_id}
                onChange={(e) => setFormData({ ...formData, collection_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              >
                <option value="">Selecione...</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Agendar Início (Opcional)</label>
              <input
                type="datetime-local"
                value={formData.active_from}
                onChange={(e) => setFormData({ ...formData, active_from: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Agendar Fim (Opcional)</label>
              <input
                type="datetime-local"
                value={formData.active_until}
                onChange={(e) => setFormData({ ...formData, active_until: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Fotos do Produto</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {images.map((img) => (
                <div key={img.id} className="aspect-square rounded-xl overflow-hidden border border-slate-200 relative group">
                  <img src={`http://localhost:3333${img.image_url}`} alt="Product" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveUploadedImage(img.id)}
                    className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-lg text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50 hover:text-rose-600 shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {localImages.map((file, index) => (
                <div key={index} className="aspect-square rounded-xl overflow-hidden border-2 border-indigo-500 relative group">
                  <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-indigo-900/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-medium mb-2">Na fila de envio</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLocalImage(index)}
                      className="bg-white/20 hover:bg-rose-500 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-indigo-600">
                <ImagePlus className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">Adicionar Foto</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleLocalImageSelect}
                  accept="image/*"
                />
              </label>
            </div>
            {localImages.length > 0 && <p className="text-xs text-amber-600 font-medium">As {localImages.length} foto(s) na fila serão enviadas ao salvar o produto.</p>}
          </div>

          <div className="pt-6 flex items-center justify-end gap-4 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer mr-auto">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-700">Produto Ativo no Catálogo</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-70 disabled:pointer-events-none disabled:transform-none"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Salvar Produto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
