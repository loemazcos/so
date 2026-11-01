export type SoundKind = 'message' | 'banner' | 'typing' | 'heartbeat' | 'battery' | 'clue';

type Tone = { freq: number; start: number; duration: number; gain: number; type?: OscillatorType; sweepTo?: number };

const TONES: Record<SoundKind, Tone[]> = {
  message: [
    { freq: 988, start: 0, duration: 0.09, gain: 0.12 },
    { freq: 1319, start: 0.1, duration: 0.12, gain: 0.12 },
  ],
  banner: [{ freq: 520, sweepTo: 1040, start: 0, duration: 0.28, gain: 0.1 }],
  typing: [{ freq: 1800, start: 0, duration: 0.012, gain: 0.03, type: 'square' }],
  heartbeat: [
    { freq: 58, start: 0, duration: 0.14, gain: 0.35 },
    { freq: 58, start: 0.22, duration: 0.12, gain: 0.25 },
  ],
  battery: [
    { freq: 660, start: 0, duration: 0.14, gain: 0.14, type: 'triangle' },
    { freq: 660, start: 0.22, duration: 0.14, gain: 0.14, type: 'triangle' },
  ],
  clue: [
    { freq: 1319, start: 0, duration: 0.2, gain: 0.12, type: 'sine' },
    { freq: 1568, start: 0.12, duration: 0.2, gain: 0.12, type: 'sine' },
    { freq: 2093, start: 0.24, duration: 0.36, gain: 0.12, type: 'sine' },
  ],
};

let context: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === 'undefined' || !window.AudioContext) return null;
  context ??= new window.AudioContext();
  return context;
}

export function unlockAudio() {
  audioContext()?.resume();
}

export function playSound(kind: SoundKind, enabled: boolean) {
  if (!enabled) return;
  const ctx = audioContext();
  if (!ctx) return;
  void ctx.resume();
  const origin = ctx.currentTime;
  for (const tone of TONES[kind]) {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = tone.type ?? 'sine';
    osc.frequency.setValueAtTime(tone.freq, origin + tone.start);
    if (tone.sweepTo) osc.frequency.linearRampToValueAtTime(tone.sweepTo, origin + tone.start + tone.duration);
    amp.gain.setValueAtTime(0, origin + tone.start);
    amp.gain.linearRampToValueAtTime(tone.gain, origin + tone.start + 0.01);
    amp.gain.linearRampToValueAtTime(0, origin + tone.start + tone.duration);
    osc.connect(amp).connect(ctx.destination);
    osc.start(origin + tone.start);
    osc.stop(origin + tone.start + tone.duration + 0.02);
  }
}

export function vibrate(pattern: number) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
}
