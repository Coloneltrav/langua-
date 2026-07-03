# Blas — Irish, from scratch

A personal Irish (Gaeilge) language-learning system: SM-2 spaced repetition,
per-skill mastery tracking, a 181-word vocabulary with phonetic
respellings, a 17-capsule Irish history/geography/politics engine, Azure
`ga-IE` neural TTS with a phonetic-respelling browser fallback, a live AI
tutor via the Anthropic API, and real constrained-vocabulary pronunciation
scoring — no scraping, everything links out to teanglann.ie.

This started as a single-file HTML prototype. This repo is the "proper
project" version: a real frontend/backend split, build tooling, and a
working (if v1) pronunciation-scoring service, in place of the original's
honestly-labeled placeholder ("record yourself and compare by ear").

## Architecture

```
blas/
├── shared/vocab.json        # single source of truth: the 181-word vocabulary
├── frontend/                # Vite + vanilla JS SPA
├── backend/                 # Express API — holds the Anthropic/Azure keys
│                             #   server-side, proxies AI Tutor / capsule
│                             #   generation / TTS, persists progress
└── services/pronunciation-asr/  # FastAPI + whisper.cpp — closed-set
                                  #   pronunciation scoring (optional)
```

**Why split it this way:** the original prototype called `api.anthropic.com`
directly from the browser with no key at all — that only worked inside a
sandboxed preview tool that injected credentials transparently. A real,
self-hostable version can't do that: an Anthropic API key (and an Azure
Speech key, if you want real TTS) must never reach the browser, so a
backend has to sit in front of both. The pronunciation-scoring service is
split out further because its runtime (whisper.cpp compiled from C++, plus
`ffmpeg`) has nothing in common with the Node API server — bundling them
would make the whole backend image carry a heavy build chain for a feature
you might not even want to run locally.

### Frontend (`frontend/`)

Still deliberately "vanilla" — no framework — but now a real Vite project:
ES modules, a `data/` → `engine/` → `state/` → `services/` → `ui/`
layering (pure functions for SM-2 and the readiness engine, testable in
isolation — see `frontend/src/engine/*.test.js`), and a tiny per-view
router instead of one 1600-line file. `npm run dev`, `npm run build`,
`npm test`, `npm run lint`.

### Backend (`backend/`)

Express, holding all third-party credentials:

- `POST /api/tutor`, `POST /api/capsule/generate` — proxy to the Anthropic
  API (`@anthropic-ai/sdk`), server-side key only.
- `GET /api/tts/status`, `POST /api/tts` — proxy to Azure AI Speech
  (`ga-IE-ColmNeural` / `ga-IE-OrlaNeural`), server-side key only.
- `POST /api/pronunciation/score` — proxies the recorded attempt to the
  `pronunciation-asr` service; degrades to `engine:"unavailable"` if that
  service isn't running, rather than failing the request.
- `GET/PUT /api/progress` — single-file JSON persistence (this is a
  personal, single-user app; a database would be over-engineering).
- Optional `BLAS_ACCESS_TOKEN` bearer-token gate on every `/api/*` route —
  turn this on if you host the backend somewhere reachable from the
  internet, since it's spending your Anthropic/Azure credits on every call.
  A basic per-IP rate limiter also guards the two AI-cost endpoints.

### Pronunciation ASR (`services/pronunciation-asr/`)

The interesting new piece — see its own
[README](services/pronunciation-asr/README.md) for the full explanation,
but in short: **Azure's Pronunciation Assessment API doesn't support
`ga-IE`** (checked against Microsoft's current language-support table),
and **ABAIR/ÉIST** (Trinity College Dublin's dedicated Irish ASR project)
has no public API. So v1 here is **whisper.cpp with grammar-constrained
decoding** — forcing a general multilingual Whisper model to classify the
recording as one of ~5 known candidate words instead of freely
transcribing Irish (which it's bad at, being low-resource in Whisper's
training data). This is real, working closed-set recognition with a
genuine confidence score — a real step up from record-and-self-compare —
not yet phoneme-level feedback. That's the documented next step.

## Getting started

### Local dev (no Docker)

```bash
npm install                 # installs frontend + backend workspaces
cp backend/.env.example backend/.env
# fill in ANTHROPIC_API_KEY at minimum; AZURE_SPEECH_KEY is optional
npm run dev                 # runs backend (:8787) + frontend (:5173) together
```

Open http://localhost:5173. Without `AZURE_SPEECH_KEY` set, pronunciation
playback falls back to the browser's approximate voice — the UI says so.
Without the `pronunciation-asr` service running, the pronunciation-score
widget still records and plays back your attempt, and says honestly that
scoring is unavailable.

To run the pronunciation-asr service locally, see its
[README](services/pronunciation-asr/README.md) — it needs a compiled
`whisper.cpp` binary and a downloaded model, which is why Docker is the
easier path for that one piece specifically.

### Docker (all three services)

```bash
cp backend/.env.example .env   # docker-compose reads this at the repo root
docker compose up --build
```

- Frontend: http://localhost:5173 (nginx, proxies `/api` to the backend)
- Backend: http://localhost:8787
- Pronunciation ASR: http://localhost:8000 (builds whisper.cpp from
  source and downloads the `small` ggml model — first build takes a
  while)

## Testing

```bash
npm run test -w frontend          # vitest — SM-2 engine unit tests
cd services/pronunciation-asr && pytest   # grammar + scoring unit tests
```

## Roadmap

- **Fine-tune Whisper on Irish speech** (Common Voice has a `ga-IE`
  split) for real phoneme-level pronunciation feedback, replacing the
  closed-set word classifier.
- **ABAIR/ÉIST integration**, if TCD ever opens API access — their
  dialect-aware acoustic models are purpose-built for Irish.
- **A real graded-reader library** for the Known Vocabulary Engine (Stats
  tab) — currently demoed against two hand-written sample texts.
- **Formal vocabulary validation** against teanglann.ie / Corpas
  Náisiúnta na Gaeilge — the seed data is hand-written with care but not
  yet corpus-verified (see the in-app banner).

## A note on the vocabulary/capsule data

The ~180 seed words and 17 culture capsules in `shared/vocab.json` and
`frontend/src/data/capsules.js` were hand-written carefully but haven't
been formally validated against a reference corpus — the app says so in
its UI banner. Spot-check anything you rely on. Phonetic respellings are
approximations for English readers, not IPA.
