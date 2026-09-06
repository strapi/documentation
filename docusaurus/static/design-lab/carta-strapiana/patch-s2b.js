/* STAGE 2, tranche B: weather at sea (ideas 2+3+4). Exact-string surgery. */
'use strict';
const fs = require('fs');
const path = require('path');
const F = path.join(__dirname, 'deadreckoning.js');
let src = fs.readFileSync(F, 'utf8');
let n = 0;
function rep(oldS, newS, tag) {
  const i = src.indexOf(oldS);
  if (i < 0) throw new Error('NOT FOUND [' + tag + ']');
  if (src.indexOf(oldS, i + 1) >= 0) throw new Error('NOT UNIQUE [' + tag + ']');
  src = src.slice(0, i) + newS + src.slice(i + oldS.length);
  n++;
}

/* 1. the module, before the boot IIFE (after the fog module) */
const mod = fs.readFileSync(path.join(__dirname, 's2src', 'weather.inc.js'), 'utf8');
rep('(async function boot() {', mod + '\n(async function boot() {', 'module-insert');

/* 2. the clock ticks with the sim, on deck only */
rep(`  eggTick(dt);

  diag.bearing`,
`  eggTick(dt);
  wxTick(dt);

  diag.bearing`, 'update-tick');

/* 3. squall country: the helm goes heavy, bounded so she always answers */
rep(`    const err = angDiff(eff, ship.bearing);
    const speedFrac = clamp(ship.knots / 8.6, 0.12, 1);
    let alpha = clamp(err * 0.55, -6.5, 6.5) - ship.omega * 1.15;
    ship.omega += alpha * dt;
    const om = (2.6 + 7.2 * speedFrac);`,
`    const err = angDiff(eff, ship.bearing);
    const speedFrac = clamp(ship.knots / 8.6, 0.12, 1);
    /* storm waters (stage 2, idea 3): the helm goes heavy with the sea the
       citations raise - bounded at a quarter, she always answers */
    const heavy = 1 - 0.24 * wx.helm;
    let alpha = (clamp(err * 0.55, -6.5, 6.5) - ship.omega * 1.15) * heavy;
    ship.omega += alpha * dt;
    const om = (2.6 + 7.2 * speedFrac) * (1 - 0.14 * wx.helm);`, 'heavy-helm');

/* 4. the swell rises with the sea state, bounded */
rep(`  const swell = REDUCED ? 0 : 1;`,
`  const swell = (REDUCED ? 0 : 1) * (1 + 0.35 * wx.seaVis);`, 'swell');

/* 5. the sea roughens: more foam breaks */
rep(`        if (foamRnd() < 0.05 + knotsFrac * 0.6) respawnFoam(p, knotsFrac);`,
`        if (foamRnd() < 0.05 + knotsFrac * 0.6 + 0.22 * wx.seaVis) respawnFoam(p, knotsFrac);`, 'foam');

/* 6. spray flies in the squall: the streaks bear harder */
rep(`      ctx.globalAlpha = a * (0.78 + 0.22 * knotsFrac);`,
`      ctx.globalAlpha = a * (0.78 + 0.22 * knotsFrac) * (1 + 0.45 * wx.squall);`, 'streaks');

/* 7. the tending on the water, before the wind streaks */
rep(`  /* wind streaks */`,
`  drawWeather(sim, worldDY);

  /* wind streaks */`, 'drawweather');

/* 8. the front itself, in front of the deck, behind the glass */
rep(`  /* spyglass */
  if (lens.t > 0.003) drawLens(sim, worldDY);`,
`  /* the passing front: wash, rain, the rare fork */
  drawRainFront(sim);

  /* spyglass */
  if (lens.t > 0.003) drawLens(sim, worldDY);`, 'drawrain');

/* 9. the rain layer and the thunder obey every gain law: through the mix */
rep(`  sound.tune(sim.wind.kn, sim.knotsFrac);`,
`  sound.tune(sim.wind.kn, sim.knotsFrac);
  if (sound.wxTune) sound.wxTune(wx.rain, wx.squall);`, 'sound-hook');

/* 10. the storm-glass panel takes its seat among the furniture */
rep(`const SCAL = { x: 500, y: 740, w: 336, h: 54 };`,
`const SCAL = { x: 500, y: 740, w: 336, h: 54 };
const STGL = { x: 500, y: 656, w: 336, h: 74 };          // the storm-glass (stage 2)`, 'stgl-const');
rep(`const FURN = [CART, KEYB, DIRS, SCAL,`,
`const FURN = [CART, KEYB, DIRS, SCAL, STGL,`, 'stgl-furn');
rep(`  drawScaleBar(g, SCAL);
}`,
`  drawScaleBar(g, SCAL);
  drawStormGlass(g, STGL);
}`, 'stgl-paint');

