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

function phoneticSimilarity(a, b) {
  const na = normalizePhonetic(a);
  const nb = normalizePhonetic(b);
  if (!na || !nb) return 0;
  const len = Math.min(na.length, nb.length);
  let shared = 0;
  for (let i = 0; i < len; i++) if (na[i] === nb[i]) shared++;
  return shared / Math.max(na.length, nb.length);
}

function textSimilarity(a, b) {
  const na = a.toLowerCase();
  const nb = b.toLowerCase();
  return na[0] === nb[0] ? 0.15 : 0;
}

export async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  activeStream = stream;
  recordedChunks = [];
  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
  mediaRecorder = new MediaRecorder(stream, { mimeType });
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
 * Upload a recorded attempt for constrained-vocabulary ASR scoring.
 * @param {Blob} blob - recorded audio (webm/opus)
 * @param {object} targetWord - the WORDS entry the learner was attempting
 * @returns {Promise<{ok:boolean, score?:number, verdict?:string, heard?:string, engine?:string, msg?:string}>}
 */
export async function scorePronunciation(blob, targetWord) {
  const distractors = pickDistractors(targetWord);
  const form = new FormData();
  form.append('audio', blob, 'attempt.webm');
  form.append('target_id', targetWord.id);
  form.append('target_irish', targetWord.irish);
  form.append('target_phonetic', targetWord.phonetic || '');
  form.append('distractors', JSON.stringify(distractors.map((d) => ({ id: d.id, irish: d.irish, phonetic: d.phonetic }))));

  const res = await apiFetch('/api/pronunciation/score', { method: 'POST', body: form });
  if (!res.ok) {
    let msg = `Scoring failed (${res.status})`;
    try { const body = await res.json(); if (body?.error) msg = body.error; } catch { /* not json */ }
    return { ok: false, msg };
  }
  return res.json();
}
