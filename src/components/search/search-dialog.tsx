'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';
import { Search, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ProductImage } from '@/components/product/product-image';

interface SearchItem {
  id: string;
  codigo: string;
  name: string;
  brand: string | null;
  category: string;
  categorySlug: string;
  priceDisplay: string;
  image: string | null;
  codes: string;
}

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const loading = open && items === null;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || items !== null) return;
    let cancelled = false;
    fetch('/search-index.json')
      .then((r) => r.json())
      .then((data: SearchItem[]) => {
        if (!cancelled) setItems(data);
      });
    return () => {
      cancelled = true;
    };
  }, [open, items]);

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetea el input al cerrar, no derivable del render
      setQuery('');
      return;
    }
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  const fuse = useMemo(() => {
    if (!items) return null;
    return new Fuse(items, {
      keys: [
        { name: 'name', weight: 2 },
        { name: 'brand', weight: 1 },
        { name: 'codes', weight: 1.5 },
      ],
      threshold: 0.32,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, [items]);

  const results = useMemo(() => {
    if (!fuse || query.trim().length < 2) return [];
    return fuse.search(query.trim(), { limit: 20 }).map((r) => r.item);
  }, [fuse, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="top-[8%] max-w-2xl translate-y-0 gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <DialogTitle className="sr-only">Buscar productos</DialogTitle>
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscá por nombre, código o marca…"
            className="h-10 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
            aria-label="Cerrar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.trim().length >= 2 && results.length === 0 && !loading && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No encontramos productos para &ldquo;{query}&rdquo;. Probá con otra palabra o el código.
            </p>
          )}
          {query.trim().length < 2 && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              Escribí al menos 2 letras para buscar en todo el catálogo.
            </p>
          )}
          <ul className="flex flex-col">
            {results.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/producto/${item.codigo}`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                    <ProductImage image={item.image} brandSlug={null} categorySlug={item.categorySlug} name={item.name} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.brand ? `${item.brand} · ` : ''}
                      {item.category}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-primary">{item.priceDisplay}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
