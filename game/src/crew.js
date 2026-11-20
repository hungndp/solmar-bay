// Solmar Bay v8 — crew: named hires with signature abilities. Each tier is
// a person (config.js SB.CREW); they follow, ride along, and fight beside
// you, and two of them carry hotkey abilities with cooldowns.
'use strict';
window.SB = window.SB || {};

SB.crewDiscount = function () {
  // 5% per held district, capped at 30%: a Soldier at 2 districts costs
  // $2,200 x 0.9 = $1,980.
  const held = SB.G ? SB.G.held.size : 0;
  return Math.min(0.3, held * 0.05);
};
SB.crewPrice = function (tierIdx) {
  return Math.round(SB.CREW[tierIdx].price * (1 - SB.crewDiscount()));
};
SB.crewSlots = function () { return SB.G.held.size >= 4 ? 3 : 2; };
SB.hireCrew = function (tierIdx) {
  const g = SB.G, def = SB.CREW[tierIdx];
  if (!def) return null;
  if (g.crew.filter((m) => !m.temp).length >= SB.crewSlots()) { SB.toast('Crew is full — hold 4 districts for a 3rd slot.'); return null; }
  if (def.needsDistricts && g.held.size < def.needsDistricts) { SB.toast(def.name + ' only joins when you hold ' + def.needsDistricts + ' districts.'); return null; }
  if (g.crew.some((m) => m.tierIdx === tierIdx && !m.dead)) { SB.toast(def.name + ' is already with you.'); return null; }
  const price = SB.crewPrice(tierIdx);
  if (g.money < price) { SB.toast(def.name + ' needs $' + price + '.'); return null; }
  g.money -= price;
  const p = g.player;
  const member = SB.makeFighter(p.x + SB.rand(-30, 30), p.y + SB.rand(-30, 30), {
    team: 'crew', hp: def.hp, maxHp: def.hp, color: '#35b6f0', name: def.name,
  });
  member.tierIdx = tierIdx; member.tier = def.tier; member.ability = def.ability;
  member.abilityName = def.abilityName; member.cooldownUntil = 0;
  g.crew.push(member);
  SB.openDialogue([{ speaker: def.name === 'Old Finn' ? 'Harbourmaster Cole' : 'Lena Cruz', lines: [`${def.name} joins the Reef Kings.`, `${def.abilityName}: ${def.desc}`] }]);
  SB.toast(`${def.name} (${def.tier}) hired for $${price}. ${def.abilityName}.`);
  SB.sfx.cash();
  return member;
};
// Rhea's SMOKE SCREEN: breaks line-of-sight, wanted decays fast for 5 s.
SB.useSmokeScreen = function () {
  const g = SB.G, rhea = g.crew.find((m) => !m.dead && m.ability === 'smoke');
  if (!rhea || performance.now() < rhea.cooldownUntil) return false;
  rhea.cooldownUntil = performance.now() + SB.CREW[rhea.tierIdx].cooldown * 1000;
  g.smokeUntil = performance.now() + 5000;
  g.fires.push({ x: g.player.x, y: g.player.y, until: performance.now() + 1200, r: 70, smoke: true });
  SB.toast('Rhea pops a SMOKE SCREEN — break line-of-sight!');
  return true;
};
// Old Finn's CALL THE CREW: exactly 2 temporary backup fighters, 30 s.
SB.callTheCrew = function () {
  const g = SB.G, finn = g.crew.find((m) => !m.dead && m.ability === 'call');
  if (!finn || performance.now() < finn.cooldownUntil) return 0;
  finn.cooldownUntil = performance.now() + SB.CREW[finn.tierIdx].cooldown * 1000;
  const p = g.player; let added = 0;
  for (let i = 0; i < 2; i++) {
    const b = SB.makeFighter(p.x + SB.rand(-46, 46), p.y + SB.rand(-46, 46), {
      team: 'crew', hp: 110, maxHp: 110, color: '#7fd0f5', name: 'Backup ' + (i + 1), temp: true,
      until: performance.now() + 30000,
    });
    b.ability = 'cover';
    g.crew.push(b); added++;
  }
  SB.toast('Old Finn: CALL THE CREW — 2 backup fighters, 30 seconds.');
  return added;
};
SB.updateCrew = function (dt) {
  const g = SB.G, p = g.player, now = performance.now();
  g.crew = g.crew.filter((m) => !m.dead && !(m.temp && now > m.until));
  g.crew.forEach((m, i) => {
    const anchor = p.car || p;
    const tx = anchor.x - Math.cos(anchor.angle || 0) * (34 + i * 16), ty = anchor.y - Math.sin(anchor.angle || 0) * (34 + i * 16);
    const d = SB.moveToward(m, tx, ty, dt, SB.dist(m.x, m.y, tx, ty) > 130 ? 210 : 105);
    if (d < 26) { m.x = anchor.x + SB.rand(-2, 2); }
    // COVER FIRE (Bruno, and Finn's backups): shoot the nearest hostile.
    if (m.ability === 'cover' && now > (m.fireAt || 0)) {
      const foes = [...g.fighters, ...g.units].filter((u) => !u.dead && u.team !== 'crew');
      let best = null, bd = 300;
      for (const f of foes) { const dd = SB.dist(m.x, m.y, f.x, f.y); if (dd < bd) { bd = dd; best = f; } }
      if (best) { m.fireAt = now + 620; SB.fireBullet(m, best.x, best.y, 10, 'player'); }
    }
    // MUSCLE (Mama Jo): assault attackers near her may flee while losing.
    if (m.ability === 'muscle') {
      for (const f of g.fighters) {
        if (!f.dead && f.wave && SB.dist(m.x, m.y, f.x, f.y) < 90 && g.fighters.filter((x) => x.wave && !x.dead).length <= 2 && SB.rng() < dt * 0.5) {
          f.dead = true; SB.toast('A wave attacker flees from Mama Jo.');
        }
      }
    }
  });
};
SB.crewPanel = function () {
  const now = performance.now();
  return SB.G.crew.filter((m) => !m.dead).map((m) => ({
    name: m.name, tier: m.tier || 'Backup', ability: m.ability, abilityName: m.abilityName || 'COVER FIRE',
    cooldownLeft: Math.max(0, Math.ceil(((m.cooldownUntil || 0) - now) / 1000)),
  }));
};
