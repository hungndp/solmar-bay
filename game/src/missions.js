// Solmar Bay v8 — missions: 15 main missions in 3 acts (payouts sum to
// exactly $40,100, Respect-gated) plus 45 branch missions ($13,770).
// Eleven step types: steal, goto, pickup, deliver, escape, tail, defend,
// clear, buy, fish, escort. Every main mission opens with a portrait
// briefing from its named giver; branch jobs get a one-line portrait brief.
'use strict';
window.SB = window.SB || {};

const L = (name) => { const lm = SB.landmark(name); return { x: lm.x, y: lm.y, name }; };
const S = (type, at, extra) => Object.assign({ type, at: typeof at === 'string' ? L(at) : at }, extra || {});

SB.MAIN_MISSIONS = [
  { name: 'First Wheels', giver: 'Lena Cruz', pay: 600, gate: 0, brief: ['Jace. You are broke in my city, so listen: a Wren Citybug sits at Market Row with the keys in it.', 'Take it, bring it to my garage. First wheels, first payday.'], steps: [S('steal', 'Market Row'), S('deliver', "Lena's Garage")] },
  { name: 'The Pickup', giver: 'Lena Cruz', pay: 1000, gate: 0, brief: ['A parcel came off a boat at Marlin Docks and Rosa is holding it for me.', 'Pick it up, then lose yourself at the stash house if the bay lights up.'], steps: [S('pickup', 'Marlin Docks'), S('deliver', 'Reef Kings Stash House')] },
  { name: 'The Bank Job', giver: 'Lena Cruz', pay: 1600, gate: 0, brief: ['Bay Bank moves cash at noon. You are not robbing it — you are tailing the courier who is.', 'Follow him to City Hall, then get clear.'], steps: [S('tail', 'Bay Bank'), S('goto', 'City Hall'), S('escape', 'Reef Kings Stash House')] },
  { name: 'Hot Wheels', giver: 'Bex Marlowe', pay: 2000, gate: 0, brief: ['Bex here. My chop-shop is hungry: a Pelican GT purrs at Palm Court.', 'Steal it, deliver it to the Kiln Yard gate. Do not dent my dinner.'], steps: [S('steal', 'Palm Court'), S('deliver', 'Kiln Yard Gate')] },
  { name: 'The Informant', giver: 'Silas Quill', pay: 2400, gate: 0, brief: ['City Hall keeps a ledger that names every snitch in Solmar Bay.', 'Grab it, then run. Three stars of attention, I would guess.'], steps: [S('pickup', 'City Hall'), S('escape', 'Reef Kings Stash House')] },
  { name: 'Dock Rats', giver: 'Rosa Delgado', pay: 2800, gate: 100, brief: ['Act two, Jace. My Dock Rats held Marlin Docks for six years — and I am done sharing.', 'Clear my own docks of the Venn men squatting on them. The turf is yours if you take it.'], steps: [S('clear', 'Marlin Docks', { n: 4, district: 'docks' })] },
  { name: 'Depot Run', giver: 'Ivy Chen', pay: 3000, gate: 100, brief: ['A weapon crate sleeps at the Bay Armored Depot. Smuggled, untraceable, expensive.', 'Lift it under a three-star sky and bring it to the garage.'], steps: [S('pickup', 'Bay Armored Depot'), S('deliver', "Lena's Garage")] },
  { name: 'The Stash House', giver: 'Lena Cruz', pay: 3200, gate: 100, brief: ["Dario's lieutenant turned our own stash house into his office.", 'Clear it out. Every guard, Jace — send a message with a return address.'], steps: [S('clear', 'Reef Kings Stash House', { n: 5, district: 'kiln' })] },
  { name: 'Payback at the Marina', giver: 'Rosa Delgado', pay: 3400, gate: 100, brief: ['Venn men jumped two of mine at Sunset Marina and took the pier.', 'Escort my runner back there and hold the marina until it is ours.'], steps: [S('escort', 'Sunset Marina'), S('defend', 'Sunset Marina', { n: 3, district: 'marina' })] },
  { name: 'Two Fronts', giver: 'Lena Cruz', pay: 3600, gate: 100, brief: ['They are hitting the garage tonight — Palm Court on one side, Venn on the other.', 'Defend my garage first. Then we talk about whose city this is.'], steps: [S('defend', "Lena's Garage", { n: 5, district: 'kiln' })] },
  { name: 'The Fixer Turns', giver: 'Lena Cruz', pay: 3000, gate: 250, brief: ['My own contact sold our routes to Dario. I found out before the ambush, not before the insult.', 'Tail him from Market Row, then escape to Beacon Point.'], steps: [S('tail', 'Market Row'), S('escape', 'Beacon Lighthouse')] },
  { name: 'Offshore', giver: 'Ivy Chen', pay: 3200, gate: 250, brief: ['Wreckwater Shoals: a beached freighter, a deep-water dealer, and no police boats after dark.', 'Sail out, pick up the offshore package, bring it to the Cove.'], steps: [S('goto', 'Wreckwater Shoals'), S('pickup', 'Wreckwater Shoals'), S('deliver', "Smuggler's Cove")] },
  { name: "The Smuggler's Price", giver: 'Ivy Chen', pay: 3400, gate: 400, brief: ['The Smuggled Rifle is in the garage shop now — six and a half thousand, worth every cent.', 'Buy it. Then use it: clear the convoy guard at the depot.'], steps: [S('buy', "Lena's Garage", { item: 'rifle' }), S('clear', 'Bay Armored Depot', { n: 4, district: 'beacon' })] },
  { name: 'Dario Venn', giver: 'Dario Venn', pay: 3800, gate: 400, brief: ['Jace. You have taken my docks, my depot, my ledger. Come to Palm Court and take the last thing.', 'My guards first. Then my enforcers. Then me. — D.V.'], steps: [S('clear', 'Palm Court', { n: 6, district: 'palm' })] },
  { name: 'Solmar Is Mine', giver: 'Lena Cruz', pay: 3100, gate: 500, brief: ['One last sweep, legend. Every district, one victory lap, and Solmar Bay is Reef Kings water.', 'End at the lighthouse. I will bring something cold to drink.'], steps: [S('goto', 'Marlin Docks'), S('goto', 'Sunset Marina'), S('goto', 'Bay Bank'), S('deliver', 'Beacon Lighthouse')] },
];
SB.MAIN_TOTAL = SB.MAIN_MISSIONS.reduce((a, m) => a + m.pay, 0);

