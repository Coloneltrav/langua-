import { WORDS } from '../data/words.js';
import { activePack } from '../data/languagePacks.js';

export function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Rebuilt per call rather than cached at module load: WORDS is a live,
// pack-swappable array (see data/words.js), so a one-time Map here would go
// stale the moment the user switches language pack or accent.
function buildWordsByLower() {
  return new Map(WORDS.map((w) => [w.irish.toLowerCase(), w]));
}

// Initial-mutation prefixes (séimhiú/lenition, urú/eclipsis) so an inflected
// Irish form in running text (e.g. "Bhí", "bhfuil", "dtuigeann") can still
// resolve back to its dictionary headword. Checked longest-prefix-first so
// 3-letter eclipsis clusters aren't shadowed by a shorter lenition match.
// Harmless no-op for other packs — Spanish text just won't match any of
// these prefixes and falls through to the exact-match/dictionary-link path.
const MUTATION_PREFIXES = [
  ['bhf', 'f'], ['mb', 'b'], ['gc', 'c'], ['nd', 'd'], ['ng', 'g'], ['bp', 'p'], ['dt', 't'],
  ['bh', 'b'], ['ch', 'c'], ['dh', 'd'], ['fh', 'f'], ['gh', 'g'], ['mh', 'm'], ['ph', 'p'], ['sh', 's'], ['th', 't'],
];

function findWordMatch(token, wordsByLower) {
  const lower = token.toLowerCase();
  let w = wordsByLower.get(lower);
  if (w) return w;
  for (const [prefix, replacement] of MUTATION_PREFIXES) {
    if (lower.startsWith(prefix) && lower.length > prefix.length) {
      w = wordsByLower.get(replacement + lower.slice(prefix.length));
      if (w) return w;
    }
  }
  return null;
}

// Turns target-language text into tappable words: a recognized vocabulary
// word (even lenited/eclipsed, for Irish) becomes an in-app word-card
// popup; anything else falls back to the active pack's external
// dictionary link. Matches Irish/Spanish letters (fadas, ñ, ü).
export function linkifyIrish(text) {
  const wordsByLower = buildWordsByLower();
  const pack = activePack();
  return text.replace(/[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+/g, (match) => {
    if (match.length < 2) return match;
    const w = findWordMatch(match, wordsByLower);
    if (w) return `<span class="word-tap" data-word-tap="${w.id}" tabindex="0" role="button">${match}</span>`;
    return `<a href="${pack.dictLink(match)}" target="_blank" rel="noopener" class="word-ref">${match}</a>`;
  });
}

export function emptyState(title, sub) {
  return `<div class="empty-state"><div class="glyph display">§</div><div style="font-size:17px; margin-bottom:6px; color:var(--text);">${title}</div><div style="font-size:13.5px;">${sub}</div></div>`;
}
