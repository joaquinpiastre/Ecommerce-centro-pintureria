import { CreditCard, Handshake, Storefront, Warehouse } from '@/components/icons';
import { SITE } from '../../../config/site';

// Un ícono por cada diferencial de config/site.ts, en el mismo orden.
const ICONS = [Handshake, Warehouse, CreditCard, Storefront];

export function TrustBadges() {
  return (
    <section className="border-y border-border bg-cream">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
        {SITE.differentiators.map((d, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <div key={d} className="flex items-center gap-3">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-background text-brand-ink shadow-sm ring-1 ring-border">
                <Icon weight="duotone" className="h-8 w-8" />
              </span>
              <span className="text-sm font-semibold leading-snug">{d}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
