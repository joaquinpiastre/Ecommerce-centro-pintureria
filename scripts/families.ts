/**
 * Productos del catálogo: cómo se agrupan los artículos de la lista.
 *
 * Cada entrada es UN producto del ecommerce. Los artículos de la lista que solo
 * cambian en color, número de pincel, grano de lija, medida o presentación (litros,
 * kilos) se juntan adentro como variantes, para que el cliente elija en la misma
 * ficha en vez de ver un producto repetido por cada color.
 *
 * - match:  regex contra la descripción del CSV ya limpia: en mayúsculas, con un solo
 *           espacio entre palabras y sin la marca del final ("ALBALATEX MATE BLANCO - 04 L").
 * - brand:  (opcional) restringe el match a una marca (valor de la columna "Marca").
 * - option: nombre de la variedad en singular y plural, ej. ['Color', 'colores'].
 * - strip:  parte de la descripción que se descarta; lo que queda (sin la presentación)
 *           es la variedad. Sirve cuando el texto del CSV ya es prolijo.
 * - opt:    función que devuelve la variedad cuando hay que armarla a mano.
 * - size:   presentación fija, cuando el CSV no la trae o la trae sin unidad.
 * - order:  (opcional) orden manual de las variedades.
 *
 * TODOS los artículos de la lista se publican: los que no entran en ninguna regla
 * salen como producto propio con el nombre de la lista (el build los lista por
 * consola para sumarlos acá). Después de tocar este archivo: `npm run build:catalog`.
 */
export interface Family {
  name: string;
  match: RegExp;
  brand?: string;
  option?: [string, string];
  strip?: RegExp;
  opt?: (desc: string) => string | null;
  size?: string | ((desc: string) => string | null);
  order?: string[];
}

const COLOR: [string, string] = ['Color', 'colores'];
const NUM: [string, string] = ['Número', 'números'];
const GRAIN: [string, string] = ['Grano', 'granos'];
const SIZE: [string, string] = ['Medida', 'medidas'];
const TYPE: [string, string] = ['Tipo', 'tipos'];
const FINISH: [string, string] = ['Terminación', 'terminaciones'];

/** "… N100", "… N°36 F227", "… GRANO 80" -> "Grano 100". */
const grain = (d: string) => {
  const m = /(?:GRANO\s*(?:N\s*°?\s*)?|\bN\s*°?\s*)(\d+)/.exec(d);
  return m ? `Grano ${m[1]}` : null;
};
/** "… N°10", "… N10", "… X 10" -> "N° 10". */
const number = (d: string) => {
  const m = /(?:\bN\s*°?\s*|\bX\s+)(\d+)\s*$/.exec(d);
  return m ? `N° ${m[1]}` : null;
};
/** "… N24" -> "24 mm" (ancho de la cinta). */
const tapeWidth = (d: string) => {
  const m = /\bN\s*(\d+)\s*$/.exec(d);
  return m ? `${m[1]} mm` : null;
};
/** "… 10CM" -> "10 cm". */
const cm = (d: string) => {
  const m = /(\d+)\s*CM\b/.exec(d);
  return m ? `${m[1]} cm` : null;
};
/** Devuelve la primera etiqueta cuya regex matchea. */
const pick =
  (...rules: [RegExp, string][]) =>
  (d: string) =>
    rules.find(([re]) => re.test(d))?.[1] ?? null;

