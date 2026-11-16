import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, CloudUpload, Eye, Info, Loader2, Plus, Ruler, Save, X } from 'lucide-react';
import { api, API_URL } from '../../services/api';
import { apiErrorMessage } from '../../utils/apiError';
import { isoToLocalInput, localInputToIso } from '../../utils/dates';
import { slugify } from '../../utils/slugify';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { VisibilityFields } from '../../components/admin/VisibilityFields';
import type { Collection, Product, ProductImage } from '../../types';

const ACCEPTED_IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  dimensions: '',
  final_weight: '',
  collection_id: '',
  is_active: true,
  active_from: '',
  active_until: '',
};

export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const fileRef = useRef<HTMLInputElement>(null);

  const [loadingProduct, setLoadingProduct] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [form, setForm] = useState(emptyForm);
  // Ao criar, o endereço acompanha o nome até ser editado à mão. Ao editar um produto
  // existente ele não muda sozinho, para não quebrar links já compartilhados.
  const [slugLocked, setSlugLocked] = useState(Boolean(id));
  const [images, setImages] = useState<ProductImage[]>([]);
  const [queue, setQueue] = useState<File[]>([]);

  const update = (changes: Partial<typeof emptyForm>) => setForm((current) => ({ ...current, ...changes }));

  useEffect(() => {
    api
      .get<Collection[]>('/collections')
      .then((res) => setCollections(res.data))
      .catch(() => showToast('Erro ao carregar as categorias.', 'error'));

    if (!id) return;
    // A API só busca produto pelo endereço; aqui temos o id, então procuramos na lista.
    api
      .get<Product[]>('/products')
      .then((res) => {
        const product = res.data.find((item) => item.id === id);
        if (!product) {
          showToast('Produto não encontrado.', 'error');
          navigate('/admin/produtos');
          return;
        }
        setForm({
          name: product.name,
          slug: product.slug,
          description: product.description ?? '',
          dimensions: product.dimensions ?? '',
          final_weight: product.final_weight ?? '',
          collection_id: product.collection_id ?? '',
          is_active: product.is_active !== false,
          active_from: isoToLocalInput(product.active_from),
          active_until: isoToLocalInput(product.active_until),
        });
        setImages(product.images ?? []);
      })
      .catch(() => showToast('Erro ao carregar o produto.', 'error'))
      .finally(() => setLoadingProduct(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Endereços temporários para mostrar as fotos escolhidas antes do envio.
  const previews = useMemo(() => queue.map((file) => URL.createObjectURL(file)), [queue]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const chosen = Array.from(e.target.files ?? []);
    e.target.value = '';
    const accepted: File[] = [];
    for (const file of chosen) {
      if (!ACCEPTED_IMAGES.includes(file.type)) {
        showToast(`"${file.name}" não é uma imagem JPG, PNG, WebP, GIF ou AVIF.`, 'error');
      } else if (file.size > MAX_IMAGE_BYTES) {
        showToast(`"${file.name}" passa de 10 MB.`, 'error');
      } else if ([...queue, ...accepted].some((item) => item.name === file.name && item.size === file.size)) {
        showToast(`"${file.name}" já está na fila.`, 'error');
      } else {
        accepted.push(file);
      }
    }
    if (accepted.length > 0) setQueue([...queue, ...accepted]);
  };

  const removeUploaded = (image: ProductImage) => {
    confirm({
      title: 'Excluir foto',
      message: 'Tem certeza que deseja excluir esta foto? Ela sai do site na hora.',
      confirmText: 'Excluir',
      onConfirm: async () => {
        try {
          await api.delete(`/products/${id}/images/${image.id}`);
          setImages((current) => current.filter((item) => item.id !== image.id));
          showToast('Foto excluída.', 'success');
        } catch (error) {
          showToast(apiErrorMessage(error, 'Erro ao excluir a foto.'), 'error');
        }
      },
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const slug = slugify(form.slug);
    if (!form.name.trim()) return showToast('Digite o nome do produto.', 'error');
    if (!slug) return showToast('Digite o endereço (URL) do produto.', 'error');

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug,
      description: form.description.trim() || null,
      dimensions: form.dimensions.trim() || null,
      final_weight: form.final_weight.trim() || null,
      collection_id: form.collection_id || null,
      is_active: form.is_active,
      active_from: localInputToIso(form.active_from),
      active_until: localInputToIso(form.active_until),
    };

    let productId = id;
    try {
      if (productId) {
        await api.put(`/products/${productId}`, payload);
      } else {
        const res = await api.post<Product>('/products', payload);
        productId = res.data.id;
      }
    } catch (error) {
      setSaving(false);
      return showToast(
        apiErrorMessage(error, 'Erro ao salvar o produto. Confira se o endereço (URL) já não é usado por outro.'),
        'error',
      );
    }

    // Os dados já foram salvos; as fotos vão uma a uma.
    let sent = 0;
    try {
      for (const file of queue) {
        const body = new FormData();
        body.append('file', file);
        if (images.length === 0 && sent === 0) body.append('isCover', 'true');
        await api.post(`/products/${productId}/images`, body);
        sent += 1;
      }
    } catch (error) {
      setSaving(false);
      showToast(
        `O produto foi salvo, mas ${queue.length - sent} foto(s) não: ${apiErrorMessage(error, 'erro no envio.')}`,
        'error',
      );
      return navigate(`/admin/produtos/${productId}`, { replace: true });
    }

    showToast('Produto salvo!', 'success');
    navigate('/admin/produtos');
  };

  if (loadingProduct) {
    return <p className="py-20 text-center text-ink-soft">Carregando produto...</p>;
  }

  const totalImages = images.length + queue.length;

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 flex flex-col items-start justify-between gap-5 md:mb-10 md:flex-row md:items-center">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft" aria-label="Você está em">
            <Link to="/admin/produtos" className="flex min-h-11 items-center hover:text-primary">Produtos</Link>
            <ChevronRight className="h-4 w-4" />
            <span>{id ? 'Editar' : 'Novo'}</span>
          </nav>
          <h1 className="heading-1">{id ? 'Editar produto' : 'Novo produto'}</h1>
          <p className="mt-2 max-w-2xl text-ink-soft sm:text-lg">
            Nome, medidas, fotos e categoria do molde, como aparecem no catálogo.
          </p>
        </div>
        <div className="flex w-full items-center gap-3 md:w-auto">
          <Link to="/admin/produtos" className="btn btn-outline btn-plain flex-1 md:flex-none">
            Cancelar
          </Link>
          <button type="submit" disabled={saving} className="btn btn-primary btn-plain flex-1 disabled:pointer-events-none disabled:opacity-60 md:flex-none">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar produto
          </button>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Coluna principal */}
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-8 lg:gap-8">
          <section className="panel">
            <h2 className="heading-3 mb-6 flex items-center gap-2">
              <Info className="h-6 w-6 text-outline" />
              Informações básicas
            </h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="product-name" className="label-caps">Nome do produto</label>
                <input
                  id="product-name"
                  type="text"
                  required
                  maxLength={200}
                  value={form.name}
                  onChange={(e) =>
                    update(slugLocked ? { name: e.target.value } : { name: e.target.value, slug: slugify(e.target.value) })
                  }
                  placeholder="Ex.: Ovo texturizado 350 g"
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="product-slug" className="label-caps">Endereço (URL)</label>
                <div className="flex items-center rounded-lg border border-line bg-surface-low transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary sm:max-w-lg">
                  <span className="pl-4 text-outline">/molde/</span>
                  <input
                    id="product-slug"
                    type="text"
                    required
                    maxLength={220}
                    value={form.slug}
                    onChange={(e) => {
                      setSlugLocked(true);
                      update({ slug: e.target.value });
                    }}
                    onBlur={() => update({ slug: slugify(form.slug) })}
                    className="min-w-0 flex-1 border-none bg-transparent py-3 pr-4 text-base text-ink focus:outline-none"
                  />
                </div>
                {id && (
                  <p className="mt-2 text-[13px] text-outline">
                    Mudar o endereço quebra links deste produto que já foram compartilhados.
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="product-description" className="label-caps">Descrição</label>
                <textarea
                  id="product-description"
                  rows={5}
                  value={form.description}
                  onChange={(e) => update({ description: e.target.value })}
                  placeholder="Para que serve o molde, acabamento, detalhes que ajudam o cliente a escolher..."
                  className="input resize-y"
                />
              </div>
            </div>
          </section>

          <section className="panel">
            <h2 className="heading-3 mb-6 flex items-center gap-2">
              <Ruler className="h-6 w-6 text-outline" />
              Especificações técnicas
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="product-dimensions" className="label-caps">Dimensões</label>
                <input
                  id="product-dimensions"
                  type="text"
                  maxLength={100}
                  value={form.dimensions}
                  onChange={(e) => update({ dimensions: e.target.value })}
                  placeholder="Ex.: 17 x 12 cm"
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="product-weight" className="label-caps">Peso da peça pronta</label>
                <input
                  id="product-weight"
                  type="text"
                  maxLength={50}
                  value={form.final_weight}
                  onChange={(e) => update({ final_weight: e.target.value })}
                  placeholder="Ex.: 350 g"
                  className="input"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Coluna lateral */}
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-4 lg:gap-8">
          <section className="panel sm:p-6">
            <h2 className="mb-4 font-serif text-xl font-semibold">Fotos do produto</h2>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept={ACCEPTED_IMAGES.join(',')}
              onChange={handleFiles}
              className="sr-only"
              tabIndex={-1}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-surface-low p-6 text-center transition-colors hover:border-primary hover:bg-surface-mid"
            >
              <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-line-soft text-ink-soft transition-colors group-hover:bg-primary-soft group-hover:text-primary-dark">
                <CloudUpload className="h-7 w-7" />
              </span>
              <span>
                <span className="font-bold text-primary">Clique para escolher</span> as fotos
              </span>
              <span className="mt-1 text-sm text-outline">JPG, PNG ou WebP, até 10 MB cada</span>
            </button>

            {totalImages > 0 && (
              <ul className="mt-4 grid grid-cols-3 gap-3">
                {images.map((image, index) => (
                  <li key={image.id} className="relative aspect-square overflow-hidden rounded-lg border border-line">
                    <img src={`${API_URL}${image.image_url}`} alt={`Foto ${index + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeUploaded(image)}
                      aria-label={`Excluir a foto ${index + 1}`}
                      className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#ba1a1a] shadow-sm"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
                {queue.map((file, index) => (
                  <li key={`${file.name}-${file.size}`} className="relative aspect-square overflow-hidden rounded-lg border-2 border-secondary">
                    <img src={previews[index]} alt={`Nova foto: ${file.name}`} className="h-full w-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-secondary px-1 py-0.5 text-center text-[10px] font-semibold uppercase tracking-wide text-white">
                      Nova
                    </span>
                    <button
                      type="button"
                      onClick={() => setQueue(queue.filter((_, i) => i !== index))}
                      aria-label={`Tirar ${file.name} da fila`}
                      className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#ba1a1a] shadow-sm"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    aria-label="Adicionar mais fotos"
                    className="flex aspect-square w-full items-center justify-center rounded-lg border border-dashed border-line bg-surface-low text-line transition-colors hover:border-primary hover:text-primary"
                  >
                    <Plus className="h-6 w-6" />
                  </button>
                </li>
              </ul>
            )}
            {queue.length > 0 && (
              <p className="mt-3 text-[13px] font-medium text-secondary">
                {queue.length === 1 ? '1 foto nova será enviada' : `${queue.length} fotos novas serão enviadas`} ao salvar.
              </p>
            )}
          </section>

          <section className="panel sm:p-6">
            <h2 className="mb-4 font-serif text-xl font-semibold">Classificação</h2>
            <label htmlFor="product-collection" className="label-caps">Categoria</label>
            <div className="relative">
              <select
                id="product-collection"
                value={form.collection_id}
                onChange={(e) => update({ collection_id: e.target.value })}
                className="input cursor-pointer appearance-none pr-10"
              >
                <option value="">Sem categoria</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>{collection.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" />
            </div>
          </section>

          <section className="panel sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-semibold">
              <Eye className="h-5 w-5 text-outline" />
              Visibilidade
            </h2>
            <VisibilityFields
              idPrefix="product"
              activeLabel="Ativo no catálogo"
              value={form}
              onChange={update}
            />
          </section>
        </div>
      </div>
    </form>
  );
}
