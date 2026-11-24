import Link from 'next/link';
import Image from 'next/image';
import type { SubcategoryTile } from '@/lib/types';

/**
 * Rubros (subcategorías de la lista de productos) como círculos con la foto de un
 * producto del rubro; si ninguno tiene foto todavía, la foto de portada de su
 * categoría. Cada uno abre su categoría ya filtrada por ese rubro.
 */
export function CategoryGrid({ tiles }: { tiles: SubcategoryTile[] }) {
  if (tiles.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h2 className="mb-6 text-center font-heading text-xl font-bold sm:text-2xl">Explorá por rubro</h2>

      {/* Celular: fila deslizable. Desde tablet: se acomodan en varias filas centradas. */}
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory justify-start gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-6 sm:overflow-visible sm:px-0">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className="group flex w-24 shrink-0 snap-start flex-col items-center gap-2 sm:w-28">
            <span className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-white shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary group-hover:shadow-md sm:h-24 sm:w-24">
              {t.image ? (
                <Image src={t.image} alt="" fill sizes="96px" className="object-contain p-2.5" />
              ) : (
                <Image src={t.cover} alt="" fill sizes="96px" className="object-cover" />
              )}
            </span>
            <span className="text-center text-xs font-semibold leading-tight text-foreground sm:text-sm">{t.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