const BRANCH_THEMES = [
  { kind: 'Reef-smuggling run', giver: 'Ivy Chen', make: (d) => [S('pickup', 'Sunset Marina'), S('deliver', d)] },
  { kind: 'Convoy assist', giver: 'Lena Cruz', make: (d) => [S('goto', d), S('defend', d, { n: 2 })] },
  { kind: 'Fishing contest', giver: 'Harbourmaster Cole', make: (d) => [S('fish', 'Marlin Docks')] },
  { kind: 'Racket setup', giver: 'Tomas Rey', make: (d) => [S('goto', d), S('pickup', d)] },
  { kind: 'Wreckwater delivery', giver: 'Silas Quill', make: (d) => [S('pickup', "Smuggler's Cove"), S('deliver', d)] },
];
const BRANCH_SPOTS = ['Marlin Docks', 'Sunset Marina', 'Bay Bank', 'Market Row', 'Palm Court', 'Kiln Yard Gate', 'Bay Armored Depot', 'Beacon Lighthouse', 'City Hall'];
const BRANCH_PAYS = [250, 260, 300, 340, 380];
SB.BRANCH_MISSIONS = [];
for (let i = 0; i < 45; i++) {
  const theme = BRANCH_THEMES[i % BRANCH_THEMES.length];
  const spot = BRANCH_SPOTS[i % BRANCH_SPOTS.length];
  SB.BRANCH_MISSIONS.push({
    name: `${theme.kind} ${Math.floor(i / BRANCH_THEMES.length) + 1}`,
    giver: theme.giver, pay: BRANCH_PAYS[i % BRANCH_PAYS.length], branch: true,
    brief: [`${theme.kind.toLowerCase()}, out by ${spot}. $${BRANCH_PAYS[i % BRANCH_PAYS.length]} when it is done, no questions either way.`],
    steps: theme.make(spot),
  });
}
SB.BRANCH_TOTAL = SB.BRANCH_MISSIONS.reduce((a, m) => a + m.pay, 0);

