import Link from 'next/link';
import type { Category } from '@/lib/types';
import { getCategoryIcon } from '@/lib/icons';

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">Explorá por categoría</h2>
          <p className="mt-1 text-muted-foreground">Todo lo que necesitás para tu próximo proyecto.</p>
        </div>
      </div>

      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:gap-4 sm:px-0">
        {categories.map((c) => {
          const Icon = getCategoryIcon(c.icon);
          return (
            <Link
              key={c.slug}
              href={`/categoria/${c.slug}`}
              className="group flex w-24 shrink-0 snap-start flex-col items-center gap-2 sm:w-28"
            >
              <span
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-md sm:h-20 sm:w-20"
                style={{ background: c.accent }}
              >
                <Icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.75} />
              </span>
              <span className="text-center text-xs font-semibold leading-tight text-foreground sm:text-sm">{c.label}</span>
              <span className="text-[11px] text-muted-foreground">{c.count} prod.</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
