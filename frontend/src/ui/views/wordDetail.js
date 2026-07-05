import { state } from '../../state/store.js';
import { linkifyIrish } from '../dom.js';
import { activePack } from '../../data/languagePacks.js';
import { CULTURE_CAPSULES } from '../../data/capsules.js';
import { uiState } from '../uiState.js';
import { bindHear } from './learn.js';

const SKILLS = [['recognition', 'Recognition'], ['listening', 'Listening'], ['pronunciation', 'Pronunciation'], ['recall', 'Recall']];

function nativeSpeakerLinkHtml(word) {
  const pack = activePack();
  if (!pack.fuaimLink) return '';
  return `<a class="audio-ref" href="${pack.fuaimLink(word)}" target="_blank" rel="noopener">🔊 Hear native speakers on ${pack.dictName} ↗</a>`;
}

// Museum-style cross-link, the other direction: from a word back to
// whichever capsule(s) actually taught it, instead of vocabulary living in
// its own silo separate from where you met it.
function taughtInHtml(wordId) {
  const capsules = CULTURE_CAPSULES.filter((c) => c.target?.includes(wordId));
  if (!capsules.length) return '';
  return `
    <div style="margin-top:18px; font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">You met this word in</div>
    <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">
      ${capsules.map((c) => `<button class="chunk-tag mono" data-taught-in-capsule="${c.id}" style="cursor:pointer; text-align:left; border:1px solid rgba(201,162,75,0.25); background:none; padding:10px 12px; font-size:13px;">${c.title}</button>`).join('')}
    </div>
  `;
}

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
        ${nativeSpeakerLinkHtml(w.irish)}
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
      ${taughtInHtml(w.id)}
    </div>
  `;
}

export function bind(main, rerender) {
  const backToVocab = main.querySelector('#backToVocab');
  if (backToVocab) backToVocab.onclick = () => { uiState.route = 'vocab'; rerender(true); };
  const hearBtn = main.querySelector('#hearBtn');
  if (hearBtn) bindHear(hearBtn, () => uiState.detailWord);
  main.querySelectorAll('[data-taught-in-capsule]').forEach((btn) => {
    btn.onclick = () => {
      const c = CULTURE_CAPSULES.find((x) => x.id === btn.dataset.taughtInCapsule);
      if (!c) return;
      uiState.activeCapsule = c;
      uiState.capsuleQuizChoice = null;
      uiState.route = 'capsuleDetail';
      rerender(true);
    };
  });
}
