import type { Product } from '@/lib/types';
import { ProductCard } from './product-card';

export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section className="mt-16 border-t border-border pt-10">
      <h2 className="mb-6 font-heading text-xl font-bold sm:text-2xl">También te puede interesar</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
