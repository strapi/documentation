'use strict';
const fs = require('fs');
let src = fs.readFileSync('deadreckoning.js', 'utf8');
let fails = 0;
function rep(a, b) {
  if (src.indexOf(a) < 0) { console.error('NOT FOUND: ' + a.slice(0, 70).replace(/\n/g, '\\n')); fails++; return; }
  src = src.replace(a, b);
}
/* the maiden line stands mute through a passage, and tells closing/opening honestly */
rep(
`  if (!story.maiden || !story.qs || ui.mode !== 'deck') { if (!el.hidden) el.hidden = true; return; }
  const d = distToNm(story.qs);
  const txt = 'MAIDEN LANDFALL \\u00b7 THE QUICK START GUIDE \\u00b7 ' +
    (d >= 9.95 ? String(Math.round(d)) : d.toFixed(2)) + ' nm' +
    (ship.knots > 0.25 ? ', closing' : ' \\u00b7 F makes sail');`,
`  if (!story.maiden || !story.qs || ui.mode !== 'deck' || passage.on || passage.closing) {
    if (!el.hidden) el.hidden = true;
    return;
  }
  const d = distToNm(story.qs);
  const trend = story._fbLast == null ? 0 : d - story._fbLast;
  story._fbLast = d;
  const txt = 'MAIDEN LANDFALL \\u00b7 THE QUICK START GUIDE \\u00b7 ' +
    (d >= 9.95 ? String(Math.round(d)) : d.toFixed(2)) + ' nm' +
    (ship.knots <= 0.25 ? ' \\u00b7 F makes sail' : trend < -0.00001 ? ', closing' : trend > 0.00001 ? ', opening' : '');`);
/* the chief page of her province is named as such, not as her own tenant */
rep(
`  else {
    const A = isle.prov >= 0 && chart.geo && chart.geo.PROV ? chart.geo.PROV[isle.prov] : null;
    kindLine = A ? 'of the ' + esc(A.name) + ' province' : 'off soundings';
  }`,
`  else {
    const A = isle.prov >= 0 && chart.geo && chart.geo.PROV ? chart.geo.PROV[isle.prov] : null;
    kindLine = !A ? 'off soundings'
      : A.hub === isle.slug ? 'the chief page of her province'
      : 'of the ' + esc(A.name) + ' province';
  }`);
/* the sweep presses harder: the sea itself streams under her */
rep(
`  g.save();
  /* the sky streams past */
  g.globalAlpha = 0.22 * v;
  g.strokeStyle = 'rgba(64,50,32,0.85)';
  g.lineWidth = 1.3;
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const y = 36 + rr() * (HORIZON - 80);
    const x0 = rr() * (W + 200) - 100, len = (90 + rr() * 260) * v;
    g.moveTo(x0, y); g.lineTo(x0 - len, y + len * 0.04);
  }
  g.stroke();
  /* and the sea throws spray */
  g.globalAlpha = 0.45 * v;
  g.fillStyle = 'rgba(241,231,208,0.9)';
  for (let i = 0; i < 24; i++) {
    const x = W / 2 + (rr() - 0.5) * 760;
    const y = HORIZON + 110 + rr() * 320;
    g.fillRect(x, y, 2 + rr() * 2.5, 1 + rr() * 2);
  }
  g.restore();`,
`  g.save();
  /* the sky streams past */
  g.globalAlpha = 0.34 * v;
  g.strokeStyle = 'rgba(64,50,32,0.85)';
  g.lineWidth = 1.4;
  g.beginPath();
  for (let i = 0; i < 13; i++) {
    const y = 36 + rr() * (HORIZON - 80);
    const x0 = rr() * (W + 200) - 100, len = (110 + rr() * 300) * v;
    g.moveTo(x0, y); g.lineTo(x0 - len, y + len * 0.04);
  }
  g.stroke();
  /* the water streams under her, drawn out into speed lines */
  g.globalAlpha = 0.30 * v;
  g.strokeStyle = 'rgba(70,54,34,0.8)';
  g.lineWidth = 1.1;
  g.beginPath();
  for (let i = 0; i < 16; i++) {
    const y = HORIZON + 26 + rr() * (H - HORIZON - 60);
    const sp = (y - HORIZON) / (H - HORIZON);
    const x0 = rr() * (W + 300) - 150, len = (60 + rr() * 200) * v * (0.5 + sp * 1.6);
    const off = (x0 - W / 2) * 0.10 * sp;
    g.moveTo(x0, y); g.lineTo(x0 - len + off, y + len * 0.10 * sp);
  }
  g.stroke();
  /* and the bow throws spray */
  g.globalAlpha = 0.5 * v;
  g.fillStyle = 'rgba(241,231,208,0.92)';
  for (let i = 0; i < 30; i++) {
    const x = W / 2 + (rr() - 0.5) * 820;
    const y = HORIZON + 110 + rr() * 330;
    g.fillRect(x, y, 2 + rr() * 2.5, 1 + rr() * 2);
  }
  g.restore();`);
fs.writeFileSync('deadreckoning.js', src);
console.log(fails ? 'FAILED ' + fails : 'patched clean');
