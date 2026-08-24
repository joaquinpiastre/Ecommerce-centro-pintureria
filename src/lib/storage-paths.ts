import path from 'node:path';

/**
 * Railway (y hosts similares) resetean el filesystem del contenedor en cada
 * deploy/restart, excepto lo que esté en un volumen persistente montado. Si
 * hay un volumen (Railway lo expone en RAILWAY_VOLUME_MOUNT_PATH), las
 * ediciones de admin (overrides, fotos subidas) se guardan ahí para
 * sobrevivir a un redeploy. Sin volumen (ej. desarrollo local), se usan las
 * rutas de siempre dentro del repo.
 */
const VOLUME_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH;

export const SEED_PRODUCTS_DIR = path.join(process.cwd(), 'public', 'products');

export const UPLOADS_DIR = VOLUME_DIR ? path.join(VOLUME_DIR, 'products') : SEED_PRODUCTS_DIR;

export const OVERRIDES_PATH = VOLUME_DIR
  ? path.join(VOLUME_DIR, 'overrides.json')
  : path.join(process.cwd(), 'data', 'overrides.json');
