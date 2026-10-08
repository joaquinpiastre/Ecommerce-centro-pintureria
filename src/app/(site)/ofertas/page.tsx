import type { Metadata } from 'next';
import { Tag } from 'lucide-react';
import { getOfferProducts } from '@/lib/data';
import { ProductCard } from '@/components/product/product-card';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Ofertas' };

export default function OffersPage() {
  const offers = getOfferProducts();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="flex items-center gap-2 font-heading text-3xl font-bold text-offer">
        <Tag className="h-7 w-7" /> Ofertas
      </h1>
      <p className="mt-1 text-muted-foreground">{offers.length} productos con descuento sobre el precio de lista.</p>
      {offers.length === 0 ? (
        <p className="mt-10 text-muted-foreground">Por ahora no hay ofertas activas. ¡Volvé pronto!</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {offers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
