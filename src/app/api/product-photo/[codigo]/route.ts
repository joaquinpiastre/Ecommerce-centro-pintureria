import fs from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { SEED_PRODUCTS_DIR, UPLOADS_DIR } from '@/lib/storage-paths';

const CONTENT_TYPE: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

// Se busca primero en UPLOADS_DIR (volumen persistente si hay uno configurado
// vía RAILWAY_VOLUME_MOUNT_PATH, ver storage-paths.ts) y si no está ahí, en
// SEED_PRODUCTS_DIR (fotos que vienen versionadas en el repo). Cuando no hay
// volumen, ambas rutas son la misma carpeta.
const SEARCH_DIRS = [...new Set([UPLOADS_DIR, SEED_PRODUCTS_DIR])];

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

  for (const dir of SEARCH_DIRS) {
    for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
      const filePath = path.join(/*turbopackIgnore: true*/ dir, `${codigo}.${ext}`);
      if (fs.existsSync(/*turbopackIgnore: true*/ filePath)) {
        const buffer = fs.readFileSync(/*turbopackIgnore: true*/ filePath);
        return new NextResponse(new Uint8Array(buffer), {
          headers: {
            'Content-Type': CONTENT_TYPE[ext],
            'Cache-Control': 'public, max-age=60, must-revalidate',
          },
        });
      }
    }
  }

  return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
}
