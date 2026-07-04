// Duolingo-style tap-a-word popup: clicking a recognized Irish word inside
// any example sentence, capsule text, or chunk (see dom.js linkifyIrish)
// shows its meaning right there, with a way to jump to the full vocab card
// instead of losing your place in the paragraph.
import { findWord } from '../../data/words.js';
import { speakWord } from '../../services/tts.js';
import { uiState } from '../uiState.js';

export function wordPopupHtml() {
  return `<div id="wordPopup" class="word-popup hidden"></div>`;
}

function cardHtml(word) {
  return `
    <div class="word-popup-card" role="dialog" aria-label="${word.irish} definition">
      <button class="word-popup-close" aria-label="Close">&times;</button>
      <div class="irish display">${word.irish}</div>
      <div class="phonetic">/ ${word.phonetic} /</div>
      <div class="english">${word.english}</div>
      <div class="btn-row">
        <button class="btn secondary" id="wordPopupHear">🔊 Hear</button>
        <button class="btn secondary" id="wordPopupOpen">Open card →</button>
      </div>
    </div>
  `;
}

function hide() {
  const el = document.getElementById('wordPopup');
  if (el) el.classList.add('hidden');
}

function show(word, goToApp) {
  const el = document.getElementById('wordPopup');
  if (!el) return;
  el.innerHTML = cardHtml(word);
  el.classList.remove('hidden');
  el.querySelector('.word-popup-close').onclick = hide;
  el.querySelector('#wordPopupHear').onclick = () => speakWord(word).catch(() => {});
  el.querySelector('#wordPopupOpen').onclick = () => {
    hide();
    uiState.detailWord = word;
    uiState.route = 'wordDetail';
    goToApp();
  };
}

// Bound once, in router.renderApp — delegated so it keeps working across
// every re-render of #main without each view needing its own wiring.
export function bindWordPopup(goToApp) {
  document.addEventListener('click', (e) => {
    const tap = e.target.closest('[data-word-tap]');
    if (tap) {
      const word = findWord(tap.dataset.wordTap);
      if (word) show(word, goToApp);
      return;
    }
    if (!e.target.closest('.word-popup-card')) hide();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const tap = e.target.closest?.('[data-word-tap]');
    if (!tap) return;
    e.preventDefault();
    const word = findWord(tap.dataset.wordTap);
    if (word) show(word, goToApp);
  });
}
