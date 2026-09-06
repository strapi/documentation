'use strict';
const fs = require('fs');
const F = 'deadreckoning.js';
let src = fs.readFileSync(F, 'utf8');
let fails = 0;
function rep(a, b) {
  if (src.indexOf(a) < 0) { console.error('NOT FOUND: ' + a.slice(0, 70)); fails++; return; }
  src = src.replace(a, b);
}
rep(
`  /* the sheet is wider than it is tall, so the islands off soundings ride an
     ellipse just outside the archipelagos rather than a circle that would
     stretch the chart into empty water */
  const rimX = Math.max(...world.positions.map(p => Math.abs(p.x))) * 1.08;
  const rimY = Math.max(...world.positions.map(p => Math.abs(p.y))) * 1.10;
  let oi = 0;`,
`  /* the pages off soundings ride an ellipse of outer water clear of BOTH
     continents, so a page the corpus never touches is a shore the mainland
     never sees */
  let bminx = 1e9, bmaxx = -1e9, bminy = 1e9, bmaxy = -1e9;
  for (const P of world.provinces) {
    const pr = P.rmax || P.r;
    bminx = Math.min(bminx, P.x - pr); bmaxx = Math.max(bmaxx, P.x + pr);
    bminy = Math.min(bminy, P.y - pr); bmaxy = Math.max(bmaxy, P.y + pr);
  }
  const rimCx = (bminx + bmaxx) / 2, rimCy = (bminy + bmaxy) / 2;
  const rimX = (bmaxx - bminx) / 2 + 3.6 / world.nmPerUnit;
  const rimY = (bmaxy - bminy) / 2 + 3.6 / world.nmPerUnit;
  let oi = 0;`);
rep(
`      const a = (oi * 2.399963 + 0.6) % TAU;
      const k = 1 + (oi % 3) * 0.03;
      isle.pos.x = Math.cos(a) * rimX * k;
      isle.pos.y = Math.sin(a) * rimY * k;`,
`      const a = (oi * 2.399963 + 0.6) % TAU;
      const k = 1 + (oi % 3) * 0.03;
      isle.pos.x = rimCx + Math.cos(a) * rimX * k;
      isle.pos.y = rimCy + Math.sin(a) * rimY * k;`);
fs.writeFileSync(F, src);
console.log(fails ? 'FAILED ' + fails : 'patched clean');
