import { state, saveProgress, todayKey, newWordsLearnedToday } from '../../state/store.js';
import { azureAvailableSync } from '../../services/tts.js';
import { uiState } from '../uiState.js';

export function render() {
  const usingAzure = azureAvailableSync();
  return `
    <div class="card">
      <div style="font-family:'Cormorant Garamond',serif; font-size:20px; margin-bottom:6px;">Pronunciation voice</div>
      <div style="font-size:12.5px; color:var(--text-dim); line-height:1.6; margin-bottom:14px;">
        Currently: <b style="color:${usingAzure ? 'var(--gold-bright)' : '#e2a494'}">${usingAzure ? 'Azure ga-IE neural voice (real Irish TTS)' : 'Browser fallback voice (approximate — not verified Irish pronunciation)'}</b>.
        Azure AI Speech has two purpose-built Irish voices: <b>Colm</b> (male) and <b>Orla</b> (female), trained on actual Irish speech.
        The key lives on the backend (see <code>backend/.env.example</code>) — nothing to paste here anymore.
      </div>
      <label class="field-label">Voice</label>
      <select id="azureVoiceSelect">
        <option value="ga-IE-ColmNeural" ${state.settings.azureVoice === 'ga-IE-ColmNeural' ? 'selected' : ''}>Colm (male)</option>
        <option value="ga-IE-OrlaNeural" ${state.settings.azureVoice === 'ga-IE-OrlaNeural' ? 'selected' : ''}>Orla (female)</option>
      </select>
      <div class="btn-row"><button class="btn" id="saveVoice">Save voice</button></div>
    </div>
    <div class="card">
      <div style="font-family:'Cormorant Garamond',serif; font-size:20px; margin-bottom:14px;">General</div>
      <label class="field-label">Preferred dialect (label only — Azure's ga-IE voices are standard pronunciation, not dialect-specific)</label>
      <select id="dialectSelect">
        ${['Standard / An Caighdeán', 'Connacht', 'Munster', 'Ulster'].map((d) => `<option value="${d}" ${state.settings.dialect === d ? 'selected' : ''}>${d}</option>`).join('')}
      </select>
      <div style="margin-top:18px;">
        <label class="field-label">Daily new-word target</label>
        <input type="text" id="capInput" value="${state.settings.dailyNewWordCap}" style="max-width:80px;">
        <div style="font-size:11.5px; color:var(--text-dim); margin-top:6px;">You've learned ${newWordsLearnedToday()} new word${newWordsLearnedToday() === 1 ? '' : 's'} today.</div>
      </div>
      <div class="btn-row"><button class="btn" id="saveSettings">Save settings</button></div>
    </div>
    <div class="card">
      <div style="font-family:'Cormorant Garamond',serif; font-size:18px; margin-bottom:6px;">Backend access token</div>
      <div style="font-size:12.5px; color:var(--text-dim); margin-bottom:12px; line-height:1.6;">Only needed if the app operator set <code>BLAS_ACCESS_TOKEN</code> on the backend (recommended if this is hosted somewhere public, since the backend spends your Anthropic/Azure credits). Leave blank for local development.</div>
      <input type="text" id="apiTokenInput" value="${state.settings.apiToken}" placeholder="paste the access token here">
      <div class="btn-row"><button class="btn secondary" id="saveToken">Save token</button></div>
    </div>
    <div class="card">
      <div style="font-family:'Cormorant Garamond',serif; font-size:18px; margin-bottom:8px; color:#e2a494;">Reset progress</div>
      <div style="font-size:12.5px; color:var(--text-dim); margin-bottom:12px;">Clears every word's spaced-repetition state and skill scores. Cannot be undone.</div>
      <button class="btn rubric" id="resetBtn">Reset all progress</button>
    </div>
  `;
}

export function bind(main, rerender) {
  const saveVoiceBtn = main.querySelector('#saveVoice');
  if (saveVoiceBtn) saveVoiceBtn.onclick = () => {
    state.settings.azureVoice = main.querySelector('#azureVoiceSelect').value;
    saveProgress();
    saveVoiceBtn.textContent = 'Saved ✓';
    setTimeout(() => rerender(), 900);
  };

  const saveSettingsBtn = main.querySelector('#saveSettings');
  if (saveSettingsBtn) saveSettingsBtn.onclick = () => {
    state.settings.dialect = main.querySelector('#dialectSelect').value;
    const capVal = parseInt(main.querySelector('#capInput').value, 10);
    state.settings.dailyNewWordCap = (isNaN(capVal) || capVal < 1) ? 5 : capVal;
    saveProgress();
    saveSettingsBtn.textContent = 'Saved ✓';
    setTimeout(() => { saveSettingsBtn.textContent = 'Save settings'; }, 1500);
  };

  const saveTokenBtn = main.querySelector('#saveToken');
  if (saveTokenBtn) saveTokenBtn.onclick = () => {
    state.settings.apiToken = main.querySelector('#apiTokenInput').value.trim();
    saveProgress();
    saveTokenBtn.textContent = 'Saved ✓';
    setTimeout(() => { saveTokenBtn.textContent = 'Save token'; }, 1500);
  };

  const resetBtn = main.querySelector('#resetBtn');
  if (resetBtn) resetBtn.onclick = () => {
    if (confirm('This clears all learning progress. Are you sure?')) {
      state.progress = {};
      state.settings.newWordsToday = { date: todayKey(), count: 0 };
      saveProgress();
      uiState.route = 'home';
      rerender(true);
    }
  };
}
