// Solmar Bay v8 — render: the canvas drawing. World first (sea, sand,
// roads, parks, buildings, the wreck), then cars, people, effects, and
// the HUD: money/Respect/stars, the dispatch panel, the vehicle panel,
// the crew panel, the district banner, the minimap coloured by turf
// holder, menus, and the portrait dialogue box on top of everything.
'use strict';
window.SB = window.SB || {};

SB.render = function () {
  const ctx = SB.ctx; if (!ctx) return;
  const g = SB.G;
  ctx.fillStyle = '#0d1b26'; ctx.fillRect(0, 0, 1280, 800);
  if (!g) return;
  if (!g.started) { SB.drawStart(ctx); return; }
  const cam = g.camera;
  SB.drawWorld(ctx, cam);
  SB.drawEntities(ctx, cam);
  SB.drawHUD(ctx);
  if (g.menu === 'garage') SB.drawGarage(ctx);
  if (g.menu === 'missions') SB.drawMissions(ctx);
  if (g.menu === 'pause') SB.drawPause(ctx);
  if (g.dialogue) SB.drawDialogue(ctx);
};
SB.drawWorld = function (ctx, cam) {
  const W = SB.world;
  ctx.fillStyle = '#2a7d9e'; ctx.fillRect(0, 0, 1280, 800); // sea base
  ctx.fillStyle = '#e6d194'; // land
  ctx.fillRect(130 - cam.x, 0 - cam.y, SB.WORLD.w - 130, 2620);
  ctx.fillStyle = '#d9c384';
  ctx.fillRect(2980 - cam.x, 2180 - cam.y, 440, 380); // cove shore
  ctx.fillStyle = '#8a8f96'; // roads
  for (const rx of W.roadsX) ctx.fillRect(rx - 52 - cam.x, -cam.y, 104, SB.WORLD.h);
  for (const ry of W.roadsY) ctx.fillRect(-cam.x, ry - 52 - cam.y, SB.WORLD.w, 104);
  ctx.fillStyle = '#f2e3a0';
  for (const rx of W.roadsX) for (let y = 0; y < SB.WORLD.h; y += 46) ctx.fillRect(rx - 2 - cam.x, y - cam.y, 4, 24);
  for (const ry of W.roadsY) for (let x = 0; x < SB.WORLD.w; x += 46) ctx.fillRect(x - cam.x, ry - 2 - cam.y, 24, 4);
  ctx.fillStyle = '#5da85f';
  for (const pk of W.parks) ctx.fillRect(pk.x - cam.x, pk.y - cam.y, pk.w, pk.h);
  // Open water repainted over the road grid: the west strip, the southern
  // bay (Wreckwater's water) and the cove inlet are sea, not streets.
  ctx.fillStyle = '#2a7d9e';
  ctx.fillRect(-cam.x, -cam.y, 130, SB.WORLD.h);
  ctx.fillRect(-cam.x, 2620 - cam.y, SB.WORLD.w, SB.WORLD.h - 2620);
  ctx.fillRect(2980 - cam.x, 2180 - cam.y, 440, 380);
  ctx.fillStyle = '#3b8fb2';
  for (let wx = 0; wx < SB.WORLD.w; wx += 90) ctx.fillRect(wx - cam.x, 2660 - cam.y + (wx % 270 === 0 ? 26 : 0), 44, 5);
  for (const d of SB.DISTRICTS) { // turf tint wash
    ctx.fillStyle = SB.GANGS[SB.holderOf(d.id)].color + '22';
    ctx.fillRect(d.x - cam.x, d.y - cam.y, d.w, d.h);
  }
  const shades = ['#c9b8a3', '#b7c4cc', '#d8c9b0', '#a8b8c8', '#cbb59a'];
  for (const b of W.buildings) {
    if (b.x + b.w < cam.x || b.x > cam.x + 1280 || b.y + b.h < cam.y || b.y > cam.y + 800) continue;
    ctx.fillStyle = '#00000030'; ctx.fillRect(b.x + 5 - cam.x, b.y + 6 - cam.y, b.w, b.h);
    ctx.fillStyle = shades[b.shade]; ctx.fillRect(b.x - cam.x, b.y - cam.y, b.w, b.h);
    ctx.fillStyle = '#00000022'; ctx.fillRect(b.x - cam.x, b.y - cam.y, b.w, 8);
    ctx.fillStyle = '#ffe9a8';
    for (let f = 0; f < b.floors; f++) for (let wx = 10; wx < b.w - 12; wx += 20) ctx.fillRect(b.x + wx - cam.x, b.y + 14 + f * 13 - cam.y, 8, 7);
  }
  // The Wreckwater freighter wreck.
  const wk = SB.landmark('Wreckwater Shoals');
  ctx.save(); ctx.translate(wk.x - cam.x, wk.y - cam.y); ctx.rotate(0.5);
  ctx.fillStyle = '#6e3b2a'; ctx.fillRect(-120, -26, 240, 52);
  ctx.fillStyle = '#8a4a32'; ctx.fillRect(-40, -44, 60, 20); ctx.fillRect(50, -40, 34, 16);
  ctx.fillStyle = '#3c3c44'; ctx.fillRect(-110, -6, 200, 8);
  ctx.restore();
  ctx.fillStyle = '#17384a'; ctx.font = 'bold 15px system-ui'; ctx.textAlign = 'center';
  for (const lm of SB.LANDMARKS) ctx.fillText(lm.name, lm.x - cam.x, lm.y - 26 - cam.y);
  for (const s of SB.FISH_SPOTS) { ctx.fillStyle = '#ffd94d'; ctx.beginPath(); ctx.arc(s.x - cam.x, s.y - cam.y, 6, 0, 7); ctx.fill(); }
  const m = SB.missionObjective && SB.missionObjective();
  const target = m || (SB.G.gig ? { x: SB.G.gig.x, y: SB.G.gig.y } : SB.G.drop);
  if (target) {
    ctx.strokeStyle = '#ffd94d'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(target.x - cam.x, target.y - cam.y, 18 + Math.sin(performance.now() / 200) * 4, 0, 7); ctx.stroke();
  }
};
SB.drawCarShape = function (ctx, car, cam) {
  ctx.save(); ctx.translate(car.x - cam.x, car.y - cam.y); ctx.rotate(car.angle);
  ctx.fillStyle = '#00000038'; ctx.fillRect(-20, -9, 44, 22);
  ctx.fillStyle = car.wrecked ? '#3a3a3a' : car.color;
  ctx.fillRect(-22, -11, 44, 22);
  ctx.fillStyle = '#bfe6f5'; ctx.fillRect(-6, -8, 14, 16); ctx.fillRect(12, -7, 6, 14);
  ctx.fillStyle = '#14181d'; ctx.fillRect(-20, -13, 9, 5); ctx.fillRect(11, -13, 9, 5); ctx.fillRect(-20, 8, 9, 5); ctx.fillRect(11, 8, 9, 5);
  if (car.police) { ctx.fillStyle = '#e8f2ff'; ctx.fillRect(-12, -11, 24, 22); ctx.fillStyle = '#274b8f'; ctx.fillRect(-2, -11, 5, 22); }
  if ((car.damage || 0) >= 60 && !car.wrecked) { ctx.fillStyle = '#cccccc99'; ctx.beginPath(); ctx.arc(20, 0, 8 + Math.sin(performance.now() / 130) * 3, 0, 7); ctx.fill(); }
  ctx.restore();
};
SB.drawPerson = function (ctx, e, cam, color, r) {
  ctx.fillStyle = '#00000030'; ctx.beginPath(); ctx.ellipse(e.x - cam.x, e.y - cam.y + 8, r, r * 0.4, 0, 0, 7); ctx.fill();
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(e.x - cam.x, e.y - cam.y, r, 0, 7); ctx.fill();
  ctx.fillStyle = '#e8b88a'; ctx.beginPath(); ctx.arc(e.x - cam.x + Math.cos(e.angle || 0) * 3, e.y - cam.y + Math.sin(e.angle || 0) * 3, r * 0.45, 0, 7); ctx.fill();
  if (e.maxHp && e.hp < e.maxHp && !e.dead) { ctx.fillStyle = '#400'; ctx.fillRect(e.x - 12 - cam.x, e.y - 20 - cam.y, 24, 4); ctx.fillStyle = '#e33'; ctx.fillRect(e.x - 12 - cam.x, e.y - 20 - cam.y, 24 * Math.max(0, e.hp / e.maxHp), 4); }
};
SB.drawEntities = function (ctx, cam) {
  const g = SB.G;
  for (const c of g.cars) SB.drawCarShape(ctx, c, cam);
  for (const p of g.peds) if (!p.dead) SB.drawPerson(ctx, p, cam, p.shirt, 8);
  for (const f of g.fighters) if (!f.dead) SB.drawPerson(ctx, f, cam, f.color, 10);
  for (const m of g.crew) if (!m.dead) { SB.drawPerson(ctx, m, cam, '#35b6f0', 10); ctx.fillStyle = '#fff'; ctx.font = '10px system-ui'; ctx.textAlign = 'center'; ctx.fillText(m.name, m.x - cam.x, m.y - 24 - cam.y); }
  for (const u of g.units) {
    if (u.dead) continue;
    if (u.kind === 'copcar') {
      const fake = { x: u.x, y: u.y, angle: u.angle, color: '#20304a', police: true, damage: 0 };
      SB.drawCarShape(ctx, fake, cam);
      ctx.fillStyle = '#cfe4ff'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(u.callsign || '', u.x - cam.x, u.y - 24 - cam.y);
    } else if (u.kind === 'marksman') SB.drawPerson(ctx, u, cam, '#20304a', 10);
    else if (u.kind === 'heli') {
      ctx.save(); ctx.translate(u.x - cam.x, u.y - cam.y);
      ctx.fillStyle = '#f7e9a055'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-90, 210); ctx.lineTo(90, 210); ctx.fill();
      ctx.fillStyle = '#22262e'; ctx.fillRect(-26, -9, 52, 18); ctx.fillRect(-58, -3, 34, 6);
      ctx.fillStyle = '#888'; ctx.fillRect(-34, -13, 68, 3);
      ctx.restore();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('AIR ONE', u.x - cam.x, u.y - 22 - cam.y);
    }
  }
  const p = g.player;
  if (p.sailing) { ctx.fillStyle = '#e8e8e8'; ctx.fillRect(p.x - 16 - cam.x, p.y - 6 - cam.y, 32, 12); ctx.fillStyle = '#a33'; ctx.fillRect(p.x - 2 - cam.x, p.y - 16 - cam.y, 4, 12); }
  else if (!p.car) SB.drawPerson(ctx, p, cam, '#f2f2f2', 11);
  for (const b of g.bullets) { ctx.fillStyle = '#ffe27a'; ctx.fillRect(b.x - 2 - cam.x, b.y - 2 - cam.y, 4, 4); }
  for (const f of g.fires) { ctx.fillStyle = f.smoke ? '#bbbbbb88' : '#ff7b2d88'; ctx.beginPath(); ctx.arc(f.x - cam.x, f.y - cam.y, f.r, 0, 7); ctx.fill(); }
};
SB.drawHUD = function (ctx) {
  const g = SB.G, p = g.player;
  ctx.fillStyle = '#0a141fdd'; ctx.fillRect(12, 10, 348, 118);
  ctx.fillStyle = '#7be495'; ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'left';
  ctx.fillText('$' + g.money.toLocaleString(), 24, 40);
  ctx.fillStyle = '#ffd94d'; ctx.font = '14px system-ui';
  ctx.fillText(`Respect ${g.respect} · ${SB.rankOf(g.respect).name}`, 24, 64);
  ctx.fillStyle = '#e8eef4'; ctx.font = '13px system-ui';
  ctx.fillText(`Districts ${g.held.size}/6 · Crew ${g.crew.filter((m) => !m.dead).length}/${SB.crewSlots()} · Fish bag $${SB.bagValue()}`, 24, 84);
  ctx.fillText(`Weapon: ${SB.currentWeapon().name}${g.molotovs ? ' · Molotov x' + g.molotovs : ''} · Day ${g.day} · HP ${Math.max(0, Math.ceil(p.hp))}`, 24, 104);
  ctx.font = '20px system-ui';
  for (let i = 0; i < 5; i++) { ctx.fillStyle = i < g.wanted ? '#ffd94d' : '#44505c'; ctx.fillText('★', 286 + i * 15 - 60, 40); }
  const obj = SB.missionObjective();
  ctx.fillStyle = '#0a141fcc'; ctx.fillRect(12, 136, 430, obj ? 44 : 24);
  ctx.fillStyle = '#ffe9a8'; ctx.font = '13px system-ui';
  ctx.fillText(obj ? `${obj.mission} (${obj.step}/${obj.of}) — ${obj.text}` : 'Free roam — N: next story job · M: jobs · B: branch job · E: garage', 20, 154);
  if (obj) { ctx.fillStyle = '#9fb6c9'; ctx.fillText('Marker distance: ' + Math.round(SB.dist(p.x, p.y, obj.x, obj.y) / 4) + 'm', 20, 172); }
  SB.drawDispatch(ctx); SB.drawVehiclePanel(ctx); SB.drawCrewPanel(ctx);
  SB.drawMinimap(ctx);
  if (g.districtBanner && performance.now() < g.districtBanner.until) {
    ctx.fillStyle = '#0a141fd9'; ctx.fillRect(390, 14, 500, 52);
    ctx.fillStyle = '#ffd94d'; ctx.font = 'bold 17px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(g.districtBanner.text, 640, 38);
    ctx.fillStyle = '#cfe0ee'; ctx.font = '12px system-ui'; ctx.fillText(g.districtBanner.hint, 640, 58);
    ctx.textAlign = 'left';
  }
  ctx.font = '14px system-ui';
  g.toasts = g.toasts.filter((t) => performance.now() < t.until);
  g.toasts.forEach((t, i) => { ctx.fillStyle = '#0a141fcc'; const w = ctx.measureText(t.msg).width + 20; ctx.fillRect(12, 700 - i * 28, w, 22); ctx.fillStyle = '#fff'; ctx.fillText(t.msg, 22, 716 - i * 28); });
};
SB.drawDispatch = function (ctx) {
  const g = SB.G;
  if (g.wanted < 2) return;
  const list = SB.dispatchList();
  ctx.fillStyle = '#140f2ee6'; ctx.fillRect(1020, 150, 248, 34 + list.length * 19 + 8);
  ctx.fillStyle = '#ff9d5c'; ctx.font = 'bold 13px system-ui'; ctx.textAlign = 'left';
  ctx.fillText('BAY DISPATCH — LIVE', 1032, 172);
  ctx.font = '12px monospace'; ctx.fillStyle = '#e8eef4';
  list.forEach((e, i) => ctx.fillText(SB.dispatchLine(e), 1032, 194 + i * 19));
};
SB.drawVehiclePanel = function (ctx) {
  const g = SB.G, car = g.player.car;
  if (!car) return;
  const v = SB.vehiclePanel(car);
  ctx.fillStyle = '#0a141fe6'; ctx.fillRect(1020, 420, 248, 96);
  ctx.fillStyle = '#7fd0f5'; ctx.font = 'bold 15px system-ui'; ctx.fillText(v.name, 1032, 444);
  ctx.fillStyle = '#fff'; ctx.font = '13px system-ui';
  ctx.fillText(`Speed ${v.kmh} km/h (top ${v.topKmh})`, 1032, 466);
  ctx.fillText(`DAMAGE ${v.damage}%${v.wrecked ? ' — WRECKED' : v.smoking ? ' — SMOKING' : ''}`, 1032, 486);
  ctx.fillStyle = '#3a4552'; ctx.fillRect(1032, 494, 220, 8);
  ctx.fillStyle = v.damage >= 60 ? '#e0483c' : '#7be495'; ctx.fillRect(1032, 494, 220 * (1 - v.damage / 100), 8);
};
SB.drawCrewPanel = function (ctx) {
  const g = SB.G;
  const panel = SB.crewPanel();
  if (!panel.length) return;
  ctx.fillStyle = '#0a141fd9'; ctx.fillRect(12, 470, 252, 30 + panel.length * 20);
  ctx.fillStyle = '#7fd0f5'; ctx.font = 'bold 12px system-ui'; ctx.fillText('CREW', 22, 490);
  ctx.font = '12px system-ui'; ctx.fillStyle = '#e8eef4';
  panel.forEach((m, i) => ctx.fillText(`${m.name} · ${m.abilityName}${m.cooldownLeft ? ' (' + m.cooldownLeft + 's)' : ''}`, 22, 510 + i * 20));
};
SB.drawMinimap = function (ctx) {
  const g = SB.G, x0 = 1096, y0 = 560, w = 172, h = 134, sx = w / SB.WORLD.w, sy = h / SB.WORLD.h;
  ctx.fillStyle = '#0a141fe6'; ctx.fillRect(x0 - 6, y0 - 6, w + 12, h + 26);
  ctx.fillStyle = '#2a7d9e'; ctx.fillRect(x0, y0, w, h);
  for (const d of SB.DISTRICTS) { ctx.fillStyle = SB.GANGS[SB.holderOf(d.id)].color; ctx.globalAlpha = 0.75; ctx.fillRect(x0 + d.x * sx, y0 + d.y * sy, d.w * sx, d.h * sy); ctx.globalAlpha = 1; }
  ctx.fillStyle = '#fff'; ctx.font = '8px system-ui'; ctx.textAlign = 'left';
  for (const d of SB.DISTRICTS) ctx.fillText(d.name.split(' ')[0], x0 + d.x * sx + 2, y0 + d.y * sy + 9);
  const eyes = g.crew.some((m) => !m.dead && m.ability === 'eyes');
  ctx.fillStyle = '#ff5c5c';
  for (const u of g.units) { if (eyes || SB.dist(u.x, u.y, g.player.x, g.player.y) < 700) ctx.fillRect(x0 + u.x * sx - 2, y0 + u.y * sy - 2, 4, 4); }
  ctx.fillStyle = '#ffd94d';
  for (const f of g.fighters) if (!f.dead && (eyes || SB.dist(f.x, f.y, g.player.x, g.player.y) < 700)) ctx.fillRect(x0 + f.x * sx - 2, y0 + f.y * sy - 2, 4, 4);
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x0 + g.player.x * sx, y0 + g.player.y * sy, 3.4, 0, 7); ctx.fill();
  ctx.fillStyle = '#cfe0ee'; ctx.font = '10px system-ui';
  ctx.fillText(SB.districtAt(g.player.x, g.player.y).name + ' — ' + (SB.G.held.size ? '' : '') + SB.standingLabel(SB.standingOf(SB.districtAt(g.player.x, g.player.y).id || 'x')), x0, y0 + h + 14);
};
SB.drawDialogue = function (ctx) {
  const d = SB.dialogueCurrent(); if (!d) return;
  ctx.fillStyle = '#0a1018ee'; ctx.fillRect(190, 596, 900, 168);
  ctx.strokeStyle = '#ffd94d'; ctx.strokeRect(190, 596, 900, 168);
  SB.drawPortrait(ctx, d.speaker, 210, 616, 128);
  ctx.fillStyle = '#ffd94d'; ctx.font = 'bold 18px system-ui'; ctx.textAlign = 'left';
  ctx.fillText(d.speaker.toUpperCase(), 362, 632);
  ctx.fillStyle = '#9fb6c9'; ctx.font = '12px system-ui';
  ctx.fillText((SB.CAST[d.speaker] || {}).role || '', 362, 650);
  ctx.fillStyle = '#f2f6fa'; ctx.font = '16px system-ui';
  d.lines.forEach((line, i) => {
    // naive word wrap at 86 chars
    const words = line.split(' '); let row = '', rows = [];
    for (const w of words) { if ((row + ' ' + w).length > 86) { rows.push(row); row = w; } else row = row ? row + ' ' + w : w; }
    rows.push(row);
    rows.forEach((r, j) => ctx.fillText(r, 362, 682 + i * 44 + j * 20));
  });
  ctx.fillStyle = '#7be495'; ctx.font = '12px system-ui';
  ctx.fillText(`E / click to continue (${d.page + 1}/${d.pages})`, 950, 748);
};
SB.drawStart = function (ctx) {
  const grd = ctx.createLinearGradient(0, 0, 0, 800);
  grd.addColorStop(0, '#f7a54d'); grd.addColorStop(0.55, '#e2607a'); grd.addColorStop(1, '#274b63');
  ctx.fillStyle = grd; ctx.fillRect(0, 0, 1280, 800);
  ctx.fillStyle = '#20303e';
  for (let i = 0; i < 14; i++) { const bx = i * 96, bh = 130 + (i * 67) % 190; ctx.fillRect(bx, 560 - bh, 78, bh + 240); }
  ctx.fillStyle = '#2a7d9e'; ctx.fillRect(0, 620, 1280, 180);
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 74px system-ui'; ctx.textAlign = 'center';
  ctx.fillText('SOLMAR BAY', 640, 240);
  ctx.font = '22px system-ui'; ctx.fillStyle = '#ffe9a8';
  ctx.fillText('An open-world crime game — 60 missions, turf wars, named crews, one bay.', 640, 286);
  ctx.font = '17px system-ui'; ctx.fillStyle = '#eef6fb';
  ctx.fillText('Jace arrives broke in a city where guns are banned, smuggled and expensive.', 640, 330);
  ctx.fillText('Steal cars. Run jobs for Lena Cruz. Take turf from three gangs. Fish Wreckwater Deep.', 640, 358);
  ctx.fillStyle = '#0a141fd9'; ctx.fillRect(390, 420, 500, 120);
  ctx.fillStyle = '#7be495'; ctx.font = 'bold 20px system-ui';
  ctx.fillText('CLICK OR PRESS ENTER TO PLAY', 640, 462);
  ctx.fillStyle = '#cfe0ee'; ctx.font = '14px system-ui';
  ctx.fillText('WASD drive/walk · E enter/exit & talk · F fish · mouse shoot · Q/C crew abilities', 640, 492);
  ctx.fillText('N story job · M jobs · B branch · J deliveries · H gigs · P pause · T radio', 640, 516);
  ctx.textAlign = 'left';
};
SB.drawGarage = function (ctx) {
  const g = SB.G, items = SB.garageMenu();
  ctx.fillStyle = '#0a1018f2'; ctx.fillRect(300, 60, 680, 660);
  ctx.strokeStyle = '#7fd0f5'; ctx.strokeRect(300, 60, 680, 660);
  ctx.fillStyle = '#7fd0f5'; ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'left';
  ctx.fillText("LENA'S GARAGE — $" + g.money.toLocaleString(), 326, 98);
  ctx.font = '13px system-ui'; ctx.fillStyle = '#9fb6c9';
  ctx.fillText('Number keys buy · E closes · Crew discount ' + Math.round(SB.crewDiscount() * 100) + '% from turf', 326, 120);
  ctx.font = '14px system-ui';
  items.slice(0, 22).forEach((it, i) => {
    ctx.fillStyle = i === g.garageIdx ? '#ffd94d' : '#e8eef4';
    ctx.fillText(`${(i + 1) % 10}. ${it.label}`, 326, 148 + i * 24);
    ctx.fillStyle = '#7d93a8'; ctx.font = '11px system-ui';
    ctx.fillText(it.hint, 700, 148 + i * 24); ctx.font = '14px system-ui';
  });
};
SB.drawMissions = function (ctx) {
  const g = SB.G;
  ctx.fillStyle = '#0a1018f2'; ctx.fillRect(240, 70, 800, 620);
  ctx.strokeStyle = '#ffd94d'; ctx.strokeRect(240, 70, 800, 620);
  ctx.fillStyle = '#ffd94d'; ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'left';
  ctx.fillText('JOBS — story ' + g.mainNext + '/15 done', 266, 108);
  ctx.font = '14px system-ui'; ctx.fillStyle = '#e8eef4';
  SB.MAIN_MISSIONS.forEach((m, i) => {
    ctx.fillStyle = i < g.mainNext ? '#7be495' : g.respect < m.gate ? '#667' : '#e8eef4';
    ctx.fillText(`${i + 1}. ${m.name} — $${m.pay}${m.gate ? ' · needs ' + m.gate + ' Respect' : ''} · ${m.giver}`, 266, 140 + i * 22);
  });
  ctx.fillStyle = '#9fb6c9'; ctx.font = '13px system-ui';
  ctx.fillText('Branch jobs (45, $13,770 total) pay $250-$380: press B in the world for one now.', 266, 486);
  ctx.fillText('Main payouts sum to $40,100 across the 3 acts. E closes.', 266, 510);
};
SB.drawPause = function (ctx) {
  const g = SB.G;
  ctx.fillStyle = '#0a1018f5'; ctx.fillRect(190, 50, 900, 700);
  ctx.strokeStyle = '#e8eef4'; ctx.strokeRect(190, 50, 900, 700);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 24px system-ui'; ctx.textAlign = 'left';
  ctx.fillText('PAUSED — Solmar Bay', 220, 92);
  ctx.font = '15px system-ui'; ctx.fillStyle = '#ffd94d';
  ctx.fillText('DISTRICTS — holder · your standing', 220, 130);
  ctx.font = '14px system-ui';
  SB.DISTRICTS.forEach((d, i) => {
    const v = Math.round(SB.standingOf(d.id)), holder = SB.holderOf(d.id);
    const y = 158 + i * 30;
    ctx.fillStyle = '#e8eef4';
    ctx.fillText(`${d.name} — ${holder}${g.rackets[d.id] ? ' · ' + SB.RACKETS[g.rackets[d.id]].name : ''}`, 220, y);
    ctx.fillStyle = '#3a4552'; ctx.fillRect(560, y - 11, 220, 10);
    ctx.fillStyle = v >= 80 ? '#7be495' : v >= 55 ? '#a5d86a' : v >= 25 ? '#ffd94d' : '#e0483c';
    ctx.fillRect(560, y - 11, 220 * v / 100, 10);
    ctx.fillStyle = '#cfe0ee'; ctx.fillText(`${SB.standingLabel(v)} · ${v}`, 796, y);
  });
  ctx.fillStyle = '#ffd94d'; ctx.font = 'bold 15px system-ui';
  ctx.fillText('ACHIEVEMENTS — ' + g.achievements.size + '/10', 220, 372);
  ctx.font = '13px system-ui';
  SB.ACHIEVEMENTS.forEach((a, i) => {
    ctx.fillStyle = g.achievements.has(a.id) ? '#7be495' : '#667';
    ctx.fillText((g.achievements.has(a.id) ? '✓ ' : '· ') + a.name, 220 + (i % 2) * 380, 400 + Math.floor(i / 2) * 24);
  });
  ctx.fillStyle = '#9fb6c9'; ctx.font = '13px system-ui';
  ctx.fillText('Autosave is on. P or Esc resumes. Radio: ' + (SB.radio.station < 0 ? 'off' : SB.STATIONS[SB.radio.station].name), 220, 560);
  ctx.fillText('Crew abilities: Q = Rhea SMOKE SCREEN · C = Old Finn CALL THE CREW · Pip EYES OUT is passive.', 220, 586);
};
