// MFCC feature extraction — the standard front-end for comparing two
// utterances acoustically. Pure math on Float32Arrays (unit-testable, no
// browser APIs, no dependencies). Parameters are the textbook defaults:
// 25ms frames / 10ms hop @16kHz, 26 mel filters, coefficients c1–c12 with
// per-utterance cepstral mean normalization (CMN) so a difference in
// microphone/loudness between the learner and the reference speaker
// doesn't dominate the comparison.

const FRAME_LEN = 400;   // 25ms @ 16k
const HOP = 160;         // 10ms @ 16k
const FFT_SIZE = 512;
const N_MELS = 26;
const N_COEFFS = 12;     // c1..c12 (c0/energy deliberately dropped)
const PREEMPHASIS = 0.97;

function hzToMel(hz) { return 2595 * Math.log10(1 + hz / 700); }
function melToHz(mel) { return 700 * (10 ** (mel / 2595) - 1); }

// Iterative radix-2 FFT (real input, interleaved output magnitudes).
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curRe = 1;
      let curIm = 0;
      for (let k = 0; k < len / 2; k++) {
        const uRe = re[i + k];
        const uIm = im[i + k];
        const vRe = re[i + k + len / 2] * curRe - im[i + k + len / 2] * curIm;
        const vIm = re[i + k + len / 2] * curIm + im[i + k + len / 2] * curRe;
        re[i + k] = uRe + vRe;
        im[i + k] = uIm + vIm;
        re[i + k + len / 2] = uRe - vRe;
        im[i + k + len / 2] = uIm - vIm;
        const nextRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = nextRe;
      }
    }
  }
}

let melFilterbank = null; // [N_MELS][FFT_SIZE/2+1], built once
function buildFilterbank(sampleRate) {
  const nBins = FFT_SIZE / 2 + 1;
  const melLow = hzToMel(0);
  const melHigh = hzToMel(sampleRate / 2);
  const melPoints = [];
  for (let i = 0; i < N_MELS + 2; i++) melPoints.push(melLow + ((melHigh - melLow) * i) / (N_MELS + 1));
  const binOf = (mel) => Math.floor(((FFT_SIZE + 1) * melToHz(mel)) / sampleRate);

  const bank = [];
  for (let m = 1; m <= N_MELS; m++) {
    const filter = new Float32Array(nBins);
    const left = binOf(melPoints[m - 1]);
    const center = binOf(melPoints[m]);
    const right = binOf(melPoints[m + 1]);
    for (let k = left; k < center; k++) if (k >= 0 && k < nBins) filter[k] = (k - left) / Math.max(1, center - left);
    for (let k = center; k < right; k++) if (k >= 0 && k < nBins) filter[k] = (right - k) / Math.max(1, right - center);
    bank.push(filter);
  }
  return bank;
}

const hamming = new Float32Array(FRAME_LEN);
for (let i = 0; i < FRAME_LEN; i++) hamming[i] = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (FRAME_LEN - 1));

/**
 * @param {Float32Array} samples mono PCM @16kHz
 * @param {number} sampleRate
 * @returns {Float32Array[]} one N_COEFFS-length vector per frame, CMN-normalized
 */
export function mfcc(samples, sampleRate = 16000) {
  if (!melFilterbank) melFilterbank = buildFilterbank(sampleRate);
  const nBins = FFT_SIZE / 2 + 1;
  const frames = [];

  for (let start = 0; start + FRAME_LEN <= samples.length; start += HOP) {
    const re = new Float32Array(FFT_SIZE);
    const im = new Float32Array(FFT_SIZE);
    // pre-emphasis + window
    for (let i = 0; i < FRAME_LEN; i++) {
      const s = samples[start + i] - PREEMPHASIS * (i > 0 ? samples[start + i - 1] : 0);
      re[i] = s * hamming[i];
    }
    fft(re, im);

    const power = new Float32Array(nBins);
    for (let k = 0; k < nBins; k++) power[k] = (re[k] * re[k] + im[k] * im[k]) / FFT_SIZE;

    const logMel = new Float32Array(N_MELS);
    for (let m = 0; m < N_MELS; m++) {
      let sum = 0;
      const filter = melFilterbank[m];
      for (let k = 0; k < nBins; k++) sum += power[k] * filter[k];
      logMel[m] = Math.log(Math.max(sum, 1e-10));
    }

    // DCT-II, coefficients 1..N_COEFFS
    const coeffs = new Float32Array(N_COEFFS);
    for (let c = 1; c <= N_COEFFS; c++) {
      let sum = 0;
      for (let m = 0; m < N_MELS; m++) sum += logMel[m] * Math.cos((Math.PI * c * (m + 0.5)) / N_MELS);
      coeffs[c - 1] = sum;
    }
    frames.push(coeffs);
  }

  // Cepstral mean normalization across the utterance.
  if (frames.length > 0) {
    const mean = new Float32Array(N_COEFFS);
    for (const f of frames) for (let c = 0; c < N_COEFFS; c++) mean[c] += f[c];
    for (let c = 0; c < N_COEFFS; c++) mean[c] /= frames.length;
    for (const f of frames) for (let c = 0; c < N_COEFFS; c++) f[c] -= mean[c];
  }
  return frames;
}
