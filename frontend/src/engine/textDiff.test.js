import { describe, it, expect } from 'vitest';
import { normalizeAnswer, diffAnswer } from './textDiff.js';

describe('normalizeAnswer', () => {
  it('lowercases, strips punctuation, collapses whitespace, keeps fadas', () => {
    expect(normalizeAnswer('  Tá   mé go maith!  ')).toBe('tá mé go maith');
    expect(normalizeAnswer('Dia duit.')).toBe('dia duit');
    expect(normalizeAnswer('SLÁN')).toBe('slán');
  });
});

describe('diffAnswer', () => {
  it('marks a perfect answer correct', () => {
    const { correct, accuracy, ops } = diffAnswer('slán', 'slán');
    expect(correct).toBe(true);
    expect(accuracy).toBe(1);
    expect(ops.every((o) => o.type === 'match')).toBe(true);
  });

  it('flags a missing fada as a substitution', () => {
    const { correct, ops } = diffAnswer('slan', 'slán');
    expect(correct).toBe(false);
    const sub = ops.find((o) => o.type === 'sub');
    expect(sub.answerChar).toBe('á');
    expect(sub.typedChar).toBe('a');
  });

  it('marks missed characters as deletions and extras as insertions', () => {
    const missing = diffAnswer('tá m', 'tá mé');
    expect(missing.ops.filter((o) => o.type === 'del').map((o) => o.answerChar)).toEqual(['é']);

    const extra = diffAnswer('tá mée', 'tá mé');
    expect(extra.ops.filter((o) => o.type === 'ins').map((o) => o.typedChar)).toEqual(['e']);
  });

  it('computes accuracy proportional to edit distance', () => {
    const { accuracy } = diffAnswer('xxxx', 'tá mé'); // nothing right
    expect(accuracy).toBeLessThan(0.3);
    const close = diffAnswer('ta me', 'tá mé'); // two fadas off
    expect(close.accuracy).toBeCloseTo(1 - 2 / 5, 5);
  });

  it('handles empty typed input', () => {
    const { correct, ops } = diffAnswer('', 'tá');
    expect(correct).toBe(false);
    expect(ops.every((o) => o.type === 'del')).toBe(true);
  });
});
