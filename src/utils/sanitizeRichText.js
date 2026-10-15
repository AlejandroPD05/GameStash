import { escapeHTML } from './escapeHTML.js';

/**
 * Etiquetas de formato que se permiten en la descripción de un juego.
 * Son etiquetas "seguras": no aceptan atributos (los `<a href>` y compañía se
 * eliminan conservando su texto, ver comentario de `sanitizeRichText`).
 */
const ALLOWED_TAGS = [
  'p', 'br', 'b', 'i', 'em', 'strong', 'u', 's', 'strike',
  'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4'
];

const ALLOWED_TAGS_PATTERN = ALLOWED_TAGS.join('|');

/**
 * Sanitiza texto enriquecido procedente de la API manteniendo un subconjunto
 * seguro de formato.
 *
 * DECISIÓN: la descripción de RAWG puede llegar en dos formas distintas:
 *  - `description_raw`: texto plano (lo habitual, ya que la vista lo prefiere).
 *  - `description`: HTML con etiquetas `<p>`/`<br>`/`<a>`, que además puede
 *    colarse cuando el traductor falla y se devuelve el texto original.
 * Escapar el 100 % del contenido rompería el formato de párrafos/saltos de línea
 * de la API, así que aquí se hace en dos pasos:
 *  1) Se eliminan comentarios, bloques peligrosos (script/style/iframe/svg...)
 *     y todas las etiquetas no permitidas conservando su texto interior; las
 *     etiquetas permitidas se normalizan SIN atributos (nunca se confía en un
 *     `href`, `class`, `on*`, etc. procedente de la API).
 *  2) Se escapa todo el resto con `escapeHTML()` y, acto seguido, se "reactivan"
 *     únicamente las etiquetas de la lista blanca, que en el paso 1 ya no
 *     pueden llevar atributos.
 * El resultado conserva los párrafos/saltos de línea legítimos y no permite
 * ejecutar scripts ni inyectar atributos. Los enlaces de la API (`<a>`) se
 * muestran como texto porque no se validan sus URLs.
 */
export function sanitizeRichText(input) {
  let html = String(input ?? '');

  // Comentarios y bloques que nunca deben sobrevivir (contenido incluido).
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  html = html.replace(
    /<(script|style|iframe|object|embed|svg|math)\b[\s\S]*?<\/\1\s*>/gi,
    ''
  );

  // Etiquetas: las permitidas se normalizan sin atributos; el resto se
  // elimina conservando el texto de dentro. Cualquier '<' que no abra una
  // etiqueta (p. ej. "5 < 10") queda intacto y se escapará en el paso siguiente.
  html = html.replace(
    /<(\/?)([a-z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/gi,
    (match, closing, tag) => {
      const name = tag.toLowerCase();
      if (ALLOWED_TAGS.includes(name)) {
        return `<${closing ? '/' : ''}${name}>`;
      }
      return '';
    }
  );

  // Texto restante (incluidos '<' sueltos y restos de etiquetas malformadas).
  html = escapeHTML(html);

  // Reactivar solo las etiquetas de la lista blanca ya normalizadas.
  return html.replace(
    new RegExp(`&lt;(/?)(${ALLOWED_TAGS_PATTERN})&gt;`, 'gi'),
    '<$1$2>'
  );
}
