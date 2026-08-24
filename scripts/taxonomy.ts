// Reglas de categorización data-driven, revisables. Prioridad: primer match gana.
// Validado contra el CSV real de ~2.218 productos (ver conversación de diseño):
// sobre 2.184 productos catalogables, solo 8 quedan sin match (0.4%).

import { BRAND_COLORS } from '../src/lib/brand-palette';

export interface CategoryDef {
  slug: string;
  label: string;
  /** color de acento (hex) para esta sección, tomado de la paleta real de la marca */
  accent: string;
  /** ícono lucide-react */
  icon: string;
}

export interface Rule {
  category: string; // debe matchear CategoryDef.label
  subcategory: string | null;
  pattern: RegExp;
}

// Cada categoría toma uno de los 9 colores del isotipo de Centro Pinturería
// (ver src/lib/brand-palette.ts), así el sitio usa la paleta real de la marca
// en vez de colores inventados.
export const CATEGORIES: CategoryDef[] = [
  { slug: 'pinturas', label: 'Pinturas', accent: BRAND_COLORS.rojo, icon: 'PaintBucket' },
  { slug: 'automotor', label: 'Automotor', accent: BRAND_COLORS.azul, icon: 'Car' },
  { slug: 'herramientas-y-accesorios', label: 'Herramientas y Accesorios', accent: BRAND_COLORS.amarillo, icon: 'Wrench' },
  { slug: 'impermeabilizantes-y-revestimientos', label: 'Impermeabilizantes y Revestimientos', accent: BRAND_COLORS.celeste, icon: 'Droplets' },
  { slug: 'maderas', label: 'Maderas', accent: BRAND_COLORS.naranja, icon: 'TreeDeciduous' },
  { slug: 'preparacion-de-superficies', label: 'Preparación de superficies', accent: BRAND_COLORS.violeta, icon: 'Layers' },
  { slug: 'aerosoles', label: 'Aerosoles', accent: BRAND_COLORS.rosa, icon: 'SprayCan' },
  { slug: 'diluyentes-y-aditivos', label: 'Diluyentes y Aditivos', accent: BRAND_COLORS.verdeagua, icon: 'FlaskConical' },
  { slug: 'adhesivos-y-selladores', label: 'Adhesivos y Selladores', accent: BRAND_COLORS.verde, icon: 'Droplet' },
  { slug: 'construccion-en-seco', label: 'Construcción en seco', accent: '#5B6B8C', icon: 'Building2' },
  { slug: 'varios', label: 'Varios', accent: '#8A8F98', icon: 'Package' },
];

/** Tag transversal, NO excluye de su categoría real */
export const OFFER_PATTERN = /LIQUIDACION/i;

/** Códigos que son asientos administrativos/contables del ERP, no productos reales */
export const EXCLUDE_CODES = new Set([
  '2905', '2906', '2907', '2908', '2912', '2913', '2914', '2915', '2916', '2917', '2918', '2919',
  '2920', '2921', '2922', '2929', '2930', '2931', '2933', '2934', '2935', '2936', '3095', '3219',
  '3220', '3221', '3222', '3223', '3269', '3283', '3285', '3305', '3322', '2563',
]);

