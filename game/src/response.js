// Solmar Bay v8 — response: the named police response system. Every unit
// the bay sends at you carries a callsign and a role assigned by behaviour,
// and the dispatch panel lists the nearest units with live distances.
'use strict';
window.SB = window.SB || {};

SB.RESPONSE_ROLES = {
  interceptor: { prefix: 'MARLIN', role: 'INTERCEPTOR', note: 'fast, cuts ahead of your line' },
  ram:         { prefix: 'CORAL',  role: 'RAMMING',     note: 'heavy car, tries to collide' },
  marksman:    { prefix: 'KITE',   role: 'MARKSMAN',    note: 'on foot at 4 stars, shoots from range' },
  shore:       { prefix: 'REEF',   role: 'SHORE WATCH', note: 'coastal and boat units' },
  air:         { prefix: 'AIR',    role: 'AIR',         note: 'the helicopter' },
};
SB.responseCounters = { interceptor: 0, ram: 0, marksman: 0, shore: 0 };
// Assign (or keep) the callsign for a unit from its behaviour kind.
SB.callsignFor = function (unit) {
  if (unit.callsign) return unit.callsign;
  if (unit.kind === 'heli') { unit.callsign = 'AIR ONE'; unit.role = 'AIR'; return unit.callsign; }
  const kind = unit.kind === 'boatcop' ? 'shore' : unit.kind === 'marksman' ? 'marksman'
    : unit.behavior === 'ram' ? 'ram' : 'interceptor';
  const meta = SB.RESPONSE_ROLES[kind];
  SB.responseCounters[kind] = (SB.responseCounters[kind] || 0) + 1;
  unit.callsign = meta.prefix + '-' + SB.responseCounters[kind];
  unit.role = meta.role;
  unit.roleKind = kind;
  return unit.callsign;
};
// The dispatch feed: up to 6 nearest response units with live distances in
// metres from the player, nearest first, plus the AIR ONE overhead line.
SB.dispatchList = function () {
  const g = SB.G; if (!g) return [];
  const p = g.player, out = [];
  for (const u of g.units) {
    if (u.dead) continue;
    SB.callsignFor(u);
    out.push({
      callsign: u.callsign, role: u.role,
      dist: Math.round(SB.dist(p.x, p.y, u.x, u.y) / 4),
      overhead: u.kind === 'heli',
    });
  }
  out.sort((a, b) => a.dist - b.dist);
  return out.slice(0, 6);
};
SB.dispatchLine = function (entry) {
  return entry.overhead ? `${entry.callsign} · ${entry.role} · OVERHEAD`
    : `${entry.callsign} · ${entry.role} · ${entry.dist}m`;
};
// How many units a wanted level fields, and of what kinds.
SB.responsePlan = function (stars) {
  if (stars <= 0) return { cars: 0, marksmen: 0, heli: false, roadblock: false };
  if (stars === 1) return { cars: 1, marksmen: 0, heli: false, roadblock: false };
  if (stars === 2) return { cars: 2, marksmen: 0, heli: false, roadblock: false };
  if (stars === 3) return { cars: 3, marksmen: 0, heli: false, roadblock: true };
  return { cars: 4, marksmen: 2, heli: true, roadblock: true };
};
// Assault waves get named too: the attacking gang and its wave leader.
SB.WAVE_LEADERS = ['Vex Marlowe', 'Big Ansel', 'Crazy Ivo', 'Sister Pyke', 'Donnie Reef', 'Madame Sorrow'];
SB.nameWave = function (gang) {
  const leader = SB.pick(SB.WAVE_LEADERS);
  return { gang, leader, banner: `${gang.toUpperCase()} ASSAULT — led by ${leader}` };
};
