"""Pure scoring logic — no subprocess calls, no whisper.cpp dependency.
Kept isolated from whisper_engine.py so the scoring math is unit-testable
without a compiled binary or a model file (see tests/test_scoring.py).

Honesty note (also surfaced in the README): this combines a closed-set
match against the grammar-constrained decode with a confidence/similarity
signal from a free decode. It is NOT phoneme-level pronunciation
assessment — it estimates "how confidently did the recognizer land on your
target word out of this small candidate set," which is a genuine step up
from the original record-and-self-compare placeholder, but it can't yet
tell you *which sound* was off. See README -> Accuracy & Roadmap.
"""
from __future__ import annotations

import math
from dataclasses import dataclass

TARGET_MATCH_BASE = 65
DISTRACTOR_MATCH_BASE = 20
NO_MATCH_BASE = 0
CONFIDENCE_WEIGHT = 20
SIMILARITY_WEIGHT = 15
DISTRACTOR_SIMILARITY_WEIGHT = 10
NO_MATCH_SIMILARITY_WEIGHT = 20


def normalize(text: str) -> str:
    return text.strip().strip(".").strip().lower()


def match_candidate(heard: str, candidates: list[str]) -> str | None:
    """Maps a raw (possibly space/punctuation-padded) decoder output back
    to the canonical candidate string it corresponds to, if any."""
    normalized_heard = normalize(heard)
    for c in candidates:
        if normalize(c) == normalized_heard:
            return c
    return None


def levenshtein(a: str, b: str) -> int:
    if a == b:
        return 0
    if not a:
        return len(b)
    if not b:
        return len(a)
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        curr = [i] + [0] * len(b)
        for j, cb in enumerate(b, 1):
            cost = 0 if ca == cb else 1
            curr[j] = min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
        prev = curr
    return prev[-1]


def similarity_ratio(a: str, b: str) -> float:
    na, nb = normalize(a), normalize(b)
    if not na and not nb:
        return 1.0
    max_len = max(len(na), len(nb))
    if max_len == 0:
        return 1.0
    return 1.0 - (levenshtein(na, nb) / max_len)


def _clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


@dataclass
class ScoreResult:
    score: int
    matched: str  # "target" | "distractor" | "none"
    heard: str


def score_attempt(
    target_text: str,
    distractor_texts: list[str],
    constrained_heard: str,
    open_text: str | None = None,
    avg_logprob: float | None = None,
) -> ScoreResult:
    candidates = [target_text, *distractor_texts]
    matched_candidate = match_candidate(constrained_heard, candidates)

    if matched_candidate is not None and normalize(matched_candidate) == normalize(target_text):
        matched = "target"
        score = float(TARGET_MATCH_BASE)
        if avg_logprob is not None:
            # avg_logprob is a mean per-token log-probability (<= 0); exp()
            # turns it back into a rough per-token probability in [0, 1].
            confidence = _clamp(math.exp(avg_logprob), 0.0, 1.0)
            score += confidence * CONFIDENCE_WEIGHT
        if open_text is not None:
            score += similarity_ratio(open_text, target_text) * SIMILARITY_WEIGHT
    elif matched_candidate is not None:
        matched = "distractor"
        score = float(DISTRACTOR_MATCH_BASE)
        if open_text is not None:
            score += similarity_ratio(open_text, target_text) * DISTRACTOR_SIMILARITY_WEIGHT
    else:
        matched = "none"
        score = float(NO_MATCH_BASE)
        if open_text is not None:
            score += similarity_ratio(open_text, target_text) * NO_MATCH_SIMILARITY_WEIGHT

    return ScoreResult(score=round(_clamp(score, 0, 100)), matched=matched, heard=constrained_heard.strip())