export const RULES: Rule[] = [
  // ---- Automotor ----
  { category: 'Automotor', subcategory: 'Bases y sistemas', pattern: /AUTOWAVE|WBASE|AUTOCLEAR|AUTOCRYL|AUTOBASE|BICAPA|TRICAPA|\bAM PLUS\b|\bBT\s*\d|BT TECHFLEET|SIK ACLEAR|SIK AW\b|SIK END\b|WASPRIMER|BASE PU ACR|BASE PE\b|BASE SINT\.|BASE COAT\b|BASE TRANSPARENTE MULTIPROPOSITO|ANTISILICON|BASEFIX|KOMBI FILLER|POLYFIBER|POLYKIT|POLYSOFT|POLYSTOP|PRIMING FILLER|\bRRA\b|SINTETICO SIKKENS INDUSTRIAL/i },
  { category: 'Automotor', subcategory: 'Catalizadores y endurecedores', pattern: /CATALIZADOR|ENDURECEDOR|ELASTIFICANTE P\/PLAST/i },
  { category: 'Automotor', subcategory: 'Primers y masillas automotor', pattern: /\bPRIMER\b|MULTIUSE FILLER/i },
  { category: 'Automotor', subcategory: 'Barniz PU automotor', pattern: /BARNIZ\s*P\.?U\.?\b|BARNIZ PU/i },
  { category: 'Automotor', subcategory: 'Poliuretánicos 2x1', pattern: /P\.U\.\s*(FARBEN|SIKKENS)|P\.U\. \d/i },
  { category: 'Automotor', subcategory: 'Lacas', pattern: /^LACA\b/i },
  { category: 'Automotor', subcategory: 'Pulido y accesorios', pattern: /PASTA DE PULID|PASTA DE PULIR|PASTA PARA PULIR|PASTA MATEANTE|AUTOPOLISH|PULIDOR|CERA PROTECTORA PARA AUTOS|CERA LIMPIADORA EN PASTA|CERA PASTE WAX|CERA PROTECTORA LIQUIDA|LUSTRADOR|MASSA DE PULIR|BOINA D\/FACE|COMPLEMENTOS 1-2-G3|COMPUESTO LUSTRE MANUAL/i },
  { category: 'Automotor', subcategory: 'Accesorios de taller', pattern: /SEALER|REGLA MEDIDORA|COMPLEMENTOS - WANDA|VASOS DE CATALISIS|FILTROS CONICOS|COLADOR REUTILIZABLE|PROTECTOR SUBCARROCERIA|PINTURA SUBCARROCERIA|BAJO PUERTA|ROBLINER|SOLUCI[OÓ]N PARA AJUSTE MET[AÁ]LICO|SOPORTE P\/BOINA|ESPECTROFOTOMETRO/i },

  // ---- Maderas ----
  { category: 'Maderas', subcategory: null, pattern: /CETOL|LIJA\s*L[IÍ]QUIDA|REPARA MAD|NIVELA MADERA|IMPREGNANTE|LASUR|PROBELL|\bLUMINOR\b|BARNIZ MARINO|BARNIZ|PRO MADERA|ACEITE DE LINO/i },

  // ---- Impermeabilizantes y Revestimientos ----
  { category: 'Impermeabilizantes y Revestimientos', subcategory: 'Impermeabilizantes', pattern: /IMPERMEABILIZANTE|LIQUITECH|MEMBRANA|SUPERFLEX|EPOXIPISO|PRO LADRILLO|PROTECTOR PARA LADRILLO|POLIURETANO|RECUFLOOR|RECUMIX/i },
  { category: 'Impermeabilizantes y Revestimientos', subcategory: 'Revestimientos texturados', pattern: /TEXTURADO|REVESTIMIENTO|\bTEX\b|RECUPLAST/i },

  // ---- Preparación de superficies ----
  { category: 'Preparación de superficies', subcategory: 'Enduidos y masillas', pattern: /ENDUIDO|MASILLA|FIBREPLAST PARCHE|KIT PARCHE/i },
  { category: 'Preparación de superficies', subcategory: 'Selladores y fijadores', pattern: /SELLADOR|FIJADOR/i },
  { category: 'Preparación de superficies', subcategory: 'Alabastine', pattern: /ALABASTINE/i },
  { category: 'Preparación de superficies', subcategory: 'Fondos e imprimaciones', pattern: /\bFONDO\b|\bFDO\b|IMPRESION NS|TRIMAS IMPRESION|NIVELADORA/i },

  // ---- Diluyentes y Aditivos ----
  { category: 'Diluyentes y Aditivos', subcategory: null, pattern: /DILUYENTE|SOLVENTE|AGUARR[AÁ]S|THINNER|\bADITIVO\b|DESOXIDANTE|DESENGRASANTE|DESOXIMAS|ACIDO MULTIUSO|ACIDO LIMPIADOR|DESTAPA CA[ÑN]ERIA|GEL ANTI SALITRE|SAL DE LIMON|REMOVEDOR EN GEL/i },

  // ---- Adhesivos y Selladores ----
  { category: 'Adhesivos y Selladores', subcategory: null, pattern: /TEKBOND|SILICONA|ADHESIVO|POXIPOL|POXIMIX|UNIPOX|PEGAMENTO|^COLA\b|ESPUMA DE POLIURETANO|POXI RAN|KIT SOLDADURA PLASTICA|PULPITO CARTUCHO/i },

  // ---- Construcción en seco ----
  { category: 'Construcción en seco', subcategory: null, pattern: /\bPLACA\b|\bPERFIL\b|\bTORNILLO\b|FISCHER|MASILLA JUNTA|SIKA MONOTOP|YESO SELENITA/i },

  // ---- Herramientas y Accesorios ----
  { category: 'Herramientas y Accesorios', subcategory: 'Pinceles y rodillos', pattern: /PINCEL|RODILLO|PINROLL/i },
  { category: 'Herramientas y Accesorios', subcategory: 'Lijas y abrasivos', pattern: /\bLIJA\b|NORTON|\bDISCO\b|VIRUTA/i },
  { category: 'Herramientas y Accesorios', subcategory: 'Cintas', pattern: /\bCINTA\b/i },
  { category: 'Herramientas y Accesorios', subcategory: 'Equipos y pistolas', pattern: /PISTOLA|EINHELL|COMPRESOR|BOQUILLA|SOPLETE|MAQUINA WANDA|CARGA MAQUINA/i },
  { category: 'Herramientas y Accesorios', subcategory: 'Espátulas y bandejas', pattern: /ESPATULA|BANDEJA|LLANA|FRATACHO|CEPILLO|RASPADOR/i },
  { category: 'Herramientas y Accesorios', subcategory: 'Protección personal', pattern: /GUANTE|MASCARILLA|BARBIJO|ANTEOJO/i },
  { category: 'Herramientas y Accesorios', subcategory: 'Escaleras y equipos', pattern: /ESCALERA/i },
  { category: 'Herramientas y Accesorios', subcategory: 'Envases y complementos', pattern: /^ENVASE\b|\bPAÑO\b|\bGASA\b|\bVENDA\b|\bESTOPA\b|\bTRAPO\b|\bBIDON\b|\bBOTELLA\b|ABREBALDE|\bCOBERTOR\b|EXTENSOR ACERO|MANTA SINTETICA|CUTTER|ADAPTADOR DE M14|TOLVA|ENTONADORES|TINTA COLORES|FILM PLASTICO PARA ENMASCARAR/i },

  // ---- Aerosoles ----
  { category: 'Aerosoles', subcategory: null, pattern: /AEROSOL|\bKUWAIT\b/i },

  // ---- Pinturas ----
  { category: 'Pinturas', subcategory: 'Especiales', pattern: /PILETAS|PIZARRONES|DEMARCACION VIAL|VINTAGE|\bEFECTO\b|SINTETICO VIAL|EMAPI VIAL|TELA LIQUIDA|MICROCEMENTO|CREATIVE HORMIGON|RELUCE MULTIPROPOSITO|ATACAMA ESCUDO SOLAR|AGREGADO TEXTURA/i },
  { category: 'Pinturas', subcategory: 'Antióxido y convertidores', pattern: /ANTIOXIDO|CONVERT DE OXIDO|GALVIBEN|\bCM ANTIOXIDO\b|\bCM CONVERTIDOR\b|ZINC RICH|\b3 EN 1\b/i },
  { category: 'Pinturas', subcategory: 'Alta temperatura', pattern: /ALTA TEMPERATURA/i },
  { category: 'Pinturas', subcategory: 'Cielorrasos', pattern: /CIELOS?\s*RASOS?/i },
  { category: 'Pinturas', subcategory: 'Esmaltes', pattern: /\bESM\.|ESM\b|ESMALTE|SATINOL|CRISTALBA|CROMATICA|ACOTONE|ALBATROS DOBLE VIDA|SINTETICO SECADO RAPIDO|MULTISUPERFICIE EPOXI/i },
  { category: 'Pinturas', subcategory: 'Látex', pattern: /ALBALATEX|ALBALUX|TONALBA|\bLATEX\b|DURALBA|ALBACRYL|ALBAFRENT|ALBAMATE|ALBAPLAST|ALBAXPERT|CONSTRUCTOR|LOOK FRENTES|LOOK TENDENCIAS|EMACRIL|\bHD INTERIOR\b|BA[ÑN]OS & COCINAS|CENTRO (MATE|PROF|TECHOS)/i },
];

