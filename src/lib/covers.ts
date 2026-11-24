/**
 * Fotos de portada (libres, de Pexels) en /public/covers.
 * - portada.jpg: la portada de la home.
 * - {slug}.jpg: la cabecera de cada categoría; también se usa como miniatura de la
 *   categoría en el menú y como foto de un rubro que todavía no tiene productos con foto.
 * Una categoría nueva sin foto propia usa la portada general.
 */
export const HOME_COVER = '/covers/portada.jpg';

const CATEGORY_COVERS: Record<string, string> = {
  pinturas: '/covers/pinturas.jpg',
  automotor: '/covers/automotor.jpg',
  accesorios: '/covers/accesorios.jpg',
};

export function getCategoryCover(slug: string): string {
  return CATEGORY_COVERS[slug] ?? HOME_COVER;
}
