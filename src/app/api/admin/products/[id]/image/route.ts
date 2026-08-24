import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { getAdminProductById } from '@/lib/data';
import { setOverride } from '@/lib/overrides';
import { syncAfterProductChange } from '@/lib/admin-sync';
import { UPLOADS_DIR } from '@/lib/storage-paths';

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getAdminProductById(id);
  if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });

  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Falta el archivo' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'La imagen no puede pesar más de 8MB' }, { status: 400 });
  }
  const ext = EXT_BY_TYPE[file.type];
  if (!ext) {
    return NextResponse.json({ error: 'Formato no soportado. Usá JPG, PNG o WEBP.' }, { status: 400 });
  }

  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const codigo = product.codigo;
  // Limpiar versiones previas con otra extensión para que no quede una imagen vieja huérfana.
  for (const oldExt of ['jpg', 'jpeg', 'png', 'webp']) {
    const oldPath = path.join(/*turbopackIgnore: true*/ UPLOADS_DIR, `${codigo}.${oldExt}`);
    if (fs.existsSync(/*turbopackIgnore: true*/ oldPath)) fs.unlinkSync(/*turbopackIgnore: true*/ oldPath);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(/*turbopackIgnore: true*/ UPLOADS_DIR, `${codigo}.${ext}`), buffer);

  // Se sirve por /api/product-photo (no por la ruta estática /products/...) porque
  // next start saca una foto de /public al arrancar: un archivo agregado mientras
  // el servidor ya está corriendo no se serviría como asset estático hasta reiniciar.
  // El sufijo ~timestamp es cache-busting en el path (next/image rechaza query
  // strings en imágenes locales por seguridad, así que no puede ir como ?v=).
  const imagePath = `/api/product-photo/${codigo}~${Date.now()}`;
  setOverride(id, { image: imagePath });

  const updated = getAdminProductById(id);
  if (updated) syncAfterProductChange(updated, product.categorySlug);

  return NextResponse.json({ ok: true, image: imagePath });
}
