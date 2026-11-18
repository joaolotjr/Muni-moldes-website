export type ProductBadge = 'new' | 'bestseller';

export const badgeLabels: Record<ProductBadge, string> = {
  new: 'Lançamento',
  bestseller: 'Mais vendido',
};

export interface Collection {
  id: string;
  name: string;
  slug: string;
  sort_order?: number;
  /** Foto de capa enviada pelo painel. Sem ela, o site usa a capa automática. */
  cover_url?: string | null;
  // Campos de visibilidade, usados no painel.
  is_active?: boolean;
  active_from?: string | null;
  active_until?: string | null;
}

export interface ProductImage {
  id: string;
  image_url: string;
  is_cover?: boolean;
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
  /** Aparece em "Destaques" na home e primeiro no catálogo. */
  is_featured?: boolean;
  badge?: ProductBadge | null;
  /** Ordem no catálogo: menor vem antes. */
  sort_order?: number;
  created_at?: string;
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
