"""Blas pronunciation-asr — constrained-vocabulary Irish ASR scoring.

Replaces the original "record yourself and compare by ear" placeholder
with a real automated score: whisper.cpp's grammar-constrained decoding
(https://github.com/ggml-org/whisper.cpp) forces the recognizer to choose
among the target word plus a handful of distractors, turning a weak
free-form Irish transcriber into a much more reliable closed-set
classifier. See asr/grammar.py and README.md for the full explanation and
known limitations.
"""
from __future__ import annotations

import json
import logging
import os
import random
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.responses import JSONResponse

from asr.grammar import build_grammar
from asr.scoring import score_attempt
from asr.vocab import load_vocab
from asr.whisper_engine import (
    EngineUnavailable,
    check_available,
    convert_to_wav,
    run_constrained,
    run_open,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pronunciation-asr")

app = FastAPI(title="Blas Pronunciation ASR", version="0.1.0")

ENGINE_NAME = "whisper.cpp-grammar-constrained"
DISTRACTOR_COUNT = int(os.environ.get("DISTRACTOR_COUNT", "4"))


@app.get("/health")
def health():
    try:
        check_available()
        return {"ok": True, "engine": ENGINE_NAME}
    except EngineUnavailable as e:
        return JSONResponse(status_code=503, content={"ok": False, "detail": str(e)})


def _fallback_distractors(target_id: str, count: int) -> list[dict]:
    vocab = [w for w in load_vocab() if w["id"] != target_id]
    random.shuffle(vocab)
    return vocab[:count]


@app.post("/score")
async def score(
    audio: UploadFile = File(...),
    target_id: str = Form(""),
    target_irish: str = Form(...),
    target_phonetic: str = Form(""),
    distractors: str = Form("[]"),
):
    try:
        check_available()
    except EngineUnavailable as e:
        return {"ok": True, "engine": "unavailable", "score": None, "heard": None, "detail": str(e)}

    try:
        distractor_list = json.loads(distractors) or []
    except json.JSONDecodeError:
        distractor_list = []
    if not distractor_list:
        distractor_list = _fallback_distractors(target_id, DISTRACTOR_COUNT)
    distractor_texts = [d["irish"] for d in distractor_list if d.get("irish")]

    suffix = Path(audio.filename or "attempt.webm").suffix or ".webm"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(await audio.read())
        raw_path = tmp.name

    wav_path = None
    try:
        wav_path = convert_to_wav(raw_path)
        grammar_text, candidates = build_grammar([target_irish, *distractor_texts])

        heard = run_constrained(wav_path, grammar_text)
        open_result = run_open(wav_path)

        result = score_attempt(
            target_text=target_irish,
            distractor_texts=distractor_texts,
            constrained_heard=heard,
            open_text=open_result.text,
            avg_logprob=open_result.avg_logprob,
        )

        return {
            "ok": True,
            "engine": ENGINE_NAME,
            "score": result.score,
            "matched": result.matched,
            "heard": result.heard or open_result.text or None,
            "candidates": candidates,
        }
    except Exception as e:  # noqa: BLE001 - surface any engine failure as a scoring error, not a 500
        logger.exception("scoring failed")
        return JSONResponse(status_code=502, content={"ok": False, "error": str(e)})
    finally:
        for p in (raw_path, wav_path):
            if p and Path(p).exists():
                Path(p).unlink()
