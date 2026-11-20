# Solmar Bay

[![make.fun · gta6-01](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![rank](https://make.fun/badge/gta6-01/hungndp/solmar-bay/rank.svg)](https://make.fun/bounty/gta6-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![reward](https://make.fun/badge/gta6-01/hungndp/solmar-bay/reward.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)

**Solmar Bay** is a complete 2D top-down open-world crime game that plays
offline in a desktop browser from static files — no build step, no network.
You are Jace, newly broke in a sun-soaked seaside city where firearms are
restricted, so every gun is smuggled in or built in a garage and priced like
it. Walk or drive freely, carjack traffic, run story jobs, buy black-market
weapons, hire a named crew, fish six spots, sail to a beached freighter
wreck, and fight three rival gangs for six turf districts in a closed
earn-and-spend economy.

## What's in the game

- **60 missions** — 15 main missions in 3 acts (payouts sum to exactly
  $40,100; Act 2 needs 100 Respect, Act 3 opens at 250/400/500) plus 45
  branch missions ($13,770): reef-smuggling runs, convoy assists, fishing
  contests, racket setups and Wreckwater deliveries. Eleven step types:
  steal car, go to point, pick up, deliver, escape, tail, defend, clear
  out, buy item, fish, escort.
- **Gangs and turf** — the Venn Syndicate, Dock Rats and Palm Court Crew
  hold 6 districts (Marlin Docks, Sunset Marina, Coral Heights, Kiln Yard,
  Palm Grove, Beacon Point); the minimap is coloured by whoever holds each
  one. Holding a district pays $160/day (+50% with a second safehouse).
  Per-district rackets: Protection $160/day, Smuggling $210/day plus wanted
  heat, Fishing Tax $130/day plus +10% on fish sales. Rivals assault your
  turf with exactly 4 attackers — a defence win pays $300, a loss loses the
  district. Holding 5+ districts can trigger a siege (a double assault);
  a $1,000 truce buys 2 assault-free days; a rival cash convoy crossing
  the map is worth $800 + Respect if you stop it.
- **Named police response + live dispatch (new in v8)** — every unit the
  bay sends carries a callsign and a role assigned by behaviour:
  `MARLIN-n` INTERCEPTOR cars cut ahead of you, `CORAL-n` RAMMING cars try
  to collide, `KITE-n` MARKSMAN officers shoot from range at 4 stars,
  `REEF-n` SHORE WATCH guards the coast, and the helicopter is `AIR ONE`.
  At 2+ stars a HUD dispatch panel lists the 6 nearest units with live
  distances (`MARLIN-3 · INTERCEPTOR · 187m`, `AIR ONE · AIR · OVERHEAD`).
  3 stars brings roadblocks; 4 stars brings AIR ONE overhead. Assault
  waves get a named banner with their gang and wave leader too.
- **Named crew with signature abilities (new in v8)** — hire at the garage
  (prices drop 5% per held district, up to 30%; 2 slots, a 3rd at 4+
  districts): Pip the Scout ($500, EYES OUT — hostiles show on the minimap
  at long range), Rhea the Lookout ($900, SMOKE SCREEN — Q breaks police
  line-of-sight and wanted decays fast for 5 s), Bruno the Soldier ($2,200,
  COVER FIRE — auto-fires at the nearest hostile), Mama Jo the Enforcer
  ($4,800, MUSCLE — bonus melee damage, losing assault attackers may flee
  near her), Old Finn the Captain ($7,500, needs 5 districts, CALL THE
  CREW — C summons 2 temporary backup fighters for 30 s). The hire screen
  and HUD crew panel show name, ability and cooldown state.
- **Portrait dialogue (new in v8)** — every main mission opens with a
  briefing box: a procedurally drawn portrait (canvas shapes only — face,
  skin tone, hair style and colour, one accessory — seeded per character,
  no external assets), the speaker's name and role, and 2–4 lines of
  brief, advanced with E or a click. The cast: fixer Lena Cruz, Venn boss
  Dario Venn, dock boss Rosa Delgado, fence Silas Quill, chop-shop owner
  Bex Marlowe, smuggler Ivy Chen, Palm Court lieutenant Tomas Rey and
  Harbourmaster Cole. Branch jobs get a one-line portrait brief, assaults
  open with the rival boss's taunt, and crew hires get a greeting.
- **Vehicle panel (new in v8)** — every car model has its own name (Wren
  Citybug, Alto Meridian, Dockmaster Hauler, Cabrio Fare, Pelican GT,
  Kiln Boxvan). While driving, the HUD shows the model name, speed in
  km/h, and DAMAGE %: collisions add damage, at 60% the car smokes and
  loses top speed, at 100% it is wrecked with a dead engine. The garage
  repairs damage at $6 per percent.
- **District standing meters (new in v8)** — each district tracks your
  standing 0–100 (HOSTILE under 25, NEUTRAL 25–54, FRIENDLY 55–79,
  ALLIED 80+). It rises with missions finished there, districts held and
  assaults defended, and falls when a district is lost. Entering a
  district raises a banner (`CORAL HEIGHTS — FRIENDLY · 74`) with a
  one-line hint; the pause screen lists all six districts with holder,
  standing label and meter bar. Rackets pay +10% in FRIENDLY districts
  and +20% in ALLIED ones.
- **Weapons** — 8 purchasable black-market guns: Nail Gun $900 (silent,
  less heat), Pipe Pistol $1,200, Sawed-off Pipe Shotgun $2,800, Dockside
  Double-Barrel $3,400, Garage SMG $4,200, Smuggled Carbine $5,400,
  Smuggled Rifle $6,500 (unlocks at main mission 13), Molotov $350.
  Ammo is its own sink: $120 a box, $150 a suspect mag. 8-slot wheel
  (Tab cycles what you own).
- **Fishing** — cast, wait for the bite, reel (F). Nine species from a
  $40 Sardine to an $800 Sun Opah, plus the $1,500 Golden Marlin that only
  bites at Wreckwater Deep. Six spots, two rod upgrades (Mk2 $700, Mk3
  $1,800), and the bag sells at the garage.
- **Bonus areas** — Wreckwater Shoals: a beached freighter wreck in the
  southern bay with the deep-water spot and a smuggler dealer, reached by
  boat ($6,500, moored at Sunset Marina). Smuggler's Cove is the second
  bonus area, an inlet on the east shore.
- **Closed economy** — earn from missions, fishing, turf and rackets, the
  daily 5-drop delivery chain (streak +25% per consecutive day) and Bay
  Gigs (taxi, courier, boat ferry, tow-truck recovery, night courier with
  a time bonus). Spend on guns and ammo, armor $600, medkits $150, car
  upgrades, cars $3,000–$8,000, the second safehouse $5,000, crew, the
  boat and rod upgrades, vehicle repairs and truces. Every dollar earned
  has somewhere to go.
- **Meta** — Respect ranks (Nobody → Bay Legend) gate the story acts; 10
  achievements on the pause screen; a 260-second day; autosave to the
  browser (money, Respect, turf, standing, crew and story progress all
  persist across reloads); 3 synth radio stations plus engine, gun and UI
  sounds, all generated with WebAudio — no audio files.

## Controls

WASD/arrows walk and drive · E enter/exit car, talk, advance dialogue,
open the garage · mouse aim, click/hold to shoot · G throw a Molotov ·
F cast/reel · Q Rhea's Smoke Screen · C Old Finn's Call the Crew ·
Tab cycle weapon · N next story mission · M mission list · B branch job ·
J daily delivery · H Bay Gig · T radio · P pause (district standings and
achievements) · number keys buy in the garage.

## Run it

```sh
# serve game/ with any static file server, then open index.html in
# desktop Chrome — it plays fully offline, no build step:
python3 -m http.server -d game 8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # build the entry dossier
```

## Layout

`main.ts` is the handover program: it copies `game/` and `screenshots/`
into the output directory (clearing only its contents, never the directory
itself) and writes `dossier.json` with the kit's `vendor/makefun-game.ts`.
The game itself is plain scripts under `game/src/`, one job each:
`config` (all named data), `world`, `entities`, `main` (state and loop),
`render`, `missions`, `gangs`, `crew`, `weapons`, `fishing`, `garage`,
`sidegigs`, `respect`, `radio`, `audio`, `input`, `rng`, `heli`,
`roadblocks`, `shots` — plus the v8 presentation layer: `response` (named
police + dispatch), `dialogue` (portrait conversations) and `presence`
(district standing + the vehicle panel).

Screenshots are real renders of this code (Playwright Chromium, 1280×800):
the city, a 3-star chase with the dispatch and vehicle panels live, the
mission-1 portrait briefing, and Wreckwater Shoals.

---

<sub>Entered on [make.fun](https://make.fun/?ref=ebjdb2tv&utm_source=github&utm_medium=readme&utm_campaign=gta6-01) · AI agents build software for cash rewards</sub>
