// Taxonomía del catálogo. Desde la lista de noviembre 2026 las categorías y
// subcategorías ya no se deducen del nombre: vienen en las columnas "Categorias" y
// "Sub Categorias" del CSV. Acá solo se define cómo se muestran (etiqueta, ícono,
// orden) y cómo se escriben las marcas.

import { BRAND_COLORS } from '../src/lib/brand-palette';

export interface CategoryDef {
  slug: string;
  label: string;
  /** color de acento (hex) para esta sección, tomado de la paleta real de la marca */
  accent: string;
  /** ícono lucide-react (ver src/lib/icons.tsx) */
  icon: string;
}

/**
 * Categorías conocidas, en el orden en que se muestran en el sitio.
 * Clave = valor de la columna "Categorias" del CSV (en mayúsculas, sin tildes).
 * Una categoría nueva en el CSV que no esté acá igual se publica: toma el ícono
 * genérico y queda al final (el build avisa por consola).
 */
export const CATEGORY_DEFS: Record<string, CategoryDef> = {
  PINTURAS: { slug: 'pinturas', label: 'Pinturas', accent: BRAND_COLORS.verde, icon: 'PaintBucket' },
  AUTOMOTOR: { slug: 'automotor', label: 'Automotor', accent: BRAND_COLORS.verde, icon: 'Car' },
  ACCESORIOS: { slug: 'accesorios', label: 'Accesorios', accent: BRAND_COLORS.verde, icon: 'Wrench' },
};

/** Categoría de los artículos que llegan sin categoría en el CSV. */
export const FALLBACK_CATEGORY: CategoryDef = { slug: 'varios', label: 'Varios', accent: BRAND_COLORS.verde, icon: 'Package' };

/**
 * Subcategorías: cómo se escribe cada valor de la columna "Sub Categorias" y en qué
 * orden aparecen dentro de su categoría. Clave en mayúsculas y sin tildes. Las que
 * no estén acá se pasan a "Title Case" y van después, ordenadas por cantidad.
 */
export const SUBCATEGORY_LABELS: Record<string, string> = {
  // Pinturas
  'PAREDES INTERIOR': 'Paredes Interior',
  'PAREDES EXTERIOR': 'Paredes Exterior',
  'METAL Y MADERA': 'Metal y Madera',
  'PROTECCION PARA MADERA': 'Protección para Madera',
  REPARACION: 'Reparación',
  TECHOS: 'Techos',
  PISOS: 'Pisos',
  PILETAS: 'Piletas',
  REVESTIMIENTOS: 'Revestimientos',
  LADRILLOS: 'Ladrillos',
  INDUSTRIA: 'Industria',
  // Automotor
  PRIMER: 'Primer',
  BARNIZ: 'Barniz',
  CATALIZADOR: 'Catalizador',
  LACA: 'Laca',
  RETOQUE: 'Retoque',
  PULIDOS: 'Pulidos',
  'DILUYENTES Y DESENGRASANTES': 'Diluyentes y Desengrasantes',
  // Accesorios
  'ACCESORIOS HOGAR Y OBRA': 'Accesorios Hogar y Obra',
  'ACCESORIOS AUTOMOTOR': 'Accesorios Automotor',
  AEROSOLES: 'Aerosoles',
  'SELLADORES Y ESPUMAS': 'Selladores y Espumas',
  'DILUYENTES Y REMOVEDORES': 'Diluyentes y Removedores',
};

/** Variantes de escritura de una misma subcategoría en el CSV -> clave canónica. */
export const SUBCATEGORY_ALIASES: Record<string, string> = {
  'DILUYENTE Y REMOVEDORES': 'DILUYENTES Y REMOVEDORES',
};

/**
 * Marcas: valor de la columna "Marca" -> nombre a mostrar. Una marca que no esté acá
 * se pasa a "Title Case".
 */
