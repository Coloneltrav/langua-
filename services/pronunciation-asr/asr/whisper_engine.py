"""Thin subprocess wrapper around whisper.cpp (https://github.com/ggml-org/whisper.cpp).

We shell out to the compiled `whisper-cli` binary rather than using a Python
Whisper binding for two reasons: (1) whisper.cpp's grammar-constrained
decoding (`--grammar`) is a C++-only feature not exposed by openai-whisper
or faster-whisper's Python APIs, and it's the mechanism this whole service
is built around; (2) it keeps this container free of a multi-gigabyte
PyTorch/CUDA dependency chain for what is, after grammar constraint, a
small closed-set classification job that runs fine on CPU.

Requires `docker compose build` (see Dockerfile + download_model.sh) to
actually have the binary and model present — see README for local setup
without Docker.
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path

WHISPER_CPP_BIN = os.environ.get("WHISPER_CPP_BIN", "whisper-cli")
WHISPER_MODEL_PATH = os.environ.get("WHISPER_MODEL_PATH", "/models/ggml-small.bin")
FFMPEG_BIN = os.environ.get("FFMPEG_BIN", "ffmpeg")
WHISPER_LANGUAGE = os.environ.get("WHISPER_LANGUAGE", "ga")


class EngineUnavailable(RuntimeError):
    """Raised when whisper.cpp / ffmpeg / the model file aren't present."""


def check_available() -> None:
    if shutil.which(FFMPEG_BIN) is None:
        raise EngineUnavailable(f"ffmpeg not found on PATH (looked for '{FFMPEG_BIN}').")
    if shutil.which(WHISPER_CPP_BIN) is None and not Path(WHISPER_CPP_BIN).exists():
        raise EngineUnavailable(f"whisper.cpp binary not found (looked for '{WHISPER_CPP_BIN}').")
    if not Path(WHISPER_MODEL_PATH).exists():
        raise EngineUnavailable(
            f"whisper.cpp model not found at '{WHISPER_MODEL_PATH}'. "
            "Run download_model.sh (or `docker compose build`) first."
        )


def convert_to_wav(input_path: str) -> str:
    """whisper.cpp expects 16kHz mono PCM WAV."""
    wav_path = tempfile.mktemp(suffix=".wav")
    result = subprocess.run(
        [FFMPEG_BIN, "-y", "-i", input_path, "-ar", "16000", "-ac", "1", "-f", "wav", wav_path],
        capture_output=True, text=True, timeout=30,
    )
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg failed to convert audio: {result.stderr[-800:]}")
    return wav_path


@dataclass
class OpenTranscript:
    text: str
    avg_logprob: float | None


def run_constrained(wav_path: str, grammar_text: str) -> str:
    """Decode with the decoder's output masked to the grammar's candidate
    set. Returns the raw decoded string (whitespace/punctuation intact —
    callers normalize before matching against candidates)."""
    with tempfile.NamedTemporaryFile("w", suffix=".gbnf", delete=False) as gf:
        gf.write(grammar_text)
        grammar_path = gf.name
    try:
        result = subprocess.run(
            [
                WHISPER_CPP_BIN, "-m", WHISPER_MODEL_PATH, "-f", wav_path,
                "-l", WHISPER_LANGUAGE, "--grammar", grammar_path,
                "--grammar-penalty", "100.0", "-nt", "-np",
            ],
            capture_output=True, text=True, timeout=60,
        )
        if result.returncode != 0:
            raise RuntimeError(f"whisper.cpp (constrained) failed: {result.stderr[-800:]}")
        return result.stdout.strip()
    finally:
        os.unlink(grammar_path)


def run_open(wav_path: str) -> OpenTranscript:
    """Free decode (no grammar) for a confidence/fluency signal."""
    out_prefix = tempfile.mktemp()
    try:
        result = subprocess.run(
            [
                WHISPER_CPP_BIN, "-m", WHISPER_MODEL_PATH, "-f", wav_path,
                "-l", WHISPER_LANGUAGE, "-nt", "-oj", "-of", out_prefix,
            ],
            capture_output=True, text=True, timeout=60,
        )
        if result.returncode != 0:
            raise RuntimeError(f"whisper.cpp (open) failed: {result.stderr[-800:]}")
        json_path = f"{out_prefix}.json"
        if Path(json_path).exists():
            with open(json_path, encoding="utf-8") as f:
                data = json.load(f)
            segments = data.get("transcription", [])
            text = "".join(s.get("text", "") for s in segments).strip()
            logprobs = [s["avg_logprob"] for s in segments if "avg_logprob" in s]
            avg_logprob = sum(logprobs) / len(logprobs) if logprobs else None
            return OpenTranscript(text=text, avg_logprob=avg_logprob)
        return OpenTranscript(text=result.stdout.strip(), avg_logprob=None)
    finally:
        for suffix in (".json",):
            p = Path(f"{out_prefix}{suffix}")
            if p.exists():
                p.unlink()
