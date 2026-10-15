# GameStash

SPA de una sola página para explorar videojuegos con la **API de RAWG**:
buscador en tiempo real, filtros por género y plataforma, paginación y
enrutado dinámico **escrito a mano, sin frameworks**.

**▶ Ver en vivo:** https://gamestash.vercel.app/

## Stack

| Capa | Tecnología |
|---|---|
| Build | Vite 5 |
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
  api.js              Cliente fetch contra RAWG (+ filtro de contenido adulto)
  animations.js       GSAP: "loot drop" y tilt 3D
  services/           Traducción al español
  views/
    catalogView.js    Catálogo: filtros, chips, paginación, grid/lista
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
- `escapeHTML()` en el render de datos externos
- Filtro de contenido adulto por título y tags, más `sfw=true` en la API

## Roadmap conocido

- Dividir `catalogView.js` en `filters/`, `components/` y `catalogState`
- `AbortController` para cancelar peticiones al navegar rápido
- Proxy serverless que oculte la API key (tradeoff real de seguridad en SPA)
- ESLint + CI con build
