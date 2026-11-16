import { Link } from 'react-router-dom';
import { ArrowUpRight, ImageOff } from 'lucide-react';
import { API_URL } from '../../services/api';
import type { Product } from '../../types';

export function ProductCard({ product }: { product: Product }) {
  const cover = product.images?.[0]?.image_url;
  const specs = [product.dimensions, product.final_weight].filter(Boolean).join(' · ');

  return (
    <Link
      to={`/molde/${product.slug}`}
      className="group flex h-full flex-col border border-line bg-white transition-colors hover:border-ink"
    >
      <div className="aspect-square overflow-hidden border-b border-line bg-paper">
        {cover ? (
          <img
            src={`${API_URL}${cover}`}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-soft/50">
            <ImageOff className="h-6 w-6" strokeWidth={1.5} />
            <span className="eyebrow text-[10px] text-ink-soft/60">Foto em breve</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.collection && <p className="eyebrow text-rose">{product.collection.name}</p>}
        <h3 className="mt-1.5 line-clamp-2 text-[15px] font-semibold leading-snug">{product.name}</h3>
        {specs && <p className="mt-1.5 font-mono text-xs text-ink-soft">{specs}</p>}
        <span className="mt-auto flex items-center justify-between pt-4 text-xs font-semibold text-ink-soft group-hover:text-ink">
          Ver ficha do molde
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
