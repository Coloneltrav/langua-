// ---------- KNOWN VOCAB ENGINE ----------
// Demo against hand-built sample texts. In the real system this scores
// against a real graded-reader / dialogue library — sourcing that is a v2
// content task.
export function knownWordSet(words, progress) {
  const s = new Set();
  Object.keys(progress).forEach((id) => {
    const p = progress[id];
    if (p && p.repetitions >= 2) {
      const w = words.find((x) => x.id === id);
      if (w) w.irish.toLowerCase().split(/\s+/).forEach((t) => s.add(t.replace(/[^\wáéíóúÁÉÍÓÚ]/g, '')));
    }
  });
  return s;
}

export function calcReadiness(text, known) {
  const tokens = text.toLowerCase().replace(/[.,!?]/g, '').split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return 0;
  let hit = 0;
  tokens.forEach((t) => { if (known.has(t)) hit++; });
  return Math.round((hit / tokens.length) * 100);
}

export function capsuleReadiness(capsule, progress) {
  const knownCt = capsule.target.filter((id) => progress[id] && progress[id].repetitions >= 2).length;
  return Math.round((knownCt / capsule.target.length) * 100);
}

export function capsuleNewWordCount(capsule, progress) {
  return capsule.target.filter((id) => !progress[id]).length;
}
