// Solmar Bay v8 — weapons: the 8-slot wheel, shooting, molotovs and heat.
// A silent weapon (the Nail Gun) raises far less wanted heat; the rifle is
// gated behind main mission 13, the smuggler's price.
'use strict';
window.SB = window.SB || {};

SB.weaponById = (id) => SB.WEAPONS.find((w) => w.id === id);
SB.currentWeapon = function () { return SB.weaponById(SB.G.weapon) || SB.WEAPONS[0]; };
SB.ownsWeapon = function (id) { return SB.G.weaponsOwned.has(id); };
SB.buyWeapon = function (id) {
  const g = SB.G, w = SB.weaponById(id);
  if (!w || SB.ownsWeapon(id)) return false;
  if (w.unlockMain && g.stats.mainDone + 1 < w.unlockMain) { SB.toast(w.name + ' unlocks at main mission ' + w.unlockMain + '.'); return false; }
  if (g.money < w.price) { SB.toast('Need $' + w.price + ' for the ' + w.name + '.'); return false; }
  g.money -= w.price;
  g.weaponsOwned.add(id);
  g.ammo[id] = (g.ammo[id] || 0) + w.ammo;
  g.weapon = id;
  SB.toast('Bought the ' + w.name + ' for $' + w.price + '.');
  SB.sfx.cash();
  return true;
};
SB.buyAmmo = function (suspect) {
  const g = SB.G, w = SB.currentWeapon();
  const cost = suspect ? SB.AMMO_MAG : SB.AMMO_BOX;
  if (w.id === 'fists' || g.money < cost) return false;
  g.money -= cost;
  g.ammo[w.id] = (g.ammo[w.id] || 0) + Math.max(6, Math.round(w.ammo / 2));
  SB.toast('Ammo for the ' + w.name + ': -$' + cost + '.');
  return true;
};
SB.buyMolotov = function () {
  const g = SB.G;
  if (g.money < SB.MOLOTOV.price) return false;
  g.money -= SB.MOLOTOV.price; g.molotovs++;
  SB.toast('Molotov bought: -$' + SB.MOLOTOV.price + '.');
  return true;
};
SB.cycleWeapon = function (dir) {
  const g = SB.G;
  const owned = SB.WEAPONS.filter((w) => SB.ownsWeapon(w.id));
  let i = owned.findIndex((w) => w.id === g.weapon);
  i = (i + dir + owned.length) % owned.length;
  g.weapon = owned[i].id;
  SB.toast(owned[i].name);
};
SB.playerShoot = function (now) {
  const g = SB.G, p = g.player, w = SB.currentWeapon();
  if (now - (p.lastShot || 0) < w.rate) return;
  if (w.id !== 'fists' && (g.ammo[w.id] || 0) <= 0) { SB.toast('Out of ammo — the garage sells boxes.'); p.lastShot = now; return; }
  p.lastShot = now;
  if (w.id !== 'fists') g.ammo[w.id]--;
  const cam = g.camera;
  const tx = SB.mouse.x + cam.x, ty = SB.mouse.y + cam.y;
  if (w.id === 'fists') {
    for (const u of [...g.fighters, ...g.units]) {
      if (!u.dead && SB.dist(p.x, p.y, u.x, u.y) < w.range) {
        let dmg = w.dmg;
        if (g.crew.some((m) => !m.dead && m.ability === 'muscle')) dmg *= 1.8; // Mama Jo's MUSCLE
        SB.damageFighter(u, dmg);
      }
    }
    return;
  }
  const pellets = w.id === 'sawed' || w.id === 'double' ? 4 : 1;
  for (let i = 0; i < pellets; i++) SB.fireBullet(p, tx + SB.rand(-14, 14), ty + SB.rand(-14, 14), w.dmg, 'player');
  SB.sfx.shot();
  SB.addWanted(0.06 * w.heat);
};
SB.throwMolotov = function () {
  const g = SB.G, p = g.player;
  if (g.molotovs <= 0) { SB.toast('No molotovs — $350 at the garage.'); return; }
  g.molotovs--;
  const cam = g.camera, tx = SB.mouse.x + cam.x, ty = SB.mouse.y + cam.y;
  for (const u of [...g.fighters, ...g.units]) {
    if (!u.dead && SB.dist(tx, ty, u.x, u.y) < SB.MOLOTOV.radius) SB.damageFighter(u, SB.MOLOTOV.dmg);
  }
  g.fires.push({ x: tx, y: ty, until: performance.now() + 2600, r: SB.MOLOTOV.radius });
  SB.addWanted(0.3);
  SB.sfx.hit();
};
