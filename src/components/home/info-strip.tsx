import { CreditCard, Store, MessageCircle } from 'lucide-react';
import { PAYMENT, SITE } from '../../../config/site';

export function InfoStrip() {
  const items = [
    { icon: CreditCard, strong: `${PAYMENT.installments} CUOTAS SIN INTERÉS`, text: `con ${PAYMENT.cardsLabel}` },
    { icon: Store, strong: 'RETIRÁ GRATIS', text: `en el local · ${SITE.address.split(',')[0]}` },
    { icon: MessageCircle, strong: 'PEDÍ POR WHATSAPP', text: 'te confirmamos stock y precio' },
  ];
  return (
    <section className="border-b border-border bg-cream">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-4 py-4 sm:px-6 md:grid-cols-3 lg:px-8">
        {items.map((it) => (
          <div key={it.strong} className="flex items-center justify-center gap-3 text-sm">
            <it.icon className="h-6 w-6 shrink-0 text-brand-ink" />
            <span>
              <strong className="font-bold text-brand-ink">{it.strong}</strong> <span className="text-muted-foreground">{it.text}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
