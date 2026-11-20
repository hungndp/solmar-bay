// Solmar Bay v8 — config: every named thing in the city lives here.
// Districts, gangs, weapons, crew, fish, vehicles and the portrait cast are
// data, so the systems in the other modules stay small and readable.
'use strict';
window.SB = window.SB || {};

SB.WORLD = { w: 3600, h: 2800, dayLength: 260 };
SB.START = { money: 450, respect: 0, x: 1760, y: 2050 };

// Six turf districts, invented coastal names used everywhere: minimap
// labels, mission text, the standing panel and the district banner.
SB.DISTRICTS = [
  { id: 'docks',   name: 'Marlin Docks',   x: 120,  y: 120,  w: 1080, h: 820, gang: 'Dock Rats' },
  { id: 'marina',  name: 'Sunset Marina',  x: 120,  y: 1760, w: 1080, h: 920, gang: 'Dock Rats' },
  { id: 'downtown',name: 'Coral Heights',  x: 1320, y: 120,  w: 1080, h: 820, gang: 'Venn Syndicate' },
  { id: 'kiln',    name: 'Kiln Yard',      x: 1320, y: 1060, w: 1080, h: 580, gang: 'Palm Court Crew' },
  { id: 'palm',    name: 'Palm Grove',     x: 2520, y: 120,  w: 960,  h: 1020, gang: 'Palm Court Crew' },
  { id: 'beacon',  name: 'Beacon Point',   x: 2520, y: 1260, w: 960,  h: 1420, gang: 'Venn Syndicate' },
];
SB.GANGS = {
  'Venn Syndicate':  { color: '#b04df0', boss: 'Dario Venn' },
  'Dock Rats':       { color: '#f0a13c', boss: 'Rosa Delgado' },
  'Palm Court Crew': { color: '#3fd08c', boss: 'Tomas Rey' },
  'Reef Kings':      { color: '#35b6f0', boss: 'Jace' },
};
SB.TURF_INCOME = 160;          // per held district per day
SB.ASSAULT_REWARD = 300;       // defending a district pays this
SB.TRUCE_COST = 1000;          // buys 2 assault-free days
SB.CONVOY_REWARD = 800;

// Per-district rackets: one active racket per held district.
SB.RACKETS = {
  protection: { name: 'Protection',  pay: 160, note: 'steady, no heat' },
  smuggling:  { name: 'Smuggling',   pay: 210, note: 'pays more, adds wanted heat' },
  fishing:    { name: 'Fishing Tax', pay: 130, note: 'fish sell for +10% here' },
};

// Eight black-market weapons. Solmar Bay restricts firearms, so everything
// is smuggled in or built in a garage, and the price shows it.
SB.WEAPONS = [
  { id: 'fists',   name: 'Fists',               price: 0,    dmg: 8,  rate: 320, range: 46,  spread: 0,    heat: 0,   ammo: -1 },
  { id: 'pipe',    name: 'Pipe Pistol',         price: 1200, dmg: 16, rate: 300, range: 300, spread: 0.03, heat: 1,   ammo: 24 },
  { id: 'nail',    name: 'Nail Gun',            price: 900,  dmg: 11, rate: 210, range: 220, spread: 0.02, heat: 0.3, ammo: 40 },
  { id: 'sawed',   name: 'Sawed-off Pipe Shotgun', price: 2800, dmg: 34, rate: 720, range: 170, spread: 0.16, heat: 1.6, ammo: 10 },
  { id: 'double',  name: 'Dockside Double-Barrel', price: 3400, dmg: 42, rate: 800, range: 190, spread: 0.13, heat: 1.6, ammo: 12 },
  { id: 'gsmg',    name: 'Garage SMG',          price: 4200, dmg: 13, rate: 110, range: 280, spread: 0.09, heat: 1.2, ammo: 60 },
  { id: 'carbine', name: 'Smuggled Carbine',    price: 5400, dmg: 24, rate: 190, range: 380, spread: 0.04, heat: 1.4, ammo: 40 },
  { id: 'rifle',   name: 'Smuggled Rifle',      price: 6500, dmg: 38, rate: 420, range: 520, spread: 0.01, heat: 1.8, ammo: 20, unlockMain: 13 },
];
SB.MOLOTOV = { price: 350, dmg: 55, radius: 90 };
SB.AMMO_BOX = 120; SB.AMMO_MAG = 150;

