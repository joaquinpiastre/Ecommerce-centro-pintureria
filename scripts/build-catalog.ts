/**
 * Pipeline de catálogo: CSV (';', CRLF, UTF-8 o Latin1 — se detecta solo) ->
 * data/products.json + data/categories.json + public/search-index.json (índice
 * liviano para el buscador fuzzy client-side).
 *
 * Re-ejecutable: cuando actualicen la lista de precios, reemplazar el CSV en la raíz
 * del proyecto (o pasar la ruta como primer argumento) y correr `npm run build:catalog`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { RULES, CATEGORIES, BRANDS, KEEP_UPPER, LOWER_CONNECTORS, OFFER_PATTERN, EXCLUDE_CODES } from './taxonomy';

const ROOT = path.resolve(__dirname, '..');
const CSV_PATH = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, 'LISTA DE PRECIOS ECOMERCE.csv');
const PRODUCTS_DIR = path.join(ROOT, 'public', 'products');

interface RawRow {
  codigo: string;
  articulo: string;
  precioIva: number;
}

interface ProductVariant {
  codigo: string;
  sizeLabel: string | null;
  price: number;
  priceDisplay: string;
  hasPrice: boolean;
}

interface Product {
  id: string;
  codigo: string; // codigo de la variante por defecto (usado en /producto/[codigo])
  allCodigos: string[]; // todos los codigos del grupo, para resolver la ruta desde cualquier variante
  name: string;
  slug: string;
  brand: string | null;
  brandSlug: string | null;
  category: string;
  categorySlug: string;
  subcategory: string | null;
  isOffer: boolean;
  variants: ProductVariant[];
  priceMin: number;
  priceMax: number;
  hasAnyPrice: boolean;
  image: string | null; // ruta pública si existe foto real para alguna variante
}

// ---------- 1. Leer CSV detectando encoding y parsear ----------

/**
 * El CSV puede venir en UTF-8 (pegado/exportado desde algo moderno) o en Latin1 /
 * ISO-8859-1 (exportado directo del sistema de gestión, como el pipeline original).
 * Se prueba UTF-8 primero; si aparecen bytes inválidos (el navegador de reemplazo
 * "�"), se reinterpreta como Latin1.
 */
function readCsvAutoEncoding(filePath: string): string[] {
  const buf = fs.readFileSync(filePath);
  let text = buf.toString('utf-8');
  if (text.includes('�')) text = buf.toString('latin1');
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // BOM
  return text.split(/\r?\n/).filter((l) => l.length > 0);
}

/** Precio con coma decimal ("27650,88") o punto decimal ("9221.57"), con o sin
 * separador de miles ("9.221,57"). */
function parsePrice(raw: string): number {
  let s = raw.trim();
  if (s.includes(',') && s.includes('.')) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (s.includes(',')) {
    s = s.replace(',', '.');
  }
  return parseFloat(s);
}

function cleanArticulo(raw: string): string {
  let a = raw.trim();
  if (a.startsWith('"') && a.endsWith('"')) a = a.slice(1, -1);
  if (a.startsWith('="')) a = a.slice(2);
  if (a.endsWith('"')) a = a.slice(0, -1);
  a = a.replace(/""/g, '"');
  return a.trim();
}

function parseRows(lines: string[]): RawRow[] {
  const [, ...dataLines] = lines; // descartar header
  const rows: RawRow[] = [];
  for (const line of dataLines) {
    const parts = line.split(';');
    if (parts.length < 4) continue;
    const codigo = parts[0].trim();
    const articulo = cleanArticulo(parts[1] || '');
    const precioIva = parsePrice(parts[3] || '');
    if (!codigo || !articulo || Number.isNaN(precioIva)) continue;
    rows.push({ codigo, articulo, precioIva });
  }
  return rows;
}

// ---------- 2. Marca ----------

function extractBrand(name: string): { brand: string | null; brandKey: string | null; rest: string } {
  const lastDash = name.lastIndexOf(' - ');
  if (lastDash !== -1) {
    const candidate = name.slice(lastDash + 3).trim().toUpperCase().replace(/\s+/g, ' ');
    if (BRANDS[candidate]) {
      return { brand: BRANDS[candidate], brandKey: candidate, rest: name.slice(0, lastDash).trim() };
    }
  }
  // fallback: buscar cualquier marca conocida en el string completo (marca embebida, sin guión final)
  const upper = name.toUpperCase();
  let found: string | null = null;
  let foundIdx = -1;
  for (const key of Object.keys(BRANDS)) {
    const re = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    const m = re.exec(upper);
    if (m && m.index > foundIdx) {
      foundIdx = m.index;
      found = key;
    }
  }
  if (found) return { brand: BRANDS[found], brandKey: found, rest: name };
  return { brand: null, brandKey: null, rest: name };
}

// ---------- 3. Tamaño / variante ----------

