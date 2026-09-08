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
import { makeGestureReader, pinchPoint } from './gestures.js';
import { makeCameraSource } from './source.js';

export const COMFORT = { w: 0.6, h: 0.6 };

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function startHands(opts) {
  const source = (opts && opts.source) || makeCameraSource();
  const reader = makeGestureReader();
  const fx = makeOneEuro({}), fy = makeOneEuro({});
  let t0 = null;

  const fire = (name, detail) => window.dispatchEvent(new CustomEvent('hand:' + name, { detail }));

  source.onFrame((frame) => {
    const now = performance.now() / 1000;
    if (t0 === null) t0 = now;
    const t = now - t0;

    for (const ev of reader.read(frame, t)) {
      if (ev.type === 'spread') fire('spread', { ratio: ev.ratio });
      else fire(ev.type, { hand: ev.hand });
    }

    const hands = (frame && frame.hands) || [];
    if (!hands.length) return;
    const p = pinchPoint(hands[0].landmarks);

    // comfort box, then mirror, then smooth, then screen pixels
    const bx = (p.x - (0.5 - COMFORT.w / 2)) / COMFORT.w;
    const by = (p.y - (0.5 - COMFORT.h / 2)) / COMFORT.h;
    const mx = 1 - clamp01(bx);
    const my = clamp01(by);
    fire('move', {
      x: fx.filter(mx, t) * window.innerWidth,
      y: fy.filter(my, t) * window.innerHeight,
    });
  });

  return {
    state: () => source.state(),
    disarm() { source.disarm(); fx.reset(); fy.reset(); t0 = null; fire('state', { state: source.state() }); },
    async arm() {
      await source.arm();
      fire('state', { state: source.state() });
    },
  };
}
