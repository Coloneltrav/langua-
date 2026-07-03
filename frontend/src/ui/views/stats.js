import { WORDS } from '../../data/words.js';
import { SAMPLE_TEXTS } from '../../data/sampleTexts.js';
import { state } from '../../state/store.js';
import { startedWords, knownCount } from '../../engine/queue.js';
import { knownWordSet, calcReadiness } from '../../engine/readiness.js';

const SKILLS = [['recognition', 'Recognition'], ['listening', 'Listening'], ['pronunciation', 'Pronunciation'], ['recall', 'Recall']];

export function render() {
  const started = startedWords(WORDS, state.progress);
  const avg = (skill) => {
    if (started.length === 0) return 0;
    const sum = started.reduce((a, w) => a + (state.progress[w.id].skills[skill] || 0), 0);
    return sum / started.length;
  };
  const known = knownWordSet(WORDS, state.progress);
  const readinessRows = SAMPLE_TEXTS.map((t) => {
    const pct = calcReadiness(t.text, known);
    const cls = pct >= 90 ? 'r-high' : pct >= 70 ? 'r-mid' : 'r-low';
    return `<div style="margin-top:12px;"><div style="font-family:'Cormorant Garamond',serif; font-size:16px;">${t.title}</div><div style="font-size:12.5px; color:var(--text-dim); margin-top:2px;">${t.text}</div><span class="readiness-pill ${cls}">${pct}% known words</span></div>`;
  }).join('');

  return `
    <div class="grid2">
      <div class="stat"><div class="n">${started.length}</div><div class="l">words started</div></div>
      <div class="stat"><div class="n">${knownCount(WORDS, state.progress)}</div><div class="l">words known</div></div>
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
    <div class="card">
      <div style="font-family:'Cormorant Garamond',serif; font-size:19px;">Content readiness (Known Vocabulary Engine)</div>
      <div style="font-size:12.5px; color:var(--text-dim); margin-top:4px;">Demo against two hand-built sample texts. In the real system this scores against a real graded-reader / dialogue library — sourcing that is the v2 content task.</div>
      ${readinessRows}
    </div>
  `;
}

export function bind() {
  // Read-only view — nothing to bind.
}
