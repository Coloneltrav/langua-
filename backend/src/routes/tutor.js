import { Router } from 'express';
import { anthropic } from '../anthropicClient.js';
import { env } from '../env.js';

export const tutorRouter = Router();

function buildSystemPrompt(known, dialect) {
  return `You are an Irish (Gaeilge) language tutor inside a personal learning app called Blas.
The learner's currently KNOWN words are: ${known.length ? known.join(', ') : '(none started yet — use only extremely basic words like tá, is, mé, tú, agus)'}.
Dialect preference: ${dialect}.
Rules: when writing Irish text, use ONLY the learner's known words plus at most 3 new words, which you must gloss in parentheses immediately after each new word in English. Keep responses short (under 120 words). Always include an English translation line after any Irish text. Stay in the context of this ongoing conversation.`;
}

tutorRouter.post('/', async (req, res) => {
  const { known = [], dialect = 'Standard / An Caighdeán', history = [] } = req.body || {};
  if (!Array.isArray(history) || history.length === 0) {
    return res.status(400).json({ error: 'Body must include a non-empty `history` array.' });
  }
  if (!env.anthropicApiKey) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY is not configured on the backend.' });
  }

  try {
    const response = await anthropic.messages.create({
      model: env.anthropicModel,
      max_tokens: 1000,
      system: buildSystemPrompt(known, dialect),
      messages: history.map((m) => ({ role: m.role, content: m.content })),
    });
    const text = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
    res.json({ text });
  } catch (e) {
    console.error('tutor request failed:', e);
    res.status(502).json({ error: `Tutor request failed: ${e.message}` });
  }
});
