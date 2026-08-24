# PROMPT PARA CLAUDE CODE — E-COMMERCE CATÁLOGO CON PEDIDO POR WHATSAPP
## Cliente: Pinturerías Del Centro (San Rafael, Mendoza)

---

## 0. ROL

Actuás como **Senior Full-Stack Engineer + Senior Product Designer (UX/UI)**. No entregás un template genérico: tomás decisiones de arquitectura, escribís código limpio, tipado y mantenible, y diseñás una interfaz **estéticamente cuidada, moderna y con identidad de marca**. Cada decisión de diseño y de código la justificás brevemente en comentarios cuando aporte. Priorizás: estética > velocidad de carga > mantenibilidad > simplicidad de despliegue.

---

## 1. OBJETIVO

Construir un **e-commerce tipo catálogo** para una pinturería. **No procesa pagos ni envíos.** El usuario navega el catálogo, arma un carrito, y al finalizar se genera un mensaje de **WhatsApp pre-cargado** con el detalle de los productos, cantidades, precios unitarios y total, que se abre en el chat del negocio. El negocio cierra la venta por WhatsApp (retiro en local).

Es fundamental que:
- El catálogo esté **organizado en secciones → categorías → productos** (con subcategorías donde aplique).
- Cada producto tenga **imagen** (real cuando exista, con sistema de fallback consistente cuando no).
- La estética sea **profesional y linda de verdad**, no un catálogo plano.

---

## 2. STACK TÉCNICO

- **Next.js 14+ (App Router) + TypeScript** — renderizado estático, SEO, rutas por categoría.
- **Tailwind CSS** para estilos + **shadcn/ui** para componentes base (adaptados a la marca, no con estética default).
- **Framer Motion** para microinteracciones y transiciones.
- **lucide-react** para íconos.
- Estado del carrito con **Zustand** + persistencia en `localStorage`.
- Búsqueda client-side con **Fuse.js** (fuzzy search por nombre, código y marca).
- Deploy en **Vercel**.
- **Sin backend ni base de datos.** El catálogo es un JSON estático generado a partir del CSV. No hay pasarela de pago, login ni panel admin en esta versión.

---

## 3. DATOS — PROCESAMIENTO DEL CSV

Se te entrega un CSV con **~2.218 productos**. Detalles técnicos que NO debés ignorar:

- **Encoding: ISO-8859-1 (Latin1)**, no UTF-8. Convertir al leer o las tildes/ñ se rompen.
- **Separador: `;`** (punto y coma), no coma.
- **Line endings: CRLF.**
- **Columnas:** `Código;Artículo;P. Venta L2;P. Venta c/IVA`
  - `Código` → id único del producto (usarlo como slug/id y como base para el nombre de imagen).
  - `Artículo` → nombre completo del producto.
  - `P. Venta c/IVA` → **este es el precio a mostrar.** Ignorar `P. Venta L2`.

**Pipeline requerido (escribir un script `scripts/build-catalog.ts`):**
1. Leer el CSV con encoding Latin1 → UTF-8.
2. Parsear a objetos.
3. Derivar **marca**, **categoría/subcategoría** y **variante/tamaño** (ver sección 4).
4. Normalizar el nombre para display (Title Case respetando siglas y marcas: ALBA, SIKKENS, CETOL, etc.; no romper "3,6 L", "X 240 CC", "01 L").
5. Formatear precio a **ARS**: separador de miles con punto y decimales con coma → `$9.221,57`. Redondear a 2 decimales.
6. Emitir `data/products.json` (fuente única de verdad) y `data/categories.json`.
7. El script debe ser **re-ejecutable**: cuando actualicen la lista de precios, se corre de nuevo y se regenera el catálogo sin tocar código.

> **Nota de negocio a implementar en UI:** mostrar los precios como **referenciales** con la leyenda *"Precios sujetos a confirmación. Coordiná el pedido final por WhatsApp."* (los precios de pinturería cambian seguido).

---

## 4. TAXONOMÍA Y CATEGORIZACIÓN

Los nombres de producto codifican, en general: `TIPO + variante/color + TAMAÑO + MARCA` (la marca suele ir al final tras el último guión). Ejemplos reales:
- `AEROSOL GRIS ESPACIAL BRILLANTE X 240 CC - KUWAIT`
- `ALBA ANTIOXIDO STANDARD - 04 L - ALBA`
- `CETOL ... - CETOL`

