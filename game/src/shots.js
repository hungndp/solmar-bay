// Solmar Bay v8 — shots: deterministic staging for the four screenshots.
// Each ?shot= mode builds a real in-game scene with the live systems (the
// game still runs underneath; nothing here draws anything itself).
'use strict';
window.SB = window.SB || {};

SB.applyShot = function (mode) {
  const g = SB.G;
  g.started = true;
  const p = g.player;
  const frame = () => { g.camera.x = SB.clamp(p.x - 640, 0, SB.WORLD.w - 1280); g.camera.y = SB.clamp(p.y - 400, 0, SB.WORLD.h - 800); };
  if (mode === 'city') {
    p.x = 1760; p.y = 700;
    const car = SB.makeCar(p.x + 60, p.y + 26, 4, {});
    g.cars.push(car);
    SB.captureDistrict('docks'); SB.captureDistrict('marina');
    g.districtBanner = { text: 'CORAL HEIGHTS — NEUTRAL · 42', hint: SB.STANDING_HINTS.NEUTRAL, until: performance.now() + 600000 };
    SB.addStanding('downtown', 12);
  } else if (mode === 'chase') {
    p.x = 1760; p.y = 1240;
    const car = SB.makeCar(p.x, p.y, 4, {});
    car.angle = 0.4; car.speed = 96; car.damage = 34;
    g.cars.push(car); p.car = car; car.driver = 'player';
    SB.hireCrewSilent(2); SB.hireCrewSilent(1);
    g.wantedHeat = 3.4; g.wanted = 3; SB.syncResponse();
    g.wanted = 3;
    for (const u of g.units) if (u.kind === 'copcar') { u.x = p.x - SB.rand(120, 300); u.y = p.y + SB.rand(-90, 90); }
    SB.startNextMain();
    if (g.dialogue) g.dialogue = null;
  } else if (mode === 'briefing') {
    p.x = 1560; p.y = 1300;
    SB.startNextMain();
  } else if (mode === 'wreckwater') {
    g.boat = true; p.sailing = true;
    p.x = 640; p.y = 2660;
    SB.captureDistrict('beacon');
    g.districtBanner = { text: 'WRECKWATER SHOALS — DEEP WATER', hint: 'Golden Marlin water. Watch for the smuggler dealer.', until: performance.now() + 600000 };
    const fish = SB.rollFish(SB.FISH_SPOTS[5]);
    g.fishBag.push(fish);
  }
  frame();
};
// Hire without the greeting dialogue, for staging and save-free setups.
SB.hireCrewSilent = function (tierIdx) {
  const g = SB.G, def = SB.CREW[tierIdx], p = g.player;
  const member = SB.makeFighter(p.x - 30, p.y + 18, { team: 'crew', hp: def.hp, maxHp: def.hp, color: '#35b6f0', name: def.name });
  member.tierIdx = tierIdx; member.tier = def.tier; member.ability = def.ability; member.abilityName = def.abilityName; member.cooldownUntil = 0;
  g.crew.push(member);
  return member;
};
