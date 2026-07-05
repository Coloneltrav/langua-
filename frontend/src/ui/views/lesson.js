// TODAY'S LESSON — the capsule-guided curriculum, walked end to end.
//
// Capsules with a full `encounter` (see data/capsulesGa.js for the
// blueprint, engine/curriculum.js for how a capsule is chosen) get the
// richer Living-Encounter flow: Observe (a glossed narrative passage,
// self-contained comprehensible input — no pre-teaching flashcards
// first) -> Participate (a real decision with a consequence, not a
// translation drill) -> Reflect (brief factual context) -> Practice
// (the words just encountered, now formalized into spaced repetition) ->
// a quick comprehension check -> done.
//
// Capsules without an `encounter` fall back to the simpler flow: teach
// whatever vocabulary is missing first, then read, then check, then
// done — still real curriculum sequencing, just without the full
// treatment. This is additive: Learn/Review/Input/Listen still exist
// standalone while this unified flow gets validated.
import { CULTURE_CAPSULES } from '../../data/capsules.js';
import { state, saveProgress, registerNewWordLearned } from '../../state/store.js';
import { buildLessonPlan, planFor } from '../../engine/curriculum.js';
import { sm2Update, bumpSkill, freshProgress } from '../../engine/sm2.js';
import { wordCardHtml, bindWordCard } from '../components/wordCard.js';
import { encounterVisualHtml } from '../components/encounterVisual.js';
import { linkifyIrish, emptyState } from '../dom.js';
import { bindHear } from './learn.js';

let plan = null; // {capsule, teachWords, prerequisiteCount} — see engine/curriculum.js
let teachIndex = 0;
let stage = 'teach'; // 'observe'/'participate'/'reflect' (encounter only) -> 'teach' -> 'capsule' -> 'quiz' -> 'done'
let quizChoice = null;
let participateChoice = null;

function hasEncounter() {
  return !!plan?.capsule.encounter;
}

function ensurePlan() {
  if (plan) return;
  plan = buildLessonPlan(CULTURE_CAPSULES, state.progress, state.settings.completedCapsules);
  teachIndex = 0;
  quizChoice = null;
  participateChoice = null;
  if (!plan) return;
  stage = hasEncounter() ? 'observe' : (plan.teachWords.length ? 'teach' : 'capsule');
}

function currentTeachWord() {
  return plan.teachWords[teachIndex];
}

// Lets a learner jump straight into a specific capsule's lesson (e.g. from
// its Culture detail page) instead of waiting for the curriculum queue to
// reach it on its own.
export function startCapsule(capsule) {
  plan = planFor(capsule, state.progress);
  teachIndex = 0;
  quizChoice = null;
  participateChoice = null;
  stage = hasEncounter() ? 'observe' : (plan.teachWords.length ? 'teach' : 'capsule');
}

// Read by router.js so the "teach" stage auto-plays its word the same way
// Learn/Review do.
export function spokenWord() {
  return plan && stage === 'teach' ? currentTeachWord() : null;
}

function finishCapsule() {
  state.settings.completedCapsules[plan.capsule.id] = true;
  saveProgress();
}

function afterTeaching() {
  stage = plan.capsule.quiz ? 'quiz' : 'done';
  if (!plan.capsule.quiz) finishCapsule();
}

// Called by ui/packSwitch.js on pack/accent change — a cached plan points
// at the *previous* pack's capsule and word ids.
export function resetLesson() {
  plan = null;
  teachIndex = 0;
  stage = 'teach';
  quizChoice = null;
  participateChoice = null;
}

function teachStageHtml() {
  const w = currentTeachWord();
  const isPrereq = teachIndex < plan.prerequisiteCount;
  const label = hasEncounter() ? 'Now that you\'ve met it in context' : (isPrereq ? 'Needed first' : "Today's new word");
  return `
    <div class="card" style="margin-bottom:0; padding:14px 18px;">
      <div style="font-size:11.5px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">
        ${label} · word ${teachIndex + 1} of ${plan.teachWords.length} · from &ldquo;${plan.capsule.title}&rdquo;
      </div>
    </div>
    ${wordCardHtml(w, 'learn')}
  `;
}

