import { Link } from 'react-router-dom';
import { ImageOff } from 'lucide-react';
import { API_URL } from '../../services/api';
import { useSite } from '../../contexts/SiteContext';
import { WhatsAppIcon } from '../icons/WhatsAppIcon';
import type { Product } from '../../types';

export function ProductCard({ product }: { product: Product }) {
  const site = useSite();
  const cover = product.images?.[0]?.image_url;
  const specs = [product.dimensions, product.final_weight].filter(Boolean).join(' • ');

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
          {product.collection && (
            <span className="chip absolute right-2 top-2 max-w-[calc(100%-1rem)] bg-white/90 text-primary backdrop-blur-sm sm:right-3 sm:top-3">
              <span className="truncate">{product.collection.name}</span>
            </span>
          )}
        </div>

        <h3 className="mt-3 line-clamp-2 px-1 font-serif text-[15px] font-semibold leading-snug sm:mt-4 sm:text-xl">
          {product.name}
        </h3>
        {specs && <p className="mt-1 px-1 text-xs text-ink-soft sm:text-sm">{specs}</p>}
      </Link>

      <a
        href={site.productQuoteLink(product)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Solicitar orçamento do molde ${product.name}`}
        className="btn mt-3 min-h-11 border-primary bg-white px-2 py-2 text-[11px] text-primary hover:bg-primary hover:text-white sm:mt-5 sm:px-4 sm:text-[13px]"
      >
        <WhatsAppIcon className="h-4 w-4 shrink-0" />
        <span className="sm:hidden">Orçamento</span>
        <span className="hidden sm:inline">Solicitar orçamento</span>
      </a>
    </article>
  );
}
