import { SealPercent, Storefront, WhatsappLogo } from '@/components/icons';
import { PAYMENT, SITE } from '../../../config/site';

/** Franja de beneficios debajo de la tarjeta de medios de pago (las cuotas ya están ahí arriba). */
export function InfoStrip() {
  const items = [
    { icon: SealPercent, strong: `${PAYMENT.cashDiscountPct}% OFF EN EFECTIVO`, text: `y ${PAYMENT.transferDiscountPct}% por transferencia` },
    { icon: Storefront, strong: 'RETIRÁ GRATIS', text: `en el local · ${SITE.address.split(',')[0]}` },
    { icon: WhatsappLogo, strong: 'PEDÍ POR WHATSAPP', text: 'te confirmamos stock y precio' },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {items.map((it) => (
          <div key={it.strong} className="flex items-center gap-3 rounded-2xl border border-border bg-cream px-4 py-3 text-sm">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-brand-ink">
              <it.icon weight="duotone" className="h-6 w-6" />
            </span>
            <span>
              <strong className="font-bold text-brand-ink">{it.strong}</strong> <span className="text-muted-foreground">{it.text}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
