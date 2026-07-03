// Thin fetch wrapper: attaches the bearer token (if the deployment requires
// one — see Settings) and a consistent base URL. In dev, Vite proxies /api
// to the backend (see vite.config.js); in prod the frontend and backend are
// typically served from the same origin behind a reverse proxy.
import { state } from '../state/store.js';

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (state.settings.apiToken) {
    headers.set('Authorization', `Bearer ${state.settings.apiToken}`);
  }
  return fetch(path, { ...options, headers });
}

export async function apiJson(path, options = {}) {
  const res = await apiFetch(path, options);
  if (!res.ok) {
    let message = `Request to ${path} failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // response wasn't JSON — keep the generic message
    }
    throw new Error(message);
  }
  return res.json();
}