function quizStageHtml() {
  const q = plan.capsule.quiz;
  const optsHtml = q.options.map((opt, i) => {
    let cls = '';
    if (quizChoice != null) {
      if (i === q.answer) cls = 'correct';
      else if (i === quizChoice) cls = 'wrong';
    }
    return `<button class="quiz-option ${cls}" data-lesson-choice="${i}" ${quizChoice != null ? 'disabled' : ''}>${opt}</button>`;
  }).join('');
  return `
    <div class="card">
      <div style="font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">Quick check</div>
      <div style="margin-top:8px; font-size:15px;">${q.q}</div>
      <div style="margin-top:10px;">${optsHtml}</div>
      ${quizChoice != null ? '<div class="btn-row"><button class="btn" id="finishLesson">Continue</button></div>' : ''}
    </div>
  `;
}

function doneStageHtml() {
  return `
    <div class="card" style="text-align:center; padding:34px 20px;">
      <div class="glyph display" style="font-size:38px; color:var(--gold); margin-bottom:8px;">✓</div>
      <div style="font-size:18px; margin-bottom:6px;">Lesson complete — &ldquo;${plan.capsule.title}&rdquo;</div>
      <div style="font-size:13px; color:var(--text-dim); margin-bottom:16px; line-height:1.6;">${plan.teachWords.length} word${plan.teachWords.length === 1 ? '' : 's'} started, one capsule unlocked. They'll keep coming back in Review.</div>
      <button class="btn" id="nextLesson">Start next lesson</button>
    </div>
  `;
}

export function render() {
  ensurePlan();
  if (!plan) {
    return emptyState(
      'Every capsule is complete',
      "You've finished every available lesson capsule for this pack — genuinely well done. Keep building depth in Vocabulary and Review, or check back once more capsules are added.",
    );
  }

  const c = plan.capsule;

  if (stage === 'observe') {
    const e = c.encounter;
    return `
      <div class="card" style="padding:0; overflow:hidden;">
        ${encounterVisualHtml(e.visual)}
        <div style="padding:20px;">
          <div class="pos mono">${e.observeTitle}</div>
          <div style="font-size:15.5px; line-height:1.8; margin-top:12px;">${linkifyIrish(e.observe)}</div>
          ${e.observeNote ? `<div style="font-size:11px; color:var(--text-dim); margin-top:12px; font-style:italic;">${e.observeNote}</div>` : ''}
          <div class="btn-row"><button class="btn" id="toParticipate">Continue</button></div>
        </div>
      </div>
    `;
  }

  if (stage === 'participate') {
    const e = c.encounter;
    const chosen = participateChoice != null ? e.participateChoices[participateChoice] : null;
    const choicesHtml = e.participateChoices.map((ch, i) => `
      <button class="quiz-option ${participateChoice === i ? 'correct' : ''}" data-participate-choice="${i}" ${participateChoice != null ? 'disabled' : ''} style="text-align:left; height:auto; line-height:1.5; padding:12px 16px;">${ch.label}</button>
    `).join('');
    return `
      <div class="card">
        <div style="font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">A decision</div>
        <div style="margin-top:8px; font-size:16px; font-family:'Cormorant Garamond',serif;">${e.participatePrompt}</div>
        <div style="margin-top:12px; display:flex; flex-direction:column; gap:8px;">${choicesHtml}</div>
        ${chosen ? `
          <div class="example-box" style="margin-top:16px; border-left-color:var(--flag-orange);">
            <div style="font-size:14px; line-height:1.7;">${linkifyIrish(chosen.consequence)}</div>
          </div>
          <div class="btn-row"><button class="btn" id="toReflect">Continue</button></div>
        ` : ''}
      </div>
    `;
  }

  if (stage === 'reflect') {
    return `
      <div class="card">
        <div style="font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">What actually happened</div>
        <div style="margin-top:10px; font-size:14.5px; line-height:1.75;">${linkifyIrish(c.encounter.reflect)}</div>
        <div class="btn-row"><button class="btn" id="toTeach">${plan.teachWords.length ? "Learn this lesson's words" : 'Continue'}</button></div>
      </div>
    `;
  }

  if (stage === 'teach') return teachStageHtml();

  if (stage === 'capsule') {
    return `
      <div class="card">
        <div class="pos mono">${c.category} · ${c.difficulty}</div>
        <div style="font-family:'Cormorant Garamond',serif; font-size:26px; margin:8px 0 14px 0; color:var(--gold-bright);">${c.title}</div>
        <div class="example-box" style="border-left-color:var(--flag-orange);">
          <div style="font-size:15px; line-height:1.75;">${linkifyIrish(c.text)}</div>
        </div>
        <div class="btn-row"><button class="btn" id="toQuiz">${c.quiz ? 'Quick check' : 'Finish lesson'}</button></div>
      </div>
    `;
  }

  if (stage === 'quiz' && c.quiz) return quizStageHtml();

  return doneStageHtml();
}

