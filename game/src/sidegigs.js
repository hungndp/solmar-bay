// Solmar Bay v8 — sidegigs: the Bay Gigs and the daily delivery chain.
// Gigs are the always-available earn loop between missions: taxi fares,
// couriers, a boat ferry, tow-truck recovery and a night courier with a
// time bonus. The chain is 5 drops a day; finishing days in a row grows
// the streak bonus by +25% a day.
'use strict';
window.SB = window.SB || {};

SB.GIG_TYPES = [
  { id: 'taxi', name: 'Taxi fare', pay: 130, note: 'pick up the fare, drive them over' },
  { id: 'courier', name: 'Courier run', pay: 110, note: 'a parcel, a deadline, no questions' },
  { id: 'ferry', name: 'Boat ferry', pay: 220, note: 'needs the boat: marina to the Cove' },
  { id: 'tow', name: 'Tow-truck recovery', pay: 180, note: 'drag a dead car back to the garage' },
  { id: 'night', name: 'Night courier', pay: 200, bonus: 90, note: 'after dark, fast pays a time bonus' },
];
SB.startGig = function (typeId) {
  const g = SB.G;
  const def = SB.GIG_TYPES.find((t) => t.id === typeId) || SB.pick(SB.GIG_TYPES);
  if (def.id === 'ferry' && !g.boat) { SB.toast('The ferry gig needs your own boat.'); return null; }
  const dest = SB.pick(SB.LANDMARKS);
  g.gig = { def, x: dest.x, y: dest.y, startedAt: performance.now(), phase: 'go' };
  SB.toast(def.name + ': head to ' + dest.name + '. ' + def.note + '.');
  return g.gig;
};
SB.updateGig = function () {
  const g = SB.G;
  if (!g.gig) return;
  const p = g.player;
  if (SB.dist(p.x, p.y, g.gig.x, g.gig.y) < 60) {
    let pay = g.gig.def.pay;
    if (g.gig.def.bonus && performance.now() - g.gig.startedAt < 45000) { pay += g.gig.def.bonus; SB.toast('Time bonus!'); }
    g.money += pay; SB.addRespect(3);
    SB.toast(g.gig.def.name + ' done: +$' + pay + '.');
    SB.sfx.cash();
    g.gig = null;
  }
};
// The daily chain: 5 delivery drops a day, tracked in g.chain.
SB.resetDailyChain = function () {
  const g = SB.G;
  if (g.chain.done >= 5) g.chain.streak++;
  else if (g.day > 1) g.chain.streak = 0;
  g.chain.done = 0;
};
SB.startDrop = function () {
  const g = SB.G;
  if (g.chain.done >= 5) { SB.toast('Chain complete for today — 5 of 5 drops.'); return null; }
  const dest = SB.pick(SB.LANDMARKS);
  g.drop = { x: dest.x, y: dest.y, name: dest.name };
  SB.toast(`Delivery ${g.chain.done + 1}/5: take the parcel to ${dest.name}.`);
  return g.drop;
};
SB.updateDrop = function () {
  const g = SB.G;
  if (!g.drop) return;
  const p = g.player;
  if (SB.dist(p.x, p.y, g.drop.x, g.drop.y) < 60) {
    const mult = 1 + 0.25 * g.chain.streak;
    const pay = Math.round(90 * mult);
    g.money += pay; g.chain.done++;
    SB.toast(`Drop ${g.chain.done}/5 delivered: +$${pay} (streak x${mult.toFixed(2)}).`);
    SB.sfx.cash();
    g.drop = null;
  }
};
