import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Clock, CreditCard, Banknote, Landmark } from 'lucide-react';
import { PAYMENT, SITE } from '../../../config/site';
import type { Category } from '@/lib/types';
import { InstagramIcon } from '@/components/icons/instagram-icon';

export function Footer({ categories }: { categories: Category[] }) {
  return (
    <footer className="border-t border-border bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Image src="/logo-icon.png" alt="" width={40} height={40} className="h-9 w-9 rounded-lg" />
              <span className="font-heading text-base font-bold leading-tight">{SITE.shortName}</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{SITE.tagline}.</p>
            <a
              href={SITE.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <InstagramIcon className="h-4 w-4" /> {SITE.instagram}
            </a>
          </div>

          <div>
            <h3 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wide text-foreground/80">
              Categorías
            </h3>
            <ul className="flex flex-col gap-2">
              {categories.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link href={`/categoria/${c.slug}`} className="text-sm text-muted-foreground hover:text-foreground">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wide text-foreground/80">
              Visitanos
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{SITE.address}</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{SITE.phone}</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {SITE.hours.map((h) => (
                    <span key={h.days} className="block">
                      {h.days}: {h.time}
                    </span>
                  ))}
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wide text-foreground/80">
              Ayuda
            </h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/contacto" className="text-sm text-muted-foreground hover:text-foreground">
                  Contacto y ubicación
                </Link>
              </li>
              <li>
                <Link href="/carrito" className="text-sm text-muted-foreground hover:text-foreground">
                  Mi carrito
                </Link>
              </li>
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground/80">{SITE.priceDisclaimer}</p>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-background p-5">
          <h3 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wide text-foreground/80">Medios de pago</h3>
          <ul className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <li className="flex items-center gap-2.5">
              <CreditCard className="h-5 w-5 shrink-0 text-brand-ink" />
              <span>
                <strong>{PAYMENT.installments} cuotas sin interés</strong>
                <span className="block text-xs text-muted-foreground">con {PAYMENT.cardsLabel}</span>
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <Banknote className="h-5 w-5 shrink-0 text-brand-ink" />
              <span>
                <strong>{PAYMENT.cashDiscountPct}% de descuento</strong>
                <span className="block text-xs text-muted-foreground">pagando en efectivo</span>
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <Landmark className="h-5 w-5 shrink-0 text-brand-ink" />
              <span>
                <strong>{PAYMENT.transferDiscountPct}% de descuento</strong>
                <span className="block text-xs text-muted-foreground">pagando por transferencia</span>
              </span>
            </li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">Los descuentos se calculan sobre el precio de lista.</p>
        </div>

        <div className="mt-6 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {SITE.name}. Retiro en local — {SITE.address}.
        </div>
      </div>
    </footer>
  );
}
