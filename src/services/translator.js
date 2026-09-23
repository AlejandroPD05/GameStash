export async function translateToSpanish(text) {
  if (!text || !text.trim()) return 'Sin descripción disponible.';

  const textToTranslate = text.length > 1800 ? text.substring(0, 1800) + '...' : text;

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=es&dt=t&q=${encodeURIComponent(textToTranslate)}`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Error en la petición de traducción');

    const data = await response.json();

    if (data && data[0]) {
      return data[0]
        .map(segment => segment[0])
        .filter(Boolean)
        .join('');
    }
  } catch (error) {
    console.warn('Error al traducir, mostrando original:', error);
  }

  return textToTranslate;
}