const SIZE_RE = /(X\s*)?\d+(?:[.,]\d+)?\s*(?:CC|ML|LTS?|KL|KG|GR|MM|CM|MTS?|L)\b|\d+\/\d+\s*L\b/gi;

function stripRedundantBrandPrefix(baseName: string, brandKey: string | null): string {
  if (!brandKey) return baseName;
  const re = new RegExp(`^${brandKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+`, 'i');
  if (re.test(baseName)) return baseName.replace(re, '').trim();
  return baseName;
}

function extractSize(rest: string): { baseName: string; sizeLabel: string | null } {
  const matches = [...rest.matchAll(SIZE_RE)];
  if (matches.length === 0) return { baseName: rest, sizeLabel: null };
  const last = matches[matches.length - 1];
  const sizeLabel = last[0].trim();
  const baseName = (rest.slice(0, last.index) + rest.slice((last.index ?? 0) + last[0].length))
    .replace(/\s+/g, ' ')
    .replace(/\s*-\s*$/, '')
    .replace(/^\s*-\s*/, '')
    .trim();
  return { baseName: baseName || rest.trim(), sizeLabel };
}

// ---------- 4. Categoría ----------

function classify(name: string): { category: string; subcategory: string | null } {
  for (const rule of RULES) {
    if (rule.pattern.test(name)) return { category: rule.category, subcategory: rule.subcategory };
  }
  return { category: 'Varios', subcategory: null };
}

// ---------- 5. Precio ARS ----------

