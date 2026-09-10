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

   TWO CLIPS, AND THAT IS THE POINT. The same hand, recorded a day apart, does
   not read the same: on 2026-09-10 he sat closer and every ratio in
   gestures.js slid by about a fifth, which is why a release threshold that
   looked comfortable on the first clip sat above almost everything the second
   one does, and his pinch armed and never let go. The thresholds are
   fractions of his own open hand now, kept live, and the assertion that
   matters most in this file is that ONE set of them serves BOTH days.

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

  /* ---- the first calibration clip ---- */
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
  /* AND A FIST DOES NOT CLICK, which is the line he drew: "non je ne veux pas
     ca". His fist and his pinch are the same picture by thumb-to-index and by
     index-to-wrist; what separates them is the index's own reach, and a fisted
     hand must show a held ring before it may arm at all. */
  if (ev('fist', 'click')) fails.push(`his fist take fired ${ev('fist', 'click')} click(s); a fist is the rest position`);
  if (!ev('gone', 'absent')) fails.push('the hand leaving the frame did not trip the dead man\'s switch');
  if (!ev('gone', 'present')) fails.push('the hand coming back was not announced');

  /* ---- THE SECOND CLIP, a day later and a hand held differently ---- */
  const clip2 = JSON.parse(fs.readFileSync(path.join(FIX, 'hand-calibration-2026-09-10.json'), 'utf8'));
  const byId2 = {};
  for (const st of clip2.steps) byId2[st.id] = st.i;
  const r3 = replay(makeGestureReader(), clip2);
  const t2 = (id) => r3.byTake[byId2[id]] || { ev: {}, open: 0, pinch: 0, rest: 0, aperture: [] };
  const ev2 = (id, type) => t2(id).ev[type] || 0;

  /* THE POSTURE SHIFT, asserted so the two clips are known to differ: if a
     re-recording ever made them agree, this file would stop testing the thing
     it exists for. Hand size is the distance to the camera. */
  const sizeOf = (c) => {
     const f = c.frames.find((x) => x.hands.length);
     const p = f.hands[0].p;
     return Math.hypot(p[0][0] - p[9][0], p[0][1] - p[9][1]);
  };
  if (!(sizeOf(clip2) > sizeOf(clip) * 1.1)) {
    fails.push(`the two clips no longer differ in posture (hand spans ${sizeOf(clip).toFixed(3)} and ${sizeOf(clip2).toFixed(3)}), so this file has stopped testing what it exists for`);
  }

  /* HIS NATURAL PINCH, the gesture that took three evenings: thumb and index
     with the other three fingers closed. Five of them, five clicks. */
  if (ev2('pinchnatural', 'click') !== 5) fails.push(`his five natural pinches produced ${ev2('pinchnatural', 'click')} clicks on the second clip, wanted 5`);
  /* and the same take must not be read as a fist doing nothing */
  if (!ev2('pinchnatural', 'grab')) fails.push('his natural pinch armed no grab at all on the second clip');

  /* THE TAP TAKE OF THE SECOND CLIP is the one that broke under fixed
     thresholds: 192 of its 209 frames read as still pinched, because his hand
     between taps only opens to 0.62 that day against 1.00 the day before. */
  if (ev2('tap', 'click') < 5) fails.push(`the second clip's taps produced ${ev2('tap', 'click')} clicks, wanted at least 5`);
  if (t2('tap').pinch > t2('tap').open) fails.push(`the second clip's tap take reads pinched for ${t2('tap').pinch} frames against ${t2('tap').open} open: the pinch is not releasing`);

  /* THE SCROLL, whose threshold was guessed until this clip existed */
  if (ev2('scroll', 'sweep') < 8) fails.push(`his six up-and-down movements produced ${ev2('scroll', 'sweep')} sweeps, wanted at least 8`);
  if (ev2('scroll', 'dismiss')) fails.push(`scrolling fired ${ev2('scroll', 'dismiss')} dismiss(es); a vertical sweep must never close the page`);

  /* and the same floors as the first clip */
  if (ev2('fist', 'click')) fails.push(`the second clip's fist take fired ${ev2('fist', 'click')} click(s)`);
  if (ev2('fist', 'grab')) fails.push(`the second clip's fist take armed ${ev2('fist', 'grab')} grab(s); a fist is the rest position`);
  for (const type of ['grab', 'click', 'dismiss']) {
    if (ev2('neutral', type)) fails.push(`a hand held still fired ${ev2('neutral', type)} ${type}(s) on the second clip`);
  }
  if (ev2('together', 'grab')) fails.push(`closing the fingers armed ${ev2('together', 'grab')} grab(s) on the second clip`);
  if (ev2('brush', 'dismiss') < 2) fails.push(`his brushes produced ${ev2('brush', 'dismiss')} dismisses on the second clip`);

  /* ---- and the reference clip: ordinary use must trigger nothing ---- */
  const ref = JSON.parse(fs.readFileSync(path.join(FIX, 'hand-reference-landmarks.json'), 'utf8'));
  const r2 = replay(makeGestureReader(), ref);
  if (r2.total.dismiss) fails.push(`${r2.total.dismiss} dismisses fired across ${ref.frames.length} frames of ordinary use`);
  if (r2.total.click) fails.push(`${r2.total.click} clicks fired across ${ref.frames.length} frames of ordinary use`);

  console.log(`  the calibration clip: ${clip.frames.length} frames, ${fps.toFixed(1)} fps, ${clip.steps.length} takes`);
  for (const st of clip.steps) {
    const b = r.byTake[st.i] || { ev: {} };
    const list = Object.entries(b.ev).map(([k, v]) => `${k} ${v}`).join('  ') || 'nothing';
    console.log(`    ${st.id.padEnd(9)} ${list}`);
  }
  console.log(`  aperture, closed to neutral to spread: ${apOf('together').toFixed(2)} / ${apOf('neutral').toFixed(2)} / ${apOf('spread').toFixed(2)}`);
  console.log(`  the second clip, a day later, hand ${(100 * sizeOf(clip2) / sizeOf(clip) - 100).toFixed(0)}% larger in frame: ${clip2.frames.length} frames, ${clip2.steps.length} takes`);
  for (const st of clip2.steps) {
    const b2 = r3.byTake[st.i] || { ev: {} };
    console.log(`    ${st.id.padEnd(13)} ${Object.entries(b2.ev).map(([k, v]) => `${k} ${v}`).join('  ') || 'nothing'}`);
  }
  console.log(`  his taps: ${taps.map(t => `${Math.round(t.heldMs)}ms/${t.travel.toFixed(3)}`).join('  ')}`);
  console.log(`  the reference clip, ${ref.frames.length} frames of ordinary use: ${Object.entries(r2.total).map(([k, v]) => `${k} ${v}`).join('  ')}`);
  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
