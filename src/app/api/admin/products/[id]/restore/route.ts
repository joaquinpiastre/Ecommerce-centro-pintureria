import { NextResponse } from 'next/server';
import { getAdminProductById } from '@/lib/data';
import { clearOverride } from '@/lib/overrides';
import { syncAfterProductChange } from '@/lib/admin-sync';

/** Descarta todas las ediciones de admin sobre este producto (precio, nombre, categoría,
 * foto, oculto) y lo vuelve a dejar tal cual sale del CSV. */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = getAdminProductById(id);
  if (!existing) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });

  clearOverride(id);
  const updated = getAdminProductById(id);
  if (updated) syncAfterProductChange(updated, existing.categorySlug);

  return NextResponse.json({ ok: true, product: updated });
}
