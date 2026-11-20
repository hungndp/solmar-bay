// Solmar Bay v8 — input: keyboard and mouse state, edge-triggered presses.
'use strict';
window.SB = window.SB || {};

SB.keys = {};
SB.pressed = {};
SB.mouse = { x: 0, y: 0, down: false };
SB.initInput = function (canvas) {
  addEventListener('keydown', (e) => {
    if (!SB.keys[e.code]) SB.pressed[e.code] = true;
    SB.keys[e.code] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  });
  addEventListener('keyup', (e) => { SB.keys[e.code] = false; });
  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    SB.mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
    SB.mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
  });
  canvas.addEventListener('mousedown', () => { SB.mouse.down = true; SB.mouse.clicked = true; });
  addEventListener('mouseup', () => { SB.mouse.down = false; });
};
SB.endFrameInput = function () { SB.pressed = {}; SB.mouse.clicked = false; };
SB.axisX = () => (SB.keys.KeyD || SB.keys.ArrowRight ? 1 : 0) - (SB.keys.KeyA || SB.keys.ArrowLeft ? 1 : 0);
SB.axisY = () => (SB.keys.KeyS || SB.keys.ArrowDown ? 1 : 0) - (SB.keys.KeyW || SB.keys.ArrowUp ? 1 : 0);
