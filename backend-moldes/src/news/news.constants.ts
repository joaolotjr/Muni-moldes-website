// Categorias das notícias. O site e o painel usam as mesmas chaves.
export const NEWS_CATEGORIES = [
  'lancamentos',
  'eventos',
  'tutoriais',
  'novidades',
] as const;
export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export const NEWS_STATUSES = ['draft', 'published'] as const;
export type NewsStatus = (typeof NEWS_STATUSES)[number];

export const EXCERPT_MAX_LENGTH = 160;
