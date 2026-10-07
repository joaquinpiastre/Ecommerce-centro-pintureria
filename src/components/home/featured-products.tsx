import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Category, Product } from '@/lib/types';
import { ProductCarousel } from './product-carousel';

export function FeaturedProducts({ products, categories }: { products: Product[]; categories: Category[] }) {
  if (products.length === 0) return null;
  const topCategory = [...categories].sort((a, b) => b.count - a.count)[0];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">Productos destacados</h2>
          <p className="mt-1 text-muted-foreground">Una selección de nuestro catálogo, con lo mejor de cada categoría.</p>
        </div>
        {topCategory && (
          <Link href={`/categoria/${topCategory.slug}`} className="hidden items-center gap-1 text-sm font-medium text-brand-ink hover:underline sm:flex">
            Ver catálogo completo <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      <ProductCarousel products={products} />
    </section>
  );
}
