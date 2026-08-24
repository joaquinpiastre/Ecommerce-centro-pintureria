import 'server-only';
import { getAllProductsAdmin } from './data';
import { CATEGORIES_META } from './categories-meta';

export function getAdminStats() {
  const all = getAllProductsAdmin();
  const visible = all.filter((p) => !p.hidden);
  const hidden = all.filter((p) => p.hidden);

  const withRealPhoto = visible.filter((p) => !!p.image).length;
  const withoutPrice = visible.filter((p) => !p.hasAnyPrice).length;
  const offers = visible.filter((p) => p.isOffer).length;
  const edited = visible.filter((p) => p.hasOverride).length;

  const byCategory = CATEGORIES_META.map((meta) => ({
    slug: meta.slug,
    label: meta.label,
    accent: meta.accent,
    count: visible.filter((p) => p.categorySlug === meta.slug).length,
  })).sort((a, b) => b.count - a.count);

  const brandCounts = new Map<string, number>();
  for (const p of visible) if (p.brand) brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1);
  const topBrands = [...brandCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  const pricedVariants = visible.flatMap((p) => p.variants.filter((v) => v.hasPrice));
  const avgPrice = pricedVariants.length ? pricedVariants.reduce((s, v) => s + v.price, 0) / pricedVariants.length : 0;
  const totalCatalogValue = visible.reduce((sum, p) => sum + (p.hasAnyPrice ? p.priceMin : 0), 0);

  return {
    total: visible.length,
    hiddenCount: hidden.length,
    withRealPhoto,
    withoutPhoto: visible.length - withRealPhoto,
    withoutPrice,
    offers,
    edited,
    brandCount: brandCounts.size,
    avgPrice,
    totalCatalogValue,
    byCategory,
    topBrands,
    recentlyEdited: visible
      .filter((p) => p.hasOverride)
      .slice(0, 8),
  };
}
