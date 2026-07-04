import { apiFetch } from '../services/apiClient.js';

const LOCAL_CACHE_KEY = 'blas-progress-v1';
const SAVE_DEBOUNCE_MS = 500;

export const state = {
  progress: {}, // wordId -> {interval, repetitions, ease, dueDate, skills, started}
  settings: {
    dialect: 'Standard / An Caighdeán',
    dailyNewWordCap: 5,
    newWordsToday: { date: '', count: 0 },
    azureVoice: 'ga-IE-ColmNeural',
    savedCapsules: {},
    voiceCardDismissed: false,
    apiToken: '', // bearer token for the backend, if the deployment requires one
    anthropicKey: '', // device-only Anthropic key for the static build's direct tutor calls
    // Input tracking — research-backed metric: time spent listening/reading
    // for meaning correlates with acquisition more than drill counts do.
    inputStats: { listenPlays: 0, listenSeconds: 0, dictationDone: 0, dictationCorrect: 0, shadowDone: 0 },
  },
};

function readLocalCache() {
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocalCache() {
  try {
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify({ progress: state.progress, settings: state.settings }));
  } catch {
    // localStorage unavailable (private mode, quota) — backend remains source of truth
  }
}

export async function loadProgress() {
  const cached = readLocalCache();
  if (cached) {
    state.progress = cached.progress || {};
    Object.assign(state.settings, cached.settings || {});
  }
  try {
    const res = await apiFetch('/api/progress', { method: 'GET' });
    if (res && res.ok) {
      const data = await res.json();
      state.progress = data.progress || state.progress;
      Object.assign(state.settings, data.settings || {});
      writeLocalCache();
    }
  } catch {
    // Offline or backend unreachable — fall back to the local cache silently.
  }
}

let saveTimer = null;
export function saveProgress() {
  writeLocalCache();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      await apiFetch('/api/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: state.progress, settings: state.settings }),
      });
    } catch {
      // Will retry on the next save; localStorage already has the latest state.
    }
  }, SAVE_DEBOUNCE_MS);
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function newWordsLearnedToday() {
  if (state.settings.newWordsToday.date !== todayKey()) return 0;
  return state.settings.newWordsToday.count;
}

export function recordInput(kind, seconds = 0) {
  const s = state.settings.inputStats;
  if (kind === 'listen') { s.listenPlays += 1; s.listenSeconds += seconds; }
  else if (kind === 'dictation') { s.dictationDone += 1; }
  else if (kind === 'dictationCorrect') { s.dictationCorrect += 1; }
  else if (kind === 'shadow') { s.shadowDone += 1; }
  saveProgress();
}

export function registerNewWordLearned() {
  if (state.settings.newWordsToday.date !== todayKey()) {
    state.settings.newWordsToday = { date: todayKey(), count: 0 };
  }
  state.settings.newWordsToday.count += 1;
}
