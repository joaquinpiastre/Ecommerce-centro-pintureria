import { getCategories, getOfferProducts, getFeaturedBrands, getFeaturedProducts } from '@/lib/data';
import { Hero } from '@/components/home/hero';
import { CategoryGrid } from '@/components/home/category-grid';
import { TrustBadges } from '@/components/home/trust-badges';
import { OffersSection } from '@/components/home/offers-section';
import { FeaturedProducts } from '@/components/home/featured-products';
import { FeaturedBrands } from '@/components/home/featured-brands';

// Dinámico: categorías, ofertas y marcas destacadas dependen del catálogo editable desde /admin.
export const dynamic = 'force-dynamic';

export default function HomePage() {
  const categories = getCategories().filter((c) => c.slug !== 'varios');
  const offers = getOfferProducts(8);
  const featured = getFeaturedProducts(16);
  const brands = getFeaturedBrands();

  return (
    <>
      <Hero />
      <CategoryGrid categories={categories} />
      <OffersSection products={offers} />
      <FeaturedProducts products={featured} categories={categories} />
      <TrustBadges />
      <FeaturedBrands brands={brands} />
    </>
  );
}
