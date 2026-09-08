/* QA: the One Euro filter against real hand data. The fixture is 2061 frames
   at 30 Hz from a real HandLandmarker run. We test two things:
   1. Tremor suppression in the longest still stretch (208 frames, 6.9 seconds)
   2. Lag during the fastest motion in the trace (peak speed 3.91 units/s)

   These are the only things that matter: steady hands stay steady, fast hands
   don't lag. The thresholds are chosen from what real data shows a well-tuned
   filter achieving, not from synthetic test values. */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'serve.js')]);
  const port = await new Promise((res, rej) => {
    srv.stdout.on('data', d => { const m = String(d).match(/PORT=(\d+)/); if (m) res(+m[1]); });
    setTimeout(() => rej(new Error('server timeout')), 5000);
  });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });

  // Load the fixture
  const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'qa-fixtures/hand-reference-landmarks.json'), 'utf8'));

  const r = await page.evaluate(async (fixtureData) => {
    const { makeOneEuro } = await import('./hand/oneeuro.js');

    /* Extract pinch points from all frames using the same logic as gestures.js:
       between thumb tip (landmark 4) and index tip (landmark 8). */
    const frames = [];
    for (const f of fixtureData.frames) {
      if (f.hands.length === 0) continue;
      const h = f.hands[0];
      const thumb = h.p[4], index = h.p[8];
      const pinch = {
        t: f.t,
        x: (thumb[0] + index[0]) / 2,
        y: (thumb[1] + index[1]) / 2,
      };
      frames.push(pinch);
    }

    /* Find the longest still stretch: where pinch-point speed is consistently low.
       Scan for spans where all speeds are under 0.05 units/s (p50 from the trace). */
    let maxStillStart = -1, maxStillLen = 0;
    for (let i = 0; i < frames.length - 1; i++) {
      let len = 1;
      for (let j = i + 1; j < frames.length; j++) {
        const dt = frames[j].t - frames[j - 1].t;
        if (dt < 1e-6) continue; // skip if same timestamp
        const dx = frames[j].x - frames[j - 1].x;
        const dy = frames[j].y - frames[j - 1].y;
        const speed = Math.sqrt(dx * dx + dy * dy) / dt;
        if (speed > 0.05) break;
        len++;
      }
      if (len > maxStillLen) { maxStillStart = i; maxStillLen = len; }
    }

    /* Measure tremor inside the still stretch as RMS deviation from a trend.
       Real tremor rms is 0.0054, peak 0.0173. Compute RMS of residuals around
       a slowly-moving average to measure oscillation, then compare filtered vs
       unfiltered. The filter should reduce tremor by a factor of 10+. */
    let tremorKept = null;
    if (maxStillLen > 10) {
      const still = makeOneEuro({});
      const rawPoints = [], filteredPoints = [];
      for (let i = maxStillStart; i < maxStillStart + maxStillLen; i++) {
        const f = still.filter(frames[i].x, frames[i].t);
        rawPoints.push(frames[i].x);
        filteredPoints.push(f);
      }
      // Compute RMS relative to a centered moving average (window=10 frames)
      const computeRMS = (pts) => {
        let sumSq = 0, count = 0;
        const w = 5; // half-window
        for (let i = w; i < pts.length - w; i++) {
          let avg = 0;
          for (let j = i - w; j <= i + w; j++) avg += pts[j];
          avg /= (2 * w + 1);
          const residual = pts[i] - avg;
          sumSq += residual * residual;
          count++;
        }
        return count > 0 ? Math.sqrt(sumSq / count) : 0;
      };
      const noisyRMS = computeRMS(rawPoints);
      const smoothRMS = computeRMS(filteredPoints);
      tremorKept = noisyRMS > 1e-8 ? smoothRMS / noisyRMS : 0;
    }

    /* Measure lag during the fastest motion, not after. The old metric measured
       59 frames (2 seconds) after peak speed, so the filter had settled and
       reported zero lag for all values. This breaks detection of minCutoff cost.
       New approach: (1) find peak speed window, (2) warm filter on 20 preceding
       frames, (3) measure absolute error during the fast window (not endpoint),
       (4) report max and mean error, which reveals cutoff effects at scale. */
    let maxSpeed = 0, maxSpeedIdx = 0;
    for (let i = 0; i < frames.length - 1; i++) {
      const dt = frames[i + 1].t - frames[i].t;
      if (dt < 1e-6) continue;
      const dx = frames[i + 1].x - frames[i].x;
      const dy = frames[i + 1].y - frames[i].y;
      const speed = Math.sqrt(dx * dx + dy * dy) / dt;
      if (speed > maxSpeed) { maxSpeed = speed; maxSpeedIdx = i; }
    }

    let lagMeanError = 0, lagMaxError = 0;
    if (maxSpeedIdx >= 20 && maxSpeedIdx + 10 < frames.length) {
      const fast = makeOneEuro({});
      // Warm filter on preceding frames so first-call passthrough is not part of measurement
      const warmStart = Math.max(0, maxSpeedIdx - 20);
      for (let i = warmStart; i < maxSpeedIdx; i++) {
        fast.filter(frames[i].x, frames[i].t);
      }
      // Measure error during fast window (up to 15 frames or end of data)
      const windowEnd = Math.min(maxSpeedIdx + 15, frames.length);
      let sumError = 0, maxErr = 0, count = 0;
      for (let i = maxSpeedIdx; i < windowEnd; i++) {
        const filtered = fast.filter(frames[i].x, frames[i].t);
        const error = Math.abs(filtered - frames[i].x);
        sumError += error;
        if (error > maxErr) maxErr = error;
        count++;
      }
      lagMaxError = maxErr;
      lagMeanError = count > 0 ? sumError / count : 0;
    }

    return { tremorKept, lagMeanError, lagMaxError, maxSpeed, stillLen: maxStillLen, still: maxStillStart };
  }, fixture);

  const fails = [];
  /* Tremor suppression: the filter should reduce tremor to under 10% of input.
     Real rms is 0.0054; after filtering, peak variations in a steady hand should
     stay under 0.0006 units. Testing against tremor ratio (smooth/noisy) < 0.10. */
  if (!(r.tremorKept < 0.10)) fails.push(`tremor kept ${(r.tremorKept * 100).toFixed(1)}%, wanted under 10%`);
  /* Lag during fast motion: measured as absolute error between filtered and raw
     values DURING the fast window (not after it settles). Reports max and mean
     error across the 15-frame peak speed window. Error in pinch-ratio units. */
  if (!(r.lagMaxError < 0.30)) fails.push(`max lag error ${r.lagMaxError.toFixed(4)}, wanted under 0.30`);
  console.log(`  tremor kept ${(r.tremorKept * 100).toFixed(1)}%   lag max ${r.lagMaxError.toFixed(4)}   lag mean ${r.lagMeanError.toFixed(4)}   peak speed ${r.maxSpeed.toFixed(2)} u/s`);
  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  await browser.close(); srv.kill();
  process.exit(fails.length ? 1 : 0);
})();
