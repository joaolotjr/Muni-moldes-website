export interface Collection {
  id: string;
  name: string;
  slug: string;
  // Campos de visibilidade, usados no painel.
  is_active?: boolean;
  active_from?: string | null;
  active_until?: string | null;
}

export interface ProductImage {
  id: string;
  image_url: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  dimensions: string | null;
  final_weight: string | null;
  collection: Collection | null;
  images: ProductImage[];
  // Campos de visibilidade, usados no painel.
  collection_id?: string | null;
  is_active?: boolean;
  active_from?: string | null;
  active_until?: string | null;
}

export type NewsCategory = 'lancamentos' | 'eventos' | 'tutoriais' | 'novidades';
export type NewsStatus = 'draft' | 'published';

export interface NewsPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  /** Só vem na notícia aberta e no painel; a listagem do site não traz o texto. */
  content?: string;
  category: NewsCategory;
  tags: string[];
  cover_image_url: string | null;
  status?: NewsStatus;
  published_at: string | null;
  author_name: string | null;
  created_at?: string;
  updated_at?: string;
}