export function bind(main, rerender) {
  if (!plan) return;
  const c = plan.capsule;

  if (stage === 'observe') {
    const toParticipate = main.querySelector('#toParticipate');
    if (toParticipate) toParticipate.onclick = () => { stage = 'participate'; rerender(true); };
    return;
  }

  if (stage === 'participate') {
    main.querySelectorAll('[data-participate-choice]').forEach((b) => {
      b.onclick = () => {
        if (participateChoice != null) return;
        participateChoice = parseInt(b.dataset.participateChoice, 10);
        rerender();
      };
    });
    const toReflect = main.querySelector('#toReflect');
    if (toReflect) toReflect.onclick = () => { stage = 'reflect'; rerender(true); };
    return;
  }

  if (stage === 'reflect') {
    const toTeach = main.querySelector('#toTeach');
    if (toTeach) toTeach.onclick = () => {
      if (plan.teachWords.length) { stage = 'teach'; } else { afterTeaching(); }
      rerender(true);
    };
    return;
  }

  if (stage === 'teach') {
    bindWordCard(main, currentTeachWord());
    const hearBtn = main.querySelector('#hearBtn');
    if (hearBtn) bindHear(hearBtn, () => currentTeachWord());
    main.querySelectorAll('[data-quality]').forEach((b) => {
      b.onclick = () => {
        const quality = parseInt(b.dataset.quality, 10);
        const w = currentTeachWord();
        if (!state.progress[w.id]) {
          state.progress[w.id] = freshProgress();
          registerNewWordLearned();
        }
        sm2Update(state.progress[w.id], quality);
        bumpSkill(state.progress[w.id], 'recall', quality >= 4 ? 1 : (quality < 3 ? -1 : 0));
        bumpSkill(state.progress[w.id], 'recognition', quality >= 3 ? 1 : 0);
        saveProgress();
        teachIndex += 1;
        if (teachIndex >= plan.teachWords.length) {
          if (hasEncounter()) afterTeaching();
          else stage = 'capsule';
        }
        rerender(true);
      };
    });
    return;
  }

  if (stage === 'capsule') {
    const toQuiz = main.querySelector('#toQuiz');
    if (toQuiz) toQuiz.onclick = () => {
      if (c.quiz) { stage = 'quiz'; } else { finishCapsule(); stage = 'done'; }
      rerender(true);
    };
    return;
  }

  if (stage === 'quiz') {
    main.querySelectorAll('[data-lesson-choice]').forEach((b) => {
      b.onclick = () => {
        if (quizChoice != null) return;
        quizChoice = parseInt(b.dataset.lessonChoice, 10);
        rerender();
      };
    });
    const finishBtn = main.querySelector('#finishLesson');
    if (finishBtn) finishBtn.onclick = () => { finishCapsule(); stage = 'done'; rerender(true); };
    return;
  }

  const nextLessonBtn = main.querySelector('#nextLesson');
  if (nextLessonBtn) nextLessonBtn.onclick = () => { plan = null; rerender(true); };
}
