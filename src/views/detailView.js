import { getGameDetails, getGameStores } from '../api.js';
import { translateToSpanish } from '../services/translator.js';
import { escapeHTML } from '../utils/escapeHTML.js';
import { sanitizeRichText } from '../utils/sanitizeRichText.js';

// Las URLs de tiendas salen de la API: solo se aceptan http(s) para que un
// `javascript:` (u otro esquema peligroso) no se convierta en XSS al hacer
// clic. El resto del dato se escapa con escapeHTML al interpolarlo.
function sanitizeHref(url) {
  const value = String(url || '').trim();
  return /^https?:\/\//i.test(value) ? value : '#';
}

// `bgImage` se inyecta dentro de url('...') en un atributo style. escapeHTML()
// impide romper el atributo HTML, pero las entidades se decodifican al parsear
// el documento, de modo que el navegador vuelve a ver comillas reales: por eso
// además se eliminan comillas, paréntesis y caracteres de control que cerrarían
// la cadena CSS (una URL de imagen de la API no necesita ninguno de ellos).
function sanitizeCSSUrl(url) {
  // eslint-disable-next-line no-control-regex -- rango de control intencionado: es la defensa de la cadena CSS
  return escapeHTML(String(url || '').replace(/['"()\\\s<>\u0000-\u001F]/g, ''));
}

function getStoreSvgIcon(slug, url = '') {
  const s = slug.toLowerCase();
  const u = url.toLowerCase();

  if (s.includes('steam') || u.includes('steampowered.com')) {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.03 4.524 4.524s-2.03 4.524-4.524 4.524h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 14.719C1.842 20.061 6.678 24 12.001 24c6.624 0 11.999-5.375 11.999-12S18.604 0 11.979 0zM7.54 18.21a1.901 1.901 0 0 1-1.896-1.902c0-.18.028-.355.078-.521l2.022.836c-.021.12-.036.242-.036.368 0 1.047.849 1.896 1.896 1.896a1.89 1.89 0 0 0 1.341-.555l-2.001-.827c-.328.432-.843.705-1.404.705zm8.932-6.289a2.53 2.53 0 0 1-2.525-2.523 2.529 2.529 0 0 1 2.525-2.525 2.529 2.529 0 0 1 2.525 2.525c0 1.391-1.134 2.523-2.525 2.523z"/></svg>`;
  }
  if (s.includes('playstation') || u.includes('playstation.com')) {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8.882 17.55c-1.828-.43-3.033-1.047-3.033-1.74 0-1.218 3.565-1.854 7.15-1.854 3.585 0 7.15.636 7.15 1.854 0 .693-1.205 1.31-3.033 1.74l-.001 2.222c3.488-.535 6.034-1.848 6.034-3.962 0-2.613-3.856-3.854-10.15-3.854S2.85 13.39 2.85 16.003c0 2.114 2.546 3.427 6.033 3.962l-.001-2.415zM12 2.25L7.3 3.95v8.528l4.7-1.725V2.25z"/></svg>`;
  }
  if (s.includes('xbox') || u.includes('microsoft.com') || u.includes('xbox.com')) {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4.1 4.5C2.3 6.5 1.2 9.1 1.2 12c0 2.8 1.1 5.4 2.8 7.4l4.2-5.7L4.1 4.5zm15.8 0l-4.1 9.2 4.2 5.7c1.7-2 2.8-4.6 2.8-7.4 0-2.9-1.1-5.5-2.9-7.5zM12 2.2C9.4 2.2 7 3.1 5.2 4.6l6.8 9.8 6.8-9.8C17 3.1 14.6 2.2 12 2.2zm0 19.6c2.6 0 5-.9 6.8-2.4l-6.8-9.8-6.8 9.8c1.8 1.5 4.2 2.4 6.8 2.4z"/></svg>`;
  }
  if (s.includes('epic') || u.includes('epicgames.com')) {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 6v12l10 4 10-4V6L12 2zm6 13.5l-6 2.4-6-2.4V8.5l6-2.4 6 2.4v7z"/></svg>`;
  }
  if (s.includes('nintendo') || u.includes('nintendo.com')) {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2zm-3 15H6V7h3v10zm9 0h-3V7h3v10z"/></svg>`;
  }
  if (s.includes('gog') || u.includes('gog.com')) {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>`;
  }
  if (s.includes('apple') || s.includes('app-store') || u.includes('apple.com')) {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.31c.67-.82 1.13-1.96.99-3.1-.98.04-2.2.66-2.88 1.46-.61.71-1.15 1.87-.99 2.98 1.1.08 2.23-.52 2.88-1.34z"/></svg>`;
  }
  if (s.includes('google') || s.includes('play') || u.includes('google.com')) {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5v-17c0-.55.33-.95.84-.95.18 0 .37.05.54.16l14.12 8.5a1.1 1.1 0 0 1 0 1.89L4.38 21.6c-.17.11-.36.16-.54.16-.51 0-.84-.4-.84-.95z"/></svg>`;
  }

  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`;
}

function mergeStores(gameStores = [], apiStores = []) {
  const urlMap = new Map();
  if (Array.isArray(apiStores)) {
    apiStores.forEach(s => {
      if (s.store_id && s.url) {
        urlMap.set(s.store_id, s.url);
      }
    });
  }

  if (Array.isArray(gameStores) && gameStores.length > 0) {
    return gameStores.map(item => {
      const storeObj = item.store || {};
      const storeId = storeObj.id || item.store_id;
      const url = urlMap.get(storeId) || item.url || (storeObj.domain ? `https://${storeObj.domain}` : '#');
      const name = storeObj.name || 'Tienda Digital';
      const slug = storeObj.slug || '';

      return {
        name,
        slug,
        url,
        icon: getStoreSvgIcon(slug, url)
      };
    });
  }

  if (Array.isArray(apiStores) && apiStores.length > 0) {
    return apiStores.map(item => {
      const url = item.url || '#';
      let name = 'Tienda Digital';
      let slug = '';

      if (url.includes('steampowered.com')) { name = 'Steam'; slug = 'steam'; }
      else if (url.includes('playstation.com')) { name = 'PlayStation Store'; slug = 'playstation'; }
      else if (url.includes('microsoft.com') || url.includes('xbox.com')) { name = 'Xbox Store'; slug = 'xbox'; }
      else if (url.includes('epicgames.com')) { name = 'Epic Games Store'; slug = 'epic-games'; }
      else if (url.includes('gog.com')) { name = 'GOG'; slug = 'gog'; }
      else if (url.includes('nintendo.com')) { name = 'Nintendo eShop'; slug = 'nintendo'; }
      else if (url.includes('apple.com')) { name = 'App Store'; slug = 'apple'; }
      else if (url.includes('google.com')) { name = 'Google Play'; slug = 'google-play'; }

      return { name, slug, url, icon: getStoreSvgIcon(slug, url) };
    });
  }

  return [];
}

