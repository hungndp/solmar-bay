// Solmar Bay v8 — rng: a small seeded random source so fishing, traffic and
// shot staging are reproducible, plus shared math helpers.
'use strict';
window.SB = window.SB || {};

SB.makeRng = function (seed) {
  let s = (seed >>> 0) || 1;
  return function () {
    s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
};
SB.rng = SB.makeRng(20261120);
SB.rand = (a, b) => a + SB.rng() * (b - a);
SB.randInt = (a, b) => Math.floor(SB.rand(a, b + 1));
SB.pick = (arr) => arr[Math.floor(SB.rng() * arr.length)];
SB.clamp = (v, a, b) => v < a ? a : v > b ? b : v;
SB.dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
SB.angTo = (ax, ay, bx, by) => Math.atan2(by - ay, bx - ax);
// Deterministic 0..1 hash of a string, used for portrait seeds.
SB.hash01 = function (text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 10000) / 10000;
};
