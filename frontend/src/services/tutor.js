// Calls the backend's /api/tutor route, which holds the Anthropic API key
// server-side and applies the "known words only, gloss anything new" system
// prompt. See backend/src/routes/tutor.js.
import { apiJson } from './apiClient.js';
import { calcReadiness } from '../engine/readiness.js';

export async function askTutor({ known, dialect, history, message }) {
  const data = await apiJson('/api/tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ known, dialect, history, message }),
  });
  return { text: data.text };
}

export function tutorReadiness(text, knownSet) {
  return calcReadiness(text, knownSet);
}
