import express from 'express';
import cors from 'cors';
import { env } from './env.js';
import { requireAccessToken } from './middleware/auth.js';
import { rateLimit } from './middleware/rateLimit.js';
import { tutorRouter } from './routes/tutor.js';
import { capsuleRouter } from './routes/capsule.js';
import { ttsRouter } from './routes/tts.js';
import { pronunciationRouter } from './routes/pronunciation.js';
import { progressRouter } from './routes/progress.js';

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api', requireAccessToken);

// AI-cost-incurring endpoints get a tighter rate limit than plain
// progress/TTS proxying — see middleware/rateLimit.js.
app.use('/api/tutor', rateLimit({ windowMs: 60_000, max: 15 }), tutorRouter);
app.use('/api/capsule', rateLimit({ windowMs: 60_000, max: 10 }), capsuleRouter);
app.use('/api/tts', ttsRouter);
app.use('/api/pronunciation', pronunciationRouter);
app.use('/api/progress', progressRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(env.port, () => {
  console.log(`Blas backend listening on http://localhost:${env.port}`);
  if (!env.anthropicApiKey) console.warn('  ANTHROPIC_API_KEY not set — AI Tutor and capsule generation will 503.');
  if (!env.azureSpeechKey) console.warn('  AZURE_SPEECH_KEY not set — TTS will fall back to the browser voice.');
  if (!env.accessToken) console.warn('  BLAS_ACCESS_TOKEN not set — /api is open to anyone who can reach this server.');
});
