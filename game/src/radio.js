// Solmar Bay v8 — radio: three synth stations, each a looping note pattern
// played through audio.js. Key T cycles stations, key 0 turns it off.
'use strict';
window.SB = window.SB || {};

SB.STATIONS = [
  { name: 'Reef FM', scale: [0, 3, 5, 7, 10], base: 196, type: 'triangle', tempo: 340 },
  { name: 'Neon Mile', scale: [0, 2, 4, 7, 9], base: 220, type: 'square', tempo: 260 },
  { name: 'Harbour Talk & Bass', scale: [0, 5, 7, 12], base: 147, type: 'sine', tempo: 430 },
];
SB.radio = { station: 0, step: 0, nextAt: 0 };
SB.updateRadio = function (now) {
  const r = SB.radio;
  if (r.station < 0 || !SB.audio.ctx) return;
  if (now < r.nextAt) return;
  const st = SB.STATIONS[r.station];
  const semi = st.scale[r.step % st.scale.length] + (r.step % 8 >= 6 ? 12 : 0);
  const freq = st.base * Math.pow(2, semi / 12);
  SB.note(freq, SB.audio.ctx.currentTime, 0.22, st.type, 0.028);
  if (r.step % 4 === 0) SB.note(st.base / 2, SB.audio.ctx.currentTime, 0.3, 'sine', 0.04);
  r.step++; r.nextAt = now + st.tempo;
};
SB.cycleRadio = function () {
  SB.radio.station = SB.radio.station >= SB.STATIONS.length - 1 ? -1 : SB.radio.station + 1;
  SB.toast(SB.radio.station < 0 ? 'Radio off' : 'Radio: ' + SB.STATIONS[SB.radio.station].name);
};
