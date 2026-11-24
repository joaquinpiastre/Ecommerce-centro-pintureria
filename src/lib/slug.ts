/** "Protección para Madera" -> "proteccion-para-madera". Misma regla que scripts/build-catalog.ts. */
export function slugify(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
