/**
 * Catálogo curado: los 100 productos de mayor rotación en una pinturería.
 *
 * Cada entrada es UN producto del ecommerce. Las variedades (colores, números de
 * pincel, granos de lija, medidas) y las presentaciones (litros, kilos) se agrupan
 * adentro como variantes, para que el cliente elija en la misma ficha en vez de ver
 * un producto repetido por cada color.
 *
 * - match:  regex contra el nombre de cada grupo que arma build-catalog.ts
 * - brand:  (opcional) restringe el match a una marca
 * - strip:  parte del nombre que se descarta; lo que queda es la "opción" (color, número…)
 * - option: nombre de la opción en singular y plural, ej. ['Color', 'colores']
 * - order:  (opcional) orden manual de las opciones
 *
 * Para ampliar el catálogo, agregar entradas acá y correr `npm run build:catalog`.
 * Con la lista vacía se publica la lista de precios completa.
 */
export interface Family {
  name: string;
  match: RegExp;
  brand?: string;
  strip?: RegExp;
  option?: [string, string];
  order?: string[];
}

const COLOR: [string, string] = ['Color', 'colores'];
const NUM: [string, string] = ['Número', 'números'];
const GRAIN: [string, string] = ['Grano', 'granos'];
const SIZE: [string, string] = ['Medida', 'medidas'];
const TYPE: [string, string] = ['Tipo', 'tipos'];

