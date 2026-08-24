import fs from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';

const CONTENT_TYPE: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

const PRODUCTS_DIR = path.join(process.cwd(), 'public', 'products');

/**
 * Sirve fotos de producto leyendo el disco en cada request. `next start` saca
 * una foto del contenido de /public al arrancar el proceso, así que un archivo
 * subido por el admin mientras el servidor ya está corriendo devuelve 404 si
 * se pide como asset estático — este endpoint evita ese problema.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ codigo: string }> }) {
  // El segmento puede venir como "100~1786600220005" (código~versión): next/image
  // rechaza query strings en imágenes locales, así que el cache-busting va en el
  // path. La versión no se usa para nada, solo cambia la URL para invalidar caché.
  const raw = (await params).codigo;
  const codigo = raw.split('~')[0];
  if (!/^[a-zA-Z0-9_-]+$/.test(codigo)) {
    return NextResponse.json({ error: 'Código inválido' }, { status: 400 });
  }

  for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
    const filePath = path.join(PRODUCTS_DIR, `${codigo}.${ext}`);
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': CONTENT_TYPE[ext],
          'Cache-Control': 'public, max-age=60, must-revalidate',
        },
      });
    }
  }

  return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
}
