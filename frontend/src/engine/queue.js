// Pure queries over (words, progress) — kept dependency-free so they're
// trivially testable and reusable outside the UI layer.
export function todayDue(words, progress, now = Date.now()) {
  return words.filter((w) => {
    const p = progress[w.id];
    return p && p.started && p.dueDate <= now;
  });
}

export function newAvailable(words, progress) {
  return words.filter((w) => !progress[w.id]).sort((a, b) => a.freq - b.freq);
}

export function startedWords(words, progress) {
  return words.filter((w) => progress[w.id]);
}

export function knownCount(words, progress) {
  return words.filter((w) => progress[w.id] && progress[w.id].repetitions >= 2).length;
}