export const FAMILIES: Family[] = [
  // ---- Látex y pinturas de pared ----
  { name: 'Albacryl Látex Interior Mate', match: /^Albacryl/ },
  { name: 'Albalatex Látex Interior', match: /^Albalatex (Mate|Satinado|Ultra)/, strip: /^Albalatex\s*/, option: TYPE },
  { name: 'Albalatex Design Colores', match: /^Albalatex Design/, strip: /^Albalatex Design\s*/, option: COLOR },
  { name: 'Albafrent Frentes y Muros', match: /^Albafrent/ },
  { name: 'Albaxpert Látex Mate', match: /^Albaxpert/ },
  { name: 'Centro Mate Superior Antihongo', match: /^Centro Mate Superior/ },
  { name: 'Centro Profesional Látex Ext/Int', match: /^Centro Prof/ },
  { name: 'Cielos Rasos Standard', match: /^Cielos Rasos/ },
  { name: 'Constructor Látex Int/Ext', match: /^Constructor Int/, strip: /^Constructor Int\/ext\s*/, option: COLOR },
  { name: 'Duralba Látex Acrílico Exterior', match: /^Duralba Acrilico/, strip: /^Duralba Acrilico\s*/, option: COLOR },
  { name: 'Duralba Frentes y Muros', match: /^Duralba Frentes y Muros/, strip: /^Duralba Frentes y Muros\s*/, option: COLOR },
  { name: 'Pintura para Piletas', match: /^Piletas Acrilico/, strip: /^Piletas Acrilico\s*/, option: TYPE },
  { name: 'Pisos Látex Acrílico', match: /^Pisos Latex Acril/, strip: /^Pisos Latex Acril\s*/, option: COLOR },
  { name: 'Look Látex Frentes y Tendencias', match: /^Look /, strip: /^Look\s*/, option: COLOR },
  // ---- Esmaltes ----
  { name: 'Albalux Diam 3 en 1', match: /^Albalux Diam 3EN1/, strip: /^Albalux Diam 3EN1\s*/, option: COLOR },
  { name: 'Albalux 2 en 1 Forja y Martillado', match: /^Albalux 2 en 1/, strip: /^Albalux 2 en 1\s*/, option: COLOR },
  { name: 'Albalux Balance Esmalte al Agua', match: /^Albalux Balance/, strip: /^Albalux Balance\s*/, option: COLOR },
  { name: 'Satinol Esmalte Satinado', match: /^Satinol/, strip: /^Satinol\s*/, option: COLOR },
  { name: 'Albamate Esmalte Sintético Mate', match: /^Albamate/ },
  { name: 'Cromática Esmalte Sintético', match: /^Cromatica/, strip: /^Cromatica\s*/, option: COLOR },
  { name: 'Pizarrones', match: /^Pizarrones/, strip: /^Pizarrones\s*/, option: COLOR },
  // ---- Antióxidos ----
  { name: 'Antióxido Standard', match: /^Antioxido Standard/ },
  { name: 'CM Antióxido', match: /^CM Antioxido/, strip: /^CM Antioxido\s*/, option: COLOR },
  { name: 'Convertidor de Óxido Alba', match: /^Convert de Oxido/, strip: /^Convert de Oxido\s*/, option: COLOR },
  { name: 'CM Convertidor de Óxido', match: /^CM Convertidor/, strip: /^CM Convertidor\s*/, option: COLOR },
  // ---- Preparación de superficies ----
  { name: 'Centro Enduido + Masilla', match: /^Centro Enduido/ },
  { name: 'Enduido + Masilla', match: /^Enduido \+ Masilla/ },
  { name: 'Enduido Exterior Premium', match: /^Enduido Ext/ },
  { name: 'Centro Fijador al Agua', match: /^Centro Fijador/ },
  { name: 'Fijador al Aguarrás', match: /^Fijador Al Aguarras/, strip: /^Fijador Al Aguarras\s*/, option: TYPE },
  { name: 'Fondo Blanco Premium', match: /^Fondo Blanco/ },
  { name: 'Fondo Universal al Agua', match: /^Fondo Universal/ },
  { name: 'Alabastine Repara Paredes', match: /^Alabastine Repara/ },
  { name: 'Masilla Poliéster', match: /^Masilla Poliester (Extra|Multi)/, strip: /^Masilla Poliester\s*/, option: TYPE },
  { name: 'Masilla Piroxilina Roja', match: /^Masilla Universal Piroxilina/ },
  // ---- Impermeabilizantes y revestimientos ----
  { name: 'Liquitech Cauchogoma Impermeabilizante', match: /^Liquitech Cauchogoma/ },
  { name: 'Liquitech Membrana Poliuretánica en Pasta', match: /^Liquitech Membrana Poliu/ },
  { name: 'Liquitech Tapa Goteras', match: /^Liquitech Tapa Goteras/ },
  { name: 'Liquitech Membrana Autoadhesiva', match: /^Liquitech Membrana Autoadhesiva/ },
  { name: 'Liquitech Impermeabilizante para Ladrillo', match: /^Liquitech Impermeabilizante para Ladrillo/, strip: /^Liquitech Impermeabilizante para Ladrillo\s*/, option: COLOR },
  { name: 'Impermeabilizante M y M', match: /^Impermeabilizante M y M/, strip: /^Impermeabilizante M y M\s*/, option: COLOR },
  { name: 'Texturado Marmolato', match: /^Texturado Marmolato/, strip: /^Texturado Marmolato\s*/, option: TYPE },
  // ---- Maderas ----
  { name: 'Albatros Barniz Marino', match: /^Albatros Barniz Marino/ },
  { name: 'Cetol Classic Brillante', match: /^Classic Brillante/, strip: /^Classic Brillante\s*/, option: COLOR },
  { name: 'Cetol Classic Satinado', match: /^Classic Satinado/, strip: /^Classic Satinado\s*/, option: COLOR },
  { name: 'Cetol Tinta Universal', match: /^Tinta Univ /, strip: /^Tinta Univ\s*/, option: COLOR },
  { name: 'Cetol Deck', match: /^Deck /, strip: /^Deck\s*/, option: COLOR },
  { name: 'Pro Madera Barniz', match: /^Pro Madera Barniz/, strip: /^Pro Madera Barniz\s*/, option: TYPE },
  { name: 'Pro Madera Tratamiento Protector', match: /^Pro Madera Trat Prot/, strip: /^Pro Madera Trat Prot\s*/, option: COLOR },
  { name: 'Brikol Pisos', match: /^Brikol Pisos/, strip: /^Brikol Pisos\s*/, option: COLOR },
  { name: 'Aceite de Lino', match: /^Aceite de Lino/ },
  // ---- Solventes ----
  { name: 'Aguarrás', match: /^Aguarras$/ },
  { name: 'Thinner Sello Oro', match: /^Thinner Sello Oro/ },
  { name: 'Removedor en Gel', match: /^Removedor en Gel/ },
  // ---- Aerosoles ----
  { name: 'Aerosol Toke', match: /^Aerosol Toke/, strip: /^Aerosol Toke\s*/, option: COLOR },
  { name: 'Aerosol Colorgin', match: /^Aerosol Colorgin/ },
  { name: 'Aerosol Ultra Cover 2X', match: /^Aerosol Ultra Cover/ },
  { name: 'Aerosol Línea Joven', match: /^Aerosol Linea Joven/, strip: /^Aerosol Linea Joven\s*|\s*Por\s*$/gi, option: COLOR },
  { name: 'Aerosol Tekbond', match: /^Aerosol (Blanco|Gris|Verde)/, brand: 'Tekbond', strip: /^Aerosol\s*/, option: COLOR },
  // ---- Adhesivos y selladores ----
  { name: 'Silicona Acética Multiuso', match: /^Silicona Acetica/ },
  { name: 'Sellador Neutro', match: /^Sellador Neutro/, strip: /^Sellador Neutro\s*/, option: COLOR },
  { name: 'Sella Canaletas', match: /^Sella Canaletas/, strip: /^Sella Canaletas Tekbond\s*/, option: COLOR },
  { name: 'Poximix Exterior', match: /^Poximix Exterior/ },
  { name: 'Poximix Interior', match: /^Poximix Interior/ },
  { name: 'Pistola Aplicadora para Silicona', match: /^Pistola Aplicadora/ },
  { name: 'Kit Parche', match: /^Kit Parche/ },
  // ---- Pinceles y rodillos ----
  { name: 'Pincel Gold', match: /^Pincel Gold/, strip: /^Pincel Gold\s*/, option: NUM },
  { name: 'Pincel Persianero', match: /^Pincel Persianero/, strip: /^Pincel Persianero\s*/, option: NUM },
  { name: 'Pincel Yago V1 Blanco', match: /^Pincel Yago V1/, strip: /^Pincel Yago V1 \(blanco\)\s*/, option: NUM },
  { name: 'Pincel Yago V2', match: /^Pincel Yago V2/, strip: /^Pincel Yago V2 \([^)]*\)\s*/, option: NUM },
  { name: 'Pinceleta Obra', match: /^Pinceleta Obra/ },
  { name: 'Rodillo Antigota', match: /^Rodillo Antigota/ },
  { name: 'Rodillo Cuero Lanar', match: /^Rodillo Cuero/ },
  { name: 'Rodillo Foam', match: /^Rodillo Foam/, strip: /^Rodillo Foam\s*/, option: NUM },
  { name: 'Rodillo Hilado Extremo', match: /^Rodillo Hilado/ },
  { name: 'Rodillo Sintético Profesional', match: /^Rodillo Sintetico/ },
  { name: 'Rodillo Epoxi', match: /Rodillo Epoxi/, strip: /\s*Rodillo Epoxi\s*/, option: TYPE },
  { name: 'Bandeja para Pintor', match: /^Bandeja/, strip: /^Bandeja( de)?\s*/, option: TYPE },
  // ---- Cintas, cobertores y protección ----
  { name: 'Cinta de Enmascarar Azul Premium', match: /^Cinta Azul Premi/, strip: /^Cinta Azul Premi\w*\s*/, option: SIZE, order: ['N° 18', 'N° 24', 'N° 36', 'N° 48'] },
  { name: 'Cinta de Enmascarar Automotor', match: /^Cinta Automotor/, strip: /^Cinta Automotor\s*/, option: TYPE },
  { name: 'Cobertor Plástico', match: /^Cobertor/, strip: /^Cobertor\s*/, option: SIZE },
  { name: 'Film Plástico para Enmascarar', match: /^Film Plastico/ },
  // ---- Lijas y abrasivos ----
  { name: 'Lija Azul Norton al Agua', match: /^Lija Azul/, strip: /^Lija Azul( Norton)?( T4\d\d)?\s*-?\s*/, option: GRAIN },
  { name: 'Lija al Agua Norton T277', match: /^Lija Al Agua Nor/, strip: /^Lija Al Agua Nor T277\s*/, option: GRAIN },
  { name: 'Lija al Agua El Galgo', match: /^Lija Al Agua N\d/, strip: /^Lija Al Agua\s*/, option: GRAIN },
  { name: 'Lija Disco Norton A275', match: /^Lija Disco A275/, strip: /^Lija Disco A275\s*/, option: GRAIN },
  { name: 'Hoja Tela Esmeril Norton', match: /^Hoja Tela Esmeril/, strip: /^Hoja Tela Esmeril K246\s*/, option: GRAIN },
  { name: 'Lija Tela Esmeril 3M', match: /^Lija Tela Esmeril 3M/, strip: /^Lija Tela Esmeril 3M\s*/, option: GRAIN },
  { name: 'Lija Sinteplast', match: /^Lija Sinteplast/, strip: /^Lija Sinteplast Grano\s*/, option: GRAIN },
  { name: 'Disco Flap Óxido de Aluminio', match: /^Disco Flap/, strip: /^Disco Flap Oxido de Aluminio\s*/, option: GRAIN },
  // ---- Herramientas ----
  { name: 'Espátula de Acero', match: /^Espatula Acero/, strip: /^Espatula Acero N°\s*/, option: SIZE },
  { name: 'Llana Plástica de Alto Impacto', match: /^Llana Plastica/ },
  { name: 'Guantes de Trabajo', match: /^Guantes/, strip: /^Guantes\s*/, option: TYPE },
  { name: 'Viruta de Acero', match: /^Viruta Acero/, strip: /^Viruta Acero\s*/, option: GRAIN, order: ['Fina', 'Mediana', 'Gruesa'] },
  { name: 'Estopa Lustre', match: /^Estopa/ },
  { name: 'Trapo', match: /^Trapo/ },
  { name: 'Cepillo de Alambre', match: /^Cepillo de Alambre/ },
  { name: 'Raspador de Pintura y Calco', match: /^Raspador/ },
  { name: 'Cutter Metálico', match: /^Cutter/ },
  { name: 'Anteojo de Policarbonato', match: /^Anteojo/ },
];
