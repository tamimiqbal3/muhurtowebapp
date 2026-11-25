"use client";

// Tiny Web Audio synth for tactile calculator feedback. No audio files.
let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function blip(freq: number, dur: number, type: OscillatorType, gain: number, when = 0) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + when;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.6), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(dur: number, gain: number, when = 0, hp = 2000) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + when;
  const buf = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = hp;
  const g = a.createGain();
  g.gain.value = gain;
  src.connect(f).connect(g).connect(a.destination);
  src.start(t);
}

export const calcSound = {
  key: () => { noise(0.018, 0.25, 0, 3500); blip(1800, 0.025, "square", 0.015); },
  func: () => { noise(0.022, 0.3, 0, 2500); blip(1200, 0.035, "triangle", 0.03); },
  error: () => { blip(220, 0.12, "square", 0.04); blip(180, 0.14, "square", 0.04, 0.12); },
  print: () => { for (let i = 0; i < 4; i++) noise(0.012, 0.12, i * 0.028, 1500); },
  ding: () => { blip(1568, 0.6, "sine", 0.07); blip(2093, 0.8, "sine", 0.05, 0.08); },
  tear: () => noise(0.35, 0.2, 0, 900),
};
