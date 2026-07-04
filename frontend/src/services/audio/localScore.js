// On-device pronunciation scoring against the static audio database.
//
// Closed-set acoustic comparison: the learner's (silence-trimmed) attempt
// is MFCC-encoded and DTW-aligned against the reference audio for the
// target word AND a handful of similar-sounding distractor words. If the
// attempt is acoustically closest to the target — with a real margin —
// that's a good sign; if a distractor is closer, the attempt probably
// sounded more like that other word.
//
// Honesty note (same spirit as the server-side whisper.cpp scorer): this
// measures similarity to one reference speaker (the Azure neural voice),
// not phoneme correctness. Voice mismatch (pitch, accent, mic) costs some
// accuracy — CMN in the MFCC front-end absorbs part of that. It's a real
// signal, labeled in the UI as on-device analysis.
import { decodeToMono16k, fetchAndDecode } from './decode.js';
import { trimSilence } from './trim.js';
import { mfcc } from './mfcc.js';
import { dtwDistance, dtwAlign } from './dtw.js';
import { staticAudioUrl } from '../tts.js';

const refCache = new Map(); // wordId -> MFCC frames of the trimmed reference

async function referenceFrames(wordId) {
  if (refCache.has(wordId)) return refCache.get(wordId);
  const url = staticAudioUrl(wordId, 'words');
  if (!url) return null;
  const samples = await fetchAndDecode(url);
  const { samples: trimmed } = trimSilence(samples, 16000);
  const frames = mfcc(trimmed);
  refCache.set(wordId, frames);
  return frames;
}

// Which third of the reference word aligned worst, if any one third is
// meaningfully worse than the others — a real signal from the DTW path,
// not a guess. Returns null for words too short to split meaningfully, or
// when the mismatch is spread evenly (nothing specific to call out).
function weakThird(refCosts) {
  const m = refCosts.length;
  if (m < 6) return null;
  const third = Math.floor(m / 3);
  const buckets = [refCosts.slice(0, third), refCosts.slice(third, m - third), refCosts.slice(m - third, m)];
  const avgs = buckets.map((b) => b.reduce((a, c) => a + c, 0) / Math.max(1, b.length));
  const overall = avgs.reduce((a, c) => a + c, 0) / 3;
  if (overall === 0) return null;
  const worstIdx = avgs.indexOf(Math.max(...avgs));
  if (avgs[worstIdx] < overall * 1.2) return null; // not meaningfully worse — don't overclaim precision
  return ['start', 'middle', 'end'][worstIdx];
}

// Rough visual pointer at the weak third, splitting the written word into
// three chunks by character count. Not phoneme-aligned — it's an honest
// approximation ("the beginning of the word"), not IPA-level precision.
function splitThirds(word) {
  const n = word.length;
  const a = Math.round(n / 3);
  const b = Math.round((2 * n) / 3);
  return [word.slice(0, a), word.slice(a, b), word.slice(b)];
}

function scoreFromDistances(targetDist, distractorDists) {
  const minDistractor = Math.min(...distractorDists, Infinity);
  const matched = targetDist <= minDistractor;
  if (matched) {
    // Margin: how much closer to the target than to the nearest distractor.
    const margin = minDistractor === Infinity ? 0.3 : (minDistractor - targetDist) / Math.max(targetDist, 1e-6);
    return { matched: 'target', score: Math.round(Math.min(96, Math.max(55, 62 + margin * 90))) };
  }
  const overshoot = (targetDist - minDistractor) / Math.max(minDistractor, 1e-6);
  return { matched: 'distractor', score: Math.round(Math.min(50, Math.max(8, 45 - overshoot * 60))) };
}

/**
 * @param {Blob} blob recorded attempt
 * @param {object} targetWord WORDS entry
 * @param {object[]} distractors WORDS entries
 * @returns {Promise<{ok:boolean, engine:string, score:number|null, heard:string|null,
 *   matched?:string, trimmedBlob?:Blob, detail?:string}>}
 */
export async function scoreLocally(blob, targetWord, distractors) {
  const raw = await decodeToMono16k(await blob.arrayBuffer());
  const { samples: trimmed, trimmed: didTrim } = trimSilence(raw, 16000);

  if (trimmed.length < 16000 * 0.15) {
    return { ok: true, engine: 'acoustic-dtw', score: null, heard: null, detail: 'The recording was too short or too quiet — try again a little closer to the microphone.' };
  }

  const targetFrames = await referenceFrames(targetWord.id);
  if (!targetFrames) {
    return { ok: true, engine: 'unavailable', score: null, heard: null, detail: 'No reference audio for this word yet.' };
  }

  const attemptFrames = mfcc(trimmed);
  const { distance: targetDist, refCosts } = dtwAlign(attemptFrames, targetFrames);

  const distractorResults = [];
  for (const d of distractors) {
    const frames = await referenceFrames(d.id).catch(() => null);
    if (frames) distractorResults.push({ word: d, dist: dtwDistance(attemptFrames, frames) });
  }

  const { matched, score } = scoreFromDistances(targetDist, distractorResults.map((r) => r.dist));
  const nearest = distractorResults.sort((a, b) => a.dist - b.dist)[0];

  // Point at the roughly weakest third of the TARGET word's shape — only
  // meaningful when the attempt was actually judged against the target and
  // isn't already a clean match.
  let weakSegment = null;
  let segments = null;
  if (matched === 'target' && score < 90) {
    weakSegment = weakThird(refCosts);
    if (weakSegment) segments = splitThirds(targetWord.irish);
  }

  return {
    ok: true,
    engine: 'acoustic-dtw',
    score,
    matched,
    heard: matched === 'target' ? targetWord.irish : (nearest ? nearest.word.irish : null),
    weakSegment,
    segments,
    didTrim,
  };
}
