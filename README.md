# Centro Pinturería — Catálogo online

Catálogo tipo e-commerce (sin pagos ni envíos). El cliente arma un pedido y al finalizar se genera un
mensaje de WhatsApp con el detalle, para que el negocio cierre la venta y coordine el retiro en local.

## Cómo correr el proyecto

```bash
npm install
npm run build:catalog   # genera data/products.json, data/categories.json y public/search-index.json
npm run dev              # http://localhost:3000
```

Para producción:

```bash
npm run build
npm run start
```

**Importante:** el panel de administración necesita `npm run start` (o un host Node real, tipo VPS).
No funciona con `output: 'export'` ni con hosting 100% estático, porque escribe archivos (overrides,
fotos) y usa cookies de sesión. Es compatible con Vercel en su modo normal (no estático).

---

## 0. Panel de administración (`/admin`)

Panel para gestionar el catálogo sin tocar código: estadísticas, editar productos (nombre, marca,
categoría, precio por presentación, foto), ocultarlos o eliminarlos del catálogo público, y restaurarlos
al original del CSV en cualquier momento.

- **Entrar:** `/admin` — contraseña definida en `.env.local` (`ADMIN_PASSWORD`, por defecto `centro2026`
  en este entorno de prueba). **Cambiala antes de desplegar a producción.**
- **Panel:** conteos en vivo (activos, ocultos, sin foto, sin precio, en oferta, editados), valor
  estimado del stock, desglose por categoría y por marca.
- **Productos:** buscador, filtros (categoría / ocultos / oferta / sin precio / editados), paginado.
- **Editar un producto:** nombre, marca, categoría, subcategoría, oferta, precio de cada presentación
  (tamaño) por separado, y la foto (subís un JPG/PNG/WEBP y reemplaza la que tenía).
- **Ocultar / Eliminar:** borrado suave y reversible — el producto desaparece del catálogo público
  (categorías, buscador, sitemap) pero no se borra del CSV ni se pierde: se puede volver a mostrar en
  cualquier momento desde la pestaña "Ocultos".
- **Restaurar original del CSV:** descarta todas las ediciones de admin sobre ese producto puntual
  (precio, nombre, categoría, foto, oculto) y lo deja como está en el CSV.

### Cómo funciona (para no romper nada al tocar el código)

Las ediciones de admin **nunca tocan `data/products.json`** (eso lo regenera `build-catalog.ts` a
partir del CSV). En cambio, se guardan como una capa aparte en **`data/overrides.json`**
(`{ "<id-del-producto>": { ...cambios } }`), que se combina con el catálogo generado al leerlo. Esto
significa que:

- Correr `npm run build:catalog` de nuevo (para actualizar precios desde un CSV nuevo) **no borra** las
  ediciones de admin — se vuelven a aplicar automáticamente sobre el catálogo nuevo. Si un producto que
  tenías editado deja de existir en el CSV nuevo, su override queda huérfano sin efecto (no rompe nada).
- Las fotos subidas desde el admin se guardan en `public/products/{código}.*`, igual que las fotos que
  agregás a mano (sección 2). Se sirven por una ruta propia (`/api/product-photo/...`) en vez de la
  estática, a propósito: el servidor de producción de Next.js no detecta archivos nuevos agregados a
  `public/` mientras ya está corriendo, así que una foto subida por el admin no se vería hasta reiniciar
  el proceso si se sirviera como archivo estático común.
- Si alguna vez querés borrar TODAS las ediciones de admin de una, alcanza con vaciar
  `data/overrides.json` a `{}` (o borrar el archivo).

---

## 1. Actualizar precios (sin tocar código)

Los precios y productos salen de un único archivo: **`LISTA DE PRECIOS ECOMERCE.csv`**, en la raíz del
proyecto. Cuando el proveedor/lista de precios cambie:

1. Reemplazá ese archivo por el nuevo CSV (mismo nombre, o pasá la ruta como parámetro — ver abajo).
   - **Encoding:** se detecta solo (UTF-8 o ISO-8859-1/Latin1) — no hace falta convertir nada a mano.
   - **Separador:** punto y coma (`;`).
   - **Columnas esperadas:** `Código;Artículo;P. Venta L2;<precio con IVA>` (la 4ta columna es el precio
     de venta, sea cual sea su nombre exacto — "P. Venta c/IVA", "P. VENTA + IVA", etc.; la 3ra columna
     se ignora siempre).
   - **Decimales:** también se detectan solos, con coma ("27650,88") o con punto ("9221.57").
