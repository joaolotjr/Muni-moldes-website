import type { NewsCategory } from '../types';

// As chaves são as mesmas aceitas pelo backend (src/news/news.constants.ts).
export const newsCategories: { value: NewsCategory; label: string }[] = [
  { value: 'lancamentos', label: 'Lançamentos' },
  { value: 'eventos', label: 'Eventos' },
  { value: 'tutoriais', label: 'Tutoriais de uso' },
  { value: 'novidades', label: 'Novidades' },
];

export const EXCERPT_MAX_LENGTH = 160;

export function categoryLabel(value: string) {
  return newsCategories.find((category) => category.value === value)?.label ?? value;
}

export function formatNewsDate(iso: string | null | undefined, style: 'long' | 'short' = 'long') {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    year: 'numeric',
  });
}
