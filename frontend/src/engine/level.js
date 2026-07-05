// CEFR-inspired proficiency levels — deliberately hard to reach and gated
// behind an actual test, not a vocabulary-count milestone that inflates
// for free the moment you've tapped through enough flashcards. Real CEFR
// levels describe what you can DO in a language, so this combines three
// signals — words actually retained (SM-2 repetitions ≥ 2, not just
// "seen"), a blended skill average across recognition/listening/
// pronunciation/recall, and real listening time — and even meeting all
// three only unlocks the right to attempt the next level's test, which
// must be passed to actually advance. Language-agnostic: works off
// whatever pack/words are active, no Irish- or Spanish-specific logic.
export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];

const REQUIREMENTS = {
  A1: { knownWords: 60, avgSkill: 2.0, listenMinutes: 15 },
  A2: { knownWords: 250, avgSkill: 3.0, listenMinutes: 90 },
  B1: { knownWords: 600, avgSkill: 3.5, listenMinutes: 300 },
  B2: { knownWords: 1200, avgSkill: 4.0, listenMinutes: 700 },
  C1: { knownWords: 2200, avgSkill: 4.3, listenMinutes: 1500 },
};

const PASS_FRACTION = 0.85; // must get at least this fraction of test questions right
export const TEST_QUESTION_COUNT = 12;

export function nextLevel(confirmedLevel) {
  const idx = confirmedLevel ? LEVELS.indexOf(confirmedLevel) : -1;
  return LEVELS[idx + 1] || null;
}

export function requirementsFor(level) {
  return REQUIREMENTS[level] || null;
}

// The three raw signals a learner's current progress produces, used both
// to check eligibility and to show progress toward it.
export function currentStats(words, progress, inputStats) {
  const known = words.filter((w) => progress[w.id] && progress[w.id].repetitions >= 2);
  const avgSkill = known.length
    ? known.reduce((sum, w) => {
      const s = progress[w.id].skills;
      return sum + ((s.recognition + s.listening + s.pronunciation + s.recall) / 4);
    }, 0) / known.length
    : 0;
  return {
    knownWords: known.length,
    avgSkill,
    listenMinutes: (inputStats?.listenSeconds || 0) / 60,
  };
}

export function eligibleForTest(confirmedLevel, stats) {
  const target = nextLevel(confirmedLevel);
  if (!target) return false;
  const req = REQUIREMENTS[target];
  return stats.knownWords >= req.knownWords && stats.avgSkill >= req.avgSkill && stats.listenMinutes >= req.listenMinutes;
}

export function passThreshold() {
  return Math.ceil(TEST_QUESTION_COUNT * PASS_FRACTION);
}
