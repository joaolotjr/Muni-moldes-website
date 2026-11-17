import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderTree, Megaphone, Package, PlusCircle, Settings, SquarePen } from 'lucide-react';
import { api } from '../../services/api';
import type { Collection, NewsPost, Product } from '../../types';

export function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<Product[]>('/products'),
      api.get<Collection[]>('/collections'),
      api.get<NewsPost[]>('/news/admin'),
    ])
      .then(([productsRes, collectionsRes, newsRes]) => {
        setProducts(productsRes.data);
        setCollections(collectionsRes.data);
        setNews(newsRes.data);
      })
      .catch((error) => {
        console.error('Error fetching dashboard data', error);
        setFailed(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const publishedNews = news.filter((post) => post.status === 'published').length;
  const stats = [
    { label: 'Total de produtos', value: products.length, icon: Package, tone: 'bg-primary-soft/20 text-primary', to: '/admin/produtos' },
    { label: 'Categorias', value: collections.length, icon: FolderTree, tone: 'bg-secondary-soft/40 text-secondary', to: '/admin/colecoes' },
    { label: 'Notícias publicadas', value: publishedNews, icon: Megaphone, tone: 'bg-surface-high text-ink-soft', to: '/admin/noticias' },
  ];

  // A API devolve os produtos do mais antigo para o mais novo.
  const latest = [...products].reverse().slice(0, 5);

  const actions = [
    { label: 'Novo produto', icon: PlusCircle, tone: 'text-primary', to: '/admin/produtos/novo' },
    { label: 'Nova notícia', icon: SquarePen, tone: 'text-secondary', to: '/admin/noticias/nova' },
    { label: 'Gerenciar categorias', icon: FolderTree, tone: 'text-ink-soft', to: '/admin/colecoes' },
    { label: 'Configurações do site', icon: Settings, tone: 'text-ink', to: '/admin/configuracoes' },
  ];
  const actionClass =
    'group flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border border-line/20 bg-surface-mid p-4 text-center transition-colors hover:bg-line-soft';

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      <h1 className="heading-2">Visão geral</h1>

      {failed && (
        <p role="alert" className="rounded-lg border border-[#ba1a1a]/20 bg-[#ffdad6] px-4 py-3 text-sm font-medium text-[#93000a]">
          Não foi possível carregar os dados do painel. Recarregue a página.
        </p>
      )}

      <section className="grid gap-4 md:grid-cols-3 md:gap-6" aria-label="Resumo">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.to}
            className="flex items-center gap-5 rounded-xl border border-line/20 bg-white p-5 shadow-soft transition-shadow hover:shadow-lift sm:p-6"
          >
            <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${stat.tone}`}>
              <stat.icon className="h-7 w-7" strokeWidth={1.75} />
            </span>
            <span>
              <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">{stat.label}</span>
              <span className="mt-1 block font-serif text-4xl font-semibold leading-tight">{loading ? '–' : stat.value}</span>
            </span>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        <div className="flex flex-col overflow-hidden rounded-xl border border-line/20 bg-white shadow-soft">
          <div className="flex items-center justify-between gap-4 border-b border-line/20 bg-surface p-5 sm:p-6">
            <h2 className="heading-3">Últimos produtos</h2>
            <Link to="/admin/produtos" className="shrink-0 text-[13px] font-semibold text-primary hover:text-primary-dark">
              Ver todos
            </Link>
          </div>
          {loading ? (
            <p className="p-6 text-ink-soft">Carregando...</p>
          ) : latest.length === 0 ? (
            <p className="p-6 text-ink-soft">Nenhum produto cadastrado ainda.</p>
          ) : (
            <ul>
              {latest.map((product) => (
                <li key={product.id} className="border-b border-line/10 last:border-b-0">
                  <Link
                    to={`/admin/produtos/${product.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface-low sm:px-6"
                  >
                    <span className="min-w-0 truncate font-medium">{product.name}</span>
                    <span className="shrink-0 text-sm text-ink-soft">{product.collection?.name ?? 'Sem categoria'}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col overflow-hidden rounded-xl border border-line/20 bg-white shadow-soft">
          <div className="border-b border-line/20 bg-surface p-5 sm:p-6">
            <h2 className="heading-3">Ações rápidas</h2>
          </div>
          <div className="grid grid-cols-2 content-start gap-4 p-5 sm:p-6">
            {actions.map((action) => (
              <Link key={action.label} to={action.to} className={actionClass}>
                <action.icon className={`h-6 w-6 transition-transform group-hover:scale-110 ${action.tone}`} />
                <span className="text-[13px] font-semibold text-ink-soft">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
