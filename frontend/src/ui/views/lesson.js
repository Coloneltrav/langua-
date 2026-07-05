// TODAY'S LESSON — the capsule-guided curriculum, walked end to end.
//
// Capsules with a full `encounter` (see data/capsulesGa.js for the
// blueprint, engine/curriculum.js for how a capsule is chosen) get the
// richer Living-Encounter flow: Observe (a short scene, one beat at a
// time — narration and dialogue between real people, each line spoken
// aloud, comprehensible input rather than a wall of text) -> Participate
// (a real decision with a consequence, not a translation drill) -> Reflect
// (brief factual context) -> Practice (the words just encountered, now
// formalized into spaced repetition) -> a quick comprehension check -> done.
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
import { speakTargetLanguage } from '../../services/tts.js';
import { linkifyIrish, emptyState } from '../dom.js';
import { bindHear } from './learn.js';

let plan = null; // {capsule, teachWords, prerequisiteCount} — see engine/curriculum.js
let teachIndex = 0;
let stage = 'teach'; // 'observe'/'participate'/'reflect' (encounter only) -> 'teach' -> 'capsule' -> 'quiz' -> 'done'
let quizChoice = null;
let participateChoice = null;
let beatIndex = 0; // how many of the current encounter's beats are revealed
let spokenBeatIndex = -1; // guards against re-speaking a beat on every rerender
let revealedTranslations = new Set(); // indices of dialogue beats whose English has been tapped into view

function hasEncounter() {
  return !!plan?.capsule.encounter;
}

function resetEncounterState() {
  quizChoice = null;
  participateChoice = null;
  beatIndex = hasEncounter() ? 1 : 0; // reveal the first beat immediately
  spokenBeatIndex = -1;
  revealedTranslations = new Set();
}

function ensurePlan() {
  if (plan) return;
  plan = buildLessonPlan(CULTURE_CAPSULES, state.progress, state.settings.completedCapsules);
  teachIndex = 0;
  if (!plan) return;
  resetEncounterState();
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
  resetEncounterState();
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
  resetEncounterState();
}

function teachStageHtml() {
  const w = currentTeachWord();
  const isPrereq = teachIndex < plan.prerequisiteCount;
  const label = hasEncounter() ? 'Now that you\'ve met it in context' : (isPrereq ? 'Needed first' : "Today's new word");
  return `
    <div class="card fade-in" style="margin-bottom:0; padding:14px 18px;">
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
    <div class="card fade-in">
      <div style="font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">Quick check</div>
      <div style="margin-top:8px; font-size:15px;">${q.q}</div>
      <div style="margin-top:10px;">${optsHtml}</div>
      ${quizChoice != null ? '<div class="btn-row"><button class="btn" id="finishLesson">Continue</button></div>' : ''}
    </div>
  `;
}

function doneStageHtml() {
  return `
    <div class="card fade-in" style="text-align:center; padding:34px 20px;">
      <div class="glyph display" style="font-size:38px; color:var(--gold); margin-bottom:8px;">✓</div>
      <div style="font-size:18px; margin-bottom:6px;">Lesson complete — &ldquo;${plan.capsule.title}&rdquo;</div>
      <div style="font-size:13px; color:var(--text-dim); margin-bottom:16px; line-height:1.6;">${plan.teachWords.length} word${plan.teachWords.length === 1 ? '' : 's'} started, one capsule unlocked. They'll keep coming back in Review.</div>
      <button class="btn" id="nextLesson">Start next lesson</button>
    </div>
  `;
}

function beatHtml(beat, i, isLatest) {
  const dim = isLatest ? '' : 'opacity:0.55;';
  if (beat.type === 'narration') {
    return `<div style="font-size:13.5px; font-style:italic; color:var(--text-dim); line-height:1.7; ${dim}">${beat.text}</div>`;
  }
  const revealed = revealedTranslations.has(i);
  const translationHtml = revealed
    ? `<div style="font-size:12.5px; color:var(--text-dim); margin-top:4px;">${beat.english}</div>`
    : `<button class="chunk-tag mono" data-reveal-translation="${i}" style="cursor:pointer; border:1px dashed rgba(201,162,75,0.35); background:none; margin-top:6px; font-size:11px;">Show translation</button>`;
  return `
    <div style="${dim}">
      <div style="font-size:11px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.4px; margin-bottom:3px;">${beat.speaker}</div>
      <div class="example-box" style="border-left-color:var(--flag-orange); display:flex; align-items:baseline; gap:8px; justify-content:space-between;">
        <div>
          <div style="font-size:15px; line-height:1.6;">${linkifyIrish(beat.irish)}</div>
          ${translationHtml}
        </div>
        <button class="chunk-tag mono" data-replay-beat="${i}" style="cursor:pointer; border:1px solid rgba(201,162,75,0.35); background:none; flex-shrink:0;">🔊</button>
      </div>
    </div>
  `;
}

const ENCOUNTER_STEPS = [['observe', 'Observe'], ['participate', 'Participate'], ['reflect', 'Reflect'], ['teach', 'Practice']];

