import { describe, it, expect } from 'vitest';
import { capsuleVocab, missingWords, capsuleIsReady, nextCapsule, buildLessonPlan } from './curriculum.js';

// Real Irish word ids (default active pack, loaded at test time via
// data/words.js) used as fixtures: w1 "tá", w2 "is", w3 "agus", w4 "mé".
const knownProgress = (ids) => Object.fromEntries(ids.map((id) => [id, { repetitions: 3 }]));

describe('capsuleVocab', () => {
  it('finds prerequisite words referenced in the text but not declared as targets', () => {
    const capsule = { id: 'test1', target: ['w3'], text: 'Tá sé go maith — agus mé féin, is maith liom é.' };
    const { target, prerequisite } = capsuleVocab(capsule);
    expect(target).toEqual(['w3']);
    expect(prerequisite).toContain('w1'); // "Tá"
    expect(prerequisite).toContain('w2'); // "is"
    expect(prerequisite).toContain('w4'); // "mé"
    expect(prerequisite).not.toContain('w3'); // declared target, excluded from prerequisites
  });
});

describe('missingWords / capsuleIsReady', () => {
  // "Tá mé go maith." references tá(w1)/mé(w4)/go(w186)/maith(w32) as well
  // as the declared target agus(w3) — the first four are prerequisites.
  const capsule = { id: 'test2', target: ['w3'], text: 'Tá mé go maith.' };

  it('treats an unknown prerequisite as blocking readiness', () => {
    const { missingPrereq, missingTarget } = missingWords(capsule, {});
    expect(missingPrereq.length).toBeGreaterThan(0);
    expect(missingTarget).toEqual(['w3']);
    expect(capsuleIsReady(capsule, {})).toBe(false);
  });

  it('is ready once prerequisites are known, even if the target word itself is still new', () => {
    const progress = knownProgress(['w1', 'w4', 'w186', 'w32']); // tá/mé/go/maith known; agus (target) not
    expect(capsuleIsReady(capsule, progress)).toBe(true);
  });
});

describe('nextCapsule', () => {
  const easy = { id: 'easy', target: ['w3'], text: 'Tá mé go maith.' };
  const hard = { id: 'hard', target: ['w5'], text: 'Tá mé agus tú anseo.' };

  it('prefers a capsule with no missing prerequisites over one that still has them', () => {
    const progress = knownProgress(['w1', 'w4', 'w186', 'w32']); // covers "easy"'s prereqs, not "hard"'s (agus/anseo)
    const chosen = nextCapsule([hard, easy], progress, {});
    expect(chosen.id).toBe('easy');
  });

  it('skips capsules already marked completed', () => {
    const progress = knownProgress(['w1', 'w4']);
    const chosen = nextCapsule([easy], progress, { easy: true });
    expect(chosen).toBe(null);
  });

  it('returns null when every capsule is completed', () => {
    expect(nextCapsule([easy], {}, { easy: true })).toBe(null);
  });
});

describe('buildLessonPlan', () => {
  it('queues prerequisite words before the capsule’s own target word', () => {
    const capsule = { id: 'plan1', target: ['w3'], text: 'Tá mé go maith.' };
    const plan = buildLessonPlan([capsule], {}, {});
    expect(plan.capsule.id).toBe('plan1');
    expect(plan.prerequisiteCount).toBeGreaterThan(0);
    expect(plan.teachWords.length).toBe(plan.prerequisiteCount + 1); // prereqs + the one target
    // last word taught is the capsule's own target
    expect(plan.teachWords[plan.teachWords.length - 1].id).toBe('w3');
  });

  it('returns null when there is nothing left to teach', () => {
    expect(buildLessonPlan([{ id: 'done', target: ['w3'], text: 'x' }], {}, { done: true })).toBe(null);
  });
});
