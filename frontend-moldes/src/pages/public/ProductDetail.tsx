import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, Ruler, Box, Info, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '../../services/db';
import { Product } from '../../types';
import { SEO } from '../../components/SEO';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (slug) {
      const found = db.getProductBySlug(slug);
      if (found) {
        setProduct(found);
        setSelectedImageIndex(0);
      } else {
        navigate('/catalogo');
      }
    }
  }, [slug, navigate]);

  if (!product) return <div className="min-h-screen flex items-center justify-center bg-canvas">Carregando...</div>;

  const whatsappMessage = encodeURIComponent(`Olá, gostaria de um orçamento para o item: ${product.name} (Ref: ${product.id})`);

  // Limit thumbnails to 5 max
  const displayImages = product.images.slice(0, 5);

  return (
    <>
      <SEO 
        title={product.name} 
        description={product.description.substring(0, 160)} 
        image={product.images[0]}
        url={`/catalogo/${product.slug}`}
        type="product"
        productData={{
            name: product.name,
            image: product.images,
            description: product.description,
            sku: product.id,
            price: product.price,
            currency: 'BRL',
            brand: 'Muni Moldes',
            availability: product.active ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
        }}
      />
      
      <div className="bg-canvas min-h-screen py-12 pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-slate-light hover:text-accent-coral mb-8 transition-colors font-medium"
          >
            <ArrowLeft size={20} className="mr-2" /> Voltar para o catálogo
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Image Carousel Section */}
            <div className="space-y-4">
              {/* Main Image View */}
              <div className="bg-white rounded-[2rem] p-4 shadow-soft aspect-square flex items-center justify-center relative overflow-hidden group">
                <img 
                  src={displayImages[selectedImageIndex]} 
                  alt={`${product.name} - View ${selectedImageIndex + 1}`} 
                  className="w-full h-full object-cover rounded-3xl"
                />
                
                {/* Navigation Arrows for Main Image (if more than 1 image) */}
                {displayImages.length > 1 && (
                    <>
                    <button 
                        onClick={() => setSelectedImageIndex(prev => (prev === 0 ? displayImages.length - 1 : prev - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur text-slate-main p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button 
                        onClick={() => setSelectedImageIndex(prev => (prev === displayImages.length - 1 ? 0 : prev + 1))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur text-slate-main p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                        <ChevronRight size={24} />
                    </button>
                    </>
                )}
              </div>

              {/* Thumbnails Row */}
              {displayImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto py-2">
                  {displayImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImageIndex === idx ? 'border-accent-coral shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="flex flex-col justify-center">
              <span className="text-brand-600 font-bold uppercase tracking-wider text-sm bg-brand-50 inline-block px-3 py-1 rounded-full w-fit mb-4">{product.collection}</span>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-main mb-6 leading-tight">{product.name}</h1>
              
              <div className="text-3xl font-bold text-slate-main mb-8 flex items-baseline gap-2">
                R$ {product.price.toFixed(2)}
                <span className="text-sm font-normal text-slate-light">/unidade</span>
              </div>

              <div className="prose text-slate-light mb-10 leading-relaxed">
                <p>{product.description}</p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                  <div className="bg-brand-50 p-2 rounded-lg text-brand-600">
                    <Ruler size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-main text-sm mb-1">Dimensões</h4>
                    <p className="text-slate-light text-sm">{product.dimensions}</p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                  <div className="bg-brand-50 p-2 rounded-lg text-brand-600">
                    <Box size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-main text-sm mb-1">Peso</h4>
                    <p className="text-slate-light text-sm">{product.weight}</p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 col-span-1 sm:col-span-2">
                  <div className="bg-brand-50 p-2 rounded-lg text-brand-600">
                    <Info size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-main text-sm mb-1">Material</h4>
                    <p className="text-slate-light text-sm">{product.material}</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-4">
                <a 
                  href={`https://wa.me/5511999999999?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#1fae54] text-white font-bold py-5 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <MessageCircle size={28} />
                  <span className="text-lg">Solicitar Orçamento deste Item</span>
                </a>
                <p className="text-center text-xs text-slate-400">
                  Transação segura direto com nossa equipe via WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};