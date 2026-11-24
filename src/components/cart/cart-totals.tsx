import { Bank, CreditCard, Money } from '@/components/icons';
import { PAYMENT } from '../../../config/site';
import { formatPriceARS } from '@/lib/format';
import { priceBreakdown } from '@/lib/pricing';

/**
 * Total del carrito de las tres maneras (efectivo, transferencia, lista) y la cuota sin interés.
 * `unpriced`: cantidad de artículos sin precio publicado; no entran en el total y se avisa.
 */
export function CartTotals({ total, unpriced = 0 }: { total: number; unpriced?: number }) {
  const t = priceBreakdown(total);
  const unpricedNote =
    unpriced > 0 ? (
      <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
        {total > 0 ? 'El total no incluye ' : 'Tu pedido tiene '}
        <strong className="text-foreground">{unpriced === 1 ? '1 producto' : `${unpriced} productos`} con precio a consultar</strong>
        : te lo confirmamos por WhatsApp.
      </p>
    ) : null;
  if (!(total > 0)) return unpricedNote;
  return (
    <div className="flex flex-col gap-2 text-sm">
      {unpricedNote}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-semibold text-brand-ink">
          <Money weight="duotone" className="h-4 w-4" /> Efectivo ({PAYMENT.cashDiscountPct}% OFF)
        </span>
        <span className="font-heading text-lg font-bold">{formatPriceARS(t.cash)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium text-foreground/80">
          <Bank weight="duotone" className="h-4 w-4" /> Transferencia ({PAYMENT.transferDiscountPct}% OFF)
        </span>
        <span className="font-semibold">{formatPriceARS(t.transfer)}</span>
      </div>
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="font-medium">Precio de lista</span>
        <span className="font-semibold">{formatPriceARS(t.list)}</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 font-semibold text-brand-ink">
        <CreditCard weight="duotone" className="h-4 w-4 shrink-0" />
        <span>
          {PAYMENT.installments} cuotas sin interés de <strong>{formatPriceARS(t.installment)}</strong>
        </span>
      </div>
    </div>
  );
}
