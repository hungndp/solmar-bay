// Solmar Bay v8 — gangs: turf over 6 districts, per-district rackets,
// rival assaults with named wave leaders, the cash-convoy event, sieges
// and truces. Holding a district pays every day; losing a defence loses it.
'use strict';
window.SB = window.SB || {};

SB.holderOf = function (districtId) {
  const g = SB.G;
  if (g.held.has(districtId)) return 'Reef Kings';
  const d = SB.DISTRICTS.find((x) => x.id === districtId);
  return d ? d.gang : '—';
};
SB.captureDistrict = function (districtId) {
  const g = SB.G;
  if (!g.held.has(districtId)) {
    g.held.add(districtId);
    SB.addStanding(districtId, 15);
    SB.addRespect(15);
    SB.toast(SB.DISTRICTS.find((d) => d.id === districtId).name + ' is Reef Kings turf now.');
    SB.checkAchievements();
  }
};
SB.loseDistrict = function (districtId) {
  const g = SB.G;
  g.held.delete(districtId);
  delete g.rackets[districtId];
  SB.addStanding(districtId, -20);
};
// Start an assault on a held district: exactly 4 attackers, named wave.
SB.startAssault = function (districtId) {
  const g = SB.G;
  const d = SB.DISTRICTS.find((x) => x.id === districtId) || SB.DISTRICTS[0];
  const gang = d.gang;
  const wave = SB.nameWave(gang);
  const cx = d.x + d.w / 2, cy = d.y + d.h / 2;
  const attackers = [];
  for (let i = 0; i < 4; i++) {
    const a = SB.makeFighter(cx + SB.rand(-70, 70), cy + SB.rand(-70, 70), {
      team: 'gang', gang, hp: 55, color: SB.GANGS[gang].color, wave: true, name: wave.leader + "'s crew",
    });
    g.fighters.push(a); attackers.push(a);
  }
  g.assault = { district: d.id, attackers, wave };
  const boss = SB.GANGS[gang].boss;
  SB.openDialogue([{ speaker: boss, lines: [`${wave.banner}.`, 'Four of mine are coming for ' + d.name + '. Hold it, or lose it.'] }]);
  SB.toast(wave.banner);
  return attackers;
};
SB.resolveAssaults = function () {
  const g = SB.G;
  if (!g.assault) return;
  const alive = g.assault.attackers.filter((a) => !a.dead);
  if (alive.length === 0) {
    g.money += SB.ASSAULT_REWARD;
    g.stats.defences++;
    SB.addStanding(g.assault.district, 10);
    SB.addRespect(10);
    SB.toast('District held! +$' + SB.ASSAULT_REWARD + ' defence bounty.');
    SB.sfx.cash();
    g.assault = null;
    SB.checkAchievements();
  }
};
SB.failAssault = function () {
  const g = SB.G;
  if (!g.assault) return;
  SB.loseDistrict(g.assault.district);
  SB.toast('The district fell to ' + g.assault.wave.gang + '.');
  g.assault = null;
};
// Daily tick: turf income, racket income (with the standing bonus and the
// fishing-tax sell bonus), maybe an assault, siege or a convoy.
SB.advanceDay = function () {
  const g = SB.G;
  g.day++;
  let income = SB.TURF_INCOME * g.held.size;
  if (g.safehouse2) income = Math.round(income * 1.5);
  let racketIncome = 0, heat = 0;
  for (const id of g.held) {
    const r = g.rackets[id];
    if (r) {
      racketIncome += Math.round(SB.RACKETS[r].pay * SB.standingPayMult(id));
      if (r === 'smuggling') heat += 0.4;
    }
    SB.addStanding(id, 5); // holding a district slowly wins it over
  }
  const total = income + racketIncome;
  g.money += total;
  if (heat) SB.addWanted(heat);
  if (g.truceDays > 0) g.truceDays--;
  else if (g.held.size >= 5 && SB.rng() < 0.4) {
    const ids = [...g.held];
    SB.startAssault(SB.pick(ids));
    SB.startAssault(SB.pick(ids)); // siege: a double assault
    SB.toast('SIEGE! Two gangs hit your turf at once.');
  } else if (g.held.size >= 1 && SB.rng() < 0.45) {
    SB.startAssault(SB.pick([...g.held]));
  }
  if (SB.rng() < 0.35) SB.spawnConvoy();
  SB.resetDailyChain();
  SB.toast(`Day ${g.day}: turf + racket income +$${total}.`);
  SB.saveGame();
  return total;
};
SB.buyTruce = function () {
  const g = SB.G;
  if (g.money < SB.TRUCE_COST) { SB.toast('A truce costs $' + SB.TRUCE_COST + '.'); return false; }
  g.money -= SB.TRUCE_COST; g.truceDays = 2;
  SB.toast('Truce bought: 2 assault-free days.');
  return true;
};
SB.setRacket = function (districtId, racket) {
  const g = SB.G;
  if (!g.held.has(districtId)) { SB.toast('You do not hold that district.'); return false; }
  g.rackets[districtId] = racket;
  SB.toast(SB.RACKETS[racket].name + ' racket set: $' + SB.RACKETS[racket].pay + '/day (' + SB.RACKETS[racket].note + ').');
  return true;
};
// The cash convoy: a rival van crossing the map; stop it for $800 + Respect.
SB.spawnConvoy = function () {
  const g = SB.G;
  if (g.convoy) return null;
  const van = SB.makeCar(240, SB.rand(400, 2400), 5, { traffic: false });
  van.color = '#5a3a6e'; van.convoy = true; van.hp = 160; van.angle = 0; van.speed = 46;
  g.cars.push(van); g.convoy = van;
  SB.toast('A rival cash convoy is crossing the bay — intercept it!');
  return van;
};
SB.updateConvoy = function (dt) {
  const g = SB.G, v = g.convoy;
  if (!v) return;
  v.x += Math.cos(v.angle) * v.speed * dt;
  if (v.hp <= 0 || v.wrecked) {
    g.money += SB.CONVOY_REWARD; SB.addRespect(12);
    SB.toast('Convoy stopped! +$' + SB.CONVOY_REWARD + '.');
    SB.sfx.cash();
    g.convoy = null;
  } else if (v.x > SB.WORLD.w - 80) { g.convoy = null; SB.toast('The convoy got away.'); }
};
SB.updateFighters = function (dt) {
  const g = SB.G, p = g.player, now = performance.now();
  for (const f of g.fighters) {
    if (f.dead || f.team === 'crew' || f.name === 'Courier') continue;
    if (f.guardTarget && SB.dist(f.x, f.y, p.x, p.y) > 260) { SB.moveToward(f, f.guardTarget.x, f.guardTarget.y, dt, f.speed); continue; }
    const d = SB.moveToward(f, p.x, p.y, dt, f.speed);
    if (d < 240 && now > (f.fireAt || 0)) { f.fireAt = now + SB.rand(800, 1300); SB.fireBullet(f, p.x, p.y, 7, 'gang'); }
  }
  if (g.assault && g.player.hp < 30 && g.assault.attackers.some((a) => !a.dead)) {
    // A defence can still be lost the hard way: going down in your own
    // district during an assault hands it over (handled in main.js too).
  }
  SB.resolveAssaults();
};
