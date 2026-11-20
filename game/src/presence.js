// Solmar Bay v8 — presence: the two "how the city sees you" systems the
// leaders show on screen. District standing (0-100 per district, with a
// label and an income effect) and the vehicle panel (model name, speed,
// damage % with a real wreck state and a per-percent repair price).
'use strict';
window.SB = window.SB || {};

// ---- District standing -------------------------------------------------
SB.STANDING_START = 30;
SB.standingLabel = function (v) {
  if (v < 25) return 'HOSTILE';
  if (v < 55) return 'NEUTRAL';
  if (v < 80) return 'FRIENDLY';
  return 'ALLIED';
};
SB.standingOf = function (districtId) {
  const g = SB.G;
  if (!g || !g.standing) return SB.STANDING_START;
  const v = g.standing[districtId];
  return v === undefined ? SB.STANDING_START : v;
};
SB.addStanding = function (districtId, delta) {
  const g = SB.G;
  if (!g.standing) g.standing = {};
  g.standing[districtId] = SB.clamp(SB.standingOf(districtId) + delta, 0, 100);
};
// Rackets pay more where the district likes you: FRIENDLY +10%, ALLIED +20%.
SB.standingPayMult = function (districtId) {
  const label = SB.standingLabel(SB.standingOf(districtId));
  if (label === 'ALLIED') return 1.2;
  if (label === 'FRIENDLY') return 1.1;
  return 1.0;
};
SB.STANDING_HINTS = {
  HOSTILE: 'Eyes on you here — the local gang runs this turf.',
  NEUTRAL: 'Nobody knows your name here yet. Work it.',
  FRIENDLY: 'Shopkeepers nod at you. Rackets pay +10% here.',
  ALLIED: 'This district would riot for you. Rackets pay +20% here.',
};
// Entering a district raises the banner the renderer draws.
SB.trackDistrict = function () {
  const g = SB.G, p = g.player;
  const d = SB.districtAt(p.x, p.y);
  if (d.id !== g.currentDistrict) {
    g.currentDistrict = d.id;
    if (d.id !== 'wild' && d.id !== 'wreck') {
      const v = Math.round(SB.standingOf(d.id));
      g.districtBanner = {
        text: `${d.name.toUpperCase()} — ${SB.standingLabel(v)} · ${v}`,
        hint: SB.STANDING_HINTS[SB.standingLabel(v)],
        until: performance.now() + 3400,
      };
    } else if (d.id === 'wreck') {
      g.districtBanner = { text: 'WRECKWATER SHOALS — DEEP WATER', hint: 'Golden Marlin water. Watch for the smuggler dealer.', until: performance.now() + 3400 };
    }
  }
};

// ---- Vehicle panel ------------------------------------------------------
// Damage is a property of the car, not the player: collisions add it, at
// 60% the car smokes and loses top speed, at 100% the engine is dead.
SB.damageVehicle = function (car, amount) {
  if (!car) return 0;
  car.damage = SB.clamp((car.damage || 0) + amount, 0, 100);
  if (car.damage >= 100 && !car.wrecked) {
    car.wrecked = true; car.speed = 0;
    SB.toast(car.model.name + ' is wrecked — engine dead.');
    SB.sfx.hit();
  }
  return car.damage;
};
SB.vehiclePanel = function (car) {
  if (!car) return null;
  const kmh = Math.round(Math.abs(car.speed) * 1.9);
  return {
    name: car.model.name, kmh, damage: Math.round(car.damage || 0),
    smoking: (car.damage || 0) >= 60, wrecked: !!car.wrecked,
    topKmh: Math.round(car.model.top * ((car.damage || 0) >= 60 ? 0.62 : 1) * 1.9),
  };
};
// Garage repair: $6 per percent of damage, back to a clean 0%.
SB.repairCost = function (car) { return Math.ceil((car && car.damage) || 0) * SB.REPAIR_PER_PCT; };
SB.repairVehicle = function (car) {
  const g = SB.G, cost = SB.repairCost(car);
  if (!car || cost <= 0) { SB.toast('Nothing to repair.'); return 0; }
  if (g.money < cost) { SB.toast('Repair needs $' + cost + '.'); return 0; }
  g.money -= cost; car.damage = 0; car.wrecked = false;
  SB.toast(car.model.name + ' repaired for $' + cost + '.');
  SB.sfx.cash();
  return cost;
};
