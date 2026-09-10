/* QA: THE OWNER'S OWN HAND. Replays qa-fixtures/hand-calibration-2026-09-09.json
   through the recogniser and asserts that the gestures in it are recognised.

   This is the test that did not exist, and its absence is the whole story of
   this feature. Every threshold that gates a gesture was derived from
   hand-reference-landmarks.json, a clip of a hand being tracked which holds
   no deliberate tap, no brush and no named open or close. So the click was
   calibrated from a touchscreen convention and the swipe from a speed nobody
   had performed, the suite proved that ordinary motion does not trigger them,
   and both shipped unusable. Twice. What was missing was never a better
   threshold, it was a recording of the gestures themselves, labelled.

   The calibration clip is that recording, made with hand/record.html: eight
   takes, each one started by hand and labelled in the file, at the 23 fps the
   camera actually runs at. Every number asserted below was measured off it,
   and the old reference clip is replayed too, as the other half of the same
   question: the gestures must fire in the clip that contains them, and must
   not fire in the clip of ordinary use that does not.

   Usage: node qa-hand-calibration.js */

'use strict';
const fs = require('fs');
const path = require('path');

const FIX = path.join(__dirname, 'qa-fixtures');

function replay(reader, clip) {
  const out = { byTake: {}, total: {} };
  for (const f of clip.frames) {
    const frame = { hands: (f.hands || []).map(h => ({ handedness: h.h, landmarks: h.p.map(([x, y]) => ({ x, y })) })) };
    const take = f.s === undefined ? -1 : f.s;
    const b = out.byTake[take] || (out.byTake[take] = { ev: {}, open: 0, pinch: 0, rest: 0, aperture: [] });
    for (const e of reader.read(frame, f.t)) {
      if (e.type === 'pose') {
        if (e.posture === 'open') { b.open++; if (e.aperture !== null) b.aperture.push(e.aperture); }
        else if (e.posture === 'pinch') b.pinch++;
        else b.rest++;
        continue;
      }
      if (e.type === 'fan') continue;
      b.ev[e.type] = (b.ev[e.type] || 0) + 1;
      out.total[e.type] = (out.total[e.type] || 0) + 1;
      if (e.type === 'click' || e.type === 'noclick') {
        (b.travels || (b.travels = [])).push({ type: e.type, heldMs: e.heldMs, travel: e.travel });
      }
    }
  }
  return out;
}

const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : NaN; };

