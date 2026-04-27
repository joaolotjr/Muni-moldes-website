import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ArrowLeft, Ruler, Weight, MessageCircle, Image as ImageIcon } from 'lucide-react';

export function ProductDetails() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data);
        if (res.data.images && res.data.images.length > 0) {
          setActiveImage(res.data.images[0].image_url);
        }
      } catch (error) {
        console.error('Error fetching product details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return <div className="flex-1 flex justify-center items-center"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!product) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Produto não encontrado</h2>
        <p className="text-slate-500 mb-8 text-center max-w-md">O molde que você está procurando não existe ou não está mais disponível no catálogo.</p>
        <Link to="/catalogo" className="text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Voltar ao catálogo
        </Link>
      </div>
    );
  }

  // Generate WhatsApp link
  const phoneNumber = "5511999999999";
  const message = encodeURIComponent(`Olá! Gostaria de solicitar um orçamento para o molde: *${product.name}*.\n\nLink: ${window.location.href}`);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <div className="flex-1 bg-munibg animate-in fade-in duration-500">
      <div className="bg-white border-b border-munipink/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/catalogo" className="inline-flex items-center gap-2 text-sm font-bold text-munidark/50 hover:text-munipink transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar ao catálogo
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-[2rem] shadow-sm border border-munipink/10 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            
            {/* Image Gallery */}
            <div className="p-6 sm:p-10 border-b md:border-b-0 md:border-r border-munipink/10 bg-munibg flex flex-col">
              <div className="aspect-square bg-white rounded-[2rem] overflow-hidden border border-munipink/10 mb-6 flex-1 flex items-center justify-center p-4">
                {activeImage ? (
                  <img src={`http://localhost:3333${activeImage}`} alt={product.name} className="w-full h-full object-contain" />
                ) : (
                  <div className="text-munidark/30 flex flex-col items-center">
                    <ImageIcon className="w-16 h-16 mb-2 opacity-50" />
                    <span className="text-sm font-sans">Sem foto disponível</span>
                  </div>
                )}
              </div>
              
              {product.images && product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {product.images.map((img: any) => (
                    <button 
                      key={img.id}
                      onClick={() => setActiveImage(img.image_url)}
                      className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === img.image_url ? 'border-munipink shadow-md scale-105' : 'border-transparent hover:border-munipink/50 opacity-70 hover:opacity-100'}`}
                    >
                      <img src={`http://localhost:3333${img.image_url}`} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-6 sm:p-10 lg:p-14 flex flex-col">
              {product.collection && (
                <div className="mb-4">
                  <span className="inline-block bg-munipink/10 text-munipink text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest font-sans">
                    {product.collection.name}
                  </span>
                </div>
              )}
              
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-munidark tracking-tight mb-4">
                {product.name}
              </h1>
              
              <p className="font-sans text-munidark/80 leading-relaxed mb-8 whitespace-pre-wrap flex-1 text-lg">
                {product.description || 'Nenhuma descrição fornecida para este molde.'}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-munibg rounded-2xl p-5 border border-munipink/10 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-munigreen flex-shrink-0 shadow-sm border border-munipink/5">
                    <Ruler className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans text-xs font-bold text-munidark/50 uppercase tracking-wider mb-1">Dimensões</h4>
                    <p className="font-sans font-bold text-munidark">{product.dimensions || 'N/A'}</p>
                  </div>
                </div>
                <div className="bg-munibg rounded-2xl p-5 border border-munipink/10 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-munipink flex-shrink-0 shadow-sm border border-munipink/5">
                    <Weight className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans text-xs font-bold text-munidark/50 uppercase tracking-wider mb-1">Peso (Molde)</h4>
                    <p className="font-sans font-bold text-munidark">{product.final_weight || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 px-8 rounded-full font-bold text-lg transition-all shadow-lg shadow-[#25D366]/20 hover:shadow-[#25D366]/40 hover:-translate-y-1 flex items-center justify-center gap-3 font-sans"
              >
                <MessageCircle className="w-6 h-6" />
                Solicitar Orçamento
              </a>
              <p className="text-center font-sans text-sm text-munidark/40 mt-4">
                Você será redirecionado para o nosso WhatsApp.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
