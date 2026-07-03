"""Loads the shared Blas vocabulary (single source of truth with the
frontend — see shared/vocab.json) so this service can build ASR grammars
and distractor pools from the same word list the learner is studying."""
from __future__ import annotations

import json
import os
from functools import lru_cache
from pathlib import Path


def _resolve_vocab_path() -> Path:
    # 1. Explicit override (used in the Docker image — see Dockerfile).
    env_path = os.environ.get("SHARED_VOCAB_PATH")
    if env_path:
        return Path(env_path)
    # 2. Monorepo layout: services/pronunciation-asr/asr/vocab.py -> ../../../shared
    monorepo_path = Path(__file__).resolve().parents[3] / "shared" / "vocab.json"
    if monorepo_path.exists():
        return monorepo_path
    # 3. A copy placed alongside this service (e.g. COPY'd into the image).
    return Path(__file__).resolve().parents[1] / "shared" / "vocab.json"


SHARED_VOCAB_PATH = _resolve_vocab_path()


@lru_cache(maxsize=1)
def load_vocab() -> list[dict]:
    with open(SHARED_VOCAB_PATH, encoding="utf-8") as f:
        return json.load(f)


@lru_cache(maxsize=1)
def vocab_by_id() -> dict[str, dict]:
    return {w["id"]: w for w in load_vocab()}
