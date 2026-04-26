import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ArrowLeft, Save, ImagePlus, Loader2 } from 'lucide-react';

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
  });
  const [images, setImages] = useState<any[]>([]);

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
          });
          setImages(product.images || []);
        }
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await api.put(`/products/${id}`, formData);
        navigate('/admin/produtos');
      } else {
        const res = await api.post('/products', formData);
        // If there's a file selected, upload it
        if (fileInputRef.current?.files?.length) {
          const file = fileInputRef.current.files[0];
          const formDataObj = new FormData();
          formDataObj.append('file', file);
          formDataObj.append('isCover', 'true');
          await api.post(`/products/${res.data.id}/images`, formDataObj, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
        navigate('/admin/produtos');
      }
    } catch (error) {
      alert('Erro ao salvar produto.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!id) return alert('Salve o produto primeiro antes de adicionar mais imagens.');
    if (e.target.files?.length) {
      const file = e.target.files[0];
      const formDataObj = new FormData();
      formDataObj.append('file', file);
      
      try {
        const res = await api.post(`/products/${id}/images`, formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setImages([...images, res.data]);
      } catch (error) {
        alert('Erro ao fazer upload da imagem.');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
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
              <label className="text-sm font-medium text-slate-700">Peso Final do Chocolate</label>
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

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Fotos do Produto</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {images.map((img) => (
                <div key={img.id} className="aspect-square rounded-xl overflow-hidden border border-slate-200 relative group">
                  <img src={`http://localhost:3333${img.image_url}`} alt="Product" className="w-full h-full object-cover" />
                </div>
              ))}
              
              <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-indigo-600">
                <ImagePlus className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">Adicionar Foto</span>
                <input
                  type="file"
                  className="hidden"
                  ref={id ? null : fileInputRef}
                  onChange={id ? handleImageUpload : undefined}
                  accept="image/*"
                />
              </label>
            </div>
            {!id && <p className="text-xs text-amber-600 font-medium">A foto selecionada será enviada automaticamente ao salvar o produto novo.</p>}
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
