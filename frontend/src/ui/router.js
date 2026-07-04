import { uiState } from './uiState.js';
import { speakWord } from '../services/tts.js';
import { state } from '../state/store.js';
import { activePack } from '../data/languagePacks.js';
import { wordPopupHtml, bindWordPopup } from './components/wordPopup.js';

// Decorative header glyphs keyed by pack.theme.motif — abstract, not tied
// to any single language, so a future pack can reuse or replace the id.
const MOTIFS = {
  rings: '<svg class="pack-motif" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><circle cx="12" cy="7.8" r="6.5"/><circle cx="15.64" cy="14.1" r="6.5"/><circle cx="8.36" cy="14.1" r="6.5"/></svg>',
};

import * as home from './views/home.js';
import * as learn from './views/learn.js';
import * as review from './views/review.js';
import * as vocab from './views/vocab.js';
import * as wordDetail from './views/wordDetail.js';
import * as quiz from './views/quiz.js';
import * as input from './views/input.js';
import * as culture from './views/culture.js';
import * as geography from './views/geography.js';
import * as capsuleDetail from './views/capsuleDetail.js';
import * as tutor from './views/tutor.js';
import * as stats from './views/stats.js';
import * as settings from './views/settings.js';

const VIEWS = { home, learn, review, input, vocab, wordDetail, quiz, culture, geography, capsuleDetail, tutor, stats, settings };

const BASE_TABS = [
  ['home', 'Home'], ['learn', 'New Word'], ['review', 'Review'], ['input', 'Input'], ['quiz', 'Listen'],
  ['culture', 'Ireland'], ['geography', 'Geography'], ['vocab', 'Vocabulary'],
];
// The AI Tutor needs a personal Anthropic key (settings.js) on this
// backend-less static site — hide its tab until one is set up, rather
// than showing a feature that just errors for most visitors.
const TUTOR_TAB = ['tutor', 'AI Tutor'];
const TAIL_TABS = [['stats', 'Stats'], ['settings', 'Settings']];

function currentTabs() {
  const tutorReady = !!state.settings.anthropicKey;
  return [...BASE_TABS, ...(tutorReady ? [TUTOR_TAB] : []), ...TAIL_TABS];
}

function activeTabFor(route) {
  if (route === 'wordDetail') return 'vocab';
  if (route === 'capsuleDetail') return 'culture';
  return route;
}

function renderTabs() {
  const el = document.getElementById('tabs');
  const active = activeTabFor(uiState.route);
  el.innerHTML = currentTabs().map(([id, label]) => `<button class="${active === id ? 'active' : ''}" data-route="${id}">${label}</button>`).join('');
  el.querySelectorAll('button').forEach((b) => {
    b.onclick = () => {
      uiState.route = b.dataset.route;
      uiState.revealAnswer = false;
      uiState.overrideCap = false;
      uiState.quizTarget = null;
      renderRoute();
      renderTabs();
    };
  });
}

function getSpokenWord() {
  if (uiState.route === 'learn' || uiState.route === 'review') return uiState.currentWord;
  if (uiState.route === 'quiz') return uiState.quizTarget;
  if (uiState.route === 'wordDetail') return uiState.detailWord;
  return null;
}

function renderRoute() {
  const main = document.getElementById('main');
  const view = VIEWS[uiState.route];
  main.innerHTML = view.render();
  const rerender = (alsoTabs) => {
    renderRoute();
    if (alsoTabs) renderTabs();
  };
  view.bind(main, rerender);

  // Auto-play the word's pronunciation the moment it appears on screen.
  // The manual "Hear again" / quiz "Hear it" buttons stay for replay.
  const spoken = getSpokenWord();
  if (spoken && spoken.id !== uiState.lastAutoPlayed) {
    uiState.lastAutoPlayed = spoken.id;
    setTimeout(() => speakWord(spoken).catch((e) => console.error(e)), 250);
  }
}

export function renderApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <header class="top">
      <div class="wordmark">
        <span class="cap display">B</span>
        <h1>las</h1>
        ${MOTIFS[activePack().theme?.motif] || ''}
      </div>
      <div class="tagline">A personal Irish learning system — no streaks, no ads, just the words.</div>
    </header>
    <nav class="tabs" id="tabs"></nav>
    <main id="main"></main>
    ${wordPopupHtml()}
  `;
  renderTabs();
  renderRoute();
  bindWordPopup(() => { renderRoute(); renderTabs(); });
}

export { renderRoute, renderTabs };