**Estrategia:** clasificación por reglas de keywords + marca, **data-driven y revisable**. Definí un mapa de reglas (`scripts/taxonomy.ts`) que asigne cada producto a UNA categoría principal según prioridad de match. Todo producto que no matchee cae en **"Varios"** (nunca dejar productos sin categoría ni rompas el build).

**Taxonomía objetivo (secciones → categorías).** Ajustá/expandí según lo que realmente aparezca en los datos, pero respetá esta estructura de rubro pinturería:

- **Pinturas**
  - Látex interior / Látex exterior (ALBALATEX, ALBALUX, TONALBA, LATEX)
  - Esmaltes sintéticos y al agua (ESM., SATINOL, esmalte)
  - Cielorrasos (CIELOS RASOS)
  - Antióxido y convertidores (ANTIOXIDO, CONVERT DE OXIDO)
  - Alta temperatura
- **Aerosoles** (AEROSOL, KUWAIT)
- **Automotor** (AUTOWAVE, WBASE, BICAPA, PRIMER, BASE, CATALIZADOR, ENDURECEDOR, barniz P.U.)
- **Maderas** (CETOL, protectores, LIJA LÍQUIDA, ALABASTINE REPARA MAD, NIVELA MADERA)
- **Impermeabilizantes y Revestimientos** (IMPERMEABILIZANTE, TEXTURADO, TEX, MEMBRANA, LIQUITECH, revestimiento)
- **Preparación de superficies** (ENDUIDO, MASILLA, SELLADOR, FIJADOR, ALABASTINE, FONDO)
- **Diluyentes y Aditivos** (diluyente, solvente, aguarrás, thinner, aditivo)
- **Herramientas y Accesorios** (PINCEL, RODILLO, PINROLL, BANDEJA, CINTA, LIJA/NORTON, DISCO, espátula, EINHELL)
- **Construcción en seco** (placa, perfil, tornillo, FISCHER, masilla junta)
- **Adhesivos y Selladores** (TEKBOND, silicona, adhesivo, sellador)
- **Ofertas / Liquidación** (LIQUIDACION) — sección destacada
- **Varios** (fallback)

**Reglas de derivación:**
- **Marca:** última palabra tras el último `-`. Guardar como campo `brand` y usarla como **filtro secundario** en las páginas de categoría.
- **Tamaño/variante:** extraer patrones tipo `X 240 CC`, `01 L`, `3,6 L`, `900 ML`, `75 GR`, `20 L`. Guardar como `variant`. Si un mismo producto base tiene varios tamaños, **agruparlos como subproductos/variantes** del mismo item cuando el nombre base coincida (ej: ENDUIDO EXT PREMIUM en 01 L / 04 L / 10 L / 20 L → un producto con selector de tamaño y precio que cambia según la variante).
- Generá también, de la clasificación, un `categories.json` con conteo de productos por categoría/marca para armar los filtros dinámicamente.

---

## 5. SISTEMA DE IMÁGENES (crítico)

No vamos a tener 2.218 fotos reales de entrada. Diseñá un sistema en **3 niveles** para que **ningún producto se vea roto ni vacío**:

1. **Imagen real:** buscar en `/public/products/{codigo}.{jpg|webp|png}`. Si existe, usarla. (Así se pueden ir agregando fotos con solo soltar el archivo nombrado por código.)
2. **Fallback por marca:** si no hay foto, usar un placeholder con el **logo de la marca** (`/public/brands/{marca}.svg`) sobre fondo con el color de acento de su categoría.
3. **Fallback por categoría:** si tampoco hay logo, un placeholder generado con **ícono de la categoría** (ej: lata de pintura, aerosol, pincel) + nombre del producto, con degradé de marca. Debe verse **intencional y prolijo**, no como "imagen faltante".

- Usar `next/image` con `lazy loading`, `blur placeholder` y formatos `webp`.
- Documentar en el README cómo agregar fotos reales masivamente (nombrar por código).

---

## 6. FUNCIONALIDADES Y PÁGINAS

1. **Home**
   - Hero con identidad de marca (+40 años en San Rafael), CTA a catálogo.
   - Accesos rápidos a secciones principales (grid de categorías con ícono/imagen).
   - Franja de marcas destacadas (ALBA, SIKKENS, CETOL, EMAPI, FARBEN…).
   - Sección "Ofertas / Liquidación".
   - Bloque de confianza (asesoramiento, +40 años, hasta 24 cuotas, retiro en local).

