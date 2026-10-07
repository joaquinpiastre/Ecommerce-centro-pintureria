'use client';

import { useMemo, useState } from 'react';
import { SlidersHorizontal, X, PackageSearch } from 'lucide-react';
import type { Category, Product } from '@/lib/types';
import { ProductCard } from '@/components/product/product-card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { formatPriceARS } from '@/lib/format';

type SortKey = 'relevancia' | 'precio-asc' | 'precio-desc' | 'alfabetico';

const PAGE_SIZE = 24;

export function CategoryBrowser({ category, products }: { category: Category; products: Product[] }) {
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [brand, setBrand] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(category.priceMax);
  const [sort, setSort] = useState<SortKey>('relevancia');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = products;
    if (subcategory) list = list.filter((p) => p.subcategory === subcategory);
    if (brand) list = list.filter((p) => p.brandSlug === brand);
    if (maxPrice < category.priceMax) list = list.filter((p) => !p.hasAnyPrice || p.priceMin <= maxPrice);

    const sorted = [...list];
    if (sort === 'precio-asc') sorted.sort((a, b) => (a.priceMin || Infinity) - (b.priceMin || Infinity));
    else if (sort === 'precio-desc') sorted.sort((a, b) => b.priceMin - a.priceMin);
    else if (sort === 'alfabetico') sorted.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    else sorted.sort((a, b) => Number(b.isOffer) - Number(a.isOffer));
    return sorted;
  }, [products, subcategory, brand, maxPrice, sort, category.priceMax]);

  const visibleProducts = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;
  const activeFilterCount = (subcategory ? 1 : 0) + (brand ? 1 : 0) + (maxPrice < category.priceMax ? 1 : 0);

  function resetFilters() {
    setSubcategory(null);
    setBrand(null);
    setMaxPrice(category.priceMax);
    setVisible(PAGE_SIZE);
  }

  const filtersPanel = (
    <FiltersPanel
      category={category}
      subcategory={subcategory}
      setSubcategory={(v) => { setSubcategory(v); setVisible(PAGE_SIZE); }}
      brand={brand}
      setBrand={(v) => { setBrand(v); setVisible(PAGE_SIZE); }}
      maxPrice={maxPrice}
      setMaxPrice={(v) => { setMaxPrice(v); setVisible(PAGE_SIZE); }}
      onReset={resetFilters}
    />
  );

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-24">{filtersPanel}</div>
      </aside>

      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
              aria-label="Ordenar por"
            >
              <option value="relevancia">Relevancia</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="alfabetico">Alfabético</option>
            </select>
          </div>
        </div>

        {visibleProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
            <PackageSearch className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No hay productos con esos filtros</p>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {visibleProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 4} />
              ))}
            </div>
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                  Cargar más productos
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl">
          <SheetHeader className="flex-row items-center justify-between border-b">
            <SheetTitle>Filtros</SheetTitle>
            <button onClick={() => setMobileFiltersOpen(false)} className="rounded-full p-1.5 hover:bg-muted" aria-label="Cerrar filtros">
              <X className="h-4 w-4" />
            </button>
          </SheetHeader>
          <div className="overflow-y-auto px-4 pb-4">{filtersPanel}</div>
          <div className="border-t p-4">
            <Button className="w-full" onClick={() => setMobileFiltersOpen(false)}>
              Ver {filtered.length} productos
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FiltersPanel({
  category,
  subcategory,
  setSubcategory,
  brand,
  setBrand,
  maxPrice,
  setMaxPrice,
  onReset,
}: {
  category: Category;
  subcategory: string | null;
  setSubcategory: (v: string | null) => void;
  brand: string | null;
  setBrand: (v: string | null) => void;
  maxPrice: number;
  setMaxPrice: (v: number) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      {category.subcategories.length > 1 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Subcategoría</h3>
          <div className="flex flex-col gap-1">
            <FilterRadio label="Todas" active={!subcategory} onClick={() => setSubcategory(null)} />
            {category.subcategories.map((s) => (
              <FilterRadio key={s.slug} label={s.label} count={s.count} active={subcategory === s.label} onClick={() => setSubcategory(s.label)} />
            ))}
          </div>
        </div>
      )}

      {category.brands.length > 1 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Marca</h3>
          <div className="flex flex-col gap-1">
            <FilterRadio label="Todas" active={!brand} onClick={() => setBrand(null)} />
            {category.brands.slice(0, 12).map((b) => (
              <FilterRadio key={b.slug} label={b.label} count={b.count} active={brand === b.slug} onClick={() => setBrand(b.slug)} />
            ))}
          </div>
        </div>
      )}

      {category.priceMax > category.priceMin && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Precio máximo</h3>
          <input
            type="range"
            min={category.priceMin}
            max={category.priceMax}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <p className="mt-1 text-xs text-muted-foreground">Hasta {formatPriceARS(maxPrice)}</p>
        </div>
      )}

      <Button variant="ghost" size="sm" onClick={onReset} className="self-start text-muted-foreground">
        Limpiar filtros
      </Button>
    </div>
  );
}

function FilterRadio({ label, count, active, onClick }: { label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
        active ? 'bg-primary/10 font-medium text-brand-ink' : 'text-foreground/80 hover:bg-muted'
      }`}
    >
      <span className="truncate">{label}</span>
      {count !== undefined && <span className="ml-2 shrink-0 text-xs text-muted-foreground">{count}</span>}
    </button>
  );
}
