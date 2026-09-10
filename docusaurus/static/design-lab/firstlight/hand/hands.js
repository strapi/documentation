/* THE WIRING. Source to filter to state machine to window events. This is the
   only public entry point, and the only thing the world ever talks to.

   THE COMFORT BOX is the decision in here that matters most. The camera frame
   is NOT mapped to the screen one to one: a box at the centre, 60% of the
   frame on each axis, covers the whole screen. Map the full frame and reaching
   a screen corner means reaching the edge of the camera's view with your arm
   fully extended, held there, which is where gorilla arm comes from. Sixty
   percent means the whole screen is reachable from a forearm resting near your
   body.

   The image is also mirrored, because a camera sees you facing it: move your
   hand right and an unmirrored point goes left. */

import { makeOneEuro } from './oneeuro.js';
import { makeGestureReader, palmCentre } from './gestures.js';
import { makeCameraSource } from './source.js';

export const COMFORT = { w: 0.6, h: 0.6 };

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/* the zoom gate, all four measured on qa-fixtures/hand-calibration-2026-09-09.json */
const ZOOM_SMOOTH = 3;      // frames averaged, which is what kills the landmark wobble
const ZOOM_TREND = 2;       // frames of one sign: noise alternates, a hand opening does not
const ZOOM_DEAD = 0.015;    // of aperture, per frame, after smoothing
const ZOOM_STILL = 0.05;    // palm travel and hand-size change allowed while zooming

