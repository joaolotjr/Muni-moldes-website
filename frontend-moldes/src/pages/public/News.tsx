import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { api } from '../../services/api';
import { categoryLabel, formatNewsDate, newsCategories } from '../../config/news';
import { NewsCover } from '../../components/public/NewsCover';
import { PageHeader } from '../../components/public/PageHeader';
import type { NewsPost } from '../../types';

const PAGE_SIZE = 6;

function Meta({ post, featured = false }: { post: NewsPost; featured?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className={`chip tracking-[0.05em] ${featured ? 'bg-secondary-soft text-secondary-dark' : 'bg-line-soft text-ink-soft'}`}>
        {categoryLabel(post.category)}
      </span>
      <time dateTime={post.published_at ?? undefined} className="text-sm text-outline">
        {formatNewsDate(post.published_at)}
      </time>
    </div>
  );
}

const readMoreClass =
  'mt-auto flex items-center gap-1 pt-5 text-[13px] font-semibold uppercase tracking-[0.08em] text-primary';

export function News() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const activeCategory = searchParams.get('categoria') || '';

  useEffect(() => {
    api
      .get<NewsPost[]>('/news')
      .then((res) => setPosts(res.data))
      .catch((error) => {
        console.error('Error fetching news', error);
        setFailed(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const countByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
    return counts;
  }, [posts]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return posts.filter(
      (post) =>
        (!activeCategory || post.category === activeCategory) &&
        (!term || `${post.title} ${post.excerpt} ${post.tags.join(' ')}`.toLowerCase().includes(term)),
    );
  }, [posts, activeCategory, search]);

  const selectCategory = (value: string) => {
    setVisible(PAGE_SIZE);
    setSearchParams(value ? { categoria: value } : {});
  };

  const filters = [
    { value: '', label: 'Todas', count: posts.length },
    ...newsCategories
      .map((category) => ({ ...category, count: countByCategory.get(category.value) ?? 0 }))
      .filter((category) => category.count > 0 || category.value === activeCategory),
  ];

  const [featured, ...rest] = filtered;
  const shown = rest.slice(0, visible);

  return (
    <div className="flex-1">
      <PageHeader eyebrow="Notícias" title="Notícias e novidades">
        Lançamentos, eventos e dicas de uso dos moldes da Muni Moldes.
      </PageHeader>

      <div className="container-page grid items-start gap-6 pb-16 sm:pb-24 lg:grid-cols-12 lg:gap-12">
        {/* Busca e categorias: no celular ficam no topo, com pílulas roláveis */}
        <aside className="min-w-0 space-y-4 lg:sticky lg:top-28 lg:col-span-3 lg:space-y-8">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-outline" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisible(PAGE_SIZE);
              }}
              placeholder="Buscar notícias..."
              aria-label="Buscar notícias"
              className="field bg-white pl-12 shadow-soft"
            />
          </div>

          <ul className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:hidden" aria-label="Filtrar por categoria">
            {filters.map((filter) => (
              <li key={filter.value} className="shrink-0">
                <button
                  type="button"
                  onClick={() => selectCategory(filter.value)}
                  aria-pressed={activeCategory === filter.value}
                  className={`flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm transition-colors ${
                    activeCategory === filter.value
                      ? 'border-primary bg-primary font-semibold text-white'
                      : 'border-line bg-white text-ink-soft'
                  }`}
                >
                  {filter.label}
                  <span className="text-xs opacity-70">{filter.count}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="hidden rounded-2xl bg-white p-6 shadow-soft lg:block">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-outline">Categorias</h2>
            <ul className="mt-4 space-y-1">
              {filters.map((filter) => {
                const active = activeCategory === filter.value;
                return (
                  <li key={filter.value}>
                    <button
                      type="button"
                      onClick={() => selectCategory(filter.value)}
                      aria-pressed={active}
                      className={`group flex w-full items-center justify-between py-2 text-left transition-colors hover:text-primary ${
                        active ? 'font-semibold text-primary' : 'text-ink'
                      }`}
                    >
                      {filter.label}
                      <span className={`rounded-full px-2 py-1 text-xs transition-colors group-hover:bg-primary-soft group-hover:text-primary-dark ${
                        active ? 'bg-primary-soft text-primary-dark' : 'bg-surface-high text-ink-soft'
                      }`}>
                        {filter.count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        <div className="min-w-0 space-y-6 sm:space-y-12 lg:col-span-9">
          {loading ? (
            <>
              <div className="h-80 animate-pulse rounded-2xl bg-white shadow-soft md:h-[400px]" />
              <div className="grid gap-6 md:grid-cols-2 md:gap-8">
                <div className="h-80 animate-pulse rounded-2xl bg-white shadow-soft" />
                <div className="h-80 animate-pulse rounded-2xl bg-white shadow-soft" />
              </div>
            </>
          ) : !featured ? (
            <div className="card px-6 py-14 text-center">
              <h2 className="heading-3">
                {failed
                  ? 'Não foi possível carregar as notícias'
                  : posts.length === 0
                    ? 'Ainda não há notícias publicadas'
                    : 'Nenhuma notícia encontrada'}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
                {failed
                  ? 'Tente de novo em alguns instantes.'
                  : posts.length === 0
                    ? 'Em breve publicaremos lançamentos e novidades por aqui.'
                    : 'Tente outra busca ou outra categoria.'}
              </p>
              {posts.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    selectCategory('');
                  }}
                  className="btn btn-outline mt-6"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Destaque */}
              <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-soft transition duration-300 hover:shadow-lift md:min-h-[400px] md:flex-row">
                <NewsCover url={featured.cover_image_url} className="h-52 sm:h-64 md:h-auto md:w-1/2" />
                <div className="flex flex-col justify-center p-6 sm:p-8 md:w-1/2 md:p-12">
                  <Meta post={featured} featured />
                  <h2 className="heading-2 mt-4 transition-colors group-hover:text-primary">
                    <Link to={`/noticias/${featured.slug}`} className="after:absolute after:inset-0">
                      {featured.title}
                    </Link>
                  </h2>
                  {featured.excerpt && <p className="mt-4 line-clamp-3 text-ink-soft">{featured.excerpt}</p>}
                  <span className={readMoreClass}>
                    Leia mais
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </article>

              {shown.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 md:gap-8">
                  {shown.map((post) => (
                    <article key={post.id} className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-soft transition duration-300 hover:shadow-lift">
                      <NewsCover url={post.cover_image_url} className="h-48 sm:h-56" />
                      <div className="flex flex-1 flex-col p-6">
                        <Meta post={post} />
                        <h3 className="heading-3 mt-3 line-clamp-2 transition-colors group-hover:text-primary">
                          <Link to={`/noticias/${post.slug}`} className="after:absolute after:inset-0">
                            {post.title}
                          </Link>
                        </h3>
                        {post.excerpt && <p className="mt-3 line-clamp-3 text-ink-soft">{post.excerpt}</p>}
                        <span className={readMoreClass}>
                          Leia mais
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {rest.length > visible && (
                <div className="flex justify-center">
                  <button type="button" onClick={() => setVisible((count) => count + PAGE_SIZE)} className="btn btn-outline w-full sm:w-auto">
                    Carregar mais notícias
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
