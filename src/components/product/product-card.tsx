'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingCart, Check, ListChecks } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '@/lib/types';
import { ProductImage } from './product-image';
import { PriceBlock } from './price-block';
import { useCartStore } from '@/store/cart';

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const addItem = useCartStore((s) => s.addItem);
  const [justAdded, setJustAdded] = useState(false);
  const router = useRouter();

  const defaultVariant = product.variants[0];
  const hasRange = product.variants.length > 1 && product.priceMin !== product.priceMax;
  const optionCount = new Set(product.variants.map((v) => v.option).filter(Boolean)).size;
  const hasOptions = optionCount > 1;
  // Con varios colores/números hay que elegir primero: el botón abre la ficha.
  const needsChoice = hasOptions || product.variants.length > 1;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (needsChoice) {
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
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
    >
      <Link href={`/producto/${product.codigo}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square w-full overflow-hidden bg-white">
          <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]">
            <ProductImage image={product.image} brandSlug={product.brandSlug} categorySlug={product.categorySlug} name={product.name} priority={priority} />
          </div>
          <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
            {product.hasAnyPrice && (
              <span className="rounded-md bg-primary px-2 py-1 text-[11px] font-bold leading-none text-primary-foreground shadow">
                10% OFF efectivo
              </span>
            )}
            {product.isOffer && (
              <span className="rounded-md bg-foreground px-2 py-1 text-[11px] font-bold uppercase leading-none tracking-wide text-background shadow">
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

        <div className="flex flex-1 flex-col gap-2 border-t border-border p-3.5">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-foreground">{product.name}</h3>
          {hasOptions ? (
            <p className="text-xs text-muted-foreground">
              {optionCount} {product.optionLabelPlural ?? 'opciones'} disponibles
            </p>
          ) : (
            product.variants.length > 1 && <p className="text-xs text-muted-foreground">{product.variants.length} presentaciones</p>
          )}
          <div className="mt-auto pt-1">
            {product.hasAnyPrice ? (
              <PriceBlock price={hasRange ? product.priceMin : defaultVariant.price} from={hasRange} />
            ) : (
              <p className="text-sm font-medium text-muted-foreground">Consultar precio</p>
            )}
          </div>
        </div>
      </Link>

      <button
        onClick={handleAdd}
        className="flex h-10 w-full items-center justify-center gap-2 bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {needsChoice ? (
          <>
            <ListChecks className="h-4 w-4" /> Elegir opción
          </>
        ) : justAdded ? (
          <>
            <Check className="h-4 w-4" /> Agregado
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" /> Agregar al carrito
          </>
        )}
      </button>
    </motion.div>
  );
}
