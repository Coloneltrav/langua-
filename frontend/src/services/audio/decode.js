// Browser-side audio decoding: any recorded/downloaded format the browser
// can play (webm/opus from MediaRecorder, mp4/aac on Safari, mp3 from the
// audio DB) -> mono Float32Array at the analysis sample rate.
export const ANALYSIS_SAMPLE_RATE = 16000;

export async function decodeToMono16k(arrayBuffer) {
  // Decode at native rate first (decodeAudioData needs a real context).
  const probe = new AudioContext();
  let decoded;
  try {
    decoded = await probe.decodeAudioData(arrayBuffer.slice(0));
  } finally {
    probe.close();
  }

  // Resample + downmix via OfflineAudioContext.
  const targetLen = Math.ceil(decoded.duration * ANALYSIS_SAMPLE_RATE);
  const offline = new OfflineAudioContext(1, Math.max(1, targetLen), ANALYSIS_SAMPLE_RATE);
  const src = offline.createBufferSource();
  src.buffer = decoded;
  src.connect(offline.destination);
  src.start();
  const rendered = await offline.startRendering();
  return rendered.getChannelData(0).slice(0);
}

export async function fetchAndDecode(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url} (${res.status})`);
  return decodeToMono16k(await res.arrayBuffer());
}
