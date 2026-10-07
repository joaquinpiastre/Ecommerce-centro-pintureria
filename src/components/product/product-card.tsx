'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Check } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '@/lib/types';
import { ProductImage } from './product-image';
import { useCartStore } from '@/store/cart';
import { formatPriceARS } from '@/lib/format';

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const addItem = useCartStore((s) => s.addItem);
  const [justAdded, setJustAdded] = useState(false);
  const router = useRouter();

  const defaultVariant = product.variants[0];
  const hasRange = product.variants.length > 1 && product.priceMin !== product.priceMax;
  const optionCount = new Set(product.variants.map((v) => v.option).filter(Boolean)).size;
  const hasOptions = optionCount > 1;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    // Con varios colores/números hay que elegir primero: se abre la ficha.
    if (hasOptions) {
      router.push(`/producto/${product.codigo}`);
      return;
    }
    addItem(
      {
        productId: product.id,
        codigo: defaultVariant.codigo,
        name: product.name,
        brand: product.brand,
        sizeLabel: [defaultVariant.option, defaultVariant.sizeLabel].filter(Boolean).join(' · ') || null,
        price: defaultVariant.price,
        priceDisplay: defaultVariant.priceDisplay,
        image: product.image,
        categorySlug: product.categorySlug,
      },
      1
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
    >
      <Link href={`/producto/${product.codigo}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.06]">
            <ProductImage image={product.image} brandSlug={product.brandSlug} categorySlug={product.categorySlug} name={product.name} priority={priority} />
          </div>
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.isOffer && (
              <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-accent-foreground shadow">
                Oferta
              </span>
            )}
          </div>
          {product.brand && (
            <span className="absolute right-2 top-2 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow backdrop-blur">
              {product.brand}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-3.5">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-foreground">{product.name}</h3>
          {hasOptions ? (
            <p className="text-xs text-muted-foreground">
              {optionCount} {product.optionLabelPlural ?? 'opciones'}
            </p>
          ) : (
            product.variants.length > 1 && <p className="text-xs text-muted-foreground">{product.variants.length} presentaciones</p>
          )}
          <div className="mt-auto flex items-end justify-between pt-2">
            <div>
              {product.hasAnyPrice ? (
                <p className="font-heading text-base font-bold text-foreground">
                  {hasRange && <span className="mr-1 text-xs font-normal text-muted-foreground">Desde</span>}
                  {hasRange ? formatPriceARS(product.priceMin) : defaultVariant.priceDisplay}
                </p>
              ) : (
                <p className="text-sm font-medium text-muted-foreground">Consultar precio</p>
              )}
            </div>
          </div>
        </div>
      </Link>

      <button
        onClick={handleAdd}
        aria-label={`Agregar ${product.name} al carrito`}
        className="absolute bottom-3.5 right-3.5 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-110 active:scale-95"
      >
        {justAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
    </motion.div>
  );
}
