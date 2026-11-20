// Solmar Bay v8 — entities: cars, pedestrians, traffic, police units,
// guards and bullets. Movement and combat live here; who orders them
// around lives in response.js, gangs.js, crew.js and missions.js.
'use strict';
window.SB = window.SB || {};

let CAR_ID = 1;
SB.makeCar = function (x, y, modelIdx, opts) {
  const model = SB.CAR_MODELS[modelIdx % SB.CAR_MODELS.length];
  return Object.assign({
    id: CAR_ID++, kind: 'car', x, y, angle: SB.rand(0, Math.PI * 2), speed: 0,
    model, color: model.color, damage: 0, wrecked: false, driver: null,
    traffic: false, hp: 120,
  }, opts || {});
};
SB.spawnTraffic = function (n) {
  const g = SB.G;
  for (let i = 0; i < n; i++) {
    const p = SB.roadPoint();
    const car = SB.makeCar(p.x, p.y, SB.randInt(0, 5), { traffic: true });
    car.angle = SB.rng() < 0.5 ? 0 : Math.PI / 2;
    g.cars.push(car);
  }
};
SB.spawnPeds = function (n) {
  const g = SB.G;
  for (let i = 0; i < n; i++) {
    g.peds.push({
      kind: 'ped', x: SB.rand(200, SB.WORLD.w - 200), y: SB.rand(200, SB.WORLD.h - 200),
      angle: SB.rand(0, 6.28), speed: SB.rand(14, 30), hp: 20, dead: false,
      shirt: SB.pick(['#d86a4d', '#4d86d8', '#6ad84d', '#d8c84d', '#b04dd8', '#e8e8e8']),
      wanderAt: 0,
    });
  }
};
SB.updateTraffic = function (dt) {
  const g = SB.G;
  for (const c of g.cars) {
    if (!c.traffic || c.driver === 'player' || c.wrecked) continue;
    c.speed = SB.clamp(c.speed + 40 * dt, 0, 52);
    const nx = c.x + Math.cos(c.angle) * c.speed * dt, ny = c.y + Math.sin(c.angle) * c.speed * dt;
    if (SB.collides(nx, ny, 16) || SB.isWater(nx, ny)) { c.angle += Math.PI / 2 * (SB.rng() < 0.5 ? 1 : -1); c.speed = 10; }
    else { c.x = nx; c.y = ny; }
    if (SB.rng() < dt * 0.05) c.angle = Math.round(c.angle / (Math.PI / 2)) * (Math.PI / 2) + (SB.rng() < 0.3 ? Math.PI / 2 : 0);
  }
  for (const p of g.peds) {
    if (p.dead) continue;
    if (performance.now() > p.wanderAt) { p.angle = SB.rand(0, 6.28); p.wanderAt = performance.now() + SB.rand(1200, 4000); }
    const nx = p.x + Math.cos(p.angle) * p.speed * dt, ny = p.y + Math.sin(p.angle) * p.speed * dt;
    if (!SB.collides(nx, ny, 8) && !SB.isWater(nx, ny)) { p.x = nx; p.y = ny; }
  }
};
// Generic hostile/friendly fighter used for guards, attackers, marksmen.
SB.makeFighter = function (x, y, opts) {
  return Object.assign({
    kind: 'fighter', x, y, angle: 0, hp: 60, maxHp: 60, speed: 95, dead: false,
    team: 'gang', gang: '', color: '#888', fireAt: 0, name: '', temp: false, until: 0,
  }, opts || {});
};
SB.moveToward = function (e, tx, ty, dt, speed) {
  const d = SB.dist(e.x, e.y, tx, ty);
  if (d < 4) return d;
  const a = SB.angTo(e.x, e.y, tx, ty); e.angle = a;
  const nx = e.x + Math.cos(a) * (speed || e.speed) * dt, ny = e.y + Math.sin(a) * (speed || e.speed) * dt;
  if (!SB.collides(nx, ny, 10)) { e.x = nx; e.y = ny; }
  return d;
};
SB.fireBullet = function (from, tx, ty, dmg, team) {
  const g = SB.G, a = SB.angTo(from.x, from.y, tx, ty) + SB.rand(-0.03, 0.03);
  g.bullets.push({ x: from.x, y: from.y, vx: Math.cos(a) * 620, vy: Math.sin(a) * 620, dmg, team, life: 0.55 });
};
SB.updateBullets = function (dt) {
  const g = SB.G, p = g.player;
  g.bullets = g.bullets.filter((b) => {
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    if (b.life <= 0 || SB.collides(b.x, b.y, 2)) return false;
    if (b.team !== 'player') {
      const targetCar = p.car;
      if (SB.dist(b.x, b.y, p.x, p.y) < (targetCar ? 20 : 12)) { SB.hurtPlayer(b.dmg * (targetCar ? 0.4 : 1)); return false; }
      for (const m of g.crew) if (!m.dead && SB.dist(b.x, b.y, m.x, m.y) < 12) { m.hp -= b.dmg; if (m.hp <= 0) m.dead = true; return false; }
    } else {
      for (const u of [...g.units, ...g.fighters]) {
        if (!u.dead && u.team !== 'crew' && SB.dist(b.x, b.y, u.x, u.y) < 13) { SB.damageFighter(u, b.dmg); return false; }
      }
    }
    return true;
  });
};
SB.damageFighter = function (u, dmg) {
  u.hp -= dmg;
  if (u.hp <= 0 && !u.dead) {
    u.dead = true;
    if (u.team === 'gang') { SB.G.stats.kills++; SB.addRespect(2); }
    if (u.team === 'police') SB.addWanted(0.34);
    SB.sfx.hit();
  }
};
SB.hurtPlayer = function (dmg) {
  const g = SB.G, p = g.player;
  if (p.car) { SB.damageVehicle(p.car, dmg * 0.25); return; }
  const absorbed = Math.min(g.armor, dmg * 0.6); g.armor -= absorbed;
  p.hp -= (dmg - absorbed);
  if (p.hp <= 0) SB.onPlayerDown();
};
