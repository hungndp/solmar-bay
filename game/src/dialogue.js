// Solmar Bay v8 — dialogue: portrait conversations. A portrait is drawn
// procedurally from the character's cast row (skin, hair style and colour,
// one accessory), seeded by the character's name — canvas shapes only, no
// external assets. Briefings, assault taunts and crew greetings all speak
// through this one box, advanced with E or a click.
'use strict';
window.SB = window.SB || {};

SB.portraitSeed = function (name) { return Math.floor(SB.hash01(name) * 100000); };
// Draw the seeded portrait for `name` into a ctx box at (x, y, size).
SB.drawPortrait = function (ctx, name, x, y, size) {
  const cast = SB.CAST[name] || { skin: '#c98a5e', hair: '#222222', style: 'crop', acc: 'none' };
  const seed = SB.portraitSeed(name), rng = SB.makeRng(seed);
  ctx.save();
  ctx.fillStyle = '#1d2f45'; ctx.fillRect(x, y, size, size);
  ctx.fillStyle = ['#274b63', '#3d2c50', '#503a24', '#24403a'][seed % 4];
  ctx.fillRect(x + 3, y + 3, size - 6, size - 6);
  const cx = x + size / 2, cy = y + size * 0.52, r = size * 0.27;
  ctx.fillStyle = '#2e2a33'; // shoulders
  ctx.beginPath(); ctx.ellipse(cx, y + size * 0.98, size * 0.34, size * 0.24, 0, 0, 7); ctx.fill();
  ctx.fillStyle = cast.skin; // face
  ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.82, r, 0, 0, 7); ctx.fill();
  ctx.fillStyle = cast.hair; // hair by style
  if (cast.style === 'bob') { ctx.fillRect(cx - r * 0.95, cy - r * 1.05, r * 1.9, r * 1.5); ctx.fillStyle = cast.skin; ctx.beginPath(); ctx.ellipse(cx, cy + 2, r * 0.72, r * 0.9, 0, 0, 7); ctx.fill(); }
  else if (cast.style === 'slick') { ctx.beginPath(); ctx.ellipse(cx, cy - r * 0.72, r * 0.84, r * 0.45, 0, Math.PI, 0); ctx.fill(); }
  else if (cast.style === 'bun') { ctx.beginPath(); ctx.arc(cx, cy - r * 1.05, r * 0.34, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(cx, cy - r * 0.8, r * 0.84, r * 0.3, 0, Math.PI, 0); ctx.fill(); }
  else if (cast.style === 'mohawk') { ctx.fillRect(cx - r * 0.18, cy - r * 1.5, r * 0.36, r * 0.8); }
  else if (cast.style === 'long') { ctx.fillRect(cx - r, cy - r, r * 0.3, r * 2.1); ctx.fillRect(cx + r * 0.7, cy - r, r * 0.3, r * 2.1); ctx.beginPath(); ctx.ellipse(cx, cy - r * 0.8, r * 0.84, r * 0.3, 0, Math.PI, 0); ctx.fill(); }
  else if (cast.style === 'crop') { ctx.beginPath(); ctx.ellipse(cx, cy - r * 0.78, r * 0.84, r * 0.36, 0, Math.PI, 0); ctx.fill(); }
  // eyes and mouth
  ctx.fillStyle = '#181008';
  const ey = cy - r * 0.08, ex = r * 0.32;
  if (cast.acc !== 'shades') { ctx.fillRect(cx - ex - 2, ey, 4, 3); ctx.fillRect(cx + ex - 2, ey, 4, 3); }
  ctx.fillRect(cx - r * 0.2, cy + r * 0.48, r * 0.4, 2);
  // the one accessory
  ctx.strokeStyle = '#e8c85a'; ctx.fillStyle = '#e8c85a'; ctx.lineWidth = 2;
  if (cast.acc === 'shades') { ctx.fillStyle = '#101418'; ctx.fillRect(cx - r * 0.78, ey - 4, r * 1.56, 9); }
  else if (cast.acc === 'earring') { ctx.beginPath(); ctx.arc(cx + r * 0.86, cy + r * 0.3, 3, 0, 7); ctx.stroke(); }
  else if (cast.acc === 'cap') { ctx.fillStyle = '#31572c'; ctx.fillRect(cx - r * 0.9, cy - r * 1.02, r * 1.8, 6); ctx.fillRect(cx - r * 0.9, cy - r * 0.96, r * 2.2, 4); }
  else if (cast.acc === 'chain') { ctx.beginPath(); ctx.arc(cx, cy + r * 1.15, r * 0.55, 0.3, Math.PI - 0.3); ctx.stroke(); }
  else if (cast.acc === 'bandana') { ctx.fillStyle = '#a33327'; ctx.fillRect(cx - r * 0.86, cy - r * 0.98, r * 1.72, 7); }
  else if (cast.acc === 'scarf') { ctx.fillStyle = '#7a4d9e'; ctx.fillRect(cx - r * 0.7, cy + r * 0.95, r * 1.4, 6); }
  else if (cast.acc === 'wrench') { ctx.strokeStyle = '#b9c2cc'; ctx.beginPath(); ctx.moveTo(cx + r * 1.05, cy + r * 0.9); ctx.lineTo(cx + r * 1.3, cy + r * 0.4); ctx.stroke(); }
  ctx.restore();
  return seed;
};
// A dialogue is a queue of {speaker, lines[]} pages; the game pauses while
// it is open and E / click advances it.
SB.openDialogue = function (pages, onDone) {
  const g = SB.G;
  g.dialogue = { pages, page: 0, onDone: onDone || null };
  SB.sfx.ui();
  return g.dialogue;
};
SB.dialogueCurrent = function () {
  const d = SB.G && SB.G.dialogue;
  if (!d) return null;
  const p = d.pages[d.page];
  return { speaker: p.speaker, role: (SB.CAST[p.speaker] || {}).role || 'Solmar Bay', lines: p.lines, portraitSeed: SB.portraitSeed(p.speaker), page: d.page, pages: d.pages.length };
};
SB.advanceDialogue = function () {
  const g = SB.G, d = g.dialogue;
  if (!d) return false;
  d.page++;
  SB.sfx.ui();
  if (d.page >= d.pages.length) {
    g.dialogue = null;
    if (d.onDone) d.onDone();
  }
  return true;
};
