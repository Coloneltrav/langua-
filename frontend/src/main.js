/* =========================================================
   BLAS — personal Irish learning system
   Frontend entry point. Loads saved progress, renders the app,
   then warms up the browser TTS voice list and checks whether
   the backend has a real Azure ga-IE voice configured.
   ========================================================= */
import { loadProgress } from './state/store.js';
import { renderApp, renderRoute } from './ui/router.js';
import { checkAzureAvailable, loadAudioDb } from './services/tts.js';

(async function init() {
  // The static pronunciation audio DB determines both playback quality and
  // whether on-device scoring has references — resolve it before first paint.
  await Promise.all([loadProgress(), loadAudioDb()]);
  renderApp();

  if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = () => {}; // warm up voice list
  }

  // Offline/installable support for production builds (GitHub Pages).
  // Skipped in dev so the SW never fights Vite's module server.
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  }

  checkAzureAvailable().then(() => renderRoute());
})();
