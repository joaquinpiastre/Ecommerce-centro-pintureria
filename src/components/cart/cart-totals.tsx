import { Banknote, CreditCard, Landmark } from 'lucide-react';
import { PAYMENT } from '../../../config/site';
import { formatPriceARS } from '@/lib/format';
import { priceBreakdown } from '@/lib/pricing';

/** Total del carrito de las tres maneras (efectivo, transferencia, lista) y la cuota sin interés. */
export function CartTotals({ total }: { total: number }) {
  const t = priceBreakdown(total);
  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-semibold text-brand-ink">
          <Banknote className="h-4 w-4" /> Efectivo ({PAYMENT.cashDiscountPct}% OFF)
        </span>
        <span className="font-heading text-lg font-bold">{formatPriceARS(t.cash)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium text-foreground/80">
          <Landmark className="h-4 w-4" /> Transferencia ({PAYMENT.transferDiscountPct}% OFF)
        </span>
        <span className="font-semibold">{formatPriceARS(t.transfer)}</span>
      </div>
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="font-medium">Precio de lista</span>
        <span className="font-semibold">{formatPriceARS(t.list)}</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 font-semibold text-brand-ink">
        <CreditCard className="h-4 w-4 shrink-0" />
        <span>
          {PAYMENT.installments} cuotas sin interés de <strong>{formatPriceARS(t.installment)}</strong>
        </span>
      </div>
    </div>
  );
}
