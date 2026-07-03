// Replaces the old "record yourself, compare to reference audio by ear"
// placeholder with a real closed-set ASR score, when the pronunciation-asr
// service is reachable. Falls back to record+playback (labeled honestly)
// if it isn't — e.g. running the frontend without the optional service.
import { startRecording, stopRecording, scorePronunciation, recordingActive } from '../../services/pronunciation.js';

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

function verdictFor(score, engine) {
  if (engine === 'unavailable') {
    return "Pronunciation scoring service isn't running — recorded for playback only. Compare against \"Hear it\" above.";
  }
  if (score >= 80) return 'Strong match — the closed-set recognizer picked your target word with high confidence.';
  if (score >= 55) return 'Close, but the recognizer wasn’t fully confident. Listen again and try matching the stress pattern.';
  return 'The recognizer leaned toward a different word in the set. Try again after one more listen.';
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
    statusEl.innerHTML = `<span class="loading-dots" style="font-size:13px; color:var(--text-dim);">Scoring</span>`;
    const playbackUrl = URL.createObjectURL(blob);

    try {
      const result = await scorePronunciation(blob, word);
      statusEl.innerHTML = `<audio controls src="${playbackUrl}" style="width:100%;"></audio>`;
      if (!result.ok) {
        resultEl.innerHTML = `<div class="pron-score"><div class="verdict">${result.msg}</div></div>`;
        return;
      }
      if (result.engine === 'unavailable' || result.score == null) {
        resultEl.innerHTML = `
          <div class="pron-score">
            <div class="verdict">${verdictFor(0, 'unavailable')}</div>
            ${result.detail ? `<div class="heard">${result.detail}</div>` : ''}
          </div>
        `;
        return;
      }
      const score = result.score;
      resultEl.innerHTML = `
        <div class="pron-score">
          <div class="score-row">
            <div class="score-n ${scoreClass(score)}">${score}</div>
            <div class="score-label">/ 100</div>
          </div>
          <div class="verdict">${verdictFor(score, result.engine)}</div>
          ${result.heard ? `<div class="heard">Recognizer heard: “${result.heard}”</div>` : ''}
          <span class="engine-tag">${result.engine || 'unknown engine'}</span>
        </div>
      `;
    } catch (e) {
      statusEl.innerHTML = `<audio controls src="${playbackUrl}" style="width:100%;"></audio>`;
      resultEl.innerHTML = `<div class="pron-score"><div class="verdict">Couldn't reach the scoring service (${e.message}). Recorded for playback only.</div></div>`;
    }
  };
}
