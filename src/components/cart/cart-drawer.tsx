'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingCart, MessageCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ProductImage } from '@/components/product/product-image';
import { useCartStore } from '@/store/cart';
import { useMounted } from '@/lib/use-mounted';
import { formatPriceARS } from '@/lib/format';
import { buildOrderWhatsappUrl, cartTotal } from '@/lib/whatsapp';
import { SITE } from '../../../config/site';
import { CartTotals } from './cart-totals';

export function CartDrawer() {
  const mounted = useMounted();
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);

  const total = mounted ? cartTotal(items) : 0;
  const empty = !mounted || items.length === 0;

  return (
    <Sheet open={isOpen} onOpenChange={(v) => (v ? undefined : close())}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" /> Tu carrito
          </SheetTitle>
        </SheetHeader>

        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-medium">Todavía no agregaste productos</p>
            <p className="text-sm text-muted-foreground">Explorá el catálogo y armá tu pedido para coordinarlo por WhatsApp.</p>
            <Button className="mt-2" onClick={close} nativeButton={false} render={<Link href="/" />}>
              Ver catálogo
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              <ul className="flex flex-col divide-y divide-border">
                {items.map((item) => (
                  <li key={item.codigo} className="flex gap-3 py-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                      <ProductImage image={item.image} brandSlug={null} categorySlug={item.categorySlug} name={item.name} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.sizeLabel ? `${item.sizeLabel} · ` : ''}
                        {item.brand}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-border">
                          <button
                            className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground"
                            onClick={() => setQuantity(item.codigo, item.quantity - 1)}
                            aria-label="Restar"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground"
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
                      className="h-fit shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"
                      aria-label="Quitar del carrito"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <SheetFooter className="gap-3 border-t">
              <CartTotals total={total} />
              <p className="text-xs text-muted-foreground">{SITE.priceDisclaimer}</p>
              <Button
                size="lg"
                className="w-full gap-2 bg-[#25D366] text-white hover:bg-[#1ebe57]"
                nativeButton={false}
                render={<a href={buildOrderWhatsappUrl(items)} target="_blank" rel="noreferrer" />}
              >
                <MessageCircle className="h-4.5 w-4.5" /> Finalizar pedido por WhatsApp
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={close} nativeButton={false} render={<Link href="/carrito" />}>
                  Ver carrito completo
                </Button>
                <Button variant="ghost" className="text-muted-foreground" onClick={clear}>
                  Vaciar carrito
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
