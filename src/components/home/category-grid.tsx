import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@/lib/types';
import { getCategoryIcon } from '@/lib/icons';

/** Categorías como círculos con la foto de un producto de la categoría (o el ícono si no hay foto). */
export function CategoryGrid({ categories, images }: { categories: Category[]; images: Record<string, string> }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h2 className="mb-6 text-center font-heading text-xl font-bold sm:text-2xl">Explorá por categoría</h2>

      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory justify-start gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:justify-center sm:gap-6 sm:px-0">
        {categories.map((c) => {
          const Icon = getCategoryIcon(c.icon);
          const img = images[c.slug];
          return (
            <Link key={c.slug} href={`/categoria/${c.slug}`} className="group flex w-24 shrink-0 snap-start flex-col items-center gap-2 sm:w-28">
              <span
                className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-white text-white shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary group-hover:shadow-md sm:h-24 sm:w-24"
                style={img ? undefined : { background: c.accent }}
              >
                {img ? (
                  <Image src={img} alt="" fill sizes="96px" className="object-cover" />
                ) : (
                  <Icon className="h-8 w-8" strokeWidth={1.75} />
                )}
              </span>
              <span className="text-center text-xs font-semibold leading-tight text-foreground sm:text-sm">{c.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
