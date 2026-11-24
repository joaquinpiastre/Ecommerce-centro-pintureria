/**
 * Pipeline de catálogo: lista de productos (CSV) -> data/products.json +
 * data/categories.json + public/search-index.json (índice liviano del buscador).
 *
 * ENTRADAS
 * 1. Lista de productos: CSV separado por ';' con las columnas
 *    `Código;Descripción;Marca;Categorias;Sub Categorias` (UTF-8 o Windows-1252, se
 *    detecta solo). Se toma el CSV más nuevo de la raíz del proyecto que tenga esas
 *    columnas, o el que se pase como primer argumento.
 *    TODOS los artículos de esa lista se publican; lo que no está en la lista no existe.
 * 2. Precios: data/precios.csv (`Código;Descripción;Precio con IVA`). La lista de
 *    productos no trae precios, así que se cruzan por código. Un artículo sin precio
 *    se publica igual, como "Consultar precio". Si algún día la lista trae una columna
 *    de precio, esa columna manda sobre data/precios.csv.
 * 3. Fotos: public/products/{código}.jpg|png|webp.
 *
 * Re-ejecutable: reemplazar el CSV (o completar precios / agregar fotos) y correr
 * `npm run build:catalog`. `npm run build` lo corre solo antes de compilar el sitio.
 */
import fs from 'node:fs';
import path from 'node:path';
import { FAMILIES, type Family } from './families';
import { DESCRIPTIONS } from './descriptions';
import { OFFER_PCT } from './offers';
import {
  CATEGORY_DEFS,
  FALLBACK_CATEGORY,
  SUBCATEGORY_LABELS,
  SUBCATEGORY_ALIASES,
  BRAND_LABELS,
  BRAND_SUFFIXES,
  KEEP_UPPER,
  LOWER_CONNECTORS,
  WORD_FIXES,
  type CategoryDef,
} from './taxonomy';

const ROOT = path.resolve(__dirname, '..');
const PRODUCTS_DIR = path.join(ROOT, 'public', 'products');
const PRICES_PATH = path.join(ROOT, 'data', 'precios.csv');

interface RawRow {
  codigo: string;
  descripcion: string;
  marca: string;
  categoria: string;
  subcategoria: string;
  /** Precio que venga en la propia lista (hoy no trae). */
  precio: number | null;
}

interface ProductVariant {
  codigo: string;
  sizeLabel: string | null;
  price: number;
  priceDisplay: string;
  hasPrice: boolean;
  option?: string | null; // color / número / grano dentro de un mismo producto
  image?: string | null; // foto de la variante, si existe
}

interface Product {
  id: string;
  codigo: string; // código de la variante por defecto (usado en /producto/[codigo])
  allCodigos: string[]; // todos los códigos del producto, para resolver la ruta desde cualquier variante
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
  image: string | null; // foto principal: la de la primera variante que tenga
  description?: string | null;
  offerPct?: number | null; // % de descuento de la oferta
  optionLabel?: string | null; // "Color", "Número"…
  optionLabelPlural?: string | null; // "colores", "números"…
}

// ---------- 1. Leer CSV ----------

/** UTF-8 si es válido; si no, Windows-1252 (lo que exporta el sistema de gestión / Excel). */
function readCsv(filePath: string): string[][] {
  const buf = fs.readFileSync(filePath);
  let text = buf.toString('utf-8');
  if (text.includes('\uFFFD')) text = new TextDecoder('windows-1252').decode(buf);
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // BOM
  return text
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0)
    .map(splitCsvLine);
}

/** Separa por ';' respetando campos entre comillas (`"ESPATULA N° 2"" - MOTA"`). */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else quoted = false;
      } else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === ';') {
      out.push(cur);
      cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.replace(/^="?|"$/g, '').trim());
}

const stripAccents = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const headerKey = (s: string) => stripAccents(s).toLowerCase().replace(/[^a-z0-9+]/g, '');

