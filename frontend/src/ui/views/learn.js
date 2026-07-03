import { WORDS } from '../../data/words.js';
import { state, saveProgress, newWordsLearnedToday, registerNewWordLearned } from '../../state/store.js';
import { newAvailable } from '../../engine/queue.js';
import { sm2Update, bumpSkill, freshProgress } from '../../engine/sm2.js';
import { emptyState } from '../dom.js';
import { wordCardHtml, bindWordCard } from '../components/wordCard.js';
import { uiState } from '../uiState.js';
import { speakWord } from '../../services/tts.js';

export function render() {
  const pool = newAvailable(WORDS, state.progress);
  if (pool.length === 0) {
    return emptyState('Nothing new right now', 'Every seed word has been started. Add more words to shared/vocab.json to keep going, or head to Review.');
  }
  const doneToday = newWordsLearnedToday();
  if (doneToday >= state.settings.dailyNewWordCap && !uiState.overrideCap) {
    return `
      <div class="card" style="text-align:center; padding:34px 20px;">
        <div class="glyph display" style="font-size:38px; color:var(--gold); margin-bottom:8px;">${doneToday}</div>
        <div style="font-size:16px; margin-bottom:6px;">Today's new-word goal is done</div>
        <div style="font-size:13px; color:var(--text-dim); margin-bottom:16px; line-height:1.6;">You learned ${doneToday} new word${doneToday === 1 ? '' : 's'} today, matching the daily target in Settings. Fresh words stick better once you stop for the day — but it's your call.</div>
        <button class="btn secondary" id="overrideCapBtn">Learn one more anyway</button>
      </div>`;
  }
  uiState.currentWord = pool[0];
  return wordCardHtml(uiState.currentWord, 'learn');
}

export function bind(main, rerender) {
  bindWordCard(main, uiState.currentWord);

  const overrideCapBtn = main.querySelector('#overrideCapBtn');
  if (overrideCapBtn) overrideCapBtn.onclick = () => { uiState.overrideCap = true; rerender(); };

  const hearBtn = main.querySelector('#hearBtn');
  if (hearBtn) bindHear(hearBtn, () => uiState.currentWord);

  main.querySelectorAll('[data-quality]').forEach((b) => {
    b.onclick = () => {
      const q = parseInt(b.dataset.quality, 10);
      const id = uiState.currentWord.id;
      const isBrandNew = !state.progress[id];
      if (isBrandNew) {
        state.progress[id] = freshProgress();
        registerNewWordLearned();
        uiState.overrideCap = false;
      }
      sm2Update(state.progress[id], q);
      bumpSkill(state.progress[id], 'recall', q >= 4 ? 1 : (q < 3 ? -1 : 0));
      bumpSkill(state.progress[id], 'recognition', q >= 3 ? 1 : 0);
      saveProgress();
      rerender(true);
    };
  });
}

// Shared by learn/review/wordDetail — kept here to avoid a circular import
// with the pronunciation widget module.
export function bindHear(hearBtn, getWord) {
  hearBtn.onclick = async () => {
    const w = getWord();
    hearBtn.disabled = true;
    try {
      const res = await speakWord(w);
      if (!res.ok) alert(res.msg);
      hearBtn.title = {
        'audio-db': 'Real Irish neural audio from the pronunciation database.',
        azure: 'Played live via Azure ga-IE neural voice.',
      }[res.source] || 'Approximate fallback voice — the pronunciation audio database hasn\'t been generated yet.';
    } finally {
      hearBtn.disabled = false;
    }
  };
}
