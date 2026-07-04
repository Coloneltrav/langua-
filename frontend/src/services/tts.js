// ---------- TTS ----------
// Three tiers, and the app is honest with the user about which one is
// active (see settings.js):
//
// 1. Static audio database: pre-generated Azure neural audio committed to
//    the repo (currently Irish only — see scripts/generate-audio.mjs).
// 2. Live Azure via the backend, when one is deployed — real neural voices
//    for whatever language/voice id the active pack asks for.
// 3. Browser TTS. For Spanish this is usually a genuine native voice (most
//    platforms ship real es-ES/es-MX/etc voices) — a real fallback, not an
//    approximation. Irish has no real browser voice on virtually any
//    platform, so that path instead reads the phonetic respelling (built
//    for English readers) with an English-ish voice, same as before.
import { apiFetch } from './apiClient.js';
import { state, recordInput } from '../state/store.js';
import { activePack, activeAccentCode } from '../data/languagePacks.js';

const IRISH_APPROX_VOICE_PREFERENCE = [
  'Microsoft Ryan Online (Natural)', 'Microsoft Guy Online (Natural)',
  'Google UK English Male', 'Daniel', 'Microsoft David', 'Alex', 'Fred',
];

let cachedIrishApproxVoice = null;
function pickIrishApproxVoice() {
  if (cachedIrishApproxVoice) return cachedIrishApproxVoice;
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return null;
  const gaVoice = voices.find((v) => v.lang.toLowerCase().startsWith('ga'));
  if (gaVoice) { cachedIrishApproxVoice = gaVoice; return gaVoice; }
  for (const pref of IRISH_APPROX_VOICE_PREFERENCE) {
    const hit = voices.find((v) => v.name.includes(pref));
    if (hit) { cachedIrishApproxVoice = hit; return hit; }
  }
  const anyMale = voices.find((v) => /male/i.test(v.name) && v.lang.startsWith('en'));
  if (anyMale) { cachedIrishApproxVoice = anyMale; return anyMale; }
  const anyEn = voices.find((v) => v.lang.startsWith('en'));
  cachedIrishApproxVoice = anyEn || voices[0];
  return cachedIrishApproxVoice;
}

// A real voice for the given BCP-47-ish locale (e.g. "es-MX"), falling
// back to any voice sharing just the language subtag ("es"), or null.
function pickVoiceForLocale(locale) {
  const voices = speechSynthesis.getVoices();
  if (!voices.length || !locale) return null;
  const exact = voices.find((v) => v.lang.toLowerCase() === locale.toLowerCase());
  if (exact) return exact;
  const lang = locale.split('-')[0].toLowerCase();
  return voices.find((v) => v.lang.toLowerCase().startsWith(lang)) || null;
}

function speakBrowser(text, { voice, lang, rate = 1, pitch = 1 }) {
  if (!('speechSynthesis' in window)) return { ok: false, msg: 'Speech synthesis not supported in this browser.' };
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  if (voice) utter.voice = voice;
  utter.lang = lang;
  utter.rate = rate;
  utter.pitch = pitch;
  speechSynthesis.speak(utter);
  return { ok: true, source: voice ? 'browser-native' : 'browser-approx' };
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

// The static audio database currently only has Irish audio in it — a
// generic `audioDbAvailable()` check would wrongly read as "yes" while a
// Spanish accent is active. Use this wherever a feature (dictation, the
// home voice-status card) actually depends on the *active pack's* words
// having real static audio.
export function audioDbCoversActivePack() {
  return audioDb !== null && activePack().code === 'ga';
}

// Whether the active pack has *some* legitimate audio source right now —
// used to gate features (dictation, Input Flood) that need real
// pronunciation, not the Irish phonetic-respelling-read-by-an-English-voice
// hack. Spanish's browser fallback is a genuine native voice, so it always
// counts; Irish only counts once the static DB or a live Azure backend
// exists.
export function hasRealAudioForActivePack() {
  if (audioDbCoversActivePack() || azureAvailableSync()) return true;
  return activePack().code === 'es';
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
    const audio = new Audio(url);
    audio.addEventListener('ended', () => {
      recordInput('listen', Number.isFinite(audio.duration) ? audio.duration : (kind === 'examples' ? 3 : 1.5));
    }, { once: true });
    await audio.play();
    return { ok: true, source: 'audio-db', duration: audio.duration };
  }
  const text = kind === 'examples' ? word.example_ga : word.irish;
  return speakTargetLanguage(text, kind === 'examples' ? null : word.phonetic);
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

export async function speakTargetLanguage(text, phonetic) {
  if (await checkAzureAvailable()) {
    try {
      return await speakAzure(text); // real spelling -> real neural voice
    } catch (e) {
      console.error('Azure TTS failed, falling back to browser voice:', e);
    }
  }
  const pack = activePack();
  if (pack.code === 'es') {
    // Spanish orthography is phonetic and real Spanish browser voices are
    // common — try the selected country's own locale first, then any
    // Spanish voice, and just read the actual text (no respelling hack).
    const locale = activeAccentCode() || 'es-ES';
    const voice = pickVoiceForLocale(locale);
    return speakBrowser(text, { voice, lang: locale, rate: 1, pitch: 1 });
  }
  // No real browser voice for this pack's language: read the phonetic
  // respelling (written for English readers) with an English-ish voice.
  const approx = phoneticForTTS(phonetic);
  return speakBrowser(approx || text, { voice: pickIrishApproxVoice(), lang: 'en-GB', rate: 0.88, pitch: 0.95 });
}
