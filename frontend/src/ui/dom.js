import { teanglannDictLink } from '../services/tts.js';
import { WORDS } from '../data/words.js';

export function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const WORDS_BY_LOWER = new Map(WORDS.map((w) => [w.irish.toLowerCase(), w]));

// Initial-mutation prefixes (séimhiú/lenition, urú/eclipsis) so an inflected
// form in running text (e.g. "Bhí", "bhfuil", "dtuigeann") can still resolve
// back to its dictionary headword. Checked longest-prefix-first so 3-letter
// eclipsis clusters aren't shadowed by a shorter lenition match.
const MUTATION_PREFIXES = [
  ['bhf', 'f'], ['mb', 'b'], ['gc', 'c'], ['nd', 'd'], ['ng', 'g'], ['bp', 'p'], ['dt', 't'],
  ['bh', 'b'], ['ch', 'c'], ['dh', 'd'], ['fh', 'f'], ['gh', 'g'], ['mh', 'm'], ['ph', 'p'], ['sh', 's'], ['th', 't'],
];

function findWordMatch(token) {
  const lower = token.toLowerCase();
  let w = WORDS_BY_LOWER.get(lower);
  if (w) return w;
  for (const [prefix, replacement] of MUTATION_PREFIXES) {
    if (lower.startsWith(prefix) && lower.length > prefix.length) {
      w = WORDS_BY_LOWER.get(replacement + lower.slice(prefix.length));
      if (w) return w;
    }
  }
  return null;
}

// Turns Irish text into tappable words: a recognized vocabulary word (even
// lenited/eclipsed) becomes an in-app word-card popup; anything else falls
// back to an external teanglann.ie dictionary link, same as before.
export function linkifyIrish(text) {
  return text.replace(/[A-Za-zÁÉÍÓÚáéíóú]+/g, (match) => {
    if (match.length < 2) return match;
    const w = findWordMatch(match);
    if (w) return `<span class="word-tap" data-word-tap="${w.id}" tabindex="0" role="button">${match}</span>`;
    return `<a href="${teanglannDictLink(match)}" target="_blank" rel="noopener" class="word-ref">${match}</a>`;
  });
}

export function emptyState(title, sub) {
  return `<div class="empty-state"><div class="glyph display">§</div><div style="font-size:17px; margin-bottom:6px; color:var(--text);">${title}</div><div style="font-size:13.5px;">${sub}</div></div>`;
}