// ---- Engine -------------------------------------------------------------
SB.startMission = function (def, kind) {
  const g = SB.G;
  if (g.mission) { SB.toast('Finish the current job first.'); return null; }
  if (def.gate && g.respect < def.gate) { SB.toast(`Locked: needs ${def.gate} Respect (you have ${g.respect}).`); return null; }
  const m = { def, kind, stepIdx: 0, guards: [], targetCar: null, fishAtStart: g.stats.fish, escort: null };
  g.mission = m;
  SB.beginStep(m);
  const pages = [{ speaker: def.giver, lines: def.brief }];
  SB.openDialogue(pages);
  return m;
};
SB.beginStep = function (m) {
  const g = SB.G, step = m.def.steps[m.stepIdx];
  if (!step) return;
  m.guards = [];
  if (step.type === 'clear' || step.type === 'defend') {
    const n = step.n || 3;
    for (let i = 0; i < n; i++) {
      const f = SB.makeFighter(step.at.x + SB.rand(-60, 60), step.at.y + SB.rand(-60, 60), {
        team: 'gang', gang: 'Venn Syndicate', hp: 55, color: '#b04df0', guardTarget: null,
      });
      f.guardTarget = { x: step.at.x, y: step.at.y };
      g.fighters.push(f); m.guards.push(f);
    }
  }
  if (step.type === 'steal') {
    const car = SB.makeCar(step.at.x + 26, step.at.y + 10, SB.randInt(0, 5), {});
    g.cars.push(car); m.targetCar = car;
  }
  if (step.type === 'escort') {
    m.escort = SB.makeFighter(g.player.x + 20, g.player.y + 14, { team: 'crew', hp: 90, maxHp: 90, color: '#7fd0f5', name: 'Runner' });
    g.fighters.push(m.escort);
  }
  if (step.type === 'tail') {
    m.tailTarget = SB.makeFighter(step.at.x, step.at.y, { team: 'gang', hp: 9999, color: '#dddddd', name: 'Courier' });
    g.fighters.push(m.tailTarget);
  }
};
SB.stepDone = function (m, step) {
  const g = SB.G, p = g.player;
  switch (step.type) {
    case 'steal': return p.car === m.targetCar;
    case 'goto': case 'pickup': case 'deliver': case 'escape': case 'escort':
      return SB.dist(p.x, p.y, step.at.x, step.at.y) < 58;
    case 'tail': return m.tailTarget && SB.dist(p.x, p.y, m.tailTarget.x, m.tailTarget.y) < 60;
    case 'clear': case 'defend': return m.guards.every((f) => f.dead);
    case 'buy': return g.weaponsOwned.has(step.item || 'pipe');
    case 'fish': return g.stats.fish > m.fishAtStart;
    default: return false;
  }
};
SB.completeMission = function (m) {
  const g = SB.G, def = m.def;
  g.money += def.pay;
  SB.addRespect(m.kind === 'main' ? 12 : 4);
  g.stats.missions++;
  if (m.kind === 'main') { g.stats.mainDone++; g.mainNext++; }
  const last = def.steps[def.steps.length - 1];
  const d = SB.districtAt(last.at.x, last.at.y);
  if (d.id && SB.DISTRICTS.some((x) => x.id === d.id)) SB.addStanding(d.id, 6);
  for (const step of def.steps) if (step.district) SB.captureDistrict(step.district);
  SB.toast(`${def.name} complete: +$${def.pay}.`);
  SB.sfx.cash();
  g.mission = null;
  SB.checkAchievements();
  SB.saveGame();
};
SB.updateMission = function (dt) {
  const g = SB.G, m = g.mission;
  if (!m) return;
  const step = m.def.steps[m.stepIdx];
  if (!step) { SB.completeMission(m); return; }
  if (m.tailTarget && !m.tailTarget.dead) {
    // The courier walks his route; stay on him to finish the tail.
    m.tailTarget.x += Math.cos(performance.now() / 3000) * 22 * dt;
    m.tailTarget.y += Math.sin(performance.now() / 2300) * 22 * dt;
  }
  if (m.escort && !m.escort.dead) SB.moveToward(m.escort, g.player.x, g.player.y, dt, 150);
  if (SB.stepDone(m, step)) {
    m.stepIdx++;
    SB.sfx.ui();
    if (m.stepIdx >= m.def.steps.length) SB.completeMission(m);
    else SB.beginStep(m);
  }
};
SB.missionObjective = function () {
  const g = SB.G, m = g.mission;
  if (!m) return null;
  const step = m.def.steps[m.stepIdx];
  const verbs = { steal: 'Steal the marked car', goto: 'Go to', pickup: 'Pick up at', deliver: 'Deliver to', escape: 'Escape to', tail: 'Tail the courier near', defend: 'Defend', clear: 'Clear out', buy: 'Buy the item at', fish: 'Catch a fish at', escort: 'Escort your runner to' };
  return { mission: m.def.name, text: `${verbs[step.type] || 'Go to'} ${step.at.name}`, step: m.stepIdx + 1, of: m.def.steps.length, x: step.at.x, y: step.at.y };
};
SB.nextMain = function () { return SB.MAIN_MISSIONS[SB.G.mainNext] || null; };
SB.startNextMain = function () {
  const def = SB.nextMain();
  if (!def) { SB.toast('The story is done — Solmar Bay is yours. Free-roam!'); return null; }
  return SB.startMission(def, 'main');
};
SB.startBranch = function (idx) {
  const def = SB.BRANCH_MISSIONS[idx % SB.BRANCH_MISSIONS.length];
  return SB.startMission(def, 'branch');
};
