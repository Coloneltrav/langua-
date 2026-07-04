// Shadowing feedback: after the learner repeats a sentence they just
// heard, compare their (trimmed) take against the reference sentence
// audio — DTW over MFCCs for an acoustic-similarity tier, plus a plain
// duration comparison, which learners can act on immediately ("you're
// rushing / dragging"). Coarser than word scoring on purpose: sentence
// shadowing is about rhythm and flow, so we report tiers, not points.
import { decodeToMono16k, fetchAndDecode } from './decode.js';
import { trimSilence, encodeWav } from './trim.js';
import { mfcc } from './mfcc.js';
import { dtwDistance } from './dtw.js';
import { staticAudioUrl } from '../tts.js';

const refCache = new Map(); // wordId -> {frames, durationSec}

async function sentenceReference(wordId) {
  if (refCache.has(wordId)) return refCache.get(wordId);
  const url = staticAudioUrl(wordId, 'examples');
  if (!url) return null;
  const samples = await fetchAndDecode(url);
  const { samples: trimmed } = trimSilence(samples, 16000);
  const ref = { frames: mfcc(trimmed), durationSec: trimmed.length / 16000 };
  refCache.set(wordId, ref);
  return ref;
}

/**
 * @param {Blob} blob learner's recorded shadow attempt
 * @param {object} word WORDS entry whose example sentence was shadowed
 * @returns {Promise<{ok:boolean, tier?:'strong'|'close'|'keep-practicing',
 *   attemptSec?:number, referenceSec?:number, playbackBlob?:Blob, detail?:string}>}
 */
export async function scoreShadow(blob, word) {
  const ref = await sentenceReference(word.id);
  if (!ref) return { ok: false, detail: 'No reference audio for this sentence.' };

  const raw = await decodeToMono16k(await blob.arrayBuffer());
  const { samples: trimmed } = trimSilence(raw, 16000);
  const attemptSec = trimmed.length / 16000;
  if (attemptSec < 0.3) {
    return { ok: false, detail: 'Too short — try repeating the whole sentence.' };
  }

  const dist = dtwDistance(mfcc(trimmed), ref.frames);
  const durationRatio = attemptSec / ref.durationSec;
  // Distance thresholds are deliberately generous — different voices
  // shadowing the same sentence typically land mid-range.
  let tier = 'keep-practicing';
  if (dist < 5.5 && durationRatio > 0.6 && durationRatio < 1.7) tier = 'strong';
  else if (dist < 7.5) tier = 'close';

  return {
    ok: true,
    tier,
    attemptSec: Math.round(attemptSec * 10) / 10,
    referenceSec: Math.round(ref.durationSec * 10) / 10,
    playbackBlob: encodeWav(trimmed, 16000),
  };
}
