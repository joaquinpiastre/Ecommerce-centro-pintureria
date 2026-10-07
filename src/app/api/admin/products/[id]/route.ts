import { NextResponse } from 'next/server';
import { getAdminProductById } from '@/lib/data';
import { setOverride, getOverride, type ProductOverride } from '@/lib/overrides';
import { syncAfterProductChange } from '@/lib/admin-sync';
import { CATEGORIES_META } from '@/lib/categories-meta';

interface EditBody {
  name?: string;
  brand?: string | null;
  categorySlug?: string;
  subcategory?: string | null;
  isOffer?: boolean;
  description?: string | null;
  hidden?: boolean;
  variantPrices?: Record<string, number>;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = getAdminProductById(id);
  if (!existing) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });

  const body = (await request.json().catch(() => null)) as EditBody | null;
  if (!body) return NextResponse.json({ error: 'Body inválido' }, { status: 400 });

  const patch: Partial<ProductOverride> = {};
  if (typeof body.name === 'string' && body.name.trim()) patch.name = body.name.trim();
  if (body.brand !== undefined) patch.brand = body.brand?.trim() || null;
  if (typeof body.subcategory !== 'undefined') patch.subcategory = body.subcategory?.trim() || null;
  if (body.description !== undefined) patch.description = typeof body.description === 'string' ? body.description.trim() || null : null;
  if (typeof body.isOffer === 'boolean') patch.isOffer = body.isOffer;
  if (typeof body.hidden === 'boolean') patch.hidden = body.hidden;
  if (body.variantPrices && typeof body.variantPrices === 'object') {
    const cleaned: Record<string, number> = {};
    for (const [codigo, price] of Object.entries(body.variantPrices)) {
      const n = Number(price);
      if (existing.allCodigos.includes(codigo) && Number.isFinite(n) && n >= 0) cleaned[codigo] = n;
    }
    if (Object.keys(cleaned).length) {
      patch.variantPrices = { ...getOverride(id)?.variantPrices, ...cleaned };
    }
  }
  if (body.categorySlug && body.categorySlug !== existing.categorySlug) {
    const meta = CATEGORIES_META.find((c) => c.slug === body.categorySlug);
    if (!meta) return NextResponse.json({ error: 'Categoría inválida' }, { status: 400 });
    patch.category = meta.label;
    patch.categorySlug = meta.slug;
  }

  const previousCategorySlug = existing.categorySlug;
  setOverride(id, patch);
  const updated = getAdminProductById(id);
  if (updated) syncAfterProductChange(updated, previousCategorySlug);

  return NextResponse.json({ ok: true, product: updated });
}

/** Ocultar (borrado suave, reversible) — no borra el producto del CSV ni del historial. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = getAdminProductById(id);
  if (!existing) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });

  setOverride(id, { hidden: true });
  const updated = getAdminProductById(id);
  if (updated) syncAfterProductChange(updated, existing.categorySlug);

  return NextResponse.json({ ok: true });
}
