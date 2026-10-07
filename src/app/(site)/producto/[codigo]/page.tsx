import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductByCodigo, getRelatedProducts } from '@/lib/data';
import { ProductDetail } from '@/components/product/product-detail';
import { RelatedProducts } from '@/components/product/related-products';
import { SITE } from '../../../../../config/site';

// Dinámico (no generateStaticParams): el catálogo se edita en vivo desde /admin
// (ocultar, restaurar, cambiar precio) y las páginas estáticas con notFound() no
// se recuperan de forma confiable con revalidatePath una vez cacheadas como 404.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ codigo: string }> }): Promise<Metadata> {
  const { codigo } = await params;
  const product = getProductByCodigo(codigo);
  if (!product) return {};
  const priceText = product.hasAnyPrice ? product.variants[0].priceDisplay : 'Consultar precio';
  return {
    title: product.name,
    description: product.description ?? `${product.name}${product.brand ? ` de ${product.brand}` : ''} — ${priceText}. Pedilo por WhatsApp en ${SITE.name}, retiro en local en San Rafael.`,
    openGraph: {
      images: product.image ? [{ url: product.image }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const product = getProductByCodigo(codigo);
  if (!product) notFound();

  const related = getRelatedProducts(product, 8);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <ProductDetail product={product} />
      <RelatedProducts products={related} />
    </div>
  );
}
