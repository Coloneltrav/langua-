import { describe, it, expect } from 'vitest';
import { trimSilence, encodeWav } from './trim.js';
import { mfcc } from './mfcc.js';
import { dtwDistance, dtwAlign } from './dtw.js';

const SR = 16000;

function tone(freq, seconds, amplitude = 0.5) {
  const out = new Float32Array(Math.round(seconds * SR));
  for (let i = 0; i < out.length; i++) out[i] = amplitude * Math.sin((2 * Math.PI * freq * i) / SR);
  return out;
}

function silence(seconds) {
  return new Float32Array(Math.round(seconds * SR));
}

function concat(...arrays) {
  const total = arrays.reduce((a, x) => a + x.length, 0);
  const out = new Float32Array(total);
  let off = 0;
  for (const a of arrays) { out.set(a, off); off += a.length; }
  return out;
}

describe('trimSilence', () => {
  it('cuts leading and trailing silence around speech', () => {
    const signal = concat(silence(1.0), tone(300, 0.6), silence(1.2));
    const { samples, trimmed, startSec, endSec } = trimSilence(signal, SR);
    expect(trimmed).toBe(true);
    // 0.6s of tone + ~150ms start pad + ~320ms end pad (end lag > start lag)
    expect(samples.length / SR).toBeGreaterThan(0.95);
    expect(samples.length / SR).toBeLessThan(1.2);
    expect(startSec).toBeGreaterThan(0.75);
    expect(startSec).toBeLessThan(0.95);
    expect(endSec).toBeGreaterThan(1.8);
    expect(endSec).toBeLessThan(2.0);
  });

  it('rides out a brief silent gap instead of ending speech early (hangover)', () => {
    // A word with a soft middle (e.g. a stop-consonant closure) shouldn't
    // get truncated right at the dip — only sustained silence should end it.
    // The 100ms gap is well under the ~400ms hangover tolerance.
    const signal = concat(silence(0.5), tone(300, 0.3, 0.5), silence(0.1), tone(300, 0.3, 0.5), silence(0.5));
    const { startSec, endSec } = trimSilence(signal, SR);
    expect(endSec - startSec).toBeGreaterThan(0.3 + 0.1 + 0.3);
  });

  it('returns input unchanged when there is nothing to trim', () => {
    const signal = tone(300, 0.5);
    const { samples, trimmed } = trimSilence(signal, SR);
    expect(trimmed).toBe(false);
    expect(samples.length).toBe(signal.length);
  });

  it('handles pure silence without slicing to nothing', () => {
    const signal = silence(1.0);
    const { samples } = trimSilence(signal, SR);
    expect(samples.length).toBe(signal.length);
  });
});

describe('encodeWav', () => {
  it('produces a well-formed 16-bit mono WAV header', async () => {
    const blob = encodeWav(tone(440, 0.1), SR);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const ascii = (off, len) => String.fromCharCode(...bytes.slice(off, off + len));
    expect(ascii(0, 4)).toBe('RIFF');
    expect(ascii(8, 4)).toBe('WAVE');
    const view = new DataView(bytes.buffer);
    expect(view.getUint16(22, true)).toBe(1);      // mono
    expect(view.getUint32(24, true)).toBe(SR);     // sample rate
    expect(view.getUint16(34, true)).toBe(16);     // bit depth
    expect(bytes.length).toBe(44 + Math.round(0.1 * SR) * 2);
  });
});

describe('mfcc', () => {
  it('produces one 12-dim frame per hop', () => {
    const frames = mfcc(tone(300, 0.5), SR);
    // (8000 samples - 400 frame) / 160 hop + 1 = 48 frames
    expect(frames.length).toBe(48);
    expect(frames[0].length).toBe(12);
  });

  it('is CMN-normalized (per-coefficient mean ~ 0)', () => {
    const frames = mfcc(tone(300, 0.5), SR);
    for (let c = 0; c < 12; c++) {
      const mean = frames.reduce((a, f) => a + f[c], 0) / frames.length;
      expect(Math.abs(mean)).toBeLessThan(1e-4);
    }
  });
});

describe('dtwDistance', () => {
  it('is zero for identical sequences', () => {
    const frames = mfcc(tone(300, 0.4), SR);
    expect(dtwDistance(frames, frames)).toBeCloseTo(0, 6);
  });

  it('is robust to speaking-rate differences (same sound, stretched)', () => {
    const short = mfcc(tone(300, 0.3), SR);
    const long = mfcc(tone(300, 0.6), SR);
    const different = mfcc(tone(1200, 0.3), SR);
    expect(dtwDistance(short, long)).toBeLessThan(dtwDistance(short, different));
  });

  it('separates different sounds more than same-sound variants', () => {
    // Two-segment "words": low-high vs high-low vs low-high again
    const a = mfcc(concat(tone(250, 0.2), tone(900, 0.2)), SR);
    const b = mfcc(concat(tone(900, 0.2), tone(250, 0.2)), SR);
    const a2 = mfcc(concat(tone(250, 0.22), tone(900, 0.18)), SR);
    expect(dtwDistance(a, a2)).toBeLessThan(dtwDistance(a, b));
  });

  it('returns Infinity for empty input', () => {
    expect(dtwDistance([], mfcc(tone(300, 0.2), SR))).toBe(Infinity);
  });
});

describe('dtwAlign', () => {
  it('agrees with dtwDistance on the overall distance', () => {
    const a = mfcc(tone(300, 0.4), SR);
    const b = mfcc(tone(320, 0.4), SR);
    const { distance } = dtwAlign(a, b);
    expect(distance).toBeCloseTo(dtwDistance(a, b), 6);
  });

  it('returns one refCost per reference frame', () => {
    const a = mfcc(tone(300, 0.3), SR);
    const b = mfcc(tone(310, 0.5), SR);
    const { refCosts } = dtwAlign(a, b);
    expect(refCosts.length).toBe(b.length);
  });

  it('localizes a mismatch to the reference frames it actually affects', () => {
    // Reference: low tone then high tone. Attempt: low tone twice (the
    // "high" half never happens) — the second half of the reference should
    // carry most of the alignment cost, not the first.
    const ref = mfcc(concat(tone(250, 0.3), tone(1200, 0.3)), SR);
    const attempt = mfcc(concat(tone(250, 0.3), tone(252, 0.3)), SR);
    const { refCosts } = dtwAlign(attempt, ref);
    const half = Math.floor(refCosts.length / 2);
    const firstHalfAvg = refCosts.slice(0, half).reduce((a, c) => a + c, 0) / half;
    const secondHalfAvg = refCosts.slice(half).reduce((a, c) => a + c, 0) / (refCosts.length - half);
    expect(secondHalfAvg).toBeGreaterThan(firstHalfAvg);
  });

  it('returns Infinity distance and empty refCosts for empty input', () => {
    const { distance, refCosts } = dtwAlign([], mfcc(tone(300, 0.2), SR));
    expect(distance).toBe(Infinity);
    expect(refCosts).toEqual([]);
  });
});
