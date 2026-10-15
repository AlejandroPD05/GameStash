import { MAX_PAGES, MAX_VISIBLE_PAGES, PAGE_SIZE } from './constants.js';
import { triggerSearch } from './state.js';

// Calcula la ventana de páginas visibles: 5 como máximo, centrada en la
// página actual y ajustada contra los extremos (1 y última).
export function getPageWindow(totalPages, currentPage) {
  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, start + MAX_VISIBLE_PAGES - 1);

  if (end - start + 1 < MAX_VISIBLE_PAGES) {
    start = Math.max(1, end - MAX_VISIBLE_PAGES + 1);
  }

  return { start, end };
}

export function clearPagination(container) {
  const wrapper = container.querySelector('#pagination-wrapper');
  if (wrapper) wrapper.innerHTML = '';
}

export function renderPaginationControls(container, totalItems, currentPage) {
  const paginationWrapper = container.querySelector('#pagination-wrapper');
  const totalPages = Math.min(Math.ceil(totalItems / PAGE_SIZE), MAX_PAGES);

  if (totalPages <= 1) {
    paginationWrapper.innerHTML = '';
    return;
  }

  const { start, end } = getPageWindow(totalPages, currentPage);

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
        triggerSearch(container, targetPage);
      }
    });
  });
}
