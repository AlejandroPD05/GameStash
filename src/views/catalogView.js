import { getGames } from '../api.js';
import { init3DTilt, animateLootDrop } from '../animations.js';

let currentLayoutMode = 'grid';

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

export async function renderCatalogView(queryParams = new URLSearchParams()) {
  const searchQuery = queryParams.get('search') || '';
  const currentGenreStr = queryParams.get('genres') || '';
  const selectedGenres = currentGenreStr ? currentGenreStr.split(',').filter(Boolean) : [];
  const currentPlatformStr = queryParams.get('parent_platforms') || '';
  const selectedPlatforms = currentPlatformStr ? currentPlatformStr.split(',').filter(Boolean) : [];
  const currentOrdering = queryParams.get('ordering') || '-rating';
  const currentPage = parseInt(queryParams.get('page') || '1', 10);

  const defaultGenres = ['', 'action', 'role-playing-games-rpg', 'shooter', 'adventure', 'indie', 'strategy'];
  const customSelectedGenres = selectedGenres.filter(g => !defaultGenres.includes(g));

  const availableGenres = [
    { value: 'puzzle', label: 'Puzzle' },
    { value: 'racing', label: 'Carreras' },
    { value: 'simulation', label: 'Simulación' },
    { value: 'arcade', label: 'Arcade' },
    { value: 'platformer', label: 'Plataformas' },
    { value: 'massively-multiplayer', label: 'MMO / Multijugador' },
    { value: 'sports', label: 'Deportes' },
    { value: 'fighting', label: 'Lucha' },
    { value: 'casual', label: 'Casual' },
    { value: 'family', label: 'Familiar' },
    { value: 'board-games', label: 'Juegos de mesa' },
    { value: 'educational', label: 'Educativo' },
    { value: 'card', label: 'Cartas' }
  ];

  const orderingLabels = {
    '-rating': 'Mejor Valorados',
    '-released': 'Novedades',
    'upcoming': 'Próximos Lanzamientos',
    '-added': 'Más Populares',
    'name': 'Nombre (A-Z)'
  };

  const platformLabels = {
    '1': 'PC',
    '2': 'PlayStation',
    '3': 'Xbox',
    '7': 'Nintendo',
    '4': 'iOS',
    '8': 'Android'
  };

  function getPlatformLabelText(selected) {
    if (selected.length === 0) return 'Todas las plataformas';
    if (selected.length === 1) return platformLabels[selected[0]] || 'Todas las plataformas';
    return `${selected.length} plataformas`;
  }

  const container = document.createElement('div');
  container.className = 'catalog-page';
  container.innerHTML = `
    <section class="hero-section">
      <h1>Abre el <span>STASH</span> de los Videojuegos</h1>
      <p class="hero-subtitle">Descubre títulos legendarios, calificaciones de Metacritic y análisis en tiempo real.</p>
      
      <form id="search-form" class="search-box-wrapper">
        <div class="search-box">
          <input 
            type="text" 
            id="search-input" 
            placeholder="Buscar un juego (ej. Zelda, Cyberpunk, Elden Ring)..." 
            value="${escapeHTML(searchQuery)}"
          />
          <button type="submit" aria-label="Buscar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <span>Explorar</span>
          </button>
        </div>

        <div class="filters-container">
          <div class="genre-filter-wrapper">
            <div class="genre-chips-container" id="genre-chips">
              <button type="button" class="genre-chip ${selectedGenres.length === 0 ? 'active' : ''}" data-genre="">Todos</button>
              <button type="button" class="genre-chip ${selectedGenres.includes('action') ? 'active' : ''}" data-genre="action">Acción</button>
              <button type="button" class="genre-chip ${selectedGenres.includes('role-playing-games-rpg') ? 'active' : ''}" data-genre="role-playing-games-rpg">RPG</button>
              <button type="button" class="genre-chip ${selectedGenres.includes('shooter') ? 'active' : ''}" data-genre="shooter">Shooter</button>
              <button type="button" class="genre-chip ${selectedGenres.includes('adventure') ? 'active' : ''}" data-genre="adventure">Aventura</button>
              <button type="button" class="genre-chip ${selectedGenres.includes('indie') ? 'active' : ''}" data-genre="indie">Indie</button>
              <button type="button" class="genre-chip ${selectedGenres.includes('strategy') ? 'active' : ''}" data-genre="strategy">Estrategia</button>
              ${customSelectedGenres.map(g => `<button type="button" class="genre-chip active custom-chip" data-genre="${escapeHTML(g)}">${escapeHTML(g.replace(/-/g, ' '))}</button>`).join('')}
            </div>

            <div class="genre-search-input-box" id="genre-search-wrapper">
              <input type="text" id="genre-search-input" autocomplete="off" placeholder="+ Buscar/añadir otro género (Enter)..." />
              <div class="genre-suggestions-dropdown" id="genre-suggestions-menu" role="listbox"></div>
            </div>
          </div>

          <input type="hidden" id="filter-genre-val" value="${escapeHTML(currentGenreStr)}" />
          <input type="hidden" id="filter-platform-val" value="${escapeHTML(currentPlatformStr)}" />
          <input type="hidden" id="filter-ordering-val" value="${escapeHTML(currentOrdering)}" />

          <div class="custom-dropdown-wrapper">
            <span class="dropdown-label">Plataforma:</span>
            <div class="custom-dropdown" id="platform-dropdown" role="combobox" aria-expanded="false" aria-haspopup="listbox">
              <button type="button" class="dropdown-trigger" id="platform-dropdown-trigger" aria-controls="platform-dropdown-menu" aria-label="Filtrar por plataforma">
                <span class="selected-text" id="selected-platform-text">${escapeHTML(getPlatformLabelText(selectedPlatforms))}</span>
                <svg class="dropdown-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              
              <div class="dropdown-menu" id="platform-dropdown-menu" role="listbox">
                <div class="dropdown-option ${selectedPlatforms.length === 0 ? 'selected' : ''}" role="option" tabindex="0" data-value="">Todas las plataformas</div>
                <div class="dropdown-option ${selectedPlatforms.includes('1') ? 'selected' : ''}" role="option" tabindex="0" data-value="1">PC</div>
                <div class="dropdown-option ${selectedPlatforms.includes('2') ? 'selected' : ''}" role="option" tabindex="0" data-value="2">PlayStation</div>
                <div class="dropdown-option ${selectedPlatforms.includes('3') ? 'selected' : ''}" role="option" tabindex="0" data-value="3">Xbox</div>
                <div class="dropdown-option ${selectedPlatforms.includes('7') ? 'selected' : ''}" role="option" tabindex="0" data-value="7">Nintendo</div>
                <div class="dropdown-option ${selectedPlatforms.includes('4') ? 'selected' : ''}" role="option" tabindex="0" data-value="4">iOS</div>
                <div class="dropdown-option ${selectedPlatforms.includes('8') ? 'selected' : ''}" role="option" tabindex="0" data-value="8">Android</div>
              </div>
            </div>
          </div>

          <div class="custom-dropdown-wrapper">
            <span class="dropdown-label">Ordenar por:</span>
            <div class="custom-dropdown" id="ordering-dropdown" role="combobox" aria-expanded="false" aria-haspopup="listbox">
              <button type="button" class="dropdown-trigger" id="dropdown-trigger" aria-controls="dropdown-menu" aria-label="Ordenar por">
                <span class="selected-text" id="selected-ordering-text">${escapeHTML(orderingLabels[currentOrdering] || 'Mejor Valorados')}</span>
                <svg class="dropdown-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              
              <div class="dropdown-menu" id="dropdown-menu" role="listbox">
                <div class="dropdown-option ${currentOrdering === '-rating' ? 'selected' : ''}" role="option" tabindex="0" data-value="-rating">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  Mejor Valorados
                </div>
                <div class="dropdown-option ${currentOrdering === '-released' ? 'selected' : ''}" role="option" tabindex="0" data-value="-released">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  Novedades
                </div>
                <div class="dropdown-option ${currentOrdering === 'upcoming' ? 'selected' : ''}" role="option" tabindex="0" data-value="upcoming">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Próximos Lanzamientos
                </div>
                <div class="dropdown-option ${currentOrdering === '-added' ? 'selected' : ''}" role="option" tabindex="0" data-value="-added">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  Más Populares
                </div>
                <div class="dropdown-option ${currentOrdering === 'name' ? 'selected' : ''}" role="option" tabindex="0" data-value="name">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6v12a3 3 0 0 0 3-3H6a3 3 0 0 0 3 3V6"/></svg>
                  Nombre (A-Z)
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </section>

    <div class="results-bar" id="results-bar">
      <div class="results-info">
        <span class="results-count" id="results-count">Cargando juegos...</span>
        <button type="button" class="btn-clear-filters" id="btn-clear-filters" style="display: none;">
          &times; Limpiar filtros
        </button>
      </div>

      <div class="view-toggle-group">
        <button type="button" id="btn-grid-view" class="view-btn ${currentLayoutMode === 'grid' ? 'active' : ''}" title="Vista en cuadrícula">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        </button>
        <button type="button" id="btn-list-view" class="view-btn ${currentLayoutMode === 'list' ? 'active' : ''}" title="Vista en lista">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
        </button>
      </div>
    </div>

    <section class="games-grid ${currentLayoutMode === 'list' ? 'list-mode' : ''}" id="games-grid">
      ${Array(12).fill('<div class="skeleton-card"></div>').join('')}
    </section>

    <div class="pagination-wrapper" id="pagination-wrapper"></div>
  `;

  function createGameCardHTML(game) {
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
      <article class="game-card" data-id="${game.id}" data-rarity="${rarity}">
        <a href="#/game?id=${game.id}">
          <div class="card-media">
            <img src="${game.background_image || 'https://via.placeholder.com/600x350'}" alt="${escapeHTML(game.name)}" loading="lazy" />
            <div class="card-badges">
              <span class="rarity-badge ${rarity}">${rarityLabel}</span>
              <span class="rating">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ${game.rating || 'N/A'}
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

  function checkActiveFiltersState() {
    const query = container.querySelector('#search-input').value.trim();
    const genre = container.querySelector('#filter-genre-val').value;
    const platform = container.querySelector('#filter-platform-val').value;
    const ordering = container.querySelector('#filter-ordering-val').value;

    const isFiltered = Boolean(query || genre || platform || (ordering && ordering !== '-rating'));
    const clearBtn = container.querySelector('#btn-clear-filters');
    if (clearBtn) {
      clearBtn.style.display = isFiltered ? 'inline-flex' : 'none';
    }
  }

  function triggerSearch(page = 1) {
    const query = container.querySelector('#search-input').value.trim();
    const genre = container.querySelector('#filter-genre-val').value;
    const platform = container.querySelector('#filter-platform-val').value;
    const ordering = container.querySelector('#filter-ordering-val').value;

    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (genre) params.set('genres', genre);
    if (platform) params.set('parent_platforms', platform);
    if (ordering) params.set('ordering', ordering);
    if (page > 1) params.set('page', page);

    const newHash = `#/catalog?${params.toString()}`;

    if (window.location.hash === newHash) {
      return;
    }

    window.location.hash = newHash;
  }

  function renderPaginationControls(totalItems, currentPage) {
    const paginationWrapper = container.querySelector('#pagination-wrapper');
    const pageSize = 12;
    const totalPages = Math.min(Math.ceil(totalItems / pageSize), 1000);

    if (totalPages <= 1) {
      paginationWrapper.innerHTML = '';
      return;
    }

    let pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    let html = `
      <button type="button" class="btn-page" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
        &laquo; Anterior
      </button>
    `;

    if (start > 1) {
      html += `<button type="button" class="btn-page" data-page="1">1</button>`;
      if (start > 2) html += `<span class="pagination-ellipsis">&hellip;</span>`;
    }

    for (let p = start; p <= end; p++) {
      html += `<button type="button" class="btn-page ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
    }

    if (end < totalPages) {
      if (end < totalPages - 1) html += `<span class="pagination-ellipsis">&hellip;</span>`;
      html += `<button type="button" class="btn-page" data-page="${totalPages}">${totalPages}</button>`;
    }

    html += `
      <button type="button" class="btn-page" data-page="${currentPage + 1}" ${currentPage >= totalPages ? 'disabled' : ''}>
        Siguiente &raquo;
      </button>
    `;

    paginationWrapper.innerHTML = html;

    paginationWrapper.querySelectorAll('.btn-page:not(:disabled)').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPage = parseInt(btn.dataset.page, 10);
        if (targetPage && targetPage !== currentPage) {
          triggerSearch(targetPage);
        }
      });
    });
  }

  setTimeout(async () => {
    const grid = container.querySelector('#games-grid');
    const genreChipsContainer = container.querySelector('#genre-chips');
    const genreSearchInput = container.querySelector('#genre-search-input');
    const genreSearchWrapper = container.querySelector('#genre-search-wrapper');
    const genreSuggestionsMenu = container.querySelector('#genre-suggestions-menu');
    const resultsCountEl = container.querySelector('#results-count');
    const clearFiltersBtn = container.querySelector('#btn-clear-filters');
    
    const orderingWrapper = container.querySelector('#ordering-dropdown');
    const orderingTrigger = container.querySelector('#dropdown-trigger');
    const orderingMenu = container.querySelector('#dropdown-menu');

    const platformWrapper = container.querySelector('#platform-dropdown');
    const platformTrigger = container.querySelector('#platform-dropdown-trigger');
    const platformMenu = container.querySelector('#platform-dropdown-menu');

    const gridBtn = container.querySelector('#btn-grid-view');
    const listBtn = container.querySelector('#btn-list-view');

    checkActiveFiltersState();

    function switchLayoutMode(newMode) {
      if (currentLayoutMode === newMode) return;
      currentLayoutMode = newMode;
      grid.classList.add('view-switching');

      if (currentLayoutMode === 'list') {
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

    function addGenreChipAndSearch(slug, label) {
      let existingChip = genreChipsContainer.querySelector(`.genre-chip[data-genre="${slug}"]`);

      if (!existingChip) {
        const newChip = document.createElement('button');
        newChip.type = 'button';
        newChip.className = 'genre-chip active custom-chip';
        newChip.dataset.genre = slug;
        newChip.textContent = label || slug.replace(/-/g, ' ');
        genreChipsContainer.appendChild(newChip);
      } else {
        existingChip.classList.add('active');
      }

      const todosChip = genreChipsContainer.querySelector('.genre-chip[data-genre=""]');
      if (todosChip) todosChip.classList.remove('active');

      const activeGenres = Array.from(genreChipsContainer.querySelectorAll('.genre-chip.active'))
        .map(c => c.dataset.genre)
        .filter(g => g !== '');

      container.querySelector('#filter-genre-val').value = activeGenres.join(',');
      genreSearchInput.value = '';
      genreSuggestionsMenu.classList.remove('open');
      triggerSearch();
    }

    function renderSuggestions() {
      const query = genreSearchInput.value.trim().toLowerCase();
      const filtered = availableGenres.filter(g => 
        g.label.toLowerCase().includes(query) || g.value.toLowerCase().includes(query)
      );

      if (filtered.length === 0) {
        genreSuggestionsMenu.innerHTML = '';
        genreSuggestionsMenu.classList.remove('open');
        return;
      }

      const currentActive = container.querySelector('#filter-genre-val').value.split(',');

      genreSuggestionsMenu.innerHTML = filtered.map(g => {
        const isSelected = currentActive.includes(g.value);
        return `<div class="genre-suggestion-item ${isSelected ? 'selected' : ''}" role="option" tabindex="0" data-value="${escapeHTML(g.value)}" data-label="${escapeHTML(g.label)}">
          ${escapeHTML(g.label)}
        </div>`;
      }).join('');

      genreSuggestionsMenu.classList.add('open');
    }

    genreSearchInput.addEventListener('focus', renderSuggestions);
    genreSearchInput.addEventListener('input', renderSuggestions);

    genreSuggestionsMenu.addEventListener('click', (e) => {
      const item = e.target.closest('.genre-suggestion-item');
      if (!item) return;
      addGenreChipAndSearch(item.dataset.value, item.dataset.label);
    });

    genreChipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.genre-chip');
      if (!chip) return;

      const clickedGenre = chip.dataset.genre;
      const todosChip = genreChipsContainer.querySelector('.genre-chip[data-genre=""]');

      if (clickedGenre === '') {
        genreChipsContainer.querySelectorAll('.genre-chip').forEach(c => c.classList.remove('active'));
        todosChip.classList.add('active');
      } else {
        todosChip.classList.remove('active');
        chip.classList.toggle('active');

        const activeChips = genreChipsContainer.querySelectorAll('.genre-chip.active:not([data-genre=""])');
        if (activeChips.length === 0) {
          todosChip.classList.add('active');
        }
      }

      const activeGenres = Array.from(genreChipsContainer.querySelectorAll('.genre-chip.active'))
        .map(c => c.dataset.genre)
        .filter(g => g !== '');

      container.querySelector('#filter-genre-val').value = activeGenres.join(',');
      triggerSearch();
    });

    genreSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const rawVal = genreSearchInput.value.trim().toLowerCase();
        if (!rawVal) return;

        const matched = availableGenres.find(g => g.label.toLowerCase() === rawVal || g.value === rawVal);
        const slug = matched ? matched.value : rawVal.replace(/\s+/g, '-');
        const label = matched ? matched.label : rawVal;

        addGenreChipAndSearch(slug, label);
      }
    });

    platformTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      orderingWrapper.classList.remove('open');
      orderingWrapper.setAttribute('aria-expanded', 'false');
      genreSuggestionsMenu.classList.remove('open');

      const isExpanded = platformWrapper.getAttribute('aria-expanded') === 'true';
      platformWrapper.setAttribute('aria-expanded', !isExpanded);
      platformWrapper.classList.toggle('open');
    });

    platformMenu.addEventListener('click', (e) => {
      const option = e.target.closest('.dropdown-option');
      if (!option) return;

      const val = option.dataset.value;
      let currentSelected = container.querySelector('#filter-platform-val').value
        ? container.querySelector('#filter-platform-val').value.split(',').filter(Boolean)
        : [];

      if (val === '') {
        currentSelected = [];
      } else {
        if (currentSelected.includes(val)) {
          currentSelected = currentSelected.filter(item => item !== val);
        } else {
          currentSelected.push(val);
        }
      }

      container.querySelector('#filter-platform-val').value = currentSelected.join(',');

      platformMenu.querySelectorAll('.dropdown-option').forEach(opt => {
        const optVal = opt.dataset.value;
        if (optVal === '') {
          opt.classList.toggle('selected', currentSelected.length === 0);
        } else {
          opt.classList.toggle('selected', currentSelected.includes(optVal));
        }
      });

      container.querySelector('#selected-platform-text').textContent = getPlatformLabelText(currentSelected);

      triggerSearch();
    });

    orderingTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      platformWrapper.classList.remove('open');
      platformWrapper.setAttribute('aria-expanded', 'false');
      genreSuggestionsMenu.classList.remove('open');

      const isExpanded = orderingWrapper.getAttribute('aria-expanded') === 'true';
      orderingWrapper.setAttribute('aria-expanded', !isExpanded);
      orderingWrapper.classList.toggle('open');
    });

    orderingMenu.addEventListener('click', (e) => {
      const option = e.target.closest('.dropdown-option');
      if (!option) return;

      orderingMenu.querySelectorAll('.dropdown-option').forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');

      const val = option.dataset.value;
      container.querySelector('#filter-ordering-val').value = val;
      container.querySelector('#selected-ordering-text').textContent = option.textContent.trim();

      orderingWrapper.classList.remove('open');
      orderingWrapper.setAttribute('aria-expanded', 'false');
      triggerSearch();
    });

    clearFiltersBtn.addEventListener('click', () => {
      container.querySelector('#search-input').value = '';
      container.querySelector('#filter-genre-val').value = '';
      container.querySelector('#filter-platform-val').value = '';
      container.querySelector('#filter-ordering-val').value = '-rating';

      genreChipsContainer.querySelectorAll('.genre-chip').forEach(c => c.classList.remove('active'));
      const todosChip = genreChipsContainer.querySelector('.genre-chip[data-genre=""]');
      if (todosChip) todosChip.classList.add('active');
      genreChipsContainer.querySelectorAll('.custom-chip').forEach(chip => chip.remove());

      container.querySelector('#selected-platform-text').textContent = getPlatformLabelText([]);
      platformMenu.querySelectorAll('.dropdown-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.value === '');
      });

      container.querySelector('#selected-ordering-text').textContent = orderingLabels['-rating'];
      orderingMenu.querySelectorAll('.dropdown-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.value === '-rating');
      });

      triggerSearch();
    });

    container.addEventListener('click', (e) => {
      if (orderingWrapper && !orderingWrapper.contains(e.target)) {
        orderingWrapper.classList.remove('open');
        orderingWrapper.setAttribute('aria-expanded', 'false');
      }
      if (platformWrapper && !platformWrapper.contains(e.target)) {
        platformWrapper.classList.remove('open');
        platformWrapper.setAttribute('aria-expanded', 'false');
      }
      if (genreSearchWrapper && !genreSearchWrapper.contains(e.target)) {
        genreSuggestionsMenu.classList.remove('open');
      }
    });

    container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const option = e.target.closest('.dropdown-option, .genre-suggestion-item');
        if (option) {
          e.preventDefault();
          option.click();
        }
      }
    });

    async function fetchAndRenderPage(page) {
      try {
        const genreVal = container.querySelector('#filter-genre-val').value;
        const platformVal = container.querySelector('#filter-platform-val').value;
        const orderingVal = container.querySelector('#filter-ordering-val').value;

        const todayStr = new Date().toISOString().split('T')[0];
        let datesParam = '';
        let actualOrdering = orderingVal;

        if (orderingVal === '-released') {
          datesParam = `1950-01-01,${todayStr}`;
        } else if (orderingVal === 'upcoming') {
          datesParam = `${todayStr},2035-12-31`;
          actualOrdering = 'released';
        }

        const queryObj = { 
          page: page, 
          search: searchQuery, 
          genres: genreVal,
          parent_platforms: platformVal,
          ordering: actualOrdering,
          pageSize: 12 
        };

        if (datesParam) {
          queryObj.dates = datesParam;
        }

        const data = await getGames(queryObj);
        const totalCount = data.count || 0;
        const formattedCount = new Intl.NumberFormat('es-ES').format(totalCount);
        resultsCountEl.textContent = `${formattedCount} ${totalCount === 1 ? 'juego encontrado' : 'juegos encontrados'}`;

        if (!data.results || data.results.length === 0) {
          grid.innerHTML = `
            <div class="empty-state">
              <p>No se ha encontrado nada en el Stash bajo ese nombre o filtros.</p>
            </div>
          `;
          container.querySelector('#pagination-wrapper').innerHTML = '';
          return;
        }

        grid.innerHTML = '';

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data.results.map(createGameCardHTML).join('');
        const newCards = Array.from(tempDiv.children);

        newCards.forEach(card => {
          card.classList.add('fresh-card');
          grid.appendChild(card);
        });

        animateLootDrop('.fresh-card');
        init3DTilt('.fresh-card');

        newCards.forEach(card => card.classList.remove('fresh-card'));

        renderPaginationControls(totalCount, page);

      } catch (err) {
        resultsCountEl.textContent = '0 juegos encontrados';
        grid.innerHTML = `
          <div class="error-state">
            <p>Ocurrió un error al saquear la base de datos.</p>
          </div>
        `;
        container.querySelector('#pagination-wrapper').innerHTML = '';
      }
    }

    await fetchAndRenderPage(currentPage);

  }, 0);

  container.addEventListener('submit', (e) => {
    if (e.target.id === 'search-form') {
      e.preventDefault();
      triggerSearch();
    }
  });

  return container;
}