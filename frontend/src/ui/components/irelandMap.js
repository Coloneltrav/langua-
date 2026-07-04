// Tappable map of Ireland's four provinces with real Gaeltacht markers.
// Shapes and label/dot positions come from data/irelandGeo.js, which is
// generated from real CSO/OSNI administrative boundary data — not
// hand-drawn — so the coastline and province borders are geographically
// accurate. Data in data/provinces.js.
import { PROVINCES } from '../../data/provinces.js';
import { findWord } from '../../data/words.js';
import { linkifyIrish } from '../dom.js';
import { IRELAND_VIEWBOX, IRELAND_SHAPES, IRELAND_LABELS, GAELTACHT_DOTS } from '../../data/irelandGeo.js';

export function irelandMapHtml(activeProvinceId) {
  const paths = PROVINCES.map((p) => `
    <path d="${IRELAND_SHAPES[p.id]}" class="province ${activeProvinceId === p.id ? 'active' : ''}"
          fill-rule="evenodd" data-province="${p.id}" role="button" tabindex="0"
          aria-label="${p.irish} (${p.english})"><title>${p.irish} — ${p.english}</title></path>
  `).join('');
  const dots = GAELTACHT_DOTS.map((g) => `
    <circle cx="${g.x}" cy="${g.y}" r="4" class="gaeltacht-dot"><title>${g.irish} — ${g.english}</title></circle>
  `).join('');
  const labels = PROVINCES.map((p) => {
    const [x, y] = IRELAND_LABELS[p.id];
    return `<text x="${x}" y="${y}" class="province-label ${activeProvinceId === p.id ? 'active' : ''}">${p.english}</text>`;
  }).join('');
  return `
    <svg viewBox="${IRELAND_VIEWBOX}" style="width:100%; max-width:340px; display:block; margin:0 auto;" aria-label="Map of Ireland's four provinces">
      ${paths}
      ${dots}
      ${labels}
    </svg>
    <div style="font-size:11px; color:var(--text-dim); text-align:center; margin-top:4px;">● Gaeltacht (Irish-speaking) regions · tap a province · CSO/OSNI boundary data</div>
  `;
}

export function provincePanelHtml(provinceId) {
  const p = PROVINCES.find((x) => x.id === provinceId);
  if (!p) return '';
  const vocabChips = p.vocab.map((id) => {
    const w = findWord(id);
    return w ? `<button class="chunk-tag mono" data-hear-word="${w.id}" style="cursor:pointer; border:1px solid rgba(201,162,75,0.35); background:none;">🔊 ${w.irish} <span style="opacity:0.6;">— ${w.english}</span></button>` : '';
  }).join('');
  const places = p.places.map((pl) => `<div style="margin-top:6px;"><span class="display" style="font-size:17px;">${pl.irish}</span> <span style="font-size:12.5px; color:var(--text-dim);">· ${pl.english}</span></div>`).join('');
  return `
    <div style="margin-top:16px; border-top:1px solid var(--border); padding-top:14px;">
      <div style="font-family:'Cormorant Garamond',serif; font-size:22px; color:var(--gold-bright);">${p.irish} <span style="font-size:15px; color:var(--text-dim);">· ${p.english}</span></div>
      <div style="font-size:13.5px; line-height:1.65; margin-top:8px;">${linkifyIrish(p.dialect)}</div>
      <div style="font-size:12.5px; color:var(--text-dim); line-height:1.6; margin-top:8px;"><b style="color:var(--text);">Gaeltacht:</b> ${p.gaeltacht}</div>
      <div style="margin-top:10px; font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">Place names</div>
      ${places}
      <div style="margin-top:10px; font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">Words of this landscape</div>
      <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px;">${vocabChips}</div>
    </div>
  `;
}
