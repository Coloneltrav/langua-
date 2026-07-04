// Pronunciation practice: record → trim silence → score → feedback.
// Scoring chain (see services/pronunciation.js): backend ASR when a
// server is deployed, otherwise on-device acoustic comparison against the
// static pronunciation audio database, otherwise honest "no engine" copy.
import { startRecording, stopRecording, scorePronunciation, recordingActive } from '../../services/pronunciation.js';
import { audioDbAvailable } from '../../services/tts.js';
import { state, saveProgress } from '../../state/store.js';
import { bumpSkill } from '../../engine/sm2.js';

export function pronunciationWidgetHtml() {
  return `
    <div class="btn-row">
      <button class="btn secondary" id="recBtn">🎙️ Record yourself</button>
    </div>
    <div id="recStatus" style="margin-top:10px;"></div>
    <div id="pronResult"></div>
  `;
}

function scoreClass(score) {
  if (score >= 80) return 'high';
  if (score >= 55) return 'mid';
  return 'low';
}

const ENGINE_LABELS = {
  'whisper.cpp-grammar-constrained': 'server ASR (whisper.cpp)',
  'acoustic-dtw': 'on-device acoustic analysis',
};

function verdictFor(result) {
  const score = result.score ?? 0;
  if (result.matched === 'distractor' && result.heard) {
    return `That sounded closer to “${result.heard}” than to the target. Listen once more and mind the vowel sounds.`;
  }
  if (score >= 80) return 'Strong match against the reference pronunciation.';
  if (score >= 55) return 'Close — recognizably the right word, but not a tight match yet. Try shadowing the audio: play, then speak immediately after.';
  return 'Quite far from the reference. Play the word again and try matching the rhythm and stress before the individual sounds.';
}

async function trimForPlayback(blob) {
  try {
    const { decodeToMono16k } = await import('../../services/audio/decode.js');
    const { trimSilence, encodeWav } = await import('../../services/audio/trim.js');
    const samples = await decodeToMono16k(await blob.arrayBuffer());
    const { samples: trimmed, trimmed: didTrim } = trimSilence(samples, 16000);
    return { blob: encodeWav(trimmed, 16000), didTrim };
  } catch {
    return { blob, didTrim: false }; // decode failed — fall back to the raw take
  }
}

export function bindPronunciationWidget(root, word) {
  const recBtn = root.querySelector('#recBtn');
  const statusEl = root.querySelector('#recStatus');
  const resultEl = root.querySelector('#pronResult');
  if (!recBtn) return;

  recBtn.onclick = async () => {
    if (!recordingActive()) {
      try {
        await startRecording();
        recBtn.textContent = '⏹️ Stop recording';
        statusEl.innerHTML = `<span class="rec-indicator"><span class="rec-dot"></span>Recording — tap again to stop</span>`;
        resultEl.innerHTML = '';
      } catch (e) {
        statusEl.innerHTML = `<span style="color:#e2a494; font-size:13px;">Mic unavailable here (${e.message}).</span>`;
      }
      return;
    }
    const blob = await stopRecording();
    recBtn.textContent = '🎙️ Record yourself';
    statusEl.innerHTML = `<span class="loading-dots" style="font-size:13px; color:var(--text-dim);">Analyzing</span>`;

    // Playback uses the silence-trimmed take, so the learner hears exactly
    // the part where they spoke — no dead air before or after.
    const playback = await trimForPlayback(blob);
    const playbackUrl = URL.createObjectURL(playback.blob);

    try {
      const result = await scorePronunciation(blob, word);
      statusEl.innerHTML = `<audio controls src="${playbackUrl}" style="width:100%;"></audio>${playback.didTrim ? '<div style="font-size:11px; color:var(--text-dim); margin-top:4px;">Silence trimmed automatically.</div>' : ''}`;
      if (!result.ok) {
        resultEl.innerHTML = `<div class="pron-score"><div class="verdict">${result.msg || 'Scoring failed.'}</div></div>`;
        return;
      }
      if (result.engine === 'unavailable' || result.score == null) {
        resultEl.innerHTML = `
          <div class="pron-score">
            <div class="verdict">${result.detail || 'Scoring isn’t available right now — recorded for playback only.'}</div>
            ${!audioDbAvailable() ? '<div class="heard">Tip: once the pronunciation audio database is generated for this site, scoring works right here with no server.</div>' : ''}
          </div>
        `;
        return;
      }
      const score = result.score;
      // Feed the score into per-word skill tracking (drives the skill bars
      // and the weak-pronunciation review boost in engine/sm2.js).
      if (state.progress[word.id]) {
        bumpSkill(state.progress[word.id], 'pronunciation', score >= 80 ? 1 : (score < 55 ? -1 : 0));
        saveProgress();
      }
      resultEl.innerHTML = `
        <div class="pron-score">
          <div class="score-row">
            <div class="score-n ${scoreClass(score)}">${score}</div>
            <div class="score-label">/ 100</div>
          </div>
          <div class="verdict">${verdictFor(result)}</div>
          ${result.matched === 'target' && result.heard ? `<div class="heard">Best match: “${result.heard}” ✓</div>` : ''}
          <span class="engine-tag">${ENGINE_LABELS[result.engine] || result.engine}</span>
        </div>
      `;
    } catch (e) {
      statusEl.innerHTML = `<audio controls src="${playbackUrl}" style="width:100%;"></audio>`;
      resultEl.innerHTML = `<div class="pron-score"><div class="verdict">Couldn't score this attempt (${e.message}). Recorded for playback only.</div></div>`;
    }
  };
}
