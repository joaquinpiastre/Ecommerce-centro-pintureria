import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import { getAllProducts, invalidateDataCache } from './data';
import type { Product } from './types';

function regenerateSearchIndex(): void {
  const products = getAllProducts();
  const index = products.map((p) => ({
    id: p.id,
    codigo: p.codigo,
    name: p.name,
    brand: p.brand,
    category: p.category,
    categorySlug: p.categorySlug,
    priceDisplay: p.variants[0]?.priceDisplay ?? 'Consultar precio',
    image: p.image,
    codes: p.allCodigos.join(' '),
  }));
  fs.writeFileSync(path.join(process.cwd(), 'public', 'search-index.json'), JSON.stringify(index));
}

/**
 * Se llama después de cualquier escritura de admin: tira la caché en memoria,
 * regenera el índice de búsqueda estático y revalida las páginas públicas que
 * puedan mostrar este producto (para verse actualizado sin un `next build` nuevo).
 */
export function syncAfterProductChange(product: Product, previousCategorySlug?: string): void {
  invalidateDataCache();
  regenerateSearchIndex();

  revalidatePath('/');
  revalidatePath('/sitemap.xml');
  revalidatePath(`/categoria/${product.categorySlug}`);
  if (previousCategorySlug && previousCategorySlug !== product.categorySlug) {
    revalidatePath(`/categoria/${previousCategorySlug}`);
  }
  for (const codigo of product.allCodigos) {
    revalidatePath(`/producto/${codigo}`);
  }
}
