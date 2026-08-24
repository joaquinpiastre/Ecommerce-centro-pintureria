import { getCategories, getOfferProducts, getFeaturedBrands } from '@/lib/data';
import { Hero } from '@/components/home/hero';
import { CategoryGrid } from '@/components/home/category-grid';
import { TrustBadges } from '@/components/home/trust-badges';
import { OffersSection } from '@/components/home/offers-section';
import { FeaturedBrands } from '@/components/home/featured-brands';

// Dinámico: categorías, ofertas y marcas destacadas dependen del catálogo editable desde /admin.
export const dynamic = 'force-dynamic';

export default function HomePage() {
  const categories = getCategories().filter((c) => c.slug !== 'varios');
  const offers = getOfferProducts(8);
  const brands = getFeaturedBrands();

  return (
    <>
      <Hero />
      <CategoryGrid categories={categories} />
      <OffersSection products={offers} />
      <TrustBadges />
      <FeaturedBrands brands={brands} />
    </>
  );
}
