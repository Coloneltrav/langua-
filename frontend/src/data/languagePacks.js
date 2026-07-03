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
  },
};

export const activePackCode = 'ga';

export function activePack() {
  return LANGUAGE_PACKS[activePackCode];
}
