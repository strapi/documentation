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
/* HOW FAR THE FINGERS MUST TRAVEL BEFORE ANY OF IT COUNTS. An episode holds
   the scale to a function of the aperture, which is what stopped the
   direction inverting, but it also meant the idle drift of a hand waiting
   between taps was faithfully turned into zoom: replaying his own tap take
   through the world moved the scale 20 times and left it half a turn out.
   Measured as the span between the first and ninth decile of a take: the
   fingers drift 0.03 while he taps and 0.35 while he deliberately spreads, so
   0.08 sits between them with room. Once an episode has crossed it, the whole
   function applies, back through the base included: what arms the gesture is
   not what limits it. */
const ZOOM_ARM = 0.08;
/* 0.03 and not 0.05: swept across both calibration clips, the tighter value
   keeps the zoom gestures nearly intact (43 and 35 readable steps while
   spreading, 30 and 26 while closing) and cuts what a travelling hand leaks
   by a third to a half -- brushing from 44 steps to 25, and the up-and-down
   scroll from 34 to 16. A hand that is going somewhere is not zooming. */
const ZOOM_STILL = 0.03;    // palm travel and hand-size change allowed while zooming

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
  let zoomBase = null, zoomStart = true, zoomArmed = false;
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
          /* a pinch, a fist, or the hand over the panel: the episode is over,
             and the scale stays exactly where the hand left it */
          apHist = []; apPrev = null; zoomAnchor = null; lastPose = null;
          zoomBase = null; zoomStart = true; zoomArmed = false;
          continue;
        }
        /* ZOOM IS HOW OPEN THE HAND IS, FOR AS LONG AS IT STAYS OPEN.
           An EPISODE begins the first time an open hand moves its fingers and
           lasts until it pinches, fists or leaves: within it the scale is
           zoomFrom * exp(aperture - base), a function and not a total.

           Three shapes have been tried and this is the first that behaves.
           Per-frame deltas summed by the world ratcheted on noise. Anchoring
           per BURST -- re-anchoring whenever the hand moved too much to be
           read -- was worse in a way that only showed on his own clips: a hand
           opens fast and relaxes slowly, so the slow direction always has more
           readable frames, and every re-anchor threw away the outbound trip so
           it never cancelled the return. Simulated over his spread take, that
           drifted the scale to 0.89 while he was OPENING his hand, and over
           his closing take to 1.83. The direction he complained about was not
           noise, it was arithmetic.

           Held as one function over an episode, spreading and relaxing back
           return to the same scale because they return to the same aperture,
           and what he keeps is what he holds. To keep a zoom he ENDS the
           episode: pinch, make a fist, or lower the hand, and the next episode
           anchors where this one left the scale.

           Stillness now decides whether the scale is UPDATED, not whether the
           episode lives: a hand travelling holds its zoom instead of
           re-anchoring it. */
        const still = lastPose !== null && lastPose.size > 0
          && Math.hypot(detail.palm.x - lastPose.palm.x, detail.palm.y - lastPose.palm.y) / detail.size < ZOOM_STILL
          && Math.abs(detail.size - lastPose.size) / lastPose.size < ZOOM_STILL;
        lastPose = detail;
        apHist.push(detail.aperture);
        if (apHist.length > ZOOM_SMOOTH) apHist.shift();
        if (apHist.length === ZOOM_SMOOTH) {
          const smooth = apHist.reduce((a, b) => a + b, 0) / apHist.length;
          if (zoomBase === null) {
            /* the episode's own zero: the aperture the hand held when it
               started, so nothing moves until the fingers do */
            zoomBase = smooth; zoomAnchor = { ...lastScreen }; zoomStart = true;
          } else if (still
                     && (zoomArmed || Math.abs(smooth - zoomBase) > ZOOM_ARM)
                     && Math.abs(smooth - (apPrev === null ? zoomBase : apPrev)) > ZOOM_DEAD) {
            zoomArmed = true;
            fire('zoom', { aperture: smooth, base: zoomBase, start: zoomStart, ...zoomAnchor });
            zoomStart = false;
            apPrev = smooth;
          }
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
