import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import type { Product, Category } from './types';
import { CATEGORIES_META } from './categories-meta';
import { readOverrides, applyOverride, applyOverrideForAdmin, type AdminProduct } from './overrides';

const DATA_DIR = path.join(process.cwd(), 'data');

// Sin caché en memoria a propósito: en el build de producción cada ruta (páginas
// y route handlers de /api/admin) puede terminar en un bundle de servidor
// distinto, cada uno con su propia copia de cualquier variable a nivel de
// módulo — invalidar un caché desde /api/admin no garantiza limpiar la copia
// que usa /producto/[codigo]. Los archivos son chicos (catálogo + overrides),
// así que leerlos de disco en cada request es barato y siempre correcto.
function getBaseProducts(): Product[] {
  const raw = fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf-8');
  return JSON.parse(raw);
}

/** No-op: se mantiene como export para no romper los call sites existentes;
 * ya no hace falta invalidar nada porque no se cachea nada entre requests. */
export function invalidateDataCache(): void {}

/** Catálogo público: overrides aplicados, productos ocultos filtrados. */
export function getAllProducts(): Product[] {
  const overrides = readOverrides();
  return getBaseProducts()
    .map((p) => applyOverride(p, overrides[p.id]))
    .filter((p) => overrides[p.id]?.hidden !== true);
}

/** Vista de admin: overrides aplicados, incluye ocultos (con flag `hidden`). */
export function getAllProductsAdmin(): AdminProduct[] {
  const overrides = readOverrides();
  return getBaseProducts().map((p) => applyOverrideForAdmin(p, overrides[p.id]));
}

export function getAdminProductById(id: string): AdminProduct | undefined {
  return getAllProductsAdmin().find((p) => p.id === id);
}

export function getCategories(): Category[] {
  const products = getAllProducts();
  return CATEGORIES_META.map((meta) => {
    const inCat = products.filter((p) => p.categorySlug === meta.slug);
    const subMap = new Map<string, number>();
    const brandMap = new Map<string, { label: string; count: number }>();
    for (const p of inCat) {
      if (p.subcategory) subMap.set(p.subcategory, (subMap.get(p.subcategory) ?? 0) + 1);
      if (p.brand && p.brandSlug) {
        const entry = brandMap.get(p.brandSlug) ?? { label: p.brand, count: 0 };
        entry.count++;
        brandMap.set(p.brandSlug, entry);
      }
    }
    const prices = inCat.filter((p) => p.hasAnyPrice).flatMap((p) => [p.priceMin, p.priceMax]);
    return {
      slug: meta.slug,
      label: meta.label,
      accent: meta.accent,
      icon: meta.icon,
      count: inCat.length,
      subcategories: [...subMap.entries()]
        .map(([label, count]) => ({ label, slug: label.toLowerCase().replace(/\s+/g, '-'), count }))
        .sort((a, b) => b.count - a.count),
      brands: [...brandMap.entries()]
        .map(([slug, v]) => ({ slug, label: v.label, count: v.count }))
        .sort((a, b) => b.count - a.count),
      priceMin: prices.length ? Math.min(...prices) : 0,
      priceMax: prices.length ? Math.max(...prices) : 0,
    };
  }).filter((c) => c.count > 0 || c.slug === 'varios');
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return getCategories().find((c) => c.slug === slug);
}

export function getProductsByCategory(slug: string): Product[] {
  return getAllProducts().filter((p) => p.categorySlug === slug);
}

export function getProductByCodigo(codigo: string): Product | undefined {
  return getAllProducts().find((p) => p.allCodigos.includes(codigo));
}

export function getAdminProductByCodigo(codigo: string): AdminProduct | undefined {
  return getAllProductsAdmin().find((p) => p.allCodigos.includes(codigo));
}

export function getRelatedProducts(product: Product, limit = 8): Product[] {
  const all = getAllProducts();
  const sameBrandCategory = all.filter(
    (p) => p.id !== product.id && p.categorySlug === product.categorySlug && p.brand === product.brand
  );
  const sameCategory = all.filter((p) => p.id !== product.id && p.categorySlug === product.categorySlug && p.brand !== product.brand);
  return [...sameBrandCategory, ...sameCategory].slice(0, limit);
}

/** Selección para el inicio: reparte productos entre categorías (round-robin),
 * priorizando dentro de cada una los que tienen foto real, para que la home
 * muestre variedad en vez de que una sola categoría grande tape a las demás. */
export function getFeaturedProducts(limit = 16): Product[] {
  const products = getAllProducts().filter((p) => p.hasAnyPrice);
  const byCategory = new Map<string, Product[]>();
  for (const p of products) {
    const arr = byCategory.get(p.categorySlug) ?? [];
    arr.push(p);
    byCategory.set(p.categorySlug, arr);
  }
  const buckets = [...byCategory.values()].map((arr) =>
    [...arr].sort((a, b) => Number(b.image !== null) - Number(a.image !== null))
  );
  const result: Product[] = [];
  for (let i = 0; result.length < limit && buckets.some((b) => i < b.length); i++) {
    for (const bucket of buckets) {
      if (result.length >= limit) break;
      if (i < bucket.length) result.push(bucket[i]);
    }
  }
  return result;
}

export function getOfferProducts(limit?: number): Product[] {
  const offers = getAllProducts().filter((p) => p.isOffer);
  return limit ? offers.slice(0, limit) : offers;
}

export function getFeaturedBrands(): string[] {
  const counts = new Map<string, number>();
  for (const p of getAllProducts()) {
    if (p.brand) counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([b]) => b);
}
