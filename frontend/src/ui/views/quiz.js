import { WORDS } from '../../data/words.js';
import { state, saveProgress } from '../../state/store.js';
import { startedWords } from '../../engine/queue.js';
import { bumpSkill } from '../../engine/sm2.js';
import { emptyState } from '../dom.js';
import { speakWord } from '../../services/tts.js';
import { uiState } from '../uiState.js';

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

export function render() {
  if (startedWords(WORDS, state.progress).length < 4) {
    return emptyState('Not enough words yet', 'The listening quiz needs at least 4 started words to build multiple-choice options. Learn a few more first.');
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
    <div class="card">
      <div style="font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">What does this mean?</div>
      <div class="word-hero" style="padding-top:8px;">
        <div class="irish display" style="font-size:44px;">${uiState.quizTarget.irish}</div>
      </div>
      <div class="btn-row" style="justify-content:center;"><button class="btn secondary" id="quizHear">🔊 Hear it</button></div>
      <div style="margin-top:16px;">${optsHtml}</div>
      ${uiState.quizChoice ? `<div class="btn-row"><button class="btn" id="quizNext">Next word</button></div>` : ''}
    </div>
  `;
}

export function bind(main, rerender) {
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
}
