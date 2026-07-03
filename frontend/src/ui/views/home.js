import { WORDS } from '../../data/words.js';
import { state, saveProgress } from '../../state/store.js';
import { todayDue, newAvailable, startedWords, knownCount } from '../../engine/queue.js';
import { azureAvailableSync } from '../../services/tts.js';
import { uiState } from '../uiState.js';

export function render() {
  const due = todayDue(WORDS, state.progress).length;
  const fresh = newAvailable(WORDS, state.progress).length;
  const known = knownCount(WORDS, state.progress);
  const started = startedWords(WORDS, state.progress).length;
  const voiceCard = (!azureAvailableSync() && !state.settings.voiceCardDismissed) ? `
    <div class="card" style="border-color:var(--flag-orange);">
      <div style="font-family:'Cormorant Garamond',serif; font-size:18px; margin-bottom:6px;">🔊 True Irish pronunciation</div>
      <div style="font-size:13px; color:var(--text-dim); line-height:1.65;">
        Right now words are spoken with an <b>approximate</b> voice reading the phonetic respelling. For <b>real Irish pronunciation</b> — Microsoft's ga-IE neural voices (Colm/Orla), trained on actual Irish speech — the app operator needs to set an Azure Speech key on the backend once (see backend/.env.example). Nothing for you to do here.
      </div>
      <div class="btn-row">
        <button class="btn secondary" id="dismissVoiceCard">Got it</button>
      </div>
    </div>` : '';
  return `
    ${voiceCard}
    <div class="grid2">
      <div class="stat"><div class="n">${due}</div><div class="l">due for review</div></div>
      <div class="stat"><div class="n">${Math.min(5, fresh)}</div><div class="l">new words ready today</div></div>
      <div class="stat"><div class="n">${known}</div><div class="l">words known (rep ≥ 2)</div></div>
      <div class="stat"><div class="n">${started}</div><div class="l">words started</div></div>
    </div>
    <div class="card">
      <div style="font-family:'Cormorant Garamond',serif; font-size:20px; margin-bottom:8px;">Today's 15 minutes</div>
      <div style="color:var(--text-dim); font-size:13.5px; line-height:1.6;">
        Warm‑up review → 5 new words → pronunciation self‑check → mixed review. That's the whole loop — everything else in this app supports it.
      </div>
      <div class="btn-row">
        ${due > 0 ? `<button class="btn" data-nav="review">Start review (${due})</button>` : ''}
        ${fresh > 0 ? `<button class="btn ${due > 0 ? 'secondary' : ''}" data-nav="learn">Learn new words</button>` : ''}
        ${due === 0 && fresh === 0 ? `<span style="color:var(--text-dim); font-size:13.5px;">All caught up — check back later, or browse the AI Tutor.</span>` : ''}
      </div>
    </div>
  `;
}

export function bind(main, rerender) {
  const dismissVoiceCard = main.querySelector('#dismissVoiceCard');
  if (dismissVoiceCard) dismissVoiceCard.onclick = () => {
    state.settings.voiceCardDismissed = true;
    saveProgress();
    rerender();
  };
  main.querySelectorAll('[data-nav]').forEach((b) => {
    b.onclick = () => {
      uiState.route = b.dataset.nav;
      uiState.revealAnswer = false;
      rerender(true);
    };
  });
}
