import { getAllProducts, getCategories, getOfferProducts, getFeaturedBrands, getFeaturedProducts } from '@/lib/data';
import { Hero } from '@/components/home/hero';
import { InfoStrip } from '@/components/home/info-strip';
import { CategoryGrid } from '@/components/home/category-grid';
import { TrustBadges } from '@/components/home/trust-badges';
import { ProductShelf } from '@/components/home/product-shelf';
import { FeaturedBrands } from '@/components/home/featured-brands';
import { PAYMENT } from '../../../config/site';

// Dinámico: categorías, ofertas y marcas destacadas dependen del catálogo editable desde /admin.
export const dynamic = 'force-dynamic';

export default function HomePage() {
  const categories = getCategories().filter((c) => c.slug !== 'varios');
  const offers = getOfferProducts(12);
  const featured = getFeaturedProducts(12);
  const brands = getFeaturedBrands();
  const all = getAllProducts();

  // Foto de cada categoría: la de un producto de esa categoría que tenga foto real.
  const categoryImages: Record<string, string> = {};
  for (const p of all) {
    if (p.image && !categoryImages[p.categorySlug]) categoryImages[p.categorySlug] = p.image;
  }

  // Una repisa por cada categoría grande, como las secciones de la home de Rex.
  const shelves = categories
    .filter((c) => c.count >= 4)
    .slice(0, 4)
    .map((c) => ({
      category: c,
      products: all.filter((p) => p.categorySlug === c.slug && p.hasAnyPrice).slice(0, 12),
    }));

  return (
    <>
      <Hero />
      <InfoStrip />
      <CategoryGrid categories={categories} images={categoryImages} />
      {offers.length > 0 && <ProductShelf title="Ofertas" products={offers} href="/categoria/pinturas?oferta=1" />}
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
      {shelves.map(({ category, products }) => (
        <ProductShelf key={category.slug} title={category.label} products={products} href={`/categoria/${category.slug}`} />
      ))}
      <TrustBadges />
      <FeaturedBrands brands={brands} />
    </>
  );
}
