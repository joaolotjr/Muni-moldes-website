import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api, API_URL } from '../../services/api';
import { categoryLabel, formatNewsDate } from '../../config/news';
import { WhatsAppIcon } from '../../components/icons/WhatsAppIcon';
import { Markdown } from '../../components/public/Markdown';
import { QuoteBand } from '../../components/public/QuoteBand';
import type { NewsPost } from '../../types';

export function NewsArticle() {
  const { slug } = useParams();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchPost = async () => {
      setLoading(true);
      try {
        const res = await api.get<NewsPost>(`/news/${slug}`);
        if (!cancelled) setPost(res.data);
      } catch (error) {
        console.error('Error fetching news article', error);
        if (!cancelled) setPost(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPost();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="container-page flex-1 py-10 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-5">
          <div className="h-4 w-40 animate-pulse rounded bg-surface-high" />
          <div className="h-12 w-4/5 animate-pulse rounded bg-surface-high" />
          <div className="aspect-[16/9] animate-pulse rounded-2xl bg-white shadow-soft" />
          <div className="h-40 animate-pulse rounded bg-surface-mid" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container-page flex flex-1 flex-col items-start justify-center py-20">
        <p className="eyebrow">Notícias</p>
        <h1 className="heading-1 mt-3">Notícia não encontrada</h1>
        <p className="mt-4 max-w-md text-ink-soft">Esta notícia não existe ou saiu do ar.</p>
        <Link to="/noticias" className="btn btn-primary mt-8">
          <ArrowLeft className="h-4 w-4" />
          Ver todas as notícias
        </Link>
      </div>
    );
  }

  // Sem número: o WhatsApp abre a lista de contatos para o visitante escolher.
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(`${post.title}\n${window.location.href}`)}`;

  return (
    <div className="flex-1">
      <article className="container-page pb-14 pt-6 sm:pb-20 sm:pt-12">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/noticias"
            className="inline-flex min-h-11 items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-soft hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Todas as notícias
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
            <Link to={`/noticias?categoria=${post.category}`} className="chip bg-secondary-soft tracking-[0.05em] text-secondary-dark">
              {categoryLabel(post.category)}
            </Link>
            <time dateTime={post.published_at ?? undefined} className="text-sm text-outline">
              {formatNewsDate(post.published_at)}
            </time>
          </div>

          <h1 className="heading-1 mt-4">{post.title}</h1>
          {post.excerpt && <p className="mt-5 text-lg leading-relaxed text-ink-soft sm:text-xl">{post.excerpt}</p>}
        </div>

        {post.cover_image_url && (
          <div className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-2xl bg-white shadow-soft sm:mt-12">
            <img src={`${API_URL}${post.cover_image_url}`} alt="" className="max-h-[32rem] w-full object-cover" />
          </div>
        )}

        <div className="mx-auto mt-8 max-w-3xl sm:mt-12">
          <Markdown text={post.content ?? ''} />

          {post.tags.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-2" aria-label="Tags">
              {post.tags.map((tag) => (
                <li key={tag} className="chip bg-secondary-soft px-3 py-1.5 text-[11px] tracking-[0.05em] text-secondary-dark">
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink-soft">
              {post.author_name ? `Publicado por ${post.author_name}` : 'Publicado pela Muni Moldes'}
            </p>
            <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              <WhatsAppIcon className="h-4 w-4" />
              Compartilhar
            </a>
          </div>
        </div>
      </article>

      <QuoteBand />
    </div>
  );
}
