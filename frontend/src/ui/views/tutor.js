import { WORDS } from '../../data/words.js';
import { state } from '../../state/store.js';
import { knownCount } from '../../engine/queue.js';
import { knownWordSet } from '../../engine/readiness.js';
import { escapeHtml } from '../dom.js';
import { askTutor as askTutorRemote, tutorReadiness } from '../../services/tutor.js';
import { uiState } from '../uiState.js';

export function render() {
  const transcript = uiState.tutorHistory.map((t) => {
    if (t.role === 'user') {
      return `<div class="chat-turn user"><div class="who">You</div><div class="bubble">${escapeHtml(t.text)}</div></div>`;
    }
    return `<div class="chat-turn tutor"><div class="who">Tutor${t.readiness != null ? ` · ${t.readiness}% of tokens already in your known words` : ''}</div><div class="bubble">${escapeHtml(t.text)}</div></div>`;
  }).join('');

  const known = knownCount(WORDS, state.progress);
  return `
    <div class="card">
      <div style="font-family:'Cormorant Garamond',serif; font-size:20px; margin-bottom:6px;">Your tutor</div>
      <div style="font-size:12.5px; color:var(--text-dim); margin-bottom:14px;">
        Knows your ${known} known word${known === 1 ? '' : 's'}. New words it introduces get glossed in parentheses — nothing appears that you can't at least partly decode.
      </div>
      <div class="btn-row">
        <button class="btn secondary" data-prompt="story" ${uiState.tutorBusy ? 'disabled' : ''}>Mini story, known words only</button>
        <button class="btn secondary" data-prompt="grammar" ${uiState.tutorBusy ? 'disabled' : ''}>Explain a grammar point</button>
        <button class="btn secondary" data-prompt="sentences" ${uiState.tutorBusy ? 'disabled' : ''}>Practice sentences</button>
      </div>
      <div id="tutorTranscript">${transcript}</div>
      ${uiState.tutorBusy ? `<div class="tutor-msg loading-dots">Thinking</div>` : ''}
      <div style="margin-top:16px;">
        <label class="field-label">Or ask anything</label>
        <textarea id="tutorInput" rows="2" placeholder="e.g. Use 'is maith liom' in three new sentences" ${uiState.tutorBusy ? 'disabled' : ''}></textarea>
        <div class="btn-row"><button class="btn" id="tutorAsk" ${uiState.tutorBusy ? 'disabled' : ''}>Ask</button></div>
      </div>
    </div>
  `;
}

async function ask(promptText, rerender) {
  if (uiState.tutorBusy) return;
  const known = WORDS.filter((w) => state.progress[w.id] && state.progress[w.id].repetitions >= 2).map((w) => w.irish);
  uiState.tutorHistory.push({ role: 'user', text: promptText });
  uiState.tutorBusy = true;
  rerender();

  const history = uiState.tutorHistory
    .filter((t) => t.role === 'user' || t.role === 'assistant')
    .map((t) => ({ role: t.role, content: t.text }));

  try {
    const { text } = await askTutorRemote({ known, dialect: state.settings.dialect, history, message: promptText });
    const readiness = tutorReadiness(text, knownWordSet(WORDS, state.progress));
    uiState.tutorHistory.push({ role: 'assistant', text, readiness });
  } catch (e) {
    uiState.tutorHistory.push({ role: 'assistant', text: `Couldn't reach the tutor right now. (${e.message})`, readiness: null });
  }
  uiState.tutorBusy = false;
  rerender();
}

export function bind(main, rerender) {
  main.querySelectorAll('[data-prompt]').forEach((b) => {
    b.onclick = () => {
      const map = {
        story: 'Write a very short mini-story for me using only my known words.',
        grammar: 'Pick one small grammar pattern from a sentence I already know and explain it briefly.',
        sentences: 'Give me three short practice sentences using my known words.',
      };
      ask(map[b.dataset.prompt], rerender);
    };
  });
  const tutorAsk = main.querySelector('#tutorAsk');
  if (tutorAsk) tutorAsk.onclick = () => {
    const val = main.querySelector('#tutorInput').value.trim();
    if (val) ask(val, rerender);
  };
}
