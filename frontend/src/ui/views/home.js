// JOURNEY HOME — the cover of the book, not a stats dashboard. Opening the
// app should surface the next Living Encounter (artwork, title, place/time,
// a one-line hook) and a single way to continue it. Review/practice numbers
// still matter, but they're secondary here — that's what Workshop is for.
import { state, saveProgress } from '../../state/store.js';
import { CULTURE_CAPSULES } from '../../data/capsules.js';
import { buildLessonPlan } from '../../engine/curriculum.js';
import { todayDue } from '../../engine/queue.js';
import { WORDS } from '../../data/words.js';
import { encounterVisualHtml } from '../components/encounterVisual.js';
import { azureAvailableSync, audioDbCoversActivePack } from '../../services/tts.js';
import { activePack } from '../../data/languagePacks.js';
import { uiState } from '../uiState.js';

function journeyProgressHtml() {
  const total = CULTURE_CAPSULES.length;
  const done = CULTURE_CAPSULES.filter((c) => state.settings.completedCapsules[c.id]).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return `
    <div style="margin-top:18px;">
      <div style="display:flex; justify-content:space-between; font-size:11.5px; color:var(--text-dim);">
        <span>${done} of ${total} moments explored</span>
        <span>${pct}%</span>
      </div>
      <div class="skill-bar-track" style="margin-top:5px;"><div class="skill-bar-fill" style="width:${pct}%"></div></div>
    </div>
  `;
}

function encounterHeroHtml(c) {
  const e = c.encounter;
  return `
    <div class="card fade-in" style="padding:0; overflow:hidden;">
      ${encounterVisualHtml(e.visual)}
      <div style="padding:24px;">
        <div class="pos mono">${e.observeTitle}</div>
        <div style="font-family:'Cormorant Garamond',serif; font-size:28px; margin:10px 0 12px 0; color:var(--gold-bright); line-height:1.2;">${c.title}</div>
        <div style="font-size:15px; line-height:1.7; color:var(--text);">${e.teaser || ''}</div>
        <div class="btn-row"><button class="btn btn-large" id="continueJourney">Continue the Encounter →</button></div>
        ${journeyProgressHtml()}
      </div>
    </div>
  `;
}

function plainLessonHeroHtml(c) {
  const excerpt = c.text.length > 160 ? c.text.slice(0, 160).trim() + '…' : c.text;
  return `
    <div class="card fade-in">
      <div class="pos mono">${c.category} · ${c.difficulty}</div>
      <div style="font-family:'Cormorant Garamond',serif; font-size:26px; margin:10px 0 12px 0; color:var(--gold-bright); line-height:1.2;">${c.title}</div>
      <div style="font-size:14px; line-height:1.7; color:var(--text-dim);">${excerpt}</div>
      <div class="btn-row"><button class="btn btn-large" id="continueJourney">Continue the Lesson →</button></div>
      ${journeyProgressHtml()}
    </div>
  `;
}

function completeStateHtml() {
  return `
    <div class="card fade-in" style="text-align:center; padding:40px 20px;">
      <div class="glyph display" style="font-size:38px; color:var(--gold); margin-bottom:10px;">✓</div>
      <div style="font-family:'Cormorant Garamond',serif; font-size:22px; margin-bottom:8px;">Every moment explored</div>
      <div style="font-size:13.5px; color:var(--text-dim); line-height:1.6;">You've walked through every capsule this pack has. Deepen what you know in Workshop, or check back once more Encounters are added.</div>
    </div>
  `;
}

function secondaryCardHtml() {
  const due = todayDue(WORDS, state.progress).length;
  const voiceCard = (activePack().code === 'ga' && !audioDbCoversActivePack() && !azureAvailableSync() && !state.settings.voiceCardDismissed) ? `
    <div class="card" style="border-color:var(--flag-orange); margin-top:14px;">
      <div style="font-family:'Cormorant Garamond',serif; font-size:16px; margin-bottom:6px;">🔊 True Irish pronunciation</div>
      <div style="font-size:12.5px; color:var(--text-dim); line-height:1.6;">
        Words are currently spoken with an <b>approximate</b> voice reading a phonetic respelling. Once this site's pronunciation audio database is generated, playback switches to real ga-IE audio automatically.
      </div>
      <div class="btn-row"><button class="btn secondary" id="dismissVoiceCard">Got it</button></div>
    </div>` : '';
  return `
    <div style="margin-top:18px; padding-top:4px; font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">Also waiting</div>
    <div class="card" style="margin-top:8px; padding:16px 20px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div style="font-size:13.5px;">${due > 0 ? `${due} review${due === 1 ? '' : 's'} due` : 'Nothing due for review'}</div>
        ${due > 0 ? `<button class="btn secondary" data-nav="review">Review</button>` : ''}
      </div>
    </div>
    ${voiceCard}
  `;
}

export function render() {
  const plan = buildLessonPlan(CULTURE_CAPSULES, state.progress, state.settings.completedCapsules);
  if (!plan) return completeStateHtml() + secondaryCardHtml();
  const c = plan.capsule;
  const hero = c.encounter ? encounterHeroHtml(c) : plainLessonHeroHtml(c);
  return hero + secondaryCardHtml();
}

export function bind(main, rerender) {
  const continueBtn = main.querySelector('#continueJourney');
  if (continueBtn) continueBtn.onclick = () => {
    uiState.route = 'lesson';
    rerender(true);
  };
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
