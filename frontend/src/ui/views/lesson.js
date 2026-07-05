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
import { WORDS } from '../../data/words.js';
import { state, saveProgress, registerNewWordLearned } from '../../state/store.js';
import { buildLessonPlan, planFor } from '../../engine/curriculum.js';
import { todayDue } from '../../engine/queue.js';
import { wordsReferencedIn } from '../../engine/wordMatch.js';
import { sm2Update, bumpSkill, freshProgress } from '../../engine/sm2.js';
import { wordCardHtml, bindWordCard } from '../components/wordCard.js';
import { encounterVisualHtml } from '../components/encounterVisual.js';
import { speakTargetLanguage } from '../../services/tts.js';
import { startRain, startWind, stopAmbience, isAmbiencePlaying } from '../../services/ambience.js';
import { startRecording, stopRecording, recordingActive } from '../../services/pronunciation.js';
import { activePack } from '../../data/languagePacks.js';
import { linkifyIrish, emptyState } from '../dom.js';
import { bindHear } from './learn.js';

let plan = null; // {capsule, teachWords, prerequisiteCount} — see engine/curriculum.js
let teachIndex = 0;
let stage = 'teach'; // 'observe'/'participate'/'reflect'/'recap' (encounter only) -> 'teach' -> 'capsule' -> 'quiz' -> 'done'
let quizChoice = null;
let participateChoice = null;
let runtimeBeats = []; // the encounter's beats, possibly with a "callback" beat prepended (see buildRuntimeBeats)
let beatIndex = 0; // how many of runtimeBeats are revealed
let spokenBeatIndex = -1; // guards against re-speaking a beat on every rerender
let revealedTranslations = new Set(); // indices of dialogue beats whose English has been tapped into view — read/guess first, translate last

function hasEncounter() {
  return !!plan?.capsule.encounter;
}

// "Invisible review": if anything is due, one due word's chunk quietly
// resurfaces as the first thing in the scene — not a graded drill, just a
// phrase drifting back before the story starts. Ungraded on purpose; formal
// review still lives in Workshop.
function buildRuntimeBeats(e) {
  const due = todayDue(WORDS, state.progress);
  if (!due.length) return e.beats;
  const w = due[Math.floor(Math.random() * due.length)];
  const callback = { type: 'callback', speaker: 'From your reviews', irish: w.chunk || w.irish, phonetic: w.phonetic, english: w.example_en || w.english };
  return [callback, ...e.beats];
}

