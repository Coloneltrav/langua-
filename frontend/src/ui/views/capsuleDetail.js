import { WORDS, findWord } from '../../data/words.js';
import { CULTURE_CAPSULES } from '../../data/capsules.js';
import { state, saveProgress, registerNewWordLearned } from '../../state/store.js';
import { capsuleReadiness } from '../../engine/readiness.js';
import { freshProgress } from '../../engine/sm2.js';
import { linkifyIrish } from '../dom.js';
import { speakWord } from '../../services/tts.js';
import { activePack } from '../../data/languagePacks.js';
import { uiState } from '../uiState.js';
import { startCapsule } from './lesson.js';

// A museum wing, not a dead end: a couple of neighbouring capsules to wander
// into next, instead of always bouncing back to the flat list. Same
// category, and same country for packs with accents (an Argentina capsule
// shouldn't suggest a Madrid one).
function relatedCapsulesHtml(c) {
  const related = CULTURE_CAPSULES
    .filter((other) => other.id !== c.id && other.category === c.category && (c.country === undefined || other.country === c.country))
    .slice(0, 3);
  if (!related.length) return '';
  return `
    <div style="margin-top:22px; font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">More ${c.category}</div>
    <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">
      ${related.map((r) => `<button class="chunk-tag mono" data-related-capsule="${r.id}" style="cursor:pointer; text-align:left; border:1px solid rgba(201,162,75,0.25); background:none; padding:10px 12px; font-size:13px;">${r.title}</button>`).join('')}
    </div>
  `;
}

export function render() {
  const c = uiState.activeCapsule;
  const targetWords = c.target.map((id) => findWord(id)).filter(Boolean);
  const r = capsuleReadiness(c, state.progress);
  const cls = r >= 70 ? 'r-high' : r >= 35 ? 'r-mid' : 'r-low';
  const saved = state.settings.savedCapsules[c.id];
  const q = c.quiz;

  const optsHtml = q ? q.options.map((opt, i) => {
    let cls2 = '';
    if (uiState.capsuleQuizChoice != null) {
      if (i === q.answer) cls2 = 'correct';
      else if (i === uiState.capsuleQuizChoice) cls2 = 'wrong';
    }
    return `<button class="quiz-option ${cls2}" data-capsule-choice="${i}" ${uiState.capsuleQuizChoice != null ? 'disabled' : ''}>${opt}</button>`;
  }).join('') : '';

  return `
    <button class="btn secondary" id="backToCulture" style="margin-bottom:14px;">← Back to ${activePack().cultureTabLabel}</button>
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:baseline;">
        <div class="pos mono">${c.category} · ${c.difficulty}</div>
        <span class="readiness-pill ${cls}">${r}% known</span>
      </div>
      <div style="font-family:'Cormorant Garamond',serif; font-size:26px; margin:8px 0 14px 0; color:var(--gold-bright);">${c.title}</div>
      <div class="btn-row" style="margin:0 0 16px 0;">
        <button class="btn" id="startEncounterBtn">${c.encounter ? 'Step into this Living Encounter →' : (state.settings.completedCapsules[c.id] ? 'Revisit this lesson' : 'Start this lesson')}</button>
      </div>
      <div class="example-box" style="border-left-color:var(--flag-orange);">
        <div style="font-size:15px; line-height:1.75;">${linkifyIrish(c.text)}</div>
      </div>
      <div style="margin-top:16px; font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">Target words</div>
      <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px;">
        ${targetWords.map((w) => `<button class="chunk-tag mono" data-hear-word="${w.id}" style="cursor:pointer; border:1px solid rgba(201,162,75,0.35); background:none;">🔊 ${w.irish} <span style="opacity:0.6;">— ${w.english}</span></button>`).join('')}
      </div>
      <div class="btn-row">
        <button class="btn ${saved ? 'secondary' : ''}" id="saveCapsuleBtn" ${saved ? 'disabled' : ''}>${saved ? '✓ Words saved to review queue' : 'Save target words to review queue'}</button>
      </div>
      ${q ? `
        <div style="margin-top:20px; font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">Quick check</div>
        <div style="margin-top:8px; font-size:14.5px;">${q.q}</div>
        <div style="margin-top:8px;">${optsHtml}</div>
      ` : ''}
      ${relatedCapsulesHtml(c)}
    </div>
  `;
}

export function bind(main, rerender) {
  const backToCulture = main.querySelector('#backToCulture');
  if (backToCulture) backToCulture.onclick = () => { uiState.route = 'culture'; uiState.capsuleQuizChoice = null; rerender(true); };

  const startEncounterBtn = main.querySelector('#startEncounterBtn');
  if (startEncounterBtn) startEncounterBtn.onclick = () => {
    startCapsule(uiState.activeCapsule);
    uiState.route = 'lesson';
    rerender(true);
  };

  main.querySelectorAll('[data-hear-word]').forEach((chip) => {
    chip.onclick = (e) => {
      e.stopPropagation();
      const w = WORDS.find((x) => x.id === chip.dataset.hearWord);
      if (w) speakWord(w).catch((err) => console.error(err));
    };
  });

  const saveCapsuleBtn = main.querySelector('#saveCapsuleBtn');
  if (saveCapsuleBtn) saveCapsuleBtn.onclick = () => {
    uiState.activeCapsule.target.forEach((id) => {
      if (!state.progress[id]) {
        state.progress[id] = freshProgress();
        registerNewWordLearned();
      }
    });
    state.settings.savedCapsules[uiState.activeCapsule.id] = true;
    saveProgress();
    rerender();
  };

  main.querySelectorAll('[data-capsule-choice]').forEach((b) => {
    b.onclick = () => {
      if (uiState.capsuleQuizChoice != null) return;
      uiState.capsuleQuizChoice = parseInt(b.dataset.capsuleChoice, 10);
      rerender();
    };
  });

  main.querySelectorAll('[data-related-capsule]').forEach((b) => {
    b.onclick = () => {
      const next = CULTURE_CAPSULES.find((c) => c.id === b.dataset.relatedCapsule);
      if (!next) return;
      uiState.activeCapsule = next;
      uiState.capsuleQuizChoice = null;
      rerender(true);
    };
  });
}
