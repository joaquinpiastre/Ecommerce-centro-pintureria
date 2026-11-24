import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getProductsByCategory } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import { getCategoryCover } from '@/lib/covers';
import { CategoryBrowser } from '@/components/catalog/category-browser';
import { SITE } from '../../../../../config/site';

// Dinámico: los conteos y el listado dependen del catálogo editable desde /admin.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.label,
    description: `${category.label} en ${SITE.name}: ${category.count} productos disponibles. Armá tu pedido y coordinalo por WhatsApp, retiro en local en San Rafael.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sub?: string | string[] }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  // ?sub=<slug> abre la categoría ya filtrada por esa subcategoría (links del menú y de la home).
  const { sub } = await searchParams;
  const subSlug = Array.isArray(sub) ? sub[0] : sub;
  const initialSubcategory = category.subcategories.find((s) => s.slug === subSlug)?.label ?? null;

  const products = getProductsByCategory(slug);

  return (
    <div>
      {/* Portada de la categoría: foto a todo el ancho, oscurecida para que se lea el título. */}
      <div className="relative isolate overflow-hidden bg-brand-ink py-12 text-white sm:py-16 lg:py-20">
        <Image src={getCategoryCover(category.slug)} alt="" fill preload sizes="100vw" className="-z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-white/75">
            <Link href="/" className="hover:text-white">
              Inicio
            </Link>
            <span>/</span>
            <span className="text-white">{category.label}</span>
          </nav>
          <h1 className="mt-3 font-heading text-4xl font-bold drop-shadow-sm sm:text-5xl">{category.label}</h1>
          <p className="mt-2 text-white/85">
            {category.count} productos · {category.subcategories.length} rubros
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* key: al cambiar de subcategoría desde el menú, el listado arranca con ese filtro. */}
        <CategoryBrowser key={initialSubcategory ?? 'todas'} category={category} products={products} initialSubcategory={initialSubcategory} />
      </div>
    </div>
  );
}
