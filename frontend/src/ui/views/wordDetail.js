import { state } from '../../state/store.js';
import { linkifyIrish } from '../dom.js';
import { teanglannFuaimLink } from '../../services/tts.js';
import { uiState } from '../uiState.js';
import { bindHear } from './learn.js';

const SKILLS = [['recognition', 'Recognition'], ['listening', 'Listening'], ['pronunciation', 'Pronunciation'], ['recall', 'Recall']];

export function render() {
  const w = uiState.detailWord;
  const p = state.progress[w.id];
  return `
    <button class="btn secondary" id="backToVocab" style="margin-bottom:14px;">← Back to vocabulary</button>
    <div class="card">
      <div class="word-hero">
        <div class="pos mono">${w.pos}</div>
        <div class="irish display"><span class="dropcap">${w.irish[0]}</span>${w.irish.slice(1)}</div>
        <div class="phonetic">/ ${w.phonetic} /</div>
        <div class="english">${w.english}</div>
        <div class="chunk-tag mono">chunk: “${linkifyIrish(w.chunk)}”</div>
        <a class="audio-ref" href="${teanglannFuaimLink(w.irish)}" target="_blank" rel="noopener">🔊 Hear native speakers on teanglann.ie ↗</a>
      </div>
      <div class="example-box">
        <div class="ga display">${linkifyIrish(w.example_ga)}</div>
        <div class="en">${w.example_en}</div>
      </div>
      <div class="btn-row"><button class="btn secondary" id="hearBtn">🔊 Hear</button></div>
      ${p ? `
        <div style="margin-top:18px; font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">Your progress on this word</div>
        <div class="skill-bars">
          ${SKILLS.map(([k, l]) => `
            <div class="skill-bar-row">
              <div class="label">${l}</div>
              <div class="skill-bar-track"><div class="skill-bar-fill" style="width:${((p.skills[k] || 0) / 5 * 100).toFixed(0)}%"></div></div>
            </div>
          `).join('')}
        </div>
        <div style="font-size:11.5px; color:var(--text-dim); margin-top:10px;">Reviewed ${p.repetitions} time${p.repetitions === 1 ? '' : 's'} · next due ${new Date(p.dueDate).toLocaleDateString()} · ease ${p.ease.toFixed(2)}</div>
      ` : `<div style="margin-top:18px; font-size:13px; color:var(--text-dim);">Not started yet — it'll show up on the New Word tab in frequency order.</div>`}
    </div>
  `;
}

export function bind(main, rerender) {
  const backToVocab = main.querySelector('#backToVocab');
  if (backToVocab) backToVocab.onclick = () => { uiState.route = 'vocab'; rerender(true); };
  const hearBtn = main.querySelector('#hearBtn');
  if (hearBtn) bindHear(hearBtn, () => uiState.detailWord);
}
