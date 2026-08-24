/**
 * Paleta real de Centro Pinturería, tomada de centropintureria.com.ar
 * (variables --c-* de su CSS) y del isotipo (molinete de 9 pétalos de color).
 * Fuente única de verdad para los acentos de categoría — la comparten
 * scripts/taxonomy.ts (build-time) y src/lib/categories-meta.ts (client).
 */
export const BRAND_COLORS = {
  verde: '#7AC514',
  amarillo: '#F5C400',
  naranja: '#F47920',
  rojo: '#E03A3E',
  rosa: '#E91E8C',
  violeta: '#7B2D8B',
  azul: '#1B3F8A',
  celeste: '#00AEEF',
  verdeagua: '#00B388',
} as const;

export const BRAND_PALETTE_ORDER = [
  BRAND_COLORS.rojo,
  BRAND_COLORS.azul,
  BRAND_COLORS.amarillo,
  BRAND_COLORS.celeste,
  BRAND_COLORS.naranja,
  BRAND_COLORS.violeta,
  BRAND_COLORS.rosa,
  BRAND_COLORS.verdeagua,
  BRAND_COLORS.verde,
];
