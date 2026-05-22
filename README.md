# Babu Joyas PWA

PWA (web instalable) que muestra el catálogo de [babujoyas.com](https://babujoyas.com) consumiendo el Webservice de PrestaShop. Servida desde Cloudflare Pages.

## Archivos

```
babujoyas-app/
├── index.html              ← App principal (HTML/CSS/JS sin framework)
├── manifest.json           ← Configuración PWA
├── sw.js                   ← Service Worker (offline + caché)
├── icons/                  ← Iconos 192 y 512
├── functions/api/
│   ├── products.js         ← Proxy: GET /api/products
│   └── cart.js             ← Proxy: POST /api/cart (crea carrito en PrestaShop)
├── _headers                ← Seguridad y caché (Cloudflare Pages)
└── wrangler.toml           ← Config del proyecto
```

## Arquitectura

- Frontend estático servido por Cloudflare Pages.
- Cloudflare Pages Functions actúan de proxy hacia el Webservice de PrestaShop.
- La clave del Webservice (`PS_WS_KEY`) **NUNCA está en el código**. Solo existe como secret en Cloudflare.

## Despliegue en Cloudflare Pages

### 1. Crear el proyecto

Cloudflare Dashboard → Workers & Pages → **Create application** → Pages → **Upload assets** (o conectar repositorio Git).

- Nombre: `babujoyas-app`
- Build command: ninguno (sitio estático)
- Build output directory: `/`

### 2. Configurar el secret

Settings → **Variables and Secrets** → Add:

- Tipo: **Secret** (no Plain text)
- Nombre: `PS_WS_KEY`
- Valor: la clave nueva del Webservice de PrestaShop

Aplicar a entornos **Production** y **Preview**.

### 3. Conectar dominio

DNS → CNAME `app` → `babujoyas-app.pages.dev`. La PWA quedará en `https://app.babujoyas.com`.

### 4. Rotar la clave del Webservice (paso obligatorio antes del primer deploy)

En PrestaShop → Parámetros avanzados → Webservice: revocar cualquier clave previa y generar una nueva. Esa es la que va en el secret `PS_WS_KEY`. Si una clave alguna vez estuvo en código fuente, README, o se compartió por chat/email — está comprometida.

## Instalación en móvil

### Android (Chrome)
1. Abrir la URL de la PWA
2. Banner "Instalar Babu Joyas" → **Instalar**

### iPhone (Safari)
1. Abrir la URL en Safari
2. **Compartir** → **"Añadir a pantalla de inicio"**

## Desarrollo local

```bash
npm install -g wrangler
wrangler pages dev . --port 8788
```

Para que las funciones lean la clave en local, crear `.dev.vars` (ya en `.gitignore`):

```
PS_WS_KEY=clave_de_desarrollo
```

## Próximos pasos opcionales

- [ ] Push notifications para carritos abandonados
- [ ] Variantes (tallas/materiales) en la ficha
- [ ] Login con cuenta PrestaShop
- [ ] Publicar como TWA en Google Play

---

*Babu Joyas · Córdoba, España · babujoyas.com*
