// Solmar Bay v8 — audio: WebAudio synth only, no audio files. Short blips
// for UI, shots and pickups, an engine hum while driving, and the three
// synth radio stations (radio.js picks the pattern; this plays the notes).
'use strict';
window.SB = window.SB || {};

SB.audio = { ctx: null, engineOsc: null, engineGain: null, muted: false };
SB.initAudio = function () {
  if (SB.audio.ctx) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    SB.audio.ctx = ctx;
    const g = ctx.createGain(); g.gain.value = 0.0; g.connect(ctx.destination);
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 55;
    o.connect(g); o.start();
    SB.audio.engineOsc = o; SB.audio.engineGain = g;
  } catch (err) { SB.audio.ctx = null; }
};
SB.blip = function (freq, dur, type, vol) {
  const a = SB.audio; if (!a.ctx || a.muted) return;
  const t = a.ctx.currentTime;
  const o = a.ctx.createOscillator(), g = a.ctx.createGain();
  o.type = type || 'square'; o.frequency.value = freq;
  g.gain.setValueAtTime(vol || 0.05, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.09));
  o.connect(g); g.connect(a.ctx.destination); o.start(t); o.stop(t + (dur || 0.09));
};
SB.sfx = {
  ui: () => SB.blip(660, 0.06, 'square', 0.04),
  cash: () => { SB.blip(880, 0.07, 'square', 0.05); setTimeout(() => SB.blip(1320, 0.09, 'square', 0.05), 60); },
  shot: () => SB.blip(150, 0.08, 'sawtooth', 0.07),
  hit: () => SB.blip(90, 0.1, 'sawtooth', 0.06),
  splash: () => SB.blip(300, 0.16, 'sine', 0.06),
  siren: () => SB.blip(740, 0.12, 'triangle', 0.03),
};
SB.setEngine = function (speed01) {
  const a = SB.audio; if (!a.ctx) return;
  const on = speed01 > 0.02 && !a.muted;
  a.engineGain.gain.value = on ? 0.015 + speed01 * 0.03 : 0;
  if (a.engineOsc) a.engineOsc.frequency.value = 50 + speed01 * 130;
};
SB.note = function (freq, t, dur, type, vol) {
  const a = SB.audio; if (!a.ctx || a.muted) return;
  const o = a.ctx.createOscillator(), g = a.ctx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(a.ctx.destination); o.start(t); o.stop(t + dur);
};
