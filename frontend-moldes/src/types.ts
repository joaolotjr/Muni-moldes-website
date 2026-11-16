export interface Collection {
  id: string;
  name: string;
  slug: string;
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
}
