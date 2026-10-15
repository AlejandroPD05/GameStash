/**
 * Escapa los caracteres especiales de HTML para poder interpolar texto externo
 * (API de RAWG, parámetros de la URL, entradas del usuario) dentro de plantillas
 * `innerHTML` sin que se interpreten como etiquetas o atributos.
 *
 * Se usa tanto en texto plano como en atributos (escapea comillas dobles y
 * simples, así que sirve de "escape de atributo").
 */
export function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g,
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