export async function renderDetailView(queryParams) {
  const gameId = queryParams.get('id');
  const container = document.createElement('div');
  container.className = 'detail-page';

  if (!gameId) {
    container.innerHTML = `<div class="error-state"><p>Juego no encontrado.</p><a href="#/" class="back-btn">Volver al catálogo</a></div>`;
    return container;
  }

  container.innerHTML = `<div class="loader-spinner">Cargando botín...</div>`;

  try {
    const [game, storesData] = await Promise.all([
      getGameDetails(gameId),
      getGameStores(gameId)
    ]);

    // La descripción puede traer HTML de RAWG (<p>/<br>) o texto plano según
    // el campo disponible y si el traductor ha fallado: se sanitiza manteniendo
    // solo el formato legítimo (ver utils/sanitizeRichText.js para la decisión).
    const rawDescription = game.description_raw || game.description || '';
    const descriptionES = rawDescription ? await translateToSpanish(rawDescription) : 'Sin descripción disponible.';

    const resolvedStores = mergeStores(game.stores, storesData?.results);

    const storesHTML = resolvedStores.length > 0
      ? resolvedStores.map(store => `
          <a href="${escapeHTML(sanitizeHref(store.url))}" target="_blank" rel="noopener noreferrer" class="store-button" title="Ir a ${escapeHTML(store.name)}">
            <span class="store-icon">${store.icon}</span>
            <span>${escapeHTML(store.name)}</span>
          </a>
        `).join('')
      : '<p class="no-data">No hay enlaces directos a tiendas disponibles.</p>';

    const bgImage = sanitizeCSSUrl(game.background_image_additional || game.background_image || '');

    container.innerHTML = `
      <article class="game-detail-hero" style="${bgImage ? `background-image: linear-gradient(to bottom, rgba(0,0,0,0.4), var(--bg-main)), url('${bgImage}')` : 'background: var(--bg-card)'}">
        <a href="#/" class="back-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Volver al Stash
        </a>
        <div class="hero-info">
          <h1>${escapeHTML(game.name || 'Sin título')}</h1>
          <div class="meta-tags">
            <span>Lanzamiento: ${escapeHTML(game.released || 'N/A')}</span>
            <span>Metacritic: ${escapeHTML(game.metacritic || 'N/A')}</span>
            <span>Rating: ${escapeHTML(game.rating ? `${game.rating} / 5` : 'N/A')}</span>
          </div>
        </div>
      </article>

      <section class="detail-body">
        <div class="description">
          <h2>Descripción</h2>
          <p>${sanitizeRichText(descriptionES)}</p>

          <div class="stores-section">
            <h3>Conseguir copia (Tiendas Oficiales)</h3>
            <div class="stores-grid">
              ${storesHTML}
            </div>
          </div>
        </div>
        
        <aside class="sidebar">
          <h3>Plataformas</h3>
          <ul>${game.platforms && game.platforms.length > 0 ? game.platforms.map(p => `<li>${escapeHTML(p.platform.name)}</li>`).join('') : '<li class="no-data">N/A</li>'}</ul>
          
          <h3>Desarrolladores</h3>
          <ul>${game.developers && game.developers.length > 0 ? game.developers.map(d => `<li>${escapeHTML(d.name)}</li>`).join('') : '<li class="no-data">N/A</li>'}</ul>

          <h3>Géneros</h3>
          <ul>${game.genres && game.genres.length > 0 ? game.genres.map(g => `<li>${escapeHTML(g.name)}</li>`).join('') : '<li class="no-data">N/A</li>'}</ul>
        </aside>
      </section>
    `;
  } catch {
    container.innerHTML = `<div class="error-state"><p>Error al obtener la información del juego.</p><a href="#/" class="back-btn">Volver</a></div>`;
  }

  return container;
}