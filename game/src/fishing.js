// Solmar Bay v8 — fishing: cast, wait for the bite, reel. Nine species by
// weighted rarity, the Golden Marlin only in Wreckwater Deep, rod upgrades
// that bite faster and roll rarer, and a bag that sells at the garage.
'use strict';
window.SB = window.SB || {};

SB.nearestSpot = function () {
  const p = SB.G.player;
  let best = null, bd = 130;
  for (const s of SB.FISH_SPOTS) { const d = SB.dist(p.x, p.y, s.x, s.y); if (d < bd) { bd = d; best = s; } }
  return best;
};
SB.rollFish = function (spot) {
  const rod = SB.RODS[SB.G.rod];
  const pool = SB.FISH.map((f) => ({ name: f.name, value: f.value, w: f.weight * (f.value > 300 ? rod.rare : 1) }));
  if (spot && spot.wreck) pool.push({ name: SB.GOLDEN_MARLIN.name, value: SB.GOLDEN_MARLIN.value, w: SB.GOLDEN_MARLIN.weight * rod.rare });
  let total = 0; for (const f of pool) total += f.w;
  let roll = SB.rng() * total;
  for (const f of pool) { roll -= f.w; if (roll <= 0) return { name: f.name, value: f.value }; }
  return { name: pool[0].name, value: pool[0].value };
};
// One full cast-bite-reel cycle. Returns the caught fish (also used by the
// interactive timing minigame in main.js, which calls this on a good reel).
SB.catchFish = function (spot) {
  const g = SB.G;
  spot = spot || SB.nearestSpot() || SB.FISH_SPOTS[0];
  const fish = SB.rollFish(spot);
  g.fishBag.push(fish);
  g.stats.fish++;
  if (fish.name === SB.GOLDEN_MARLIN.name) g.stats.marlin++;
  SB.toast(`Caught a ${fish.name} ($${fish.value}) at ${spot.name}.`);
  SB.sfx.splash();
  SB.checkAchievements();
  return fish;
};
SB.bagValue = function () {
  const g = SB.G;
  let v = 0; for (const f of g.fishBag) v += f.value;
  // A Fishing Tax racket in any held district adds +10% to the sell price.
  const taxed = [...g.held].some((id) => g.rackets[id] === 'fishing');
  return taxed ? Math.round(v * 1.1) : v;
};
SB.sellFish = function () {
  const g = SB.G;
  const v = SB.bagValue();
  if (!g.fishBag.length) { SB.toast('Your fish bag is empty.'); return 0; }
  g.money += v; g.fishBag = [];
  SB.toast('Sold the fish bag for $' + v + '.');
  SB.sfx.cash();
  return v;
};
SB.buyRod = function (idx) {
  const g = SB.G, rod = SB.RODS[idx];
  if (!rod || idx <= g.rod || g.money < rod.price) return false;
  g.money -= rod.price; g.rod = idx;
  SB.toast(rod.name + ' bought for $' + rod.price + ' — bites come faster, rarities roll better.');
  return true;
};
// Interactive fishing state machine: idle -> cast (waiting) -> bite -> reel.
SB.fishing = { state: 'idle', at: 0, spot: null };
SB.startCast = function () {
  const spot = SB.nearestSpot();
  if (!spot) { SB.toast('No fishing spot here — try a pier or the shore.'); return false; }
  const rod = SB.RODS[SB.G.rod];
  SB.fishing = { state: 'waiting', spot, at: performance.now() + SB.rand(900, 2600) * rod.bite };
  SB.toast('Cast at ' + spot.name + '… wait for the bite.');
  return true;
};
SB.updateFishing = function (now) {
  const f = SB.fishing;
  if (f.state === 'waiting' && now >= f.at) { f.state = 'bite'; f.at = now + 900; SB.toast('A bite! Press F to reel!'); SB.sfx.splash(); }
  else if (f.state === 'bite' && now > f.at) { f.state = 'idle'; SB.toast('It got away.'); }
};
SB.reelIn = function () {
  const f = SB.fishing;
  if (f.state !== 'bite') return null;
  f.state = 'idle';
  return SB.catchFish(f.spot);
};
