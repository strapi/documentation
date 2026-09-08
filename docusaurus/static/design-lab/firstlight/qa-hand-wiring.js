/* QA: the wiring. Two things are asserted, and the second one is the one that
   decides whether this feels good or exhausting.
     - a frame pushed in at the source comes out as a window event carrying
       SCREEN pixels, not normalised image coordinates;
     - the COMFORT BOX maps a small central region of the camera frame to the
       whole screen. Without it, reaching a corner of the screen means reaching
       the edge of the camera's view with your arm fully extended, which is
       exactly where gorilla arm comes from.
   The image is mirrored on the way out, because a camera sees you facing it
   and an unmirrored hand moves the wrong way. */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'serve.js')]);
  const port = await new Promise((res, rej) => {
    srv.stdout.on('data', d => { const m = String(d).match(/PORT=(\d+)/); if (m) res(+m[1]); });
    setTimeout(() => rej(new Error('server timeout')), 5000);
  });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });

  const r = await page.evaluate(async () => {
    const { startHands, COMFORT } = await import('./hand/hands.js');
    const { makeFakeSource } = await import('./hand/source.js');
    const src = makeFakeSource();
    const seen = [];
    for (const n of ['present', 'absent', 'move', 'grab', 'release', 'lock', 'spread']) {
      window.addEventListener('hand:' + n, (e) => seen.push({ n, d: e.detail }));
    }
    const api = startHands({ source: src });
    await api.arm();

    const hand = (pinch, curl, cx, cy) => {
      const size = 0.20;
      const L = new Array(21).fill(null).map(() => ({ x: cx, y: cy, z: 0 }));
      L[0] = { x: cx, y: cy + size, z: 0 };
      L[9] = { x: cx, y: cy, z: 0 };
      L[5] = { x: cx - size * 0.4, y: cy, z: 0 };
      L[8] = { x: cx - size * 0.5 * curl, y: cy - size * curl, z: 0 };
      L[4] = { x: L[8].x + pinch * size, y: L[8].y, z: 0 };
      L[12] = { x: cx, y: cy - size * 1.05 * curl, z: 0 };
      L[16] = { x: cx + size * 0.35 * curl, y: cy - size * 0.95 * curl, z: 0 };
      L[20] = { x: cx + size * 0.6 * curl, y: cy - size * 0.8 * curl, z: 0 };
      // cx, cy name where the hand is HELD, i.e. the pinch point, not some
      // unnamed part of the palm. The tips above are placed relative to a
      // nominal centre first; then every landmark is shifted by the delta
      // needed to put the pinch point (the same midpoint of 4 and 8 that
      // gestures.js reads as pinchPoint) exactly at (cx, cy), so a caller's
      // coordinates mean what they say instead of hiding a curl-dependent
      // offset.
      const rawPinch = { x: (L[4].x + L[8].x) / 2, y: (L[4].y + L[8].y) / 2 };
      const dx = cx - rawPinch.x, dy = cy - rawPinch.y;
      for (const p of L) { p.x += dx; p.y += dy; }
      return { landmarks: L, handedness: 'Right' };
    };

    // the LEFT edge of the comfort box, which must land at the RIGHT of the
    // screen once mirrored
    const leftEdge = 0.5 - COMFORT.w / 2;
    for (let i = 0; i < 40; i++) src.push({ hands: [hand(0.9, 1, leftEdge, 0.5)] });
    await new Promise(r2 => setTimeout(r2, 60));
    const moves = seen.filter(s => s.n === 'move');
    const last = moves[moves.length - 1];

    // and a grab
    for (let i = 0; i < 10; i++) src.push({ hands: [hand(0.20, 1, 0.5, 0.5)] });
    await new Promise(r2 => setTimeout(r2, 60));

    return {
      sawPresent: seen.some(s => s.n === 'present'),
      moveCount: moves.length,
      lastX: last ? last.d.x : null,
      lastY: last ? last.d.y : null,
      grabs: seen.filter(s => s.n === 'grab').length,
      W: window.innerWidth, H: window.innerHeight,
    };
  });

  const fails = [];
  if (!r.sawPresent) fails.push('no hand:present was dispatched');
  if (!r.moveCount) fails.push('no hand:move was dispatched');
  if (r.lastX === null || r.lastX < r.W * 0.85) fails.push(`the left edge of the comfort box landed at x=${r.lastX} of ${r.W}, wanted the right edge (mirrored)`);
  if (r.lastY === null || Math.abs(r.lastY - r.H / 2) > r.H * 0.12) fails.push(`a centred hand landed at y=${r.lastY}, wanted about ${r.H / 2}`);
  if (r.grabs !== 1) fails.push(`${r.grabs} grab events for one pinch, wanted exactly 1`);
  console.log(`  moves ${r.moveCount}   last (${Math.round(r.lastX)}, ${Math.round(r.lastY)}) of ${r.W}x${r.H}   grabs ${r.grabs}`);
  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  await browser.close(); srv.kill();
  process.exit(fails.length ? 1 : 0);
})();
