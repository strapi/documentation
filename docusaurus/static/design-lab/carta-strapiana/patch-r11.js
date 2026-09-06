/* WAVE10 R2 - fix the ten verifier findings */
const fs = require('fs');
const F = 'deadreckoning.js';
let src = fs.readFileSync(F, 'utf8');
let n = 0;
function rep(a, b, tag) {
  if (!src.includes(a)) { console.error('MISS [' + tag + ']'); process.exitCode = 2; return; }
  if (src.split(a).length > 2) { console.error('DUPE [' + tag + ']'); process.exitCode = 2; return; }
  src = src.replace(a, b); n++;
}

/* ---- ISSUE 1: the owner's mix rebalance - wind layer to 30% of original ---- */
rep("const windG = c.createGain(); windG.gain.value = 0.16;",
    "/* OWNER MIX LAW (revised twice, final): the wind is a continuous sound,\n" +
    "       so the whole wind layer sits at THIRTY PERCENT of its original gain -\n" +
    "       first halved, then cut another 40 percent. 0.16 * 0.30 = 0.048. */\n" +
    "    const windG = c.createGain(); windG.gain.value = 0.048;", 'windG-init');

rep("this.bed.windG.gain.setTargetAtTime(0.09 + 0.14 * clamp(windKn / 24, 0, 1) + 0.05 * knotsFrac, t, 0.6);",
    "/* the tune keeps its shape but the whole wind layer carries the owner's\n" +
    "       30% trim - the chants are what one should hear, the wind stays low */\n" +
    "    this.bed.windG.gain.setTargetAtTime(0.30 * (0.09 + 0.14 * clamp(windKn / 24, 0, 1) + 0.05 * knotsFrac), t, 0.6);", 'windG-tune');

/* ---- ISSUE 2: voices rise the full 20% from the pre-wave levels (0.34/0.22) ---- */
rep("const level = pick.gain * (s === 0 ? 0.40 : 0.24) * (0.90 + Math.random() * 0.20);",
    "/* owner order: sung voices +20% over the old levels (0.34 lead, 0.22\n" +
    "       watch), capped well below clipping by the master at 0.85 */\n" +
    "    const level = pick.gain * (s === 0 ? 0.408 : 0.264) * (0.90 + Math.random() * 0.20);", 'voice-level');

/* ---- ISSUES 4+5: the picker never relaxes law two; no phrase re-starts
       within 20 s anywhere; one start per bar globally (kills the 0.7 s double) ---- */
rep(`  pickPhrase(pools) {
    const now = this.ctx.currentTime;
    let cand = this.bank.filter(b => pools.indexOf(b.role) >= 0);
    if (!cand.length) cand = this.bank.slice();
    /* law one: never the same phrase twice in a row, anywhere in the programme */
    let ok = cand.filter(b => b.name !== this.lastId);
    /* law two: no phrase-to-phrase sequence heard again within ten minutes */
    if (this.lastId) ok = ok.filter(b => {
      const t = this.gram.get(this.lastId + '>' + b.name);
      return t === undefined || now - t > 600;
    });
    if (!ok.length) {
      ok = cand.filter(b => b.name !== this.lastId);
      if (!ok.length) return null;
    }
    /* among the lawful, lean to the least recently heard */
    ok.sort((a, b) => (this.lastPlay.get(a.name) || 0) - (this.lastPlay.get(b.name) || 0));
    const w = ok.slice(0, Math.max(1, Math.min(3, ok.length)));
    return w[Math.floor(Math.random() * w.length)];
  },`,
`  pickPhrase(pools) {
    const now = this.ctx.currentTime;
    /* the three picking laws, applied to any candidate list:
       one - never the same phrase twice in a row, anywhere in the programme;
       one-and-a-half - no phrase STARTS again within 20 s of its own last
       start, on any slot (the audible-double law: two slots may never take
       up the same phrase moments apart);
       two - no phrase-to-phrase sequence heard again within ten minutes. */
    const lawful = list => list.filter(b =>
      b.name !== this.lastId &&
      now - (this.lastPlay.get(b.name) || -1e9) > 20 &&
      (!this.lastId || (t => t === undefined || now - t > 600)(this.gram.get(this.lastId + '>' + b.name))));
    let ok = lawful(this.bank.filter(b => pools.indexOf(b.role) >= 0));
    /* when a role's pool has no lawful successor the WHOLE bank is asked
       before anyone opens their mouth - and when the whole bank is unlawful
       the bar stays SILENT and the bed carries it. The law never relaxes. */
    if (!ok.length) ok = lawful(this.bank);
    if (!ok.length) { diag.lawSilences = (diag.lawSilences || 0) + 1; return null; }
    /* among the lawful, lean to the least recently heard */
    ok.sort((a, b) => (this.lastPlay.get(a.name) || 0) - (this.lastPlay.get(b.name) || 0));
    const w = ok.slice(0, Math.max(1, Math.min(3, ok.length)));
    return w[Math.floor(Math.random() * w.length)];
  },`, 'pickPhrase');

