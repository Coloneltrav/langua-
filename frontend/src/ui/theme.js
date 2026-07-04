// Applies the active language pack's visual identity as CSS custom
// properties, and stamps a data-pack attribute on <html> so pack-specific
// decoration (see main.css [data-pack="ga"] rules) can key off it. This is
// the one place the app reads pack.theme — everything else just uses the
// existing --gold/--bg/etc custom properties as before.
import { activePack, activeAccentCode } from '../data/languagePacks.js';

const VAR_MAP = {
  bg: '--bg', surface: '--surface', surface2: '--surface-2', border: '--border',
  text: '--text', textDim: '--text-dim', onAccent: '--on-accent',
  accent: '--gold', accentBright: '--gold-bright', accentDim: '--gold-dim',
  flagOrange: '--flag-orange', rubric: '--rubric',
};

export function applyTheme() {
  const pack = activePack();
  const theme = pack.getTheme(activeAccentCode()) || {};
  const root = document.documentElement;
  for (const [key, cssVar] of Object.entries(VAR_MAP)) {
    if (theme[key]) root.style.setProperty(cssVar, theme[key]);
  }
  if (theme.flagStripe?.length) {
    const n = theme.flagStripe.length;
    const stops = theme.flagStripe.map((c, i) => `${c} ${(i / n * 100).toFixed(2)}% ${((i + 1) / n * 100).toFixed(2)}%`);
    root.style.setProperty('--flag-gradient', `linear-gradient(90deg, ${stops.join(', ')})`);
  }
  if (theme.wordmarkFont) root.style.setProperty('--wordmark-font', theme.wordmarkFont);
  root.dataset.pack = pack.code;
  root.dataset.motif = theme.motif || '';
}
