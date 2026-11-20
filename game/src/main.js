// Solmar Bay v8 — main: game state, the loop, driving and walking, the
// wanted system, police behaviour, menus, saving, and the day cycle.
// Everything else is a module this file calls into.
'use strict';
window.SB = window.SB || {};

SB.toast = function (msg) {
  const g = SB.G; if (!g) { console.log(msg); return; }
  g.toasts.push({ msg, until: performance.now() + 3600 });
  if (g.toasts.length > 4) g.toasts.shift();
};
SB.newGame = function () {
  const g = {
    started: false, paused: false, over: false, menu: null, garageIdx: 0, missionIdx: 0,
    money: SB.START.money, respect: 0, armor: 0, day: 1, dayT: 0,
    player: { x: SB.START.x, y: SB.START.y, angle: 0, hp: 100, car: null, lastShot: 0, sailing: false },
    camera: { x: 0, y: 0 },
    cars: [], peds: [], units: [], fighters: [], crew: [], bullets: [], fires: [],
    wanted: 0, wantedHeat: 0, smokeUntil: 0,
    held: new Set(), rackets: {}, standing: {}, currentDistrict: '', districtBanner: null,
    weaponsOwned: new Set(['fists']), weapon: 'fists', ammo: {}, molotovs: 0,
    fishBag: [], rod: 0, boat: false, safehouse2: false, ownedCar: null,
    carUpgrades: { engine: 0, armor: 0 },
    mission: null, mainNext: 0, gig: null, drop: null, chain: { done: 0, streak: 0 },
    assault: null, convoy: null, roadblock: null, truceDays: 0,
    dialogue: null, toasts: [], achievements: new Set(),
    stats: { missions: 0, mainDone: 0, fish: 0, marlin: 0, kills: 0, defences: 0 },
    flags: {},
  };
  SB.G = g;
  SB.world = SB.buildWorld();
  SB.spawnTraffic(15);
  SB.spawnPeds(22);
  // A first car near the spawn so the bay is drivable from minute one.
  g.cars.push(SB.makeCar(SB.START.x + 70, SB.START.y + 20, 1, {}));
  for (const d of SB.DISTRICTS) g.standing[d.id] = SB.STANDING_START;
  return g;
};
SB.addWanted = function (n) {
  const g = SB.G;
  g.wantedHeat = SB.clamp(g.wantedHeat + n, 0, 5);
  const stars = Math.floor(g.wantedHeat);
  if (stars !== g.wanted) {
    g.wanted = stars;
    SB.syncResponse();
  }
};
// Spawn or trim the response to match the wanted level's plan.
SB.syncResponse = function () {
  const g = SB.G, plan = SB.responsePlan(g.wanted), p = g.player;
  const cars = g.units.filter((u) => u.kind === 'copcar' && !u.dead);
  while (cars.length < plan.cars) {
    const a = SB.rand(0, Math.PI * 2);
    const u = {
      kind: 'copcar', x: p.x + Math.cos(a) * 430, y: p.y + Math.sin(a) * 430, angle: 0,
      hp: 90, dead: false, team: 'police', speed: 172, behavior: cars.length % 2 ? 'ram' : 'chase', fireAt: 0,
    };
    SB.callsignFor(u);
    g.units.push(u); cars.push(u);
  }
  while (cars.length > plan.cars) { const u = cars.pop(); u.dead = true; }
  g.units = g.units.filter((u) => !u.dead || u.kind === 'heli');
  const marks = g.units.filter((u) => u.kind === 'marksman' && !u.dead);
  while (marks.length > plan.marksmen) { const u = marks.pop(); u.dead = true; }
  g.units = g.units.filter((u) => !u.dead || u.kind === 'heli');
  while (marks.length < plan.marksmen) {
    const m = SB.makeFighter(p.x + SB.rand(-260, 260), p.y + SB.rand(-260, 260), { team: 'police', hp: 50, color: '#20304a' });
    m.kind = 'marksman'; SB.callsignFor(m);
    g.units.push(m); marks.push(m);
  }
  if (plan.heli) SB.spawnHeli();
  if (plan.roadblock) SB.spawnRoadblock();
};
SB.updatePolice = function (dt) {
  const g = SB.G, p = g.player, now = performance.now();
  for (const u of g.units) {
    if (u.dead || u.kind === 'heli') continue;
    if (u.kind === 'marksman') {
      const d = SB.dist(u.x, u.y, p.x, p.y);
      if (d > 200) SB.moveToward(u, p.x, p.y, dt, 80);
      else if (now > (u.fireAt || 0)) { u.fireAt = now + 1400; SB.fireBullet(u, p.x, p.y, 8, 'police'); }
      continue;
    }
    // Cop cars: interceptors cut ahead of the player's line, rams collide.
    let tx = p.x, ty = p.y;
    if (u.behavior !== 'ram' && p.car) { tx += Math.cos(p.car.angle) * 90; ty += Math.sin(p.car.angle) * 90; }
    const d = SB.moveToward(u, tx, ty, dt, u.speed * (u.behavior === 'ram' ? 1.05 : 1));
    u.angle = SB.angTo(u.x, u.y, tx, ty);
    if (d < 30 && p.car) SB.damageVehicle(p.car, dt * 14);
    if (d < 210 && !p.car && now > (u.fireAt || 0)) { u.fireAt = now + 1600; SB.fireBullet(u, p.x, p.y, 5, 'police'); }
    if (d < 26 && !p.car) SB.hurtPlayer(dt * 20);
  }
  g.units = g.units.filter((u) => !u.dead || u.kind === 'heli');
  // Wanted cools when you break line-of-sight; Rhea's smoke triples it.
  const near = g.units.some((u) => !u.dead && SB.dist(u.x, u.y, p.x, p.y) < 320);
  if (!near || now < g.smokeUntil) {
    const rate = now < g.smokeUntil ? 0.09 : 0.012;
    g.wantedHeat = Math.max(0, g.wantedHeat - rate * dt * 10);
    const stars = Math.floor(g.wantedHeat);
    if (stars !== g.wanted) { g.wanted = stars; SB.syncResponse(); }
  }
};
SB.onPlayerDown = function () {
  const g = SB.G, p = g.player;
  if (g.assault) SB.failAssault();
  p.hp = 100; g.money = Math.max(0, g.money - 200);
  p.car = null; p.x = SB.START.x; p.y = SB.START.y;
  g.wantedHeat = 0; g.wanted = 0; g.units = []; g.roadblock = null;
  SB.toast('Wasted — the bay spits you back out at the stash house, $200 lighter.');
  SB.saveGame();
};
SB.saveGame = function () {
  const g = SB.G; if (!g) return;
  try {
    localStorage.setItem(SB.SAVE_KEY, JSON.stringify({
      money: g.money, respect: g.respect, day: g.day, mainNext: g.mainNext,
      held: [...g.held], rackets: g.rackets, standing: g.standing,
      weaponsOwned: [...g.weaponsOwned], weapon: g.weapon, ammo: g.ammo,
      molotovs: g.molotovs, rod: g.rod, boat: g.boat, safehouse2: g.safehouse2,
      stats: g.stats, achievements: [...g.achievements], chain: g.chain,
      crewTiers: g.crew.filter((m) => !m.temp).map((m) => m.tierIdx),
    }));
  } catch (err) { /* storage may be unavailable; the game still plays */ }
};
SB.loadGame = function () {
  try {
    const raw = localStorage.getItem(SB.SAVE_KEY);
    if (!raw) return false;
    const s = JSON.parse(raw), g = SB.G;
    Object.assign(g, {
      money: s.money, respect: s.respect, day: s.day, mainNext: s.mainNext,
      rackets: s.rackets || {}, standing: s.standing || {}, molotovs: s.molotovs || 0,
      rod: s.rod || 0, boat: !!s.boat, safehouse2: !!s.safehouse2, stats: s.stats || g.stats,
      chain: s.chain || g.chain, weapon: s.weapon || 'fists', ammo: s.ammo || {},
    });
    g.held = new Set(s.held || []);
    g.weaponsOwned = new Set(s.weaponsOwned || ['fists']);
    g.achievements = new Set(s.achievements || []);
    for (const t of s.crewTiers || []) {
      const def = SB.CREW[t], p = g.player;
      const member = SB.makeFighter(p.x + 24, p.y + 10, { team: 'crew', hp: def.hp, maxHp: def.hp, color: '#35b6f0', name: def.name });
      member.tierIdx = t; member.tier = def.tier; member.ability = def.ability; member.abilityName = def.abilityName; member.cooldownUntil = 0;
      g.crew.push(member);
    }
    return true;
  } catch (err) { return false; }
};
SB.enterExitCar = function () {
  const g = SB.G, p = g.player;
  if (p.car) {
    p.x = p.car.x + 26; p.y = p.car.y + 10; p.car.driver = null; p.car = null;
    SB.setEngine(0);
    return;
  }
  if (p.sailing) { p.sailing = false; p.x = 700; p.y = 1560; SB.toast('Back ashore at the ferry dock.'); return; }
  let best = null, bd = 52;
  for (const c of g.cars) { const d = SB.dist(p.x, p.y, c.x, c.y); if (d < bd) { bd = d; best = c; } }
  if (best) {
    if (best.traffic) { best.traffic = false; SB.addWanted(0.5); SB.toast('Carjacked a ' + best.model.name + '!'); }
    p.car = best; best.driver = 'player';
    if (best.convoy) { best.hp -= 40; }
    return;
  }
  // At the marina with a boat owned, E puts you on the water.
  const marina = SB.landmark('Sunset Marina');
  if (g.boat && SB.dist(p.x, p.y, marina.x, marina.y) < 130) {
    p.sailing = true; p.x = 300; p.y = 2100;
    SB.toast('Sailing. Wreckwater Shoals lie south-west; the Cove is east.');
  }
};
SB.updatePlayer = function (dt) {
  const g = SB.G, p = g.player;
  if (SB.pressed.KeyE) {
    if (g.dialogue) SB.advanceDialogue();
    else if (g.menu) SB.closeMenu();
    else if (SB.nearGarage()) SB.openMenu('garage');
    else SB.enterExitCar();
  }
  if (SB.pressed.KeyF) { if (SB.fishing.state === 'bite') SB.reelIn(); else SB.startCast(); }
  if (SB.pressed.KeyQ) SB.useSmokeScreen();
  if (SB.pressed.KeyC) SB.callTheCrew();
  if (SB.pressed.KeyG) SB.throwMolotov();
  if (SB.pressed.KeyT) SB.cycleRadio();
  if (SB.pressed.KeyM) SB.openMenu('missions');
  if (SB.pressed.KeyB) SB.startBranch(SB.randInt(0, 44));
  if (SB.pressed.KeyN) SB.startNextMain();
  if (SB.pressed.KeyJ) SB.startDrop();
  if (SB.pressed.KeyH) SB.startGig();
  if (SB.pressed.Tab) { SB.cycleWeapon(1); }
  if (p.car) {
    const car = p.car;
    const up = SB.keys.KeyW || SB.keys.ArrowUp, down = SB.keys.KeyS || SB.keys.ArrowDown;
    const dmgTop = (car.damage || 0) >= 60 ? 0.62 : 1;
    const top = car.model.top * dmgTop * (1 + g.carUpgrades.engine * 0.12);
    if (car.wrecked) car.speed = 0;
    else if (up) car.speed = Math.min(top, car.speed + 130 * dt);
    else if (down) car.speed = Math.max(-top * 0.4, car.speed - 110 * dt);
    else car.speed *= Math.max(0, 1 - 1.6 * dt);
    const steer = SB.axisX();
    if (steer && car.speed !== 0) car.angle += steer * dt * 1.9 * Math.sign(car.speed);
    const nx = car.x + Math.cos(car.angle) * car.speed * dt, ny = car.y + Math.sin(car.angle) * car.speed * dt;
    if (SB.collides(nx, ny, 16)) {
      if (Math.abs(car.speed) > 60) {
        const hit = Math.abs(car.speed) * 0.09 / (g.carUpgrades.armor ? 2 : 1);
        SB.damageVehicle(car, hit);
        SB.sfx.hit();
      }
      car.speed *= -0.3;
    } else if (SB.isWater(nx, ny)) { car.speed *= 0.94; car.x = nx; car.y = ny; }
    else { car.x = nx; car.y = ny; }
    p.x = car.x; p.y = car.y; p.angle = car.angle;
    SB.setEngine(Math.abs(car.speed) / 200);
  } else if (p.sailing) {
    const sp = 120;
    p.x = SB.clamp(p.x + SB.axisX() * sp * dt, 60, SB.WORLD.w - 60);
    p.y = SB.clamp(p.y + SB.axisY() * sp * dt, 1500, SB.WORLD.h - 60);
    if (SB.pressed.KeyE) { /* handled above */ }
  } else {
    const sp = SB.keys.ShiftLeft ? 200 : 118;
    const nx = p.x + SB.axisX() * sp * dt, ny = p.y + SB.axisY() * sp * dt;
    if (!SB.collides(nx, p.y, 10)) p.x = nx;
    if (!SB.collides(p.x, ny, 10)) p.y = ny;
    if (SB.axisX() || SB.axisY()) p.angle = Math.atan2(SB.axisY(), SB.axisX());
    SB.setEngine(0);
  }
  if (SB.mouse.down && !g.dialogue && !g.menu) SB.playerShoot(performance.now());
  p.x = SB.clamp(p.x, 16, SB.WORLD.w - 16); p.y = SB.clamp(p.y, 16, SB.WORLD.h - 16);
};
SB.openMenu = function (kind) { SB.G.menu = kind; SB.G.paused = kind === 'pause'; SB.sfx.ui(); };
SB.closeMenu = function () { SB.G.menu = null; SB.G.paused = false; };
SB.updateShell = function () {
  const g = SB.G;
  if (!g.started) {
    if (SB.pressed.Enter || SB.mouse.clicked) { g.started = true; SB.initAudio(); SB.toast('Welcome to Solmar Bay, Jace.'); }
    return;
  }
  if (SB.pressed.KeyP || SB.pressed.Escape) {
    if (g.menu === 'pause') SB.closeMenu();
    else if (!g.menu) SB.openMenu('pause');
    else SB.closeMenu();
  }
  if (g.dialogue && SB.mouse.clicked) SB.advanceDialogue();
  if (g.menu === 'garage') {
    const digits = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0'];
    const items = SB.garageMenu();
    digits.forEach((code, i) => {
      if (SB.pressed[code] && items[i]) { g.garageIdx = i; SB.garageBuy(items[i].id); }
    });
    // Two-digit picks for the long garage list: shift+digit buys items 10-19.
    if (SB.keys.ShiftLeft || SB.keys.ShiftRight) digits.forEach((code, i) => {
      if (SB.pressed[code] && items[i + 10]) SB.garageBuy(items[i + 10].id);
    });
  }
};
let lastT = 0;
SB.loop = function (t) {
  requestAnimationFrame(SB.loop);
  const dt = Math.min(0.05, (t - lastT) / 1000 || 0.016); lastT = t;
  const g = SB.G;
  SB.updateShell();
  if (!g || !g.started || g.paused || g.dialogue || g.menu) { SB.render(); SB.endFrameInput(); return; }
  g.dayT += dt;
  if (g.dayT >= SB.WORLD.dayLength) { g.dayT = 0; SB.advanceDay(); }
  SB.updatePlayer(dt);
  SB.updateTraffic(dt);
  SB.updatePolice(dt);
  SB.updateHeli(dt);
  SB.updateRoadblocks();
  SB.updateCrew(dt);
  SB.updateFighters(dt);
  SB.updateBullets(dt);
  SB.updateMission(dt);
  SB.updateGig(); SB.updateDrop(); SB.updateConvoy(dt);
  SB.updateFishing(performance.now());
  SB.updateRadio(performance.now());
  SB.trackDistrict();
  g.fires = g.fires.filter((f) => performance.now() < f.until);
  const cam = g.camera, p = g.player;
  cam.x = SB.clamp(p.x - 640, 0, Math.max(0, SB.WORLD.w - 1280));
  cam.y = SB.clamp(p.y - 400, 0, Math.max(0, SB.WORLD.h - 800));
  SB.render();
  SB.endFrameInput();
};
SB.boot = function () {
  const canvas = document.getElementById('game');
  SB.ctx = canvas.getContext('2d');
  SB.initInput(canvas);
  SB.newGame();
  const loaded = SB.loadGame();
  if (loaded) SB.toast('Save loaded — welcome back to Solmar Bay.');
  const q = new URLSearchParams(location.search);
  if (q.get('shot')) SB.applyShot(q.get('shot'));
  else if (q.get('autostart')) { SB.G.started = true; SB.initAudio(); }
  canvas.addEventListener('mousedown', () => SB.initAudio());
  requestAnimationFrame(SB.loop);
};
document.addEventListener('DOMContentLoaded', SB.boot);
