// Estado compartido de la vista de catálogo.
//
// El estado "importante" (filtros, orden y página) vive en la URL (el hash),
// así que aquí solo se mantiene lo que no se serializa: el modo de vista
// actual (grid/lista), que por defecto vuelve a "grid" en cada render pero
// persiste mientras la SPA siga viva, igual que antes.

let currentLayoutMode = 'grid';

export function getLayoutMode() {
  return currentLayoutMode;
}

export function setLayoutMode(mode) {
  currentLayoutMode = mode;
}

// Lee el estado de filtros desde el DOM (campo de búsqueda + inputs ocultos).
export function readFilterState(container) {
  return {
    query: container.querySelector('#search-input').value.trim(),
    genre: container.querySelector('#filter-genre-val').value,
    platform: container.querySelector('#filter-platform-val').value,
    ordering: container.querySelector('#filter-ordering-val').value
  };
}

// Serializa los filtros actuales en el hash y navega. Si el hash resultante
// es idéntico al actual no hace nada (evita un re-render sin cambios).
export function triggerSearch(container, page = 1) {
  const { query, genre, platform, ordering } = readFilterState(container);

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
