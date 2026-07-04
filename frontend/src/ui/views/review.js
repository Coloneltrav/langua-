import { WORDS } from '../../data/words.js';
import { state, saveProgress } from '../../state/store.js';
import { todayDue } from '../../engine/queue.js';
import { sm2Update, bumpSkill, adjustForWeakPronunciation } from '../../engine/sm2.js';
import { emptyState, linkifyIrish } from '../dom.js';
import { activePack } from '../../data/languagePacks.js';
import { pronunciationWidgetHtml, bindPronunciationWidget } from '../components/pronunciationWidget.js';
import { uiState } from '../uiState.js';
import { bindHear } from './learn.js';

function nativeSpeakerLinkHtml(word) {
  const pack = activePack();
  if (!pack.fuaimLink) return '';
  return `<a class="audio-ref" href="${pack.fuaimLink(word)}" target="_blank" rel="noopener">🔊 Hear native speakers on ${pack.dictName} ↗</a>`;
}

export function render() {
  const due = todayDue(WORDS, state.progress);
  if (due.length === 0) {
    return emptyState('No reviews due', 'Spaced repetition means words come back exactly when you’re about to forget them — not before. Check back later, or learn something new.');
  }
  uiState.currentWord = due[0];
  const w = uiState.currentWord;
  const revealBtn = uiState.revealAnswer ? '' : `<div class="btn-row"><button class="btn" id="revealBtn">Reveal meaning</button></div>`;
  return `
    <div class="card">
      <div class="word-hero">
        <div class="pos mono">${w.pos}</div>
        <div class="irish display"><span class="dropcap">${w.irish[0]}</span>${w.irish.slice(1)}</div>
        ${uiState.revealAnswer ? `<div class="phonetic">/ ${w.phonetic} /</div><div class="english">${w.english}</div><div class="chunk-tag mono">chunk: "${linkifyIrish(w.chunk)}"</div>${nativeSpeakerLinkHtml(w.irish)}` : `<div class="phonetic" style="opacity:0.35;">/ ? /</div><div class="english" style="color:var(--text-dim);">— recall it before revealing —</div>`}
      </div>
      ${uiState.revealAnswer ? `
      <div class="example-box">
        <div class="ga display">${linkifyIrish(w.example_ga)}</div>
        <div class="en">${w.example_en}</div>
      </div>
      <div class="btn-row">
        <button class="btn secondary" id="hearBtn">🔊 Hear again</button>
      </div>
      ${pronunciationWidgetHtml()}
      <div style="margin-top:18px; font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">Rate your recall</div>
      <div class="btn-row">
        <button class="btn rubric" data-quality="0">Forgot</button>
        <button class="btn secondary" data-quality="3">Hard</button>
        <button class="btn secondary" data-quality="4">Good</button>
        <button class="btn" data-quality="5">Easy</button>
      </div>
      ` : revealBtn}
      <div style="margin-top:14px; font-size:11.5px; color:var(--text-dim);">${due.length} word${due.length > 1 ? 's' : ''} due · this one next</div>
    </div>
  `;
}

export function bind(main, rerender) {
  bindPronunciationWidget(main, uiState.currentWord);

  const hearBtn = main.querySelector('#hearBtn');
  if (hearBtn) bindHear(hearBtn, () => uiState.currentWord);

  const revealBtn = main.querySelector('#revealBtn');
  if (revealBtn) revealBtn.onclick = () => { uiState.revealAnswer = true; rerender(); };

  main.querySelectorAll('[data-quality]').forEach((b) => {
    b.onclick = () => {
      const q = parseInt(b.dataset.quality, 10);
      const id = uiState.currentWord.id;
      sm2Update(state.progress[id], q);
      bumpSkill(state.progress[id], 'recall', q >= 4 ? 1 : (q < 3 ? -1 : 0));
      bumpSkill(state.progress[id], 'recognition', q >= 3 ? 1 : 0);
      adjustForWeakPronunciation(state.progress[id]);
      saveProgress();
      uiState.revealAnswer = false;
      rerender(true);
    };
  });
}
