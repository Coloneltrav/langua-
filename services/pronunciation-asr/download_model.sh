#!/usr/bin/env bash
# Downloads a ggml-format Whisper model for whisper.cpp.
#
# Model size tradeoff: grammar-constrained decoding collapses the search
# space to a handful of candidates, so even `base` performs reasonably —
# but Irish is low-resource in Whisper's training data, so `small` is the
# recommended default. Bump to `medium` if you have the RAM/CPU headroom
# and want better distractor discrimination.
set -euo pipefail

MODEL="${1:-small}"
DEST_DIR="${MODEL_DIR:-/models}"
URL="https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${MODEL}.bin"

mkdir -p "$DEST_DIR"
echo "Downloading ggml-${MODEL}.bin to ${DEST_DIR}..."
curl -L --fail -o "${DEST_DIR}/ggml-${MODEL}.bin" "$URL"
echo "Done. Set WHISPER_MODEL_PATH=${DEST_DIR}/ggml-${MODEL}.bin"