rep(`  sing(s, now) {
    const lead = s === 0;`,
`  sing(s, now) {
    /* one start per bar, ship-wide: with seventeen phrases the ten-minute
       law affords at most ~272 pairs in the window; a floor of 1.9 s between
       any two starts keeps the walk well inside that budget and no two
       phrases can ever begin an audible-double apart */
    if (now - this.lastStart < 1.9) {
      this.slotNext[s] = this.lastStart + 1.9 + Math.random() * 0.7;
      return;
    }
    const lead = s === 0;`, 'sing-gate');

rep("  lastId: null, lastPlay: null, gram: null, trig: [],",
    "  lastId: null, lastPlay: null, gram: null, trig: [], lastStart: -1e9,", 'lastStart-decl');

rep(`    if (this.lastId) this.gram.set(this.lastId + '>' + pick.name, now);
    this.lastId = pick.name;
    this.lastPlay.set(pick.name, now);`,
`    if (this.lastId) this.gram.set(this.lastId + '>' + pick.name, now);
    this.lastId = pick.name;
    this.lastPlay.set(pick.name, now);
    this.lastStart = now;`, 'lastStart-set');

rep("    this.holdUntil = now + dur + 2.5;      /* the crew stands silent for the verse */",
    "    this.holdUntil = now + dur + 2.5;      /* the crew stands silent for the verse */\n" +
    "    this.lastStart = now;", 'featured-lastStart');

/* ---- ISSUES 7+8: ONE NORTH. The sheet draws -y as north (rose, sailing
   directions, rumors); every bearing spoken, logged or steered now uses the
   same north, and the ship's motion answers to it, so the plate, the log's
   Courses, the captions and the drawn track all agree with the sheet. The
   world-space trajectories are untouched: this is the compass being nailed
   to the chart, not the sea being moved. ---- */
rep("  const brg = norm360(Math.atan2(target.pos.x - ship.x, target.pos.y - ship.y) * 180 / Math.PI);",
    "  const brg = norm360(Math.atan2(target.pos.x - ship.x, -(target.pos.y - ship.y)) * 180 / Math.PI);", 'brg-place');
rep("  return norm360(Math.atan2(isle.pos.x - ship.x, isle.pos.y - ship.y) * 180 / Math.PI);",
    "  /* the sheet's own north: -y, the same the rose and the rumors swear by */\n" +
    "  return norm360(Math.atan2(isle.pos.x - ship.x, -(isle.pos.y - ship.y)) * 180 / Math.PI);", 'brg-bearingTo');
rep("    const az = angDiff(norm360(Math.atan2(dx, dy) * 180 / Math.PI), hb);",
    "    const az = angDiff(norm360(Math.atan2(dx, -dy) * 180 / Math.PI), hb);", 'brg-pickvis');
rep("  const deg = norm360(Math.atan2(w.x, w.y) * 180 / Math.PI);",
    "  const deg = norm360(Math.atan2(w.x, -w.y) * 180 / Math.PI);", 'brg-wind');
rep("  const hx = Math.sin(hb), hy = Math.cos(hb);",
    "  const hx = Math.sin(hb), hy = -Math.cos(hb);   /* north is -y, as the sheet draws it */", 'motion-h');
rep(`    const wind = sim.wind;
    const hb = ship.bearing * Math.PI / 180;
    const rx = Math.cos(hb), ry = -Math.sin(hb);
    const wm = Math.hypot(wind.x, wind.y) || 1;
    const lat = (wind.x * rx + wind.y * ry) / wm;
    const along = sim.cosA;`,
`    const wind = sim.wind;
    const hb = ship.bearing * Math.PI / 180;
    const rx = Math.cos(hb), ry = Math.sin(hb);   /* starboard, under the sheet's north */
    const wm = Math.hypot(wind.x, wind.y) || 1;
    const lat = (wind.x * rx + wind.y * ry) / wm;
    const along = sim.cosA;`, 'streaks-r');
