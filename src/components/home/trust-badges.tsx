import { Award, Warehouse, CreditCard, Store } from 'lucide-react';
import { SITE } from '../../../config/site';

const ICONS = [Award, Warehouse, CreditCard, Store];

export function TrustBadges() {
  return (
    <section className="border-y border-border bg-cream">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
        {SITE.differentiators.map((d, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <div key={d} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium leading-snug">{d}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
