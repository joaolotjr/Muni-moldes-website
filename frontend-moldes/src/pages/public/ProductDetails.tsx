import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ClipboardList, ImageOff } from 'lucide-react';
import { api, API_URL } from '../../services/api';
import { useSite } from '../../contexts/SiteContext';
import { WhatsAppIcon } from '../../components/icons/WhatsAppIcon';
import { ProductCard } from '../../components/public/ProductCard';
import type { Product } from '../../types';
import { collectionsOf, secondaryCollectionsOf } from '../../utils/products';
import { useQuote } from '../../contexts/QuoteContext';
import { useToast } from '../../contexts/ToastContext';
import { clampQuantity, MAX_QUANTITY } from '../../utils/quote';

export function ProductDetails() {
  const { slug } = useParams();
  const site = useSite();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const { add, has, items, count } = useQuote();
  const { showToast } = useToast();
  const [quantityInput, setQuantityInput] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setQuantityInput(null);
      try {
        const res = await api.get<Product>(`/products/${slug}`);
        setProduct(res.data);
        setActiveImage(res.data.images?.[0]?.image_url ?? null);

        // Outros moldes que dividem alguma categoria com este, primeiro os da mesma
        // categoria principal. Se falhar, a página segue sem a seção.
        const ids = new Set(collectionsOf(res.data).map((c) => c.id));
        if (ids.size > 0) {
          try {
            const all = await api.get<Product[]>('/products?public=true');
            const principalId = res.data.collection?.id;
            setRelated(
              all.data
                .filter((p) => p.id !== res.data.id && collectionsOf(p).some((c) => ids.has(c.id)))
                .sort((a, b) => Number(b.collection?.id === principalId) - Number(a.collection?.id === principalId))
                .slice(0, 4),
            );
          } catch {
            setRelated([]);
          }
        } else {
          setRelated([]);
        }
      } catch (error) {
        console.error('Error fetching product details', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="container-page grid flex-1 gap-8 py-8 lg:grid-cols-12 lg:gap-16 lg:py-16">
        <div className="aspect-square animate-pulse rounded-2xl bg-white shadow-soft lg:col-span-7" />
        <div className="space-y-4 lg:col-span-5">
          <div className="h-4 w-32 animate-pulse rounded bg-surface-high" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-surface-high" />
          <div className="h-32 animate-pulse rounded bg-surface-mid" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-page flex flex-1 flex-col items-start justify-center py-20">
        <p className="eyebrow">Catálogo</p>
        <h1 className="heading-1 mt-3">Molde não encontrado</h1>
        <p className="mt-4 max-w-md text-ink-soft">
          Este molde não existe ou saiu do catálogo. Veja os modelos disponíveis.
        </p>
        <Link to="/catalogo" className="btn btn-primary mt-8">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao catálogo
        </Link>
      </div>
    );
  }

  const specs = [
    { label: 'Código', value: product.code },
    { label: 'Linha', value: product.collection?.name },
    { label: 'Dimensões', value: product.dimensions },
    { label: 'Cavidades', value: product.cavities ? String(product.cavities) : null },
    { label: 'Peso da peça pronta', value: product.piece_weight },
    { label: 'Material', value: product.material },
    { label: 'Peso do molde', value: product.final_weight ? `${product.final_weight} (aprox.)` : null },
    { label: 'Pedido mínimo', value: product.min_order ? `${product.min_order} unidades` : null },
  ].filter((spec) => spec.value);
  const alsoIn = secondaryCollectionsOf(product);
  const inList = has(product.id);
  // Quantidade sugerida: a que já está na lista ou o pedido mínimo do molde.
  const quantity =
    quantityInput ??
    String(items.find((item) => item.productId === product.id)?.quantity ?? product.min_order ?? 1);

  return (
    <div className="container-page flex-1 pb-14 pt-6 sm:pb-24 sm:pt-10 lg:pt-16">
      <nav
        className="mb-6 flex flex-wrap gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-[0.12em] text-outline lg:mb-12"
        aria-label="Você está em"
      >
        <Link to="/catalogo" className="hover:text-primary">Catálogo</Link>
        {product.collection && (
          <>
            <span>/</span>
            <Link to={`/catalogo?colecao=${product.collection.slug}`} className="hover:text-primary">
              {product.collection.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
        {/* Fotos */}
        <div className="lg:col-span-7">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-white shadow-soft lg:aspect-[4/3]">
            {activeImage ? (
              <img src={`${API_URL}${activeImage}`} alt={product.name} className="h-full w-full object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-outline/60">
                <ImageOff className="h-8 w-8" strokeWidth={1.5} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em]">Foto em breve</span>
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3 sm:mt-6 sm:gap-6">
              {product.images.map((img, index) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImage(img.image_url)}
                  aria-label={`Ver foto ${index + 1}`}
                  aria-pressed={activeImage === img.image_url}
                  className={`aspect-square overflow-hidden rounded-xl bg-white shadow-soft ring-2 ring-offset-2 ring-offset-surface transition ${
                    activeImage === img.image_url ? 'ring-primary' : 'ring-transparent hover:opacity-90'
                  }`}
                >
                  <img src={`${API_URL}${img.image_url}`} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ficha */}
        <div className="lg:col-span-5">
          {product.collection && <p className="eyebrow tracking-[0.2em]">{product.collection.name}</p>}
          <h1 className="heading-1 mt-3">{product.name}</h1>

          {product.description && (
            <p className="mt-5 whitespace-pre-wrap text-base leading-relaxed text-ink-soft sm:text-lg">
              {product.description}
            </p>
          )}

          {specs.length > 0 && (
            <div className="mt-8">
              <h2 className="heading-3 border-b border-line pb-2">Especificações técnicas</h2>
              <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-5">
                {specs.map((spec) => (
                  <div key={spec.label}>
                    <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-outline">{spec.label}</dt>
                    <dd className="mt-1">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {alsoIn.length > 0 && (
            <p className="mt-6 text-sm text-ink-soft">
              Também em:{' '}
              {alsoIn.map((collection, index) => (
                <span key={collection.id}>
                  {index > 0 && ', '}
                  <Link to={`/catalogo?colecao=${collection.slug}`} className="font-semibold text-primary hover:underline">
                    {collection.name}
                  </Link>
                </span>
              ))}
            </p>
          )}

          <div className="mt-8 border-t border-line pt-8">
            <label htmlFor="quote-quantity" className="field-label">Quantidade</label>
            <div className="flex gap-3">
              <input
                id="quote-quantity"
                type="number"
                inputMode="numeric"
                min={1}
                max={MAX_QUANTITY}
                value={quantity}
                onChange={(e) => setQuantityInput(e.target.value)}
                onBlur={() => setQuantityInput(String(clampQuantity(Number(quantity))))}
                className="field w-28 text-center"
              />
              <button
                type="button"
                onClick={() => {
                  add(product, clampQuantity(Number(quantity)));
                  showToast(inList ? 'Quantidade atualizada na lista.' : 'Molde adicionado à lista de orçamento.', 'success');
                }}
                className="btn btn-primary flex-1"
              >
                <ClipboardList className="h-5 w-5" />
                {inList ? 'Atualizar na lista' : 'Adicionar à lista'}
              </button>
            </div>
            {product.min_order && Number(quantity) < product.min_order && (
              <p className="mt-2 text-sm text-[#8a5300]">Pedido mínimo deste molde: {product.min_order} unidades.</p>
            )}
            {inList && (
              <Link to="/orcamento" className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary hover:underline">
                Ver lista de orçamento ({count} {count === 1 ? 'modelo' : 'modelos'})
              </Link>
            )}
            <a
              href={site.productQuoteLink(product)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline mt-4 w-full"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Orçamento só deste molde
            </a>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Vai pedir vários modelos? Adicione cada um à lista e envie tudo de uma vez pelo WhatsApp.
            </p>
            <Link to="/catalogo" className="btn btn-secondary mt-4 w-full">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao catálogo
            </Link>
          </div>
        </div>
      </div>

      {related.length > 0 && product.collection && (
        <section className="mt-16 lg:mt-32">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="heading-2">Moldes relacionados</h2>
              <p className="mt-2 text-ink-soft">Da mesma linha e linhas relacionadas</p>
            </div>
            <Link
              to={`/catalogo?colecao=${product.collection.slug}`}
              className="hidden shrink-0 border-b border-primary pb-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-primary sm:block"
            >
              Ver toda a linha
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-6 lg:grid-cols-4 lg:gap-8">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
