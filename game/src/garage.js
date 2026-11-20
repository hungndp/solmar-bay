// Solmar Bay v8 — garage: Lena's Garage is the closed economy's spending
// side. Weapons, ammo, molotovs, armor, medkits, car upgrades, cars, the
// second safehouse, the boat, rods, crew hires, fish sales, repairs and
// the truce all take money out here; missions and turf put it back in.
'use strict';
window.SB = window.SB || {};

SB.GARAGE_POS = { x: 1560, y: 1240 };
SB.nearGarage = function () { return SB.dist(SB.G.player.x, SB.G.player.y, SB.GARAGE_POS.x, SB.GARAGE_POS.y) < 120; };
// The menu is data: render.js draws it, main.js dispatches the ids.
SB.garageMenu = function () {
  const g = SB.G;
  const items = [];
  for (const w of SB.WEAPONS) {
    if (w.price > 0 && !SB.ownsWeapon(w.id)) items.push({ id: 'weapon:' + w.id, label: `${w.name} — $${w.price}`, hint: w.unlockMain ? 'unlocks at main ' + w.unlockMain : 'black-market gun' });
  }
  items.push({ id: 'ammo', label: 'Ammo box — $' + SB.AMMO_BOX, hint: 'for the current weapon' });
  items.push({ id: 'mag', label: 'Suspect mag — $' + SB.AMMO_MAG, hint: 'smuggled, same count, worse questions' });
  items.push({ id: 'molotov', label: 'Molotov — $' + SB.MOLOTOV.price, hint: 'area denial, throw with G' });
  items.push({ id: 'armor', label: 'Armor — $' + SB.ARMOR_PRICE, hint: 'soaks 60% of foot damage' });
  items.push({ id: 'medkit', label: 'Medkit — $' + SB.MEDKIT_PRICE, hint: 'restore 50 health' });
  for (let i = 1; i < SB.RODS.length; i++) if (g.rod < i) items.push({ id: 'rod:' + i, label: `${SB.RODS[i].name} — $${SB.RODS[i].price}`, hint: 'faster bites, rarer fish' });
  for (let i = 0; i < SB.CREW.length; i++) {
    const c = SB.CREW[i];
    items.push({ id: 'crew:' + i, label: `Hire ${c.name} (${c.tier}) — $${SB.crewPrice(i)}`, hint: `${c.abilityName}: ${c.desc}` });
  }
  for (let i = 0; i < SB.CAR_MODELS.length; i++) {
    const m = SB.CAR_MODELS[i];
    items.push({ id: 'car:' + i, label: `${m.name} — $${m.price}`, hint: 'your own car, parked at the garage' });
  }
  items.push({ id: 'upgrade:engine', label: 'Engine upgrade — $900', hint: '+12% top speed on your car' });
  items.push({ id: 'upgrade:armor', label: 'Plated panels — $1100', hint: 'your car takes half collision damage' });
  if (!g.safehouse2) items.push({ id: 'safehouse', label: 'Second safehouse — $' + SB.SAFEHOUSE2_PRICE, hint: 'turf income +50%' });
  if (!g.boat) items.push({ id: 'boat', label: 'Smuggler boat — $' + SB.BOAT_PRICE, hint: 'reaches Wreckwater Shoals and the Cove' });
  items.push({ id: 'repair', label: 'Repair current car — $' + SB.REPAIR_PER_PCT + '/%', hint: 'back to 0% damage' });
  items.push({ id: 'sellfish', label: 'Sell fish bag — $' + SB.bagValue(), hint: g.fishBag.length + ' fish in the bag' });
  items.push({ id: 'truce', label: 'Buy a truce — $' + SB.TRUCE_COST, hint: '2 assault-free days' });
  return items;
};
SB.garageBuy = function (id) {
  const g = SB.G, p = g.player;
  const spend = (cost) => { if (g.money < cost) { SB.toast('Need $' + cost + '.'); return false; } g.money -= cost; return true; };
  if (id.startsWith('weapon:')) return SB.buyWeapon(id.slice(7));
  if (id === 'ammo') return SB.buyAmmo(false);
  if (id === 'mag') return SB.buyAmmo(true);
  if (id === 'molotov') return SB.buyMolotov();
  if (id === 'armor') { if (spend(SB.ARMOR_PRICE)) { g.armor = 100; SB.toast('Armor fitted.'); return true; } return false; }
  if (id === 'medkit') { if (spend(SB.MEDKIT_PRICE)) { p.hp = Math.min(100, p.hp + 50); SB.toast('Patched up +50.'); return true; } return false; }
  if (id.startsWith('rod:')) return SB.buyRod(parseInt(id.slice(4), 10));
  if (id.startsWith('crew:')) return !!SB.hireCrew(parseInt(id.slice(5), 10));
  if (id.startsWith('car:')) {
    const m = SB.CAR_MODELS[parseInt(id.slice(4), 10)];
    if (!spend(m.price)) return false;
    const car = SB.makeCar(SB.GARAGE_POS.x + 60, SB.GARAGE_POS.y + 40, parseInt(id.slice(4), 10), {});
    car.owned = true; g.cars.push(car); g.ownedCar = car;
    SB.toast('Your ' + m.name + ' is parked outside. -$' + m.price + '.');
    return true;
  }
  if (id === 'upgrade:engine') { if (spend(900)) { g.carUpgrades.engine++; SB.toast('Engine upgraded.'); return true; } return false; }
  if (id === 'upgrade:armor') { if (spend(1100)) { g.carUpgrades.armor++; SB.toast('Panels plated.'); return true; } return false; }
  if (id === 'safehouse') { if (spend(SB.SAFEHOUSE2_PRICE)) { g.safehouse2 = true; SB.toast('Second safehouse bought — turf income +50%.'); return true; } return false; }
  if (id === 'boat') { if (spend(SB.BOAT_PRICE)) { g.boat = true; SB.toast('Boat moored at Sunset Marina. Sail with E at the dock.'); return true; } return false; }
  if (id === 'repair') return SB.repairVehicle(p.car || g.ownedCar) > 0;
  if (id === 'sellfish') return SB.sellFish() > 0 || g.fishBag.length === 0;
  if (id === 'truce') return SB.buyTruce();
  return false;
};
