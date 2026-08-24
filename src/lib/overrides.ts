import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import type { Product } from './types';
import { formatPriceARS } from './format';
import { OVERRIDES_PATH } from './storage-paths';

export interface ProductOverride {
  hidden?: boolean;
  name?: string;
  brand?: string | null;
  category?: string;
  categorySlug?: string;
  subcategory?: string | null;
  isOffer?: boolean;
  image?: string | null;
  /** codigo de variante -> precio nuevo */
  variantPrices?: Record<string, number>;
  updatedAt?: string;
}

export type OverridesFile = Record<string, ProductOverride>;

export function readOverrides(): OverridesFile {
  try {
    const raw = fs.readFileSync(OVERRIDES_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function writeOverrides(overrides: OverridesFile): void {
  fs.mkdirSync(path.dirname(OVERRIDES_PATH), { recursive: true });
  fs.writeFileSync(OVERRIDES_PATH, JSON.stringify(overrides, null, 2));
}

export function getOverride(id: string): ProductOverride | undefined {
  return readOverrides()[id];
}

export function setOverride(id: string, patch: Partial<ProductOverride>): ProductOverride {
  const overrides = readOverrides();
  const merged: ProductOverride = { ...overrides[id], ...patch, updatedAt: new Date().toISOString() };
  overrides[id] = merged;
  writeOverrides(overrides);
  return merged;
}

export function clearOverride(id: string): void {
  const overrides = readOverrides();
  delete overrides[id];
  writeOverrides(overrides);
}

export function applyOverride(product: Product, override: ProductOverride | undefined): Product {
  if (!override) return product;

  let variants = product.variants;
  if (override.variantPrices) {
    variants = product.variants.map((v) => {
      const newPrice = override.variantPrices?.[v.codigo];
      if (newPrice === undefined) return v;
      return {
        ...v,
        price: newPrice,
        hasPrice: newPrice > 0,
        priceDisplay: newPrice > 0 ? formatPriceARS(newPrice) : 'Consultar precio',
      };
    });
  }
  const pricedVariants = variants.filter((v) => v.hasPrice);
  const priceMin = pricedVariants.length ? Math.min(...pricedVariants.map((v) => v.price)) : 0;
  const priceMax = pricedVariants.length ? Math.max(...pricedVariants.map((v) => v.price)) : 0;

  return {
    ...product,
    name: override.name ?? product.name,
    brand: override.brand !== undefined ? override.brand : product.brand,
    category: override.category ?? product.category,
    categorySlug: override.categorySlug ?? product.categorySlug,
    subcategory: override.subcategory !== undefined ? override.subcategory : product.subcategory,
    isOffer: override.isOffer !== undefined ? override.isOffer : product.isOffer,
    image: override.image !== undefined ? override.image : product.image,
    variants,
    priceMin,
    priceMax,
    hasAnyPrice: pricedVariants.length > 0,
  };
}

export interface AdminProduct extends Product {
  hidden: boolean;
  hasOverride: boolean;
}

export function applyOverrideForAdmin(product: Product, override: ProductOverride | undefined): AdminProduct {
  const merged = applyOverride(product, override);
  return { ...merged, hidden: override?.hidden === true, hasOverride: !!override };
}