function formatPriceARS(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  const [intPart, decPart] = rounded.toFixed(2).split('.');
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$${withThousands},${decPart}`;
}

// ---------- 6. Title Case ----------

/**
 * El CSV de origen suele venir sin tildes en mayúsculas (LIQUIDACION, IMPRESION).
 * Las palabras terminadas en -cion/-sion en español SIEMPRE llevan tilde
 * (-ción/-sión), sin excepciones relevantes en este vocabulario, así que se
 * restaura de forma determinística en vez de dejarlas mal escritas.
 */
function restoreAccent(word: string): string {
  const lower = word.toLowerCase();
  if (lower.length > 4 && lower.endsWith('cion')) return word.slice(0, -4) + 'ción';
  if (lower.length > 4 && lower.endsWith('sion')) return word.slice(0, -4) + 'sión';
  return word;
}

function titleCaseName(str: string): string {
  return str
    .split(' ')
    .map((w, i) => {
      if (!w) return w;
      if (/\d/.test(w)) return w;
      const upper = w.toUpperCase();
      if (KEEP_UPPER.has(upper)) return upper;
      if (i > 0 && LOWER_CONNECTORS.has(w.toLowerCase())) return w.toLowerCase();
      const corrected = restoreAccent(w);
      return corrected.charAt(0).toLocaleUpperCase('es-AR') + corrected.slice(1).toLocaleLowerCase('es-AR');
    })
    .join(' ');
}

// ---------- 7. Slug ----------

function slugify(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ---------- Pipeline principal ----------

function main() {
  console.log(`Leyendo CSV: ${CSV_PATH}`);
  const lines = readCsvAutoEncoding(CSV_PATH);
  const rawRows = parseRows(lines);
  console.log(`Filas parseadas: ${rawRows.length}`);

  const rows = rawRows.filter((r) => !EXCLUDE_CODES.has(r.codigo));
  console.log(`Excluidas (asientos administrativos, no productos): ${rawRows.length - rows.length}`);

  // imágenes reales disponibles
  const realImages = new Set<string>();
  if (fs.existsSync(PRODUCTS_DIR)) {
    for (const f of fs.readdirSync(PRODUCTS_DIR)) {
      const base = f.replace(/\.(jpg|jpeg|png|webp)$/i, '');
      realImages.add(base);
    }
  }

  const groups = new Map<string, { baseName: string; brand: string | null; brandKey: string | null; category: string; subcategory: string | null; isOffer: boolean; variants: ProductVariant[] }>();

  for (const row of rows) {
    const { brand, brandKey, rest } = extractBrand(row.articulo);
    const { baseName: rawBaseName, sizeLabel } = extractSize(rest);
    const baseName = stripRedundantBrandPrefix(rawBaseName, brandKey);
    const { category, subcategory } = classify(row.articulo);
    const isOffer = OFFER_PATTERN.test(row.articulo);
    const hasPrice = row.precioIva > 0;
    const variant: ProductVariant = {
      codigo: row.codigo,
      sizeLabel,
      price: row.precioIva,
      priceDisplay: hasPrice ? formatPriceARS(row.precioIva) : 'Consultar precio',
      hasPrice,
    };

    const groupKey = `${baseName.toUpperCase()}|${brandKey ?? 'NOBRAND'}|${category}`;
    const existing = groups.get(groupKey);
    if (existing) {
      existing.variants.push(variant);
      existing.isOffer = existing.isOffer || isOffer;
    } else {
      groups.set(groupKey, { baseName, brand, brandKey, category, subcategory, isOffer, variants: [variant] });
    }
  }

  console.log(`Grupos de producto (tras agrupar variantes de tamaño): ${groups.size}`);

  const usedSlugs = new Set<string>();
  const products: Product[] = [];
  const categoryDefBySlug = new Map(CATEGORIES.map((c) => [c.label, c]));

  for (const g of groups.values()) {
    g.variants.sort((a, b) => {
      if (a.hasPrice !== b.hasPrice) return a.hasPrice ? -1 : 1;
      return a.price - b.price;
    });

    const displayName = titleCaseName(g.baseName);
    const catDef = categoryDefBySlug.get(g.category)!;
    const brandSlug = g.brand ? slugify(g.brand) : null;

    const baseSlug = slugify(`${displayName} ${g.brand ?? ''}`);
    let slug = baseSlug;
    let n = 2;
    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${n}`;
      n++;
    }
    usedSlugs.add(slug);

    const pricedVariants = g.variants.filter((v) => v.hasPrice);
    const priceMin = pricedVariants.length ? Math.min(...pricedVariants.map((v) => v.price)) : 0;
    const priceMax = pricedVariants.length ? Math.max(...pricedVariants.map((v) => v.price)) : 0;

    const image = g.variants.map((v) => v.codigo).find((c) => realImages.has(c));

    products.push({
      id: slug,
      codigo: g.variants[0].codigo,
      allCodigos: g.variants.map((v) => v.codigo),
      name: displayName,
      slug,
      brand: g.brand,
      brandSlug,
      category: g.category,
      categorySlug: catDef.slug,
      subcategory: g.subcategory,
      isOffer: g.isOffer,
      variants: g.variants,
      priceMin,
      priceMax,
      hasAnyPrice: pricedVariants.length > 0,
      image: image ? `/products/${image}.jpg` : null,
    });
  }

  products.sort((a, b) => a.name.localeCompare(b.name, 'es'));

  // ---------- categories.json ----------
  const categoriesOut = CATEGORIES.filter((c) => c.label !== 'Varios' || products.some((p) => p.category === 'Varios')).map((c) => {
    const inCat = products.filter((p) => p.category === c.label);
    const subMap = new Map<string, number>();
    const brandMap = new Map<string, { label: string; count: number }>();
    for (const p of inCat) {
      if (p.subcategory) subMap.set(p.subcategory, (subMap.get(p.subcategory) ?? 0) + 1);
      if (p.brand) {
        const entry = brandMap.get(p.brandSlug!) ?? { label: p.brand, count: 0 };
        entry.count++;
        brandMap.set(p.brandSlug!, entry);
      }
    }
    const prices = inCat.filter((p) => p.hasAnyPrice).flatMap((p) => [p.priceMin, p.priceMax]);
    return {
      slug: c.slug,
      label: c.label,
      accent: c.accent,
      icon: c.icon,
      count: inCat.length,
      subcategories: [...subMap.entries()].map(([label, count]) => ({ label, slug: slugify(label), count })).sort((a, b) => b.count - a.count),
      brands: [...brandMap.entries()].map(([slug, v]) => ({ slug, label: v.label, count: v.count })).sort((a, b) => b.count - a.count),
      priceMin: prices.length ? Math.min(...prices) : 0,
      priceMax: prices.length ? Math.max(...prices) : 0,
    };
  });

  const offerCount = products.filter((p) => p.isOffer).length;

  // ---------- escribir archivos ----------
  const dataDir = path.join(ROOT, 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'products.json'), JSON.stringify(products, null, 2));
  fs.writeFileSync(
    path.join(dataDir, 'categories.json'),
    JSON.stringify({ categories: categoriesOut, totalProducts: products.length, offerCount }, null, 2)
  );

  const publicDataDir = path.join(ROOT, 'public');
  fs.mkdirSync(publicDataDir, { recursive: true });
  const searchIndex = products.map((p) => ({
    id: p.id,
    codigo: p.codigo,
    name: p.name,
    brand: p.brand,
    category: p.category,
    categorySlug: p.categorySlug,
    priceDisplay: p.variants[0]?.priceDisplay ?? 'Consultar precio',
    image: p.image,
    codes: p.allCodigos.join(' '),
  }));
  fs.writeFileSync(path.join(publicDataDir, 'search-index.json'), JSON.stringify(searchIndex));

  console.log(`\nOK. Productos finales: ${products.length}`);
  console.log(`Con foto real detectada: ${products.filter((p) => p.image).length}`);
  console.log(`Con tag "Liquidación": ${offerCount}`);
  console.log('Categorías:');
  for (const c of categoriesOut) console.log(`  ${c.count}\t${c.label}`);
}

main();
