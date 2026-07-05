import { uiState } from './uiState.js';
import { speakWord } from '../services/tts.js';
import { state } from '../state/store.js';
import { activePack, activeAccentCode } from '../data/languagePacks.js';
import { wordPopupHtml, bindWordPopup } from './components/wordPopup.js';

// Decorative header glyphs keyed by pack.theme.motif — abstract, not tied
// to any single language, so a future pack can reuse or replace the id.
const MOTIFS = {
  rings: '<svg class="pack-motif" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><circle cx="12" cy="7.8" r="6.5"/><circle cx="15.64" cy="14.1" r="6.5"/><circle cx="8.36" cy="14.1" r="6.5"/></svg>',
};

import * as home from './views/home.js';
import * as lesson from './views/lesson.js';
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
import * as levelTest from './views/levelTest.js';
import * as settings from './views/settings.js';

const VIEWS = { home, lesson, learn, review, input, vocab, wordDetail, quiz, culture, geography, capsuleDetail, tutor, stats, levelTest, settings };

// Three pillars instead of a flat wall of tabs: Journey is the guided path
// (what to do today), Workshop is practice you choose for yourself, Library
// is reference/exploration + progress. Settings lives outside all three as
// a header icon — it's configuration, not a place you "go" to learn.
const SECTIONS = [
  ['journey', 'Journey'],
  ['workshop', 'Workshop'],
  ['library', 'Library'],
];

// The AI Tutor needs a personal Anthropic key (settings.js) on this
// backend-less static site — hide its tab until one is set up, rather
// than showing a feature that just errors for most visitors.
function sectionTabs(section) {
  const cultureLabel = activePack().cultureTabLabel || 'Culture';
  const tutorReady = !!state.settings.anthropicKey;
  if (section === 'journey') return [['home', 'Overview'], ['lesson', 'Lesson'], ['review', 'Review']];
  if (section === 'workshop') return [['learn', 'New Word'], ['input', 'Input'], ['quiz', 'Listen'], ...(tutorReady ? [['tutor', 'AI Tutor']] : [])];
  return [['culture', cultureLabel], ['geography', 'Geography'], ['vocab', 'Vocabulary'], ['stats', 'Stats']];
}

const ROUTE_SECTION = {
  home: 'journey', lesson: 'journey', review: 'journey',
  learn: 'workshop', input: 'workshop', quiz: 'workshop', tutor: 'workshop',
  culture: 'library', geography: 'library', vocab: 'library', stats: 'library',
  wordDetail: 'library', capsuleDetail: 'library', levelTest: 'library',
};

function activeTabFor(route) {
  if (route === 'wordDetail') return 'vocab';
  if (route === 'capsuleDetail') return 'culture';
  if (route === 'levelTest') return 'stats';
  return route;
}

function currentSection() {
  return ROUTE_SECTION[uiState.route] || null;
}

function renderPillars() {
  const el = document.getElementById('pillars');
  const active = currentSection();
  el.innerHTML = `
    ${SECTIONS.map(([id, label]) => `<button class="${active === id ? 'active' : ''}" data-section="${id}">${label}</button>`).join('')}
    <button class="gear" id="settingsGear" aria-label="Settings" title="Settings">⚙</button>
  `;
  el.querySelectorAll('[data-section]').forEach((b) => {
    b.onclick = () => {
      const [firstRoute] = sectionTabs(b.dataset.section)[0];
      uiState.route = firstRoute;
      uiState.revealAnswer = false;
      uiState.overrideCap = false;
      uiState.quizTarget = null;
      renderRoute();
      renderTabs();
      renderPillars();
    };
  });
  const gear = el.querySelector('#settingsGear');
  gear.classList.toggle('active', uiState.route === 'settings');
  gear.onclick = () => {
    uiState.route = 'settings';
    renderRoute();
    renderTabs();
    renderPillars();
  };
}

function renderTabs() {
  const el = document.getElementById('tabs');
  const section = currentSection();
  if (!section) { el.innerHTML = ''; return; }
  const active = activeTabFor(uiState.route);
  el.innerHTML = sectionTabs(section).map(([id, label]) => `<button class="${active === id ? 'active' : ''}" data-route="${id}">${label}</button>`).join('');
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
  if (uiState.route === 'lesson') return lesson.spokenWord();
  return null;
}

function renderRoute() {
  const main = document.getElementById('main');
  const view = VIEWS[uiState.route];
  main.innerHTML = view.render();
  const rerender = (alsoTabs) => {
    renderRoute();
    if (alsoTabs) { renderTabs(); renderPillars(); }
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
        ${MOTIFS[activePack().getTheme(activeAccentCode())?.motif] || ''}
      </div>
      <div class="tagline">A personal language learning system — no streaks, no ads, just the words.</div>
    </header>
    <nav class="pillars" id="pillars"></nav>
    <nav class="tabs" id="tabs"></nav>
    <main id="main"></main>
    ${wordPopupHtml()}
  `;
  renderPillars();
  renderTabs();
  renderRoute();
  bindWordPopup(() => { renderRoute(); renderTabs(); renderPillars(); });
}

export { renderRoute, renderTabs, renderPillars };
