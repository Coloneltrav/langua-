import { Router } from 'express';
import { env } from '../env.js';

export const ttsRouter = Router();

ttsRouter.get('/status', (_req, res) => {
  res.json({ configured: !!env.azureSpeechKey });
});

// Real Irish pronunciation: Azure AI Speech has two purpose-built Irish
// (ga-IE) neural voices — Colm and Orla — trained on actual Irish speech.
// The key stays server-side; the browser never sees it.
ttsRouter.post('/', async (req, res) => {
  const { text, voice = 'ga-IE-ColmNeural' } = req.body || {};
  if (!text) return res.status(400).json({ error: 'Body must include `text`.' });
  if (!env.azureSpeechKey) return res.status(503).json({ error: 'Azure Speech is not configured on the backend.' });

  const ssml = `<speak version='1.0' xml:lang='ga-IE'><voice name='${voice}'>${escapeXml(text)}</voice></speak>`;
  const endpoint = `https://${env.azureSpeechRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;

  try {
    const azureRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': env.azureSpeechKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-64kbitrate-mono-mp3',
      },
      body: ssml,
    });
    if (!azureRes.ok) {
      const detail = await azureRes.text().catch(() => '');
      return res.status(502).json({ error: `Azure TTS request failed (${azureRes.status}): ${detail}` });
    }
    const buffer = Buffer.from(await azureRes.arrayBuffer());
    res.set('Content-Type', 'audio/mpeg');
    res.send(buffer);
  } catch (e) {
    console.error('Azure TTS proxy failed:', e);
    res.status(502).json({ error: `Azure TTS proxy failed: ${e.message}` });
  }
});

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
}
