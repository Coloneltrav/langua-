// ---------- PRONUNCIATION RECORDING + SCORING ----------
// Records the learner's attempt, then uploads it to the backend's
// /api/pronunciation/score route, which forwards to the pronunciation-asr
// service (grammar-constrained whisper.cpp — see services/pronunciation-asr).
// If that service isn't reachable, we degrade to record+playback only,
// same as the original prototype, and say so honestly in the UI.
import { apiFetch } from './apiClient.js';
import { WORDS } from '../data/words.js';

let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;
let activeStream = null;

export function recordingActive() {
  return isRecording;
}

// Distractor pool for the closed-set grammar: words that are phonetically
// or orthographically close to the target, so the ASR is discriminating
// between plausible confusions rather than the whole 181-word vocabulary.
export function pickDistractors(targetWord, count = 4) {
  const candidates = WORDS.filter((w) => w.id !== targetWord.id);
  const scored = candidates.map((w) => ({
    w,
    score: phoneticSimilarity(targetWord.phonetic, w.phonetic) + textSimilarity(targetWord.irish, w.irish),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map((s) => s.w);
}

function normalizePhonetic(p) {
  return (p || '').toLowerCase().replace(/[-\s]/g, '');
}

// Levenshtein distance, normalized to a 0-1 similarity. A plain
// same-index character comparison misses similarity when one respelling
// has an extra letter (everything after shifts and stops matching) — edit
// distance catches that, so the distractor pool is actually phonetically
// close rather than just "happens to start the same".
function phoneticSimilarity(a, b) {
  const na = normalizePhonetic(a);
  const nb = normalizePhonetic(b);
  if (!na || !nb) return 0;
  const dp = Array.from({ length: na.length + 1 }, (_, i) => [i, ...Array(nb.length).fill(0)]);
  for (let j = 0; j <= nb.length; j++) dp[0][j] = j;
  for (let i = 1; i <= na.length; i++) {
    for (let j = 1; j <= nb.length; j++) {
      dp[i][j] = na[i - 1] === nb[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  const dist = dp[na.length][nb.length];
  return 1 - dist / Math.max(na.length, nb.length);
}

function textSimilarity(a, b) {
  const na = a.toLowerCase();
  const nb = b.toLowerCase();
  return na[0] === nb[0] ? 0.15 : 0;
}

// Browsers disagree on recording containers: Chrome/Firefox do webm/opus,
// Safari (iPhone!) only mp4/aac. Pick the first supported one, or let the
// browser choose its default rather than throwing NotSupportedError.
const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];

function pickMimeType() {
  if (typeof MediaRecorder.isTypeSupported !== 'function') return undefined;
  return MIME_CANDIDATES.find((t) => MediaRecorder.isTypeSupported(t));
}

export async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  activeStream = stream;
  recordedChunks = [];
  const mimeType = pickMimeType();
  mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data); };
  isRecording = true;
  mediaRecorder.start();
}

export function stopRecording() {
  return new Promise((resolve) => {
    if (!mediaRecorder) return resolve(null);
    mediaRecorder.onstop = () => {
      isRecording = false;
      activeStream?.getTracks().forEach((t) => t.stop());
      const blob = new Blob(recordedChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
      resolve(blob);
    };
    mediaRecorder.stop();
  });
}

/**
 * Score a recorded attempt. Two engines, tried in order:
 *  1. The backend ASR service (grammar-constrained whisper.cpp) when a
 *     backend is deployed — the stronger signal.
 *  2. On-device acoustic comparison (MFCC+DTW against the static audio
 *     database) — works on the free static site with no server at all.
 * @param {Blob} blob - recorded audio (webm/opus)
 * @param {object} targetWord - the WORDS entry the learner was attempting
 */
export async function scorePronunciation(blob, targetWord) {
  const distractors = pickDistractors(targetWord);

  const backendResult = await scoreViaBackend(blob, targetWord, distractors);
  if (backendResult && backendResult.engine !== 'unavailable') return backendResult;

  const { audioDbAvailable } = await import('./tts.js');
  if (audioDbAvailable()) {
    const { scoreLocally } = await import('./audio/localScore.js');
    return scoreLocally(blob, targetWord, distractors);
  }

  return backendResult || {
    ok: true,
    engine: 'unavailable',
    score: null,
    heard: null,
    detail: 'No scoring engine available: neither a backend nor the pronunciation audio database is set up.',
  };
}

async function scoreViaBackend(blob, targetWord, distractors) {
  const form = new FormData();
  // Extension hints the backend's ffmpeg at the container (Safari records mp4)
  form.append('audio', blob, blob.type.includes('mp4') ? 'attempt.mp4' : 'attempt.webm');
  form.append('target_id', targetWord.id);
  form.append('target_irish', targetWord.irish);
  form.append('target_phonetic', targetWord.phonetic || '');
  form.append('distractors', JSON.stringify(distractors.map((d) => ({ id: d.id, irish: d.irish, phonetic: d.phonetic }))));

  try {
    const res = await apiFetch('/api/pronunciation/score', { method: 'POST', body: form });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null; // no backend (static hosting) — caller falls through to local scoring
  }
}
