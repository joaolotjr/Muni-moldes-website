import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ImageOff } from 'lucide-react';
import { api, API_URL } from '../../services/api';
import { whatsappLink } from '../../config/site';
import { WhatsAppIcon } from '../../components/icons/WhatsAppIcon';
import type { Product } from '../../types';

export function ProductDetails() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get<Product>(`/products/${slug}`);
        setProduct(res.data);
        setActiveImage(res.data.images?.[0]?.image_url ?? null);
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
      <div className="container-page grid flex-1 gap-10 py-12 md:grid-cols-2">
        <div className="aspect-square animate-pulse border border-line bg-white" />
        <div className="space-y-4">
          <div className="h-4 w-32 animate-pulse bg-line" />
          <div className="h-10 w-3/4 animate-pulse bg-line" />
          <div className="h-32 animate-pulse bg-line/60" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-page flex flex-1 flex-col items-start justify-center py-24">
        <p className="eyebrow">Catálogo</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Molde não encontrado</h1>
        <p className="mt-3 max-w-md text-ink-soft">
          Este molde não existe ou saiu do catálogo. Veja os modelos disponíveis.
        </p>
        <Link to="/catalogo" className="btn btn-primary mt-8">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao catálogo
        </Link>
      </div>
    );
  }

  const whatsappUrl = whatsappLink(
    `Olá! Gostaria de um orçamento para o molde: *${product.name}*.\n\nQuantidade: \n\nLink: ${window.location.href}`,
  );

  const specs = [
    { label: 'Linha', value: product.collection?.name },
    { label: 'Dimensões', value: product.dimensions },
    { label: 'Peso', value: product.final_weight },
  ].filter((spec) => spec.value);

  return (
    <div className="flex-1 bg-white">
      <div className="border-b border-line">
        <nav className="container-page eyebrow flex flex-wrap items-center gap-2 py-4" aria-label="Você está em">
          <Link to="/" className="hover:text-ink">Início</Link>
          <span>/</span>
          <Link to="/catalogo" className="hover:text-ink">Catálogo</Link>
          {product.collection && (
            <>
              <span>/</span>
              <Link to={`/catalogo?colecao=${product.collection.slug}`} className="hover:text-ink">
                {product.collection.name}
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="container-page grid gap-10 py-10 md:grid-cols-2 lg:gap-16 lg:py-14">
        {/* Fotos */}
        <div>
          <div className="flex aspect-square items-center justify-center border border-line bg-paper">
            {activeImage ? (
              <img src={`${API_URL}${activeImage}`} alt={product.name} className="h-full w-full object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-ink-soft/50">
                <ImageOff className="h-8 w-8" strokeWidth={1.5} />
                <span className="eyebrow text-ink-soft/60">Foto em breve</span>
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-3">
              {product.images.map((img, index) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImage(img.image_url)}
                  aria-label={`Ver foto ${index + 1}`}
                  className={`aspect-square overflow-hidden border bg-paper ${
                    activeImage === img.image_url ? 'border-ink' : 'border-line hover:border-ink/50'
                  }`}
                >
                  <img src={`${API_URL}${img.image_url}`} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ficha */}
        <div>
          {product.collection && <p className="eyebrow text-rose">{product.collection.name}</p>}
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{product.name}</h1>

          {product.description && (
            <p className="mt-5 whitespace-pre-wrap leading-relaxed text-ink-soft">{product.description}</p>
          )}

          {specs.length > 0 && (
            <dl className="mt-8 border-t border-line">
              {specs.map((spec) => (
                <div key={spec.label} className="flex items-baseline justify-between gap-6 border-b border-line py-3">
                  <dt className="eyebrow">{spec.label}</dt>
                  <dd className="text-right font-mono text-sm">{spec.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-8 border border-line bg-paper p-5">
            <p className="font-semibold">Orçamento para este molde</p>
            <p className="mt-1 text-sm text-ink-soft">
              Informe a quantidade desejada. Para vários modelos, envie a lista completa na mesma conversa.
            </p>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-quote mt-4 w-full">
              <WhatsAppIcon className="h-4 w-4" />
              Solicitar orçamento pelo WhatsApp
            </a>
          </div>

          <Link to="/catalogo" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-ink">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
