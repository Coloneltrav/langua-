/* =========================================================
   BLAS — personal Irish learning system
   Frontend entry point. Loads saved progress, renders the app,
   then warms up the browser TTS voice list and checks whether
   the backend has a real Azure ga-IE voice configured.
   ========================================================= */
import { loadProgress } from './state/store.js';
import { renderApp, renderRoute } from './ui/router.js';
import { checkAzureAvailable } from './services/tts.js';

(async function init() {
  await loadProgress();
  renderApp();

  if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = () => {}; // warm up voice list
  }

  checkAzureAvailable().then(() => renderRoute());
})();
