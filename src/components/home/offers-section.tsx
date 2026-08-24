import Link from 'next/link';
import { ArrowRight, Tag } from 'lucide-react';
import type { Product } from '@/lib/types';
import { ProductCarousel } from './product-carousel';

export function OffersSection({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent">
            <Tag className="h-3.5 w-3.5" /> Ofertas
          </span>
          <h2 className="mt-2 font-heading text-2xl font-bold sm:text-3xl">Liquidación</h2>
        </div>
        <Link href="/categoria/pinturas?oferta=1" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex">
          Ver todas <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <ProductCarousel products={products} />
    </section>
  );
}
