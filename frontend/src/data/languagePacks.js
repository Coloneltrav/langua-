// LANGUAGE PACK ARCHITECTURE
// Everything country/language-specific lives in a "pack": vocabulary,
// culture capsules, TTS voice config, theme, and dictionary link-builders.
// The learning engine (SM-2, skills, quizzes, readiness, tutor) never
// references Irish or Spanish directly — it reads whatever the active
// pack (and, for Spanish, the active country accent) hands it through
// data/words.js and data/capsules.js, which hold live-swappable arrays
// (see reloadActiveWords/reloadActiveCapsules). Adding a new language pack
// later means a new entry here — a vocabulary array, capsules, a theme,
// and a voice — with zero engine or view changes.
import rawGaWords from '../../../shared/vocab.json';
import { GA_CAPSULES } from './capsulesGa.js';
import { ES_WORDS } from './vocabEs.js';
import { ES_REGIONAL_WORDS } from './vocabEsRegional.js';
import { ES_CAPSULES } from './capsulesEs.js';
import { ES_ACCENTS, ES_ACCENT_ORDER, ES_DEFAULT_ACCENT, ES_REGIONAL_VOCAB } from './accentsEs.js';
import { state } from '../state/store.js';

const GA_THEME = {
  bg: '#0e1712', surface: '#152019', surface2: '#1c2a21', border: '#2a3b2f',
  text: '#eef1e8', textDim: '#93a396', onAccent: '#0e1712',
  accent: '#3fae74', accentBright: '#5fd090', accentDim: '#2c7a52',
  flagOrange: '#d9722c', rubric: '#b1503a',
  flagStripe: ['#3fae74', '#f4f1e8', '#d9722c'], // tricolour, green-white-orange
  motif: 'rings', // decorative header glyph id (ui/theme.js + main.css)
  wordmarkFont: "'Uncial Antiqua', serif",
};

export const LANGUAGE_PACKS = {
  ga: {
    code: 'ga',
    name: 'Gaeilge (Irish)',
    country: 'Ireland',
    cultureTabLabel: 'Ireland',
    hasAccents: false,
    dictName: 'teanglann.ie',
    dictLink: (word) => `https://www.teanglann.ie/en/fgb/${encodeURIComponent(word.toLowerCase())}`,
    fuaimLink: (word) => `https://www.teanglann.ie/en/fuaim/${encodeURIComponent(word.split(/\s+/)[0].toLowerCase())}`,
    azureVoices: [
      {id:'ga-IE-ColmNeural', label:'Colm (male)'},
      {id:'ga-IE-OrlaNeural', label:'Orla (female)'},
    ],
    getWords: () => rawGaWords,
    getCapsules: () => GA_CAPSULES,
    getTheme: () => GA_THEME,
  },
  es: {
    code: 'es',
    name: 'Español (Spanish)',
    country: 'multiple',
    cultureTabLabel: 'Cultura',
    hasAccents: true,
    accents: ES_ACCENTS,
    accentOrder: ES_ACCENT_ORDER,
    defaultAccent: ES_DEFAULT_ACCENT,
    regionalVocab: ES_REGIONAL_VOCAB,
    dictName: 'WordReference',
    dictLink: (word) => `https://www.wordreference.com/es/en/translation.asp?spen=${encodeURIComponent(word.toLowerCase())}`,
    fuaimLink: null, // no single native-speaker audio site we can link reliably per country
    // Every accent shares the core list, plus a handful of words that
    // genuinely only exist (or only mean this) in that country — so
    // switching country changes what you're taught, not just how it sounds.
    getWords: (accentCode) => [...ES_WORDS, ...(ES_REGIONAL_WORDS[accentCode] || [])],
    getCapsules: (accentCode) => ES_CAPSULES.filter((c) => !c.country || c.country === accentCode),
    getTheme: (accentCode) => (ES_ACCENTS[accentCode] || ES_ACCENTS[ES_DEFAULT_ACCENT]).theme,
  },
};

export function getPack(code) {
  return LANGUAGE_PACKS[code] || LANGUAGE_PACKS.ga;
}

export function activePackCode() {
  return state.settings.packCode || 'ga';
}

export function activePack() {
  return getPack(activePackCode());
}

// null for packs without a country/accent system (e.g. ga).
export function activeAccentCode() {
  const pack = activePack();
  if (!pack.hasAccents) return null;
  return state.settings.accentCode || pack.defaultAccent;
}

export function activeAccent() {
  const pack = activePack();
  if (!pack.hasAccents) return null;
  return pack.accents[activeAccentCode()] || pack.accents[pack.defaultAccent];
}