rep(`  const wind = sim.wind;
  const hb = ship.bearing * Math.PI / 180;
  const rx = Math.cos(hb), ry = -Math.sin(hb);
  const wm = Math.hypot(wind.x, wind.y) || 1;
  const lat = (wind.x * rx + wind.y * ry) / wm;
  const px = 782, py = 128;`,
`  const wind = sim.wind;
  const hb = ship.bearing * Math.PI / 180;
  const rx = Math.cos(hb), ry = Math.sin(hb);   /* starboard, under the sheet's north */
  const wm = Math.hypot(wind.x, wind.y) || 1;
  const lat = (wind.x * rx + wind.y * ry) / wm;
  const px = 782, py = 128;`, 'pennant-r');
rep("  const cosA = (Math.sin(hb) * wind.x + Math.cos(hb) * wind.y) / (Math.hypot(wind.x, wind.y) || 1);",
    "  const cosA = (Math.sin(hb) * wind.x - Math.cos(hb) * wind.y) / (Math.hypot(wind.x, wind.y) || 1);", 'log-cosA');
rep("  const brg = norm360(Math.atan2(passage.bx - ship.x, passage.by - ship.y) * 180 / Math.PI);",
    "  const brg = norm360(Math.atan2(passage.bx - ship.x, -(passage.by - ship.y)) * 180 / Math.PI);", 'brg-passage');
rep(`  return norm360(Math.atan2(E.x - ship.x, E.y - ship.y) * 180 / Math.PI);
}`,
`  return norm360(Math.atan2(E.x - ship.x, -(E.y - ship.y)) * 180 / Math.PI);
}`, 'brg-egg');
rep("  const az = angDiff(norm360(Math.atan2(dx, dy) * 180 / Math.PI), ship.bearing);",
    "  const az = angDiff(norm360(Math.atan2(dx, -dy) * 180 / Math.PI), ship.bearing);", 'brg-eggscreen');
rep("  const az = angDiff(norm360(Math.atan2(dxu, dyu) * 180 / Math.PI), ship.bearing);",
    "  const az = angDiff(norm360(Math.atan2(dxu, -dyu) * 180 / Math.PI), ship.bearing);", 'brg-city');
rep(`  const brg = norm360(Math.atan2(E.x - ship.x, E.y - ship.y) * 180 / Math.PI -
                      (key === 'bottle' ? 12 : 0));`,
`  const brg = norm360(Math.atan2(E.x - ship.x, -(E.y - ship.y)) * 180 / Math.PI -
                      (key === 'bottle' ? 12 : 0));`, 'brg-cross');
rep("  g.rotate(ship.bearing * Math.PI / 180);",
    "  /* the profile mark lies along her course: the bowsprit (drawn at -x)\n" +
    "     leads north when she steers north, east when east - sheet-true */\n" +
    "  g.rotate((ship.bearing + 90) * Math.PI / 180);", 'glyph-rot');

/* ---- ISSUE 9: the portal holds the focus - Tab trades YES and NO, never leaves ---- */
rep("  if (k === 'Tab') return true;      // the two buttons trade the focus natively",
    "  if (k === 'Tab') {\n" +
    "    /* the plate holds the focus: Tab (either direction) trades the two\n" +
    "       answers and never walks out of the dialog */\n" +
    "    const yes = document.getElementById('po-yes'), no = document.getElementById('po-no');\n" +
    "    if (yes && no) (document.activeElement === yes ? no : yes).focus();\n" +
    "    e.preventDefault(); return true;\n" +
    "  }", 'portal-tab');

/* ---- ISSUE 10: the scale bar speaks singular of one mile ---- */
rep("      'A scale of ' + numToWords(SG.span) + ' nautical miles, by estimation</div>');",
    "      'A scale of ' + numToWords(SG.span) + (SG.span === 1 ? ' nautical mile' : ' nautical miles') + ', by estimation</div>');", 'scale-mile');
rep("      compassPoint(brg) + '</b>, ' + numToWords(Math.max(1, Math.round(nm))) + ' miles.</li>';",
    "      compassPoint(brg) + '</b>, ' + numToWords(Math.max(1, Math.round(nm))) +\n" +
    "      (Math.max(1, Math.round(nm)) === 1 ? ' mile.</li>' : ' miles.</li>');", 'dirs-mile');

fs.writeFileSync(F, src);
console.log('patched', n, 'sites, exit', process.exitCode || 0);
