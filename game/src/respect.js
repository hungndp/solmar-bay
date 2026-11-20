// Solmar Bay v8 — respect: the rank ladder that gates the story acts, and
// the ten achievements shown on the pause screen.
'use strict';
window.SB = window.SB || {};

SB.RANKS = [
  { at: 0, name: 'Nobody' }, { at: 60, name: 'Runner' }, { at: 100, name: 'Known' },
  { at: 250, name: 'Respected' }, { at: 400, name: 'Feared' }, { at: 500, name: 'Bay Legend' },
];
SB.rankOf = function (respect) {
  let r = SB.RANKS[0];
  for (const k of SB.RANKS) if (respect >= k.at) r = k;
  return r;
};
SB.addRespect = function (n) {
  const g = SB.G, before = SB.rankOf(g.respect).name;
  g.respect += n;
  const after = SB.rankOf(g.respect).name;
  if (after !== before) SB.toast('Rank up: ' + after);
};
SB.ACHIEVEMENTS = [
  { id: 'firstjob', name: 'First Payday', test: (g) => g.stats.missions >= 1 },
  { id: 'act2', name: 'Turf War', test: (g) => g.stats.mainDone >= 5 },
  { id: 'act3', name: 'King of the Bay', test: (g) => g.stats.mainDone >= 15 },
  { id: 'landlord', name: 'Landlord', test: (g) => g.held.size >= 3 },
  { id: 'empire', name: 'Empire', test: (g) => g.held.size >= 6 },
  { id: 'crewfull', name: 'Full Crew', test: (g) => g.crew.length >= 2 },
  { id: 'angler', name: 'Angler', test: (g) => g.stats.fish >= 10 },
  { id: 'marlin', name: 'Golden Touch', test: (g) => g.stats.marlin >= 1 },
  { id: 'rich', name: 'Bay Money', test: (g) => g.money >= 20000 },
  { id: 'untouchable', name: 'Untouchable', test: (g) => g.stats.defences >= 3 },
];
SB.checkAchievements = function () {
  const g = SB.G;
  for (const a of SB.ACHIEVEMENTS) {
    if (!g.achievements.has(a.id) && a.test(g)) {
      g.achievements.add(a.id);
      SB.toast('Achievement: ' + a.name);
      SB.sfx.cash();
    }
  }
};
