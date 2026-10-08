import { Banknote, CreditCard, Landmark } from 'lucide-react';
import { PAYMENT } from '../../../config/site';
import { formatPriceARS } from '@/lib/format';
import { priceBreakdown } from '@/lib/pricing';

interface PriceBlockProps {
  /** Precio de lista. */
  price: number;
  /** Precio de lista original, si el producto está en oferta (price ya trae el descuento). */
  originalPrice?: number | null;
  /** Muestra "Desde" (producto con varias presentaciones o variedades). */
  from?: boolean;
  size?: 'card' | 'detail';
}

/**
 * Los tres precios (efectivo, transferencia y lista) y el valor de la cuota sin interés.
 * Es el mismo bloque en tarjetas y ficha de producto para que siempre se lea igual.
 */
/** Etiqueta grande y roja con el descuento de la oferta. */
export function OfferBadge({ pct, big }: { pct: number; big?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-md bg-offer font-extrabold uppercase leading-none tracking-tight text-white shadow-md ${
        big ? 'px-3.5 py-2 text-3xl' : 'px-3 py-1.5 text-xl'
      }`}
    >
      {pct}% OFF
    </span>
  );
}

export function PriceBlock({ price, originalPrice, from, size = 'card' }: PriceBlockProps) {
  const p = priceBreakdown(price);
  const detail = size === 'detail';

  if (detail) {
    return (
      <div className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-ink">
            <Banknote className="h-4 w-4" /> Efectivo
            <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary-foreground">
              {PAYMENT.cashDiscountPct}% OFF
            </span>
          </span>
          <span className="font-heading text-3xl font-bold text-foreground">{formatPriceARS(p.cash)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="flex items-center gap-1.5 text-sm font-medium text-foreground/80">
            <Landmark className="h-4 w-4" /> Transferencia
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold leading-none text-foreground/80">
              {PAYMENT.transferDiscountPct}% OFF
            </span>
          </span>
          <span className="text-xl font-semibold text-foreground">{formatPriceARS(p.transfer)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-muted-foreground">Precio de lista</span>
          <span className="text-lg font-semibold text-muted-foreground">
            {originalPrice ? <s className="mr-2 text-sm font-normal text-offer">{formatPriceARS(originalPrice)}</s> : null}
            {formatPriceARS(p.list)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-brand-ink">
          <CreditCard className="h-4 w-4 shrink-0" />
          <span>
            {PAYMENT.installments} cuotas sin interés de <strong>{formatPriceARS(p.installment)}</strong>
          </span>
        </div>
        <p className="-mt-1 text-xs text-muted-foreground">Con {PAYMENT.cardsLabel}.</p>
      </div>
    );
  }

  // Tarjeta: compacta, sin íconos para que los importes nunca se corten.
  return (
    <div className="flex flex-col gap-1">
      {from && <span className="text-[11px] text-muted-foreground">Desde</span>}
      <div className="flex items-center justify-between gap-1.5">
        <span className="flex min-w-0 items-center gap-1 text-[11px] font-semibold text-brand-ink">
          Efectivo
          <span className="rounded bg-primary px-1 py-0.5 text-[9px] font-bold leading-none text-primary-foreground">-{PAYMENT.cashDiscountPct}%</span>
        </span>
        <span className="font-heading text-base font-bold leading-none text-foreground">{formatPriceARS(p.cash)}</span>
      </div>
      <div className="flex items-center justify-between gap-1.5">
        <span className="flex min-w-0 items-center gap-1 text-[11px] font-medium text-foreground/80">
          Transferencia
          <span className="rounded bg-muted px-1 py-0.5 text-[9px] font-bold leading-none text-foreground/80">-{PAYMENT.transferDiscountPct}%</span>
        </span>
        <span className="text-[13px] font-semibold leading-none text-foreground">{formatPriceARS(p.transfer)}</span>
      </div>
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-[11px] font-medium text-muted-foreground">Lista</span>
        <span className="text-[13px] font-semibold leading-none text-muted-foreground">
          {originalPrice ? <s className="mr-1 text-[11px] font-normal text-offer">{formatPriceARS(originalPrice)}</s> : null}
          {formatPriceARS(p.list)}
        </span>
      </div>
      <p className="mt-0.5 rounded-md bg-primary/10 px-2 py-1 text-center text-[11px] font-semibold leading-tight text-brand-ink">
        {PAYMENT.installments} cuotas sin interés de {formatPriceARS(p.installment)}
      </p>
    </div>
  );
}
