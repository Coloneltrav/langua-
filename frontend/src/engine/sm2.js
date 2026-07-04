// ---------- SM-2 spaced repetition ----------
export function freshProgress() {
  return {
    interval: 0,
    repetitions: 0,
    ease: 2.5,
    dueDate: Date.now(),
    started: true,
    skills: { recognition: 0, listening: 0, pronunciation: 0, recall: 0 },
  };
}

export function sm2Update(p, quality) { // quality 0-5
  if (quality < 3) {
    p.repetitions = 0;
    p.interval = 1;
  } else {
    if (p.repetitions === 0) p.interval = 1;
    else if (p.repetitions === 1) p.interval = 6;
    else p.interval = Math.round(p.interval * p.ease);
    p.repetitions += 1;
  }
  p.ease = Math.max(1.3, p.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  p.dueDate = Date.now() + p.interval * 86400000;
  return p;
}

export function bumpSkill(p, skill, delta) {
  p.skills[skill] = Math.max(0, Math.min(5, (p.skills[skill] || 0) + delta));
}

// Words the learner recognizes but pronounces poorly shouldn't drift into
// month-long intervals — shorten the gap so weak-pronunciation items come
// back sooner for spoken practice. Applied after sm2Update on reviews.
export function adjustForWeakPronunciation(p) {
  if (p.repetitions >= 2 && (p.skills.pronunciation || 0) <= 1 && p.interval > 4) {
    p.interval = Math.max(4, Math.round(p.interval * 0.6));
    p.dueDate = Date.now() + p.interval * 86400000;
  }
  return p;
}
