import { activePack } from '../data/languagePacks.js';
import { buildWordsByLower, findWordMatch } from '../engine/wordMatch.js';

export function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
