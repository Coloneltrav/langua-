// AI Tutor with two paths:
//  1. Backend proxy (/api/tutor) — used when a backend is deployed; the
//     Anthropic key lives server-side.
//  2. Direct browser call to the Anthropic API — used on the static
//     (GitHub Pages) build when the user has pasted their own key in
//     Settings. The key is stored only on this device and sent only to
//     api.anthropic.com, using Anthropic's CORS-enabled browser access.
import { apiFetch } from './apiClient.js';
import { state } from '../state/store.js';
import { calcReadiness } from '../engine/readiness.js';

const DIRECT_MODEL = 'claude-opus-4-8';

function buildSystemPrompt(known, dialect) {
  return `You are an Irish (Gaeilge) language tutor inside a personal learning app called Blas.
The learner's currently KNOWN words are: ${known.length ? known.join(', ') : '(none started yet — use only extremely basic words like tá, is, mé, tú, agus)'}.
Dialect preference: ${dialect}.
Rules: when writing Irish text, use ONLY the learner's known words plus at most 3 new words, which you must gloss in parentheses immediately after each new word in English. Keep responses short (under 120 words). Always include an English translation line after any Irish text. Stay in the context of this ongoing conversation.`;
}

async function askViaBackend({ known, dialect, history, message }) {
  const res = await apiFetch('/api/tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ known, dialect, history, message }),
  });
  if (!res.ok) {
    let msg = `Tutor request failed (${res.status})`;
    try { const body = await res.json(); if (body?.error) msg = body.error; } catch { /* not json */ }
    const err = new Error(msg);
    // Static hosts answer POSTs to /api with assorted "no such thing"
    // statuses (GitHub Pages: 405, python http.server: 501, generic: 404).
    err.backendMissing = [404, 405, 501, 503].includes(res.status);
    throw err;
  }
  const data = await res.json();
  return { text: data.text };
}

async function askDirect({ known, dialect, history }) {
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
      max_tokens: 1000,
      system: buildSystemPrompt(known, dialect),
      messages: history,
    }),
  });
  if (!res.ok) {
    let msg = `Anthropic API error (${res.status})`;
    try { const body = await res.json(); if (body?.error?.message) msg = body.error.message; } catch { /* not json */ }
    throw new Error(msg);
  }
  const data = await res.json();
  const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
  return { text };
}

export async function askTutor(params) {
  let backendError = null;
  try {
    return await askViaBackend(params);
  } catch (e) {
    backendError = e;
  }
  if (state.settings.anthropicKey) {
    return askDirect(params);
  }
  if (backendError?.backendMissing || backendError?.message?.includes('Failed to fetch')) {
    throw new Error('No tutor backend on this site. Paste an Anthropic API key in Settings to chat directly — it stays on this device.');
  }
  throw backendError;
}

export function tutorReadiness(text, knownSet) {
  return calcReadiness(text, knownSet);
}
