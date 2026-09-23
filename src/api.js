const API_KEY = import.meta.env.VITE_RAWG_API_KEY;
const BASE_URL = 'https://api.rawg.io/api';

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
  try {
    let url = `${BASE_URL}/games?key=${API_KEY}&page=${page}&page_size=${pageSize}&ordering=${ordering}&sfw=true`;
    
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (genres) {
      url += `&genres=${genres}`;
    }
    if (platforms) {
      url += `&platforms=${platforms}`;
    }
    if (parent_platforms) {
      url += `&parent_platforms=${parent_platforms}`;
    }
    if (dates) {
      url += `&dates=${dates}`;
    }

    const response = await fetch(url);
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
    console.error(error);
    throw error;
  }
}

export async function getGameDetails(id) {
  try {
    const response = await fetch(`${BASE_URL}/games/${id}?key=${API_KEY}`);
    if (!response.ok) throw new Error(`No se pudo obtener el juego ${id}`);
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getGameStores(id) {
  try {
    const response = await fetch(`${BASE_URL}/games/${id}/stores?key=${API_KEY}`);
    if (!response.ok) throw new Error(`No se pudieron obtener las tiendas del juego ${id}`);
    return await response.json();
  } catch (error) {
    console.error(error);
    return { results: [] };
  }
}