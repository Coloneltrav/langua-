// LISTEN tab: two modes.
//  - Meaning: hear/see a word, pick the meaning (original listening quiz).
//  - Dictation: hear a word (audio only), type what you heard; errors are
//    highlighted character-by-character (engine/textDiff.js), fadas count.
import { WORDS } from '../../data/words.js';
import { state, saveProgress, recordInput } from '../../state/store.js';
import { startedWords } from '../../engine/queue.js';
import { bumpSkill } from '../../engine/sm2.js';
import { normalizeAnswer, diffAnswer } from '../../engine/textDiff.js';
import { escapeHtml } from '../dom.js';
import { speakWord, hasRealAudioForActivePack } from '../../services/tts.js';
import { uiState } from '../uiState.js';

let mode = 'meaning'; // 'meaning' | 'dictation'
let dictTarget = null;
let dictChecked = null; // {ops, correct, accuracy, typedRaw}

function pickQuiz() {
  const pool = startedWords(WORDS, state.progress);
  if (pool.length < 4) return null;
  const target = pool[Math.floor(Math.random() * pool.length)];
  const distractorPool = pool.filter((w) => w.id !== target.id);
  const distractors = [];
  while (distractors.length < 3 && distractorPool.length) {
    const idx = Math.floor(Math.random() * distractorPool.length);
    distractors.push(distractorPool.splice(idx, 1)[0]);
  }
  const options = [target, ...distractors].sort(() => Math.random() - 0.5);
  return { target, options };
}

function pickDictation() {
  const pool = startedWords(WORDS, state.progress);
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}

function modeToggleHtml() {
  return `
    <div class="btn-row" style="margin-top:0; margin-bottom:14px;">
      <button class="btn ${mode === 'meaning' ? '' : 'secondary'}" data-mode="meaning">Meaning</button>
      <button class="btn ${mode === 'dictation' ? '' : 'secondary'}" data-mode="dictation">Dictation</button>
    </div>
  `;
}

function meaningHtml() {
  if (startedWords(WORDS, state.progress).length < 4) {
    return `<div class="empty-state" style="padding:30px 10px;"><div style="font-size:14px; color:var(--text-dim);">The meaning quiz needs at least 4 started words for multiple choice. Learn a few more — or try Dictation, which works from your first word.</div></div>`;
  }
  if (!uiState.quizTarget) {
    const q = pickQuiz();
    uiState.quizTarget = q.target;
    uiState.quizOptions = q.options;
    uiState.quizChoice = null;
  }
  const optsHtml = uiState.quizOptions.map((o) => {
    let cls = '';
    if (uiState.quizChoice) {
      if (o.id === uiState.quizTarget.id) cls = 'correct';
      else if (o.id === uiState.quizChoice && uiState.quizChoice !== uiState.quizTarget.id) cls = 'wrong';
    }
    return `<button class="quiz-option ${cls}" data-choice="${o.id}" ${uiState.quizChoice ? 'disabled' : ''}>${o.english}</button>`;
  }).join('');
  return `
    <div style="font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">What does this mean?</div>
    <div class="word-hero" style="padding-top:8px;">
      <div class="irish display" style="font-size:44px;">${uiState.quizTarget.irish}</div>
    </div>
    <div class="btn-row" style="justify-content:center;"><button class="btn secondary" id="quizHear">🔊 Hear it</button></div>
    <div style="margin-top:16px;">${optsHtml}</div>
    ${uiState.quizChoice ? `<div class="btn-row"><button class="btn" id="quizNext">Next word</button></div>` : ''}
  `;
}

function diffHtml(ops) {
  const parts = ops.map((op) => {
    if (op.type === 'match') return `<span style="color:#9fc48a;">${escapeHtml(op.answerChar)}</span>`;
    if (op.type === 'sub') return `<span style="color:#e2a494; text-decoration:underline;" title="you typed “${escapeHtml(op.typedChar)}”">${escapeHtml(op.answerChar)}</span>`;
    if (op.type === 'del') return `<span style="color:#e2a494; background:rgba(177,80,58,0.18); border-radius:3px;">${escapeHtml(op.answerChar)}</span>`;
    return `<span style="color:var(--text-dim); text-decoration:line-through;">${escapeHtml(op.typedChar)}</span>`;
  });
  return parts.join('');
}

