import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '../../services/api';
import { ProductCard } from '../../components/public/ProductCard';
import { QuoteBand } from '../../components/public/QuoteBand';
import type { Collection, Product } from '../../types';
import { collectionsOf, countByCollectionId, matchesSearch } from '../../utils/products';

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

  // Contagem por categoria: um produto em duas categorias conta nas duas. Chave: slug.
  const countByCollection = useMemo(() => {
    const byId = countByCollectionId(products);
    return new Map(collections.map((c) => [c.slug, byId.get(c.id) ?? 0]));
  }, [products, collections]);

  const activeCollection = collections.find((c) => c.slug === activeSlug);

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter(
      (product) =>
        (!activeSlug || collectionsOf(product).some((c) => c.slug === activeSlug)) &&
        matchesSearch(product, term),
    );
  }, [products, activeSlug, search]);

  const clearFilters = () => {
    setSearch('');
    setSearchParams({});
  };

  // No celular os filtros são pílulas em rolagem horizontal; no desktop, lista lateral.
  const filterButtonClass = (active: boolean) =>
    `flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm transition-colors lg:w-full lg:justify-between lg:rounded-lg lg:border-transparent lg:px-3 ${
      active
        ? 'border-primary bg-primary font-semibold text-white lg:border-primary'
        : 'border-line bg-white text-ink-soft hover:text-primary lg:bg-transparent lg:hover:bg-surface-mid'
    }`;

  const filters = [
    { slug: '', name: 'Todos os moldes', count: products.length },
    ...collections.map((c) => ({ slug: c.slug, name: c.name, count: countByCollection.get(c.slug) ?? 0 })),
  ];

  return (
    <div className="flex-1">
      <div className="container-page pt-5 sm:pt-10">
        {/* Faixa de abertura */}
        <section className="rounded-2xl bg-surface-high px-5 py-8 shadow-soft sm:px-12 sm:py-14">
          <p className="eyebrow tracking-[0.2em]">Catálogo</p>
          <h1 className="heading-1 mt-3">
            {activeCollection ? activeCollection.name : 'Catálogo de moldes'}
          </h1>
          <p className="mt-3 max-w-xl text-ink-soft sm:text-lg">
            Escolha os modelos e peça o orçamento da quantidade que você precisa.
          </p>
          <div className="relative mt-6 max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-outline" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou código..."
              aria-label="Buscar pelo nome do molde"
              className="field rounded-full bg-white pl-12"
            />
          </div>
        </section>
      </div>

      {/* Filtros fixos abaixo do cabeçalho no celular */}
      <div className="sticky top-16 z-30 mt-4 bg-surface/95 backdrop-blur-sm lg:hidden">
        <ul className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-3 sm:px-8" aria-label="Filtrar por linha">
          {filters.map((filter) => (
            <li key={filter.slug} className="shrink-0">
              <button
                type="button"
                onClick={() => setSearchParams(filter.slug ? { colecao: filter.slug } : {})}
                aria-pressed={activeSlug === filter.slug}
                className={filterButtonClass(activeSlug === filter.slug)}
              >
                {filter.name}
                <span className="text-xs opacity-70">{filter.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="container-page flex gap-12 pb-14 pt-4 sm:pb-24 lg:pt-12">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-28">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em]">Linha</h2>
            <ul className="mt-5 space-y-1">
              {filters.map((filter) => (
                <li key={filter.slug}>
                  <button
                    type="button"
                    onClick={() => setSearchParams(filter.slug ? { colecao: filter.slug } : {})}
                    aria-pressed={activeSlug === filter.slug}
                    className={filterButtonClass(activeSlug === filter.slug)}
                  >
                    {filter.name}
                    <span className="text-xs opacity-70">{filter.count}</span>
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={clearFilters} className="btn btn-outline mt-8 w-full text-ink-soft">
              Limpar filtros
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <p className="mb-5 text-sm text-ink-soft sm:mb-8" aria-live="polite">
            {loading
              ? 'Carregando moldes...'
              : `Exibindo ${visibleProducts.length} ${visibleProducts.length === 1 ? 'molde' : 'moldes'}`}
          </p>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 lg:gap-8">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-white shadow-soft" />
              ))}
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="card px-6 py-14 text-center">
              <h2 className="heading-3">Nenhum molde encontrado</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
                Não há moldes para a busca ou a linha selecionada. Se procura um modelo específico,
                fale com a gente.
              </p>
              <button type="button" onClick={clearFilters} className="btn btn-outline mt-6">
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 lg:gap-8">
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
