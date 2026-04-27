import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Search, FolderTree, Image as ImageIcon } from 'lucide-react';

export function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const activeCollection = searchParams.get('colecao') || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [collectionsRes, productsRes] = await Promise.all([
          api.get('/collections?public=true'),
          api.get(`/products?public=true${activeCollection ? `&collection=${activeCollection}` : ''}`)
        ]);
        setCollections(collectionsRes.data);
        setProducts(productsRes.data);
      } catch (error) {
        console.error('Error fetching catalog data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeCollection]);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 bg-munibg animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-28 space-y-8">
              <div>
                <h3 className="font-heading font-bold text-munidark uppercase tracking-wider mb-4">Buscar</h3>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nome do molde..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-munipink/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-munipink/50 focus:border-munipink transition-all font-sans text-munidark"
                  />
                  <Search className="w-4 h-4 text-munidark/40 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <h3 className="font-heading font-bold text-munidark uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-munigreen" /> Coleções
                </h3>
                <ul className="space-y-1 font-sans">
                  <li>
                    <button
                      onClick={() => setSearchParams({})}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${!activeCollection ? 'bg-munigreen text-white shadow-md shadow-munigreen/20' : 'text-munidark/70 hover:bg-munipink/10 hover:text-munidark'}`}
                    >
                      Todos os Moldes
                    </button>
                  </li>
                  {collections.map(c => (
                    <li key={c.id}>
                      <button
                        onClick={() => setSearchParams({ colecao: c.slug })}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeCollection === c.slug ? 'bg-munigreen text-white shadow-md shadow-munigreen/20' : 'text-munidark/70 hover:bg-munipink/10 hover:text-munidark'}`}
                      >
                        {c.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            <div className="mb-8 bg-white p-8 rounded-3xl border border-munipink/10 shadow-sm">
              <h1 className="font-heading text-3xl font-bold text-munidark tracking-tight">Catálogo de Moldes</h1>
              <p className="font-sans text-munidark/70 mt-2">
                {activeCollection 
                  ? `Exibindo produtos da coleção: ${collections.find(c => c.slug === activeCollection)?.name || activeCollection}` 
                  : 'Navegue por toda nossa coleção de moldes de alta qualidade.'}
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-munigreen border-t-transparent rounded-full animate-spin"></div></div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-munipink/10 p-16 text-center shadow-sm">
                <Search className="w-12 h-12 text-munidark/20 mx-auto mb-4" />
                <h3 className="font-heading text-xl font-bold text-munidark mb-2">Nenhum molde encontrado</h3>
                <p className="font-sans text-munidark/60 max-w-md mx-auto">Não encontramos nenhum molde correspondente à sua busca ou filtro atual.</p>
                <button onClick={() => {setSearch(''); setSearchParams({});}} className="mt-6 text-munipink font-bold hover:text-[#a67c79]">Limpar filtros</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <Link key={product.id} to={`/molde/${product.slug}`} className="group bg-white rounded-[2rem] border border-munipink/10 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-munipink/10 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                    <div className="aspect-square bg-munibg relative overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img src={`http://localhost:3333${product.images[0].image_url}`} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-munidark/30"><ImageIcon className="w-8 h-8 opacity-50" /></div>
                      )}
                    </div>
                    <div className="p-4 sm:p-6 flex flex-col flex-1">
                      <h3 className="font-heading font-bold text-munidark text-lg leading-tight mb-2 group-hover:text-munigreen transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="font-sans text-xs sm:text-sm text-munidark/60 mb-5">{product.dimensions || 'Dimensões não informadas'}</p>
                      <div className="mt-auto">
                        <span className="inline-flex items-center justify-center w-full bg-munilight text-munigreen text-sm font-bold py-3 rounded-xl group-hover:bg-munigreen group-hover:text-white transition-colors">
                          Detalhes
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}