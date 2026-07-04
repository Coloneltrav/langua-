// Stylized, tappable map of Ireland's four provinces with Gaeltacht
// markers. Deliberately schematic (clean shapes, not survey-accurate
// coastline) — it's a navigation device for dialect/place/vocab notes,
// not cartography. Data in data/provinces.js.
import { PROVINCES } from '../../data/provinces.js';
import { findWord } from '../../data/words.js';
import { linkifyIrish } from '../dom.js';

// Rough-but-recognizable province shapes on a 320x400 canvas:
// Ulster across the north, Connacht the west, Leinster the east,
// Munster the broad south.
const SHAPES = {
  ulaidh: 'M105,20 Q150,4 200,14 Q252,10 272,40 Q290,70 268,96 Q255,118 220,120 L150,122 Q118,124 100,105 Q78,85 84,55 Q88,32 105,20 Z',
  connachta: 'M84,112 L100,105 Q118,124 150,122 L152,128 L150,225 Q120,238 92,230 Q58,224 44,196 Q30,168 44,144 Q58,118 84,112 Z',
  laighin: 'M152,128 L220,120 Q255,118 262,140 Q278,170 272,205 Q268,240 246,262 Q225,278 196,272 L160,262 Q148,250 150,225 L152,128 Z',
  mumhain: 'M150,225 L160,262 L196,272 Q210,290 196,312 Q170,345 130,352 Q88,358 60,338 Q30,318 36,286 Q40,258 66,242 Q78,232 92,230 Q120,238 150,225 Z',
};

// Gaeltacht communities (approximate positions on the schematic canvas).
const GAELTACHTAI = [
  { x: 112, y: 42, label: 'Dún na nGall (Donegal)' },
  { x: 52, y: 150, label: 'Iorras & Tuar Mhic Éadaigh (Mayo)' },
  { x: 52, y: 196, label: 'Conamara (Connemara)' },
  { x: 205, y: 165, label: 'Ráth Chairn (Meath)' },
  { x: 56, y: 310, label: 'Corca Dhuibhne (Kerry)' },
  { x: 112, y: 336, label: 'Múscraí (Cork)' },
  { x: 218, y: 292, label: 'An Rinn (Waterford)' },
];

export function irelandMapHtml(activeProvinceId) {
  const paths = PROVINCES.map((p) => `
    <path d="${SHAPES[p.id]}" class="province ${activeProvinceId === p.id ? 'active' : ''}"
          data-province="${p.id}" role="button" tabindex="0"
          aria-label="${p.irish} (${p.english})"><title>${p.irish} — ${p.english}</title></path>
  `).join('');
  const dots = GAELTACHTAI.map((g) => `
    <circle cx="${g.x}" cy="${g.y}" r="5" class="gaeltacht-dot"><title>Gaeltacht: ${g.label}</title></circle>
  `).join('');
  const labels = PROVINCES.map((p) => {
    const pos = { ulaidh: [178, 70], connachta: [95, 175], laighin: [210, 200], mumhain: [120, 300] }[p.id];
    return `<text x="${pos[0]}" y="${pos[1]}" class="province-label ${activeProvinceId === p.id ? 'active' : ''}">${p.english}</text>`;
  }).join('');
  return `
    <svg viewBox="0 0 320 400" style="width:100%; max-width:340px; display:block; margin:0 auto;" aria-label="Map of Ireland's four provinces">
      ${paths}
      ${dots}
      ${labels}
    </svg>
    <div style="font-size:11px; color:var(--text-dim); text-align:center; margin-top:4px;">● Gaeltacht (Irish-speaking) communities · tap a province · shapes simplified</div>
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
