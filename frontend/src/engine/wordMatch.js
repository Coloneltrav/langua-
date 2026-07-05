// Shared "does this token match a vocabulary word" logic — used by the
// word-tap popup (ui/dom.js) and by the curriculum engine to work out
// which words a piece of text actually depends on (engine/curriculum.js).
import { WORDS } from '../data/words.js';

// Initial-mutation prefixes (séimhiú/lenition, urú/eclipsis) so an inflected
// Irish form in running text (e.g. "Bhí", "bhfuil", "dtuigeann") can still
// resolve back to its dictionary headword. Checked longest-prefix-first so
// 3-letter eclipsis clusters aren't shadowed by a shorter lenition match.
// Harmless no-op for other packs — Spanish text just won't match any of
// these prefixes and falls through to no match.
const MUTATION_PREFIXES = [
  ['bhf', 'f'], ['mb', 'b'], ['gc', 'c'], ['nd', 'd'], ['ng', 'g'], ['bp', 'p'], ['dt', 't'],
  ['bh', 'b'], ['ch', 'c'], ['dh', 'd'], ['fh', 'f'], ['gh', 'g'], ['mh', 'm'], ['ph', 'p'], ['sh', 's'], ['th', 't'],
];

// Rebuilt on each call rather than cached at module load: WORDS is a live,
// pack-swappable array (see data/words.js), so a one-time Map here would go
// stale the moment the user switches language pack or accent.
export function buildWordsByLower() {
  return new Map(WORDS.map((w) => [w.irish.toLowerCase(), w]));
}

export function findWordMatch(token, wordsByLower) {
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

const WORD_TOKEN_RE = /[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+/g;

// Every vocabulary word actually referenced in a piece of text — the
// building block for deriving a capsule's prerequisite vocabulary
// automatically from its prose, instead of hand-tagging it.
export function wordsReferencedIn(text) {
  const wordsByLower = buildWordsByLower();
  const found = new Map();
  for (const match of text.matchAll(WORD_TOKEN_RE)) {
    const token = match[0];
    if (token.length < 2) continue;
    const w = findWordMatch(token, wordsByLower);
    if (w) found.set(w.id, w);
  }
  return [...found.values()];
}