2. **Catálogo / Categoría** (`/categoria/[slug]`)
   - Listado con **grid de cards** de producto.
   - **Filtros:** por subcategoría, por marca, por rango de precio, por tamaño.
   - **Orden:** relevancia, precio asc/desc, alfabético.
   - **Paginación o scroll infinito** (no cargar 2.218 de golpe).
   - Sidebar de filtros en desktop, drawer en mobile.

3. **Buscador global**
   - Fuzzy search (nombre, código, marca) con resultados instantáneos y resaltado.
   - Accesible desde el header en toda la app.

4. **Ficha de producto** (`/producto/[codigo]`)
   - Imagen grande, nombre, marca, código, precio, **selector de variante/tamaño** si aplica.
   - Selector de cantidad + botón "Agregar al carrito".
   - Productos relacionados (misma categoría/marca).

5. **Carrito** (drawer lateral + página `/carrito`)
   - Lista editable: cantidad, quitar, subtotales.
   - Total general.
   - Botón **"Finalizar pedido por WhatsApp"** (ver sección 7).
   - Vacío con estado ilustrado y CTA a seguir comprando.

6. **Páginas informativas:** contacto/ubicación (con mapa e info del local), horarios. **Nada de checkout de pago ni de envío.**

---

## 7. FLUJO DE CARRITO → WHATSAPP

Al finalizar, generar un link `https://wa.me/5492604638122?text=<mensaje url-encoded>` y abrirlo en pestaña nueva.

**Formato exacto del mensaje** (respetar saltos de línea y encodearlo):

```
¡Hola Pinturerías Del Centro! 👋
Quiero hacer el siguiente pedido:

🛒 *Mi pedido*
1) AEROSOL BLANCO BRILLANTE X 440 CC - KUWAIT
   Cantidad: 2 × $7.479,75 = $14.959,50
2) ALBALATEX INTERIOR - 20 L - ALBA
   Cantidad: 1 × $122.038,41 = $122.038,41

💰 *Total estimado: $137.997,91*

Retiro en el local. ¿Me confirman disponibilidad y precio final? ¡Gracias!
```

Requisitos:
- Numerar los ítems, mostrar cantidad × precio unitario = subtotal, y el total.
- Formato de precios ARS (`$137.997,91`).
- Usar `*` para negritas (formato WhatsApp).
- Url-encodear correctamente (`encodeURIComponent`), cuidando tildes, ñ y saltos de línea (`%0A`).
- El número de WhatsApp del negocio va en una **constante de config** (`5492604638122`), fácil de cambiar.
- No vaciar el carrito automáticamente al enviar; ofrecer un botón "Vaciar carrito".

---

## 8. SIN ENVÍOS

No hay cálculo de envío, dirección de entrega ni pasarela de pago. El modelo es **catálogo + pedido por WhatsApp + retiro en local**. Dejarlo explícito en la UI ("Retiro en local — Av. Hipólito Yrigoyen 621, San Rafael").

---

## 9. DIRECCIÓN DE DISEÑO (UX/UI) — que quede HERMOSO

**Personalidad de marca:** pinturería de barrio con +40 años, confiable, pero con presentación **moderna y premium**. Nada de estética "ferretería vieja". Referencia de tono: e-commerce de decoración/pinturas actual (limpio, mucho color usado con criterio, foco en producto).

