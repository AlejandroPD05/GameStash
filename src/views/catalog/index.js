import { getGames } from '../../api.js';
import { DEFAULT_GENRES, PAGE_SIZE, SKELETON_CARD_COUNT } from './constants.js';
import { initFilters, renderFiltersHTML } from './filters.js';
import { initLayoutToggle, renderGameCards } from './gameCard.js';
import { clearPagination, renderPaginationControls } from './pagination.js';
import { getLayoutMode, readFilterState, triggerSearch } from './state.js';

// Vista del catálogo (patrón view-as-function): devuelve un HTMLElement que el
// router monta. El estado de filtros/orden/página vive en la URL (hash).
export async function renderCatalogView(queryParams = new URLSearchParams()) {
  const searchQuery = queryParams.get('search') || '';
  const currentGenreStr = queryParams.get('genres') || '';
  const selectedGenres = currentGenreStr ? currentGenreStr.split(',').filter(Boolean) : [];
  const currentPlatformStr = queryParams.get('parent_platforms') || '';
  const selectedPlatforms = currentPlatformStr ? currentPlatformStr.split(',').filter(Boolean) : [];
  const currentOrdering = queryParams.get('ordering') || '-rating';
  const currentPage = parseInt(queryParams.get('page') || '1', 10);

  const customSelectedGenres = selectedGenres.filter(g => !DEFAULT_GENRES.includes(g));

  const container = document.createElement('div');
  container.className = 'catalog-page';
  container.innerHTML = `
    ${renderFiltersHTML({
      searchQuery,
      currentGenreStr,
      currentPlatformStr,
      selectedGenres,
      customSelectedGenres,
      selectedPlatforms,
      currentOrdering
    })}

    <div class="results-bar" id="results-bar">
      <div class="results-info">
        <span class="results-count" id="results-count">Cargando juegos...</span>
        <button type="button" class="btn-clear-filters" id="btn-clear-filters" style="display: none;">
          &times; Limpiar filtros
        </button>
      </div>

      <div class="view-toggle-group">
        <button type="button" id="btn-grid-view" class="view-btn ${getLayoutMode() === 'grid' ? 'active' : ''}" title="Vista en cuadrícula">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        </button>
        <button type="button" id="btn-list-view" class="view-btn ${getLayoutMode() === 'list' ? 'active' : ''}" title="Vista en lista">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
        </button>
      </div>
    </div>

    <section class="games-grid ${getLayoutMode() === 'list' ? 'list-mode' : ''}" id="games-grid">
      ${Array(SKELETON_CARD_COUNT).fill('<div class="skeleton-card"></div>').join('')}
    </section>

    <div class="pagination-wrapper" id="pagination-wrapper"></div>
  `;

  setTimeout(async () => {
    const grid = container.querySelector('#games-grid');
    const resultsCountEl = container.querySelector('#results-count');

    initLayoutToggle(container);
    initFilters(container);

    async function fetchAndRenderPage(page) {
      try {
        const { genre, platform, ordering } = readFilterState(container);

        const todayStr = new Date().toISOString().split('T')[0];
        let datesParam = '';
        let actualOrdering = ordering;

        if (ordering === '-released') {
          datesParam = `1950-01-01,${todayStr}`;
        } else if (ordering === 'upcoming') {
          datesParam = `${todayStr},2035-12-31`;
          actualOrdering = 'released';
        }

        const queryObj = {
          page: page,
          search: searchQuery,
          genres: genre,
          parent_platforms: platform,
          ordering: actualOrdering,
          pageSize: PAGE_SIZE
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
          clearPagination(container);
          return;
        }

        renderGameCards(grid, data.results);

        renderPaginationControls(container, totalCount, page);

      } catch {
        resultsCountEl.textContent = '0 juegos encontrados';
        grid.innerHTML = `
          <div class="error-state">
            <p>Ocurrió un error al saquear la base de datos.</p>
          </div>
        `;
        clearPagination(container);
      }
    }

    await fetchAndRenderPage(currentPage);

  }, 0);

  container.addEventListener('submit', (e) => {
    if (e.target.id === 'search-form') {
      e.preventDefault();
      triggerSearch(container);
    }
  });

  return container;
}
