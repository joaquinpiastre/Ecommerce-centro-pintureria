import Link from 'next/link';
import { Package, EyeOff, ImageOff, CircleDollarSign, Tag, Pencil, Layers, TrendingUp } from 'lucide-react';
import { getAdminStats } from '@/lib/admin-stats';
import { formatPriceARS } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  const stats = getAdminStats();

  const tiles = [
    { label: 'Productos activos', value: stats.total, icon: Package, href: '/admin/productos' },
    { label: 'Ocultos', value: stats.hiddenCount, icon: EyeOff, href: '/admin/productos?hidden=1' },
    { label: 'Sin foto real', value: stats.withoutPhoto, icon: ImageOff, href: '/admin/productos?photo=0' },
    { label: 'Sin precio', value: stats.withoutPrice, icon: CircleDollarSign, href: '/admin/productos?price=0' },
    { label: 'En oferta', value: stats.offers, icon: Tag, href: '/admin/productos?offer=1' },
    { label: 'Editados por vos', value: stats.edited, icon: Pencil, href: '/admin/productos?edited=1' },
    { label: 'Marcas distintas', value: stats.brandCount, icon: Layers, href: null },
    { label: 'Precio promedio', value: formatPriceARS(stats.avgPrice), icon: TrendingUp, href: null },
  ];

  const maxCat = Math.max(...stats.byCategory.map((c) => c.count), 1);
  const maxBrand = Math.max(...stats.topBrands.map(([, c]) => c), 1);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Panel</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Estado del catálogo en vivo. Valor estimado del stock (suma de precio mínimo de cada producto activo):{' '}
          <span className="font-semibold text-foreground">{formatPriceARS(stats.totalCatalogValue)}</span>.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {tiles.map((t) => {
          const Icon = t.icon;
          const content = (
            <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-background p-4 transition-colors hover:border-primary/40">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-brand-ink">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <div className="mt-4">
                <p className="font-heading text-2xl font-bold">{t.value}</p>
                <p className="text-xs text-muted-foreground">{t.label}</p>
              </div>
            </div>
          );
          return t.href ? (
            <Link key={t.label} href={t.href}>
              {content}
            </Link>
          ) : (
            <div key={t.label}>{content}</div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background p-5">
          <h2 className="mb-4 font-heading text-base font-bold">Productos por categoría</h2>
          <div className="flex flex-col gap-2.5">
            {stats.byCategory.map((c) => (
              <Link key={c.slug} href={`/admin/productos?category=${c.slug}`} className="group flex items-center gap-3 text-sm">
                <span className="w-40 shrink-0 truncate text-foreground/80 group-hover:text-foreground">{c.label}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <span className="block h-full rounded-full" style={{ width: `${(c.count / maxCat) * 100}%`, background: c.accent }} />
                </span>
                <span className="w-8 shrink-0 text-right text-xs text-muted-foreground">{c.count}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5">
          <h2 className="mb-4 font-heading text-base font-bold">Marcas con más productos</h2>
          <div className="flex flex-col gap-2.5">
            {stats.topBrands.map(([brand, count]) => (
              <Link key={brand} href={`/admin/productos?q=${encodeURIComponent(brand)}`} className="group flex items-center gap-3 text-sm">
                <span className="w-32 shrink-0 truncate text-foreground/80 group-hover:text-foreground">{brand}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <span className="block h-full rounded-full bg-primary" style={{ width: `${(count / maxBrand) * 100}%` }} />
                </span>
                <span className="w-8 shrink-0 text-right text-xs text-muted-foreground">{count}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {stats.recentlyEdited.length > 0 && (
        <div className="rounded-2xl border border-border bg-background p-5">
          <h2 className="mb-4 font-heading text-base font-bold">Editados recientemente</h2>
          <ul className="flex flex-col divide-y divide-border">
            {stats.recentlyEdited.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="truncate">{p.name}</span>
                <Link href={`/admin/productos/${p.id}`} className="shrink-0 text-brand-ink hover:underline">
                  Editar
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
