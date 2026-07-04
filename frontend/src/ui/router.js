import { uiState } from './uiState.js';
import { speakWord } from '../services/tts.js';

import * as home from './views/home.js';
import * as learn from './views/learn.js';
import * as review from './views/review.js';
import * as vocab from './views/vocab.js';
import * as wordDetail from './views/wordDetail.js';
import * as quiz from './views/quiz.js';
import * as input from './views/input.js';
import * as culture from './views/culture.js';
import * as capsuleDetail from './views/capsuleDetail.js';
import * as tutor from './views/tutor.js';
import * as stats from './views/stats.js';
import * as settings from './views/settings.js';

const VIEWS = { home, learn, review, input, vocab, wordDetail, quiz, culture, capsuleDetail, tutor, stats, settings };

const TABS = [
  ['home', 'Home'], ['learn', 'New Word'], ['review', 'Review'], ['input', 'Input'], ['quiz', 'Listen'],
  ['culture', 'Ireland'], ['vocab', 'Vocabulary'], ['tutor', 'AI Tutor'], ['stats', 'Stats'], ['settings', 'Settings'],
];

function activeTabFor(route) {
  if (route === 'wordDetail') return 'vocab';
  if (route === 'capsuleDetail') return 'culture';
  return route;
}

function renderTabs() {
  const el = document.getElementById('tabs');
  const active = activeTabFor(uiState.route);
  el.innerHTML = TABS.map(([id, label]) => `<button class="${active === id ? 'active' : ''}" data-route="${id}">${label}</button>`).join('');
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
      </div>
      <div class="tagline">A personal Irish learning system — no streaks, no ads, just the words.</div>
    </header>
    <div class="banner"><b>Scaffold notice:</b> the ~180 seed words and culture capsules here were hand-written with care but haven't been formally validated against teanglann.ie or the National Corpus of Irish — spot-check anything you rely on. Phonetic respellings are approximations for English readers, not IPA.</div>
    <nav class="tabs" id="tabs"></nav>
    <main id="main"></main>
  `;
  renderTabs();
  renderRoute();
}

export { renderRoute, renderTabs };
