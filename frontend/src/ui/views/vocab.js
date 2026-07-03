import { WORDS } from '../../data/words.js';
import { state } from '../../state/store.js';
import { uiState } from '../uiState.js';

export function render() {
  const rows = WORDS.map((w) => {
    const p = state.progress[w.id];
    let badge = '<span class="badge new">new</span>';
    if (p && p.repetitions >= 2) badge = '<span class="badge known">known</span>';
    else if (p) badge = '<span class="badge">learning</span>';
    return `<div class="word-list-row" data-word-id="${w.id}" style="cursor:pointer;"><div><div class="wi display">${w.irish}</div><div class="we">${w.english}</div></div>${badge}</div>`;
  }).join('');
  return `<div class="card"><div style="font-family:'Cormorant Garamond',serif; font-size:20px; margin-bottom:6px;">All words (${WORDS.length})</div>${rows}</div>`;
}

export function bind(main, rerender) {
  main.querySelectorAll('[data-word-id]').forEach((row) => {
    row.onclick = () => {
      uiState.detailWord = WORDS.find((w) => w.id === row.dataset.wordId);
      uiState.route = 'wordDetail';
      rerender(true);
    };
  });
}
