// GEOGRAPHY tab. For Irish: the interactive province map, dialect notes,
// Gaeltacht regions, and place-name etymologies. For Spanish: a per-country
// panel (capital, regions, accent notes) with its own country picker,
// since "geography" for a multi-country language means picking which
// country you're looking at — see data/accentsEs.js.
import { irelandMapHtml, provincePanelHtml } from '../components/irelandMap.js';
import { WORDS } from '../../data/words.js';
import { speakWord } from '../../services/tts.js';
import { activePack, activeAccentCode } from '../../data/languagePacks.js';
import { setAccent } from '../packSwitch.js';

let activeProvince = 'connachta';

function irelandGeographyHtml() {
  return `
    <div class="card">
      <div style="font-family:'Cormorant Garamond',serif; font-size:20px; margin-bottom:4px;">Léarscáil — the map</div>
      <div style="font-size:12.5px; color:var(--text-dim); margin-bottom:14px;">Tap a province for its dialect, its Gaeltacht communities, what its place names mean, and the words of its landscape — each one plays real Irish audio.</div>
      ${irelandMapHtml(activeProvince)}
      <div id="provincePanel">${provincePanelHtml(activeProvince)}</div>
    </div>
  `;
}

function spanishGeographyHtml(pack) {
  const accentCode = activeAccentCode();
  const accent = pack.accents[accentCode];
  const countryButtons = pack.accentOrder.map((code) => {
    const a = pack.accents[code];
    return `<button class="btn ${code === accentCode ? '' : 'secondary'}" data-geo-accent="${code}">${a.flag} ${a.country}</button>`;
  }).join('');
  const regions = accent.regions.map((r) => `<span class="chunk-tag mono">${r}</span>`).join(' ');
  const regionalVocab = (pack.regionalVocab[accentCode] || []).map((v) => `
    <div style="margin-top:8px;"><span class="display" style="font-size:17px; color:var(--gold-bright);">${v.term}</span> <span style="font-size:12.5px; color:var(--text-dim);">— ${v.concept} (${v.note})</span></div>
  `).join('');
  return `
    <div class="card">
      <div style="font-family:'Cormorant Garamond',serif; font-size:20px; margin-bottom:4px;">${accent.flag} ${accent.country}</div>
      <div style="font-size:12.5px; color:var(--text-dim); margin-bottom:14px;">Pick a country to change its accent, culture, and vocabulary throughout the app.</div>
      <div class="btn-row" style="flex-wrap:wrap;">${countryButtons}</div>
      <div style="margin-top:16px; font-size:13.5px; line-height:1.7;">${accent.blurb}</div>
      <div style="margin-top:14px; font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">Capital</div>
      <div style="font-size:15px; margin-top:4px;">${accent.capital}</div>
      <div style="margin-top:14px; font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">Regions</div>
      <div style="margin-top:6px; display:flex; flex-wrap:wrap; gap:8px;">${regions}</div>
      <div style="margin-top:14px; font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">Words that differ here</div>
      ${regionalVocab}
    </div>
  `;
}

export function render() {
  const pack = activePack();
  return pack.hasAccents ? spanishGeographyHtml(pack) : irelandGeographyHtml();
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
  main.querySelectorAll('[data-geo-accent]').forEach((btn) => {
    btn.onclick = () => {
      if (btn.dataset.geoAccent === activeAccentCode()) return;
      setAccent(btn.dataset.geoAccent);
      rerender(true);
    };
  });
}