function dictationHtml() {
  if (!hasRealAudioForActivePack()) {
    return `<div class="empty-state" style="padding:30px 10px;"><div style="font-size:14px; color:var(--text-dim);">Dictation needs real pronunciation audio — it isn't available for this language yet.</div></div>`;
  }
  if (!dictTarget) dictTarget = pickDictation();
  if (!dictTarget) {
    return `<div class="empty-state" style="padding:30px 10px;"><div style="font-size:14px; color:var(--text-dim);">Start a few words first — dictation quizzes the words you're learning.</div></div>`;
  }
  const feedback = dictChecked ? `
    <div class="pron-score" style="margin-top:14px;">
      <div class="verdict">${dictChecked.correct ? '✓ Perfect — every letter, fadas included.' : 'Not quite — the answer with your mistakes marked:'}</div>
      ${dictChecked.correct ? '' : `<div class="display" style="font-size:26px; margin-top:8px; letter-spacing:0.5px;">${diffHtml(dictChecked.ops)}</div>
      <div class="heard" style="margin-top:6px;">You typed: “${escapeHtml(dictChecked.typedRaw)}” · ${Math.round(dictChecked.accuracy * 100)}% of letters right</div>`}
      <div style="margin-top:8px; font-size:13px;">${dictTarget.irish} — ${dictTarget.english}</div>
    </div>
    <div class="btn-row"><button class="btn" id="dictNext">Next word</button></div>
  ` : `
    <div class="btn-row"><button class="btn" id="dictCheck">Check</button></div>
  `;
  return `
    <div style="font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Type what you hear</div>
    <div class="btn-row" style="justify-content:center;"><button class="btn" id="dictHear">🔊 Play</button></div>
    <div style="margin-top:14px;">
      <input type="text" id="dictInput" placeholder="type what you heard…" autocomplete="off" autocapitalize="off" spellcheck="false" ${dictChecked ? 'disabled' : ''} value="${dictChecked ? escapeHtml(dictChecked.typedRaw) : ''}">
      <div style="font-size:11px; color:var(--text-dim); margin-top:6px;">Accents count! Long-press a vowel on your phone keyboard (or use ´ ) to type accented letters.</div>
    </div>
    ${feedback}
  `;
}

export function render() {
  return `
    <div class="card">
      ${modeToggleHtml()}
      ${mode === 'meaning' ? meaningHtml() : dictationHtml()}
    </div>
  `;
}

export function bind(main, rerender) {
  main.querySelectorAll('[data-mode]').forEach((b) => {
    b.onclick = () => {
      mode = b.dataset.mode;
      dictChecked = null;
      dictTarget = null;
      rerender();
      if (mode === 'dictation' && dictTarget) speakWord(dictTarget).catch(() => {});
    };
  });

  // --- Meaning mode ---
  const quizHear = main.querySelector('#quizHear');
  if (quizHear) quizHear.onclick = () => { if (uiState.quizTarget) speakWord(uiState.quizTarget).catch((e) => console.error(e)); };

  main.querySelectorAll('[data-choice]').forEach((b) => {
    b.onclick = () => {
      if (uiState.quizChoice) return;
      uiState.quizChoice = b.dataset.choice;
      const id = uiState.quizTarget.id;
      if (state.progress[id]) {
        bumpSkill(state.progress[id], 'listening', uiState.quizChoice === id ? 1 : -1);
        saveProgress();
      }
      rerender();
    };
  });

  const quizNext = main.querySelector('#quizNext');
  if (quizNext) quizNext.onclick = () => {
    const q = pickQuiz();
    if (q) { uiState.quizTarget = q.target; uiState.quizOptions = q.options; uiState.quizChoice = null; }
    rerender();
  };

  // --- Dictation mode ---
  const dictHear = main.querySelector('#dictHear');
  if (dictHear) dictHear.onclick = () => { if (dictTarget) speakWord(dictTarget).catch((e) => console.error(e)); };

  const dictCheck = main.querySelector('#dictCheck');
  const dictInput = main.querySelector('#dictInput');
  const check = () => {
    const typedRaw = dictInput.value;
    const result = diffAnswer(normalizeAnswer(typedRaw), normalizeAnswer(dictTarget.irish));
    dictChecked = { ...result, typedRaw };
    recordInput('dictation');
    if (result.correct) recordInput('dictationCorrect');
    if (state.progress[dictTarget.id]) {
      bumpSkill(state.progress[dictTarget.id], 'listening', result.correct ? 1 : (result.accuracy < 0.6 ? -1 : 0));
      saveProgress();
    }
    rerender();
  };
  if (dictCheck) dictCheck.onclick = check;
  if (dictInput && !dictChecked) dictInput.onkeydown = (e) => { if (e.key === 'Enter') check(); };

  const dictNext = main.querySelector('#dictNext');
  if (dictNext) dictNext.onclick = () => {
    dictTarget = pickDictation();
    dictChecked = null;
    rerender();
    if (dictTarget) speakWord(dictTarget).catch(() => {});
  };
}
