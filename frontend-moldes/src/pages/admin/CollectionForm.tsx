import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ImagePlus, Loader2, Trash2, X } from 'lucide-react';
import { api, API_URL } from '../../services/api';
import { ACCEPTED_IMAGES, imageFormData, imageRejection } from '../../utils/images';
import { collectionCover } from '../../utils/products';
import { apiErrorMessage } from '../../utils/apiError';
import { isoToLocalInput, localInputToIso } from '../../utils/dates';
import { slugify } from '../../utils/slugify';
import { useToast } from '../../contexts/ToastContext';
import { VisibilityFields } from '../../components/admin/VisibilityFields';
import type { Collection, Product } from '../../types';

const emptyForm = { name: '', slug: '', is_active: true, active_from: '', active_until: '' };

export function CollectionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loadingCollection, setLoadingCollection] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  // Ao criar, o endereço acompanha o nome até ser editado à mão; ao editar, não muda sozinho.
  const [slugLocked, setSlugLocked] = useState(Boolean(id));
  // Capa: a gravada, a escolhida agora (ainda não enviada) e o pedido de remoção.
  const [savedCover, setSavedCover] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const coverInput = useRef<HTMLInputElement>(null);

  const coverPreview = useMemo(() => (coverFile ? URL.createObjectURL(coverFile) : null), [coverFile]);
  useEffect(() => () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
  }, [coverPreview]);
  // O que o site mostraria sem capa própria.
  const autoCover = useMemo(
    () => (id ? collectionCover({ id, name: '', slug: '', cover_url: null }, products) : null),
    [id, products],
  );
  const ownCover = coverPreview ?? (removeCover ? null : savedCover ? `${API_URL}${savedCover}` : null);
  const shownCover = ownCover ?? (autoCover ? `${API_URL}${autoCover}` : null);

  const handleCover = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const rejection = imageRejection(file);
    if (rejection) return showToast(rejection, 'error');
    setCoverFile(file);
    setRemoveCover(false);
  };

  const discardCover = () => {
    if (coverFile) {
      setCoverFile(null);
    } else {
      setRemoveCover(true);
    }
  };

  const update = (changes: Partial<typeof emptyForm>) => setForm((current) => ({ ...current, ...changes }));

  useEffect(() => {
    if (!id) return;
    api
      .get<Product[]>('/products')
      .then(({ data }) => setProducts(data))
      .catch(() => setProducts([]));
    api
      .get<Collection>(`/collections/${id}`)
      .then(({ data }) => {
        setSavedCover(data.cover_url ?? null);
        setForm({
          name: data.name,
          slug: data.slug,
          is_active: data.is_active !== false,
          active_from: isoToLocalInput(data.active_from),
          active_until: isoToLocalInput(data.active_until),
        });
      })
      .catch(() => {
        showToast('Erro ao carregar a categoria.', 'error');
        navigate('/admin/colecoes');
      })
      .finally(() => setLoadingCollection(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const slug = slugify(form.slug);
    if (!form.name.trim()) return showToast('Digite o nome da categoria.', 'error');
    if (!slug) return showToast('Digite o endereço (URL) da categoria.', 'error');

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug,
      is_active: form.is_active,
      active_from: localInputToIso(form.active_from),
      active_until: localInputToIso(form.active_until),
    };
    let collectionId = id;
    try {
      if (collectionId) {
        await api.put(`/collections/${collectionId}`, payload);
      } else {
        const { data } = await api.post<Collection>('/collections', payload);
        collectionId = data.id;
      }
    } catch (error) {
      setSaving(false);
      return showToast(
        apiErrorMessage(error, 'Erro ao salvar a categoria. Confira se o endereço (URL) já não é usado por outra.'),
        'error',
      );
    }

    // Os dados já foram salvos; a capa vai em uma segunda chamada.
    try {
      if (coverFile) {
        await api.post(`/collections/${collectionId}/cover`, await imageFormData(coverFile));
      } else if (removeCover && savedCover) {
        await api.delete(`/collections/${collectionId}/cover`);
      }
      showToast(id ? 'Categoria salva!' : 'Categoria criada!', 'success');
      navigate('/admin/colecoes');
    } catch (error) {
      showToast(`A categoria foi salva, mas a foto de capa não: ${apiErrorMessage(error, 'erro no envio.')}`, 'error');
      navigate(`/admin/colecoes/${collectionId}`, { replace: true });
    } finally {
      setSaving(false);
    }
  };

  if (loadingCollection) {
    return <p className="py-20 text-center text-ink-soft">Carregando categoria...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-line/30 bg-white shadow-soft">
      <header className="flex items-start justify-between gap-4 border-b border-line-soft/50 px-5 pb-4 pt-6 sm:px-10 sm:pt-10">
        <div>
          <h1 className="heading-2">{id ? 'Editar categoria' : 'Nova categoria'}</h1>
          <p className="mt-2 text-ink-soft">
            {id ? 'Altere o nome ou a visibilidade desta categoria.' : 'Adicione uma nova classificação ao catálogo de moldes.'}
          </p>
        </div>
        <Link to="/admin/colecoes" aria-label="Fechar" className="icon-btn text-ink-soft">
          <X className="h-6 w-6" />
        </Link>
      </header>

      <div className="flex flex-col gap-6 p-5 sm:p-10">
        <div>
          <label htmlFor="category-name" className="mb-2 ml-1 block text-[13px] font-semibold tracking-[0.05em] text-ink-soft">
            Nome da categoria
          </label>
          <input
            id="category-name"
            type="text"
            required
            maxLength={100}
            value={form.name}
            onChange={(e) =>
              update(slugLocked ? { name: e.target.value } : { name: e.target.value, slug: slugify(e.target.value) })
            }
            placeholder="Ex.: Moldes de Páscoa"
            className="input bg-surface"
          />
        </div>
        <div>
          <label htmlFor="category-slug" className="mb-2 ml-1 block text-[13px] font-semibold tracking-[0.05em] text-ink-soft">
            Endereço (URL)
          </label>
          <input
            id="category-slug"
            type="text"
            required
            maxLength={120}
            value={form.slug}
            onChange={(e) => {
              setSlugLocked(true);
              update({ slug: e.target.value });
            }}
            onBlur={() => update({ slug: slugify(form.slug) })}
            className="input bg-surface"
          />
          <p className="ml-1 mt-2 text-[13px] text-outline">
            Usado no filtro do catálogo: /catalogo?colecao={form.slug || 'endereco'}
          </p>
        </div>
        <div className="border-t border-line-soft pt-6">
          <p className="mb-2 ml-1 text-[13px] font-semibold tracking-[0.05em] text-ink-soft">Foto de capa</p>
          <p className="mb-4 ml-1 text-[13px] text-outline">
            Aparece no cartão da categoria na página inicial e no topo do catálogo. Prefira uma foto horizontal
            (formato 2:1) com os chocolates prontos dessa linha. Sem foto, o site usa a de um produto da categoria.
          </p>
          <input
            ref={coverInput}
            type="file"
            accept={ACCEPTED_IMAGES.join(',')}
            onChange={handleCover}
            className="sr-only"
            tabIndex={-1}
          />
          <div className="relative aspect-[2/1] overflow-hidden rounded-xl border border-line bg-surface-mid">
            {shownCover ? (
              <img src={shownCover} alt="Pré-visualização da capa" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-sm text-outline">
                <ImagePlus className="h-8 w-8" strokeWidth={1.5} />
                Sem capa: o cartão aparece na cor da categoria.
              </div>
            )}
            {shownCover && (
              <span className="status-chip absolute left-3 top-3 bg-white/90 text-ink-soft">
                {coverFile ? 'Nova capa (salve para enviar)' : ownCover ? 'Capa própria' : 'Capa automática'}
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => coverInput.current?.click()}
              className="btn btn-outline btn-plain min-h-11 px-4 py-2"
            >
              <ImagePlus className="h-4 w-4" />
              {ownCover ? 'Trocar foto' : 'Escolher foto'}
            </button>
            {ownCover && (
              <button
                type="button"
                onClick={discardCover}
                className="btn btn-plain min-h-11 px-4 py-2 text-[#ba1a1a] hover:bg-[#ffdad6]"
              >
                <Trash2 className="h-4 w-4" />
                {coverFile ? 'Desfazer' : 'Remover foto'}
              </button>
            )}
          </div>
        </div>
        <div className="border-t border-line-soft pt-6">
          <VisibilityFields idPrefix="category" activeLabel="Categoria ativa no site" value={form} onChange={update} />
        </div>
      </div>

      <footer className="flex flex-col-reverse gap-3 px-5 pb-6 sm:flex-row sm:items-center sm:justify-end sm:px-10 sm:pb-10">
        <Link to="/admin/colecoes" className="btn btn-plain text-ink-soft hover:bg-surface-low hover:text-ink">
          Cancelar
        </Link>
        <button type="submit" disabled={saving} className="btn btn-primary btn-plain disabled:pointer-events-none disabled:opacity-60">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {id ? 'Salvar categoria' : 'Criar categoria'}
        </button>
      </footer>
    </form>
  );
}
