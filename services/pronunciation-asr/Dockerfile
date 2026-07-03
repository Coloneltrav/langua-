# Builds whisper.cpp from source (grammar-constrained decoding is a
# C++-only feature, not exposed by any Python Whisper binding — see
# asr/whisper_engine.py), then runs the FastAPI scoring service.
FROM python:3.11-slim AS whisper-build

RUN apt-get update && apt-get install -y --no-install-recommends \
    git build-essential cmake curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Pin a known-good tag rather than floating on main; bump deliberately.
ARG WHISPER_CPP_REF=v1.7.4
RUN git clone --depth 1 --branch ${WHISPER_CPP_REF} https://github.com/ggml-org/whisper.cpp.git /opt/whisper.cpp
WORKDIR /opt/whisper.cpp
RUN cmake -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build --config Release -j "$(nproc)"

FROM python:3.11-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=whisper-build /opt/whisper.cpp/build/bin/whisper-cli /usr/local/bin/whisper-cli

ENV WHISPER_CPP_BIN=/usr/local/bin/whisper-cli \
    WHISPER_MODEL_PATH=/models/ggml-small.bin \
    MODEL_DIR=/models \
    PYTHONUNBUFFERED=1

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY download_model.sh .
RUN chmod +x download_model.sh && ./download_model.sh small

COPY app.py .
COPY asr ./asr
# Build context is the repo root (see docker-compose.yml) so this service
# ships the same vocabulary the frontend uses without duplicating it.
COPY shared ./shared
ENV SHARED_VOCAB_PATH=/app/shared/vocab.json

EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
