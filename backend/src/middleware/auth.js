import { env } from '../env.js';

// No-op unless BLAS_ACCESS_TOKEN is set — local dev needs zero setup, but a
// publicly-hosted deployment should set it so strangers can't burn the
// operator's Anthropic/Azure credits.
export function requireAccessToken(req, res, next) {
  if (!env.accessToken) return next();
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (token !== env.accessToken) {
    return res.status(401).json({ error: 'Missing or invalid access token.' });
  }
  next();
}
