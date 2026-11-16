import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2, X } from 'lucide-react';
import { api } from '../../services/api';
import { apiErrorMessage } from '../../utils/apiError';
import { isoToLocalInput, localInputToIso } from '../../utils/dates';
import { slugify } from '../../utils/slugify';
import { useToast } from '../../contexts/ToastContext';
import { VisibilityFields } from '../../components/admin/VisibilityFields';
import type { Collection } from '../../types';

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

  const update = (changes: Partial<typeof emptyForm>) => setForm((current) => ({ ...current, ...changes }));

  useEffect(() => {
    if (!id) return;
    api
      .get<Collection>(`/collections/${id}`)
      .then(({ data }) =>
        setForm({
          name: data.name,
          slug: data.slug,
          is_active: data.is_active !== false,
          active_from: isoToLocalInput(data.active_from),
          active_until: isoToLocalInput(data.active_until),
        }),
      )
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
    try {
      if (id) {
        await api.put(`/collections/${id}`, payload);
      } else {
        await api.post('/collections', payload);
      }
      showToast(id ? 'Categoria salva!' : 'Categoria criada!', 'success');
      navigate('/admin/colecoes');
    } catch (error) {
      showToast(
        apiErrorMessage(error, 'Erro ao salvar a categoria. Confira se o endereço (URL) já não é usado por outra.'),
        'error',
      );
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
