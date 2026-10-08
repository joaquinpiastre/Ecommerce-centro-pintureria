import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import { ProductCarousel } from './product-carousel';

interface ProductShelfProps {
  title: string;
  products: Product[];
  href?: string;
  /** Panel destacado a la izquierda (como "Ofertas de la semana" en Rex). */
  promo?: { title: string; text: string; cta: string; href: string };
}

export function ProductShelf({ title, products, href, promo }: ProductShelfProps) {
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">{title}</h2>
        {href && (
          <Link href={href} className="flex items-center gap-1 text-sm font-semibold text-brand-ink hover:underline">
            Ver todo <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className={promo ? 'grid gap-5 lg:grid-cols-[240px_1fr]' : ''}>
        {promo && (
          <div className="hidden flex-col justify-center rounded-3xl bg-primary p-6 text-center text-primary-foreground lg:flex">
            <p className="font-heading text-2xl font-bold leading-tight">{promo.title}</p>
            <p className="mt-3 text-sm text-white/90">{promo.text}</p>
            <Link
              href={promo.href}
              className="mt-5 rounded-full bg-white px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-brand-ink transition-transform hover:scale-105"
            >
              {promo.cta}
            </Link>
          </div>
        )}
        <div className="min-w-0">
          <ProductCarousel products={products} />
        </div>
      </div>
    </section>
  );
}