/* 11. the key grows two standing rules; the panel makes room */
rep(`const KEYB = { x: 1002, y: 576, w: 366, h: 202 };        // the legend`,
`const KEYB = { x: 1002, y: 496, w: 366, h: 282 };        // the legend`, 'keyb-grow');
rep(`      t + '</div>';
  });
  return h;
}`,
`      t + '</div>';
  });
  /* the standing rules of the weather, printed small under the glyph rows */
  const rules = [
    'the weather is the corpus twelvemonth replayed, a month a minute: rain where the ink fell thick, squalls where it fell thickest',
    'the sea remembers the tending: grey mist rides waters long untended; fresh ink sparkles on the swell'
  ];
  rules.forEach((t, j) => {
    const top = (KEY_ROW_Y - 12 + 7 * KEY_ROW_H + 6 + j * 30) * S;
    h += '<div class="ck-rule" style="top:' + top.toFixed(1) + 'px">' + t + '</div>';
  });
  return h;
}`, 'key-rules');

/* 12. the glass answers the hover, and the anchorage it will read for */
rep(`function fillChartTip(m) {
  const tip = $('charttip');
  if (!tip) return;`,
`function fillChartTip(m) {
  const tip = $('charttip');
  if (!tip) return;
  updateStormGlass();`, 'glass-hover');
rep(`  cv.addEventListener('mouseleave', () => { chart.hover = null; chart.hoverMark = null; hideChartTip(); });`,
`  cv.addEventListener('mouseleave', () => { chart.hover = null; chart.hoverMark = null; hideChartTip(); updateStormGlass(); });`, 'glass-leave');

/* 13. the glass DOM pinned like the other instruments */
rep(`  const ck = $('chartkey');`,
`  const sg = $('stormglass');
  if (sg) {
    sg.style.left = (dx + (STGL.x + 50) * S).toFixed(1) + 'px';
    sg.style.top = (dy + (STGL.y + 9) * S).toFixed(1) + 'px';
    sg.style.width = ((STGL.w - 62) * S).toFixed(1) + 'px';
    sg.style.fontSize = (10.5 * S).toFixed(2) + 'px';
    updateStormGlass();
  }
  const ck = $('chartkey');`, 'glass-pin');

/* 14. the calendar raised at boot */
rep(`  initEggs();
`,
`  initEggs();
  wxInit();
`, 'boot-init');

/* 15. the verifier's hooks */
rep(`  fogMode(m) { fogSetMode(m, false); return fogDiag(); },`,
`  fogMode(m) { fogSetMode(m, false); return fogDiag(); },
  wx() { return diag.wx; },
  wxForce(ix) { wx.forceIx = ix; return wx.months[ix == null ? 0 : ix]; },
  wxBolt() { wx.thunderDone = false; wxBolt('probe'); return true; },`, 'hooks');

/* 16. the rain and the thunder, through the mix and every law over it */
rep(`  /* the wind bed follows the real wind and the sail actually set */`,
`  /* the rain layer (stage 2): a soft high wash through the same mix, so the
     duck and the master rule it like everything else */
  wxTune(rain, squall) {
    if (!this.ctx || !this.bed) return;
    const c = this.ctx, t = c.currentTime;
    if (!this.wxRain) {
      const len = Math.floor(c.sampleRate * 2);
      const nb = c.createBuffer(1, len, c.sampleRate);
      const d = nb.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src2 = c.createBufferSource();
      src2.buffer = nb; src2.loop = true;
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 2900; bp.Q.value = 0.55;
      const gn = c.createGain(); gn.gain.value = 0;
      src2.connect(bp); bp.connect(gn); gn.connect(this.mix);
      src2.start();
      this.wxRain = { gn, bp, noise: nb };
    }
    this.wxRain.gn.gain.setTargetAtTime(0.026 * rain + 0.012 * squall, t, 1.4);
  },
  /* one rolled thunder, softer than any voice, decaying long */
  thunder() {
    if (!this.ctx || !this.on || !this.wxRain) return;
    const c = this.ctx, t = c.currentTime;
    const src2 = c.createBufferSource();
    src2.buffer = this.wxRain.noise; src2.loop = true; src2.playbackRate.value = 0.22;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 130; lp.Q.value = 0.4;
    const gn = c.createGain();
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.exponentialRampToValueAtTime(0.20, t + 0.18);
    gn.gain.exponentialRampToValueAtTime(0.10, t + 1.1);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
    src2.connect(lp); lp.connect(gn); gn.connect(this.mix);
    src2.start(t); src2.stop(t + 3.4);
    diag.thunderPlayed = (diag.thunderPlayed || 0) + 1;
  },

  /* the wind bed follows the real wind and the sail actually set */`, 'sound-wx');

fs.writeFileSync(F, src);
console.log('patched', n, 'sites; new size', src.length);
