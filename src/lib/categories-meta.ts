import catalog from '../../data/categories.json';
import { BRAND_COLORS } from './brand-palette';

// Metadata liviana de categorías, segura para client components.
//
// Las categorías ya no están escritas a mano: salen de la columna "Categorias" de la
// lista de productos. scripts/build-catalog.ts las deja en data/categories.json (con
// su ícono y orden, definidos en scripts/taxonomy.ts) y acá solo se leen. Una
// categoría nueva en la lista aparece sola en el sitio al regenerar el catálogo.
export interface CategoryMeta {
  slug: string;
  label: string;
  accent: string;
  icon: string;
}

export const CATEGORIES_META: CategoryMeta[] = catalog.categories.map(({ slug, label, accent, icon }) => ({ slug, label, accent, icon }));

/** Orden de las subcategorías de cada categoría, tal como lo definió el build del catálogo. */
export const SUBCATEGORY_ORDER: Record<string, string[]> = Object.fromEntries(
  catalog.categories.map((c) => [c.slug, c.subcategories.map((s) => s.label)])
);

const FALLBACK_META: CategoryMeta = { slug: 'varios', label: 'Varios', accent: BRAND_COLORS.verde, icon: 'Package' };

export function getCategoryMeta(slug: string): CategoryMeta {
  return CATEGORIES_META.find((c) => c.slug === slug) ?? FALLBACK_META;
}
