'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingCart, Check, Info } from 'lucide-react';
import type { Product } from '@/lib/types';
import { ProductImage } from './product-image';
import { useCartStore } from '@/store/cart';
import { SITE } from '../../../config/site';

export function ProductDetail({ product }: { product: Product }) {
  const [optionIdx, setOptionIdx] = useState(0);
  const [sizeIdx, setSizeIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.open);

  // Variedades (color, número, grano…) y, dentro de cada una, sus presentaciones.
  const options = useMemo(() => [...new Set(product.variants.map((v) => v.option).filter((o): o is string => !!o))], [product.variants]);
  const currentOption = options.length > 0 ? options[Math.min(optionIdx, options.length - 1)] : null;
  const sizes = useMemo(
    () => (currentOption ? product.variants.filter((v) => v.option === currentOption) : product.variants),
    [product.variants, currentOption]
  );
  const variant = sizes[Math.min(sizeIdx, sizes.length - 1)];
  // Un color sin foto propia no hereda la foto de otro color; el resto de las variedades (grano, número, medida) se ven igual.
  const variantImage = variant.image ?? (product.optionLabel === 'Color' ? null : product.image);
  const fullLabel = [variant.option, variant.sizeLabel].filter(Boolean).join(' · ') || null;

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        codigo: variant.codigo,
        name: product.name,
        brand: product.brand,
        sizeLabel: fullLabel,
        price: variant.price,
        priceDisplay: variant.priceDisplay,
        image: variantImage,
        categorySlug: product.categorySlug,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    openCart();
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-muted">
        <ProductImage key={variantImage ?? 'none'} image={variantImage} brandSlug={product.brandSlug} categorySlug={product.categorySlug} name={product.name} priority sizes="(min-width: 1024px) 45vw, 90vw" />
        {product.isOffer && (
          <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-accent-foreground shadow">
            Oferta
          </span>
        )}
      </div>

      <div className="flex flex-col">
        {product.brand && <p className="text-sm font-semibold uppercase tracking-wide text-brand-ink">{product.brand}</p>}
        <h1 className="mt-1 font-heading text-2xl font-bold leading-tight sm:text-3xl">{product.name}</h1>
        <p className="mt-2 text-xs text-muted-foreground">Código {variant.codigo}</p>

        <div className="mt-5">
          {variant.hasPrice ? (
            <p className="font-heading text-3xl font-bold text-foreground">{variant.priceDisplay}</p>
          ) : (
            <p className="text-xl font-semibold text-muted-foreground">Consultar precio</p>
          )}
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0" /> {SITE.priceDisclaimer}
          </p>
        </div>

        {options.length > 1 && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-semibold">
              {product.optionLabel ?? 'Opción'}: <span className="font-normal text-muted-foreground">{currentOption}</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {options.map((o, i) => (
                <button
                  key={o}
                  onClick={() => {
                    setOptionIdx(i);
                    setSizeIdx(0);
                  }}
                  className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
                    o === currentOption
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:border-primary/50'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        )}

        {sizes.length > 1 && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-semibold">Presentación</h3>
            <div className="flex flex-wrap gap-2">
              {sizes.map((v, i) => (
                <button
                  key={v.codigo}
                  onClick={() => setSizeIdx(i)}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                    v === variant
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:border-primary/50'
                  }`}
                >
                  {v.sizeLabel ?? `Opción ${i + 1}`}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-full border border-border">
            <button
              className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Restar cantidad"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-base font-semibold">{qty}</span>
            <button
              className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground"
              onClick={() => setQty((q) => q + 1)}
              aria-label="Sumar cantidad"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <motion.button
            onClick={handleAdd}
            whileTap={{ scale: 0.96 }}
            className="flex h-11 flex-1 min-w-[200px] items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
          >
            {added ? (
              <>
                <Check className="h-4.5 w-4.5" /> Agregado
              </>
            ) : (
              <>
                <ShoppingCart className="h-4.5 w-4.5" /> Agregar al carrito
              </>
            )}
          </motion.button>
        </div>

        {product.description && (
          <div className="mt-8">
            <h2 className="mb-2 text-sm font-semibold">Descripción</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          </div>
        )}

        <div className="mt-8 rounded-2xl bg-cream p-4 text-sm text-muted-foreground">
          Retiro en el local — {SITE.address}. El pedido se coordina y confirma por WhatsApp.
        </div>
      </div>
    </div>
  );
}