export function startHands(opts) {
  const source = (opts && opts.source) || makeCameraSource();
  let reader = makeGestureReader();
  const fx = makeOneEuro({ minCutoff: 1.5, beta: 4 }), fy = makeOneEuro({ minCutoff: 1.5, beta: 4 });
  let t0 = null;
  /* NO MODES. There were two for an afternoon, NAVIGATE and ZOOM, on a panel
     the hand could press. The owner refused them outright: "je ne veux pas
     avoir a gerer 2 modes: j'elargis la main, ca zoom, je referme la main, ca
     dezoom". They existed because the aperture band overlapped the pinch band
     and one open hand doing both had every gesture fighting its neighbour;
     the calibration clip settled that differently, by telling a pinch from a
     flat closed hand on the aperture itself (see PINCH_FAN_MIN in
     gestures.js). So zoom needs no mode: it reads the aperture of a hand that
     is open, and a hand that is pinching is not open. */
  let zoomAnchor = null, lastFrameAt = 0;
  /* the zoom gate's own state: the smoothed aperture, the run of signs, and
     the previous pose, which is what stillness is measured against */
  let apHist = [], apPrev = null, apSigns = [], lastPose = null;
  let zoomBase = null, zoomStart = true;
  let lastScreen = null;

  /* THE LATCH. Closing the hand is itself a motion, so even palmCentre --
     twelve times steadier than the old anchor -- still drifts a little while
     the fingers fold. A grab or a lock commits the reticle to wherever it
     was already reporting the instant the gesture engages, so the user's aim
     is what gets used, not wherever their hand finished closing.

     GRAB behaves like a mouse button: the press latches the reported point,
     then every frame after it drags from there by however far the anchor
     itself has since moved (latchAnchor* records where the anchor was AT
     the press; latchReported* records what was on screen at that instant).
     RELEASE unlatches and reporting goes back to the anchor directly.

     LOCK is different because it is instantaneous while the fist it reports
     is not: fisted-ness can be held for seconds (see gestures.js) but there
     is no corresponding "unlock" event, only the silent internal flip back
     to unfisted. Latching a lock the same way as a grab, with nothing to
     unlatch it until some future release, would leave the reticle dead for
     the rest of the hold -- worse than the jump this whole change exists to
     remove. So a lock freezes for exactly the one frame it fires on
     (protecting the instant something might read "where the hand locked")
     and tracking resumes live on the very next frame. */
  let latched = false;
  let latchAnchorX = 0, latchAnchorY = 0;
  let latchReportedX = 0, latchReportedY = 0;
  let lastRawX = null, lastRawY = null;

  const fire = (name, detail) => window.dispatchEvent(new CustomEvent('hand:' + name, { detail }));

  source.onFrame((frame) => {
    lastFrameAt = performance.now();
    const now = performance.now() / 1000;
    if (t0 === null) t0 = now;
    const t = now - t0;

    const events = reader.read(frame, t);
    // Forward whatever gestures.js actually attached, rather than picking
    // named fields by hand: a hand-picked list is exactly how `start` was
    // dropped from spread events before this fix (the list here named only
    // `ratio`, so `start: true` -- the flag a fresh gesture needs to reach
    // firstlight.js at all -- silently never left this module). Rebuilding
    // detail generically means there is no field list left to fall out of
    // date the next time gestures.js adds one.
    for (const ev of events) {
      const { type, ...detail } = ev;
      // THE FAN IS NOT FORWARDED. gestures.js still measures it, because the
      // aperture and its dead zone are calibrated against the reference clip
      // and that measurement is worth keeping, but the world no longer reads
      // a zoom out of an ABSOLUTE aperture: the owner tested that on
      // 2026-09-08 and it read backwards to him, since opening a closed hand
      // spends the first half of the movement below the neutral and so
      // dezooms while it opens. Zoom is a RELATIVE gesture now, and it is
      // fired below, from the aperture's frame-to-frame delta. One event
      // reaches the world for zoom, `hand:zoom`, and nothing else.
      if (type === 'fan') continue;
      if (type === 'pose') {
        fire('pose', { ...detail, fps: reader.state().fps });
        const overPanel = lastScreen && document.elementFromPoint(lastScreen.x, lastScreen.y)?.closest('#hand-panel');
        if (detail.aperture === null || !lastScreen || overPanel) {
          apHist = []; apPrev = null; apSigns = []; zoomAnchor = null; lastPose = null;
          zoomBase = null; zoomStart = true;
          continue;
        }
        /* ZOOM READS THE FINGERS, NOT THE ARM. Moving the hand through space,
           toward the camera or across it, was zooming: "deplacer ma main dans
           l'espace, en avant ou en arriere, zoom / dezoom aussi". The
           aperture is a ratio to hand size, so it survives distance in
           principle, but the landmarks wobble while the hand travels and the
           ratio moves with them: measured on the calibration clip, the frame
           to frame aperture change exceeded the old 0.025 dead zone on 125 of
           the 203 frames of the brush take and 50 of the 185 of the drag,
           against 0 of 92 for a hand held still. Integrating that noise is
           what moved the scale.
           Three gates, and all three numbers come off that clip. The aperture
           is SMOOTHED over three frames, which is what kills the wobble. The
           change has to keep ONE SIGN for two frames running, because noise
           alternates and a hand opening does not. And the hand has to be
           STILL in space: palm and hand size steady to within 0.05, so
           travelling and zooming cannot be confused.
           What that does to the clip, as a net scale change per take: a hand
           held still 1.00, spread 1.22, closed 0.56, tapping 1.00, dragging
           1.05, brushing 1.13. Before the gates, tapping came out at 0.59 and
           taking the hand out of frame at 3.68. */
        const still = lastPose !== null && lastPose.size > 0
          && Math.hypot(detail.palm.x - lastPose.palm.x, detail.palm.y - lastPose.palm.y) / detail.size < ZOOM_STILL
          && Math.abs(detail.size - lastPose.size) / lastPose.size < ZOOM_STILL;
        lastPose = detail;
        apHist.push(detail.aperture);
        if (apHist.length > ZOOM_SMOOTH) apHist.shift();
        if (apHist.length === ZOOM_SMOOTH) {
          const smooth = apHist.reduce((a, b) => a + b, 0) / apHist.length;
          if (apPrev !== null) {
            const delta = smooth - apPrev;
            apSigns.push(Math.sign(delta));
            if (apSigns.length > ZOOM_TREND) apSigns.shift();
            const oneWay = apSigns.length === ZOOM_TREND && apSigns[0] !== 0
              && apSigns.every((x) => x === apSigns[0]);
            /* A ZOOM GESTURE HAS A BEGINNING, and the aperture is reported
               against it. Sending a per-frame DELTA and letting the world
               integrate it was the wrong shape: the aperture is noisy, so a
               couple of noise frames of one sign passed the trend gate and
               ratcheted the scale the wrong way, and nothing ever took it
               back. "le zoom, qui parfois dezoom au lieu de zoomer ou
               l'inverse" is exactly what an integrator does with noise.
               Now the first qualifying frame opens a gesture and every frame
               after it reports the aperture and the base it started from, so
               the world can hold cam.ts to a pure function of how far the
               hand has opened SINCE the gesture began. A noisy frame moves
               the scale a hair and the next frame takes it back; nothing
               accumulates, and the direction cannot invert. */
            if (still && oneWay && Math.abs(delta) > ZOOM_DEAD) {
              if (!zoomAnchor) {
                zoomAnchor = { ...lastScreen };
                zoomBase = apPrev;         /* where the hand was one frame before it began */
              }
              fire('zoom', { aperture: smooth, base: zoomBase, start: zoomStart, ...zoomAnchor });
              zoomStart = false;
            } else if (!still) {
              zoomAnchor = null; zoomStart = true;
            }
          }
          apPrev = smooth;
        }
        continue;
      }
      if (type === 'absent') {
        zoomAnchor = null; lastScreen = null; apHist = []; apPrev = null; apSigns = []; lastPose = null;
        zoomBase = null; zoomStart = true;
        fx.reset(); fy.reset(); lastRawX = null; lastRawY = null;
      }
      fire(type, detail);
    }
    // unlatch immediately on any release, including one fired by the dead
    // man's switch when tracking is lost mid-grab -- that frame has no hand
    // and returns below before an anchor reading exists, so this cannot wait
    // for the branch that reads one.
    if (events.some((ev) => ev.type === 'release')) latched = false;

    const hands = (frame && frame.hands) || [];
    if (!hands.length) return;
    const p = palmCentre(hands[0].landmarks);

    // comfort box, then mirror: still raw, ahead of both the latch and the filter
    const bx = (p.x - (0.5 - COMFORT.w / 2)) / COMFORT.w;
    const by = (p.y - (0.5 - COMFORT.h / 2)) / COMFORT.h;
    const rawX = 1 - clamp01(bx);
    const rawY = clamp01(by);
    if (lastRawX === null) { lastRawX = rawX; lastRawY = rawY; }

    const types = events.map((ev) => ev.type);
    let outX, outY;
    if (types.includes('lock')) {
      latched = false;
      outX = lastRawX; outY = lastRawY;
    } else if (types.includes('grab')) {
      latched = true;
      latchAnchorX = rawX; latchAnchorY = rawY;
      latchReportedX = lastRawX; latchReportedY = lastRawY;
      outX = latchReportedX; outY = latchReportedY;
    } else if (latched) {
      outX = latchReportedX + (rawX - latchAnchorX);
      outY = latchReportedY + (rawY - latchAnchorY);
    } else {
      outX = rawX; outY = rawY;
    }
    lastRawX = outX; lastRawY = outY;

    lastScreen = {
      x: fx.filter(outX, t) * window.innerWidth,
      y: fy.filter(outY, t) * window.innerHeight,
    };
    fire('move', lastScreen);
  });

  /* THE WATCHDOG waits four of the camera's own frames, and never less than
     400ms. At a fixed 180ms it fired on ordinary jitter as soon as the page
     got heavy enough to slow the camera down, feeding the recogniser an empty
     frame in the middle of a gesture and tearing it down. */
  const watchdog = setInterval(() => {
    const fps = reader.state().fps || 23;
    const wait = Math.max(400, (1000 / fps) * 4);
    if (source.state() === 'on' && lastFrameAt && performance.now() - lastFrameAt > wait) {
      const events = reader.read({ hands: [] }, performance.now() / 1000 - t0);
      if (events.length) {
        latched = false; zoomAnchor = null; lastScreen = null;
        apHist = []; apPrev = null; apSigns = []; lastPose = null;
        zoomBase = null; zoomStart = true;
        fx.reset(); fy.reset(); lastRawX = null; lastRawY = null;
        for (const event of events) fire(event.type, event);
      }
    }
  }, 60);

  return {
    state: () => source.state(),
    destroy() { this.disarm(); clearInterval(watchdog); },
    disarm() {
      source.disarm(); fx.reset(); fy.reset(); t0 = null;
      // a fresh reader, not just a fresh filter: without this, present,
      // pinched, fisted and lastSeen all survive a disarm. lastSeen then
      // holds a timestamp from the OLD t0 epoch while the next arm() starts
      // a new one, so the dead man's switch compares against a clock that
      // runs way ahead of it and either misfires late or not at all, and a
      // stale present === true silently swallows the next hand:present.
      reader = makeGestureReader();
      // and a fresh latch: a stale `latched === true` from a session that
      // ended mid grab would otherwise start the next session dragging from
      // a latchAnchor/latchReported pair the new hand never produced.
      latched = false;
      lastRawX = null; lastRawY = null;
      lastFrameAt = 0; lastScreen = null; zoomAnchor = null;
      apHist = []; apPrev = null; apSigns = []; lastPose = null;
      zoomBase = null; zoomStart = true;
      // turning the feature off must visibly turn it off: without this, only
      // hand:state fires, and nothing ever tells the reticle (or the world's
      // own handGrab/handSnap bookkeeping) that the hand is gone, so it kept
      // its 'on' class -- and whatever it was last showing -- forever after
      // the user disarmed. Fired even if no hand was present; every listener
      // of hand:absent is idempotent against that.
      fire('absent');
      fire('state', { state: source.state() });
    },
    async arm() {
      // source.arm() sets its own state to 'loading' synchronously before its
      // first await, but that await is what this whole function then awaits
      // too, so without announcing it here first, nothing dispatches
      // hand:state until the ENTIRE arm sequence has settled: no progress
      // indication during an 11 MB download, and boot.js's button label never
      // shows anything but its state from before the click. Skipped only when
      // already 'on', since arm() is then a guaranteed no-op (see source.js).
      if (source.state() !== 'on') fire('state', { state: 'loading' });
      await source.arm();
      fire('state', { state: source.state() });
    },
  };
}
