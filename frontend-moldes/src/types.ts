export interface Product {
  id: string;
  name: string;
  slug: string;
  collection: string;
  description: string;
  price: number;
  images: string[];
  dimensions: string;
  weight: string;
  material: string;
  active: boolean;
  isNew: boolean;
  createdAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  image: string;
  publishedAt: string;
}

export interface ContactForm {
  name: string;
  company: string;
  interest: string;
  message: string;
}

// Initial defaults for bootstrapping, but not the source of truth anymore
export const DEFAULT_COLLECTIONS = [
  'Natal',
  'Páscoa',
  'Casamento',
  'Infantil',
  'Geométricos',
  'Florais'
];

export const INTERESTS = [
  'Lojista / Revenda',
  'Artesão Profissional',
  'Distribuidor',
  'Outros'
];