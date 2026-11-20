// Solmar Bay v8 — roadblocks: at 3 stars the bay parks two police cars
// across the road ahead of you. Smashing through costs vehicle damage;
// the block clears when your wanted level drops.
'use strict';
window.SB = window.SB || {};

SB.spawnRoadblock = function () {
  const g = SB.G;
  if (g.roadblock) return;
  const p = g.player;
  const ahead = 320;
  const dirx = p.car ? Math.cos(p.car.angle) : 1, diry = p.car ? Math.sin(p.car.angle) : 0;
  const bx = SB.clamp(p.x + dirx * ahead, 120, SB.WORLD.w - 120);
  const by = SB.clamp(p.y + diry * ahead, 120, SB.WORLD.h - 120);
  const cars = [];
  for (let i = -1; i <= 1; i += 2) {
    const c = SB.makeCar(bx + diry * i * 30, by - dirx * i * 30, 1, { traffic: false });
    c.color = '#20304a'; c.police = true; c.angle = Math.atan2(dirx, -diry);
    cars.push(c); g.cars.push(c);
  }
  g.roadblock = { x: bx, y: by, cars };
  SB.toast('Roadblock ahead — MARLIN units holding the road.');
};
SB.updateRoadblocks = function () {
  const g = SB.G;
  if (g.roadblock && g.wanted < 3) {
    for (const c of g.roadblock.cars) c.traffic = true;
    g.roadblock = null;
  }
};
SB.clearRoadblock = function () { SB.G.roadblock = null; };
