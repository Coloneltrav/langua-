// INPUT FLOOD — comprehensible input practice.
// Real sentences (the vocabulary's example sentences, with real Irish
// neural audio), served in "i+1" order: sentences whose words you mostly
// already know come first, so everything is *almost* understood — the
// sweet spot where acquisition happens. Flow per sentence:
//   listen (audio only) → reveal Irish → reveal English → shadow it.
// Shadowing records your imitation and compares rhythm + acoustics
// against the reference (services/audio/shadow.js).
import { WORDS } from '../../data/words.js';
import { state, recordInput } from '../../state/store.js';
import { knownWordSet, calcReadiness } from '../../engine/readiness.js';
import { emptyState, linkifyIrish } from '../dom.js';
import { speakWord, audioDbAvailable, staticAudioUrl } from '../../services/tts.js';
import { startRecording, stopRecording, recordingActive } from '../../services/pronunciation.js';
import { uiState } from '../uiState.js';

// Session state (module-local: resets on full reload, survives tab hops)
let queue = [];
let index = 0;
let stage = 'listen'; // listen -> irish -> english
let shadowState = 'idle'; // idle | recording | scoring | done
let shadowResult = null;

function buildQueue() {
  const known = knownWordSet(WORDS, state.progress);
  const pool = WORDS
    .filter((w) => w.example_ga && staticAudioUrl(w.id, 'examples'))
    .map((w) => ({ w, readiness: calcReadiness(w.example_ga, known) }));
  // i+1 ordering: highest readiness first, light shuffle within bands so
  // sessions don't repeat identically.
  pool.sort((a, b) => (b.readiness - a.readiness) || (Math.random() - 0.5));
  return pool;
}

function current() {
  return queue[index] || null;
}

export function render() {
  if (!audioDbAvailable()) {
    return emptyState('Input practice needs the audio database', 'Once the pronunciation audio database is generated for this site, this tab serves real Irish sentences in listen → reveal → shadow flow.');
  }
  if (queue.length === 0) queue = buildQueue();
  const item = current();
  if (!item) return emptyState('No sentences available', 'Add vocabulary with example sentences to shared/vocab.json.');

  const { w, readiness } = item;
  const cls = readiness >= 70 ? 'r-high' : readiness >= 35 ? 'r-mid' : 'r-low';

  const revealBlock = stage === 'listen'
    ? `<div class="word-hero" style="padding:22px 10px;">
         <div style="font-size:15px; color:var(--text-dim);">Listen first — what do you catch?</div>
         <div class="btn-row" style="justify-content:center;">
           <button class="btn" id="playSentence">🔊 Play sentence</button>
           <button class="btn secondary" id="revealIrish">Show the Irish</button>
         </div>
       </div>`
    : `<div class="example-box" style="margin-top:8px;">
         <div class="ga display" style="font-size:22px;">${linkifyIrish(w.example_ga)}</div>
         ${stage === 'english' ? `<div class="en" style="margin-top:8px;">${w.example_en}</div>` : ''}
       </div>
       <div class="btn-row">
         <button class="btn secondary" id="playSentence">🔊 Play again</button>
         ${stage === 'irish' ? '<button class="btn secondary" id="revealEnglish">Show translation</button>' : ''}
       </div>`;

  const shadowBlock = stage !== 'listen' ? `
    <div style="margin-top:18px; font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">Shadow it — play, then repeat immediately</div>
    <div class="btn-row">
      <button class="btn secondary" id="shadowBtn">${shadowState === 'recording' ? '⏹️ Stop' : '🎙️ Shadow this sentence'}</button>
    </div>
    <div id="shadowStatus" style="margin-top:10px;">${shadowState === 'scoring' ? '<span class="loading-dots" style="font-size:13px; color:var(--text-dim);">Comparing</span>' : ''}</div>
    <div id="shadowResult">${shadowResultHtml()}</div>
  ` : '';

  return `
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:baseline;">
        <div style="font-family:'Cormorant Garamond',serif; font-size:20px;">Input flood</div>
        <span class="readiness-pill ${cls}" style="margin-top:0;">${readiness}% known words</span>
      </div>
      <div style="font-size:12.5px; color:var(--text-dim); margin-top:4px;">Sentence ${index + 1} of ${queue.length} · sorted so the most-understandable come first. Key word: <b>${w.irish}</b> (${w.english})</div>
      ${revealBlock}
      ${shadowBlock}
      <div class="btn-row" style="margin-top:20px;">
        <button class="btn" id="nextSentence">Next sentence →</button>
      </div>
    </div>
  `;
}

