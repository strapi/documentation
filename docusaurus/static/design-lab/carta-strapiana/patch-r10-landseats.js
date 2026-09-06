/* A land name that finds no seat on the vertical line of her own ground may
   step a little east or west along it - centered seats always tried first. */
const fs = require('fs');
const F = 'deadreckoning.js';
let s = fs.readFileSync(F, 'utf8');
const from =
`    let ok = false;
    for (const [px, py] of tries) {
      for (const dyy of [0, -h, h, -h * 2, h * 2]) {
        const bx = { x0: px - w / 2, x1: px + w / 2, y0: py + dyy - h / 2, y1: py + dyy + h / 2 };
        if (hit(bx)) continue;
        put(geoHtml, 'cl-land' + (prime ? '' : ' sat'), esc(t), px, py + dyy, w, h,
          'font-size:' + (fs * S).toFixed(2) + 'px;letter-spacing:' + (sp * S).toFixed(2) + 'px');
        ok = true; break;
      }
      if (ok) break;
    }`;
const to =
`    let ok = false;
    for (const [px0b, py] of tries) {
      for (const dyy of [0, -h, h, -h * 2, h * 2]) {
        for (const dxx of [0, -w * 0.42, w * 0.42]) {
          const px = px0b + dxx;
          const bx = { x0: px - w / 2, x1: px + w / 2, y0: py + dyy - h / 2, y1: py + dyy + h / 2 };
          if (hit(bx)) continue;
          put(geoHtml, 'cl-land' + (prime ? '' : ' sat'), esc(t), px, py + dyy, w, h,
            'font-size:' + (fs * S).toFixed(2) + 'px;letter-spacing:' + (sp * S).toFixed(2) + 'px');
          ok = true; break;
        }
        if (ok) break;
      }
      if (ok) break;
    }`;
if (!s.includes(from)) { console.error('MISS: land seats'); process.exit(1); }
s = s.split(from).join(to);
fs.writeFileSync(F, s);
console.log('ok: land labels gain east-west seats');
