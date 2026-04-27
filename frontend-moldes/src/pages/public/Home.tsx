import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ArrowRight, Star, ShoppingBag, FolderTree } from 'lucide-react';

export function Home() {
  const [collections, setCollections] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collectionsRes, productsRes] = await Promise.all([
          api.get('/collections?public=true'),
          api.get('/products?public=true')
        ]);
        setCollections(collectionsRes.data.slice(0, 4)); // Show top 4 collections
        
        // Sort products by id descending (assuming newer = higher id or just take last 8)
        // Since we have created_at in the backend, we should sort there ideally, 
        // but for now let's just reverse the array and take 8
        const recentProducts = [...productsRes.data].reverse().slice(0, 8);
        setProducts(recentProducts);
      } catch (error) {
        console.error('Error fetching data for home', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex-1 animate-in fade-in duration-700 bg-munibg">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-munilight py-20 sm:py-32 border-b border-munipink/10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noisy-grid.png')] opacity-10 mix-blend-multiply"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-munigreen rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-munipink rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="max-w-2xl flex-1 text-center md:text-left">
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-munidark tracking-tight leading-tight mb-6">
              Crie Magia com Nossos <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-munipink to-munigreen">
                Moldes Artesanais
              </span>
            </h1>
            <p className="font-sans text-lg sm:text-xl text-munidark/80 mb-8 leading-relaxed max-w-xl mx-auto md:mx-0">
              Sua criatividade começa aqui. Transforme sua confeitaria ou artesanato com detalhes perfeitos e qualidade incomparável.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/catalogo" className="inline-flex items-center justify-center gap-2 bg-munipink hover:bg-[#a67c79] text-white px-8 py-4 rounded-full font-bold transition-all shadow-xl shadow-munipink/20 hover:-translate-y-0.5 font-sans">
                <ShoppingBag className="w-5 h-5" />
                Ver Produtos
              </Link>
            </div>
          </div>
          
          <div className="flex-1 hidden md:block">
            <div className="relative aspect-square w-full max-w-md mx-auto">
              <div className="absolute inset-0 bg-munigreen/10 rounded-full animate-pulse blur-2xl"></div>
              <div className="relative h-full w-full rounded-full border-4 border-white shadow-2xl overflow-hidden bg-munibg flex items-center justify-center">
                <div className="text-munidark/30 text-center p-6 font-sans text-sm">
                  <ImageIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  [Espaço Reservado para<br/>Foto/Vídeo de Alta Qualidade]
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-heading text-3xl font-bold text-munidark tracking-tight">Principais Categorias</h2>
              <p className="font-sans text-munidark/70 mt-2">Encontre o molde perfeito para a sua data comemorativa ou projeto.</p>
            </div>
            <Link to="/catalogo" className="hidden sm:flex items-center gap-2 text-munigreen font-bold hover:text-[#5c8078] transition-colors group">
              Ver todas
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-munigreen border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {collections.map((collection) => (
                <Link key={collection.id} to={`/catalogo?colecao=${collection.slug}`} className="group relative overflow-hidden rounded-[2rem] bg-munibg aspect-[4/3] flex items-center justify-center border border-munipink/10 hover:border-munipink/40 transition-colors shadow-sm hover:shadow-lg hover:shadow-munipink/5">
                  <div className="absolute inset-0 bg-gradient-to-br from-munigreen/5 to-munipink/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="text-center z-10 p-6">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 border border-munipink/10">
                      <FolderTree className="w-8 h-8 text-munigreen" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-munidark">{collection.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section Snippet */}
      <section className="py-24 bg-munibg border-y border-munipink/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-3xl font-bold text-munidark mb-6">Feito com Paixão e Detalhes</h2>
            <p className="font-sans text-lg text-munidark/80 leading-relaxed mb-8">
              A Muni Moldes nasceu do amor de Mariluci pela confeitaria. Nossa missão é criar moldes artesanais de altíssima qualidade que facilitam o seu trabalho e garantem resultados perfeitos, transformando doces e artesanatos em verdadeiras obras de arte.
            </p>
            <Link to="/sobre" className="inline-flex items-center gap-2 text-munigreen font-bold border-b-2 border-transparent hover:border-munigreen transition-all pb-1">
              Ler nossa história completa
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-heading text-3xl font-bold text-munidark tracking-tight">Novidades e Lançamentos</h2>
              <p className="font-sans text-munidark/70 mt-2">Os moldes mais recentes saindo da nossa fábrica.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-munigreen border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {products.map((product) => (
                <Link key={product.id} to={`/molde/${product.slug}`} className="group bg-white rounded-[2rem] border border-munipink/10 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-munipink/10 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                  <div className="aspect-square bg-munibg relative overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img src={`http://localhost:3333${product.images[0].image_url}`} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-munidark/30 bg-munilight">Sem Foto</div>
                    )}
                    {product.collection && (
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                        <span className="bg-white/90 backdrop-blur-sm text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full text-munipink shadow-sm uppercase tracking-wider">
                          {product.collection.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 sm:p-6 flex flex-col flex-1">
                    <h3 className="font-heading font-bold text-munidark text-lg leading-tight mb-2 group-hover:text-munigreen transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-munidark/60 mb-5">{product.dimensions || 'Dimensões não informadas'}</p>
                    <div className="mt-auto">
                      <span className="inline-flex items-center justify-center w-full bg-munilight text-munigreen text-sm font-bold py-3 rounded-xl group-hover:bg-munigreen group-hover:text-white transition-colors">
                        Ver Detalhes
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="mt-16 text-center">
            <Link to="/catalogo" className="inline-flex items-center gap-2 bg-white border border-munipink/20 hover:border-munipink hover:bg-munipink/5 text-munidark hover:text-munipink px-8 py-4 rounded-full font-bold transition-all">
              Ver Todos os Moldes
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}