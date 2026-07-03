// Calls the backend's /api/capsule/generate route (server-held Anthropic key).
// See backend/src/routes/capsule.js.
import { apiJson } from './apiClient.js';

export async function generateCapsuleRemote({ topic, known }) {
  const data = await apiJson('/api/capsule/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, known }),
  });
  return data.capsule;
}
