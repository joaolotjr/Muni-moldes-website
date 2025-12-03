import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import { db } from '../../services/db';
import { Product } from '../../types';
import { SEO } from '../../components/SEO';

export const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    searchParams.get('c')?.split(',').filter(Boolean) || []
  );

  useEffect(() => {
    // Load initial data
    const all = db.getProducts().filter(p => p.active);
    setProducts(all);
    setCollections(db.getCollections());
  }, []);

  useEffect(() => {
    // Apply filters
    let result = products;

    // Search
    if (search) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Collections
    if (selectedCollections.length > 0) {
      result = result.filter(p => selectedCollections.includes(p.collection));
    }

    setFilteredProducts(result);

    // Update URL
    const params: any = {};
    if (search) params.q = search;
    if (selectedCollections.length > 0) params.c = selectedCollections.join(',');
    setSearchParams(params);

  }, [products, search, selectedCollections, setSearchParams]);

  const toggleCollection = (col: string) => {
    setSelectedCollections(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  return (
    <>
      <SEO title="Catálogo de Produtos" description="Explore nossa coleção completa de moldes de silicone." />
      
      <div className="bg-canvas min-h-screen py-12 pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12">
            
            {/* Sidebar Filters - Desktop */}
            <div className="hidden md:block w-64 flex-shrink-0">
              <div className="sticky top-28">
                <h3 className="font-bold text-slate-main text-lg mb-6 flex items-center gap-2">
                  <Filter size={20} /> Filtros
                </h3>
                
                <div className="mb-8">
                  <h4 className="font-semibold text-sm text-slate-light mb-4 uppercase tracking-wider">Coleções</h4>
                  <div className="space-y-3">
                    {collections.map(col => (
                      <label key={col} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          selectedCollections.includes(col) ? 'bg-accent-coral border-accent-coral' : 'border-gray-300 bg-white group-hover:border-accent-coral'
                        }`}>
                          {selectedCollections.includes(col) && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <input 
                          type="checkbox" 
                          checked={selectedCollections.includes(col)}
                          onChange={() => toggleCollection(col)}
                          className="hidden"
                        />
                        <span className={`text-sm ${selectedCollections.includes(col) ? 'text-slate-main font-medium' : 'text-slate-light'}`}>{col}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {selectedCollections.length > 0 && (
                  <button 
                    onClick={() => setSelectedCollections([])}
                    className="text-sm text-accent-coral hover:text-accent-coralHover font-medium underline"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Header & Mobile Search/Filter Toggle */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="O que você procura?"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-brand-100 focus:shadow-md transition-shadow text-slate-main placeholder-gray-400"
                  />
                </div>
                
                <button 
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="md:hidden w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white rounded-2xl shadow-sm text-slate-main font-medium"
                >
                  <Filter size={18} /> Filtrar
                </button>
              </div>

              {/* Product Grid */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-300">
                  <h3 className="text-lg font-medium text-slate-main">Nenhum produto encontrado</h3>
                  <p className="text-slate-light mt-2">Tente ajustar seus filtros de busca.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="group bg-white rounded-3xl p-4 shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
                      <Link to={`/catalogo/${product.slug}`}>
                        <div className="aspect-square bg-canvas rounded-2xl overflow-hidden mb-4 relative">
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          {product.isNew && (
                            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-brand-600 text-[10px] font-bold px-2 py-1 rounded-full">
                              NOVO
                            </span>
                          )}
                        </div>
                        <div className="px-2 pb-2">
                          <span className="text-xs font-bold text-brand-500 uppercase tracking-wider">{product.collection}</span>
                          <h3 className="text-lg font-bold text-slate-main mt-1 mb-2 leading-tight group-hover:text-accent-coral transition-colors">{product.name}</h3>
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-slate-light text-sm bg-gray-50 px-2 py-1 rounded-md">{product.dimensions}</span>
                            <span className="font-bold text-slate-main text-lg">R$ {product.price.toFixed(2)}</span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-end">
          <div className="w-80 bg-white h-full p-6 overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-xl text-slate-main">Filtros</h3>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="text-slate-light hover:text-slate-main">
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-8">
              <h4 className="font-semibold text-slate-main mb-4">Coleções</h4>
              <div className="space-y-4">
                {collections.map(col => (
                  <label key={col} className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={selectedCollections.includes(col)}
                      onChange={() => toggleCollection(col)}
                      className="w-5 h-5 rounded text-accent-coral border-gray-300 focus:ring-accent-coral"
                    />
                    <span className="text-slate-600">{col}</span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setIsMobileFiltersOpen(false)}
              className="w-full bg-slate-main text-white py-4 rounded-xl font-bold"
            >
              Ver Resultados ({filteredProducts.length})
            </button>
          </div>
        </div>
      )}
    </>
  );
};