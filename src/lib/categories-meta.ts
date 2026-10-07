import { BRAND_COLORS } from './brand-palette';

// Copia liviana, segura para client components, de la metadata de categorías
// definida en scripts/taxonomy.ts (accent + icon no cambian en runtime).
export interface CategoryMeta {
  slug: string;
  label: string;
  accent: string;
  icon: string;
}

export const CATEGORIES_META: CategoryMeta[] = [
  { slug: 'pinturas', label: 'Pinturas', accent: BRAND_COLORS.verde, icon: 'PaintBucket' },
  { slug: 'herramientas-y-accesorios', label: 'Herramientas y Accesorios', accent: BRAND_COLORS.verde, icon: 'Wrench' },
  { slug: 'impermeabilizantes-y-revestimientos', label: 'Impermeabilizantes y Revestimientos', accent: BRAND_COLORS.verde, icon: 'Droplets' },
  { slug: 'maderas', label: 'Maderas', accent: BRAND_COLORS.verde, icon: 'TreeDeciduous' },
  { slug: 'preparacion-de-superficies', label: 'Preparación de superficies', accent: BRAND_COLORS.verde, icon: 'Layers' },
  { slug: 'aerosoles', label: 'Aerosoles', accent: BRAND_COLORS.verde, icon: 'SprayCan' },
  { slug: 'diluyentes-y-aditivos', label: 'Diluyentes y Aditivos', accent: BRAND_COLORS.verde, icon: 'FlaskConical' },
  { slug: 'adhesivos-y-selladores', label: 'Adhesivos y Selladores', accent: BRAND_COLORS.verde, icon: 'Droplet' },
  { slug: 'varios', label: 'Varios', accent: BRAND_COLORS.verde, icon: 'Package' },
];

export function getCategoryMeta(slug: string): CategoryMeta {
  return CATEGORIES_META.find((c) => c.slug === slug) ?? CATEGORIES_META[CATEGORIES_META.length - 1];
}