2. Corré:
   ```bash
   npm run build:catalog
   ```
3. Volvé a generar el sitio (`npm run build`) o, si ya está desplegado en Vercel conectado a un
   repositorio Git, hacé commit + push de los `data/*.json` actualizados y Vercel lo redespliega solo.

Si el CSV no se llama `LISTA DE PRECIOS ECOMERCE.csv` o está en otra carpeta, pasale la ruta:

```bash
npm run build:catalog -- "C:\ruta\a\Lista de precios.csv"
```

El script (`scripts/build-catalog.ts`):

- Detecta el encoding (UTF-8 o Latin1) y el formato de decimales (coma o punto) solo, y parsea el CSV.
- **Excluye automáticamente** filas que no son productos reales (asientos administrativos del sistema
  de gestión: pagos, fletes, saldos, impuestos, etc. — se identifican porque tienen precio $0 y no son
  artículos de pinturería). La lista de códigos excluidos está en `scripts/taxonomy.ts` → `EXCLUDE_CODES`,
  por si en el futuro aparecen filas nuevas de este tipo y hay que sumarlas ahí.
- Detecta la **marca** (contra una lista blanca en `scripts/taxonomy.ts` → `BRANDS`, para no confundir
  colores o variantes como "NEGRO" con la marca real).
- Detecta el **tamaño/variante** (`01 L`, `240 CC`, `3,6 L`, etc.) y agrupa como **un solo producto con
  selector de tamaño** todas las filas que comparten el mismo nombre base y marca (ej. "Enduido Ext
  Premium" en 01/04/10/20 L).
- Clasifica cada producto en una **categoría y subcategoría** según palabras clave (reglas en
  `scripts/taxonomy.ts` → `RULES`, evaluadas en orden — la primera que matchea gana). Todo lo que no
  matchea cae en **"Varios"** (nunca rompe el build). Si aparecen productos mal categorizados o querés
  sumar una categoría nueva, se edita ese archivo — no hace falta tocar el resto del código.
- Formatea el precio a formato argentino (`$9.221,57`).
- Genera:
  - `data/products.json` — fuente de verdad del catálogo (no se sube al navegador tal cual).
  - `data/categories.json` — categorías con conteos, subcategorías, marcas y rango de precios (para los
    filtros).
  - `public/search-index.json` — índice liviano para el buscador (nombre, marca, código, categoría).

### ¿Cómo sé si algo quedó mal categorizado?

Al correr `npm run build:catalog` vas a ver en la consola el conteo final por categoría y cuántos
productos quedaron en "Varios". Si querés ajustar una regla, abrí `scripts/taxonomy.ts`, buscá el array
`RULES` y agregá o modificá la palabra clave correspondiente, después volvé a correr el script.

---

## 2. Agregar fotos reales de productos

**191 productos ya tienen foto real** (envase/lata verdadera del producto, bajada de los catálogos
oficiales de Alba, Cetol y Emapi y emparejada automáticamente por nombre con `scripts` puntuales — no
son parte del pipeline de `build-catalog.ts`, así que si se vuelve a correr todo desde cero esas fotos
puntuales no se regeneran solas, pero los archivos ya están en `public/products/` y el build las sigue
detectando). El resto de los productos usa un placeholder prolijo (ícono de categoría + colores de
marca) o el logo de marca (sección siguiente). Para agregar una foto real a mano:

1. Fijate el **código** del producto (aparece en su ficha, debajo del nombre — ej. `Código 1234`).
2. Guardá la imagen en `public/products/` con el código como nombre de archivo:
   ```
   public/products/1234.jpg
   public/products/1234.webp
   public/products/1234.png
   ```
3. Volvé a correr `npm run build:catalog` (así el catálogo detecta qué productos tienen foto) y
   `npm run build`/`npm run dev`.

No hace falta editar código ni el CSV — con soltar el archivo con el nombre correcto alcanza. Si un
producto tiene varias variantes de tamaño (varios códigos agrupados), alcanza con poner la foto en el
código de **cualquiera** de sus variantes.

### Logos de marca (fallback nivel 2)

Ya están cargados los logos oficiales (bajados de los sitios reales de cada fabricante) de las 17
marcas más grandes del catálogo — Alba, Sikkens, Emapi, Sinteplast, Cetol, Wanda, Merclin, Distinción,
Rosarpin, Venezia, Zeocar, El Galgo, Einhell, Fischer, Mota, Toke y Rust-Oleum — que cubren
aproximadamente el 72% de los productos con marca. El resto (Farben, Norton, Tekbond y las marcas más
chicas) todavía no tiene logo y muestra el placeholder de categoría; para completarlas o para actualizar
alguna, agregá el archivo en:

```
public/brands/{marca-en-minusculas-y-guiones}.{svg|png|jpg|webp}
```

Por ejemplo, para Alba: `public/brands/alba.png` (ya está). El componente prueba automáticamente
`.svg`, `.png`, `.jpg` y `.webp` en ese orden, así que no importa el formato del archivo que consigas.
El slug exacto de cada marca sale de `scripts/taxonomy.ts` → `BRANDS` (pasando el nombre a minúsculas y
reemplazando espacios por guiones,
ej. "Sherwin Williams" → `sherwin-williams.svg`).

---

## 3. Datos del negocio (WhatsApp, dirección, horarios)

Todo eso vive en **`config/site.ts`** — un solo archivo, sin buscar strings sueltos en componentes:

- `whatsappNumber`: número al que llega el pedido (formato `549...` sin espacios ni signos).
- `address`, `phone`, `instagram`, `hours`, `differentiators`, `priceDisclaimer`.

Cambiar cualquiera de esos valores no requiere tocar ningún otro archivo.

---

## 4. Estructura del proyecto

```
LISTA DE PRECIOS ECOMERCE.csv    → planilla de precios (se reemplaza para actualizar)
scripts/build-catalog.ts         → pipeline CSV -> JSON
scripts/taxonomy.ts              → reglas de categorización, marcas, exclusiones
data/products.json               → catálogo generado por el CSV (no editar a mano)
data/categories.json             → categorías generadas (no editar a mano)
data/overrides.json              → ediciones hechas desde /admin (se genera solo)
public/search-index.json         → índice de búsqueda generado (no editar a mano)
public/products/{codigo}.*       → fotos reales de producto (drop-in o subidas desde /admin)
public/brands/{marca}.*          → logos de marca (17 ya cargados, resto drop-in)
config/site.ts                   → datos del negocio (WhatsApp, dirección, horarios)
.env.local                       → ADMIN_PASSWORD y ADMIN_SESSION_SECRET (no se sube a git)
src/middleware.ts                → protege /admin y /api/admin con la cookie de sesión
src/app/(site)/                  → páginas públicas (home, categoría, producto, carrito, contacto)
src/app/admin/                   → panel de administración
src/app/api/admin/               → endpoints del panel (login, editar, ocultar, subir foto)
src/components/                  → componentes de UI
src/lib/                         → helpers (formato de precio, WhatsApp, lectura de datos, overrides, tipos)
src/store/cart.ts                → estado del carrito (Zustand + localStorage)
```

## 5. Qué NO hace este sitio (a propósito)

- No procesa pagos online.
- No calcula ni cobra envíos — el modelo es **retiro en local**.
- No tiene base de datos: el catálogo sale del CSV y las ediciones de admin viven en un archivo JSON
  aparte (ver sección 0). `/admin` no aparece indexado en buscadores (metadata `noindex`) ni enlazado
  desde el sitio público.

## 6. Deploy

**Ojo con esto si van a desplegar en Vercel:** el panel de admin escribe archivos en disco en el momento
(`data/overrides.json` y las fotos subidas en `public/products/`). Vercel corre cada request en
funciones serverless con **disco efímero** — lo que el admin guarde ahí puede desaparecer en el próximo
deploy o incluso entre invocaciones. Para uso normal del catálogo (sin editar desde /admin) Vercel anda
perfecto. Para que el panel de administración funcione de forma confiable y persistente, lo mejor es:

- **Self-host en un servidor Node persistente** (VPS, Railway, Render "Web Service", EC2, etc.):
  `npm run build && npm run start`, disco normal, todo persiste. Es el modo en el que se probó todo acá.
- **Si igual quieren Vercel:** conectar el repositorio, `npm run build` como build command. El catálogo
  base (CSV → JSON) funciona perfecto ahí. Para que las ediciones de admin persistan entre deploys
  habría que migrarlas de archivos JSON a una base de datos (Vercel Postgres, Supabase, etc.) — no es
  gran cosa de reescribir (`src/lib/overrides.ts` es el único lugar que sabe leer/escribir overrides),
  pero es trabajo que no está hecho todavía.

Si querés que el catálogo (no las ediciones de admin) se regenere en cada deploy automáticamente desde
un CSV actualizado, agregá `npm run build:catalog &&` antes de `next build` en el build command.
