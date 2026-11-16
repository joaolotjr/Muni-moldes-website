import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { ChevronDown, ExternalLink, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { categoryLabel, formatNewsDate, newsCategories } from '../../config/news';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import type { NewsPost } from '../../types';

function initials(name: string | null) {
  if (!name) return '–';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

function StatusChip({ status }: { status?: string }) {
  return status === 'published' ? (
    <span className="inline-flex rounded-full bg-secondary-soft px-3 py-1 text-xs font-semibold text-secondary-dark">
      Publicado
    </span>
  ) : (
    <span className="inline-flex rounded-full border border-line bg-line-soft px-3 py-1 text-xs font-semibold text-ink-soft">
      Rascunho
    </span>
  );
}

export function NewsList() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  useEffect(() => {
    api
      .get<NewsPost[]>('/news/admin')
      .then((res) => setPosts(res.data))
      .catch(() => showToast('Erro ao carregar as notícias.', 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return posts.filter(
      (post) =>
        (!category || post.category === category) &&
        (!term || `${post.title} ${post.author_name ?? ''}`.toLowerCase().includes(term)),
    );
  }, [posts, search, category]);

  const handleDelete = (post: NewsPost) => {
    confirm({
      title: 'Excluir notícia',
      message: `Tem certeza que deseja excluir "${post.title}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      onConfirm: async () => {
        try {
          await api.delete(`/news/${post.id}`);
          setPosts((current) => current.filter((item) => item.id !== post.id));
          showToast('Notícia excluída.', 'success');
        } catch (error) {
          const message = isAxiosError(error) ? error.response?.data?.message : undefined;
          showToast(typeof message === 'string' ? message : 'Erro ao excluir a notícia.', 'error');
        }
      },
    });
  };

  return (
    <div className="text-ink">
      <div className="mb-8 flex flex-col items-start justify-between gap-5 md:mb-12 md:flex-row md:items-center">
        <div>
          <h1 className="heading-1">Gerenciamento de notícias</h1>
          <p className="mt-2 text-ink-soft">Gerencie publicações e rascunhos da página de notícias do site.</p>
        </div>
        <Link to="/admin/noticias/nova" className="btn btn-primary w-full normal-case tracking-[0.03em] md:w-auto">
          <Plus className="h-5 w-5" />
          Adicionar nova
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row">
        <div className="relative max-w-md flex-grow">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-outline" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título ou autor..."
            aria-label="Buscar por título ou autor"
            className="field bg-white pl-12"
          />
        </div>
        <div className="relative w-full md:w-64">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filtrar por categoria"
            className="field appearance-none bg-white pr-10"
          >
            <option value="">Todas as categorias</option>
            {newsCategories.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-outline" />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
        <div className="hidden items-center bg-surface-mid px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft md:flex">
          <div className="min-w-0 flex-grow">Título</div>
          <div className="hidden w-48 lg:block">Autor</div>
          <div className="w-36">Publicação</div>
          <div className="w-28">Status</div>
          <div className="w-32 text-right">Ações</div>
        </div>

        {loading ? (
          <p className="px-6 py-10 text-center text-ink-soft">Carregando notícias...</p>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-serif text-lg font-semibold">
              {posts.length === 0 ? 'Nenhuma notícia cadastrada ainda' : 'Nenhuma notícia encontrada'}
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              {posts.length === 0 ? 'Crie a primeira em "Adicionar nova".' : 'Tente outra busca ou categoria.'}
            </p>
          </div>
        ) : (
          <ul>
            {filtered.map((post, index) => (
              <li
                key={post.id}
                className={`group flex flex-col gap-3 px-5 py-5 transition-colors hover:bg-line-soft md:flex-row md:items-center md:gap-0 md:px-6 ${
                  index % 2 === 1 ? 'bg-surface-low' : 'bg-white'
                }`}
              >
                <div className="min-w-0 flex-grow md:pr-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-outline">
                    {categoryLabel(post.category)}
                  </p>
                  <h2 className="mt-1 font-serif text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
                    <Link to={`/admin/noticias/${post.id}`}>{post.title}</Link>
                  </h2>
                  {post.excerpt && <p className="mt-1 line-clamp-1 text-sm text-ink-soft">{post.excerpt}</p>}
                </div>
                <div className="hidden w-48 shrink-0 items-center gap-3 text-ink-soft lg:flex">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-xs font-semibold text-secondary-dark">
                    {initials(post.author_name)}
                  </span>
                  <span className="truncate">{post.author_name ?? 'Sem autor'}</span>
                </div>
                <div className="flex items-center gap-3 md:contents">
                  <div className="shrink-0 text-sm text-ink-soft md:w-36 md:text-base">
                    {post.status === 'published' ? formatNewsDate(post.published_at, 'short') : '--'}
                  </div>
                  <div className="shrink-0 md:w-28">
                    <StatusChip status={post.status} />
                  </div>
                  <div className="ml-auto flex shrink-0 justify-end gap-1 md:ml-0 md:w-32">
                    {post.status === 'published' && (
                      <a
                        href={`/noticias/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Ver "${post.title}" no site`}
                        title="Ver no site"
                        className="flex h-10 w-10 items-center justify-center rounded-full text-outline transition-colors hover:bg-surface-mid hover:text-secondary"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                    <Link
                      to={`/admin/noticias/${post.id}`}
                      aria-label={`Editar "${post.title}"`}
                      title="Editar"
                      className="flex h-10 w-10 items-center justify-center rounded-full text-outline transition-colors hover:bg-surface-mid hover:text-primary"
                    >
                      <Pencil className="h-5 w-5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(post)}
                      aria-label={`Excluir "${post.title}"`}
                      title="Excluir"
                      className="flex h-10 w-10 items-center justify-center rounded-full text-outline transition-colors hover:bg-[#ffdad6] hover:text-[#ba1a1a]"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!loading && posts.length > 0 && (
          <div className="border-t border-line/30 bg-surface-mid px-6 py-4 text-sm text-ink-soft">
            Mostrando {filtered.length} de {posts.length} {posts.length === 1 ? 'notícia' : 'notícias'}
          </div>
        )}
      </div>
    </div>
  );
}