function findColumn(header: string[], ...candidates: RegExp[]): number {
  const keys = header.map(headerKey);
  for (const re of candidates) {
    const idx = keys.findIndex((k) => re.test(k));
    if (idx !== -1) return idx;
  }
  return -1;
}

/** Precio con coma decimal ("27650,88"), punto decimal ("9221.57") o miles ("9.221,57"). */
function parsePrice(raw: string | undefined): number | null {
  let s = (raw ?? '').replace(/[$\s]/g, '');
  if (!s) return null;
  if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '').replace(',', '.');
  else if (s.includes(',')) s = s.replace(',', '.');
  const n = parseFloat(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function isCatalogHeader(header: string[]): boolean {
  return findColumn(header, /^marca$/) !== -1 && findColumn(header, /^categoria/) !== -1 && findColumn(header, /^codigo$/) !== -1;
}

/** El CSV de productos más nuevo de la raíz (el que tiene Marca y Categorias). */
function findCatalogCsv(): string {
  if (process.argv[2]) return path.resolve(process.argv[2]);
  const candidates = fs
    .readdirSync(ROOT)
    .filter((f) => f.toLowerCase().endsWith('.csv'))
    .map((f) => path.join(ROOT, f))
    .filter((f) => {
      try {
        return isCatalogHeader(readCsv(f)[0] ?? []);
      } catch {
        return false;
      }
    })
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  if (candidates.length === 0) {
    throw new Error(
      'No encontré la lista de productos: tiene que haber un CSV en la raíz del proyecto con las columnas Código;Descripción;Marca;Categorias;Sub Categorias.'
    );
  }
  if (candidates.length > 1) {
    console.warn(`ATENCIÓN: hay ${candidates.length} listas de productos en la raíz; uso la más nueva (${path.basename(candidates[0])}).`);
  }
  return candidates[0];
}

function parseCatalog(table: string[][]): RawRow[] {
  const [header, ...lines] = table;
  const col = {
    codigo: findColumn(header, /^codigo$/, /^cod/),
    descripcion: findColumn(header, /^descripcion$/, /^articulo$/, /^desc/),
    marca: findColumn(header, /^marca$/),
    categoria: findColumn(header, /^categorias?$/),
    subcategoria: findColumn(header, /^subcategorias?$/),
    precio: findColumn(header, /iva/, /^precio/, /venta/),
  };
  if (col.codigo === -1 || col.descripcion === -1) throw new Error('La lista de productos no tiene las columnas Código y Descripción.');
  const rows: RawRow[] = [];
  const seen = new Set<string>();
  for (const parts of lines) {
    const codigo = (parts[col.codigo] ?? '').trim();
    const descripcion = (parts[col.descripcion] ?? '').trim();
    if (!codigo || !descripcion) continue;
    if (seen.has(codigo)) {
      console.warn(`ATENCIÓN: el código ${codigo} está repetido en la lista; se usa la primera aparición.`);
      continue;
    }
    seen.add(codigo);
    rows.push({
      codigo,
      descripcion,
      marca: norm(parts[col.marca] ?? ''),
      categoria: norm(parts[col.categoria] ?? ''),
      subcategoria: norm(parts[col.subcategoria] ?? ''),
      precio: col.precio === -1 ? null : parsePrice(parts[col.precio]),
    });
  }
  return rows;
}

/** data/precios.csv -> código -> precio con IVA. Tolera el formato viejo de la lista de precios. */
function readPrices(): Map<string, number> {
  const prices = new Map<string, number>();
  if (!fs.existsSync(PRICES_PATH)) {
    console.warn('ATENCIÓN: no existe data/precios.csv; todos los productos saldrán como "Consultar precio".');
    return prices;
  }
  const [header, ...lines] = readCsv(PRICES_PATH);
  const cCodigo = findColumn(header, /^codigo$/, /^cod/);
  const cPrecio = findColumn(header, /iva/, /^precio/, /venta/);
  if (cCodigo === -1 || cPrecio === -1) {
    console.warn('ATENCIÓN: data/precios.csv no tiene columnas Código y Precio reconocibles; se ignora.');
    return prices;
  }
  for (const parts of lines) {
    const price = parsePrice(parts[cPrecio]);
    if (parts[cCodigo] && price !== null) prices.set(parts[cCodigo].trim(), price);
  }
  return prices;
}

// ---------- 2. Texto: limpieza, tamaños, Title Case ----------

/** Mayúsculas, sin tildes ni espacios repetidos: clave para comparar categorías y marcas. */
function norm(s: string): string {
  return stripAccents(s).toUpperCase().replace(/\s+/g, ' ').trim();
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Descripción lista para matchear: mayúsculas, un solo espacio, sin la marca del
 * final ("ALBALATEX MATE BLANCO - 04 L - ALBA" -> "ALBALATEX MATE BLANCO - 04 L").
 */
function cleanDescription(raw: string, marca: string): string {
  let s = raw
    .replace(/[\u2022\u0080-\u009f]/g, ' ')
    .replace(/\u00b5/g, ' MIC')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
  const aliases = [...(BRAND_SUFFIXES[marca] ?? []), marca].filter(Boolean).sort((a, b) => b.length - a.length);
  let changed = true;
  while (changed) {
    changed = false;
    for (const alias of aliases) {
      const re = new RegExp(`\\s*-\\s*${escapeRe(alias).replace(/ /g, '\\s+')}\\s*$`);
      if (re.test(s)) {
        s = s.replace(re, '').trim();
        changed = true;
      }
    }
  }
  return s.replace(/[\s-]+$/, '').trim();
}

/**
 * Presentaciones: "- 04 L", "X 4 LTS.", "900 ML", "X 1.25KL", "0,5 KG", "25 K".
 * "K" suelto solo cuenta con un espacio antes ("25 K"), para no leer "1K" (monocomponente).
 */
const SIZE_RE = /(?:\bX\s*)?(\d+(?:[.,]\d+)?)(?:\s*(CC|ML|LTS?|L|KL|KG|GR|G)|\s+(K))\b\.?/g;
/** Referencias de Farben: "543.890-0.9" = producto 543.890, envase de 0,9 L. */
const FARBEN_REF_RE = /(?:PO)?\d{3}\.\d{3,4}(?:EX)?-(\d+(?:\.\d+)?)/;

const fmtNumber = (n: number) => String(Math.round(n * 1000) / 1000).replace('.', ',');

function formatSize(rawNumber: string, rawUnit: string): string {
  const n = parseFloat(rawNumber.replace(',', '.'));
  const unit = rawUnit.toUpperCase();
  if (unit === 'ML') return `${fmtNumber(n)} ml`;
  if (unit === 'CC') return `${fmtNumber(n)} cc`;
  if (unit === 'GR' || unit === 'G') return `${fmtNumber(n)} g`;
  if (unit === 'KG' || unit === 'KL' || unit === 'K') return n < 1 ? `${fmtNumber(n * 1000)} g` : `${fmtNumber(n)} kg`;
  return n < 1 ? `${fmtNumber(n * 1000)} ml` : `${fmtNumber(n)} L`; // litros
}

/** Última presentación que aparece en la descripción y su posición (para poder quitarla). */
function extractSize(desc: string): { sizeLabel: string | null; rest: string } {
  const matches = [...desc.matchAll(SIZE_RE)];
  if (matches.length > 0) {
    const last = matches[matches.length - 1];
    const rest = desc.slice(0, last.index) + ' ' + desc.slice((last.index ?? 0) + last[0].length);
    return { sizeLabel: formatSize(last[1], last[2] ?? last[3]), rest };
  }
  const farben = FARBEN_REF_RE.exec(desc);
  if (farben) return { sizeLabel: formatSize(farben[1], 'L'), rest: desc.replace(farben[0], ' ') };
  return { sizeLabel: null, rest: desc };
}

/** Clave para ordenar presentaciones de menor a mayor (todo llevado a ml / g). */
function sizeKey(label: string | null): number {
  if (!label) return Number.MAX_SAFE_INTEGER;
  const m = /^(\d+(?:,\d+)?)\s*(ml|cc|g|kg|L)\b/.exec(label);
  if (!m) return Number.MAX_SAFE_INTEGER - 1;
  const n = parseFloat(m[1].replace(',', '.'));
  return m[2] === 'L' || m[2] === 'kg' ? n * 1000 : n;
}

/** "GRIS ESPACIAL" -> "Gris Espacial", "VERDE INGLES BRILL" -> "Verde Inglés Brillante". */
function pretty(str: string): string {
  return str
    .replace(/[\s.\-–/]+$/g, '')
    .replace(/^[\s.\-–/]+/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i) => {
      const bare = stripAccents(w).toUpperCase().replace(/[.,]$/, '');
      if (WORD_FIXES[bare]) return i > 0 && LOWER_CONNECTORS.has(WORD_FIXES[bare].toLowerCase()) ? WORD_FIXES[bare].toLowerCase() : WORD_FIXES[bare];
      if (KEEP_UPPER.has(bare)) return bare;
      if (/\d/.test(w)) return w.replace(/(\d)X(\d)/g, '$1x$2');
      if (i > 0 && LOWER_CONNECTORS.has(w.toLowerCase())) return w.toLowerCase();
      return w.charAt(0).toLocaleUpperCase('es-AR') + w.slice(1).toLocaleLowerCase('es-AR');
    })
    .join(' ');
}

function slugify(str: string): string {
  return stripAccents(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatPriceARS(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  const [intPart, decPart] = rounded.toFixed(2).split('.');
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$${withThousands},${decPart}`;
}

/** Clave numérica para ordenar opciones tipo "N° 10", '1 1/2"' o "Grano 80". */
function numericKey(opt: string): number | null {
  const m = /(\d+)(?:\s+(\d+)\/(\d+))?/.exec(opt);
  if (!m) return null;
  return Number(m[1]) + (m[2] ? Number(m[2]) / Number(m[3]) : 0);
}

// ---------- 3. Categorías ----------

function categoryOf(key: string, autoDefs: Map<string, CategoryDef>): CategoryDef {
  if (!key) return FALLBACK_CATEGORY;
  if (CATEGORY_DEFS[key]) return CATEGORY_DEFS[key];
  if (!autoDefs.has(key)) {
    console.warn(`ATENCIÓN: categoría nueva en la lista ("${key}"). Se publica con ícono genérico; para darle ícono y orden, sumarla en scripts/taxonomy.ts.`);
    autoDefs.set(key, { slug: slugify(key), label: pretty(key), accent: FALLBACK_CATEGORY.accent, icon: FALLBACK_CATEGORY.icon });
  }
  return autoDefs.get(key)!;
}

function subcategoryOf(key: string): string | null {
  if (!key) return null;
  const canonical = SUBCATEGORY_ALIASES[key] ?? key;
  return SUBCATEGORY_LABELS[canonical] ?? pretty(canonical);
}

// ---------- 4. Artículo -> (producto, variedad, presentación) ----------

interface Item {
  row: RawRow;
  desc: string;
  family: Family | null;
  productName: string;
  option: string | null;
  sizeLabel: string | null;
  price: number | null;
}

function toItem(row: RawRow, prices: Map<string, number>): Item {
  const desc = cleanDescription(row.descripcion, row.marca);
  const family = FAMILIES.find((f) => f.match.test(desc) && (!f.brand || f.brand === row.marca)) ?? null;
  const auto = extractSize(desc);
  const price = row.precio ?? prices.get(row.codigo) ?? null;

  if (!family) {
    // Artículo sin regla: sale como producto propio, con el nombre de la lista sin la presentación.
    const brandWords = [...(BRAND_SUFFIXES[row.marca] ?? []), row.marca].filter(Boolean);
    let base = auto.rest;
    for (const b of brandWords) base = base.replace(new RegExp(`\\s+${escapeRe(b)}\\s*$`), '');
    return { row, desc, family, productName: pretty(base) || pretty(desc), option: null, sizeLabel: auto.sizeLabel, price };
  }

  let sizeLabel = auto.sizeLabel;
  if (typeof family.size === 'string') sizeLabel = family.size || null;
  else if (family.size) sizeLabel = family.size(desc) ?? auto.sizeLabel;

  let option: string | null = null;
  if (family.opt) option = family.opt(desc);
  else if (family.strip) option = pretty(auto.rest.replace(family.strip, ' ')) || null;
  if (family.option && !option) {
    console.warn(`ATENCIÓN: no pude leer la variedad de "${row.descripcion}" (${row.codigo}); queda como "Estándar".`);
    option = 'Estándar';
  }

  return { row, desc, family, productName: family.name, option, sizeLabel, price };
}

// ---------- Pipeline principal ----------

function main() {
  const csvPath = findCatalogCsv();
  console.log(`Lista de productos: ${path.basename(csvPath)}`);
  const rows = parseCatalog(readCsv(csvPath));
  const prices = readPrices();
  console.log(`Artículos en la lista: ${rows.length} · precios disponibles: ${prices.size}`);

  // Fotos disponibles: código -> ruta pública (respeta la extensión real del archivo).
  const photos = new Map<string, string>();
  if (fs.existsSync(PRODUCTS_DIR)) {
    for (const f of fs.readdirSync(PRODUCTS_DIR)) {
      const m = /^(.+)\.(jpg|jpeg|png|webp)$/i.exec(f);
      if (m) photos.set(m[1], `/products/${f}`);
    }
  }

  const items = rows.map((r) => toItem(r, prices));
  const autoCategoryDefs = new Map<string, CategoryDef>();

  // Un producto = misma regla (o mismo nombre) + misma marca.
  const groups = new Map<string, Item[]>();
  for (const it of items) {
    const key = `${it.productName}|${it.row.marca}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(it);
  }

  const usedSlugs = new Set<string>();
  const products: Product[] = [];
  const unmatched: Item[] = items.filter((it) => !it.family);

  for (const members of groups.values()) {
    const first = members[0];
    const fam = first.family;
    const brand = first.row.marca ? (BRAND_LABELS[first.row.marca] ?? pretty(first.row.marca)) : null;

    // Categoría y subcategoría: las de la lista. Si los artículos de un mismo producto difieren, gana la más repetida.
    const mostCommon = (values: string[]) => {
      const counts = new Map<string, number>();
      for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
      if (counts.size > 1) console.warn(`ATENCIÓN: "${first.productName}" tiene artículos en categorías distintas (${[...counts.keys()].join(' / ')}); uso la más repetida.`);
      return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    };
    const category = categoryOf(mostCommon(members.map((m) => m.row.categoria)), autoCategoryDefs);
    const subcategory = subcategoryOf(mostCommon(members.map((m) => m.row.subcategoria)));

    const options = [...new Set(members.map((m) => m.option).filter((o): o is string => !!o))];
    const multi = options.length > 1;

    const variants: ProductVariant[] = members.map((m) => ({
      codigo: m.row.codigo,
      // Con una sola variedad (ej. un único color), va en el nombre de la presentación y no como selector.
      sizeLabel: m.sizeLabel,
      price: m.price ?? 0,
      priceDisplay: m.price ? formatPriceARS(m.price) : 'Consultar precio',
      hasPrice: !!m.price,
      option: multi ? m.option : null,
      image: photos.get(m.row.codigo) ?? null,
    }));

    // Las presentaciones de una misma variedad comparten foto (la lata de 4 L y la de 20 L se ven igual).
    for (const v of variants) {
      if (!v.image) v.image = variants.find((o) => o.image && o.option === v.option)?.image ?? null;
    }

    options.sort((a, b) => {
      if (fam?.order) {
        const ia = fam.order.indexOf(a);
        const ib = fam.order.indexOf(b);
        if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      }
      const na = numericKey(a);
      const nb = numericKey(b);
      if (na !== null && nb !== null && na !== nb) return na - nb;
      return a.localeCompare(b, 'es', { numeric: true });
    });
    const isColor = fam?.option?.[0] === 'Color';
    if (multi && isColor && !fam?.order) {
      // En productos por color, los colores con foto van primero: la ficha y la tarjeta abren con una foto real.
      const withPhoto = new Set(variants.filter((v) => v.image).map((v) => v.option));
      options.sort((a, b) => Number(withPhoto.has(b)) - Number(withPhoto.has(a)));
    }
    variants.sort((a, b) => {
      const oa = a.option ? options.indexOf(a.option) : 0;
      const ob = b.option ? options.indexOf(b.option) : 0;
      if (oa !== ob) return oa - ob;
      return sizeKey(a.sizeLabel) - sizeKey(b.sizeLabel) || a.price - b.price;
    });

    // Las variedades que no son color (grano, número, medida) se ven igual: heredan la foto del producto.
    const mainImage = variants.find((v) => v.image)?.image ?? null;
    if (!isColor) for (const v of variants) v.image ??= mainImage;

    const priced = variants.filter((v) => v.hasPrice);
    const baseSlug = slugify(`${first.productName} ${brand ?? ''}`);
    let slug = baseSlug;
    for (let n = 2; usedSlugs.has(slug); n++) slug = `${baseSlug}-${n}`;
    usedSlugs.add(slug);

    const offerPct = OFFER_PCT[first.productName] ?? null;
    const description = DESCRIPTIONS[`${first.productName} · ${brand}`] ?? DESCRIPTIONS[first.productName] ?? null;
    if (fam && !description) console.warn(`ATENCIÓN: falta descripción para "${first.productName}"`);

    products.push({
      id: slug,
      codigo: variants[0].codigo,
      allCodigos: variants.map((v) => v.codigo),
      name: first.productName,
      slug,
      brand,
      brandSlug: brand ? slugify(brand) : null,
      category: category.label,
      categorySlug: category.slug,
      subcategory,
      isOffer: !!offerPct,
      variants,
      priceMin: priced.length ? Math.min(...priced.map((v) => v.price)) : 0,
      priceMax: priced.length ? Math.max(...priced.map((v) => v.price)) : 0,
      hasAnyPrice: priced.length > 0,
      image: mainImage,
      description,
      offerPct,
      optionLabel: multi ? (fam?.option?.[0] ?? 'Opción') : null,
      optionLabelPlural: multi ? (fam?.option?.[1] ?? 'opciones') : null,
    });
  }

  products.sort((a, b) => a.name.localeCompare(b.name, 'es'));

  // ---------- categories.json ----------
  const knownOrder = Object.values(CATEGORY_DEFS).map((c) => c.slug);
  const allDefs = [...Object.values(CATEGORY_DEFS), ...autoCategoryDefs.values(), FALLBACK_CATEGORY];
  const subOrder = Object.values(SUBCATEGORY_LABELS);
  const categoriesOut = allDefs
    .filter((c) => products.some((p) => p.categorySlug === c.slug))
    .sort((a, b) => {
      const ia = knownOrder.indexOf(a.slug);
      const ib = knownOrder.indexOf(b.slug);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    })
    .map((c) => {
      const inCat = products.filter((p) => p.categorySlug === c.slug);
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
      const catPrices = inCat.filter((p) => p.hasAnyPrice).flatMap((p) => [p.priceMin, p.priceMax]);
      return {
        slug: c.slug,
        label: c.label,
        accent: c.accent,
        icon: c.icon,
        count: inCat.length,
        subcategories: [...subMap.entries()]
          .map(([label, count]) => ({ label, slug: slugify(label), count }))
          .sort((a, b) => {
            const ia = subOrder.indexOf(a.label);
            const ib = subOrder.indexOf(b.label);
            if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
            return b.count - a.count;
          }),
        brands: [...brandMap.entries()].map(([slug, v]) => ({ slug, label: v.label, count: v.count })).sort((a, b) => b.count - a.count),
        priceMin: catPrices.length ? Math.min(...catPrices) : 0,
        priceMax: catPrices.length ? Math.max(...catPrices) : 0,
      };
    });

  const offerCount = products.filter((p) => p.isOffer).length;
  for (const name of Object.keys(OFFER_PCT)) {
    if (!products.some((p) => p.name === name)) console.warn(`ATENCIÓN: la oferta "${name}" (scripts/offers.ts) no corresponde a ningún producto de la lista.`);
  }

  // ---------- escribir archivos ----------
  const dataDir = path.join(ROOT, 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'products.json'), JSON.stringify(products, null, 2));
  fs.writeFileSync(
    path.join(dataDir, 'categories.json'),
    JSON.stringify({ categories: categoriesOut, totalProducts: products.length, offerCount }, null, 2)
  );

  const searchIndex = products.map((p) => ({
    id: p.id,
    codigo: p.codigo,
    name: p.name,
    brand: p.brand,
    category: p.category,
    categorySlug: p.categorySlug,
    priceDisplay: p.variants.find((v) => v.hasPrice)?.priceDisplay ?? 'Consultar precio',
    image: p.image,
    codes: p.allCodigos.join(' '),
    options: [...new Set(p.variants.map((v) => v.option).filter(Boolean))].join(' '),
  }));
  fs.writeFileSync(path.join(ROOT, 'public', 'search-index.json'), JSON.stringify(searchIndex));

  // ---------- informe ----------
  const allVariants = products.flatMap((p) => p.variants.map((v) => ({ p, v })));
  const noPrice = allVariants.filter(({ v }) => !v.hasPrice);
  const noPhotoProducts = products.filter((p) => !p.image);
  const noPhotoVariants = allVariants.filter(({ p, v }) => !v.image && p.image);

  console.log(`\nOK. Productos: ${products.length} (${allVariants.length} artículos de la lista)`);
  for (const c of categoriesOut) {
    console.log(`  ${String(c.count).padStart(3)}  ${c.label}`);
    for (const s of c.subcategories) console.log(`        ${String(s.count).padStart(3)}  ${s.label}`);
  }
  console.log(`Ofertas: ${offerCount}`);
  console.log(`Artículos sin precio ("Consultar precio"): ${noPrice.length}`);
  console.log(`Productos sin foto: ${noPhotoProducts.length}${noPhotoProducts.length ? ' -> ' + noPhotoProducts.map((p) => `${p.name} [${p.codigo}]`).join(' · ') : ''}`);
  console.log(`Colores que usan la foto general del producto: ${noPhotoVariants.length}`);
  if (unmatched.length) {
    console.log(`Artículos sin regla en scripts/families.ts (publicados con el nombre de la lista): ${unmatched.length}`);
    for (const it of unmatched) console.log(`  ${it.row.codigo}  ${it.row.descripcion}`);
  }

  // Detalle completo para revisar a mano (no se publica).
  if (process.env.CATALOG_REPORT) {
    const lines = products.flatMap((p) =>
      p.variants.map((v) =>
        [p.category, p.subcategory, p.brand, p.name, v.option ?? '', v.sizeLabel ?? '', v.codigo, v.hasPrice ? v.price : '', v.image ?? ''].join('\t')
      )
    );
    fs.writeFileSync(process.env.CATALOG_REPORT, ['categoria\tsubcategoria\tmarca\tproducto\tvariedad\tpresentacion\tcodigo\tprecio\tfoto', ...lines].join('\n'));
    console.log(`Informe detallado: ${process.env.CATALOG_REPORT}`);
  }
}

main();
