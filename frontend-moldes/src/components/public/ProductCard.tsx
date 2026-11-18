import { Link } from 'react-router-dom';
import { Check, ImageOff, Plus } from 'lucide-react';
import { API_URL } from '../../services/api';
import { useSite } from '../../contexts/SiteContext';
import { useQuote } from '../../contexts/QuoteContext';
import { WhatsAppIcon } from '../icons/WhatsAppIcon';
import { badgeLabels, type Product } from '../../types';

export function ProductCard({ product }: { product: Product }) {
  const site = useSite();
  const { add, has } = useQuote();
  const inList = has(product.id);
  const cover = product.images?.[0]?.image_url;
  const specs = [
    product.dimensions,
    product.cavities ? `${product.cavities} ${product.cavities === 1 ? 'cavidade' : 'cavidades'}` : null,
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <article className="group flex h-full flex-col rounded-2xl bg-white p-2.5 shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:p-4">
      <Link to={`/molde/${product.slug}`} className="flex flex-1 flex-col rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-surface-mid">
          {cover ? (
            <img
              src={`${API_URL}${cover}`}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-outline/60">
              <ImageOff className="h-6 w-6" strokeWidth={1.5} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">Foto em breve</span>
            </div>
          )}
          {product.badge && badgeLabels[product.badge] && (
            <span className="chip absolute left-2 top-2 bg-primary text-white shadow-sm sm:left-3 sm:top-3">
              {badgeLabels[product.badge]}
            </span>
          )}
          {product.collection && (
            <span className="chip absolute right-2 top-2 max-w-[calc(100%-1rem)] bg-white/90 text-primary backdrop-blur-sm sm:right-3 sm:top-3">
              <span className="truncate">{product.collection.name}</span>
            </span>
          )}
        </div>

        {product.code && (
          <p className="mt-3 px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-outline sm:mt-4">
            {product.code}
          </p>
        )}
        <h3
          className={`line-clamp-2 px-1 font-serif text-[15px] font-semibold leading-snug sm:text-xl ${
            product.code ? 'mt-1' : 'mt-3 sm:mt-4'
          }`}
        >
          {product.name}
        </h3>
        {specs && <p className="mt-1 px-1 text-xs text-ink-soft sm:text-sm">{specs}</p>}
      </Link>

      <div className="mt-3 flex gap-2 sm:mt-5">
        {inList ? (
          <Link
            to="/orcamento"
            className="btn min-h-11 flex-1 border-secondary bg-secondary-soft px-2 py-2 text-[11px] text-secondary-dark sm:px-4 sm:text-[13px]"
          >
            <Check className="h-4 w-4 shrink-0" />
            Na lista
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => add(product)}
            aria-label={`Adicionar ${product.name} à lista de orçamento`}
            className="btn min-h-11 flex-1 border-primary bg-white px-2 py-2 text-[11px] text-primary hover:bg-primary hover:text-white sm:px-4 sm:text-[13px]"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="sm:hidden">Adicionar</span>
            <span className="hidden sm:inline">Adicionar à lista</span>
          </button>
        )}
        <a
          href={site.productQuoteLink(product)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Pedir orçamento só do molde ${product.name} pelo WhatsApp`}
          title="Orçamento só deste molde pelo WhatsApp"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line text-ink-soft transition-colors hover:border-primary hover:text-primary"
        >
          <WhatsAppIcon className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
}
