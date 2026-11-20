// Solmar Bay v8 — world: the city layout. A road grid over six districts,
// the sea along the west and south, the Wreckwater Shoals wreck offshore,
// Smuggler's Cove, and named landmarks the missions point at.
'use strict';
window.SB = window.SB || {};

SB.LANDMARKS = [
  { name: "Lena's Garage", x: 1560, y: 1240, kind: 'garage' },
  { name: 'Reef Kings Stash House', x: 3000, y: 1800, kind: 'safehouse' },
  { name: 'Bay Bank', x: 1760, y: 420, kind: 'bank' },
  { name: 'City Hall', x: 2050, y: 640, kind: 'hall' },
  { name: 'Marlin Docks', x: 480, y: 420, kind: 'docks' },
  { name: 'Sunset Marina', x: 520, y: 2050, kind: 'marina' },
  { name: 'Bay Armored Depot', x: 2920, y: 2400, kind: 'depot' },
  { name: 'Market Row', x: 1700, y: 900, kind: 'market' },
  { name: 'Palm Court', x: 2900, y: 520, kind: 'court' },
  { name: 'Kiln Yard Gate', x: 1500, y: 1500, kind: 'kiln' },
  { name: 'Beacon Lighthouse', x: 3320, y: 1380, kind: 'light' },
  { name: 'Wreckwater Shoals', x: 760, y: 2700, kind: 'wreck' },
  { name: "Smuggler's Cove", x: 3220, y: 2350, kind: 'cove' },
  { name: 'Harbour Ferry Dock', x: 700, y: 1560, kind: 'ferry' },
];
SB.landmark = (name) => SB.LANDMARKS.find((l) => l.name === name);

SB.buildWorld = function () {
  const W = { buildings: [], roadsX: [], roadsY: [], parks: [] };
  // Vertical and horizontal avenues every 300 units; water takes the rest
  // of the west strip and the southern bay.
  for (let x = 300; x < SB.WORLD.w; x += 300) W.roadsX.push(x);
  for (let y = 300; y < SB.WORLD.h; y += 300) W.roadsY.push(y);
  const rng = SB.makeRng(777);
  for (let bx = 160; bx < SB.WORLD.w - 160; bx += 150) {
    for (let by = 160; by < SB.WORLD.h - 160; by += 150) {
      if (SB.isWater(bx, by) || by > 2520) continue; // nothing built on the south shore
      if (W.roadsX.some((r) => Math.abs(bx - r) < 95) || W.roadsY.some((r) => Math.abs(by - r) < 95)) continue;
      if (rng() < 0.24) { W.parks.push({ x: bx, y: by, w: 96, h: 96 }); continue; }
      const h = 54 + rng() * 60;
      W.buildings.push({ x: bx, y: by, w: 92, h: 92, floors: 2 + Math.floor(rng() * 6), shade: Math.floor(rng() * 5), h });
    }
  }
  return W;
};
// Sea: west strip and the southern bay, with the wreck sitting in it.
SB.isWater = function (x, y) {
  if (x < 130) return true;
  if (y > 2620) return true;
  if (x > 2980 && y > 2180 && x < 3420 && y < 2560) return true; // the cove inlet
  return false;
};
SB.isRoad = function (x, y) {
  const W = SB.world; if (!W) return false;
  return W.roadsX.some((r) => Math.abs(x - r) < 52) || W.roadsY.some((r) => Math.abs(y - r) < 52);
};
SB.collides = function (x, y, r) {
  if (x < r || y < r || x > SB.WORLD.w - r || y > SB.WORLD.h - r) return true;
  for (const b of SB.world.buildings) {
    if (x + r > b.x && x - r < b.x + b.w && y + r > b.y && y - r < b.y + b.h) return true;
  }
  return false;
};
SB.districtAt = function (x, y) {
  if (SB.dist(x, y, 760, 2700) < 260) return { id: 'wreck', name: 'Wreckwater Shoals' };
  for (const d of SB.DISTRICTS) if (x >= d.x && x < d.x + d.w && y >= d.y && y < d.y + d.h) return d;
  return { id: 'wild', name: 'Open Coast' };
};
// Spawn points on roads for traffic cars and pedestrians.
SB.roadPoint = function () {
  const W = SB.world;
  if (SB.rng() < 0.5) return { x: SB.pick(W.roadsX) + SB.rand(-14, 14), y: SB.rand(200, SB.WORLD.h - 200) };
  return { x: SB.rand(200, SB.WORLD.w - 200), y: SB.pick(W.roadsY) + SB.rand(-14, 14) };
};
