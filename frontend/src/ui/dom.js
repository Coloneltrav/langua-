import { teanglannDictLink } from '../services/tts.js';

export function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function linkifyIrish(text) {
  return text.replace(/[A-Za-zÁÉÍÓÚáéíóú]+/g, (match) => {
    if (match.length < 2) return match;
    return `<a href="${teanglannDictLink(match)}" target="_blank" rel="noopener" class="word-ref">${match}</a>`;
  });
}

export function emptyState(title, sub) {
  return `<div class="empty-state"><div class="glyph display">§</div><div style="font-size:17px; margin-bottom:6px; color:var(--text);">${title}</div><div style="font-size:13.5px;">${sub}</div></div>`;
}
