'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingCart, MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductImage } from '@/components/product/product-image';
import { useCartStore } from '@/store/cart';
import { useMounted } from '@/lib/use-mounted';
import { formatPriceARS } from '@/lib/format';
import { buildOrderWhatsappUrl, cartTotal } from '@/lib/whatsapp';
import { SITE } from '../../../../config/site';
import { CartTotals } from '@/components/cart/cart-totals';

export default function CartPage() {
  const mounted = useMounted();
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);

  const total = mounted ? cartTotal(items) : 0;
  const empty = !mounted || items.length === 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Seguir comprando
      </Link>
      <h1 className="font-heading text-3xl font-bold">Tu carrito</h1>

      {empty ? (
        <div className="mt-16 flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="h-9 w-9 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-semibold">Tu carrito está vacío</p>
            <p className="mt-1 text-sm text-muted-foreground">Explorá el catálogo y armá tu pedido para coordinarlo por WhatsApp.</p>
          </div>
          <Button size="lg" nativeButton={false} render={<Link href="/" />}>
            Ver catálogo
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border">
            {items.map((item) => (
              <li key={item.codigo} className="flex gap-4 p-4">
                <Link href={`/producto/${item.codigo}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                  <ProductImage image={item.image} brandSlug={null} categorySlug={item.categorySlug} name={item.name} />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/producto/${item.codigo}`} className="line-clamp-2 text-sm font-medium hover:underline">
                    {item.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.sizeLabel ? `${item.sizeLabel} · ` : ''}
                    {item.brand}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-border">
                      <button
                        className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
                        onClick={() => setQuantity(item.codigo, item.quantity - 1)}
                        aria-label="Restar"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
                        onClick={() => setQuantity(item.codigo, item.quantity + 1)}
                        aria-label="Sumar"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold">{formatPriceARS(item.price * item.quantity)}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.codigo)}
                  className="h-fit shrink-0 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-destructive"
                  aria-label="Quitar del carrito"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          <div className="h-fit rounded-2xl border border-border p-5">
            <h2 className="font-heading text-lg font-bold">Resumen</h2>
            <div className="mt-4">
              <CartTotals total={total} />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">{SITE.priceDisclaimer}</p>

            <Button
              size="lg"
              className="mt-5 w-full gap-2 bg-[#25D366] text-white hover:bg-[#1ebe57]"
              nativeButton={false}
              render={<a href={buildOrderWhatsappUrl(items)} target="_blank" rel="noreferrer" />}
            >
              <MessageCircle className="h-4.5 w-4.5" /> Finalizar pedido por WhatsApp
            </Button>
            <Button variant="ghost" className="mt-2 w-full text-muted-foreground" onClick={clear}>
              Vaciar carrito
            </Button>
            <p className="mt-4 text-xs text-muted-foreground">
              Retiro en el local — {SITE.address}. No procesamos pagos ni envíos online.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