export const FAMILIES: Family[] = [
  // ============================== PINTURAS ==============================
  // ---- Paredes interior ----
  { name: 'Alabastine Fondo 1-2-3', match: /^ALABASTINE FONDO/ },
  { name: 'Látex para Cielorrasos Standard Blanco', match: /^ALBA CIELOS RASOS/ },
  { name: 'Fijador Sellador Premium', match: /^ALBA FIJADOR SELLADOR/ },
  { name: 'Multisuperficie Epoxi Base Agua Blanco', match: /^ALBA MULTISUPERFICIE EPOXI/ },
  { name: 'Albacryl Látex Interior Mate Blanco', match: /^ALBACRYL/ },
  { name: 'Albalatex Design Mate Blanco', match: /^ALBALATEX DESIGN/ },
  { name: 'Albalatex Mate Blanco', match: /^ALBALATEX MATE/ },
  { name: 'Albalatex Satinado Blanco', match: /^ALBALATEX SATINADO/ },
  { name: 'Albalatex Ultra Lavable Blanco', match: /^ALBALATEX ULTRA/ },
  { name: 'Albalux Balance Esmalte al Agua', match: /^ALBALUX BALANCE/, option: COLOR, strip: /^ALBALUX BALANCE/ },
  { name: 'Albaxpert Látex Mate Blanco', match: /^ALBAXPERT/ },
  { name: 'Baños & Cocinas Mate Blanco', match: /^BA[ÑN]OS & COCINAS/ },
  { name: 'Centro Fijador al Agua', match: /^CENTRO FIJADOR/ },
  { name: 'Centro Mate Superior Antihongo Blanco', match: /^CENTRO MATE SUPERIOR/ },
  { name: 'Látex Interior Satinado Superlavable Blanco', match: /^LATEX INT SATINADO SUPERLAVABLE/, brand: 'PACLIN' },
  { name: 'Recuplast Interior Satinado', match: /^RECUPLAST INTERIOR/ },
  // ---- Paredes exterior ----
  { name: 'Fijador al Aguarrás Standard', match: /^ALBA FIJADOR AL AGUARRAS/ },
  { name: 'Albafrent Frentes y Muros Blanco', match: /^ALBAFRENT/ },
  { name: 'Centro Profesional Látex Exterior/Interior', match: /^CENTRO PROF/ },
  { name: 'Constructor Látex Interior/Exterior Mate Blanco', match: /^CONSTRUCTOR INT/ },
  { name: 'Duralba Frentes y Muros Blanco', match: /^DURALBA FRENTES/ },
  { name: 'Aquastop Pintura Antisalitre y Antihumedad', match: /^AQUASTOP/ },
  { name: 'Recuplast Frentes', match: /^RECUPLAST FRENTES/ },
  // ---- Metal y madera ----
  {
    name: 'Albalux 2 en 1 Forja y Martillado',
    match: /^ALBALUX 2 EN 1/,
    option: FINISH,
    opt: pick([/FORJA/, 'Forja Negro'], [/MARTILL/, 'Martillado Negro']),
  },
  { name: 'Albalux Diamante 3 en 1', match: /^ALBALUX DIAM 3EN1/, option: COLOR, strip: /^ALBALUX DIAM 3EN1/ },
  { name: 'Satinol Balance Esmalte al Agua Blanco', match: /^SATINOL BALANCE/ },
  { name: 'Satinol Esmalte Satinado Blanco', match: /^SATINOL BLANCO/ },
  { name: 'Chrom Metal Antióxido', match: /^CM ANTIOXIDO/, option: COLOR, strip: /^CM ANTIOXIDO/ },
  { name: 'Chrom Metal Convertidor de Óxido Blanco', match: /^CM CONVERTIDOR/ },
  { name: 'Cromática Esmalte Sintético', match: /^CROMATICA/, option: COLOR, strip: /^CROMATICA/ },
  {
    name: 'Esmalte Sintético Farben',
    match: /^ESM\.\s*SINT\./,
    brand: 'FARBEN',
    option: COLOR,
    opt: pick([/BLANCO SATINADO/, 'Blanco Satinado'], [/JOHN DEERE/, 'Verde John Deere'], [/ALUMINIO/, 'Aluminio Opalescente']),
  },
  { name: 'Trieffect Esmalte 3 en 1', match: /^ESMALTE 3 EN 1/, brand: 'PACLIN', option: COLOR, strip: /^ESMALTE 3 EN 1/ },
  // ---- Protección para madera ----
  { name: 'Albatros Barniz Marino', match: /^ALBATROS BARNIZ MARINO/ },
  { name: 'Albatros Doble Vida', match: /^ALBATROS DOBLE VIDA/ },
  { name: 'Cristalba Barniz al Agua', match: /^CRISTALBA AL AGUA/ },
  { name: 'Cristalba Barniz Brillante', match: /^CRISTALBA BRILLANTE/ },
  { name: 'Cetol Classic Brillante', match: /^CETOL CLASSIC BRILLANTE/, option: COLOR, strip: /^CETOL CLASSIC BRILLANTE/ },
  { name: 'Cetol Classic Satinado', match: /^CETOL CLASSIC SATINADO/, option: COLOR, strip: /^CETOL CLASSIC SATINADO/ },
  { name: 'Cetol Duración Extrema Brillante Natural', match: /^CETOL DURACION EXTREMA/ },
  {
    name: 'Cetol Parquet Plastificante para Pisos',
    match: /^CETOL PARQUET/,
    option: FINISH,
    opt: pick([/BRILLANTE/, 'Brillante'], [/SATINADO/, 'Satinado']),
  },
  { name: 'Pro Madera Barniz', match: /^PRO MADERA BARNIZ/, option: FINISH, strip: /^PRO MADERA BARNIZ/ },
  { name: 'Pro Madera Tratamiento Protector', match: /^PRO MADERA TRAT PROT/, option: COLOR, strip: /^PRO MADERA TRAT PROT/ },
  // ---- Reparación ----
  { name: 'Alabastine Repara Paredes', match: /^ALABASTINE REPARA/ },
  { name: 'Enduido + Masilla', match: /^ALBA ENDUIDO \+ MASILLA/ },
  { name: 'Enduido Exterior Premium', match: /^ALBA ENDUIDO EXT/ },
  { name: 'Centro Enduido + Masilla', match: /^CENTRO ENDUIDO/ },
  { name: 'Masilla Lista para Placa de Yeso', match: /^MASILLA LISTA/, brand: 'ALBA' },
  { name: 'Poximix Exterior', match: /^POXIMIX EXTERIOR/ },
  { name: 'Poximix Interior', match: /^POXIMIX INTERIOR/ },
  // ---- Piletas ----
  {
    name: 'Pintura para Piletas Acrílica',
    match: /^PILETAS ACRILICO/,
    option: COLOR,
    opt: pick([/BLANCO/, 'Blanco'], [/CELESTE PROF/, 'Celeste Profundo'], [/CELESTE/, 'Celeste']),
    order: ['Celeste', 'Celeste Profundo', 'Blanco'],
  },
  { name: 'SP-5 Ácido Limpiador Multi Acción', match: /^ACIDO LIMPIADOR/ },
  {
    name: 'Liquitech Membrana para Piscinas',
    match: /^PISCINAS MEMBRANA LIQUITECH/,
    option: COLOR,
    opt: pick([/AZUL CARIBE/, 'Azul Caribe'], [/BLANCO/, 'Blanco']),
  },
  { name: 'Pintura para Piscinas Multisuperficie', match: /^PINTURA P\/ PISCINA/, option: COLOR, strip: /^PINTURA P\/ PISCINA MULTISUP/ },
  // ---- Techos ----
  { name: 'Superflex Techos y Muros Blanco', match: /^SUPERFLEX/ },
  {
    name: 'Liquitech Masilla Cauchogoma',
    match: /^LIQUITECH MASILLA CAUCHOGOMA/,
    option: COLOR,
    opt: pick([/BLANCO/, 'Blanco'], [/GRIS/, 'Gris']),
    size: (d) => (/CARTUCHO 310GR/.test(d) ? 'Cartucho 310 g' : null),
  },
  { name: 'Liquitech Membrana Autoadhesiva', match: /^LIQUITECH MEMBRANA AUTOADHESIVA/, size: '15 cm x 10 m' },
  { name: 'Liquitech Membrana Poliuretánica en Pasta Negra', match: /^LIQUITECH MEMBRANA POLIU/ },
  { name: 'Liquitech Membrana Sellatodo en Aerosol Blanco', match: /^LIQUITECH MEMBRANA SELLATODO/ },
  { name: 'Thermo Delay Impermeabilizante Poliuretánico Blanco', match: /^IMPERM\. TERMO DELAY/ },
  // ---- Pisos ----
  { name: 'Pisos Látex Acrílico', match: /^PISOS LATEX ACRIL/, option: COLOR, strip: /^PISOS LATEX ACRIL/ },
  {
    name: 'Brikol Pisos',
    match: /^BRIKOL PISOS/,
    option: TYPE,
    opt: pick([/ALTO TRANSITO ROJO/, 'Alto Tránsito Rojo'], [/INCOLORO/, 'Incoloro']),
  },
  { name: 'Liquitech Pintura para Pisos Deportivos Verde Mendoza', match: /^LIQUITECH PINTURA PARA PISOS DEPORTIVOS/ },
  // ---- Industria ----
  { name: 'Hidroesmalte Epoxi Pisos y Paredes Negro', match: /^HIDROESMALTE EPOXI/ },
  { name: 'Sintepox Epoxi Recufloor Alto Tránsito (Kit)', match: /^KIT SINTEPOX/, option: COLOR, strip: /^KIT SINTEPOX EPOXI RECUFLOOR AT\./ },
  // ---- Revestimientos ----
  {
    name: 'Tex Travertino Fino',
    match: /^TEX TRAVERTINO/,
    option: COLOR,
    opt: pick([/BASE INTENSA/, 'Base Intensa'], [/BLANCO/, 'Blanco']),
    order: ['Blanco', 'Base Intensa'],
  },
  { name: 'Texturado Marmolato Fino Blanco', match: /^TEXTURADO MARMOLATO/ },
  { name: 'Texturado Travertino Mediano Impertex', match: /^TEXTURADO TRAVERTINO/ },
  // ---- Ladrillos ----
  { name: 'Liquitech Impermeabilizante para Ladrillo Natural', match: /^LIQUITECH IMPERMEABILIZANTE PARA LADRILLO/ },

  // ============================== AUTOMOTOR ==============================
  // ---- Primer ----
  { name: 'Primer PU Gris Alto Sólido 4x1 (513.410)', match: /^PRIMER PU CZA ALTO SOLIDO/ },
  { name: 'Primer PU Gris 5x1 (513.210)', match: /^PRIMER PU GRIS 5X1/ },
  { name: 'Primer PU HS Gris Oscuro Secado Rápido (513.512)', match: /^PRIMER PU HS GRIS OSCU/ },
  { name: 'Primer Universal Farben', match: /^PRIMER UNIVERSAL/, brand: 'FARBEN', option: COLOR, opt: pick([/BLANCO/, 'Blanco'], [/GRIS/, 'Gris'], [/NEGRO/, 'Negro']) },
  { name: 'Wash Primer (517.600)', match: /^WASH PRIMER/, brand: 'FARBEN' },
  {
    name: 'Primer Surfacer Rápido',
    match: /^PRIMER SURFACER/,
    option: COLOR,
    opt: pick([/GRIS/, 'Gris'], [/ROJO OXIDO/, 'Rojo Óxido']),
  },
  { name: '1K All Plastic Primer', match: /^1K ALL PLASTIC PRIMER/, size: (d) => (/AEROSOL/.test(d) ? 'Aerosol' : null) },
  { name: 'Multiuse Filler HS', match: /^MULTIUSE FILLER/, size: (d) => (/1L DARK GREY/.test(d) ? '1 L Dark Grey' : null) },
  { name: 'Priming Filler 680', match: /^PRIMING FILLER/ },
  { name: 'Spotprimer Aerosol', match: /^SPOTPRIMER/, size: 'Aerosol' },
  { name: 'Washprimer 1K CF', match: /^WASH?PRIMER 1K\s?CF/, size: (d) => (/AEROSOL/.test(d) ? 'Aerosol' : 'Lata') },
  { name: 'Primer Adherente para Plásticos', match: /^PRIMER ADHERENTE/ },
  { name: 'Primer Alto Sólido 1K', match: /^PRIMER ALTO SOLIDO 1K/, option: COLOR, strip: /^PRIMER ALTO SOLIDO 1K/ },
  {
    name: 'Primer Universal 1K',
    match: /^PRIMER UNIVERSAL 1 K/,
    brand: 'SINTEPLAST',
    option: COLOR,
    opt: pick([/BLANCO/, 'Blanco'], [/GRIS/, 'Gris'], [/NEGR[AO]/, 'Negro']),
  },
  { name: 'Primer PU 5100 HS Gris', match: /^PRIMER PU 5100 HS GRIS/ },
  { name: 'Primer PU 5100 HS', match: /^PRIMER PU 5100 HS/ },
  // ---- Retoque ----
  { name: 'Masilla Pequeños Reparos', match: /^MASILLA PEQUE[ÑN]OS REPAROS/ },
  { name: 'Kombi Filler', match: /^KOMBI FILLER/ },
  { name: 'Polyfiber', match: /^POLYFIBER/ },
  { name: 'Polykit Classic Set', match: /^POLYKIT/ },
  { name: 'Polysoft Plastic Set', match: /^POLYSOFT/ },
  { name: 'Polystop LP Set', match: /^POLYSTOP/ },
  { name: 'Fibreplast Parche en Pasta', match: /^FIBREPLAST/ },
  { name: 'Kit Parche', match: /^KIT PARCHE/ },
  { name: 'Masilla Poliéster Extra Fina', match: /^MASILLA POLIESTER EXTRA FINA/ },
  { name: 'Masilla Poliéster Multiuso', match: /^MASILLA POLIESTER MULTIUSO/ },
  {
    name: 'Masilla Universal Piroxilina',
    match: /^MASILLA UNIVERSAL/,
    option: TYPE,
    opt: pick([/R[ÁA]PIDA/, 'Rápida Gris'], [/ROJA/, 'Roja']),
  },
  { name: 'Pintura Subcarrocería Negra', match: /^PINTURA SUBCARROCERIA/ },
  { name: 'Masilla Aluminio', match: /^MASILLA ALUMINIO/ },
  { name: 'Masilla Finish', match: /^MASILLA FINISH/ },
  { name: 'Masilla Poliéster Azul', match: /^MASILLA POLIESTER AZUL/ },
  // ---- Pulidos ----
  { name: 'Autopolish Cera Protectora para Autos', match: /^AUTOPOLISH CERA/ },
  { name: 'Autopolish Lustre Intenso Clásico', match: /^AUTOPOLISH LUSTRE/ },
  { name: 'Cera Limpiadora en Pasta', match: /^CERA LIMPIADORA/ },
  { name: 'Cera Protectora Líquida', match: /^CERA PROTECTORA LIQUIDA/, size: '500 ml' },
  { name: 'Compuesto Pulidor Extra Fuerte (539.100)', match: /^COMPOSTO PULIDOR/, size: '1 kg' },
  { name: 'Líquido Pulidor Corte Rápido (Paso 1)', match: /^LIQUIDO PULIDOR/ },
  { name: 'Pulidor Fino (Paso 2)', match: /^PULIDOR FINO/, size: '' },
  { name: 'Lustrador Doble Acción (Paso 3)', match: /^LUSTRADOR/ },
  { name: 'Masa de Pulir Extra Fuerte (539.110)', match: /^MASSA DE PULIR/, size: '1 kg' },
  { name: 'Pasta para Pulir 106 al Agua', match: /^PASTA PARA PULIR 106/ },
  { name: 'Pasta de Pulir Gruesa', match: /^PASTA DE PULIR GRUESA/ },
  { name: 'Pasta para Pulir Fina', match: /^PASTA PARA PULIR FINA/ },
  // ---- Catalizador ----
  { name: 'Catalizador Vinílico para Wash Primer (577.000)', match: /^CATALIZADOR VINILICO/ },
  { name: 'Endurecedor PU Alta Performance (573.009)', match: /^ENDURECEDOR PU\/ALTA PERFORMANCE/ },
  { name: 'Endurecedor para Primer PU Alifático (573.790)', match: /^ENDURECEDOR P\/ PRIMER PU/ },
  { name: 'Endurecedor para PU (573.008)', match: /^ENDURECEDOR P\/ PU\b/ },
  { name: 'Endurecedor PU Acelerado (573.950)', match: /^ENDURECEDOR PU ACELERADO/ },
  { name: 'Autocryl Endurecedor P25', match: /^AUTOCRYL ENDURECEDOR P25/ },
  { name: 'Autocryl Endurecedor P35', match: /^AUTOCRYL ENDURECEDOR P35/ },
  { name: 'Endurecedor PU 3093', match: /^ENDURECEDOR (PU )?3093/ },
  // ---- Diluyentes y desengrasantes ----
  { name: 'Diluyente Poliéster 8400', match: /^DILUYENTE POLIESTER 8400/ },
  { name: 'AM Plus Reducer Medium', match: /^AM PLUS REDUCER/ },
  { name: 'RRA Rapid Repair Agent', match: /^RRA\b/ },
  { name: 'Thinner M700', match: /^THINNER M700/ },
  { name: 'Thinner SRA', match: /^THINNER SRA/ },
  { name: 'Desoximas Desoxidante Desengrasante', match: /^DESOXIMAS/ },
  { name: 'Thinner Oro Refinish Premium', match: /^THINNER ORO/ },
  { name: 'Trimas Desengrasante', match: /^TRIMAS DESENGRASANTE/ },
  { name: 'Diluyente para Poliéster y PU 4030', match: /^DILUYENTE P\/POLIESTER/ },
  // ---- Barniz ----
  { name: 'Barniz PU Acrílico HS Alta Performance 2x1 (543.890)', match: /^BARNIZ PU ACRI\. HS/ },
  { name: 'Barniz PU Acrílico Altos Sólidos 2x1 (543.850)', match: /^BARNIZ PU ACRIL\. ALTOS SOLIDOS/ },
  { name: 'Kit Barniz 8937 + Catalizador 065', match: /^KIT BARNIZ 8937/, size: '900 ml' },
  { name: 'Autoclear Plus HS', match: /^AUTOCLEAR PLUS HS/ },
  { name: 'Barniz PU 5100', match: /^BARNIZ PU 5100/ },
  { name: 'Barniz PU 7100', match: /^BARNIZ PU 7100/ },
  // ---- Laca ----
  { name: 'Laca Nitro Grafito para Llantas', match: /^LACA NITRO GRAFITO/, size: '900 ml' },
  {
    name: 'Laca Nitrosintética',
    match: /^LACA NITROSINTETICA/,
    option: COLOR,
    opt: pick(
      [/ALUMINIO PARA LLANTAS/, 'Aluminio para Llantas'],
      [/NEGRO BRILLANTE/, 'Negro Brillante'],
      [/NEGRO SATINADO/, 'Negro Satinado'],
      [/BLANCA BRILLANTE/, 'Blanco Brillante']
    ),
  },

  // ============================== ACCESORIOS ==============================
  // ---- Hogar y obra: pinceles y rodillos ----
  { name: 'Pincel Gold', match: /^PINCEL GOLD/, option: NUM, opt: number },
  { name: 'Pincel Persianero', match: /^PINCEL PERSIANERO/, option: NUM, opt: number },
  { name: 'Rodillo Cubremás Naranja N° 22', match: /^RODILLO CUBREMAS/ },
  { name: 'Rodillo Cuero Lanar N° 22', match: /^RODILLO CUERO LANAR/ },
  { name: 'Rodillo Foam', match: /^RODILLO FOAM/, option: NUM, opt: (d) => `N° ${/N\s*°?\s*(\d+)/.exec(d)?.[1]}` },
  { name: 'Rodillo Predator Antigota N° 22', match: /^RODILLO PREDATOR/ },
  { name: 'Pincel Yago V1 Blanco', match: /^PINCEL YAGO V1/, option: NUM, opt: number },
  { name: 'Pincel Yago V2 Naranja/Celeste', match: /^PINCEL YAGO V2/, option: NUM, opt: number },
  { name: 'Pinceleta Yago Celeste N° 40', match: /^PINCELETA YAGO/ },
  { name: 'Mini Rodillo Antigota', match: /^MINI RODILLO ANTIGOTA/, option: SIZE, opt: cm },
  { name: 'Mini Rodillo Epoxi', match: /^MINI RODILLO EPOXI/, option: SIZE, opt: cm },
  { name: 'Rodillo Antigota 22 cm', match: /^RODILLO ANTIGOTA 22CM/ },
  { name: 'Rodillo Antigota Profesional 22 cm T50', match: /^RODILLO ANTIGOTA PROFECIONAL/ },
  {
    name: 'Rodillo Epoxi 22 cm',
    match: /^RODILLO EPOXI/,
    option: TYPE,
    opt: (d) => (/ALTO SOLIDO/.test(d) ? 'Alto Sólido' : 'Estándar'),
    order: ['Estándar', 'Alto Sólido'],
  },
  { name: 'Rodillo Sintético Profesional 22 cm', match: /^RODILLO SINTETICO PROFESIONAL/ },
  {
    name: 'Bandeja para Pintor',
    match: /^BANDEJA/,
    option: TYPE,
    opt: pick([/COLGAR/, 'De Colgar'], [/MINI/, 'Mini'], [/PLANA/, 'Plana']),
    order: ['Plana', 'De Colgar', 'Mini'],
  },
  { name: 'Kit Esencial El Vencedor', match: /^KIT ESENCIAL/ },
  // ---- Hogar y obra: herramientas y protección ----
  { name: 'Trapo Cavalieri', match: /^TRAPO CAVALIERI/ },
  { name: 'Llana Plástica de Alto Impacto 12 x 30', match: /^LLANA PLASTICA/ },
  {
    name: 'Espátula de Acero',
    match: /^ESPATULA ACERO/,
    option: SIZE,
    opt: (d) => /N°\s*(\d+(?:\s+\d+\/\d+)?)"/.exec(d)?.[1].concat('"') ?? null,
  },
  { name: 'Cepillo de Acero', match: /^CEPILLO DE ACERO/ },
  { name: 'Cobertor Plástico', match: /^COBERTOR/, option: SIZE, opt: (d) => /(\d+)X(\d+)M/.exec(d)?.slice(1, 3).join(' x ').concat(' m') ?? null },
  { name: 'Manta Sintética 1 x 25 m', match: /^MANTA SINTETICA/ },
  { name: 'Venda Sintética', match: /^VENDA SINTETICA/, option: SIZE, opt: (d) => /(\d+)\*(\d+)CM/.exec(d)?.slice(1, 3).join(' x ').concat(' cm') ?? null },
  { name: 'Cutter Metálico', match: /^CUTTER METALICO/ },
  { name: 'Yeso Selenita Bolsa Azul', match: /^YESO SELENITA/ },
  { name: 'Cinta Bifaz Blanca', match: /^CINTA BIFAZ/, size: '20 mm x 2 m' },
  { name: 'Cinta de Enmascarar Azul Premium', match: /^CINTA AZUL PREMIU[MN]/, option: SIZE, opt: tapeWidth },
  // ---- Hogar y obra: lijas y discos ----
  { name: 'Disco de Corte Standard 115 x 1,6 mm T41', match: /^DISCO DE CORTE/ },
  { name: 'Disco de Fibra 115 x 22 mm F227', match: /^DISCO FIBRA 115X22/, option: GRAIN, opt: grain },
  { name: 'Disco de Fibra 180 x 22 mm F247', match: /^DISCO FIBRA 180X22/, option: GRAIN, opt: grain },
  { name: 'Disco Flap Standard R244 115 x 22 mm', match: /^DISCO FLAP STANDARD R244/, option: GRAIN, opt: (d) => grain(d.replace(/R244\s+115X22/, '')) },
  { name: 'Disco Strip Beartex 115 x 22 mm Extra Grueso', match: /^DISCO STRIP BEARTEX/ },
  { name: 'Disco Flap Óxido de Aluminio 115 mm', match: /^DISCO FLAP OXIDO DE ALUMINIO/, option: GRAIN, opt: grain },
  { name: 'Hoja Tela Esmeril K246', match: /^HOJA TELA ESMERIL/, option: GRAIN, opt: (d) => grain(d.replace('K246', '')) },
  { name: 'Lija al Agua T277', match: /^LIJA AL AGUA NOR T277/, option: GRAIN, opt: (d) => grain(d.replace('T277', '')) },
  { name: 'Lija Azul al Agua T419 / T499', match: /^LIJA AZUL/, option: GRAIN, opt: (d) => grain(d.replace(/T4[19]9/, '')) },
  // ---- Accesorios automotor ----
  { name: 'Paño Miura Naranja', match: /^PA[ÑN]O MIURA/ },
  { name: 'Control de Lijado en Seco', match: /^CONTROL DE LIJADO/ },
  { name: 'Filtros Cónicos de Papel 190 Micrones', match: /^FILTROS CONICOS/, size: '' },
  { name: 'Lija en Disco A275', match: /^LIJA DISCO A275/, option: GRAIN, opt: (d) => grain(d.replace('A275', '')) },
  { name: 'Lija en Disco A396 5"', match: /^LIJA DISCO A396/, option: GRAIN, opt: (d) => grain(d.replace(/A396\s+5\S?/, '')) },
  { name: 'Reductor de Impacto 152 mm 6 Agujeros', match: /^REDUCTOR DE IMPACTO/ },
  { name: 'Taco Lijador Manual de Goma 70 x 135 mm', match: /^TACO LIJADOR/ },
  { name: 'Cinta de Enmascarar Automotor Blanca', match: /^CINTA AUTOMOTOR BLANCA/, option: SIZE, opt: tapeWidth },
  { name: 'Cinta de Enmascarar Automotor Premium Amarilla', match: /^CINTA AUTOMOTOR PREMIUM AMARILLA/, option: SIZE, opt: tapeWidth },
  { name: 'Colador Reutilizable', match: /^COLADOR REUTILIZABLE/ },
  {
    name: 'Film Plástico para Enmascarar',
    match: /^FILM PLASTICO PARA ENMASCARAR/,
    option: TYPE,
    opt: (d) => (/CINTA CREPE/.test(d) ? 'Con Cinta Crepe 1,4 x 25 m' : '4 x 150 m'),
    order: ['4 x 150 m', 'Con Cinta Crepe 1,4 x 25 m'],
    size: '',
  },
  { name: 'Vasos de Catálisis', match: /^VASOS DE CATALISIS/ },
  { name: 'Espátula de Goma Azul', match: /^ESPATULA DE GOMA/ },
  { name: 'Espátula de Plástico', match: /^ESPATULA DE PLASTICO/ },
  {
    name: 'Paño de Cordero 7"',
    match: /^PA[ÑN]O DE CORDERO/,
    option: TYPE,
    opt: pick([/ABROJO/, 'Con Abrojo'], [/DOBLE/, 'Doble']),
  },
  { name: 'Paño de Goma Espuma Negro', match: /^PA[ÑN]O DE GOMA ESPUMA/, option: SIZE, opt: (d) => /(\d+)\s*["`]/.exec(d)?.[1].concat('"') ?? null },
  // ---- Aerosoles ----
  { name: 'Aerosol Toke', match: /^AEROSOL TOKE/, option: COLOR, strip: /^AEROSOL TOKE/ },
  // ---- Selladores y espumas ----
  { name: 'Espuma de Poliuretano', match: /^ESPUMA POLIURETANO/ },
  { name: 'Sellador Neutro', match: /^SELLADOR NEUTRO/, option: COLOR, opt: pick([/BLANC/, 'Blanco'], [/NEGRO/, 'Negro']) },
  { name: 'Sellador para Canaleta', match: /^SELLADOR PARA CANALETA/ },
  { name: 'Sellador Pegado Total', match: /^SELLADOR PEGADO TOTAL/ },
  { name: 'Sellador PU40 Construcción Blanco', match: /^SELLADOR PU40/ },
  { name: 'Liquitech Sella Grietas para Piscinas', match: /^SELLA GRIETAS PARA PISCINAS/, size: 'Cartucho' },
  { name: 'Liquitech Sellador Fijador para Piscinas de Hormigón', match: /^SELLADOR FIJADOR PARA PISCINA/ },
  { name: 'Poximix Sella Grietas y Fisuras', match: /^POXIMIX SELLA GRIETAS/ },
  { name: 'El Pulpito Adhesivo Sintético', match: /^EL PULPITO CARTUCHO/, size: (d) => (/400GR/.test(d) ? 'Cartucho 400 g' : null) },
  // ---- Diluyentes y removedores ----
  { name: 'Aguarrás', match: /^AGUARRAS\b/ },
  { name: 'Sal de Limón', match: /^SAL DE LIMON/ },
];
