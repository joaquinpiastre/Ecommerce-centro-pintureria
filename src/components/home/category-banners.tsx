import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@/lib/types';

/** Foto ilustrativa de cada categoría (fotos libres de Pexels, guardadas en /public/home). */
const BANNERS: { slug: string; image: string; position?: string }[] = [
  { slug: 'pinturas', image: '/home/pinturas.jpg' },
  { slug: 'automotor', image: '/home/automotor.jpg' },
  { slug: 'accesorios', image: '/home/herramientas.jpg' },
];

/** Tarjetas grandes de categoría con foto, etiqueta y botón "Ver más", como las de la home de Rex. */
export function CategoryBanners({ categories }: { categories: Category[] }) {
  const items = BANNERS.flatMap((b) => {
    const category = categories.find((c) => c.slug === b.slug);
    return category ? [{ ...b, category }] : [];
  });
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map(({ category, image, position }) => (
          <Link
            key={category.slug}
            href={`/categoria/${category.slug}`}
            className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-sm sm:aspect-[1/1.02] lg:aspect-[4/3]"
          >
            <Image
              src={image}
              alt={category.label}
              fill
              sizes="(min-width: 640px) 33vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              style={position ? { objectPosition: position } : undefined}
            />
            <span className="absolute left-0 top-0 max-w-[85%] rounded-br-2xl bg-primary px-5 py-2.5 font-heading text-lg font-semibold leading-tight text-primary-foreground">
              {category.label}
            </span>
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-8 py-2.5 text-sm font-bold uppercase tracking-wide text-brand-ink shadow-md transition-transform group-hover:scale-105 lg:px-10">
              Ver más
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
