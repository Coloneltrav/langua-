// Vocabulary lives in /shared/vocab.json so the pronunciation-asr service
// (which needs the same Irish text + phonetic respellings to build ASR
// grammars) shares one source of truth with the frontend instead of a
// duplicated copy drifting out of sync.
import rawWords from '../../../shared/vocab.json';

export const WORDS = rawWords;

export function findWord(id) {
  return WORDS.find((w) => w.id === id);
}
