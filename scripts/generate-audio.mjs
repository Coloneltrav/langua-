// Generates the pronunciation audio database: one MP3 per vocabulary word
// and one per example sentence, synthesized with Azure's ga-IE Irish
// neural voice. Run once (or whenever shared/vocab.json changes) — the
// output is committed to the repo, so the deployed app plays real Irish
// neural audio as plain static files with no runtime key or server.
//
// Usage:
//   AZURE_SPEECH_KEY=... [AZURE_SPEECH_REGION=southcentralus] \
//   [AZURE_VOICE=ga-IE-ColmNeural] node scripts/generate-audio.mjs
//
// Idempotent: existing files are skipped, so an interrupted run can be
// resumed and only new vocab entries get synthesized on later runs.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VOCAB_PATH = path.join(ROOT, 'shared', 'vocab.json');
const AUDIO_DIR = path.join(ROOT, 'frontend', 'public', 'audio');

const KEY = process.env.AZURE_SPEECH_KEY;
const REGION = process.env.AZURE_SPEECH_REGION || 'southcentralus';
const VOICE = process.env.AZURE_VOICE || 'ga-IE-ColmNeural';
const ENDPOINT = `https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

if (!KEY) {
  console.error('AZURE_SPEECH_KEY is not set. Aborting without generating anything.');
  process.exit(1);
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

// Single words get a slightly slower rate — clearer for a learner
// imitating the sound. Example sentences keep natural pace.
function ssmlFor(text, { slow }) {
  const inner = slow ? `<prosody rate="-12%">${escapeXml(text)}</prosody>` : escapeXml(text);
  return `<speak version='1.0' xml:lang='ga-IE'><voice name='${VOICE}'>${inner}</voice></speak>`;
}

async function synthesize(text, { slow }) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
      },
      body: ssmlFor(text, { slow }),
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (res.status === 429 || res.status >= 500) {
      const retryAfter = parseInt(res.headers.get('retry-after') || '0', 10);
      const waitMs = Math.max(retryAfter * 1000, 1500 * attempt);
      console.warn(`  ${res.status} from Azure, retrying in ${waitMs}ms (attempt ${attempt}/5)`);
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }
    throw new Error(`Azure TTS failed (${res.status}): ${await res.text().catch(() => '')}`);
  }
  throw new Error('Azure TTS failed after 5 attempts (rate limiting).');
}

async function fileExists(p) {
  try { await fs.stat(p); return true; } catch { return false; }
}

const vocab = JSON.parse(await fs.readFile(VOCAB_PATH, 'utf8'));
await fs.mkdir(path.join(AUDIO_DIR, 'words'), { recursive: true });
await fs.mkdir(path.join(AUDIO_DIR, 'examples'), { recursive: true });

let generated = 0;
let skipped = 0;
const manifest = { voice: VOICE, words: [], examples: [] };

for (const w of vocab) {
  const wordPath = path.join(AUDIO_DIR, 'words', `${w.id}.mp3`);
  if (await fileExists(wordPath)) {
    skipped++;
  } else {
    console.log(`words/${w.id}.mp3  <- "${w.irish}"`);
    await fs.writeFile(wordPath, await synthesize(w.irish, { slow: true }));
    generated++;
    await new Promise((r) => setTimeout(r, 300)); // stay well under TTS rate limits
  }
  manifest.words.push(w.id);

  if (w.example_ga) {
    const examplePath = path.join(AUDIO_DIR, 'examples', `${w.id}.mp3`);
    if (await fileExists(examplePath)) {
      skipped++;
    } else {
      console.log(`examples/${w.id}.mp3  <- "${w.example_ga}"`);
      await fs.writeFile(examplePath, await synthesize(w.example_ga, { slow: false }));
      generated++;
      await new Promise((r) => setTimeout(r, 300));
    }
    manifest.examples.push(w.id);
  }
}

manifest.generatedAt = new Date().toISOString();
await fs.writeFile(path.join(AUDIO_DIR, 'index.json'), JSON.stringify(manifest, null, 2));
console.log(`\nDone: ${generated} generated, ${skipped} already existed.`);
console.log(`Manifest: ${manifest.words.length} words, ${manifest.examples.length} examples, voice ${VOICE}.`);