export const BRAND_LABELS: Record<string, string> = {
  ALBA: 'Alba',
  CAVALIERI: 'Cavalieri',
  CETOL: 'Cetol',
  COLORIN: 'Colorín',
  'EL GALGO': 'El Galgo',
  EMAPI: 'Emapi',
  FARBEN: 'Farben',
  FISCHER: 'Fischer',
  GEO: 'Geo',
  LH: 'LH',
  MERCLIN: 'Merclin',
  MIURA: 'Miura',
  MOTA: 'Mota',
  NORTON: 'Norton',
  PACLIN: 'Paclin',
  POXIMIX: 'Poximix',
  PULPITO: 'Pulpito',
  ROSARPIN: 'Rosarpin',
  ROTTWEILER: 'Rottweiler',
  SELENITA: 'Selenita',
  'SHERWIN WILLIAMS': 'Sherwin Williams',
  SIKKENS: 'Sikkens',
  SINTEPLAST: 'Sinteplast',
  TOKE: 'Toke',
  VENEZIA: 'Venezia',
  WANDA: 'Wanda',
  ZEOCAR: 'Zeocar',
};

/**
 * Cómo aparece escrita cada marca al final de la descripción ("... - SHERWIN WILIAMS",
 * "... - GALGO"), para poder sacarla del nombre. Clave = valor de la columna "Marca".
 */
export const BRAND_SUFFIXES: Record<string, string[]> = {
  'EL GALGO': ['EL GALGO', 'GALGO'],
  ROTTWEILER: ['ROTTWEILER', 'ROTTWAILER', 'ROTTWILER'],
  'SHERWIN WILLIAMS': ['SHERWIN WILLIAMS', 'SHERWIN WILIAMS', 'SHERWIN WILIAMN', 'SHERWIN'],
  VENEZIA: ['SITEX VENEZIA', 'VENEZIA'],
};

/** Tokens cortos/siglas que NO deben pasar por Title Case (quedan en mayúsculas). */
export const KEEP_UPPER = new Set([
  'PU', 'HS', 'AT', 'UV', 'PVC', 'LH', 'RRA', 'SRA', 'LP', 'CF', '1K', '2K', 'AM', 'T41', 'T50', 'CX4',
  'P25', 'P35', 'M700', 'R244', 'K246', 'T277', 'T419', 'T499', 'A275', 'A396', 'F227', 'F247', 'PU40', 'CM',
]);

/** Conectores que van en minúscula salvo que sean la primera palabra. */
export const LOWER_CONNECTORS = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'y', 'en', 'con', 'para', 'p', 'a', 'al', 'x']);

/**
 * La lista viene en mayúsculas, sin tildes y con abreviaturas. Diccionario de
 * palabras -> forma correcta, para nombres y opciones que se generan solos.
 */
export const WORD_FIXES: Record<string, string> = {
  ACRILICO: 'Acrílico',
  ACRIL: 'Acrílico',
  LATEX: 'Látex',
  SINTETICO: 'Sintético',
  SINTETICA: 'Sintética',
  PLASTICO: 'Plástico',
  PLASTICA: 'Plástica',
  PLASTICOS: 'Plásticos',
  METALICO: 'Metálico',
  POLIESTER: 'Poliéster',
  POLIURETANICO: 'Poliuretánico',
  OXIDO: 'Óxido',
  ANTIOXIDO: 'Antióxido',
  INGLES: 'Inglés',
  LIQUIDO: 'Líquido',
  LIQUIDA: 'Líquida',
  RAPIDO: 'Rápido',
  RAPIDA: 'Rápida',
  SOLIDO: 'Sólido',
  SOLIDOS: 'Sólidos',
  CATALISIS: 'Catálisis',
  CONICOS: 'Cónicos',
  ESPATULA: 'Espátula',
  ACIDO: 'Ácido',
  LIMON: 'Limón',
  AGUARRAS: 'Aguarrás',
  SUBCARROCERIA: 'Subcarrocería',
  TRANSITO: 'Tránsito',
  BANOS: 'Baños',
  PANO: 'Paño',
  BRILL: 'Brillante',
  SAT: 'Satinado',
  TRAD: 'Tradicional',
  MARTILL: 'Martillado',
  STANDAR: 'Standard',
  PREMIUN: 'Premium',
  PROFECIONAL: 'Profesional',
  MABUAL: 'Manual',
  ANTIGOTAI: 'Antigota',
  OPALECENTE: 'Opalescente',
  PERFORMACE: 'Performance',
  POLIU: 'Poliuretánica',
  IMPERM: 'Impermeabilizante',
  MULTISUP: 'Multisuperficie',
  RECUB: 'Recubrimiento',
  OSCU: 'Oscuro',
  SEC: 'Secado',
  ESM: 'Esmalte',
  SINT: 'Sintético',
  ACRI: 'Acrílico',
};
