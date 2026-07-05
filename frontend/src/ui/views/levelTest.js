// Advancement test — the only way a confirmed CEFR-ish level actually
// moves up (see engine/level.js). Deliberately a real test: multiple-choice
// over words you've supposedly retained, drawn at random, no retries mid-
// test, and a pass mark below 100% but well above chance.
import { WORDS } from '../../data/words.js';
import { state, saveProgress } from '../../state/store.js';
import { activePackCode } from '../../data/languagePacks.js';
import { speakWord } from '../../services/tts.js';
import { nextLevel, requirementsFor, currentStats, passThreshold, TEST_QUESTION_COUNT } from '../../engine/level.js';
import { uiState } from '../uiState.js';

let stage = 'intro'; // 'intro' -> 'quiz' -> 'result'
let questions = [];
let qIndex = 0;
let choice = null;
let correctCount = 0;

function targetLevel() {
  return nextLevel(state.settings.confirmedLevels[activePackCode()] || null);
}

function buildQuestions() {
  const known = WORDS.filter((w) => state.progress[w.id] && state.progress[w.id].repetitions >= 2);
  const pool = [...known];
  const picked = [];
  const count = Math.min(TEST_QUESTION_COUNT, pool.length);
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked.map((target) => {
    const distractorPool = WORDS.filter((w) => w.id !== target.id);
    const distractors = [];
    while (distractors.length < 3 && distractorPool.length) {
      const idx = Math.floor(Math.random() * distractorPool.length);
      distractors.push(distractorPool.splice(idx, 1)[0]);
    }
    return { target, options: [target, ...distractors].sort(() => Math.random() - 0.5) };
  });
}

function backToStats() {
  stage = 'intro';
  uiState.route = 'stats';
}

export function render() {
  const level = targetLevel();
  if (!level) {
    return `<div class="card"><div style="font-size:15px;">No further levels defined yet — you've reached the top of this ladder.</div><div class="btn-row"><button class="btn" id="backToStats">Back to Stats</button></div></div>`;
  }

  if (stage === 'intro') {
    const req = requirementsFor(level);
    return `
      <div class="card">
        <div class="pos mono">Advancement test</div>
        <div style="font-family:'Cormorant Garamond',serif; font-size:26px; margin:8px 0 14px 0; color:var(--gold-bright);">${level} test</div>
        <div style="font-size:13.5px; line-height:1.7; color:var(--text-dim);">
          ${TEST_QUESTION_COUNT} questions, drawn at random from words you've actually retained (not just seen once). You need at least ${passThreshold()} correct to pass and confirm ${level}. No going back once you start a question.
        </div>
        <div style="font-size:12px; color:var(--text-dim); margin-top:12px;">Eligibility was based on: ${req.knownWords}+ known words, an average skill score of ${req.avgSkill}+, and ${req.listenMinutes}+ minutes of listening — this test is the actual check, those were just the minimum to attempt it.</div>
        <div class="btn-row">
          <button class="btn" id="beginTest">Begin test</button>
          <button class="btn secondary" id="backToStats">Not now</button>
        </div>
      </div>
    `;
  }

  if (stage === 'quiz') {
    const q = questions[qIndex];
    const optsHtml = q.options.map((o) => {
      let cls = '';
      if (choice != null) {
        if (o.id === q.target.id) cls = 'correct';
        else if (o.id === choice) cls = 'wrong';
      }
      return `<button class="quiz-option ${cls}" data-choice="${o.id}" ${choice != null ? 'disabled' : ''}>${o.english}</button>`;
    }).join('');
    return `
      <div class="card">
        <div style="font-size:11.5px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">Question ${qIndex + 1} of ${questions.length}</div>
        <div class="word-hero" style="padding-top:8px;">
          <div class="irish display" style="font-size:40px;">${q.target.irish}</div>
        </div>
        <div class="btn-row" style="justify-content:center;"><button class="btn secondary" id="testHear">🔊 Hear it</button></div>
        <div style="margin-top:14px;">${optsHtml}</div>
        ${choice != null ? `<div class="btn-row"><button class="btn" id="testNext">${qIndex + 1 < questions.length ? 'Next question' : 'See result'}</button></div>` : ''}
      </div>
    `;
  }

  const passed = correctCount >= passThreshold();
  return `
    <div class="card" style="text-align:center; padding:34px 20px;">
      <div class="glyph display" style="font-size:38px; color:${passed ? 'var(--gold)' : 'var(--text-dim)'}; margin-bottom:8px;">${passed ? '✓' : '—'}</div>
      <div style="font-size:18px; margin-bottom:6px;">${correctCount} / ${questions.length} correct</div>
      <div style="font-size:14px; color:var(--text-dim); margin-bottom:16px; line-height:1.6;">
        ${passed ? `${level} confirmed. That's not a small thing — keep going.` : `Not quite ${level} yet — needed ${passThreshold()} correct. Keep practicing and try again whenever you're ready.`}
      </div>
      <button class="btn" id="backToStats">Back to Stats</button>
    </div>
  `;
}

export function bind(main, rerender) {
  const level = targetLevel();
  if (!level) {
    const b = main.querySelector('#backToStats');
    if (b) b.onclick = () => { uiState.route = 'stats'; rerender(true); };
    return;
  }

  if (stage === 'intro') {
    const begin = main.querySelector('#beginTest');
    if (begin) begin.onclick = () => {
      questions = buildQuestions();
      qIndex = 0;
      choice = null;
      correctCount = 0;
      stage = 'quiz';
      rerender();
    };
    const back = main.querySelector('#backToStats');
    if (back) back.onclick = () => { backToStats(); rerender(true); };
    return;
  }

  if (stage === 'quiz') {
    const q = questions[qIndex];
    const hear = main.querySelector('#testHear');
    if (hear) hear.onclick = () => speakWord(q.target).catch((e) => console.error(e));
    main.querySelectorAll('[data-choice]').forEach((b) => {
      b.onclick = () => {
        if (choice != null) return;
        choice = b.dataset.choice;
        if (choice === q.target.id) correctCount += 1;
        rerender();
      };
    });
    const next = main.querySelector('#testNext');
    if (next) next.onclick = () => {
      if (qIndex + 1 < questions.length) {
        qIndex += 1;
        choice = null;
      } else {
        if (correctCount >= passThreshold()) {
          state.settings.confirmedLevels[activePackCode()] = level;
          saveProgress();
        }
        stage = 'result';
      }
      rerender();
    };
    return;
  }

  const back = main.querySelector('#backToStats');
  if (back) back.onclick = () => { backToStats(); rerender(true); };
}

// Exported for stats.js to compute eligibility/progress without duplicating
// the "which words count as known" logic.
export function levelStats() {
  return currentStats(WORDS, state.progress, state.settings.inputStats);
}
