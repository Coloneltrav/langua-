import { linkifyIrish } from '../dom.js';
import { teanglannFuaimLink } from '../../services/tts.js';
import { pronunciationWidgetHtml, bindPronunciationWidget } from './pronunciationWidget.js';

export function wordCardHtml(w, mode) {
  return `
    <div class="card">
      <div class="word-hero">
        <div class="pos mono">${w.pos}</div>
        <div class="irish display"><span class="dropcap">${w.irish[0]}</span>${w.irish.slice(1)}</div>
        <div class="phonetic">/ ${w.phonetic} /</div>
        <div class="english">${w.english}</div>
        <div class="chunk-tag mono">chunk: “${linkifyIrish(w.chunk)}”</div>
        <a class="audio-ref" href="${teanglannFuaimLink(w.irish)}" target="_blank" rel="noopener">🔊 Hear native speakers on teanglann.ie ↗</a>
      </div>
      <div class="example-box">
        <div class="ga display">${linkifyIrish(w.example_ga)}</div>
        <div class="en">${w.example_en}</div>
      </div>
      <div class="btn-row">
        <button class="btn secondary" id="hearBtn">🔊 Hear again</button>
      </div>
      ${pronunciationWidgetHtml()}
      ${mode === 'learn' ? `
        <div style="margin-top:18px; font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">How did that feel?</div>
        <div class="btn-row">
          <button class="btn rubric" data-quality="0">Again</button>
          <button class="btn secondary" data-quality="3">Hard</button>
          <button class="btn secondary" data-quality="4">Good</button>
          <button class="btn" data-quality="5">Easy</button>
        </div>
      ` : ''}
    </div>
  `;
}

export function bindWordCard(root, w) {
  bindPronunciationWidget(root, w);
}
