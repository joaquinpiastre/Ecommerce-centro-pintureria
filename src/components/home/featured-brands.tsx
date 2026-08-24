export function FeaturedBrands({ brands }: { brands: string[] }) {
  if (brands.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Trabajamos con las mejores marcas
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {brands.map((b) => (
          <span key={b} className="font-heading text-lg font-bold text-foreground/50 transition-colors hover:text-foreground/80 sm:text-xl">
            {b}
          </span>
        ))}
      </div>
    </section>
  );
}
