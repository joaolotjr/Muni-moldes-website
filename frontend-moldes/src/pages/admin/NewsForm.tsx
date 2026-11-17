import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Bold, ChevronDown, CloudUpload, Eye, Heading2, Italic, Link as LinkIcon,
  List, ListOrdered, Loader2, Pencil, Tag, Trash2, Upload, X,
} from 'lucide-react';
import { api, API_URL } from '../../services/api';
import { EXCERPT_MAX_LENGTH, newsCategories } from '../../config/news';
import { useToast } from '../../contexts/ToastContext';
import { apiErrorMessage } from '../../utils/apiError';
import { ACCEPTED_IMAGES, imageFormData, imageRejection } from '../../utils/images';
import { Markdown } from '../../components/public/Markdown';
import type { NewsCategory, NewsPost, NewsStatus } from '../../types';

const MAX_TAGS = 10;

const panelClass = 'rounded-xl border border-line-soft bg-white p-5 shadow-soft sm:p-6';
const labelClass = 'mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft';
const inputClass =
  'w-full rounded border border-line bg-surface-low px-3 py-2.5 text-base text-ink transition-colors placeholder:text-line focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

function ToolbarButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded text-ink-soft transition-colors hover:bg-line-soft hover:text-ink"
    >
      {children}
    </button>
  );
}

