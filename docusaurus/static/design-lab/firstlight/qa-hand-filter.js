/* QA: the One Euro filter against real hand data. The fixture is 2061 frames
   at 30 Hz from a real HandLandmarker run. We test two things:
   1. Tremor suppression in the longest still stretch.
   2. Lag during the fastest motion the trace lets us actually measure. The
      single fastest frame-to-frame jump in the whole clip (3.91 units/s) is
      the hand leaving the frame at the very end of the recording: it has only
      one or two follow-up samples before tracking is lost, so no window can
      be scored against it. The fastest motion with a full follow-through
      window is slower (1.20 units/s) but real, mid-clip, and measurable.

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

    /* Measure lag during the fastest motion we can actually score, not after
       it settles and not at a peak with nothing following it. WARMUP frames
       must exist before the candidate so the filter is not measured cold, and
       WINDOW frames must exist after it so a full window can be scored: this
       is why the search excludes the last WINDOW frames rather than taking the
       global fastest frame-to-frame jump, which (in this fixture) is the hand
       leaving the frame in the recording's last couple of samples -- a real
       jump, but one with no follow-through to measure a lag against. Searching
       only measurable candidates finds the fastest motion that IS measurable,
       instead of finding an unmeasurable one and silently reporting zero. */
    const WARMUP = 20, WINDOW = 15;
    let maxSpeed = 0, maxSpeedIdx = -1;
    for (let i = WARMUP; i + WINDOW < frames.length; i++) {
      const dt = frames[i + 1].t - frames[i].t;
      if (dt < 1e-6) continue;
      const dx = frames[i + 1].x - frames[i].x;
      const dy = frames[i + 1].y - frames[i].y;
      const speed = Math.sqrt(dx * dx + dy * dy) / dt;
      if (speed > maxSpeed) { maxSpeed = speed; maxSpeedIdx = i; }
    }

    let lagMeanError = 0, lagMaxError = 0;
    if (maxSpeedIdx >= 0) {
      const fast = makeOneEuro({});
      // Warm filter on preceding frames so first-call passthrough is not part of measurement
      const warmStart = Math.max(0, maxSpeedIdx - WARMUP);
      for (let i = warmStart; i < maxSpeedIdx; i++) {
        fast.filter(frames[i].x, frames[i].t);
      }
      // Measure error across the full WINDOW frames of the fast motion
      const windowEnd = Math.min(maxSpeedIdx + WINDOW, frames.length);
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
     error across the 15-frame peak speed window. Error in pinch-ratio units.
     Sweeping minCutoff 0.02/0.05/0.10/0.14/0.16/0.25/0.5/1.0 against this same
     window gives a max error of 0.0739 down to 0.0528: lag is real (it moves
     monotonically with minCutoff) but small throughout. 0.30 under-used that
     range by 4x and would not have caught a badly broken filter; 0.15, twice
     the worst value the sweep actually produced, still passes every value in
     it while catching a filter that is actually lagging badly. */
  if (!(r.lagMaxError < 0.15)) fails.push(`max lag error ${r.lagMaxError.toFixed(4)}, wanted under 0.15`);
  console.log(`  tremor kept ${(r.tremorKept * 100).toFixed(1)}%   lag max ${r.lagMaxError.toFixed(4)}   lag mean ${r.lagMeanError.toFixed(4)}   peak speed ${r.maxSpeed.toFixed(2)} u/s`);
  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  await browser.close(); srv.kill();
  process.exit(fails.length ? 1 : 0);
})();
