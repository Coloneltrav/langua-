# pronunciation-asr

Constrained-vocabulary Irish pronunciation scoring for Blas — the real
implementation that replaces the original prototype's "record yourself and
compare by ear" placeholder.

## Why this design

Blas needed automated pronunciation feedback for a low-resource language
with almost no off-the-shelf support:

- **Azure AI Speech Pronunciation Assessment** — the obvious first choice,
  since the app already uses Azure for TTS — does not support `ga-IE`
  (confirmed against Microsoft's current language-support table; there's an
  intake form for unsupported languages, not a working API today).
- **ABAIR/ÉIST**, Trinity College Dublin's dedicated Irish ASR research
  system, is the linguistically "correct" long-term answer, but it's a
  research system without a public production API.
- **Fine-tuning Whisper on Irish speech** is the other real option, but it
  needs a labeled Irish speech corpus, GPU training infrastructure, and
  ongoing MLOps — a substantial project on its own, not something to bolt
  on in one pass.

So the v1 here is the approach that's actually buildable today: **general
multilingual Whisper (via whisper.cpp) with grammar-constrained decoding**.
`whisper.cpp` supports restricting its decoder's output to a GBNF grammar
(the same mechanism behind its published "voice command" demos). Instead of
asking Whisper to freely transcribe Irish — something it's bad at, Irish
being a low-resource language in its training data — we ask a much easier
question: *"which of these ~5 known candidate words does this audio most
resemble?"* That reframing is what makes a general-purpose acoustic model
usable here without any fine-tuning.

## What it actually measures (and doesn't)

This is closed-set word recognition with a confidence signal, **not**
phoneme-level pronunciation assessment. It can tell you "the recognizer
confidently picked your target word out of the candidate set" or "it leaned
toward a different word instead" — a genuine, real automated signal, and a
large step up from self-comparison. It can't yet tell you *which sound* in
the word was off, the way a phoneme-aligned recognizer (or a native
speaker) could.

See `asr/grammar.py` and `asr/scoring.py` for the exact mechanism and the
scoring formula, both documented in-code.

## Architecture

```
POST /score (audio + target word + distractor words)
  -> convert to 16kHz mono WAV (ffmpeg)
  -> build a GBNF grammar from [target, ...distractors]   (asr/grammar.py)
  -> whisper-cli --grammar ...   (closed-set decode)       (asr/whisper_engine.py)
  -> whisper-cli (no grammar)    (open decode, confidence)
  -> combine into a 0-100 score                            (asr/scoring.py)
```

Why shell out to the compiled `whisper-cli` binary instead of a Python
Whisper library: grammar-constrained decoding is a whisper.cpp-specific
C++ feature, not exposed by `openai-whisper` or `faster-whisper`'s Python
APIs. This also keeps the service free of a multi-gigabyte PyTorch/CUDA
dependency chain — after grammar constraint, the actual job is closed-set
classification, which runs fine on CPU.

## Running locally without Docker

You need `ffmpeg`, a built `whisper-cli` binary, and a downloaded ggml
model on your `PATH`/pointed to by env vars:

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt

# Build whisper.cpp once (see Dockerfile for the exact commands), or use a
# package manager build if your platform has one.
export WHISPER_CPP_BIN=/path/to/whisper-cli
export WHISPER_MODEL_PATH=/path/to/ggml-small.bin

uvicorn app:app --reload --port 8000
```

Without those, `/health` returns 503 with a clear message, and `/score`
degrades to `{"engine": "unavailable", "score": null}` rather than
erroring — the backend (and frontend) already handle that path honestly.

## Running via Docker (recommended)

Build from the **repo root** so the image can copy `shared/vocab.json` —
see `docker-compose.yml`, which does this for you:

```bash
docker compose up --build pronunciation-asr
```

The image builds whisper.cpp from source and downloads the `small` ggml
model at build time (~500MB). Swap the model with `MODEL_DIR`/
`WHISPER_MODEL_PATH` + re-running `download_model.sh medium` for better
distractor discrimination at the cost of latency/RAM.

## Tests

`tests/` covers the pure grammar-building and scoring logic — no compiled
binary or model needed to run these:

```bash
pytest
```

`whisper_engine.py`'s subprocess integration itself isn't unit-tested here
(it needs real audio + a real model to exercise meaningfully) — it's
covered by manually exercising `/score` end-to-end via the running Docker
service.

## Roadmap

- **Fine-tune Whisper (or a wav2vec2/CTC model) on Irish speech** —
  Common Voice has a `ga-IE` split; this is the highest-leverage next step
  once there's a labeled dataset and training budget.
- **ABAIR/ÉIST integration** — if TCD ever opens API access, its dialect-
  aware acoustic models are purpose-built for Irish and would likely
  outperform a constrained general model.
- **Phoneme-level feedback** — swap the closed-set classifier for a CTC
  phoneme recognizer and diff against the target's expected phoneme
  sequence, so feedback can say *which* sound was off, not just whether
  the whole word matched.
