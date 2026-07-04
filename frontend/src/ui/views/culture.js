import { CULTURE_CAPSULES } from '../../data/capsules.js';
import { WORDS } from '../../data/words.js';
import { state } from '../../state/store.js';
import { capsuleReadiness, capsuleNewWordCount } from '../../engine/readiness.js';
import { generateCapsuleRemote } from '../../services/capsuleGen.js';
import { irelandMapHtml, provincePanelHtml } from '../components/irelandMap.js';
import { speakWord } from '../../services/tts.js';
import { uiState } from '../uiState.js';

let activeProvince = 'connachta';

export function render() {
  const all = [...CULTURE_CAPSULES, ...uiState.generatedCapsules];
  const sorted = [...all].sort((a, b) => capsuleReadiness(b, state.progress) - capsuleReadiness(a, state.progress));
  const cards = sorted.map((c) => {
    const r = capsuleReadiness(c, state.progress);
    const newCt = capsuleNewWordCount(c, state.progress);
    const cls = r >= 70 ? 'r-high' : r >= 35 ? 'r-mid' : 'r-low';
    const saved = state.settings.savedCapsules[c.id];
    return `
      <div class="word-list-row" data-capsule-id="${c.id}" style="cursor:pointer; flex-direction:column; align-items:flex-start; gap:6px; padding:14px 0;">
        <div style="display:flex; justify-content:space-between; width:100%;">
          <div class="wi display" style="font-size:19px;">${c.title}</div>
          ${saved ? '<span class="badge known">saved</span>' : ''}
        </div>
        <div class="we">${c.category} · ${c.difficulty} · ${newCt} new word${newCt === 1 ? '' : 's'}</div>
        <span class="readiness-pill ${cls}">${r}% of target words known</span>
      </div>`;
  }).join('');

  const dated = all.filter((c) => c.year != null).sort((a, b) => a.year - b.year);
  const fmtYear = (y) => (y < 0 ? `${Math.abs(y)} BCE` : `${y} CE`);
  const timeline = dated.map((c) => {
    const r = capsuleReadiness(c, state.progress);
    return `
    <div class="word-list-row" data-capsule-id="${c.id}" style="cursor:pointer;">
      <div style="display:flex; align-items:baseline; gap:14px;">
        <div class="mono" style="color:var(--flag-orange); font-size:13px; min-width:74px;">${fmtYear(c.year)}</div>
        <div class="wi display" style="font-size:17px;">${c.title}</div>
      </div>
      <span class="readiness-pill ${r >= 70 ? 'r-high' : r >= 35 ? 'r-mid' : 'r-low'}" style="margin-top:0;">${r}%</span>
    </div>`;
  }).join('');

  return `
    <div class="card">
      <div style="font-family:'Cormorant Garamond',serif; font-size:20px; margin-bottom:4px;">Léarscáil — the map</div>
      <div style="font-size:12.5px; color:var(--text-dim); margin-bottom:14px;">Tap a province for its dialect, its Gaeltacht communities, what its place names mean, and the words of its landscape — each one plays real Irish audio.</div>
      ${irelandMapHtml(activeProvince)}
      <div id="provincePanel">${provincePanelHtml(activeProvince)}</div>
    </div>
    <div class="card">
      <div style="font-family:'Cormorant Garamond',serif; font-size:20px; margin-bottom:4px;">Ireland</div>
      <div style="font-size:12.5px; color:var(--text-dim); margin-bottom:14px;">Small bilingual culture capsules — geography, history, politics, and the Gaeltacht — sorted by how ready you are for each one. Each capsule's Irish target words feed straight into your review queue.</div>
      ${cards}
    </div>
    <div class="card">
      <div style="font-family:'Cormorant Garamond',serif; font-size:18px; margin-bottom:4px;">History timeline</div>
      <div style="font-size:12px; color:var(--text-dim); margin-bottom:10px;">The same capsules, in the order it actually happened — from the Celts to the modern state.</div>
      ${timeline}
    </div>
    <div class="card">
      <div style="font-family:'Cormorant Garamond',serif; font-size:17px; margin-bottom:8px;">Generate a new capsule</div>
      <div style="font-size:12px; color:var(--text-dim); margin-bottom:10px;">AI-generated capsules aren't hand fact-checked the way the ones above are — treat them as a starting point, not ground truth.</div>
      <input type="text" id="capsuleTopicInput" placeholder="e.g. Brigid, the GAA, Irish folklore..." ${uiState.capsuleGenBusy ? 'disabled' : ''}>
      <div class="btn-row"><button class="btn secondary" id="genCapsuleBtn" ${uiState.capsuleGenBusy ? 'disabled' : ''}>${uiState.capsuleGenBusy ? 'Generating…' : '✨ Generate'}</button></div>
    </div>
  `;
}

async function generateCapsule(topic, rerender) {
  uiState.capsuleGenBusy = true;
  rerender();
  const known = WORDS.filter((w) => state.progress[w.id] && state.progress[w.id].repetitions >= 2).map((w) => w.irish);
  try {
    const parsed = await generateCapsuleRemote({ topic, known });
    const targetIds = [];
    (parsed.target_words || []).forEach((tw, i) => {
      const existing = WORDS.find((w) => w.irish.toLowerCase() === tw.irish.toLowerCase());
      if (existing) { targetIds.push(existing.id); return; }
      const id = 'gen' + Date.now() + i;
      WORDS.push({ id, irish: tw.irish, english: tw.english, pos: 'noun', example_ga: parsed.text.match(/[A-Za-zÁÉÍÓÚáéíóú’' ]{5,}\./)?.[0] || tw.irish, example_en: tw.english, chunk: tw.irish, freq: 900 + WORDS.length, phonetic: '—' });
      targetIds.push(id);
    });
    uiState.generatedCapsules.push({
      id: 'gen-' + Date.now(), title: parsed.title, category: parsed.category || 'Generated', difficulty: parsed.difficulty || 'beginner',
      target: targetIds, text: parsed.text, quiz: parsed.quiz, aiGenerated: true,
    });
  } catch (e) {
    alert('Capsule generation failed: ' + e.message);
  }
  uiState.capsuleGenBusy = false;
  rerender();
}

export function bind(main, rerender) {
  main.querySelectorAll('[data-province]').forEach((path) => {
    const select = () => { activeProvince = path.dataset.province; rerender(); };
    path.onclick = select;
    path.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); } };
  });
  main.querySelectorAll('[data-hear-word]').forEach((chip) => {
    chip.onclick = (e) => {
      e.stopPropagation();
      const w = WORDS.find((x) => x.id === chip.dataset.hearWord);
      if (w) speakWord(w).catch((err) => console.error(err));
    };
  });

  main.querySelectorAll('[data-capsule-id]').forEach((row) => {
    row.onclick = () => {
      uiState.activeCapsule = [...CULTURE_CAPSULES, ...uiState.generatedCapsules].find((c) => c.id === row.dataset.capsuleId);
      uiState.capsuleQuizChoice = null;
      uiState.route = 'capsuleDetail';
      rerender(true);
    };
  });
  const genCapsuleBtn = main.querySelector('#genCapsuleBtn');
  if (genCapsuleBtn) genCapsuleBtn.onclick = () => {
    const topic = main.querySelector('#capsuleTopicInput').value.trim();
    if (topic) generateCapsule(topic, rerender);
  };
}
