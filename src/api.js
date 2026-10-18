const API_KEY = import.meta.env.VITE_RAWG_API_KEY;
const BASE_URL = 'https://api.rawg.io/api';

// Cancela la petición en vuelo del mismo endpoint cuando llega una nueva
// (búsquedas rápidas, navegación entre fichas...). Se lleva un controlador por
// endpoint para que, p. ej., getGameStores no cancele a getGameDetails cuando
// ambas se disparan a la vez con Promise.all.
const inFlightRequests = { games: null, details: null, stores: null };

function beginRequest(key) {
  const previous = inFlightRequests[key];
  if (previous) previous.abort();

  const controller = new AbortController();
  inFlightRequests[key] = controller;
  return controller;
}

function endRequest(key, controller) {
  if (inFlightRequests[key] === controller) {
    inFlightRequests[key] = null;
  }
}

const ADULT_KEYWORDS = [
  'hentai', 'nsfw', 'erotic', 'erotica', 'sexual-content', 
  'adult', 'boobs', 'waifu', 'sex', 'ecchi', 'furry', 'nudity'
];

export async function getGames({ 
  search = '', 
  page = 1, 
  pageSize = 12, 
  genres = '', 
  platforms = '', 
  parent_platforms = '',
  dates = '',
  ordering = '-rating' 
} = {}) {
  const controller = beginRequest('games');

  try {
    // Cada valor se codifica por separado. Las listas (géneros, plataformas,
    // fechas) conservan sus comas literales, que RAWG usa como separador, y
    // ningún filtro procedente del hash puede inyectar parámetros extra.
    const encodeList = value => String(value).split(',').map(encodeURIComponent).join(',');

    const queryParts = [
      `key=${encodeURIComponent(API_KEY ?? '')}`,
      `page=${encodeURIComponent(String(page))}`,
      `page_size=${encodeURIComponent(String(pageSize))}`,
      `ordering=${encodeURIComponent(ordering)}`,
      'sfw=true'
    ];

    if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
    if (genres) queryParts.push(`genres=${encodeList(genres)}`);
    if (platforms) queryParts.push(`platforms=${encodeList(platforms)}`);
    if (parent_platforms) queryParts.push(`parent_platforms=${encodeList(parent_platforms)}`);
    if (dates) queryParts.push(`dates=${encodeList(dates)}`);

    const url = `${BASE_URL}/games?${queryParts.join('&')}`;

    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error('Error al conectar con RAWG API');
    
    const data = await response.json();

    if (data.results && Array.isArray(data.results)) {
      data.results = data.results.filter(game => {
        const title = (game.name || '').toLowerCase();
        
        const hasAdultTitle = ADULT_KEYWORDS.some(kw => title.includes(kw));

        const hasAdultTag = game.tags && game.tags.some(tag => 
          ADULT_KEYWORDS.some(kw => tag.slug.toLowerCase().includes(kw) || tag.name.toLowerCase().includes(kw))
        );

        return !hasAdultTitle && !hasAdultTag;
      });
    }

    return data;
  } catch (error) {
    // Una petición cancelada no es un error de red: no se loguea.
    if (error.name !== 'AbortError') console.error(error);
    throw error;
  } finally {
    endRequest('games', controller);
  }
}

export async function getGameDetails(id) {
  const controller = beginRequest('details');

  try {
    const response = await fetch(`${BASE_URL}/games/${encodeURIComponent(id)}?key=${API_KEY}`, { signal: controller.signal });
    if (!response.ok) throw new Error(`No se pudo obtener el juego ${id}`);
    return await response.json();
  } catch (error) {
    if (error.name !== 'AbortError') console.error(error);
    throw error;
  } finally {
    endRequest('details', controller);
  }
}

export async function getGameStores(id) {
  const controller = beginRequest('stores');

  try {
    const response = await fetch(`${BASE_URL}/games/${encodeURIComponent(id)}/stores?key=${API_KEY}`, { signal: controller.signal });
    if (!response.ok) throw new Error(`No se pudieron obtener las tiendas del juego ${id}`);
    return await response.json();
  } catch (error) {
    if (error.name !== 'AbortError') console.error(error);
    return { results: [] };
  } finally {
    endRequest('stores', controller);
  }
}