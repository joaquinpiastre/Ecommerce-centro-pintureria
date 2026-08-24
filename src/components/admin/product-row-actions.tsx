'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, RotateCcw, Loader2 } from 'lucide-react';

export function ProductRowActions({ id, hidden, hasOverride }: { id: string; hidden: boolean; hasOverride: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<'hide' | 'restore' | null>(null);

  function toggleHidden() {
    setBusy('hide');
    const req = hidden
      ? fetch(`/api/admin/products/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hidden: false }),
        })
      : fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    req.then(() => {
      setBusy(null);
      startTransition(() => router.refresh());
    });
  }

  function restoreOriginal() {
    if (!confirm('¿Descartar todas tus ediciones sobre este producto (precio, nombre, categoría, foto, oculto) y volver al original del CSV?')) return;
    setBusy('restore');
    fetch(`/api/admin/products/${id}/restore`, { method: 'POST' }).then(() => {
      setBusy(null);
      startTransition(() => router.refresh());
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={toggleHidden}
        disabled={busy !== null || pending}
        title={hidden ? 'Mostrar en el catálogo' : 'Ocultar del catálogo'}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-50"
      >
        {busy === 'hide' ? <Loader2 className="h-4 w-4 animate-spin" /> : hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>
      {hasOverride && (
        <button
          onClick={restoreOriginal}
          disabled={busy !== null || pending}
          title="Restaurar al original del CSV"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-50"
        >
          {busy === 'restore' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}