function encounterStepperHtml(currentStage) {
  const effectiveStage = ['quiz', 'done'].includes(currentStage) ? 'teach' : currentStage;
  const currentIdx = ENCOUNTER_STEPS.findIndex(([id]) => id === effectiveStage);
  return `
    <div class="stage-stepper">
      ${ENCOUNTER_STEPS.map(([, label], i) => `
        <div class="stage-step ${i === currentIdx ? 'active' : ''} ${i < currentIdx ? 'done' : ''}"><span class="dot"></span><span class="label">${label}</span></div>
      `).join('<span class="stage-connector"></span>')}
    </div>
  `;
}

function observeStageHtml(e) {
  const revealed = e.beats.slice(0, beatIndex);
  const beatsHtml = revealed.map((b, i) => beatHtml(b, i, i === revealed.length - 1)).join('<div style="height:14px;"></div>');
  const done = beatIndex >= e.beats.length;
  return `
    <div class="card fade-in" style="padding:0; overflow:hidden;">
      ${encounterVisualHtml(e.visual)}
      <div style="padding:26px 24px;">
        <div class="pos mono">${e.observeTitle}</div>
        ${e.observeNote ? `<div style="font-size:11px; color:var(--text-dim); margin-top:5px; font-style:italic;">${e.observeNote}</div>` : ''}
        <div style="margin-top:18px; display:flex; flex-direction:column; gap:14px;">${beatsHtml}</div>
        <div class="btn-row"><button class="btn" id="toParticipate">${done ? 'Continue' : 'Go on'}</button></div>
      </div>
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
  const stepper = hasEncounter() ? encounterStepperHtml(stage) : '';

  if (stage === 'observe') return stepper + observeStageHtml(c.encounter);

  if (stage === 'participate') {
    const e = c.encounter;
    const chosen = participateChoice != null ? e.participateChoices[participateChoice] : null;
    const choicesHtml = e.participateChoices.map((ch, i) => `
      <button class="quiz-option ${participateChoice === i ? 'correct' : ''}" data-participate-choice="${i}" ${participateChoice != null ? 'disabled' : ''} style="text-align:left; height:auto; line-height:1.5; padding:12px 16px;">${ch.label}</button>
    `).join('');
    return stepper + `
      <div class="card fade-in">
        <div style="font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">A decision</div>
        <div style="margin-top:10px; font-size:19px; font-family:'Cormorant Garamond',serif; line-height:1.4;">${e.participatePrompt}</div>
        <div style="margin-top:16px; display:flex; flex-direction:column; gap:8px;">${choicesHtml}</div>
        ${chosen ? `
          <div class="example-box fade-in" style="margin-top:16px; border-left-color:var(--flag-orange);">
            <div style="font-size:14px; line-height:1.7;">${linkifyIrish(chosen.consequence)}</div>
          </div>
          <div class="btn-row"><button class="btn" id="toReflect">Continue</button></div>
        ` : ''}
      </div>
    `;
  }

  if (stage === 'reflect') {
    const points = c.encounter.reflectPoints.map((p) => `<li style="margin-bottom:8px;">${linkifyIrish(p)}</li>`).join('');
    return stepper + `
      <div class="card fade-in">
        <div style="font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">What actually happened</div>
        <ul style="margin:14px 0 0 0; padding-left:18px; font-size:13.5px; line-height:1.6;">${points}</ul>
        <div class="btn-row"><button class="btn" id="toTeach">${plan.teachWords.length ? "Learn this lesson's words" : 'Continue'}</button></div>
      </div>
    `;
  }

  if (stage === 'teach') return stepper + teachStageHtml();

  if (stage === 'capsule') {
    return `
      <div class="card fade-in">
        <div class="pos mono">${c.category} · ${c.difficulty}</div>
        <div style="font-family:'Cormorant Garamond',serif; font-size:26px; margin:8px 0 14px 0; color:var(--gold-bright);">${c.title}</div>
        <div class="example-box" style="border-left-color:var(--flag-orange);">
          <div style="font-size:15px; line-height:1.75;">${linkifyIrish(c.text)}</div>
        </div>
        <div class="btn-row"><button class="btn" id="toQuiz">${c.quiz ? 'Quick check' : 'Finish lesson'}</button></div>
      </div>
    `;
  }

  if (stage === 'quiz' && c.quiz) return stepper + quizStageHtml();

  return stepper + doneStageHtml();
}

function speakBeat(beat) {
  if (beat.type !== 'line') return;
  speakTargetLanguage(beat.irish, beat.phonetic).catch((e) => console.error(e));
}

export function bind(main, rerender) {
  if (!plan) return;
  const c = plan.capsule;

  if (stage === 'observe') {
    const e = c.encounter;
    const latest = e.beats[beatIndex - 1];
    if (latest && spokenBeatIndex !== beatIndex - 1) {
      spokenBeatIndex = beatIndex - 1;
      setTimeout(() => speakBeat(latest), 200);
    }
    main.querySelectorAll('[data-replay-beat]').forEach((b) => {
      b.onclick = () => speakBeat(e.beats[parseInt(b.dataset.replayBeat, 10)]);
    });
    main.querySelectorAll('[data-reveal-translation]').forEach((b) => {
      b.onclick = () => { revealedTranslations.add(parseInt(b.dataset.revealTranslation, 10)); rerender(); };
    });
    const toParticipate = main.querySelector('#toParticipate');
    if (toParticipate) toParticipate.onclick = () => {
      if (beatIndex < e.beats.length) { beatIndex += 1; rerender(); }
      else { stage = 'participate'; rerender(true); }
    };
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