**Sistema de diseño:**
- **Color:** paleta basada en la identidad de Del Centro (extraé del logo/sitio actual https://centropintureria.com.ar/). Un color primario fuerte + neutros cálidos + acentos por categoría (cada sección puede tener su color de acento, aprovechando que es una pinturería → el color ES el producto). Usar variables CSS / tokens de Tailwind.
- **Tipografía:** una sans moderna y legible (ej. Inter/Geist) + una display con carácter para títulos. Buena jerarquía y escala tipográfica.
- **Espaciado y aire:** layout generoso, grid consistente, ritmo vertical prolijo. Que respire.
- **Cards de producto:** imagen protagonista, hover con leve elevación/zoom, precio destacado, badge de marca y de "Oferta" cuando corresponda. Botón de agregar accesible.
- **Microinteracciones (Framer Motion):** transiciones suaves entre páginas, animación al agregar al carrito (ej. ítem "vuela" al ícono del carrito o el badge pulsa), skeletons de carga, estados hover/press cuidados.
- **Header sticky** con buscador, navegación por secciones y contador del carrito visible.
- **Responsive real, mobile-first:** la mayoría del tráfico será mobile. Drawer de filtros, drawer de carrito, targets táctiles cómodos.
- **Accesibilidad:** contraste AA, foco visible, navegación por teclado, `alt` en imágenes, roles ARIA en drawers/menús.
- **Estados vacíos y de error** ilustrados y con copy amable en español rioplatense.
- **Detalles finales:** favicon, OpenGraph con logo, 404 con onda, footer con datos reales.

**Evitá:** el look default de shadcn/Tailwind sin personalizar, sombras genéricas por todos lados, y sobrecarga visual. Elegí 2-3 gestos de diseño distintivos y aplicalos con consistencia.

---

## 10. PERFORMANCE Y SEO

- Generación estática de páginas de categoría y producto.
- Imágenes optimizadas (`next/image`, webp, lazy).
- Catálogo dividido/lazy por categoría; no cargar el JSON completo en cada vista.
- Metadatos por página (título, description, OG), sitemap, `robots.txt`.
- Lighthouse objetivo: Performance ≥ 90, Accesibilidad ≥ 95 en mobile.

---

## 11. ESTRUCTURA Y ENTREGABLES

```
/scripts/build-catalog.ts     → CSV (Latin1) → products.json + categories.json
/scripts/taxonomy.ts          → reglas de categorización por keyword/marca
/data/products.json           → fuente única de verdad
/data/categories.json
/public/products/{codigo}.*   → imágenes reales (drop-in)
/public/brands/{marca}.svg    → logos de marca (fallback)
/src/...                      → app Next.js
/config/site.ts               → WhatsApp, datos del negocio, textos
README.md                     → cómo correr, cómo actualizar precios, cómo agregar fotos
```

**Entregables:**
1. Proyecto Next.js funcionando (`npm run dev` y `npm run build` sin errores).
2. Script de build del catálogo re-ejecutable y documentado.
3. Los 2.218 productos categorizados y navegables.
4. Flujo completo carrito → WhatsApp operativo.
5. README claro para que el mantenimiento (precios y fotos) lo pueda hacer alguien no técnico.
6. Listo para deploy en Vercel.

---

## 12. DATOS DEL NEGOCIO (usar en config y footer)

- **Nombre:** Pinturerías Del Centro
- **Rubro:** Pinturas, herramientas, revestimientos y construcción en seco. +40 años en San Rafael, Mendoza.
- **Dirección:** Av. Hipólito Yrigoyen 621, San Rafael, Mendoza
- **WhatsApp:** +54 9 260 463-8122 → `5492604638122`
- **Teléfono:** (0260) 463-8122
- **Instagram:** @pintureriadelcentro.central
- **Horarios:** Lun a Vie 8:30–13:00 / 16:00–20:30 · Sáb 8:30–13:00
- **Diferenciales:** asesoramiento personalizado, amplio stock, hasta 24 cuotas, retiro en local.

---

## 13. CRITERIOS DE ACEPTACIÓN

- [ ] El CSV se procesa sin romper tildes/ñ y con `P. Venta c/IVA` como precio.
- [ ] Todos los productos quedan clasificados (0 sin categoría; los raros van a "Varios").
- [ ] Variantes de tamaño del mismo producto agrupadas con selector.
- [ ] Ningún producto se ve sin imagen (fallback prolijo funcionando).
- [ ] Filtros por categoría, marca, precio y tamaño operativos.
- [ ] Buscador fuzzy funcional en mobile y desktop.
- [ ] Carrito persistente; el mensaje de WhatsApp llega con formato exacto (ítems, cant × unitario = subtotal, total).
- [ ] Sin ninguna referencia a envío o pago online.
- [ ] Diseño responsive, animado y con identidad — no template default.
- [ ] Lighthouse mobile: Performance ≥ 90 / Accesibilidad ≥ 95.
- [ ] README permite actualizar precios y fotos sin tocar código.

---

**Empezá** por: (1) leer y procesar el CSV, (2) proponerme la taxonomía final con conteos por categoría para validarla, y (3) recién ahí montar la UI. Mostrame decisiones clave antes de avanzar en cada etapa.
