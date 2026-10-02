/**
 * Tiny real sound-effect system using the Web Audio API (no audio files,
 * no network request - just synthesized tones). Preference persists in
 * localStorage. Used for scan-complete feedback (different tone for
 * high-risk vs safe) in the Console.
 */
const STORAGE_KEY = 'cybershild_sound_enabled';
let ctx = null;

export function isSoundEnabled() {
  return localStorage.getItem(STORAGE_KEY) !== 'off';
}

export function setSoundEnabled(on) {
  localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
}

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

function beep(freq, durationMs, type = 'sine') {
  if (!isSoundEnabled()) return;
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durationMs / 1000);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + durationMs / 1000);
}

export function playScanResultSound(riskLevel) {
  if (riskLevel === 'HIGH_RISK') {
    beep(220, 160, 'square');
    setTimeout(() => beep(220, 160, 'square'), 180);
  } else if (riskLevel === 'CAUTION') {
    beep(420, 150, 'triangle');
  } else {
    beep(660, 140, 'sine');
  }
}

export function playClickSound() {
  beep(500, 60, 'sine');
}
