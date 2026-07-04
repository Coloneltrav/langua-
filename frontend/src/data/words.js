// The active pack's vocabulary, as a live-swappable array: WORDS keeps the
// same object reference forever (so every existing `import { WORDS }`
// elsewhere keeps working untouched), but its *contents* get replaced
// whenever the active language pack or accent changes. See
// data/languagePacks.js for the pack registry and ui/packSwitch.js for
// where reloadActiveWords() actually gets called.
import { activePack, activeAccentCode } from './languagePacks.js';

export const WORDS = [];

export function reloadActiveWords() {
  const pack = activePack();
  const words = pack.getWords(activeAccentCode());
  WORDS.length = 0;
  WORDS.push(...words);
}
reloadActiveWords();

export function findWord(id) {
  return WORDS.find((w) => w.id === id);
}
