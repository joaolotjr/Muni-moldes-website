import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '../../services/api';
import { ProductCard } from '../../components/public/ProductCard';
import { QuoteBand } from '../../components/public/QuoteBand';
import type { Collection, Product } from '../../types';

export function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const activeSlug = searchParams.get('colecao') || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collectionsRes, productsRes] = await Promise.all([
          api.get<Collection[]>('/collections?public=true'),
          api.get<Product[]>('/products?public=true'),
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
  }, []);

  const countByCollection = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      if (product.collection) {
        counts.set(product.collection.slug, (counts.get(product.collection.slug) ?? 0) + 1);
      }
    }
    return counts;
  }, [products]);

  const activeCollection = collections.find((c) => c.slug === activeSlug);

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter(
      (product) =>
        (!activeSlug || product.collection?.slug === activeSlug) &&
        (!term || product.name.toLowerCase().includes(term)),
    );
  }, [products, activeSlug, search]);

  const clearFilters = () => {
    setSearch('');
    setSearchParams({});
  };

  const filterButtonClass = (active: boolean) =>
    `flex w-full items-center justify-between gap-3 whitespace-nowrap border-b-2 px-3 py-2 text-left text-sm transition-colors lg:border-b-0 lg:border-l-2 ${
      active
        ? 'border-ink bg-white font-semibold text-ink'
        : 'border-transparent text-ink-soft hover:text-ink'
    }`;

  return (
    <div className="flex-1">
      <section className="border-b border-line bg-white">
        <div className="container-page py-10">
          <nav className="eyebrow flex items-center gap-2" aria-label="Você está em">
            <Link to="/" className="hover:text-ink">Início</Link>
            <span>/</span>
            <span className="text-ink">Catálogo</span>
          </nav>
          <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {activeCollection ? activeCollection.name : 'Catálogo de moldes'}
              </h1>
              <p className="mt-2 font-mono text-xs text-ink-soft">
                {loading
                  ? 'Carregando'
                  : `${visibleProducts.length} ${visibleProducts.length === 1 ? 'molde' : 'moldes'}`}
              </p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar pelo nome do molde"
                aria-label="Buscar pelo nome do molde"
                className="field pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[220px_1fr]">
        <aside className="min-w-0">
          <div className="lg:sticky lg:top-24">
            <p className="eyebrow mb-3">Linhas</p>
            <ul className="flex gap-1 overflow-x-auto pb-2 lg:block lg:space-y-0.5 lg:overflow-visible lg:pb-0">
              <li className="shrink-0">
                <button type="button" onClick={() => setSearchParams({})} className={filterButtonClass(!activeSlug)}>
                  <span>Todos os moldes</span>
                  <span className="font-mono text-xs">{products.length}</span>
                </button>
              </li>
              {collections.map((collection) => (
                <li key={collection.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setSearchParams({ colecao: collection.slug })}
                    className={filterButtonClass(activeSlug === collection.slug)}
                  >
                    <span>{collection.name}</span>
                    <span className="font-mono text-xs">{countByCollection.get(collection.slug) ?? 0}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="aspect-[3/4] animate-pulse border border-line bg-white" />
              ))}
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="border border-line bg-white px-6 py-16 text-center">
              <h2 className="text-lg font-semibold">Nenhum molde encontrado</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
                Não há moldes para a busca ou a linha selecionada. Se procura um modelo específico,
                fale com a gente.
              </p>
              <button type="button" onClick={clearFilters} className="btn btn-outline mt-6">
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      <QuoteBand />
    </div>
  );
}
