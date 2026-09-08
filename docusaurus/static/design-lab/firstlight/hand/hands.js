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

export function startHands(opts) {
  const source = (opts && opts.source) || makeCameraSource();
  let reader = makeGestureReader();
  const fx = makeOneEuro({}), fy = makeOneEuro({});
  let t0 = null;

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
    const now = performance.now() / 1000;
    if (t0 === null) t0 = now;
    const t = now - t0;

    const events = reader.read(frame, t);
    for (const ev of events) {
      if (ev.type === 'spread') fire('spread', { ratio: ev.ratio });
      else fire(ev.type, { hand: ev.hand });
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

    fire('move', {
      x: fx.filter(outX, t) * window.innerWidth,
      y: fy.filter(outY, t) * window.innerHeight,
    });
  });

  return {
    state: () => source.state(),
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
      await source.arm();
      fire('state', { state: source.state() });
    },
  };
}
