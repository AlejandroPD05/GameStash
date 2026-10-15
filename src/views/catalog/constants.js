// Constantes de la vista de catálogo: géneros, plataformas, orden y tamaños.
// Están separadas de la plantilla para que los módulos de UI (filtros,
// paginación) puedan reutilizarlas sin depender del orquestador.

// Chips fijos de la barra de filtros ("" representa el chip "Todos").
export const DEFAULT_GENRE_CHIPS = [
  { value: '', label: 'Todos' },
  { value: 'action', label: 'Acción' },
  { value: 'role-playing-games-rpg', label: 'RPG' },
  { value: 'shooter', label: 'Shooter' },
  { value: 'adventure', label: 'Aventura' },
  { value: 'indie', label: 'Indie' },
  { value: 'strategy', label: 'Estrategia' }
];

// Géneros que ya tienen chip propio: cualquier otro seleccionado desde la URL
// se pinta como chip "custom" (minúsculas con guiones).
export const DEFAULT_GENRES = DEFAULT_GENRE_CHIPS.map(chip => chip.value);

// Géneros ofrecidos por el buscador de géneros (sugerencias + alta por teclado).
export const AVAILABLE_GENRES = [
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

// Opciones del dropdown "Ordenar por" (el icono es SVG inline decorativo).
export const ORDERING_OPTIONS = [
  {
    value: '-rating',
    label: 'Mejor Valorados',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
  },
  {
    value: '-released',
    label: 'Novedades',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>'
  },
  {
    value: 'upcoming',
    label: 'Próximos Lanzamientos',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>'
  },
  {
    value: '-added',
    label: 'Más Populares',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'
  },
  {
    value: 'name',
    label: 'Nombre (A-Z)',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6v12a3 3 0 0 0 3-3H6a3 3 0 0 0 3 3V6"/></svg>'
  }
];

export const ORDERING_LABELS = Object.fromEntries(
  ORDERING_OPTIONS.map(option => [option.value, option.label])
);

// Opciones del dropdown "Plataforma" ("" = todas).
export const PLATFORM_OPTIONS = [
  { value: '', label: 'Todas las plataformas' },
  { value: '1', label: 'PC' },
  { value: '2', label: 'PlayStation' },
  { value: '3', label: 'Xbox' },
  { value: '7', label: 'Nintendo' },
  { value: '4', label: 'iOS' },
  { value: '8', label: 'Android' }
];

export const PLATFORM_LABELS = Object.fromEntries(
  PLATFORM_OPTIONS.filter(option => option.value).map(option => [option.value, option.label])
);

// Valores por defecto de los filtros y dimensiones de la paginación.
export const DEFAULT_ORDERING = '-rating';
export const PAGE_SIZE = 12;
export const MAX_PAGES = 1000;
export const MAX_VISIBLE_PAGES = 5;
export const SKELETON_CARD_COUNT = 12;
