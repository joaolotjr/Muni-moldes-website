import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Box, Droplet } from 'lucide-react';
import { db } from '../../services/db';
import { type Product } from '../../types';
import { SEO } from '../../components/SEO';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const all = db.getProducts();
    setFeaturedProducts(all.filter(p => p.active).slice(0, 4));
  }, []);

  return (
    <>
      <SEO title="Início" description="Muni Moldes - Dê vida à sua arte com precisão." url="/" />
      
      {/* Hero Section - Soft Lab Concept */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-canvas pt-20">
        {/* Background Image with Focus Blur */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/muni_hero_soft/1920/1080" 
            alt="Atelier Muni Moldes" 
            className="w-full h-full object-cover opacity-80"
          />
          {/* Organic Gradient Mask Overlay - Updated color to match new Palette (Pearl/#FDFCF8) */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FDFCF8] via-[#FDFCF8]/90 to-transparent sm:w-[70%]"></div>
        </div>

        {/* Decorative Organic Blob */}
        <div className="absolute -left-20 top-20 w-[600px] h-[600px] bg-brand-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-2xl">
            <span className="inline-block py-1 px-3 rounded-full bg-brand-100 text-brand-600 text-xs font-bold tracking-wider mb-6">
              NOVA COLEÇÃO DISPONÍVEL
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-main mb-6 leading-tight tracking-tight">
              Dê vida à sua arte <span className="text-brand-600">com precisão.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-light mb-10 leading-relaxed max-w-lg">
              Moldes de silicone premium para confeitaria e artesanato. Durabilidade para sua produção, magia no resultado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/catalogo" 
                className="bg-accent-coral text-white px-8 py-4 rounded-full font-bold text-center transition-all shadow-coral hover:shadow-lg active:scale-95 transform hover:-translate-y-1"
              >
                Ver Catálogo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Neumorphic Cards */}
      <section className="py-24 bg-canvas relative z-20 -mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group bg-white rounded-3xl p-8 shadow-soft hover:shadow-glow transition-all duration-500 transform hover:-translate-y-2 border border-white">
              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-6 group-hover:bg-brand-100 transition-colors">
                <Sparkles size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-slate-main mb-3">Confeitaria</h3>
              <p className="text-slate-light mb-6">Detalhes perfeitos para chocolates e pastas de açúcar.</p>
              <Link to="/catalogo?c=Natal" className="inline-flex items-center text-accent-coral font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Ver Produtos <ArrowRight size={18} className="ml-2" />
              </Link>
            </div>

            {/* Card 2 */}
            <div className="group bg-white rounded-3xl p-8 shadow-soft hover:shadow-glow transition-all duration-500 transform hover:-translate-y-2 border border-white">
              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-6 group-hover:bg-brand-100 transition-colors">
                <Box size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-slate-main mb-3">Artesanato</h3>
              <p className="text-slate-light mb-6">Resistência ideal para resina, gesso e cimento.</p>
              <Link to="/catalogo?c=Geométricos" className="inline-flex items-center text-accent-coral font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Ver Produtos <ArrowRight size={18} className="ml-2" />
              </Link>
            </div>

            {/* Card 3 */}
            <div className="group bg-white rounded-3xl p-8 shadow-soft hover:shadow-glow transition-all duration-500 transform hover:-translate-y-2 border border-white">
              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-6 group-hover:bg-brand-100 transition-colors">
                <Droplet size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-slate-main mb-3">Saboaria</h3>
              <p className="text-slate-light mb-6">Acabamento liso e desmoldagem fácil para sabonetes.</p>
              <Link to="/catalogo?c=Florais" className="inline-flex items-center text-accent-coral font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Ver Produtos <ArrowRight size={18} className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-main">Destaques da Coleção</h2>
              <p className="text-slate-light mt-2">Os moldes mais procurados do momento</p>
            </div>
            <Link to="/catalogo" className="hidden md:flex items-center text-brand-600 font-semibold hover:text-brand-900 transition-colors">
              Ver tudo <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="group">
                <Link to={`/catalogo/${product.slug}`}>
                  <div className="aspect-square bg-canvas rounded-3xl overflow-hidden mb-4 relative">
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    {product.isNew && (
                      <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-brand-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        NOVO
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">{product.collection}</span>
                    <h3 className="text-lg font-bold text-slate-main mt-1 group-hover:text-accent-coral transition-colors">{product.name}</h3>
                    <p className="text-slate-light text-sm mt-1">{product.dimensions}</p>
                    <div className="mt-3 font-medium text-slate-main">R$ {product.price.toFixed(2)}</div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <Link to="/catalogo" className="inline-flex items-center text-brand-600 font-semibold">
              Ver catálogo completo <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Teaser */}
      <section className="py-20 bg-canvas overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-600 rounded-[2.5rem] p-12 md:p-24 relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Tradição em Qualidade</h2>
                <p className="text-brand-100 mb-8 leading-relaxed text-lg">
                  A Muni Moldes nasceu da necessidade de oferecer ferramentas que unissem durabilidade e precisão. 
                  Nossos silicones são selecionados rigorosamente para garantir que sua peça final tenha o acabamento perfeito.
                </p>
                <Link to="/sobre" className="inline-block bg-white text-brand-900 px-8 py-3 rounded-full font-bold hover:bg-brand-50 transition-colors shadow-lg">
                  Conheça nossa história
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};