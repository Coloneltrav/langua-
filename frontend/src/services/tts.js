// ---------- TTS ----------
// Two tiers, and the app is honest with the user about which one is active:
//
// 1. REAL Irish pronunciation: Azure AI Speech has two purpose-built Irish
//    (ga-IE) neural voices — Colm (male) and Orla (female) — trained on
//    actual Irish speech, not a generic voice guessing at Irish spelling.
//    The Azure key lives server-side (backend/.env) so it's never exposed
//    to the browser; the frontend just asks the backend to synthesize.
// 2. Fallback: the device's browser TTS reading the text with whatever
//    voice is installed (almost never an actual Irish voice). This is an
//    approximation only and is labeled as such in the UI.
import { apiFetch } from './apiClient.js';
import { state } from '../state/store.js';

const VOICE_PREFERENCE = [
  'Microsoft Ryan Online (Natural)', 'Microsoft Guy Online (Natural)',
  'Google UK English Male', 'Daniel', 'Microsoft David', 'Alex', 'Fred',
];

let cachedVoice = null;
function pickBestVoice() {
  if (cachedVoice) return cachedVoice;
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return null;
  const gaVoice = voices.find((v) => v.lang.toLowerCase().startsWith('ga'));
  if (gaVoice) { cachedVoice = gaVoice; return gaVoice; }
  for (const pref of VOICE_PREFERENCE) {
    const hit = voices.find((v) => v.name.includes(pref));
    if (hit) { cachedVoice = hit; return hit; }
  }
  const anyMale = voices.find((v) => /male/i.test(v.name) && v.lang.startsWith('en'));
  if (anyMale) { cachedVoice = anyMale; return anyMale; }
  const anyEn = voices.find((v) => v.lang.startsWith('en'));
  cachedVoice = anyEn || voices[0];
  return cachedVoice;
}

function speakBrowserFallback(text) {
  if (!('speechSynthesis' in window)) return { ok: false, msg: 'Speech synthesis not supported in this browser.' };
  speechSynthesis.cancel();
  const voice = pickBestVoice();
  const utter = new SpeechSynthesisUtterance(text);
  if (voice) utter.voice = voice;
  utter.lang = 'en-GB';
  utter.rate = 0.88;
  utter.pitch = 0.95;
  speechSynthesis.speak(utter);
  return { ok: true, source: 'browser-approx' };
}

// English TTS engines mangle real Irish spelling (e.g. reading "Dia duit"
// with English letter-sound rules). The phonetic respelling was built to
// be read BY an English speaker, so it's a much closer approximation when
// there's no Azure Irish voice available.
function phoneticForTTS(phonetic) {
  if (!phonetic || phonetic === '—') return null;
  return phonetic.toLowerCase().replace(/-/g, ' ');
}

const azureAudioCache = {}; // text -> object URL, session-only

// ---- Static pronunciation audio database ----
// Pre-generated Azure ga-IE neural audio committed to the repo (see
// scripts/generate-audio.mjs + the "Generate pronunciation audio"
// workflow). When present, this is the first-choice playback source:
// real Irish neural audio served as plain files, no key, no server.
let audioDb = null; // manifest from audio/index.json, or null if not generated yet

export async function loadAudioDb() {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}audio/index.json`);
    if (res.ok) audioDb = await res.json();
  } catch {
    audioDb = null;
  }
  return audioDb;
}

export function audioDbAvailable() {
  return audioDb !== null;
}

export function staticAudioUrl(wordId, kind = 'words') {
  if (!audioDb) return null;
  const list = kind === 'examples' ? audioDb.examples : audioDb.words;
  if (!list || !list.includes(wordId)) return null;
  return `${import.meta.env.BASE_URL}audio/${kind}/${wordId}.mp3`;
}

/**
 * Speak a vocabulary word (or its example sentence with kind='examples'):
 * static audio DB first, then live Azure via the backend, then the
 * browser-voice phonetic approximation.
 */
export async function speakWord(word, kind = 'words') {
  const url = staticAudioUrl(word.id, kind);
  if (url) {
    await new Audio(url).play();
    return { ok: true, source: 'audio-db' };
  }
  const text = kind === 'examples' ? word.example_ga : word.irish;
  return speakIrish(text, kind === 'examples' ? null : word.phonetic);
}

let azureAvailable = null; // cached tri-state: null = unknown, true/false once checked
export function azureAvailableSync() {
  return azureAvailable === true;
}
export async function checkAzureAvailable() {
  if (azureAvailable !== null) return azureAvailable;
  try {
    const res = await apiFetch('/api/tts/status');
    const data = await res.json();
    azureAvailable = !!data.configured;
  } catch {
    azureAvailable = false;
  }
  return azureAvailable;
}

async function speakAzure(text) {
  const cacheKey = `${state.settings.azureVoice}::${text}`;
  if (azureAudioCache[cacheKey]) {
    new Audio(azureAudioCache[cacheKey]).play();
    return { ok: true, source: 'azure' };
  }
  const res = await apiFetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice: state.settings.azureVoice }),
  });
  if (!res.ok) throw new Error('Azure TTS request failed: ' + res.status);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  azureAudioCache[cacheKey] = url;
  new Audio(url).play();
  return { ok: true, source: 'azure' };
}

export async function speakIrish(text, phonetic) {
  if (await checkAzureAvailable()) {
    try {
      return await speakAzure(text); // real Irish spelling -> real Irish voice
    } catch (e) {
      console.error('Azure TTS failed, falling back to browser voice:', e);
    }
  }
  // No Azure voice: English TTS reading raw Irish spelling is badly wrong
  // ("Dia duit" read with English rules). Speak the phonetic respelling
  // instead when we have it — it was written for English readers.
  const approx = phoneticForTTS(phonetic);
  return speakBrowserFallback(approx || text);
}

export function teanglannFuaimLink(word) {
  return 'https://www.teanglann.ie/en/fuaim/' + encodeURIComponent(word.split(/\s+/)[0].toLowerCase());
}

export function teanglannDictLink(word) {
  return 'https://www.teanglann.ie/en/fgb/' + encodeURIComponent(word.toLowerCase());
}
