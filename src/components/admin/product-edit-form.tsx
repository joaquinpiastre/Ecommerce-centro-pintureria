'use client';

import { useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Eye, EyeOff, RotateCcw, Upload, Loader2, Check } from 'lucide-react';
import type { AdminProduct } from '@/lib/overrides';
import { CATEGORIES_META } from '@/lib/categories-meta';
import { ProductImage } from '@/components/product/product-image';
import { formatPriceARS } from '@/lib/format';

const INPUT_CLASS = 'h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary';

export function ProductEditForm({ product }: { product: AdminProduct }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(product.name);
  const [brand, setBrand] = useState(product.brand ?? '');
  const [categorySlug, setCategorySlug] = useState(product.categorySlug);
  const [subcategory, setSubcategory] = useState(product.subcategory ?? '');
  const [isOffer, setIsOffer] = useState(product.isOffer);
  const [prices, setPrices] = useState<Record<string, string>>(
    Object.fromEntries(product.variants.map((v) => [v.codigo, v.hasPrice ? String(v.price) : '']))
  );
  const [image, setImage] = useState(product.image);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState<'hide' | 'restore' | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const variantPrices: Record<string, number> = {};
    for (const [codigo, val] of Object.entries(prices)) {
      if (val.trim() !== '') variantPrices[codigo] = Number(val);
    }
    await fetch(`/api/admin/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        brand: brand.trim() || null,
        categorySlug,
        subcategory: subcategory.trim() || null,
        isOffer,
        variantPrices,
      }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`/api/admin/products/${product.id}/image`, { method: 'POST', body: form });
    const data = await res.json();
    setUploading(false);
    if (res.ok) {
      setImage(data.image);
      router.refresh();
    } else {
      alert(data.error ?? 'No se pudo subir la imagen');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function toggleHidden() {
    setBusy('hide');
    await fetch(`/api/admin/products/${product.id}`, {
      method: product.hidden ? 'PATCH' : 'DELETE',
      ...(product.hidden
        ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hidden: false }) }
        : {}),
    });
    setBusy(null);
    router.refresh();
  }

  async function handleRestore() {
    if (!confirm('¿Descartar todas tus ediciones sobre este producto y volver al original del CSV?')) return;
    setBusy('restore');
    await fetch(`/api/admin/products/${product.id}/restore`, { method: 'POST' });
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
      <div className="flex flex-col gap-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border">
          <ProductImage key={image ?? 'no-image'} image={image} brandSlug={product.brandSlug} categorySlug={categorySlug} name={name} />
        </div>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? 'Subiendo…' : 'Cambiar foto'}
        </button>
        <p className="text-xs text-muted-foreground">JPG, PNG o WEBP. Hasta 8MB. Se aplica a todas las variantes de este producto.</p>

        <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
          <button
            onClick={toggleHidden}
            disabled={busy !== null}
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            {busy === 'hide' ? <Loader2 className="h-4 w-4 animate-spin" /> : product.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {product.hidden ? 'Mostrar en el catálogo' : 'Ocultar del catálogo'}
          </button>
          {product.hasOverride && (
            <button
              onClick={handleRestore}
              disabled={busy !== null}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-destructive/30 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
            >
              {busy === 'restore' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
              Restaurar original del CSV
            </button>
          )}
        </div>

        <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
          <dt>Código base</dt>
          <dd className="text-right text-foreground">{product.codigo}</dd>
          <dt>Todos los códigos</dt>
          <dd className="text-right text-foreground">{product.allCodigos.join(', ')}</dd>
          <dt>Estado</dt>
          <dd className="text-right text-foreground">{product.hidden ? 'Oculto' : 'Activo'}{product.hasOverride ? ' · Editado' : ''}</dd>
        </dl>
      </div>

      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-border bg-background p-5">
          <h2 className="mb-4 font-heading text-base font-bold">Información</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nombre" className="sm:col-span-2">
              <input value={name} onChange={(e) => setName(e.target.value)} className={INPUT_CLASS} />
            </Field>
            <Field label="Marca">
              <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Sin marca" className={INPUT_CLASS} />
            </Field>
            <Field label="Subcategoría">
              <input value={subcategory} onChange={(e) => setSubcategory(e.target.value)} placeholder="—" className={INPUT_CLASS} />
            </Field>
            <Field label="Categoría">
              <select value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} className={INPUT_CLASS}>
                {CATEGORIES_META.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium">
              <input type="checkbox" checked={isOffer} onChange={(e) => setIsOffer(e.target.checked)} className="h-4 w-4 accent-primary" />
              Marcar como oferta / liquidación
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5">
          <h2 className="mb-4 font-heading text-base font-bold">Precios por presentación</h2>
          <div className="flex flex-col divide-y divide-border">
            {product.variants.map((v) => (
              <div key={v.codigo} className="flex items-center justify-between gap-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{v.sizeLabel ?? 'Presentación única'}</p>
                  <p className="text-xs text-muted-foreground">Código {v.codigo}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">$</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={prices[v.codigo]}
                    onChange={(e) => setPrices((p) => ({ ...p, [v.codigo]: e.target.value }))}
                    placeholder="Consultar"
                    className="h-9 w-32 rounded-lg border border-border bg-background px-2 text-right text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Precio actual mostrado en el catálogo: <span className="font-medium text-foreground">{product.hasAnyPrice ? formatPriceARS(product.priceMin) : 'Consultar precio'}</span>
            {product.priceMin !== product.priceMax && product.hasAnyPrice ? ` – ${formatPriceARS(product.priceMax)}` : ''}. Dejá el campo vacío para mostrar &ldquo;Consultar precio&rdquo;.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? 'Guardando…' : saved ? 'Guardado' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