function shadowResultHtml() {
  if (shadowState !== 'done' || !shadowResult) return '';
  if (!shadowResult.ok) {
    return `<div class="pron-score"><div class="verdict">${shadowResult.detail}</div></div>`;
  }
  const tierCopy = {
    strong: '✓ Strong echo — rhythm and sound track the native audio closely.',
    close: 'Close — the shape is there. One more listen, then match the pace.',
    'keep-practicing': 'Keep practicing — play the sentence again and repeat in smaller pieces.',
  };
  const pace = shadowResult.attemptSec > shadowResult.referenceSec * 1.4
    ? ' You were noticeably slower than the reference — aim to keep up with its pace.'
    : shadowResult.attemptSec < shadowResult.referenceSec * 0.6
      ? ' That was much faster than the reference — you may be dropping sounds.'
      : '';
  return `
    <div class="pron-score">
      <div class="verdict">${tierCopy[shadowResult.tier]}${pace}</div>
      <div class="heard">You: ${shadowResult.attemptSec}s · Reference: ${shadowResult.referenceSec}s</div>
      ${shadowResult.playbackUrl ? `<audio controls src="${shadowResult.playbackUrl}" style="width:100%; margin-top:8px;"></audio>` : ''}
      <span class="engine-tag">on-device acoustic analysis</span>
    </div>
  `;
}

export function bind(main, rerender) {
  const item = current();
  if (!item) return;
  const { w } = item;

  const playBtn = main.querySelector('#playSentence');
  if (playBtn) playBtn.onclick = () => speakWord(w, 'examples').catch((e) => console.error(e));

  const revealIrish = main.querySelector('#revealIrish');
  if (revealIrish) revealIrish.onclick = () => { stage = 'irish'; rerender(); };

  const revealEnglish = main.querySelector('#revealEnglish');
  if (revealEnglish) revealEnglish.onclick = () => { stage = 'english'; rerender(); };

  const shadowBtn = main.querySelector('#shadowBtn');
  if (shadowBtn) shadowBtn.onclick = async () => {
    if (!recordingActive()) {
      try {
        await startRecording();
        shadowState = 'recording';
        shadowResult = null;
        rerender();
      } catch (e) {
        shadowState = 'done';
        shadowResult = { ok: false, detail: `Mic unavailable (${e.message}).` };
        rerender();
      }
      return;
    }
    const blob = await stopRecording();
    shadowState = 'scoring';
    rerender();
    try {
      const { scoreShadow } = await import('../../services/audio/shadow.js');
      const result = await scoreShadow(blob, w);
      if (result.ok && result.playbackBlob) {
        result.playbackUrl = URL.createObjectURL(result.playbackBlob);
      }
      shadowResult = result;
      recordInput('shadow');
    } catch (e) {
      shadowResult = { ok: false, detail: `Couldn't compare (${e.message}).` };
    }
    shadowState = 'done';
    rerender();
  };

  const nextBtn = main.querySelector('#nextSentence');
  if (nextBtn) nextBtn.onclick = () => {
    index = (index + 1) % queue.length;
    stage = 'listen';
    shadowState = 'idle';
    shadowResult = null;
    uiState.lastAutoPlayed = null;
    rerender();
    // Auto-play the new sentence — input mode is ears-first.
    const next = current();
    if (next) setTimeout(() => speakWord(next.w, 'examples').catch(() => {}), 200);
  };
}
