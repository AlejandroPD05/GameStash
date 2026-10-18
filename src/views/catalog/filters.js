import { escapeHTML } from '../../utils/escapeHTML.js';
import {
  AVAILABLE_GENRES,
  DEFAULT_GENRE_CHIPS,
  ORDERING_LABELS,
  ORDERING_OPTIONS,
  PLATFORM_LABELS,
  PLATFORM_OPTIONS
} from './constants.js';
import { triggerSearch } from './state.js';

// Etiqueta del trigger del dropdown de plataformas según lo seleccionado.
export function getPlatformLabelText(selected) {
  if (selected.length === 0) return 'Todas las plataformas';
  if (selected.length === 1) return PLATFORM_LABELS[selected[0]] || 'Todas las plataformas';
  return `${selected.length} plataformas`;
}

// Comprueba si hay filtros activos y muestra/oculta el botón "Limpiar filtros".
export function checkActiveFiltersState(container) {
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

// Genera la sección hero con el buscador y todos los controles de filtro
// (chips de géneros, buscador de géneros y los dos dropdowns custom).
export function renderFiltersHTML({
  searchQuery,
  currentGenreStr,
  currentPlatformStr,
  selectedGenres,
  customSelectedGenres,
  selectedPlatforms,
  currentOrdering
}) {
  const defaultChipsHTML = DEFAULT_GENRE_CHIPS.map(chip => {
    const isActive = chip.value === ''
      ? selectedGenres.length === 0
      : selectedGenres.includes(chip.value);
    return `\n              <button type="button" class="genre-chip ${isActive ? 'active' : ''}" data-genre="${chip.value}">${chip.label}</button>`;
  }).join('');

  const customChipsHTML = customSelectedGenres.map(g =>
    `\n              <button type="button" class="genre-chip active custom-chip" data-genre="${escapeHTML(g)}">${escapeHTML(g.replace(/-/g, ' '))}</button>`
  ).join('');

  const platformOptionsHTML = PLATFORM_OPTIONS.map(option => {
    const isSelected = option.value === ''
      ? selectedPlatforms.length === 0
      : selectedPlatforms.includes(option.value);
    return `\n                <div class="dropdown-option ${isSelected ? 'selected' : ''}" role="option" tabindex="0" data-value="${option.value}">${option.label}</div>`;
  }).join('');

  const orderingOptionsHTML = ORDERING_OPTIONS.map(option => `
                <div class="dropdown-option ${currentOrdering === option.value ? 'selected' : ''}" role="option" tabindex="0" data-value="${option.value}">
                  ${option.icon}
                  ${option.label}
                </div>`).join('');

  return `
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
            maxlength="80"
            autocomplete="off"
            spellcheck="false"
          />
          <button type="submit" aria-label="Buscar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <span>Explorar</span>
          </button>
        </div>

        <div class="filters-container">
          <div class="genre-filter-wrapper">
            <div class="genre-chips-container" id="genre-chips">${defaultChipsHTML}${customChipsHTML}
            </div>

            <div class="genre-search-input-box" id="genre-search-wrapper">
              <input type="text" id="genre-search-input" autocomplete="off" spellcheck="false" maxlength="40" placeholder="+ Buscar/añadir otro género (Enter)..." />
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
              
              <div class="dropdown-menu" id="platform-dropdown-menu" role="listbox">${platformOptionsHTML}
              </div>
            </div>
          </div>

          <div class="custom-dropdown-wrapper">
            <span class="dropdown-label">Ordenar por:</span>
            <div class="custom-dropdown" id="ordering-dropdown" role="combobox" aria-expanded="false" aria-haspopup="listbox">
              <button type="button" class="dropdown-trigger" id="dropdown-trigger" aria-controls="dropdown-menu" aria-label="Ordenar por">
                <span class="selected-text" id="selected-ordering-text">${escapeHTML(ORDERING_LABELS[currentOrdering] || 'Mejor Valorados')}</span>
                <svg class="dropdown-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              
              <div class="dropdown-menu" id="dropdown-menu" role="listbox">${orderingOptionsHTML}
              </div>
            </div>
          </div>
        </div>
      </form>
    </section>
  `;
}

// Registra todos los listeners de la barra de filtros: chips multiselect,
// buscador de géneros con sugerencias, dropdowns de plataforma/orden, limpieza
// y cierre de menús al pulsar fuera.
export function initFilters(container) {
  const genreChipsContainer = container.querySelector('#genre-chips');
  const genreSearchInput = container.querySelector('#genre-search-input');
  const genreSearchWrapper = container.querySelector('#genre-search-wrapper');
  const genreSuggestionsMenu = container.querySelector('#genre-suggestions-menu');
  const clearFiltersBtn = container.querySelector('#btn-clear-filters');

  const orderingWrapper = container.querySelector('#ordering-dropdown');
  const orderingTrigger = container.querySelector('#dropdown-trigger');
  const orderingMenu = container.querySelector('#dropdown-menu');

  const platformWrapper = container.querySelector('#platform-dropdown');
  const platformTrigger = container.querySelector('#platform-dropdown-trigger');
  const platformMenu = container.querySelector('#platform-dropdown-menu');

  checkActiveFiltersState(container);

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
    triggerSearch(container);
  }

  function renderSuggestions() {
    const query = genreSearchInput.value.trim().toLowerCase();
    const filtered = AVAILABLE_GENRES.filter(g =>
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
    triggerSearch(container);
  });

  genreSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const rawVal = genreSearchInput.value.trim().toLowerCase();
      if (!rawVal) return;

      const matched = AVAILABLE_GENRES.find(g => g.label.toLowerCase() === rawVal || g.value === rawVal);
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

    triggerSearch(container);
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
    triggerSearch(container);
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

    container.querySelector('#selected-ordering-text').textContent = ORDERING_LABELS['-rating'];
    orderingMenu.querySelectorAll('.dropdown-option').forEach(opt => {
      opt.classList.toggle('selected', opt.dataset.value === '-rating');
    });

    triggerSearch(container);
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
}
