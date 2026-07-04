// Energy-based silence trimming: keeps only the region where the learner
// actually spoke, with a little padding on each side. Pure Float32Array
// math — no browser APIs — so it's unit-testable (see trim.test.js).

const FRAME_MS = 20;
// Asymmetric padding: learners trail off at the end of a word (breathy
// release, soft final consonant) far more often than they're quiet at the
// very start, so the end gets noticeably more slack — this is the "end
// lag" a fixed symmetric pad couldn't give without also over-padding the
// front of every single clip.
const START_PAD_MS = 150;
const END_PAD_MS = 320;
// How long a dip below the low (trailing) threshold is tolerated before we
// decide speech has actually ended, instead of just taking a breath.
const HANGOVER_MS = 400;

function frameRms(samples, start, len) {
  let sum = 0;
  const end = Math.min(start + len, samples.length);
  for (let i = start; i < end; i++) sum += samples[i] * samples[i];
  return Math.sqrt(sum / Math.max(1, end - start));
}

/**
 * @param {Float32Array} samples mono PCM
 * @param {number} sampleRate
 * @returns {{samples: Float32Array, startSec: number, endSec: number, trimmed: boolean}}
 */
export function trimSilence(samples, sampleRate) {
  const frameLen = Math.round((FRAME_MS / 1000) * sampleRate);
  const frameCount = Math.floor(samples.length / frameLen);
  if (frameCount < 3) return { samples, startSec: 0, endSec: samples.length / sampleRate, trimmed: false };

  const rms = new Array(frameCount);
  for (let f = 0; f < frameCount; f++) rms[f] = frameRms(samples, f * frameLen, frameLen);

  // Peak as the 90th percentile rather than the true max: a single click or
  // pop right as recording starts (common with cheap mics/browsers) would
  // otherwise inflate the whole threshold and clip real, quieter speech.
  const sorted = [...rms].sort((a, b) => a - b);
  const noiseFloor = sorted[Math.floor(frameCount / 8)] || 0;
  const peak = sorted[Math.min(frameCount - 1, Math.floor(frameCount * 0.9))] || 0;

  // Two thresholds, hysteresis-style: a confident one to trigger the start
  // of speech, and a much gentler one (plus a hangover window) to keep
  // riding out a trailing consonant or breathy tail instead of clipping it
  // the instant energy dips below the strict threshold.
  const highThreshold = Math.max(noiseFloor * 2.5, peak * 0.06);
  const lowThreshold = highThreshold * 0.35;

  let first = -1;
  let last = -1;
  let silenceRun = 0;
  const hangoverFrames = Math.ceil(HANGOVER_MS / FRAME_MS);
  for (let f = 0; f < frameCount; f++) {
    if (rms[f] >= highThreshold) {
      if (first === -1) first = f;
      last = f;
      silenceRun = 0;
    } else if (first !== -1 && rms[f] >= lowThreshold) {
      last = f;
      silenceRun = 0;
    } else if (first !== -1) {
      silenceRun++;
      if (silenceRun > hangoverFrames) break; // speech has genuinely ended
    }
  }
  if (first === -1) {
    // Nothing above threshold — pure silence/noise; return as-is.
    return { samples, startSec: 0, endSec: samples.length / sampleRate, trimmed: false };
  }

  const startPadFrames = Math.ceil(START_PAD_MS / FRAME_MS);
  const endPadFrames = Math.ceil(END_PAD_MS / FRAME_MS);
  const startFrame = Math.max(0, first - startPadFrames);
  const endFrame = Math.min(frameCount, last + 1 + endPadFrames);
  const start = startFrame * frameLen;
  const end = Math.min(samples.length, endFrame * frameLen);

  return {
    samples: samples.slice(start, end),
    startSec: start / sampleRate,
    endSec: end / sampleRate,
    trimmed: start > 0 || end < samples.length,
  };
}

/** Encode mono float samples as a 16-bit PCM WAV blob (for playback of the trimmed take). */
export function encodeWav(samples, sampleRate) {
  const dataLen = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataLen);
  const view = new DataView(buffer);
  const writeStr = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataLen, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);       // PCM
  view.setUint16(22, 1, true);       // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataLen, true);

  let off = 44;
  for (let i = 0; i < samples.length; i++, off += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: 'audio/wav' });
}
