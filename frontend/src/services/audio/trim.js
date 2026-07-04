// Energy-based silence trimming: keeps only the region where the learner
// actually spoke, with a little padding on each side. Pure Float32Array
// math — no browser APIs — so it's unit-testable (see trim.test.js).

const FRAME_MS = 20;
// Generous padding + a low relative-peak threshold: quiet consonant onsets/
// releases (s, f, t, ch...) sit well below the loudest vowel frame, and
// clipping them costs real scoring accuracy for comparatively little
// silence saved. Better to keep a touch of true silence than cut speech.
const PAD_MS = 220;

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
  let peak = 0;
  for (let f = 0; f < frameCount; f++) {
    rms[f] = frameRms(samples, f * frameLen, frameLen);
    if (rms[f] > peak) peak = rms[f];
  }

  // Noise floor: median of the quietest quarter of frames. Threshold sits
  // well above the floor but well below the peak, so both a quiet room and
  // a noisy one resolve sensibly.
  const sorted = [...rms].sort((a, b) => a - b);
  const noiseFloor = sorted[Math.floor(frameCount / 8)] || 0;
  const threshold = Math.max(noiseFloor * 2.5, peak * 0.05);

  let first = -1;
  let last = -1;
  for (let f = 0; f < frameCount; f++) {
    if (rms[f] >= threshold) {
      if (first === -1) first = f;
      last = f;
    }
  }
  if (first === -1) {
    // Nothing above threshold — pure silence/noise; return as-is.
    return { samples, startSec: 0, endSec: samples.length / sampleRate, trimmed: false };
  }

  const padFrames = Math.ceil(PAD_MS / FRAME_MS);
  const startFrame = Math.max(0, first - padFrames);
  const endFrame = Math.min(frameCount, last + 1 + padFrames);
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
