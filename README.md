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

- Correr `npm run build:catalog` de nuevo (lista o precios nuevos) **no borra** las ediciones de admin —
  se vuelven a aplicar automáticamente sobre el catálogo nuevo. Si un producto que tenías editado deja
  de existir en la lista nueva, su override queda huérfano sin efecto (no rompe nada).
- Las fotos subidas desde el admin se guardan en `public/products/{código}.*`, igual que las fotos que
  agregás a mano (sección 2). Se sirven por una ruta propia (`/api/product-photo/...`) en vez de la
  estática, a propósito: el servidor de producción de Next.js no detecta archivos nuevos agregados a
  `public/` mientras ya está corriendo, así que una foto subida por el admin no se vería hasta reiniciar
  el proceso si se sirviera como archivo estático común.
- Si alguna vez querés borrar TODAS las ediciones de admin de una, alcanza con vaciar
  `data/overrides.json` a `{}` (o borrar el archivo).

---

## 1. Actualizar el catálogo (productos, precios y categorías)

El catálogo sale de **dos planillas** y una carpeta de fotos. Nada de esto requiere tocar código.

### 1.1 La lista de productos (qué se vende)

Es un CSV en la **raíz del proyecto** con estas columnas (separadas por `;`):

```
Código;Descripción;Marca;Categorias;Sub Categorias
```

- **Todos** los artículos de esa lista se publican, y lo que no está en la lista no aparece en el sitio.
- El nombre del archivo no importa: se toma el CSV más nuevo de la raíz que tenga esas columnas (hoy es
  `LISTA DE PRECIOS ECOMERCE (1).csv`). Para cambiar la lista, reemplazá ese archivo por la nueva
  exportación — o dejá la nueva al lado y borrá la vieja.
- **Encoding:** se detecta solo (UTF-8 o el Windows-1252 que exporta el sistema de gestión / Excel).
- **Categorías y subcategorías:** son las de las columnas `Categorias` y `Sub Categorias`, tal cual. El
  menú, los filtros y la home ("Explorá por rubro") se arman solos a partir de ahí. Cómo se escribe cada
  una, su orden y su ícono están en `scripts/taxonomy.ts`; una categoría nueva que aparezca en la lista
  se publica igual (con ícono genérico) y el build avisa por consola.

### 1.2 Los precios

La lista de productos no trae precios: se cruzan por **código** con **`data/precios.csv`**
(`Código;Descripción;Precio con IVA`).

- Para cargar o cambiar precios: abrí `data/precios.csv` con Excel, completá la columna
  **Precio con IVA** y guardalo como CSV (separado por `;`). Acepta coma o punto decimal
  ("27650,88" o "27650.88").
- Un artículo **sin precio** se publica igual y muestra **"Consultar precio"**.
- También sirve pegar ahí una exportación del sistema con otros nombres de columna: alcanza con que
  tenga una columna de código y una de precio (se usa la que diga "IVA"; si no, "Precio" o "Venta").
- Si algún día la lista de productos trae su propia columna de precio, esa columna manda.
- Otra opción, sin planillas: editar el precio de cada presentación desde `/admin`.

### 1.3 Regenerar

```bash
npm run build:catalog    # lee la lista, los precios y las fotos
npm run build            # (lo corre solo antes de compilar el sitio)
```

Si la lista está en otra carpeta: `npm run build:catalog -- "C:\ruta\a\lista.csv"`.

Al terminar, la consola muestra el resumen: productos por categoría y subcategoría, cuántos artículos
quedaron sin precio, **qué productos no tienen foto** y qué artículos no entraron en ninguna regla de
agrupado.

### 1.4 Cómo se agrupan los artículos (colores, medidas, granos)

Cada producto del sitio junta los artículos de la lista que solo cambian en color, número de pincel,
grano de lija, medida o presentación (litros, kilos), para que el cliente elija en la misma ficha:
"Albalux Diamante 3 en 1" es un producto con 7 colores, no 7 productos.

Las reglas están en **`scripts/families.ts`**: una entrada por producto, con el nombre que se muestra y
una expresión que reconoce sus artículos en la lista. Un artículo nuevo de un producto que ya existe
(otro color, otro tamaño) se suma solo. Un artículo que no entra en ninguna regla **se publica igual**
como producto propio, con el nombre de la lista, y el build lo lista para sumarlo a ese archivo.

Las descripciones están en `scripts/descriptions.ts` y las ofertas de ejemplo en `scripts/offers.ts`
(ambas por nombre de producto); también se pueden editar desde `/admin`.

