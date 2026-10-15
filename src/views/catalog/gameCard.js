import { escapeHTML } from '../../utils/escapeHTML.js';
import { animateLootDrop, init3DTilt } from '../../animations.js';
import { getLayoutMode, setLayoutMode } from './state.js';

// Render de una tarjeta de juego (plantilla usada tanto en grid como en lista).
export function createGameCardHTML(game) {
  const releaseYear = game.released ? game.released.split('-')[0] : 'N/A';
  const platformsList = game.platforms
    ? game.platforms.slice(0, 3).map(p => `<span class="platform-pill">${escapeHTML(p.platform.name)}</span>`).join('')
    : '';
  const genresText = game.genres ? game.genres.map(g => g.name).slice(0, 2).join(' • ') : 'Varios';

  let rarity = 'common';
  let rarityLabel = 'COMÚN';

  const score = game.metacritic || (game.rating ? game.rating * 20 : 0);

  if (score >= 85 || game.rating >= 4.4) {
    rarity = 'legendary';
    rarityLabel = 'LEGENDARIO';
  } else if (score >= 75 || game.rating >= 3.8) {
    rarity = 'epic';
    rarityLabel = 'ÉPICO';
  } else if (score >= 60 || game.rating >= 3.0) {
    rarity = 'rare';
    rarityLabel = 'RARO';
  } else if (score >= 40 || game.rating >= 2.0) {
    rarity = 'uncommon';
    rarityLabel = 'POCO COMÚN';
  }

  return `
      <article class="game-card" data-id="${escapeHTML(game.id)}" data-rarity="${rarity}">
        <a href="#/game?id=${escapeHTML(game.id)}">
          <div class="card-media">
            <img src="${escapeHTML(game.background_image || 'https://via.placeholder.com/600x350')}" alt="${escapeHTML(game.name)}" loading="lazy" />
            <div class="card-badges">
              <span class="rarity-badge ${rarity}">${rarityLabel}</span>
              <span class="rating">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ${escapeHTML(game.rating || 'N/A')}
              </span>
            </div>
          </div>
          <div class="card-content">
            <h3>${escapeHTML(game.name)}</h3>
            <div class="card-info-row">
              <span>${escapeHTML(genresText)}</span>
              <span class="inline-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                ${escapeHTML(releaseYear)}
              </span>
            </div>
            <div class="platform-pills">
              ${platformsList}
            </div>
          </div>
        </a>
      </article>
    `;
}

// Vuelca las tarjetas en el grid aplicando la animación de "loot drop" y el
// tilt 3D solo a las recién cargadas.
export function renderGameCards(grid, games) {
  grid.innerHTML = '';

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = games.map(createGameCardHTML).join('');
  const newCards = Array.from(tempDiv.children);

  newCards.forEach(card => {
    card.classList.add('fresh-card');
    grid.appendChild(card);
  });

  animateLootDrop('.fresh-card');
  init3DTilt('.fresh-card');

  newCards.forEach(card => card.classList.remove('fresh-card'));
}

// Conecta los botones de alternar entre vista de cuadrícula y de lista.
export function initLayoutToggle(container) {
  const grid = container.querySelector('#games-grid');
  const gridBtn = container.querySelector('#btn-grid-view');
  const listBtn = container.querySelector('#btn-list-view');

  function switchLayoutMode(newMode) {
    if (getLayoutMode() === newMode) return;
    setLayoutMode(newMode);
    grid.classList.add('view-switching');

    if (getLayoutMode() === 'list') {
      gridBtn.classList.remove('active');
      listBtn.classList.add('active');
      grid.classList.add('list-mode');
    } else {
      listBtn.classList.remove('active');
      gridBtn.classList.add('active');
      grid.classList.remove('list-mode');
    }

    setTimeout(() => {
      grid.classList.remove('view-switching');
    }, 300);
  }

  gridBtn?.addEventListener('click', () => switchLayoutMode('grid'));
  listBtn?.addEventListener('click', () => switchLayoutMode('list'));
}
