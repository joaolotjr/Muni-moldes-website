import { Newspaper } from 'lucide-react';
import { API_URL } from '../../services/api';

/** Imagem de destaque da notícia, com um fundo neutro quando não há imagem. */
export function NewsCover({ url, alt = '', className = '' }: { url: string | null; alt?: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-surface-mid ${className}`}>
      {url ? (
        <img
          src={`${API_URL}${url}`}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-outline/40">
          <Newspaper className="h-10 w-10" strokeWidth={1.25} />
        </div>
      )}
    </div>
  );
}