El script genera:

- `data/products.json` — el catálogo (no editar a mano).
- `data/categories.json` — categorías, subcategorías, marcas y rango de precios.
- `public/search-index.json` — índice liviano del buscador (nombre, marca, códigos, variedades).

---

## 2. Fotos de los productos

Las fotos viven en **`public/products/`** y se llaman como el **código** del artículo:

```
public/products/1234.jpg      (también .png o .webp)
```

Para agregar o cambiar una foto a mano:

1. Fijate el **código** del artículo (aparece en su ficha, debajo del nombre — ej. `Código 1234`).
2. Guardá la imagen en `public/products/` con ese código como nombre de archivo.
3. Corré `npm run build:catalog`.

Desde `/admin` también se puede subir la foto de un producto sin tocar archivos.

Cómo se reparte una foto entre las variantes de un producto:

- Las **presentaciones** de una misma variedad comparten foto (la lata de 4 L y la de 20 L): alcanza con
  la foto de una.
- Los **granos, números y medidas** se ven iguales: usan la foto del producto.
- Los **colores** pueden tener cada uno su foto (ej. cada aerosol con su tapa). Un color que todavía no
  tiene foto propia muestra la foto general del producto con la leyenda "Foto ilustrativa".

Las fotos se muestran siempre enteras (sin recortar) sobre fondo blanco. Lo ideal: producto solo, fondo
blanco, 600 px o más de lado.

### Logos de marca (cuando un producto no tiene foto)

Si un producto no tiene foto se muestra el logo de su marca, y si tampoco hay logo, un ícono de la
categoría. Los logos están en:

```
public/brands/{marca-en-minusculas-y-guiones}.{svg|png|jpg|webp}
```

Por ejemplo `public/brands/alba.png` o `public/brands/sherwin-williams.png`. El nombre sale de la marca
tal como se muestra en el sitio (`scripts/taxonomy.ts` → `BRAND_LABELS`), en minúsculas, sin tildes y
con guiones en vez de espacios.

---

## 3. Datos del negocio (WhatsApp, dirección, horarios)

Todo eso vive en **`config/site.ts`** — un solo archivo, sin buscar strings sueltos en componentes:

- `whatsappNumber`: número al que llega el pedido (formato `549...` sin espacios ni signos).
- `address`, `phone`, `instagram`, `hours`, `differentiators`, `priceDisclaimer`.

Cambiar cualquiera de esos valores no requiere tocar ningún otro archivo.

---

## 4. Estructura del proyecto

```
LISTA DE PRECIOS ECOMERCE (1).csv → lista de productos: código, descripción, marca, categoría y subcategoría
data/precios.csv                 → precios por código (se completa con Excel)
scripts/build-catalog.ts         → pipeline lista + precios + fotos -> JSON
scripts/families.ts              → cómo se agrupan los artículos en productos (colores, medidas, granos)
scripts/taxonomy.ts              → categorías, subcategorías y marcas: etiquetas, orden e íconos
scripts/descriptions.ts          → descripción de cada producto
scripts/offers.ts                → ofertas (% de descuento por producto)
data/products.json               → catálogo generado (no editar a mano)
data/categories.json             → categorías generadas (no editar a mano)
data/overrides.json              → ediciones hechas desde /admin (se genera solo)
public/search-index.json         → índice de búsqueda generado (no editar a mano)
public/products/{codigo}.*       → fotos de producto (se agregan a mano o desde /admin)
public/brands/{marca}.*          → logos de marca (para productos sin foto)
public/home/*.jpg                → fotos de los banners de categoría de la home
public/covers/*.jpg              → portada de la home (portada.jpg) y cabecera de cada categoría ({slug}.jpg)
public/cards/*.png               → logos de las tarjetas del carrusel (la lista está en config/site.ts → PAYMENT.cards)
src/components/icons/index.ts    → íconos de la tienda (Phosphor): se cambian todos desde ese archivo
config/site.ts                   → datos del negocio (WhatsApp, dirección, horarios, condiciones de pago)
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
- No tiene base de datos: el catálogo sale de las planillas (sección 1) y las ediciones de admin viven
  en un archivo JSON aparte (ver sección 0). `/admin` no aparece indexado en buscadores (metadata `noindex`) ni enlazado
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

El catálogo se regenera solo en cada deploy: `npm run build` corre `build:catalog` antes de compilar,
así que alcanza con subir la lista, los precios o las fotos nuevas.
#   E c o m m e r c e - c e n t r o - p i n t u r e r i a 
 
 