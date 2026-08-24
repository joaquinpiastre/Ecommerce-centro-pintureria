import Link from 'next/link';
import { Search, Pencil } from 'lucide-react';
import { getAllProductsAdmin } from '@/lib/data';
import { CATEGORIES_META } from '@/lib/categories-meta';
import { ProductRowActions } from '@/components/admin/product-row-actions';
import { ProductImage } from '@/components/product/product-image';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 30;

interface SearchParams {
  q?: string;
  category?: string;
  hidden?: string;
  price?: string;
  offer?: string;
  edited?: string;
  page?: string;
}

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const all = getAllProductsAdmin();

  const showHidden = sp.hidden === '1';
  let list = all.filter((p) => p.hidden === showHidden);

  if (sp.q) {
    const q = sp.q.toLowerCase();
    list = list.filter(
      (p) => p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) || p.allCodigos.some((c) => c.includes(q))
    );
  }
  if (sp.category) list = list.filter((p) => p.categorySlug === sp.category);
  if (sp.price === '0') list = list.filter((p) => !p.hasAnyPrice);
  if (sp.offer === '1') list = list.filter((p) => p.isOffer);
  if (sp.edited === '1') list = list.filter((p) => p.hasOverride);

  const total = list.length;
  const page = Math.max(1, Number(sp.page) || 1);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageItems = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function pageHref(overrides: Partial<SearchParams>) {
    const params = new URLSearchParams();
    const merged = { ...sp, ...overrides };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, String(v));
    const qs = params.toString();
    return `/admin/productos${qs ? `?${qs}` : ''}`;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total} resultado{total === 1 ? '' : 's'}</p>
        </div>
      </div>

      <form className="flex flex-wrap items-center gap-2" action="/admin/productos">
        {showHidden && <input type="hidden" name="hidden" value="1" />}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            name="q"
            defaultValue={sp.q}
            placeholder="Buscar por nombre, marca o código…"
            className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <select name="category" defaultValue={sp.category ?? ''} className="h-10 rounded-xl border border-border bg-background px-3 text-sm">
          <option value="">Todas las categorías</option>
          {CATEGORIES_META.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
        <button type="submit" className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">
          Filtrar
        </button>
      </form>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link href={pageHref({ hidden: undefined, page: undefined })} className={`rounded-full px-3 py-1.5 ${!showHidden ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          Activos
        </Link>
        <Link href={pageHref({ hidden: '1', page: undefined })} className={`rounded-full px-3 py-1.5 ${showHidden ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          Ocultos
        </Link>
        <Link href={pageHref({ offer: sp.offer === '1' ? undefined : '1', page: undefined })} className={`rounded-full px-3 py-1.5 ${sp.offer === '1' ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'}`}>
          En oferta
        </Link>
        <Link href={pageHref({ price: sp.price === '0' ? undefined : '0', page: undefined })} className={`rounded-full px-3 py-1.5 ${sp.price === '0' ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'}`}>
          Sin precio
        </Link>
        <Link href={pageHref({ edited: sp.edited === '1' ? undefined : '1', page: undefined })} className={`rounded-full px-3 py-1.5 ${sp.edited === '1' ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'}`}>
          Editados
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-background">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium">Precio</th>
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageItems.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    <Link href={`/admin/productos/${p.id}`} className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                        <ProductImage image={p.image} brandSlug={p.brandSlug} categorySlug={p.categorySlug} name={p.name} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{p.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{p.brand ?? 'Sin marca'}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-2.5">{p.hasAnyPrice ? p.variants[0].priceDisplay : <span className="text-muted-foreground">Consultar</span>}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.codigo}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/productos/${p.id}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted" title="Editar">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <ProductRowActions id={p.id} hidden={p.hidden} hasOverride={p.hasOverride} />
                    </div>
                  </td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No hay productos que coincidan con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <Link
            href={pageHref({ page: String(Math.max(1, page - 1)) })}
            aria-disabled={page <= 1}
            className={`rounded-lg border border-border px-3 py-1.5 ${page <= 1 ? 'pointer-events-none opacity-40' : 'hover:bg-muted'}`}
          >
            Anterior
          </Link>
          <span className="text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Link
            href={pageHref({ page: String(Math.min(totalPages, page + 1)) })}
            aria-disabled={page >= totalPages}
            className={`rounded-lg border border-border px-3 py-1.5 ${page >= totalPages ? 'pointer-events-none opacity-40' : 'hover:bg-muted'}`}
          >
            Siguiente
          </Link>
        </div>
      )}
    </div>
  );
}