export function NewsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [loadingPost, setLoadingPost] = useState(Boolean(id));
  const [saving, setSaving] = useState<NewsStatus | null>(null);
  const [preview, setPreview] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState<NewsCategory | ''>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState<NewsStatus>('draft');

  // Imagem de destaque: a já salva, uma nova escolhida (enviada ao salvar) ou a remoção da atual.
  const [savedCover, setSavedCover] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [removeCover, setRemoveCover] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get<NewsPost>(`/news/admin/${id}`)
      .then(({ data }) => {
        setTitle(data.title);
        setContent(data.content ?? '');
        setExcerpt(data.excerpt);
        setCategory(data.category);
        setTags(data.tags);
        setStatus(data.status ?? 'draft');
        setSavedCover(data.cover_image_url);
      })
      .catch(() => {
        showToast('Erro ao carregar a notícia.', 'error');
        navigate('/admin/noticias');
      })
      .finally(() => setLoadingPost(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Endereço temporário para mostrar a imagem escolhida antes do envio.
  const coverPreview = useMemo(() => (coverFile ? URL.createObjectURL(coverFile) : null), [coverFile]);
  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  // Envolve o texto selecionado (ou insere um exemplo) com a marcação escolhida.
  const wrapSelection = (before: string, after: string, placeholder: string) => {
    const field = contentRef.current;
    if (!field) return;
    const { selectionStart: start, selectionEnd: end } = field;
    const selected = content.slice(start, end) || placeholder;
    setContent(content.slice(0, start) + before + selected + after + content.slice(end));
    requestAnimationFrame(() => {
      field.focus();
      field.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  // Coloca um prefixo ("## ", "- ", "1. ") no começo de cada linha selecionada.
  const prefixLines = (prefix: (index: number) => string) => {
    const field = contentRef.current;
    if (!field) return;
    const { selectionStart, selectionEnd } = field;
    const start = content.lastIndexOf('\n', selectionStart - 1) + 1;
    const endBreak = content.indexOf('\n', selectionEnd);
    const end = endBreak === -1 ? content.length : endBreak;
    const block = content.slice(start, end).split('\n').map((line, index) => prefix(index) + line).join('\n');
    setContent(content.slice(0, start) + block + content.slice(end));
    requestAnimationFrame(() => {
      field.focus();
      field.setSelectionRange(start, start + block.length);
    });
  };

  const addTag = () => {
    const tag = tagInput.trim().replace(/,+$/, '').slice(0, 30);
    setTagInput('');
    if (!tag || tags.some((item) => item.toLowerCase() === tag.toLowerCase())) return;
    if (tags.length >= MAX_TAGS) {
      showToast(`Use até ${MAX_TAGS} tags.`, 'error');
      return;
    }
    setTags([...tags, tag]);
  };

  const handleTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const rejection = imageRejection(file);
    if (rejection) {
      showToast(rejection, 'error');
      return;
    }
    setCoverFile(file);
    setRemoveCover(false);
  };

  const clearCover = () => {
    setCoverFile(null);
    if (savedCover) setRemoveCover(true);
  };

  const save = async (nextStatus: NewsStatus) => {
    if (!title.trim()) return showToast('Digite o título da notícia.', 'error');
    if (!category) return showToast('Escolha a categoria.', 'error');
    if (nextStatus === 'published' && !content.trim()) {
      return showToast('Escreva o texto da notícia antes de publicar.', 'error');
    }

    setSaving(nextStatus);
    const payload = { title, content, excerpt, category, tags, status: nextStatus };
    let postId = id;
    try {
      const { data } = postId
        ? await api.put<NewsPost>(`/news/${postId}`, payload)
        : await api.post<NewsPost>('/news', payload);
      postId = data.id;
    } catch (error) {
      setSaving(null);
      return showToast(apiErrorMessage(error, 'Erro ao salvar a notícia.'), 'error');
    }

    // O texto já foi salvo; a imagem vai em uma segunda chamada.
    try {
      if (coverFile) {
        // A imagem é reduzida no navegador antes de subir; o servidor gera a versão final.
        await api.post(`/news/${postId}/cover`, await imageFormData(coverFile));
      } else if (removeCover) {
        await api.delete(`/news/${postId}/cover`);
      }
    } catch (error) {
      setSaving(null);
      showToast(`A notícia foi salva, mas a imagem não: ${apiErrorMessage(error, 'erro no envio.')}`, 'error');
      return navigate(`/admin/noticias/${postId}`, { replace: true });
    }

    showToast(nextStatus === 'published' ? 'Notícia publicada!' : 'Rascunho salvo.', 'success');
    navigate('/admin/noticias');
  };

  if (loadingPost) {
    return <p className="py-20 text-center text-ink-soft">Carregando notícia...</p>;
  }

  const coverSrc = coverPreview ?? (savedCover && !removeCover ? `${API_URL}${savedCover}` : null);
  const published = status === 'published';

  return (
    <div className="text-ink">
      <div className="mb-6 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <Link to="/admin/noticias" className="mb-2 inline-flex min-h-11 items-center gap-2 text-[13px] font-semibold text-ink-soft transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Voltar para notícias
          </Link>
          <h1 className="heading-2">{id ? 'Editar notícia' : 'Nova notícia'}</h1>
          {id && (
            <p className="mt-1 text-sm text-ink-soft">
              {published ? 'Esta notícia está publicada no site.' : 'Esta notícia é um rascunho e não aparece no site.'}
            </p>
          )}
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <button
            type="button"
            onClick={() => save('draft')}
            disabled={saving !== null}
            className="btn btn-secondary flex-1 normal-case tracking-[0.03em] disabled:pointer-events-none disabled:opacity-60 sm:flex-none"
          >
            {saving === 'draft' && <Loader2 className="h-4 w-4 animate-spin" />}
            {published ? 'Voltar para rascunho' : 'Salvar rascunho'}
          </button>
          <button
            type="button"
            onClick={() => save('published')}
            disabled={saving !== null}
            className="btn btn-primary flex-1 normal-case tracking-[0.03em] disabled:pointer-events-none disabled:opacity-60 sm:flex-none"
          >
            {saving === 'published' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {published ? 'Salvar alterações' : 'Publicar'}
          </button>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* Coluna de escrita */}
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-8">
          <div className={panelClass}>
            <label htmlFor="post-title" className="sr-only">Título da notícia</label>
            {/* Área de texto para o título quebrar em várias linhas no celular; Enter não cria linha. */}
            <textarea
              id="post-title"
              rows={1}
              value={title}
              maxLength={200}
              onChange={(e) => setTitle(e.target.value.replace(/\n/g, ' '))}
              placeholder="Digite o título da notícia..."
              className="field-sizing-content block w-full resize-none border-none bg-transparent p-0 font-serif text-2xl font-semibold leading-tight text-ink placeholder:text-line focus:outline-none sm:text-4xl"
            />
          </div>

          <div className="flex min-h-[480px] flex-col overflow-hidden rounded-xl border border-line-soft bg-white shadow-soft lg:min-h-[600px]">
            <div className="flex flex-wrap items-center gap-1 border-b border-line-soft bg-surface-mid px-3 py-2 sm:px-5">
              <ToolbarButton label="Negrito" onClick={() => wrapSelection('**', '**', 'texto em negrito')}>
                <Bold className="h-5 w-5" />
              </ToolbarButton>
              <ToolbarButton label="Itálico" onClick={() => wrapSelection('*', '*', 'texto em itálico')}>
                <Italic className="h-5 w-5" />
              </ToolbarButton>
              <ToolbarButton label="Título de seção" onClick={() => prefixLines(() => '## ')}>
                <Heading2 className="h-5 w-5" />
              </ToolbarButton>
              <span className="mx-1 h-6 w-px bg-line" />
              <ToolbarButton label="Lista com marcadores" onClick={() => prefixLines(() => '- ')}>
                <List className="h-5 w-5" />
              </ToolbarButton>
              <ToolbarButton label="Lista numerada" onClick={() => prefixLines((index) => `${index + 1}. `)}>
                <ListOrdered className="h-5 w-5" />
              </ToolbarButton>
              <span className="mx-1 h-6 w-px bg-line" />
              <ToolbarButton label="Inserir link" onClick={() => wrapSelection('[', '](https://)', 'texto do link')}>
                <LinkIcon className="h-5 w-5" />
              </ToolbarButton>
              <button
                type="button"
                onClick={() => setPreview((value) => !value)}
                aria-pressed={preview}
                className="ml-auto flex h-10 items-center gap-2 rounded px-3 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-line-soft hover:text-ink"
              >
                {preview ? <Pencil className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {preview ? 'Editar' : 'Pré-visualizar'}
              </button>
            </div>
            {preview ? (
              <div className="flex-1 p-5 sm:p-6">
                {content.trim() ? <Markdown text={content} /> : <p className="text-line">Nada para mostrar ainda.</p>}
              </div>
            ) : (
              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                aria-label="Texto da notícia"
                placeholder="Comece a escrever o conteúdo da sua notícia aqui..."
                className="w-full flex-1 resize-none border-none bg-transparent p-5 text-base leading-relaxed text-ink placeholder:text-line focus:outline-none sm:p-6"
              />
            )}
          </div>
          <p className="-mt-3 text-xs text-outline">
            Deixe uma linha em branco entre parágrafos. Os botões acima inserem a marcação no texto.
          </p>
        </div>

        {/* Coluna de configurações */}
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-4">
          <div className={panelClass}>
            <h2 className="heading-3 mb-4">Imagem de destaque</h2>
            <input ref={fileRef} type="file" accept={ACCEPTED_IMAGES.join(',')} onChange={handleFile} className="sr-only" tabIndex={-1} />
            {coverSrc ? (
              <div>
                <img src={coverSrc} alt="Imagem de destaque escolhida" className="aspect-[4/3] w-full rounded-lg object-cover" />
                <div className="mt-3 flex gap-3">
                  <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-outline min-h-11 flex-1 px-3 normal-case tracking-normal">
                    Trocar
                  </button>
                  <button type="button" onClick={clearCover} className="btn btn-outline min-h-11 flex-1 px-3 normal-case tracking-normal hover:border-[#ba1a1a] hover:text-[#ba1a1a]">
                    <Trash2 className="h-4 w-4" />
                    Remover
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="group flex aspect-[4/3] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-line bg-surface-low p-4 text-center transition-colors hover:border-primary"
              >
                <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-line-soft text-ink-soft transition-colors group-hover:bg-primary-pale group-hover:text-primary">
                  <CloudUpload className="h-6 w-6" />
                </span>
                <span className="text-ink-soft">
                  <span className="font-bold text-primary">Clique para procurar</span> uma imagem
                </span>
                <span className="mt-1 text-[13px] text-outline">PNG, JPG, WebP (recomendado: 1200×800px)</span>
              </button>
            )}
          </div>

          <div className={`${panelClass} flex flex-col gap-5`}>
            <h2 className="heading-3">Classificação</h2>
            <div>
              <label htmlFor="category" className={labelClass}>Categoria principal</label>
              <div className="relative">
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NewsCategory)}
                  className={`${inputClass} appearance-none pr-10`}
                >
                  <option value="" disabled>Selecione uma categoria...</option>
                  {newsCategories.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" />
              </div>
            </div>
            <div>
              <label htmlFor="tags" className={labelClass}>Tags</label>
              <div className="flex items-center rounded border border-line bg-surface-low px-3 py-2.5 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                <Tag className="mr-2 h-5 w-5 shrink-0 text-line" />
                <input
                  id="tags"
                  type="text"
                  value={tagInput}
                  maxLength={30}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKey}
                  onBlur={addTag}
                  placeholder="Adicionar tag e pressionar Enter"
                  className="w-full border-none bg-transparent p-0 text-base text-ink placeholder:text-line focus:outline-none"
                />
              </div>
              {tags.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <li key={tag} className="inline-flex items-center gap-1 rounded-full bg-secondary-soft py-1 pl-3 pr-1 text-[13px] font-semibold text-secondary-dark">
                      {tag}
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter((item) => item !== tag))}
                        aria-label={`Remover a tag ${tag}`}
                        className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-white/60 hover:text-primary"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className={panelClass}>
            <h2 className="heading-3 mb-4">Resumo</h2>
            <label htmlFor="excerpt" className="sr-only">Resumo da notícia</label>
            <textarea
              id="excerpt"
              rows={3}
              value={excerpt}
              maxLength={EXCERPT_MAX_LENGTH}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Um breve resumo que aparecerá na listagem de notícias..."
              className={`${inputClass} resize-none p-3`}
            />
            <p className="mt-1 text-right text-[13px] text-outline">
              {excerpt.length}/{EXCERPT_MAX_LENGTH} caracteres
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
