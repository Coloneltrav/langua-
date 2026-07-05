import { WORDS } from '../../data/words.js';
import { state } from '../../state/store.js';
import { activePackCode } from '../../data/languagePacks.js';
import { startedWords, knownCount } from '../../engine/queue.js';
import { nextLevel, requirementsFor, currentStats, eligibleForTest } from '../../engine/level.js';
import { uiState } from '../uiState.js';

const SKILLS = [['recognition', 'Recognition'], ['listening', 'Listening'], ['pronunciation', 'Pronunciation'], ['recall', 'Recall']];

function levelCardHtml() {
  const confirmed = state.settings.confirmedLevels[activePackCode()] || null;
  const target = nextLevel(confirmed);
  if (!target) {
    return `
      <div class="card">
        <div style="font-family:'Cormorant Garamond',serif; font-size:19px;">Level</div>
        <div style="font-size:24px; margin-top:6px; color:var(--gold-bright);">${confirmed}</div>
        <div style="font-size:12px; color:var(--text-dim); margin-top:4px;">Top of the current ladder — well done.</div>
      </div>
    `;
  }
  const req = requirementsFor(target);
  const stats = currentStats(WORDS, state.progress, state.settings.inputStats);
  const eligible = eligibleForTest(confirmed, stats);
  const progressRow = (label, have, need) => {
    const pct = Math.min(100, Math.round((have / need) * 100));
    return `
      <div class="skill-bar-row" style="margin-top:8px;">
        <div class="label" style="width:120px;">${label}</div>
        <div class="skill-bar-track"><div class="skill-bar-fill" style="width:${pct}%"></div></div>
        <div style="font-size:11.5px; color:var(--text-dim); width:90px; text-align:right;">${have}/${need}</div>
      </div>`;
  };
  return `
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:baseline;">
        <div style="font-family:'Cormorant Garamond',serif; font-size:19px;">Level</div>
        <div style="font-size:20px; color:var(--gold-bright);">${confirmed || 'Pre-A1'}</div>
      </div>
      <div style="font-size:12px; color:var(--text-dim); margin-top:4px;">Confirmed only by passing an actual test — not just crossing a word count. Progress toward the ${target} test:</div>
      ${progressRow('Known words', stats.knownWords, req.knownWords)}
      ${progressRow('Skill average', stats.avgSkill.toFixed(1), req.avgSkill)}
      ${progressRow('Listening', Math.round(stats.listenMinutes) + 'm', req.listenMinutes + 'm')}
      <div class="btn-row">
        ${eligible
          ? `<button class="btn" id="startLevelTest">Take the ${target} test</button>`
          : `<span style="font-size:12.5px; color:var(--text-dim);">Keep practicing — the test unlocks once all three are met.</span>`}
      </div>
    </div>
  `;
}

export function render() {
  const started = startedWords(WORDS, state.progress);
  const avg = (skill) => {
    if (started.length === 0) return 0;
    const sum = started.reduce((a, w) => a + (state.progress[w.id].skills[skill] || 0), 0);
    return sum / started.length;
  };

  const input = state.settings.inputStats || { listenPlays: 0, listenSeconds: 0, dictationDone: 0, dictationCorrect: 0, shadowDone: 0 };
  const listenMin = input.listenSeconds / 60;
  const dictPct = input.dictationDone ? Math.round((input.dictationCorrect / input.dictationDone) * 100) : null;

  // Coverage by frequency band: how much of the active pack's everyday
  // vocabulary (as sampled by its frequency ordering) the learner already knows.
  const bands = [
    ['Top 50 most frequent', (w) => w.freq <= 50],
    ['51–100', (w) => w.freq > 50 && w.freq <= 100],
    ['101–150', (w) => w.freq > 100 && w.freq <= 150],
    ['Culture & place words', (w) => w.freq >= 500],
  ];
  const coverageRows = bands.map(([label, match]) => {
    const bandWords = WORDS.filter(match);
    const knownInBand = bandWords.filter((w) => state.progress[w.id] && state.progress[w.id].repetitions >= 2).length;
    const pct = bandWords.length ? Math.round((knownInBand / bandWords.length) * 100) : 0;
    return `
      <div class="skill-bar-row" style="margin-top:8px;">
        <div class="label" style="width:150px;">${label}</div>
        <div class="skill-bar-track"><div class="skill-bar-fill" style="width:${pct}%"></div></div>
        <div style="font-size:11.5px; color:var(--text-dim); width:70px; text-align:right;">${knownInBand}/${bandWords.length} · ${pct}%</div>
      </div>`;
  }).join('');

  return `
    <div class="grid2">
      <div class="stat"><div class="n">${started.length}</div><div class="l">words started</div></div>
      <div class="stat"><div class="n">${knownCount(WORDS, state.progress)}</div><div class="l">words known</div></div>
      <div class="stat"><div class="n">${listenMin >= 60 ? (listenMin / 60).toFixed(1) + 'h' : Math.round(listenMin) + 'm'}</div><div class="l">listening input (${input.listenPlays} plays)</div></div>
      <div class="stat"><div class="n">${dictPct === null ? '—' : dictPct + '%'}</div><div class="l">dictation accuracy (${input.dictationDone} tries) · ${input.shadowDone} shadows</div></div>
    </div>
    ${levelCardHtml()}
    <div class="card">
      <div style="font-family:'Cormorant Garamond',serif; font-size:19px; margin-bottom:4px;">Coverage by frequency band</div>
      <div style="font-size:12px; color:var(--text-dim); margin-bottom:6px;">The most frequent words do the most work in real speech — fill the top bands first.</div>
      ${coverageRows}
    </div>
    <div class="card">
      <div style="font-family:'Cormorant Garamond',serif; font-size:19px; margin-bottom:10px;">Skill breakdown (avg. across started words)</div>
      <div class="skill-bars">
        ${SKILLS.map(([k, l]) => `
          <div class="skill-bar-row">
            <div class="label">${l}</div>
            <div class="skill-bar-track"><div class="skill-bar-fill" style="width:${(avg(k) / 5 * 100).toFixed(0)}%"></div></div>
          </div>
        `).join('')}
      </div>
      <div style="font-size:11.5px; color:var(--text-dim); margin-top:10px;">Each skill is tracked independently — you can recognize a word by ear before you can produce it, and this app treats those as separate facts rather than one "mastery" number.</div>
    </div>
  `;
}

export function bind(main, rerender) {
  const startLevelTest = main.querySelector('#startLevelTest');
  if (startLevelTest) startLevelTest.onclick = () => { uiState.route = 'levelTest'; rerender(true); };
}
