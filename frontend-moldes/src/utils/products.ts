import type { Collection, Product } from '../types';

/** Todas as categorias do produto. Respostas antigas só traziam a principal. */
export function collectionsOf(product: Product): Collection[] {
  if (product.collections?.length) return product.collections;
  return product.collection ? [product.collection] : [];
}

/** Categorias além da principal. */
export function secondaryCollectionsOf(product: Product): Collection[] {
  return collectionsOf(product).filter((collection) => collection.id !== product.collection?.id);
}

/** Quantos produtos há em cada categoria (um produto conta em todas as suas). Chave: id. */
export function countByCollectionId(products: Product[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const product of products) {
    for (const collection of collectionsOf(product)) {
      counts.set(collection.id, (counts.get(collection.id) ?? 0) + 1);
    }
  }
  return counts;
}

/** Busca pelo nome ou pelo código do molde, sem diferenciar maiúsculas. */
export function matchesSearch(product: Product, term: string): boolean {
  const query = term.trim().toLowerCase();
  if (!query) return true;
  return (
    product.name.toLowerCase().includes(query) || (product.code ?? '').toLowerCase().includes(query)
  );
}
