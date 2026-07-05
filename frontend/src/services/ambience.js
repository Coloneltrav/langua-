// Ambient soundscape for a Living Encounter's Observe stage — deliberately
// narrow scope. There's no real ambience audio in this project, and no way
// to source it (same sandbox restriction that ruled out real archival
// photos). Rather than fake something bigger, this only synthesizes sounds
// that hold up as procedural noise: rain, wind. It does NOT attempt café
// chatter, bells, or birdsong — those need actual recorded texture/pitch to
// read as real rather than uncanny, so we leave them out rather than ship
// something that sounds worse than silence.
//
// Requires a user gesture to start (browser autoplay policy), auto-fades
// out after a bounded duration as a safety net in case the calling view is
// torn down without explicitly stopping it (no unmount lifecycle exists in
// this app's router).
const MAX_DURATION_MS = 120000;

let ctx = null;
let noiseSource = null;
let gainNode = null;
let extraNodes = []; // e.g. an LFO oscillator modulating gain, stopped alongside noiseSource
let autoStopTimer = null;

function ensureContext() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function makeNoiseBuffer(context) {
  const seconds = 4;
  const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

export function isAmbiencePlaying() {
  return !!noiseSource;
}

export function startRain() {
  if (noiseSource) return;
  const context = ensureContext();
  const noise = context.createBufferSource();
  noise.buffer = makeNoiseBuffer(context);
  noise.loop = true;

  // Bandpass shapes white noise into a rain-like hiss rather than a flat
  // static wall.
  const bandpass = context.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 3400;
  bandpass.Q.value = 0.6;

  gainNode = context.createGain();
  gainNode.gain.value = 0;
  noise.connect(bandpass).connect(gainNode).connect(context.destination);
  noise.start();
  gainNode.gain.linearRampToValueAtTime(0.045, context.currentTime + 1.5);
  noiseSource = noise;

  autoStopTimer = setTimeout(stopAmbience, MAX_DURATION_MS);
}

export function startWind() {
  if (noiseSource) return;
  const context = ensureContext();
  const noise = context.createBufferSource();
  noise.buffer = makeNoiseBuffer(context);
  noise.loop = true;

  // Lowpass gives a duller, breathier texture than rain's bandpass hiss.
  const lowpass = context.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 480;

  gainNode = context.createGain();
  gainNode.gain.value = 0;

  // A slow LFO on the gain gives gentle gusting instead of a flat drone.
  const lfo = context.createOscillator();
  lfo.frequency.value = 0.09;
  const lfoDepth = context.createGain();
  lfoDepth.gain.value = 0.018;
  lfo.connect(lfoDepth).connect(gainNode.gain);
  lfo.start();

  noise.connect(lowpass).connect(gainNode).connect(context.destination);
  noise.start();
  gainNode.gain.linearRampToValueAtTime(0.045, context.currentTime + 1.8);
  noiseSource = noise;
  extraNodes = [lfo];

  autoStopTimer = setTimeout(stopAmbience, MAX_DURATION_MS);
}

export function stopAmbience() {
  if (autoStopTimer) { clearTimeout(autoStopTimer); autoStopTimer = null; }
  if (!noiseSource || !gainNode || !ctx) return;
  const context = ctx;
  const toStop = noiseSource;
  const toStopExtra = extraNodes;
  gainNode.gain.cancelScheduledValues(context.currentTime);
  gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.8);
  setTimeout(() => {
    try { toStop.stop(); } catch { /* already stopped */ }
    toStopExtra.forEach((n) => { try { n.stop(); } catch { /* already stopped */ } });
  }, 900);
  noiseSource = null;
  gainNode = null;
  extraNodes = [];
}
