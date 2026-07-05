// Central place that actually performs a language-pack (or accent) switch:
// reload the live WORDS/CULTURE_CAPSULES arrays, re-apply the theme, and
// keep the TTS voice in sync with whatever's active. Called once at
// startup (after persisted settings load) and again whenever the user
// changes pack/accent in Settings.
import { reloadActiveWords } from '../data/words.js';
import { reloadActiveCapsules } from '../data/capsules.js';
import { applyTheme } from './theme.js';
import { activePack, activeAccentCode } from '../data/languagePacks.js';
import { state } from '../state/store.js';
import { uiState } from './uiState.js';
import { resetLesson } from './views/lesson.js';

// Any in-flight quiz/word/capsule/lesson reference points at the
// *previous* pack's word ids — clear it rather than risk a stale lookup
// after the swap below.
function clearStaleSelections() {
  uiState.currentWord = null;
  uiState.detailWord = null;
  uiState.quizTarget = null;
  uiState.quizOptions = [];
  uiState.quizChoice = null;
  uiState.activeCapsule = null;
  uiState.capsuleQuizChoice = null;
  resetLesson();
}

function syncVoiceToAccent() {
  const pack = activePack();
  if (pack.hasAccents) {
    const accent = pack.accents[activeAccentCode()];
    if (accent) state.settings.azureVoice = accent.voice.id;
  } else if (pack.azureVoices?.length && !pack.azureVoices.some((v) => v.id === state.settings.azureVoice)) {
    state.settings.azureVoice = pack.azureVoices[0].id;
  }
}

// Re-reads whatever packCode/accentCode is currently in state.settings and
// makes the rest of the app match it — used at startup once persisted
// settings have loaded, since the module-level reloads in words.js/
// capsules.js already ran once against the *default* settings.
export function applyActivePack() {
  reloadActiveWords();
  reloadActiveCapsules();
  applyTheme();
}

export function setPack(packCode) {
  clearStaleSelections();
  state.settings.packCode = packCode;
  const pack = activePack();
  state.settings.accentCode = pack.hasAccents ? (state.settings.accentCode || pack.defaultAccent) : '';
  syncVoiceToAccent();
  applyActivePack();
}

export function setAccent(accentCode) {
  clearStaleSelections();
  state.settings.accentCode = accentCode;
  syncVoiceToAccent();
  applyActivePack();
}
