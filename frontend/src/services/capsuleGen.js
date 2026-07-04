// Culture-capsule generation: backend proxy when deployed, otherwise a
// direct browser call to the Anthropic API using the device-only key from
// Settings (same pattern as services/tutor.js).
import { apiJson } from './apiClient.js';
import { state } from '../state/store.js';
import { activePack, activeAccent } from '../data/languagePacks.js';

const DIRECT_MODEL = 'claude-opus-4-8';

function buildSystemPrompt(known) {
  const pack = activePack();
  const accent = activeAccent();
  const countryLine = accent ? ` Focus on ${accent.country} specifically unless the topic is pan-regional.` : '';
  return `You write short ${pack.name} culture capsules for a language app called Blas.${countryLine} Output ONLY valid JSON, no markdown fences, no preamble, matching exactly this shape:
{"title":"...", "category":"...", "difficulty":"beginner|intermediate", "text":"2-4 sentences, mostly English, with 3-5 target-language words/phrases woven in naturally and glossed in parentheses on first use", "target_words":[{"irish":"...","english":"..."}], "quiz":{"q":"...","options":["...","...","...","..."],"answer":0}}
Keep it factual and neutral, especially for any historical or political topic. The learner's known words: ${known.length ? known.join(', ') : '(none yet)'}.`;
}

async function generateDirect({ topic, known }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': state.settings.anthropicKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: DIRECT_MODEL,
      max_tokens: 800,
      system: buildSystemPrompt(known),
      messages: [{ role: 'user', content: `Generate a beginner-friendly ${activePack().name} culture capsule about: ${topic}` }],
    }),
  });
  if (!res.ok) {
    let msg = `Anthropic API error (${res.status})`;
    try { const body = await res.json(); if (body?.error?.message) msg = body.error.message; } catch { /* not json */ }
    throw new Error(msg);
  }
  const data = await res.json();
  const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
  return JSON.parse(text.replace(/^```json\s*|```$/g, '').trim());
}

export async function generateCapsuleRemote({ topic, known }) {
  try {
    const data = await apiJson('/api/capsule/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, known }),
    });
    return data.capsule;
  } catch (e) {
    if (state.settings.anthropicKey) {
      return generateDirect({ topic, known });
    }
    if (e.message?.includes('Failed to fetch') || /\((404|405|501|503)\)/.test(e.message)) {
      throw new Error('No backend on this site. Paste an Anthropic API key in Settings to generate capsules directly — it stays on this device.');
    }
    throw e;
  }
}
