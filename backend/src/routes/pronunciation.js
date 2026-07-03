import { Router } from 'express';
import multer from 'multer';
import { env } from '../env.js';

export const pronunciationRouter = Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

// Proxies the recorded attempt to the pronunciation-asr microservice
// (constrained-vocabulary ASR — see services/pronunciation-asr). Kept as a
// thin proxy rather than merged into this Node service because the ASR
// stack (whisper.cpp + Python audio tooling) belongs in its own runtime;
// see services/pronunciation-asr/README.md for why.
pronunciationRouter.post('/score', upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Missing `audio` file.' });
  const { target_id, target_irish, target_phonetic, distractors } = req.body;
  if (!target_irish) return res.status(400).json({ error: 'Missing `target_irish`.' });

  const form = new FormData();
  form.append('audio', new Blob([req.file.buffer], { type: req.file.mimetype || 'audio/webm' }), req.file.originalname || 'attempt.webm');
  form.append('target_id', target_id || '');
  form.append('target_irish', target_irish);
  form.append('target_phonetic', target_phonetic || '');
  form.append('distractors', distractors || '[]');

  try {
    const asrRes = await fetch(`${env.pronunciationAsrUrl}/score`, { method: 'POST', body: form });
    if (!asrRes.ok) {
      const detail = await asrRes.text().catch(() => '');
      return res.status(502).json({ error: `Pronunciation ASR service returned ${asrRes.status}: ${detail}` });
    }
    const result = await asrRes.json();
    res.json(result);
  } catch (e) {
    // The ASR service is an optional add-on (see docker-compose.yml) — if
    // it isn't running, degrade honestly instead of erroring the request.
    res.json({
      ok: true,
      engine: 'unavailable',
      score: null,
      heard: null,
      detail: `Pronunciation scoring service unreachable at ${env.pronunciationAsrUrl} (${e.message}).`,
    });
  }
});
