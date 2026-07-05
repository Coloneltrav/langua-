// CAPSULE-GUIDED CURRICULUM
// Turns culture capsules from a browsable list into an actual teaching
// sequence: pick the next capsule, work out which of its words the
// learner doesn't know yet — both its declared target words AND any other
// vocabulary its own prose depends on (derived automatically from the
// text via wordMatch.js, not hand-tagged) — and produce a lesson plan
// that teaches the missing prerequisite words before the capsule itself
// is presented, so the capsule is comprehensible when it's unlocked.
import { wordsReferencedIn } from './wordMatch.js';
import { findWord } from '../data/words.js';
import { capsuleReadiness } from './readiness.js';

const KNOWN_REPS = 2; // matches the "known" threshold used elsewhere (sm2/readiness)

function isKnown(progress, wordId) {
  const p = progress[wordId];
  return !!p && p.repetitions >= KNOWN_REPS;
}

// A capsule's full vocabulary footprint: its declared target words (what
// it's meant to teach) plus any other vocabulary word its own prose
// references (what it assumes the reader already knows).
export function capsuleVocab(capsule) {
  const targetSet = new Set(capsule.target);
  const prerequisite = wordsReferencedIn(capsule.text)
    .map((w) => w.id)
    .filter((id) => !targetSet.has(id));
  return { target: capsule.target, prerequisite };
}

// Which of a capsule's words the learner hasn't reached "known" on yet,
// split by role — prerequisites need to exist before the capsule's own
// point is comprehensible; targets are exactly what it's there to teach.
export function missingWords(capsule, progress) {
  const { target, prerequisite } = capsuleVocab(capsule);
  return {
    missingPrereq: prerequisite.filter((id) => !isKnown(progress, id)),
    missingTarget: target.filter((id) => !isKnown(progress, id)),
  };
}

// A capsule is "ready" once its prerequisite vocabulary is known — the
// target words don't gate readiness, since teaching them is the capsule's
// whole point.
export function capsuleIsReady(capsule, progress) {
  return missingWords(capsule, progress).missingPrereq.length === 0;
}

// Choose the next capsule to teach: prefer one that's already "ready"
// (no missing prerequisites), breaking ties toward whichever has fewer
// new target words left so progress feels steady. If nothing is fully
// ready yet, fall back to the overall-highest-readiness capsule and let
// its prerequisites be taught as part of reaching it.
export function nextCapsule(capsules, progress, completed = {}) {
  const pending = capsules.filter((c) => !completed[c.id]);
  if (pending.length === 0) return null;
  const ready = pending.filter((c) => capsuleIsReady(c, progress));
  const pool = ready.length ? ready : pending;
  const scored = pool.map((c) => ({
    c,
    newTargets: missingWords(c, progress).missingTarget.length,
    readiness: capsuleReadiness(c, progress),
  }));
  scored.sort((a, b) => (b.readiness - a.readiness) || (a.newTargets - b.newTargets));
  return scored[0].c;
}

/**
 * The actual lesson plan: which capsule comes next, which words (prereqs
 * first, then targets) need teaching before/while presenting it, and how
 * many of those are prerequisites vs. the capsule's own new material.
 * @returns {{capsule: object, teachWords: object[], prerequisiteCount: number}|null}
 */
export function buildLessonPlan(capsules, progress, completed = {}) {
  const capsule = nextCapsule(capsules, progress, completed);
  if (!capsule) return null;
  const { missingPrereq, missingTarget } = missingWords(capsule, progress);
  const teachWords = [...missingPrereq, ...missingTarget].map((id) => findWord(id)).filter(Boolean);
  return { capsule, teachWords, prerequisiteCount: missingPrereq.length };
}
