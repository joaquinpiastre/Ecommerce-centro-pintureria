import { getAllProducts, getCategories, getOfferProducts, getFeaturedBrands, getFeaturedProducts } from '@/lib/data';
import { Hero } from '@/components/home/hero';
import { InfoStrip } from '@/components/home/info-strip';
import { CategoryGrid } from '@/components/home/category-grid';
import { CategoryBanners } from '@/components/home/category-banners';
import { TrustBadges } from '@/components/home/trust-badges';
import { ProductShelf } from '@/components/home/product-shelf';
import { FeaturedBrands } from '@/components/home/featured-brands';
import { PAYMENT } from '../../../config/site';

// Dinámico: categorías, ofertas y marcas destacadas dependen del catálogo editable desde /admin.
export const dynamic = 'force-dynamic';

export default function HomePage() {
  const categories = getCategories().filter((c) => c.slug !== 'varios');
  const offers = getOfferProducts(12);
  const offerIds = new Set(offers.map((p) => p.id));
  // En la home solo van las ofertas y los destacados (sin repetir): el resto está en cada categoría.
  const featured = getFeaturedProducts(24).filter((p) => !offerIds.has(p.id)).slice(0, 12);
  const brands = getFeaturedBrands();

  // Foto de cada categoría: la de un producto de esa categoría que tenga foto real.
  const categoryImages: Record<string, string> = {};
  for (const p of getAllProducts()) {
    if (p.image && !categoryImages[p.categorySlug]) categoryImages[p.categorySlug] = p.image;
  }

  return (
    <>
      <Hero />
      <InfoStrip />
      <CategoryGrid categories={categories} images={categoryImages} />
      <ProductShelf title="Ofertas" tone="offer" products={offers} href="/ofertas" />
      <CategoryBanners categories={categories} />
      <ProductShelf
        title="Productos destacados"
        products={featured}
        promo={{
          title: `${PAYMENT.cashDiscountPct}% OFF en efectivo`,
          text: `${PAYMENT.transferDiscountPct}% OFF por transferencia y ${PAYMENT.installments} cuotas sin interés con ${PAYMENT.cardsLabel}.`,
          cta: 'Ver catálogo',
          href: '/categoria/pinturas',
        }}
      />
      <TrustBadges />
      <FeaturedBrands brands={brands} />
    </>
  );
}
