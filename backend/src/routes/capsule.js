import { Router } from 'express';
import { anthropic } from '../anthropicClient.js';
import { env } from '../env.js';

export const capsuleRouter = Router();

function buildSystemPrompt(known) {
  return `You write short Irish (Gaeilge) culture capsules for a language app called Blas. Output ONLY valid JSON, no markdown fences, no preamble, matching exactly this shape:
{"title":"...", "category":"...", "difficulty":"beginner|intermediate", "text":"2-4 sentences, mostly English, with 3-5 Irish words/phrases woven in naturally and glossed in parentheses on first use", "target_words":[{"irish":"...","english":"..."}], "quiz":{"q":"...","options":["...","...","...","..."],"answer":0}}
Keep it factual and neutral, especially for any historical or political topic. The learner's known Irish words: ${known.length ? known.join(', ') : '(none yet)'}.`;
}

capsuleRouter.post('/generate', async (req, res) => {
  const { topic, known = [] } = req.body || {};
  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'Body must include a `topic` string.' });
  }
  if (!env.anthropicApiKey) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY is not configured on the backend.' });
  }

  try {
    const response = await anthropic.messages.create({
      model: env.anthropicModel,
      max_tokens: 800,
      system: buildSystemPrompt(known),
      messages: [{ role: 'user', content: `Generate a beginner-friendly Irish culture capsule about: ${topic}` }],
    });
    const text = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
    const cleaned = text.replace(/^```json\s*|```$/g, '').trim();
    const capsule = JSON.parse(cleaned);
    res.json({ capsule });
  } catch (e) {
    console.error('capsule generation failed:', e);
    res.status(502).json({ error: `Capsule generation failed: ${e.message}` });
  }
});
