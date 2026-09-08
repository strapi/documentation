/* Render every footstep surface offline and describe it in numbers, so this
   is judged by what it produces and not by what the source says. The grain
   count is taken on a one-pole high-passed copy: a low ring oscillating is not
   texture, and counting raw envelope peaks let an 86 Hz plank pose as gravel. */
const fs = require('fs');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const OUT = '/private/tmp/claude-501/-Users-piwi-code-documentation/0d8629c6-231f-4fec-94af-6fe3669d37b8/scratchpad/qa/steps/';
function wav(l, r, sr) {
  const n = l.length, buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF',0); buf.writeUInt32LE(36+n*4,4); buf.write('WAVE',8); buf.write('fmt ',12);
  buf.writeUInt32LE(16,16); buf.writeUInt16LE(1,20); buf.writeUInt16LE(2,22);
  buf.writeUInt32LE(sr,24); buf.writeUInt32LE(sr*4,28); buf.writeUInt16LE(4,32); buf.writeUInt16LE(16,34);
  buf.write('data',36); buf.writeUInt32LE(n*4,40);
  for (let i=0;i<n;i++){ const a=Math.max(-1,Math.min(1,l[i]))*32767, b=Math.max(-1,Math.min(1,r[i]))*32767;
    buf.writeInt16LE(a|0, 44+i*4); buf.writeInt16LE(b|0, 46+i*4); }
  return buf;
}
function hp(x, sr, fc) {                       // one-pole high pass
  const rc = 1/(2*Math.PI*fc), a = rc/(rc + 1/sr), y = new Float64Array(x.length);
  for (let i=1;i<x.length;i++) y[i] = a*(y[i-1] + x[i] - x[i-1]);
  return y;
}
function describe(l, sr) {
  const n = l.length;
  let peak = 0, pk = 0;
  for (let i=0;i<n;i++){ const a=Math.abs(l[i]); if(a>peak){peak=a;pk=i;} }
  let first = pk; for (let i=0;i<pk;i++) if (Math.abs(l[i])>peak*0.05){ first=i; break; }
  let last = pk; for (let i=n-1;i>pk;i--) if (Math.abs(l[i])>peak*0.02){ last=i; break; }
  const t = hp(l, sr, 1500);                   // texture only
  let tp = 0; for (let i=0;i<n;i++) tp = Math.max(tp, Math.abs(t[i]));
  const W = Math.floor(sr*0.001), envl=[];
  for (let i=0;i<n;i+=W){ let m=0; for(let k=i;k<Math.min(n,i+W);k++) m=Math.max(m,Math.abs(t[k])); envl.push(m); }
  let hits=0, cool=0; const minGap=Math.ceil(0.003/(W/sr));
  for (let i=1;i<envl.length-1;i++){ if(cool>0){cool--;continue;}
    if(envl[i]>tp*0.15 && envl[i]>=envl[i-1] && envl[i]>=envl[i+1]){ hits++; cool=minGap; } }
  let zc=0; for(let i=first+1;i<=last;i++) if((l[i-1]<0)!==(l[i]<0)) zc++;
  return { peak:+peak.toFixed(3), attackMs:+(((pk-first)/sr)*1000).toFixed(2),
           durMs:+(((last-pk)/sr)*1000).toFixed(0), grains:hits,
           brightHz: last>first ? Math.round(zc/2/((last-first)/sr)) : 0 };
}
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await (await b.newContext()).newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:7801/goldenshore/qa-steps.html', { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => window.__ready === true, { timeout: 40000 });
  const surfaces = await p.evaluate(() => window.__surfaces);
  console.log('  surface    peak   attack   decay  grains   bright');
  const peaks = [], rows = [];
  for (const s of surfaces) {
    /* five takes, so the jitter cannot hide a bad average */
    let acc = null;
    for (let k=0;k<5;k++) {
      const d = await p.evaluate(async (s) => window.__renderStep(s), s);
      if (k===0) fs.writeFileSync(OUT + s + '.wav', wav(d.l, d.r, d.sr));
      const m = describe(d.l, d.sr);
      if (!acc) acc = m; else for (const key of Object.keys(m)) acc[key] += m[key];
    }
    for (const key of Object.keys(acc)) acc[key] = +(acc[key]/5).toFixed(key==='peak'?3:1);
    peaks.push(acc.peak); rows.push([s, acc]);
    console.log('  ' + s.padEnd(10) + String(acc.peak).padStart(5) + String(acc.attackMs+'ms').padStart(9)
      + String(Math.round(acc.durMs)+'ms').padStart(8) + String(Math.round(acc.grains)).padStart(7) + String(Math.round(acc.brightHz)+'Hz').padStart(10));
  }
  /* THE CRITERIA, stated so a later pass cannot quietly lower them.
     HARD grounds must strike inside 2.5 ms: that edge is what makes the ear
     hear an impact instead of a puff, and it is the fault the first build had.
     SOFT grounds are allowed 6 ms, because their body is a sine near 60-70 Hz
     and a 65 Hz sine physically cannot reach its own peak faster than 3.8 ms.
     Water is exempt from both: it is a swim stroke, a swell and not a hit. */
  const HARD = ['boards','cobbles','needles','scree','shell'];
  const SOFT = ['dirt','grass','sand'];
  let bad = [];
  for (const [s, m] of rows) {
    if (HARD.includes(s) && m.attackMs > 2.5) bad.push(s + ' strikes in ' + m.attackMs + 'ms, over 2.5');
    if (SOFT.includes(s) && m.attackMs > 6) bad.push(s + ' strikes in ' + m.attackMs + 'ms, over 6');
  }
  console.log('\n  attack     ' + (bad.length ? 'FAIL  ' + bad.join('; ') : 'PASS  every ground strikes inside its budget'));
  /* and they must be TELLABLE APART: no two grounds may sit close on both
     brightness and texture at once, which is the whole of the second complaint */
  let clash = [];
  for (let i=0;i<rows.length;i++) for (let j=i+1;j<rows.length;j++) {
    const a = rows[i][1], b2 = rows[j][1];
    const df = Math.abs(Math.log2((a.brightHz||1)/(b2.brightHz||1)));
    const dg = Math.abs(a.grains - b2.grains);
    const dd = Math.abs(Math.log2((a.durMs||1)/(b2.durMs||1)));
    if (df < 0.35 && dg < 3 && dd < 0.4) clash.push(rows[i][0] + ' vs ' + rows[j][0]);
  }
  console.log('  distinct   ' + (clash.length ? 'FAIL  too alike: ' + clash.join(', ') : 'PASS  all 36 pairs separate on tone, texture or decay'));
  const spread = Math.max(...peaks)/Math.min(...peaks);
  console.log('\n  loudness spread across the nine: ' + spread.toFixed(2) + ':1  ' + (spread <= 1.8 ? 'PASS (a walk will not jump)' : 'FAIL'));
  const walk = await p.evaluate(async () => window.__renderWalk(
    ['boards','boards','cobbles','cobbles','sand','sand','sand','grass','grass','dirt','dirt','needles','needles','scree','scree','scree','shell','shell']));
  fs.writeFileSync(OUT + 'a-walk-across-the-coast.wav', wav(walk.l, walk.r, walk.sr));
  console.log('  errors: ' + (errs.length ? errs[0] : 'none'));
  await b.close();
})();
