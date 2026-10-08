'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Menu, X, ChevronDown, MapPin, Home, Mail } from 'lucide-react';
import type { Category } from '@/lib/types';
import { useCartCount, useCartStore } from '@/store/cart';
import { SearchDialog } from '@/components/search/search-dialog';
import { getCategoryIcon } from '@/lib/icons';
import { useMounted } from '@/lib/use-mounted';
import { SITE } from '../../../config/site';

export function Header({ categories }: { categories: Category[] }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const count = useCartCount();
  const mounted = useMounted();
  const openCart = useCartStore((s) => s.open);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const navCategories = categories.slice(0, 5);

  return (
    <>
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
        {/* Fila principal: logo, buscador, ubicación y carrito */}
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-5 sm:px-6 lg:h-[72px] lg:px-8">
          <button
            className="-ml-2 rounded-lg p-2 text-primary-foreground lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* El logo grande tiene el mismo verde de fondo que el encabezado: se recorta al logotipo para que se funda. */}
          <Link
            href="/"
            role="img"
            aria-label={SITE.name}
            className="block h-[56px] w-[158px] shrink-0 bg-[url(/logo-del-centro.jpg)] bg-[length:210px_210px] bg-[position:-21px_-76px] bg-no-repeat lg:h-[64px] lg:w-[176px] lg:bg-[length:234px_234px] lg:bg-[position:-24px_-82px]"
          />

          <button
            onClick={() => setSearchOpen(true)}
            className="hidden h-11 flex-1 items-center gap-2 rounded-full bg-white px-4 text-sm text-muted-foreground shadow-inner transition-colors hover:bg-white/95 sm:flex"
            aria-label="Buscar productos"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="truncate">¿Qué estás buscando?</span>
          </button>

          <div className="ml-auto flex items-center gap-1 sm:ml-0 sm:gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/15 sm:hidden"
              aria-label="Buscar productos"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              href="/contacto"
              className="hidden items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold hover:bg-white/15 lg:flex"
            >
              <MapPin className="h-4.5 w-4.5" /> Dónde estamos
            </Link>
            <button
              onClick={openCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/15"
              aria-label="Abrir carrito"
            >
              <ShoppingCart className="h-5 w-5" />
              <AnimatePresence>
                {mounted && count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold text-brand-ink"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Fila de navegación — escritorio */}
        <div className="hidden border-t border-white/20 lg:block">
          <nav className="mx-auto flex h-11 max-w-7xl items-center gap-1 px-8" ref={menuRef}>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-colors hover:bg-white/15"
                aria-expanded={menuOpen}
              >
                <Menu className="h-4 w-4" />
                Categorías
                <ChevronDown className={`h-4 w-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full z-50 mt-1 w-[640px] rounded-2xl border border-border bg-popover p-4 text-foreground shadow-xl"
                  >
                    <div className="grid grid-cols-2 gap-1">
                      {categories.map((c) => {
                        const Icon = getCategoryIcon(c.icon);
                        return (
                          <Link
                            key={c.slug}
                            href={`/categoria/${c.slug}`}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/90 transition-colors hover:bg-muted"
                          >
                            <span
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                              style={{ background: c.accent }}
                            >
                              <Icon className="h-4.5 w-4.5" />
                            </span>
                            <span className="min-w-0 flex-1 truncate">{c.label}</span>
                            <span className="shrink-0 text-xs text-muted-foreground">{c.count}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {navCategories.map((c) => (
              <Link
                key={c.slug}
                href={`/categoria/${c.slug}`}
                className="rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-white/15"
              >
                {c.label}
              </Link>
            ))}

            <Link href="/contacto" className="ml-auto rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-white/15">
              Contacto
            </Link>
          </nav>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <MobileMenu categories={categories} open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

function MobileMenu({ categories, open, onClose }: { categories: Category[]; open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[85%] max-w-xs flex-col bg-background p-5 lg:hidden"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="font-heading text-lg font-bold">Menú</span>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-muted" aria-label="Cerrar menú">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 overflow-y-auto">
              <Link href="/" onClick={onClose} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-muted">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
                  <Home className="h-4.5 w-4.5" />
                </span>
                Inicio
              </Link>

              <p className="mb-1 mt-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Categorías</p>
              {categories.map((c) => {
                const Icon = getCategoryIcon(c.icon);
                return (
                  <Link
                    key={c.slug}
                    href={`/categoria/${c.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-muted"
                  >
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
                      style={{ background: c.accent }}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    {c.label}
                    <span className="ml-auto text-xs text-muted-foreground">{c.count}</span>
                  </Link>
                );
              })}

              <p className="mb-1 mt-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ayuda</p>
              <Link href="/contacto" onClick={onClose} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-muted">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                Contacto y ubicación
              </Link>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
