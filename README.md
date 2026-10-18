# GameStash

SPA de una sola página para explorar videojuegos con la **API de RAWG**:
buscador en tiempo real, filtros por género y plataforma, paginación y
enrutado dinámico **escrito a mano, sin frameworks**.

**▶ Ver en vivo:** https://gamestash.vercel.app/

## Stack

| Capa | Tecnología |
|---|---|
| Build | Vite 8 |
| Lógica | JavaScript ES modules (sin framework) |
| Animaciones | GSAP (CDN) |
| Datos | RAWG API |

## Puesta en marcha

```bash
cp .env.example .env    # y pega tu clave de RAWG: https://rawg.io/apidocs
npm install
npm run dev             # → http://localhost:5173
```

```bash
npm run build           # → dist/
npm run preview
```

> **Nota de seguridad:** en una SPA client-side cualquier clave `VITE_*` viaja
> al navegador, con o sin `.env`. Usa una clave con restricciones de dominio en
> el panel de RAWG; `.env` está en `.gitignore` y nunca se versiona.

## Arquitectura

```
index.html            Shell + GSAP por CDN
style.css             Sistema completo de estilos
src/
  main.js             Bootstrap + toggle de tema (localStorage)
  router.js           Router por hash: #/ , #/catalog , #/game
  api.js              Cliente fetch contra RAWG (+ filtro de contenido adulto
                      + AbortController para cancelar peticiones en vuelo)
  animations.js       GSAP: "loot drop" y tilt 3D
  services/           Traducción al español
  utils/
    escapeHTML.js     Escapado de datos externos para innerHTML
    sanitizeRichText.js  Descripciones con formato seguro (<p>/<br>)
  views/
    catalog/          Catálogo dividido por responsabilidades:
      index.js        Orquestador de la vista (lo que hace el fetch y monta la página)
      constants.js    Géneros, plataformas, opciones de orden, tamaños
      filters.js      Chips multiselect + dropdowns custom + sugerencias
      pagination.js   Ventana de páginas y controles de paginación
      gameCard.js     Render de tarjeta + layout grid/lista
      state.js        Estado de la vista (modo grid/lista, filtros → URL)
    detailView.js     Ficha de juego
```

Patrón *view-as-function*: cada vista es `async` y devuelve un
`HTMLElement` que el router monta con transiciones.

**El estado vive en la URL**: filtros, orden y página se serializan en el hash,
así que cualquier vista es compartible y el botón "atrás" del navegador
funciona de verdad.

## Detalles de producto

- Skeletons durante la carga, estado vacío y estado de error
- Sistema de rareza (legendario / épico / raro) como toque gamificado
- Tema oscuro/claro persistente
- `escapeHTML()` en el render de datos externos (catálogo **y** ficha), con
  sanitizado de la descripción que conserva `<p>`/`<br>` pero sin atributos
- Filtro de contenido adulto por título y tags, más `sfw=true` en la API

## Seguridad

- **Clave de RAWG**: vive en `.env` (nunca versionado) y viaja al navegador al compilar; es el tradeoff inherente a las SPA client-side. Usa una clave con restricciones de dominio y rótala si se filtra. (Ocultarla de verdad requiere el proxy serverless del roadmap).
- **Sin backend**: no hay servidor propio ni base de datos; el estado vive en el navegador.
- **Escapado**: todo dato externo (RAWG, parámetros de la URL, entradas del usuario) pasa por `escapeHTML`/`sanitizeRichText` antes de tocar el DOM.
- **Cabeceras y CSP** (`vercel.json`): `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` y `Content-Security-Policy` (scripts propios + cdnjs para GSAP; conexiones solo a RAWG y al traductor; imágenes solo de RAWG). Verificada contra el build real: 0 violaciones.
- **GSAP con SRI**: el script del CDN se valida con `integrity` (sha512) y `crossorigin`.
- **Buscadores**: longitud limitada (`maxlength`).
- **Dependencias**: `npm audit` sin vulnerabilidades.

## Roadmap conocido

- Proxy serverless que oculte la API key (tradeoff real de seguridad en SPA)