/**
 * Marcas reales conocidas del catálogo. Se usan para no confundir colores o
 * variantes ("NEGRO", "SIN CATALIZADOR") con la marca al tomar el último
 * token tras el guión final del nombre de producto.
 * Mapa: forma canónica en MAYÚSCULAS -> nombre de display.
 */
export const BRANDS: Record<string, string> = {
  ALBA: 'Alba',
  SIKKENS: 'Sikkens',
  EMAPI: 'Emapi',
  FARBEN: 'Farben',
  CETOL: 'Cetol',
  SINTEPLAST: 'Sinteplast',
  WANDA: 'Wanda',
  MERCLIN: 'Merclin',
  NORTON: 'Norton',
  DISTINCION: 'Distinción',
  ROSARPIN: 'Rosarpin',
  TOKE: 'Toke',
  VENEZIA: 'Venezia',
  ZEOCAR: 'Zeocar',
  'RUST OLEUM': 'Rust Oleum',
  'SHERWIN WILLIAMS': 'Sherwin Williams',
  'SHERWIN WILIAMS': 'Sherwin Williams',
  'SHERWIN WILIAMN': 'Sherwin Williams',
  SHERWIN: 'Sherwin Williams',
  'EL GALGO': 'El Galgo',
  GALGO: 'El Galgo',
  EINHELL: 'Einhell',
  TEKBOND: 'Tekbond',
  MOTA: 'Mota',
  PINROLL: 'Pinroll',
  FISCHER: 'Fischer',
  ALPINA: 'Alpina',
  FUEGUINO: 'Fueguino',
  FURGUINO: 'Fueguino',
  VENIATEX: 'Veniatex',
  VINIATEX: 'Veniatex',
  FLIMPEX: 'Flimpex',
  POLACRIN: 'Polacrin',
  KUWAIT: 'Kuwait',
  DIXILINA: 'Dixilina',
  COLORIN: 'Colorín',
  URBANO: 'Urbano',
  APELES: 'Apeles',
  ROTTWEILER: 'Rottweiler',
  ROTTWAILER: 'Rottweiler',
  ROTTWILER: 'Rottweiler',
  ROBERLO: 'Roberlo',
  GEO: 'Geo',
  FORTEX: 'Fortex',
  ANCLAFLEX: 'Anclaflex',
  GEKO: 'Geko',
  '3M': '3M',
  ECOPET: 'Ecopet',
  CASTELBIANCO: 'Castelbianco',
  BOTAFOGO: 'Botafogo',
  SUPERFLEX: 'Superflex',
  TACSA: 'Tacsa',
  PULPITO: 'Pulpito',
  CAUCHET: 'Cauchet',
  UNIPOX: 'Unipox',
  SELENITA: 'Selenita',
  COLORGIN: 'Colorgin',
};

/** Tokens cortos/siglas que NO deben pasar por Title Case (quedan en mayúsculas) */
export const KEEP_UPPER = new Set([
  'PU', 'CC', 'ML', 'GR', 'KG', 'KL', 'LT', 'LTS', 'MM', 'CM', 'MTS', 'HS', 'EU', 'WE', 'SA',
  'NF', 'DF', 'AT', 'HC', 'UC', 'X', 'BT', 'AM', 'SIK', 'RRA', 'G3', '3M', 'UV', 'PVC', 'HVLP',
  'P15', 'P25', 'P400', 'P600', 'P700', 'P900',
]);

/** Conectores que van en minúscula salvo que sean la primera palabra */
export const LOWER_CONNECTORS = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'y', 'en', 'con', 'para', 'p', 'a']);
