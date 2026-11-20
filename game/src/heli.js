// Solmar Bay v8 — heli: AIR ONE, the helicopter that joins at 4 stars. It
// shadows the player, sweeps a searchlight, and its marksmen pressure you
// from range; it leaves when the wanted level cools off.
'use strict';
window.SB = window.SB || {};

SB.spawnHeli = function () {
  const g = SB.G;
  if (g.units.some((u) => u.kind === 'heli' && !u.dead)) return;
  const p = g.player;
  const heli = {
    kind: 'heli', x: p.x + 420, y: p.y - 320, angle: 0, hp: 9999, dead: false,
    team: 'police', speed: 150, fireAt: 0, callsign: 'AIR ONE', role: 'AIR',
  };
  g.units.push(heli);
  SB.toast('Dispatch: AIR ONE is overhead.');
  SB.sfx.siren();
};
SB.updateHeli = function (dt) {
  const g = SB.G, p = g.player;
  for (const u of g.units) {
    if (u.kind !== 'heli' || u.dead) continue;
    const t = performance.now() / 600;
    const tx = p.x + Math.cos(t) * 150, ty = p.y + Math.sin(t) * 150;
    SB.moveToward(u, tx, ty, dt, u.speed);
    if (g.wanted >= 4 && performance.now() > u.fireAt && SB.dist(u.x, u.y, p.x, p.y) < 330) {
      u.fireAt = performance.now() + 1500;
      SB.fireBullet(u, p.x, p.y, 6, 'police');
    }
  }
  if (g.wanted < 4) g.units = g.units.filter((u) => u.kind !== 'heli');
};