function resetEncounterState() {
  quizChoice = null;
  participateChoice = null;
  runtimeBeats = hasEncounter() ? buildRuntimeBeats(plan.capsule.encounter) : [];
  beatIndex = hasEncounter() ? 1 : 0; // reveal the first beat immediately
  spokenBeatIndex = -1;
  revealedTranslations = new Set();
  stopAmbience();
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

// Read by router.js: while a Living Encounter's scene is actively playing
// (not Practice, Quiz, or Done — those still benefit from quick sub-nav),
// the sub-tabs row is redundant chrome eating into the one-screen-per-beat
// budget, so it hides. The top-level pillars stay as an escape hatch.
export function isImmersiveStage() {
  return hasEncounter() && ['observe', 'participate', 'reflect', 'recap'].includes(stage);
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

// Always called for encounter capsules (the plain-capsule fallback flow
// goes teach -> capsule -> quiz instead). Routes through a "recap" of the
// full scene, now with everything visible, before the comprehension check —
// vocabulary emerged from the dialogue, so the dialogue gets to make total
// sense once more before moving on.
function afterTeaching() {
  stage = 'recap';
}

function afterRecap() {
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

const BEAT_LABELS = { callback: 'From your reviews' };

// "The app never says congratulations — it simply stops helping as much."
// If every word this line actually uses is already well known (SM-2
// repetitions >= 2, the same bar the rest of the app calls "known"), the
// translation button recedes into a quiet, optional link instead of a
// normal affordance — earned per line, from real per-word mastery, not a
// coarse level gate.
function beatIsFullyKnown(beat) {
  const refs = wordsReferencedIn(beat.irish);
  if (!refs.length) return false; // nothing recognized — can't judge, stay helpful
  return refs.every((w) => state.progress[w.id] && state.progress[w.id].repetitions >= 2);
}

function beatHtml(beat, i, isLatest, { alwaysShown = false } = {}) {
  const dim = isLatest || alwaysShown ? '' : 'opacity:0.55;';
  if (beat.type === 'narration') {
    return `<div style="font-size:13.5px; font-style:italic; color:var(--text-dim); line-height:1.7; ${dim}">${beat.text}</div>`;
  }
  const speakerLabel = BEAT_LABELS[beat.type] || beat.speaker;
  const isCallback = beat.type === 'callback';
  // The target-language text shows immediately — audio autoplays alongside
  // it (see bind()), so listening and reading happen together. Only the
  // English translation stays behind a tap, so there's still a real moment
  // to try understanding before falling back to it.
  const translationShown = alwaysShown || revealedTranslations.has(i);
  const knownLine = !alwaysShown && beatIsFullyKnown(beat);
  const translationToggle = knownLine
    ? `<button class="chunk-tag mono" data-reveal-translation="${i}" style="cursor:pointer; border:none; background:none; margin-top:6px; font-size:10px; color:var(--text-dim); opacity:0.65; text-decoration:underline; padding:0;">translate anyway</button>`
    : `<button class="chunk-tag mono" data-reveal-translation="${i}" style="cursor:pointer; border:1px dashed rgba(201,162,75,0.35); background:none; margin-top:6px; font-size:11px;">Show translation</button>`;
  const body = `
    <div style="font-size:15px; line-height:1.45;">${linkifyIrish(beat.irish)}</div>
    ${translationShown
      ? `<div style="font-size:12.5px; color:var(--text-dim); margin-top:3px;">${beat.english}</div>`
      : translationToggle}
  `;
  return `
    <div style="${dim}">
      ${isCallback ? `<div style="font-size:12px; font-style:italic; color:var(--text-dim); margin-bottom:6px;">Before the scene begins, a phrase drifts back to you.</div>` : ''}
      <div style="font-size:11px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.4px; margin-bottom:3px;">${speakerLabel}</div>
      <div class="example-box" style="border-left-color:${isCallback ? 'var(--gold-dim)' : 'var(--flag-orange)'}; display:flex; align-items:baseline; gap:8px; justify-content:space-between;">
        <div>${body}</div>
        <button class="chunk-tag mono" data-replay-beat="${i}" style="cursor:pointer; border:1px solid rgba(201,162,75,0.35); background:none; flex-shrink:0;">🔊</button>
      </div>
    </div>
  `;
}

const ENCOUNTER_STEPS = [['observe', 'Observe'], ['participate', 'Participate'], ['reflect', 'Reflect'], ['teach', 'Practice']];

function encounterStepperHtml(currentStage) {
  const effectiveStage = ['recap', 'quiz', 'done'].includes(currentStage) ? 'teach' : currentStage;
  const currentIdx = ENCOUNTER_STEPS.findIndex(([id]) => id === effectiveStage);
  return `
    <div class="stage-stepper">
      ${ENCOUNTER_STEPS.map(([, label], i) => `
        <div class="stage-step ${i === currentIdx ? 'active' : ''} ${i < currentIdx ? 'done' : ''}"><span class="dot"></span><span class="label">${label}</span></div>
      `).join('<span class="stage-connector"></span>')}
    </div>
  `;
}

function senseOfPlaceHtml(lines) {
  if (!lines?.length) return '';
  return `
    <div class="sense-of-place">
      ${lines.map((l) => `<div>${l}</div>`).join('')}
    </div>
  `;
}

const AMBIENCE_KINDS = { rain: { icon: '🌧', label: 'rain', start: startRain }, wind: { icon: '💨', label: 'wind', start: startWind } };
const VISIBLE_BEATS = 1; // one beat on screen at a time — no accumulation to scroll through; the full scene reappears in Recap

function observeStageHtml(e) {
  const totalRevealed = beatIndex;
  const startIdx = Math.max(0, totalRevealed - VISIBLE_BEATS);
  const beatsHtml = Array.from({ length: totalRevealed - startIdx }, (_, k) => startIdx + k)
    .map((idx) => beatHtml(runtimeBeats[idx], idx, idx === totalRevealed - 1))
    .join('<div style="height:14px;"></div>');
  const done = beatIndex >= runtimeBeats.length;
  const ambienceKind = AMBIENCE_KINDS[e.ambience];
  const ambienceBtn = ambienceKind
    ? `<button class="chunk-tag mono" id="toggleAmbience" style="cursor:pointer; border:1px solid rgba(201,162,75,0.35); background:none; font-size:11px; margin-top:5px;">${isAmbiencePlaying() ? `🔊 ${ambienceKind.label[0].toUpperCase()}${ambienceKind.label.slice(1)} playing — stop` : `${ambienceKind.icon} Play ${ambienceKind.label}`}</button>`
    : '';
  // Sense-of-place is an opening flourish, not something to keep paying rent
  // on screen — once the scene has moved past its first beat, drop it to
  // keep the whole card fitting on one screen, no scrolling required.
  const showSenseOfPlace = totalRevealed <= 1;
  // The callback (invisible review) beat happens "before the scene begins" —
  // showing the scene's own visual under it is both premature and the single
  // biggest thing pushing this screen past no-scroll height, so skip it here.
  const isCallbackOnly = totalRevealed === 1 && runtimeBeats[0] && runtimeBeats[0].type === 'callback';
  return `
    <div class="card fade-in observe-hero" style="padding:0; overflow:hidden;">
      ${isCallbackOnly ? '' : encounterVisualHtml(e.visual)}
      <div style="padding:8px 16px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
          <div>
            <div class="pos mono">${e.observeTitle}</div>
            ${e.observeNote && showSenseOfPlace ? `<div style="font-size:11px; color:var(--text-dim); margin-top:5px; font-style:italic;">${e.observeNote}</div>` : ''}
          </div>
          ${ambienceBtn}
        </div>
        ${showSenseOfPlace ? senseOfPlaceHtml(e.senseOfPlace) : ''}
        ${startIdx > 0 ? `<div style="text-align:center; font-size:11px; color:var(--text-dim); margin-top:8px;">· · ·</div>` : ''}
        <div style="margin-top:${startIdx > 0 ? '4' : '10'}px; display:flex; flex-direction:column; gap:10px;">${beatsHtml}</div>
        <div class="btn-row" style="margin-top:8px;"><button class="btn" id="toParticipate">${done ? 'Continue' : 'Go on'}</button></div>
      </div>
    </div>
  `;
}

// "Speaking as creation": at the moment of a real narrative decision, ask
// the learner to produce their own sentence explaining it — not pick from a
// list, not repeat a reference word. There's no ASR grammar for open
// sentences (the pronunciation engine only scores single known words
// against a reference), so this is honestly scoped as record-and-hear-
// yourself-back, same honesty pattern as the pronunciation widget's "no
// engine available" fallback — no fabricated correctness score.
function bindSpeakingCreation(main) {
  const toggleBtn = main.querySelector('#toggleCreation');
  const panel = main.querySelector('#creationPanel');
  if (toggleBtn && panel) {
    toggleBtn.onclick = () => {
      const showing = panel.style.display !== 'none';
      panel.style.display = showing ? 'none' : 'block';
      toggleBtn.style.display = showing ? '' : 'none';
    };
  }
  const recBtn = main.querySelector('#creationRecBtn');
  const statusEl = main.querySelector('#creationStatus');
  if (!recBtn) return;
  recBtn.onclick = async () => {
    if (!recordingActive()) {
      try {
        await startRecording();
        recBtn.textContent = '⏹️ Stop recording';
        statusEl.innerHTML = `<span class="rec-indicator"><span class="rec-dot"></span>Recording — tap again to stop</span>`;
      } catch (e) {
        statusEl.innerHTML = `<span style="color:#e2a494; font-size:13px;">Mic unavailable here (${e.message}).</span>`;
      }
      return;
    }
    const blob = await stopRecording();
    recBtn.textContent = '🎙️ Record yourself';
    statusEl.innerHTML = `<span class="loading-dots" style="font-size:13px; color:var(--text-dim);">Preparing playback</span>`;
    try {
      const { decodeToMono16k } = await import('../../services/audio/decode.js');
      const { trimSilence, encodeWav } = await import('../../services/audio/trim.js');
      const samples = await decodeToMono16k(await blob.arrayBuffer());
      const { samples: trimmed } = trimSilence(samples, 16000);
      const url = URL.createObjectURL(encodeWav(trimmed, 16000));
      statusEl.innerHTML = `<audio controls src="${url}" style="width:100%;"></audio>`;
    } catch {
      statusEl.innerHTML = `<audio controls src="${URL.createObjectURL(blob)}" style="width:100%;"></audio>`;
    }
  };
}

function recapStageHtml() {
  const rows = runtimeBeats.map((b, i) => beatHtml(b, i, false, { alwaysShown: true })).join('<div style="height:12px;"></div>');
  return `
    <div class="card fade-in">
      <div style="font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">The scene, now that you understand it</div>
      <div style="margin-top:14px; display:flex; flex-direction:column; gap:12px;">${rows}</div>
      <div class="btn-row"><button class="btn" id="toQuizOrDone">Continue</button></div>
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
    // Once a choice is made, the roads not taken don't need to keep eating
    // screen space at full size — collapse to just what was chosen.
    const choicesHtml = chosen
      ? `<div style="font-size:13px; color:var(--text-dim);">You chose: <span style="color:var(--text);">${chosen.label}</span></div>`
      : e.participateChoices.map((ch, i) => `
        <button class="quiz-option" data-participate-choice="${i}" style="text-align:left; height:auto; line-height:1.35; padding:9px 14px;">${ch.label}</button>
      `).join('');
    return stepper + `
      <div class="card fade-in">
        <div style="font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">A decision</div>
        <div style="margin-top:10px; font-size:19px; font-family:'Cormorant Garamond',serif; line-height:1.4;">${e.participatePrompt}</div>
        <div style="margin-top:16px; display:flex; flex-direction:column; gap:8px;">${choicesHtml}</div>
        ${chosen ? `
          <div class="example-box fade-in" style="margin-top:12px; border-left-color:var(--flag-orange);">
            <div style="font-size:13.5px; line-height:1.5;">${linkifyIrish(chosen.consequence)}</div>
          </div>
          <button class="chunk-tag mono" id="toggleCreation" style="cursor:pointer; border:1px dashed rgba(201,162,75,0.35); background:none; margin-top:8px; font-size:11px;">🎙️ Say it yourself, in ${activePack().name} (optional)</button>
          <div id="creationPanel" style="display:none; margin-top:8px;">
            <div style="font-size:12.5px; color:var(--text-dim); line-height:1.4;">Out loud: why would you choose this? Use whatever words you know — no scoring on a free sentence, this is just for your own ear.</div>
            <div class="btn-row" style="margin-top:6px;"><button class="btn secondary" id="creationRecBtn">🎙️ Record yourself</button></div>
            <div id="creationStatus" style="margin-top:6px;"></div>
          </div>
          <div class="btn-row" style="margin-top:10px;"><button class="btn" id="toReflect">Continue</button></div>
        ` : ''}
      </div>
    `;
  }

  if (stage === 'reflect') {
    const points = c.encounter.reflectPoints.map((p) => `<li style="margin-bottom:8px;">${linkifyIrish(p)}</li>`).join('');
    const ps = c.encounter.primarySource;
    const primarySourceHtml = ps ? `
      <div class="primary-source">
        <div class="quote">&ldquo;${ps.text}&rdquo;</div>
        <div class="attribution">— ${ps.attribution}</div>
      </div>
    ` : '';
    return stepper + `
      <div class="card fade-in">
        <div style="font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">What actually happened</div>
        <ul style="margin:14px 0 0 0; padding-left:18px; font-size:13.5px; line-height:1.6;">${points}</ul>
        ${primarySourceHtml}
        <div class="btn-row"><button class="btn" id="toTeach">${plan.teachWords.length ? "Learn this lesson's words" : 'Continue'}</button></div>
      </div>
    `;
  }

  if (stage === 'teach') return stepper + teachStageHtml();

  if (stage === 'recap') return stepper + recapStageHtml();

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
  if (beat.type !== 'line' && beat.type !== 'callback') return;
  speakTargetLanguage(beat.irish, beat.phonetic).catch((e) => console.error(e));
}

// Re-rendering replaces #main's innerHTML (and, for full transitions, the
// tabs/pillars nav above it too), which can otherwise leave the page
// scrolled to wherever the browser's focus-repair lands — keep the reader
// exactly where they were instead.
function withScrollPreserved(action) {
  const y = window.scrollY;
  // Blur the clicked button *before* it's removed from the DOM — some
  // mobile browsers scroll a focused element into view when it disappears
  // out from under the focus, which is the more likely real cause of a
  // jump than anything reactive happening after.
  if (document.activeElement && typeof document.activeElement.blur === 'function') document.activeElement.blur();
  action();
  window.scrollTo(0, y);
}

export function bind(main, rerender) {
  if (!plan) return;
  const c = plan.capsule;

  if (stage === 'observe') {
    const e = c.encounter;
    const latest = runtimeBeats[beatIndex - 1];
    if (latest && spokenBeatIndex !== beatIndex - 1) {
      spokenBeatIndex = beatIndex - 1;
      setTimeout(() => speakBeat(latest), 200);
    }
    main.querySelectorAll('[data-replay-beat]').forEach((b) => {
      b.onclick = () => speakBeat(runtimeBeats[parseInt(b.dataset.replayBeat, 10)]);
    });
    main.querySelectorAll('[data-reveal-translation]').forEach((b) => {
      b.onclick = () => withScrollPreserved(() => {
        revealedTranslations.add(parseInt(b.dataset.revealTranslation, 10));
        rerender();
      });
    });
    const ambienceBtn = main.querySelector('#toggleAmbience');
    if (ambienceBtn) ambienceBtn.onclick = () => withScrollPreserved(() => {
      if (isAmbiencePlaying()) { stopAmbience(); } else { AMBIENCE_KINDS[e.ambience]?.start(); }
      rerender();
    });
    const toParticipate = main.querySelector('#toParticipate');
    if (toParticipate) toParticipate.onclick = () => withScrollPreserved(() => {
      if (beatIndex < runtimeBeats.length) { beatIndex += 1; rerender(); } else { stopAmbience(); stage = 'participate'; rerender(true); }
    });
    return;
  }

  if (stage === 'participate') {
    main.querySelectorAll('[data-participate-choice]').forEach((b) => {
      b.onclick = () => withScrollPreserved(() => {
        if (participateChoice != null) return;
        participateChoice = parseInt(b.dataset.participateChoice, 10);
        rerender();
      });
    });
    bindSpeakingCreation(main);
    const toReflect = main.querySelector('#toReflect');
    if (toReflect) toReflect.onclick = () => withScrollPreserved(() => { stage = 'reflect'; rerender(true); });
    return;
  }

  if (stage === 'reflect') {
    const toTeach = main.querySelector('#toTeach');
    if (toTeach) toTeach.onclick = () => withScrollPreserved(() => {
      if (plan.teachWords.length) { stage = 'teach'; } else { afterTeaching(); }
      rerender(true);
    });
    return;
  }

  if (stage === 'recap') {
    const toQuizOrDone = main.querySelector('#toQuizOrDone');
    if (toQuizOrDone) toQuizOrDone.onclick = () => withScrollPreserved(() => { afterRecap(); rerender(true); });
    return;
  }

  if (stage === 'teach') {
    bindWordCard(main, currentTeachWord());
    const hearBtn = main.querySelector('#hearBtn');
    if (hearBtn) bindHear(hearBtn, () => currentTeachWord());
    main.querySelectorAll('[data-quality]').forEach((b) => {
      b.onclick = () => withScrollPreserved(() => {
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
      });
    });
    return;
  }

  if (stage === 'capsule') {
    const toQuiz = main.querySelector('#toQuiz');
    if (toQuiz) toQuiz.onclick = () => withScrollPreserved(() => {
      if (c.quiz) { stage = 'quiz'; } else { finishCapsule(); stage = 'done'; }
      rerender(true);
    });
    return;
  }

  if (stage === 'quiz') {
    main.querySelectorAll('[data-lesson-choice]').forEach((b) => {
      b.onclick = () => withScrollPreserved(() => {
        if (quizChoice != null) return;
        quizChoice = parseInt(b.dataset.lessonChoice, 10);
        rerender();
      });
    });
    const finishBtn = main.querySelector('#finishLesson');
    if (finishBtn) finishBtn.onclick = () => withScrollPreserved(() => { finishCapsule(); stage = 'done'; rerender(true); });
    return;
  }

  const nextLessonBtn = main.querySelector('#nextLesson');
  if (nextLessonBtn) nextLessonBtn.onclick = () => { plan = null; rerender(true); };
}
