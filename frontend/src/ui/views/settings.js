import { state, saveProgress, todayKey, newWordsLearnedToday } from '../../state/store.js';
import { azureAvailableSync, audioDbCoversActivePack } from '../../services/tts.js';
import { uiState } from '../uiState.js';
import { LANGUAGE_PACKS, activePack, activeAccentCode } from '../../data/languagePacks.js';
import { setPack, setAccent } from '../packSwitch.js';

function languageCardHtml() {
  const pack = activePack();
  const packButtons = Object.values(LANGUAGE_PACKS).map((p) => `
    <button class="btn ${p.code === pack.code ? '' : 'secondary'}" data-pack="${p.code}">${p.name}</button>
  `).join('');
  let accentSection = '';
  if (pack.hasAccents) {
    const accentCode = activeAccentCode();
    const accent = pack.accents[accentCode];
    const accentButtons = pack.accentOrder.map((code) => {
      const a = pack.accents[code];
      return `<button class="btn ${code === accentCode ? '' : 'secondary'}" data-accent="${code}">${a.flag} ${a.country}</button>`;
    }).join('');
    const regionalVocab = (pack.regionalVocab[accentCode] || []).map((v) => `
      <div style="margin-top:6px; font-size:12.5px;"><b class="display" style="color:var(--gold-bright); font-size:15px;">${v.term}</b> — ${v.concept} <span style="color:var(--text-dim);">(${v.note})</span></div>
    `).join('');
    accentSection = `
      <div style="margin-top:16px;">
        <label class="field-label">Accent / country</label>
        <div class="btn-row" style="flex-wrap:wrap;">${accentButtons}</div>
        <div style="font-size:12.5px; color:var(--text-dim); line-height:1.6; margin-top:10px;">${accent.blurb}</div>
        <div style="margin-top:10px; font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">Words that differ in ${accent.country}</div>
        ${regionalVocab}
      </div>
    `;
  }
  return `
    <div class="card">
      <div style="font-family:'Cormorant Garamond',serif; font-size:20px; margin-bottom:6px;">Language</div>
      <div style="font-size:12.5px; color:var(--text-dim); line-height:1.6; margin-bottom:12px;">Switching keeps every word's progress — nothing is lost, the app just shows a different pack's vocabulary, culture, and map.</div>
      <div class="btn-row">${packButtons}</div>
      ${accentSection}
    </div>
  `;
}

function voiceCardHtml() {
  const pack = activePack();
  const usingAzure = azureAvailableSync();
  const usingDb = audioDbCoversActivePack();
  const voiceStatus = usingDb
    ? `Pronunciation audio database (real ${pack.name} neural audio, works offline)`
    : usingAzure
      ? `Azure neural voice via the backend (real ${pack.name} TTS)`
      : `Browser fallback voice (approximate — not verified ${pack.name} pronunciation)`;
  const voiceOptions = pack.hasAccents
    ? [pack.accents[activeAccentCode()].voice, pack.accents[activeAccentCode()].voiceAlt]
    : (pack.azureVoices || []);
  return `
    <div class="card">
      <div style="font-family:'Cormorant Garamond',serif; font-size:20px; margin-bottom:6px;">Pronunciation voice</div>
      <div style="font-size:12.5px; color:var(--text-dim); line-height:1.6; margin-bottom:14px;">
        Currently: <b style="color:${usingDb || usingAzure ? 'var(--gold-bright)' : '#e2a494'}">${voiceStatus}</b>.
        The voice choice below applies to live backend TTS.
      </div>
      <label class="field-label">Voice</label>
      <select id="azureVoiceSelect">
        ${voiceOptions.map((v) => `<option value="${v.id}" ${state.settings.azureVoice === v.id ? 'selected' : ''}>${v.label}</option>`).join('')}
      </select>
      <div class="btn-row"><button class="btn" id="saveVoice">Save voice</button></div>
    </div>
  `;
}

export function render() {
  return `
    ${languageCardHtml()}
    ${voiceCardHtml()}
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
      <div style="font-family:'Cormorant Garamond',serif; font-size:18px; margin-bottom:6px;">AI Tutor key</div>
      <div style="font-size:12.5px; color:var(--text-dim); margin-bottom:12px; line-height:1.6;">On this free-hosted version there's no server to pay for tutor chats, so the AI Tutor tab stays hidden until you paste your own Anthropic API key here (get one at <a class="word-ref" href="https://console.anthropic.com" target="_blank" rel="noopener">console.anthropic.com</a>). It's stored only on this device and sent only to Anthropic — no key, no tab, no cost. Leave blank if you're running the full backend.</div>
      <input type="text" id="anthropicKeyInput" value="${state.settings.anthropicKey}" placeholder="sk-ant-...">
      <div class="btn-row"><button class="btn secondary" id="saveAnthropicKey">Save key</button></div>
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
  main.querySelectorAll('[data-pack]').forEach((btn) => {
    btn.onclick = () => {
      if (btn.dataset.pack === state.settings.packCode) return;
      setPack(btn.dataset.pack);
      saveProgress();
      uiState.route = 'home';
      rerender(true);
    };
  });
  main.querySelectorAll('[data-accent]').forEach((btn) => {
    btn.onclick = () => {
      if (btn.dataset.accent === state.settings.accentCode) return;
      setAccent(btn.dataset.accent);
      saveProgress();
      rerender(true);
    };
  });

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

  const saveAnthropicKeyBtn = main.querySelector('#saveAnthropicKey');
  if (saveAnthropicKeyBtn) saveAnthropicKeyBtn.onclick = () => {
    state.settings.anthropicKey = main.querySelector('#anthropicKeyInput').value.trim();
    saveProgress();
    rerender(true); // key presence toggles the AI Tutor tab — refresh nav immediately
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
