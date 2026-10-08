import Link from 'next/link';
import { ArrowRight, Banknote, CreditCard, Landmark } from 'lucide-react';
import { PAYMENT } from '../../../config/site';

const TILES = [
  {
    icon: CreditCard,
    big: String(PAYMENT.installments),
    small: 'cuotas sin interés',
    note: `Con ${PAYMENT.cardsLabel}`,
  },
  {
    icon: Banknote,
    big: `${PAYMENT.cashDiscountPct}%`,
    small: 'de descuento',
    note: 'Pagando en efectivo',
  },
  {
    icon: Landmark,
    big: `${PAYMENT.transferDiscountPct}%`,
    small: 'de descuento',
    note: 'Pagando por transferencia',
  },
];

/** Banner principal: las condiciones de pago, igual que los bancos en el banner de Rex. */
export function Hero() {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-12 lg:px-8 lg:py-14">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-white/85">Del Centro Pinturerías · San Rafael</p>
          <h1 className="mt-3 font-heading text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Aprovechá <span className="block">las mejores condiciones de pago</span>
          </h1>
          <p className="mt-4 max-w-md text-base text-white/90">
            Elegí tu producto, sumalo al carrito y coordiná el pedido por WhatsApp. Retiro en el local.
          </p>
          <Link
            href="/categoria/pinturas"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-brand-ink shadow-lg shadow-black/10 transition-transform hover:scale-105"
          >
            Ver catálogo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TILES.map((t) => (
            <div key={t.note} className="flex flex-col items-center justify-center rounded-2xl bg-white px-4 py-6 text-center text-foreground shadow-lg shadow-black/10">
              <t.icon className="mb-2 h-6 w-6 text-brand-ink" />
              <span className="font-heading text-5xl font-bold leading-none text-brand-ink">{t.big}</span>
              <span className="mt-1 text-sm font-bold uppercase tracking-wide">{t.small}</span>
              <span className="mt-2 text-xs text-muted-foreground">{t.note}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
