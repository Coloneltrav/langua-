// GEOGRAPHY tab: the interactive province map, dialect notes, Gaeltacht
// regions, and place-name etymologies. Split out from the Ireland
// (culture capsules) tab so the map has its own home.
import { irelandMapHtml, provincePanelHtml } from '../components/irelandMap.js';
import { WORDS } from '../../data/words.js';
import { speakWord } from '../../services/tts.js';

let activeProvince = 'connachta';

export function render() {
  return `
    <div class="card">
      <div style="font-family:'Cormorant Garamond',serif; font-size:20px; margin-bottom:4px;">Léarscáil — the map</div>
      <div style="font-size:12.5px; color:var(--text-dim); margin-bottom:14px;">Tap a province for its dialect, its Gaeltacht communities, what its place names mean, and the words of its landscape — each one plays real Irish audio.</div>
      ${irelandMapHtml(activeProvince)}
      <div id="provincePanel">${provincePanelHtml(activeProvince)}</div>
    </div>
  `;
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
}
