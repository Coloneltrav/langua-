import { Router } from 'express';
import { readProgress, writeProgress } from '../store/progressStore.js';

export const progressRouter = Router();

progressRouter.get('/', async (_req, res) => {
  const data = await readProgress();
  res.json(data);
});

progressRouter.put('/', async (req, res) => {
  const { progress, settings } = req.body || {};
  if (typeof progress !== 'object' || typeof settings !== 'object') {
    return res.status(400).json({ error: 'Body must include `progress` and `settings` objects.' });
  }
  await writeProgress({ progress, settings });
  res.json({ ok: true });
});
