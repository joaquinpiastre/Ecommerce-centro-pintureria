'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, LogOut, ExternalLink, Menu, X } from 'lucide-react';
import { SITE } from '../../../config/site';

const NAV = [
  { href: '/admin', label: 'Panel', icon: LayoutDashboard, exact: true },
  { href: '/admin/productos', label: 'Productos', icon: Package, exact: false },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === '/admin/login') return <>{children}</>;

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-background lg:flex">
        <SidebarContent pathname={pathname} onLogout={handleLogout} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex w-64 flex-col bg-background">
            <SidebarContent pathname={pathname} onLogout={handleLogout} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-border bg-background px-4 lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 hover:bg-muted" aria-label="Abrir menú">
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-heading text-sm font-bold">Admin — {SITE.shortName}</span>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({ pathname, onLogout, onNavigate }: { pathname: string; onLogout: () => void; onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <p className="font-heading text-base font-bold leading-tight">Admin</p>
          <p className="text-xs text-muted-foreground">{SITE.shortName}</p>
        </div>
        <button className="rounded-lg p-1.5 hover:bg-muted lg:hidden" onClick={onNavigate} aria-label="Cerrar menú">
          <X className="h-4 w-4" />
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? 'bg-primary text-primary-foreground' : 'text-foreground/80 hover:bg-muted'
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex flex-col gap-1 border-t border-border p-3">
        <Link href="/" target="_blank" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted">
          <ExternalLink className="h-4.5 w-4.5" /> Ver el sitio
        </Link>
        <button onClick={onLogout} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-destructive hover:bg-destructive/10">
          <LogOut className="h-4.5 w-4.5" /> Cerrar sesión
        </button>
      </div>
    </>
  );
}
