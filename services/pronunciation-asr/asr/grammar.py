"""Builds a GBNF grammar restricting whisper.cpp's decoder output to a
small closed set of candidate words/phrases (the target plus a handful of
phonetically/orthographically similar distractors).

This is the core trick that makes "constrained-vocabulary ASR" work without
any fine-tuning: whisper.cpp's grammar-constrained decoding (see
https://github.com/ggml-org/whisper.cpp, `--grammar`) masks every candidate
token at each decoding step to only those consistent with the grammar. A
general-purpose multilingual Whisper model is a weak *free* transcriber of
low-resource Irish, but forcing it to choose the closest match among ~5
known candidates turns the same acoustic model into a much more reliable
closed-set classifier — the same principle behind whisper.cpp's published
"command recognition" grammar demos, applied here to an Irish vocabulary
drill instead of English voice commands.

Caveat we're honest about (see README): this is heuristic string-matching
against Whisper's raw output, not phoneme-level pronunciation assessment.
It tells you "which word did this most resemble," not "which phoneme did
you get wrong." That's the next step on the roadmap (see README ->
Accuracy & Roadmap), likely via a fine-tuned wav2vec2/CTC phoneme
recognizer or ABAIR/ÉIST if TCD ever opens API access.
"""
from __future__ import annotations


def _escape(literal: str) -> str:
    return literal.replace("\\", "\\\\").replace('"', '\\"')


def build_grammar(candidates: list[str]) -> tuple[str, list[str]]:
    """Returns (gbnf_text, canonical_candidate_list).

    Each candidate contributes a few surface-form alternatives to absorb
    Whisper's tendency to prepend a leading space to the first emitted
    word and to append trailing punctuation.
    """
    seen = []
    alternatives = []
    for raw in candidates:
        text = raw.strip()
        if not text or text in seen:
            continue
        seen.append(text)
        variants = {
            text,
            f" {text}",
            f"{text}.",
            f" {text}.",
            text.lower(),
            f" {text.lower()}",
        }
        for v in variants:
            alternatives.append(f'"{_escape(v)}"')

    body = " | ".join(alternatives)
    grammar = f"root ::= ({body})\n"
    return grammar, seen
