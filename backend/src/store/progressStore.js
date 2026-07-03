import { promises as fs } from 'node:fs';
import path from 'node:path';
import { env } from '../env.js';

// A personal app with one user doesn't need a database — a single JSON
// file, written atomically (write to a temp file, then rename) so a crash
// mid-write can't corrupt saved progress, is the whole persistence layer.
const filePath = path.resolve(env.progressDataFile);

const DEFAULT_DATA = { progress: {}, settings: {} };

async function ensureDir() {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

export async function readProgress() {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    if (e.code === 'ENOENT') return DEFAULT_DATA;
    throw e;
  }
}

export async function writeProgress(data) {
  await ensureDir();
  const tmpPath = `${filePath}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmpPath, filePath);
}
