// LANGUAGE PACK ARCHITECTURE
// Everything country/language-specific lives in a "pack": vocabulary,
// culture capsules, TTS voice config, and dictionary link-builders.
// The learning engine (SM-2, skills, quizzes, readiness, tutor) never
// references Irish directly — it reads from the active pack. Adding
// e.g. Polish later = a new pack object (words + capsules + a pl-PL
// Azure voice + a dictionary URL builder), zero engine changes.
// For now exactly one pack exists and is always active: Gaeilge.
import { WORDS } from './words.js';
import { CULTURE_CAPSULES } from './capsules.js';

export const LANGUAGE_PACKS = {
  ga: {
    code: 'ga',
    name: 'Gaeilge (Irish)',
    country: 'Ireland',
    azureVoices: [
      {id:'ga-IE-ColmNeural', label:'Colm (male)'},
      {id:'ga-IE-OrlaNeural', label:'Orla (female)'},
    ],
    dictName: 'teanglann.ie',
    words: WORDS,
    capsules: CULTURE_CAPSULES,
    // Visual identity for this pack — read by ui/theme.js at startup and
    // written onto :root as CSS custom properties, plus a data-pack
    // attribute for pack-specific decorative CSS (see main.css). A future
    // pack (e.g. Polish/pl) supplies its own palette + flag colors here
    // and the whole app re-skins with zero changes to engine or view code.
    theme: {
      bg: '#0e1712', surface: '#152019', surface2: '#1c2a21', border: '#2a3b2f',
      text: '#eef1e8', textDim: '#93a396', onAccent: '#0e1712',
      accent: '#3fae74', accentBright: '#5fd090', accentDim: '#2c7a52',
      flagOrange: '#d9722c', rubric: '#b1503a',
      flagStripe: ['#3fae74', '#f4f1e8', '#d9722c'], // tricolour, green-white-orange
      motif: 'rings', // decorative header glyph id (ui/theme.js + main.css)
      wordmarkFont: "'Uncial Antiqua', serif",
    },
  },
};

export const activePackCode = 'ga';

export function activePack() {
  return LANGUAGE_PACKS[activePackCode];
}
