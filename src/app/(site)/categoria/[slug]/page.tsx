import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getProductsByCategory } from '@/lib/data';
import { getCategoryIcon } from '@/lib/icons';
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

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const products = getProductsByCategory(slug);
  const Icon = getCategoryIcon(category.icon);

  return (
    <div>
      <div
        className="relative overflow-hidden py-10 text-white sm:py-14"
        style={{ background: `linear-gradient(150deg, ${category.accent}, color-mix(in oklch, ${category.accent}, black 35%))` }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            {/* eslint-disable-next-line react-hooks/static-components -- Icon viene de un lookup estable en un Record de módulo */}
            <Icon className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-heading text-3xl font-bold sm:text-4xl">{category.label}</h1>
          <p className="mt-1 text-white/80">{category.count} productos</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <CategoryBrowser category={category} products={products} />
      </div>
    </div>
  );
}
