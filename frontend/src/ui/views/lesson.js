// TODAY'S LESSON — the capsule-guided curriculum, walked end to end:
// teach whatever vocabulary a capsule assumes/introduces, then read the
// capsule itself (its target words now comprehensible), then a quick
// check, then it's marked complete and the words recycle into Review.
// This is additive: Learn/Review/Input/Listen still exist standalone
// while this unified flow gets validated. See engine/curriculum.js.
import { CULTURE_CAPSULES } from '../../data/capsules.js';
import { state, saveProgress, registerNewWordLearned } from '../../state/store.js';
import { buildLessonPlan } from '../../engine/curriculum.js';
import { sm2Update, bumpSkill, freshProgress } from '../../engine/sm2.js';
import { wordCardHtml, bindWordCard } from '../components/wordCard.js';
import { linkifyIrish, emptyState } from '../dom.js';
import { bindHear } from './learn.js';

let plan = null; // {capsule, teachWords, prerequisiteCount} — see engine/curriculum.js
let teachIndex = 0;
let stage = 'teach'; // 'teach' -> 'capsule' -> 'quiz' -> 'done'
let quizChoice = null;

function ensurePlan() {
  if (plan) return;
  plan = buildLessonPlan(CULTURE_CAPSULES, state.progress, state.settings.completedCapsules);
  teachIndex = 0;
  quizChoice = null;
  stage = plan && plan.teachWords.length ? 'teach' : 'capsule';
}

function currentTeachWord() {
  return plan.teachWords[teachIndex];
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

// Called by ui/packSwitch.js on pack/accent change — a cached plan points
// at the *previous* pack's capsule and word ids.
export function resetLesson() {
  plan = null;
  teachIndex = 0;
  stage = 'teach';
  quizChoice = null;
}

export function render() {
  ensurePlan();
  if (!plan) {
    return emptyState(
      'Every capsule is complete',
      "You've finished every available lesson capsule for this pack — genuinely well done. Keep building depth in Vocabulary and Review, or check back once more capsules are added.",
    );
  }

  if (stage === 'teach') {
    const w = currentTeachWord();
    const isPrereq = teachIndex < plan.prerequisiteCount;
    return `
      <div class="card" style="margin-bottom:0; padding:14px 18px;">
        <div style="font-size:11.5px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">
          ${isPrereq ? 'Needed first' : "Today's new word"} · word ${teachIndex + 1} of ${plan.teachWords.length} · leads into &ldquo;${plan.capsule.title}&rdquo;
        </div>
      </div>
      ${wordCardHtml(w, 'learn')}
    `;
  }

  if (stage === 'capsule') {
    const c = plan.capsule;
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

  if (stage === 'quiz' && plan.capsule.quiz) {
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
        ${quizChoice != null ? '<div class="btn-row"><button class="btn" id="finishLesson">Finish lesson</button></div>' : ''}
      </div>
    `;
  }

  // stage === 'done'
  return `
    <div class="card" style="text-align:center; padding:34px 20px;">
      <div class="glyph display" style="font-size:38px; color:var(--gold); margin-bottom:8px;">✓</div>
      <div style="font-size:18px; margin-bottom:6px;">Lesson complete — &ldquo;${plan.capsule.title}&rdquo;</div>
      <div style="font-size:13px; color:var(--text-dim); margin-bottom:16px; line-height:1.6;">${plan.teachWords.length} word${plan.teachWords.length === 1 ? '' : 's'} started, one capsule unlocked. They'll keep coming back in Review.</div>
      <button class="btn" id="nextLesson">Start next lesson</button>
    </div>
  `;
}

export function bind(main, rerender) {
  if (!plan) return;

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
        if (teachIndex >= plan.teachWords.length) stage = 'capsule';
        rerender(true);
      };
    });
    return;
  }

  if (stage === 'capsule') {
    const toQuiz = main.querySelector('#toQuiz');
    if (toQuiz) toQuiz.onclick = () => {
      if (plan.capsule.quiz) { stage = 'quiz'; } else { finishCapsule(); stage = 'done'; }
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