(async () => {
  const { makeGestureReader } = await import('./hand/gestures.js');
  const fails = [];

  /* ---- the calibration clip: the gestures must be recognised ---- */
  const clip = JSON.parse(fs.readFileSync(path.join(FIX, 'hand-calibration-2026-09-09.json'), 'utf8'));
  if (clip.fast) fails.push('the calibration fixture was recorded in fast mode and calibrates nothing');
  const byId = {};
  for (const st of clip.steps) byId[st.id] = st.i;
  const r = replay(makeGestureReader(), clip);
  const take = (id) => r.byTake[byId[id]] || { ev: {}, open: 0, pinch: 0, rest: 0, aperture: [] };
  const ev = (id, type) => take(id).ev[type] || 0;

  /* the frame rate is a property of the recording and every threshold with a
     time in it depends on it, so it is asserted rather than assumed */
  const rates = clip.steps.map(s => s.frames / (s.to - s.from));
  const fps = median(rates);
  if (!(fps > 20 && fps < 27)) fails.push(`the clip runs at ${fps.toFixed(1)} fps; the thresholds with a time in them were derived at 23`);

  /* THE TAP. He performed five. Under the band that shipped, the hand between
     two taps never crossed the release threshold, so five taps came out as
     two pinch episodes, the second 3.1 seconds long. */
  if (ev('tap', 'click') !== 5) fails.push(`the five deliberate taps produced ${ev('tap', 'click')} clicks, wanted exactly 5`);
  if (ev('tap', 'grab') !== 5) fails.push(`the five deliberate taps produced ${ev('tap', 'grab')} grabs, wanted exactly 5`);
  if (ev('tap', 'noclick')) fails.push(`a deliberate tap was refused as a click ${ev('tap', 'noclick')} time(s)`);
  const taps = (take('tap').travels || []).filter(t => t.type === 'click');
  const heldMax = Math.max(...taps.map(t => t.heldMs));
  if (!(heldMax > 400)) fails.push(`the longest tap held ${Math.round(heldMax)}ms, so this clip no longer covers the 400ms cap that refused them`);

  /* THE DRAG, which is what a tap has to be told apart from: it travels a
     whole hand width, and it must never read as a click. */
  if (ev('drag', 'click')) fails.push(`a drag fired ${ev('drag', 'click')} click(s)`);
  if (ev('drag', 'grab') !== 2) fails.push(`the two drags produced ${ev('drag', 'grab')} grabs, wanted 2`);
  const drags = (take('drag').travels || []);
  if (!(Math.min(...drags.map(t => t.travel)) > 0.9)) fails.push('a drag travelled less than 0.9 hand widths, so this clip no longer separates a tap from a drag');

  /* THE FINGERS CLOSED TOGETHER. Closing the hand brings the thumb in with
     it, so this gesture reads inside the pinch band on thumb-to-index alone,
     and the world used to grab the chart and suppress the zoom for more than
     half of it. It must arm nothing, and it must stay OPEN so zoom can read
     its aperture. */
  if (ev('together', 'grab')) fails.push(`closing the fingers armed ${ev('together', 'grab')} grab(s); it is not a pinch`);
  if (take('together').pinch) fails.push(`${take('together').pinch} frames of the closing hand read as pinched, so the zoom is blind to them`);
  if (take('together').open < 120) fails.push(`only ${take('together').open} frames of the closing hand read as open, wanted nearly all 139`);

  /* THE APERTURE ZOOM READS has to move in one direction across the three
     hand shapes, or opening and closing cannot mean in and out. */
  const apOf = (id) => median(take(id).aperture);
  if (!(apOf('together') < apOf('neutral') && apOf('neutral') < apOf('spread'))) {
    fails.push(`the aperture does not increase from closed to neutral to spread: ${apOf('together').toFixed(2)} / ${apOf('neutral').toFixed(2)} / ${apOf('spread').toFixed(2)}`);
  }
  if (!(apOf('spread') - apOf('together') > 0.5)) fails.push(`only ${(apOf('spread') - apOf('together')).toFixed(2)} of aperture separates his closed hand from his spread one`);

  /* THE BRUSH. Three of his five clear the bar, which is what "it works"
     means for a gesture performed at speed; zero is what shipped. */
  if (ev('brush', 'dismiss') < 2) fails.push(`his five brushes produced ${ev('brush', 'dismiss')} dismisses, wanted at least 2`);

  /* THE NEUTRAL HAND, held still, must do nothing at all: no grab, no
     dismiss, no click. This is the false-positive floor. */
  for (const type of ['grab', 'click', 'dismiss', 'lock']) {
    if (ev('neutral', type)) fails.push(`a hand held still fired ${ev('neutral', type)} ${type}(s)`);
  }
  if (ev('spread', 'grab') || ev('spread', 'dismiss')) fails.push('spreading the fingers fired a grab or a dismiss');

  /* THE FIST is still detected, and THE HAND LEAVING still trips the dead
     man's switch. */
  if (!ev('fist', 'lock')) fails.push('a fist was not detected');
  if (!ev('gone', 'absent')) fails.push('the hand leaving the frame did not trip the dead man\'s switch');
  if (!ev('gone', 'present')) fails.push('the hand coming back was not announced');

  /* ---- and the reference clip: ordinary use must trigger nothing ---- */
  const ref = JSON.parse(fs.readFileSync(path.join(FIX, 'hand-reference-landmarks.json'), 'utf8'));
  const r2 = replay(makeGestureReader(), ref);
  if (r2.total.dismiss) fails.push(`${r2.total.dismiss} dismisses fired across ${ref.frames.length} frames of ordinary use`);
  /* one click, and it is his hand closing into a fist and opening again: the
     stated cost of letting a closed hand pinch, since his fist and his pinch
     are the same picture in two dimensions. More than one means something
     else has slipped. */
  if (r2.total.click > 1) fails.push(`${r2.total.click} clicks fired across ${ref.frames.length} frames of ordinary use, wanted at most the one closed hand opening`);

  console.log(`  the calibration clip: ${clip.frames.length} frames, ${fps.toFixed(1)} fps, ${clip.steps.length} takes`);
  for (const st of clip.steps) {
    const b = r.byTake[st.i] || { ev: {} };
    const list = Object.entries(b.ev).map(([k, v]) => `${k} ${v}`).join('  ') || 'nothing';
    console.log(`    ${st.id.padEnd(9)} ${list}`);
  }
  console.log(`  aperture, closed to neutral to spread: ${apOf('together').toFixed(2)} / ${apOf('neutral').toFixed(2)} / ${apOf('spread').toFixed(2)}`);
  console.log(`  his taps: ${taps.map(t => `${Math.round(t.heldMs)}ms/${t.travel.toFixed(3)}`).join('  ')}`);
  console.log(`  the reference clip, ${ref.frames.length} frames of ordinary use: ${Object.entries(r2.total).map(([k, v]) => `${k} ${v}`).join('  ')}`);
  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
