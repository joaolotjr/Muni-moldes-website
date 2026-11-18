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
  /** Peso aproximado do molde. */
  final_weight: string | null;
  /** Código de referência, ex.: MM-0142. */
  code?: string | null;
  cavities?: number | null;
  material?: string | null;
  /** Peso da peça pronta, ex.: "20 g por cavidade". */
  piece_weight?: string | null;
  min_order?: number | null;
  /** Categoria principal. */
  collection: Collection | null;
  /** Todas as categorias, incluindo a principal. */
  collections?: Collection[];
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

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  permissions: import('./config/permissions').Permission[];
  is_active: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  created_at: string;
  user_name: string | null;
  user_email: string | null;
  action: string;
  area: string;
  target: string | null;
  ip: string | null;
}