// Crew tiers are people: a name, a signature ability, a price. Hired at the
// garage; the ability ids are what crew.js dispatches on.
SB.CREW = [
  { tier: 'Scout',    name: 'Pip',     price: 500,  hp: 60,  ability: 'eyes',    abilityName: 'EYES OUT',    desc: 'Police and gang units show on the minimap at long range.' },
  { tier: 'Lookout',  name: 'Rhea',    price: 900,  hp: 80,  ability: 'smoke',   abilityName: 'SMOKE SCREEN', desc: 'Hotkey Q: breaks police line-of-sight; wanted decays fast for 5s.', cooldown: 30 },
  { tier: 'Soldier',  name: 'Bruno',   price: 2200, hp: 130, ability: 'cover',   abilityName: 'COVER FIRE',   desc: 'Auto-fires at the nearest hostile near you.' },
  { tier: 'Enforcer', name: 'Mama Jo', price: 4800, hp: 200, ability: 'muscle',  abilityName: 'MUSCLE',       desc: 'Bonus melee damage; losing assault attackers may flee near her.' },
  { tier: 'Captain',  name: 'Old Finn', price: 7500, hp: 170, ability: 'call',   abilityName: 'CALL THE CREW', desc: 'Hotkey C: summons 2 temporary backup fighters for 30s.', cooldown: 60, needsDistricts: 5 },
];

// Fish: 9 species plus the Golden Marlin, which only bites at Wreckwater Deep.
SB.FISH = [
  { name: 'Sardine', value: 40, weight: 30 }, { name: 'Mackerel', value: 70, weight: 24 },
  { name: 'Sea Bass', value: 110, weight: 18 }, { name: 'Snapper', value: 160, weight: 12 },
  { name: 'Amberjack', value: 240, weight: 8 }, { name: 'Mahi', value: 340, weight: 5 },
  { name: 'Bluefin Tuna', value: 480, weight: 3.4 }, { name: 'Swordfish', value: 640, weight: 1.6 },
  { name: 'Sun Opah', value: 800, weight: 0.7 },
];
SB.GOLDEN_MARLIN = { name: 'Golden Marlin', value: 1500, weight: 0.5 };
SB.FISH_SPOTS = [
  { name: 'Marlin Pier', x: 420, y: 1020, district: 'docks' },
  { name: 'Sunset Jetty', x: 380, y: 1900, district: 'marina' },
  { name: 'Palm Cove', x: 3050, y: 1180, district: 'palm' },
  { name: "Smuggler's Cove", x: 3220, y: 2350, district: 'beacon' },
  { name: 'Beacon Rocks', x: 3300, y: 1500, district: 'beacon' },
  { name: 'Wreckwater Deep', x: 760, y: 2700, district: 'wreck', wreck: true },
];
SB.RODS = [
  { name: 'Harbour Rod', price: 0, bite: 1, rare: 1 },
  { name: 'Rod Mk2', price: 700, bite: 0.6, rare: 1.5 },
  { name: 'Rod Mk3', price: 1800, bite: 0.45, rare: 2.2 },
];

// Vehicle classes with invented model names for the vehicle panel.
SB.CAR_MODELS = [
  { cls: 'compact', name: 'Wren Citybug', top: 118, price: 3000, color: '#d8d34a' },
  { cls: 'sedan',   name: 'Alto Meridian', top: 142, price: 4200, color: '#7aa2d8' },
  { cls: 'pickup',  name: 'Dockmaster Hauler', top: 126, price: 5000, color: '#c47b3a' },
  { cls: 'taxi',    name: 'Cabrio Fare', top: 136, price: 4600, color: '#f2c230' },
  { cls: 'sports',  name: 'Pelican GT', top: 196, price: 8000, color: '#e04d6a' },
  { cls: 'van',     name: 'Kiln Boxvan', top: 112, price: 3800, color: '#9aa3ad' },
];
SB.BOAT_PRICE = 6500; SB.SAFEHOUSE2_PRICE = 5000;
SB.ARMOR_PRICE = 600; SB.MEDKIT_PRICE = 150; SB.REPAIR_PER_PCT = 6;

// The portrait cast: seeded faces drawn from these rows (skin, hair, style,
// accessory) — no external assets, the seed is the character's identity.
SB.CAST = {
  'Lena Cruz':    { role: 'Fixer', skin: '#c98a5e', hair: '#2b1c12', style: 'bob', acc: 'earring' },
  'Dario Venn':   { role: 'Venn Syndicate boss', skin: '#e0aa7e', hair: '#111111', style: 'slick', acc: 'shades' },
  'Rosa Delgado': { role: 'Dock boss', skin: '#8a5a34', hair: '#3a2410', style: 'bun', acc: 'cap' },
  'Bex Marlowe':  { role: 'Chop-shop owner', skin: '#d89a68', hair: '#7a2d1d', style: 'mohawk', acc: 'wrench' },
  'Silas Quill':  { role: 'Fence', skin: '#6e4526', hair: '#555049', style: 'bald', acc: 'chain' },
  'Tomas Rey':    { role: 'Palm Court lieutenant', skin: '#a06a3c', hair: '#191410', style: 'crop', acc: 'bandana' },
  'Ivy Chen':     { role: 'Smuggler', skin: '#e8b88a', hair: '#241a2e', style: 'long', acc: 'scarf' },
  'Harbourmaster Cole': { role: 'Harbourmaster', skin: '#caa06e', hair: '#8a8a8a', style: 'crop', acc: 'cap' },
};
SB.HERO = { name: 'Jace', crew: 'Reef Kings' };
SB.SAVE_KEY = 'solmar-bay-v8-save';
