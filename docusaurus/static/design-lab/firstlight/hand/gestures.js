/* THE GESTURE STATE MACHINE. Landmark frames in, semantic events out. It owns
   no camera, no DOM and no MediaPipe, which is why it can be tested exhaustively
   with hand-built frames and why the whole of tier 1 can be proved without a
   webcam ever being switched on.

   Two rules run through all of it.

   EVERY THRESHOLD IS A RATIO TO HAND SIZE, never an image distance. Image
   distance shrinks as you sit further from the camera, so a fixed threshold
   would quietly mean "pinch harder the further away you are". Hand size is the
   wrist to middle-knuckle span, which is rigid and always visible.

   EVERY THRESHOLD HAS TWO VALUES. A single threshold held at its own value
   flickers, and a flickering grab makes the map convulse. Arming and disarming
   at different values costs nothing and removes the entire failure mode. */

export const LM = {
  WRIST: 0, THUMB_TIP: 4, INDEX_MCP: 5, INDEX_TIP: 8,
  MIDDLE_MCP: 9, MIDDLE_TIP: 12, RING_TIP: 16, PINKY_TIP: 20,
};

/* Starting values. They are tuned once against the reference clip; the probe
   asserts the BEHAVIOUR they produce, not the numbers themselves, so tuning
   them never invalidates the tests. */
const PINCH_ON = 0.38, PINCH_OFF = 0.52;      // thumb to index, over hand size
const FIST_ON = 1.05, FIST_OFF = 1.30;        // mean fingertip to wrist, over hand size
const LOST_MS = 150;                          // the dead man's switch

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function handSize(L) {
  // rigid, always visible, and unaffected by which fingers are curled
  return Math.max(1e-6, dist(L[LM.WRIST], L[LM.MIDDLE_MCP]));
}
function pinchRatio(L) {
  return dist(L[LM.THUMB_TIP], L[LM.INDEX_TIP]) / handSize(L);
}
function curlRatio(L) {
  const w = L[LM.WRIST], s = handSize(L);
  const tips = [LM.INDEX_TIP, LM.MIDDLE_TIP, LM.RING_TIP, LM.PINKY_TIP];
  let sum = 0;
  for (const t of tips) sum += dist(L[t], w);
  return (sum / tips.length) / s;
}
export function pinchPoint(L) {
  // where the hand is "holding": between the thumb and index tips, which is
  // what the eye tracks, not the wrist and not the palm centre
  return { x: (L[LM.THUMB_TIP].x + L[LM.INDEX_TIP].x) / 2,
           y: (L[LM.THUMB_TIP].y + L[LM.INDEX_TIP].y) / 2 };
}

export function makeGestureReader() {
  let present = false, pinched = false, fisted = false;
  let lastSeen = null, spreadBase = null;

  return {
    state: () => ({ present, pinched, fisted }),
    read(frame, t) {
      const evs = [];
      const hands = (frame && frame.hands) || [];

      if (hands.length === 0) {
        if (lastSeen !== null && (t - lastSeen) * 1000 >= LOST_MS) {
          // the dead man's switch: never strand the world holding something
          if (pinched) { pinched = false; evs.push({ type: 'release', hand: null }); }
          if (fisted) fisted = false;
          if (present) { present = false; evs.push({ type: 'absent' }); }
          spreadBase = null;
        }
        return evs;
      }
      lastSeen = t;
      if (!present) { present = true; evs.push({ type: 'present' }); }

      const primary = hands[0];
      const pr = pinchRatio(primary.landmarks);
      const cr = curlRatio(primary.landmarks);

      if (!pinched && pr < PINCH_ON) { pinched = true; evs.push({ type: 'grab', hand: primary.handedness }); }
      else if (pinched && pr > PINCH_OFF) { pinched = false; evs.push({ type: 'release', hand: primary.handedness }); }

      // a fist is only read when NOT pinching: a pinch curls the index too, and
      // reading both at once would fire a lock every time you grabbed something
      if (!pinched) {
        if (!fisted && cr < FIST_ON) { fisted = true; evs.push({ type: 'lock', hand: primary.handedness }); }
        else if (fisted && cr > FIST_OFF) fisted = false;
      }

      // two pinched hands: the distance between their pinch points is the scale
      if (hands.length >= 2) {
        const a = hands[0].landmarks, b = hands[1].landmarks;
        const bothPinched = pinchRatio(a) < PINCH_OFF && pinchRatio(b) < PINCH_OFF;
        if (bothPinched) {
          const d = dist(pinchPoint(a), pinchPoint(b));
          if (spreadBase === null) spreadBase = d;
          else if (spreadBase > 1e-6) evs.push({ type: 'spread', ratio: d / spreadBase });
        } else spreadBase = null;
      } else spreadBase = null;

      return evs;
    },
  };
}
