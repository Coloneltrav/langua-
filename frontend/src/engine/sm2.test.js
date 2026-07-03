import { describe, it, expect } from 'vitest';
import { freshProgress, sm2Update, bumpSkill } from './sm2.js';

describe('sm2Update', () => {
  it('resets repetitions and interval on a failing grade', () => {
    const p = freshProgress();
    p.repetitions = 4;
    p.interval = 30;
    sm2Update(p, 1);
    expect(p.repetitions).toBe(0);
    expect(p.interval).toBe(1);
  });

  it('schedules 1 day then 6 days on the first two successful reviews', () => {
    const p = freshProgress();
    sm2Update(p, 4);
    expect(p.interval).toBe(1);
    expect(p.repetitions).toBe(1);
    sm2Update(p, 4);
    expect(p.interval).toBe(6);
    expect(p.repetitions).toBe(2);
  });

  it('grows the interval geometrically by ease after the third review', () => {
    const p = freshProgress();
    sm2Update(p, 5);
    sm2Update(p, 5);
    const easeAtThird = p.ease;
    sm2Update(p, 5);
    expect(p.interval).toBe(Math.round(6 * easeAtThird));
  });

  it('never lets ease drop below 1.3', () => {
    const p = freshProgress();
    for (let i = 0; i < 20; i++) sm2Update(p, 0);
    expect(p.ease).toBeGreaterThanOrEqual(1.3);
  });
});

describe('bumpSkill', () => {
  it('clamps skill scores to the 0-5 range', () => {
    const p = freshProgress();
    bumpSkill(p, 'recall', 10);
    expect(p.skills.recall).toBe(5);
    bumpSkill(p, 'recall', -20);
    expect(p.skills.recall).toBe(0);
  });
});
