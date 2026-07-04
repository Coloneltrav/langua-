// The active pack's culture capsules, live-swappable the same way
// data/words.js is — see there for why the array reference never changes.
import { activePack, activeAccentCode } from './languagePacks.js';

export const CULTURE_CAPSULES = [];

export function reloadActiveCapsules() {
  const pack = activePack();
  const capsules = pack.getCapsules(activeAccentCode());
  CULTURE_CAPSULES.length = 0;
  CULTURE_CAPSULES.push(...capsules);
}
reloadActiveCapsules();
