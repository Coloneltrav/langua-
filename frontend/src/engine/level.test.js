import { describe, it, expect } from 'vitest';
import { nextLevel, requirementsFor, currentStats, eligibleForTest, passThreshold, TEST_QUESTION_COUNT } from './level.js';

function freshProg(overrides = {}) {
  return { repetitions: 2, skills: { recognition: 3, listening: 3, pronunciation: 3, recall: 3 }, ...overrides };
}

describe('nextLevel', () => {
  it('returns A1 as the first level when nothing is confirmed', () => {
    expect(nextLevel(null)).toBe('A1');
  });
  it('steps through the ladder in order', () => {
    expect(nextLevel('A1')).toBe('A2');
    expect(nextLevel('A2')).toBe('B1');
  });
  it('returns null past the top level', () => {
    expect(nextLevel('C1')).toBe(null);
  });
});

describe('requirementsFor', () => {
  it('has steeply increasing thresholds', () => {
    const a1 = requirementsFor('A1');
    const a2 = requirementsFor('A2');
    expect(a2.knownWords).toBeGreaterThan(a1.knownWords);
    expect(a2.avgSkill).toBeGreaterThan(a1.avgSkill);
    expect(a2.listenMinutes).toBeGreaterThan(a1.listenMinutes);
  });
});

describe('currentStats', () => {
  it('only counts words with repetitions >= 2 as known', () => {
    const words = [{ id: 'w1' }, { id: 'w2' }, { id: 'w3' }];
    const progress = { w1: freshProg(), w2: freshProg({ repetitions: 1 }), w3: undefined };
    const stats = currentStats(words, progress, { listenSeconds: 600 });
    expect(stats.knownWords).toBe(1);
    expect(stats.listenMinutes).toBe(10);
  });

  it('blends all four skills into one average', () => {
    const words = [{ id: 'w1' }];
    const progress = { w1: freshProg({ skills: { recognition: 4, listening: 2, pronunciation: 2, recall: 4 } }) };
    const stats = currentStats(words, progress, {});
    expect(stats.avgSkill).toBe(3);
  });
});

describe('eligibleForTest', () => {
  it('is false until every requirement is met', () => {
    const stats = { knownWords: 60, avgSkill: 2.0, listenMinutes: 5 }; // listening too low
    expect(eligibleForTest(null, stats)).toBe(false);
  });
  it('is true once all three thresholds for the next level are cleared', () => {
    const stats = { knownWords: 60, avgSkill: 2.0, listenMinutes: 15 };
    expect(eligibleForTest(null, stats)).toBe(true);
  });
  it('is false when already at the top level', () => {
    const stats = { knownWords: 99999, avgSkill: 5, listenMinutes: 99999 };
    expect(eligibleForTest('C1', stats)).toBe(false);
  });
});

describe('passThreshold', () => {
  it('requires at least 85% of questions correct', () => {
    expect(passThreshold()).toBe(Math.ceil(TEST_QUESTION_COUNT * 0.85));
  });
});
