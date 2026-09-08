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
  MIDDLE_MCP: 9, MIDDLE_TIP: 12, RING_TIP: 16, PINKY_TIP: 20, PINKY_MCP: 17,
};

/* PINCH: thumb and index tip coming together, over hand size. Derived from
   the 1821-frame reference fixture: closed frames sit at 0.04-0.42, open
   frames at 1.18-1.56, and the whole 0.42-1.18 span between them is a true
   zero-density gap but for a handful of in-between-motion frames. PINCH_ON
   =0.55 and PINCH_OFF=1.00 both land on values the fixture never produces. */
const PINCH_ON = 0.55, PINCH_OFF = 1.00;      // thumb to index, over hand size

/* FIST cannot be told apart from a pinch by thumb-to-index distance: closing
   the whole hand also brings the thumb near the index tip, so in the fixture
   EVERY held-fist frame also reads as "pinched" by that measure alone (274 of
   274). The two gestures differ in what the OTHER three fingers do instead: a
   pinch holds middle, ring and pinky extended while thumb and index meet; a
   fist curls all of them in together. So fisted-ness is read from the curl of
   ONLY those three non-pinching fingers (12, 16, 20) to the wrist, over hand
   size -- a quantity a pinch never disturbs.

   In the fixture, every sustained held fist stays under 0.89 (two holds, 166
   and 111 frames, medians 0.715 and 0.682); every sustained held open hand or
   pinch stays over 1.40 (four holds, minimum 1.404). No HELD gesture of
   either kind ever sits in the 0.89-1.40 band; only the handful of frames
   where the hand is physically in the middle of opening or closing pass
   through it. FIST_ON and FIST_OFF sit inside that band, close to its two
   edges, so they arm and disarm on genuine held state and never on a hold. */
const FIST_ON = 0.95, FIST_OFF = 1.35;        // curl of middle+ring+pinky to wrist, over hand size
const LOST_MS = 150;                          // the dead man's switch

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function handSize(L) {
  // rigid, always visible, and unaffected by which fingers are curled
  return Math.max(1e-6, dist(L[LM.WRIST], L[LM.MIDDLE_MCP]));
}
function pinchRatio(L) {
  return dist(L[LM.THUMB_TIP], L[LM.INDEX_TIP]) / handSize(L);
}
function fistCurl(L) {
  // deliberately excludes the index: it is the finger a pinch also curls, so
  // including it would make this measure blind to the exact case it exists
  // to catch (see the comment on FIST_ON above)
  const w = L[LM.WRIST], s = handSize(L);
  const tips = [LM.MIDDLE_TIP, LM.RING_TIP, LM.PINKY_TIP];
  let sum = 0;
  for (const t of tips) sum += dist(L[t], w);
  return (sum / tips.length) / s;
}
function isPinchedNotFisted(L) {
  // Used only by the two-hand spread gate below, which has no persisted
  // hysteresis state of its own for a second hand the way the primary
  // hand's `pinched`/`fisted` variables do. A single-frame check is still
  // correct here because the ARMING threshold (not the release one) is the
  // right question to ask of a hand you have not been tracking continuously:
  // "is this hand genuinely pinched right now", not "has it stayed pinched".
  return fistCurl(L) >= FIST_ON && pinchRatio(L) < PINCH_ON;
}
export function pinchPoint(L) {
  // where the hand is "holding": between the thumb and index tips, which is
  // what the eye tracks, not the wrist and not the palm centre. Still the
  // right measure of the pinch itself (used for the two-handed spread below)
  // -- it is only wrong as the thing the RETICLE follows, because thumb and
  // index both travel toward the palm as the hand closes.
  return { x: (L[LM.THUMB_TIP].x + L[LM.INDEX_TIP].x) / 2,
           y: (L[LM.THUMB_TIP].y + L[LM.INDEX_TIP].y) / 2 };
}

/* PALM CENTRE: the wrist plus the index, middle and pinky knuckles (0, 5, 9,
   17). These four points are the rigid dorsal plate of the hand -- the part
   that does NOT fold when the fingers curl into a fist or draw together into
   a pinch. pinchPoint tracks the two fingers actually doing the gesture, so
   it travels the furthest of any candidate anchor when a real hand in the
   reference fixture closes into a fist (measured in qa-hand-wiring.js, which
   replays a real fist closure from the fixture and asserts on it). Palm
   centre moves only a fraction as far for the same closure, and is also the
   steadiest of the candidates during a pinch. A palm does not fold, so this
   is what the reticle is anchored to instead; pinchPoint remains what a
   pinch itself is measured from, and what the two-handed spread still uses. */
export function palmCentre(L) {
  const pts = [L[LM.WRIST], L[LM.INDEX_MCP], L[LM.MIDDLE_MCP], L[LM.PINKY_MCP]];
  return {
    x: pts.reduce((sum, pt) => sum + pt.x, 0) / pts.length,
    y: pts.reduce((sum, pt) => sum + pt.y, 0) / pts.length,
  };
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
      const fc = fistCurl(primary.landmarks);

      // Fist is decided first, and on its own independent measure, because
      // it is the only one of the two that actually discriminates a fist from
      // a pinch (see the comment on FIST_ON above: thumb-to-index distance
      // cannot). A pinch is then only armed while the hand is not fisted, so
      // closing the whole hand into a fist is never also read as a grab, and
      // closing further while already pinching releases the pinch instead of
      // stacking a lock on top of it.
      if (!fisted && fc < FIST_ON) {
        fisted = true;
        evs.push({ type: 'lock', hand: primary.handedness });
        if (pinched) { pinched = false; evs.push({ type: 'release', hand: primary.handedness }); }
      } else if (fisted && fc > FIST_OFF) {
        fisted = false;
      }

      if (!fisted) {
        if (!pinched && pr < PINCH_ON) { pinched = true; evs.push({ type: 'grab', hand: primary.handedness }); }
        else if (pinched && pr > PINCH_OFF) { pinched = false; evs.push({ type: 'release', hand: primary.handedness }); }
      }

      // two pinched hands: the distance between their pinch points is the scale.
      // A hand only counts as pinched here if it genuinely is, by the same
      // fist-first discrimination the one-hand path above uses: a fist also
      // reads as a low thumb-to-index distance (see the comment on FIST_ON),
      // so checking pinchRatio alone -- and checking it against PINCH_OFF, the
      // looser RELEASE threshold, rather than PINCH_ON, the ARMING one -- let
      // two merely open hands (ratio between PINCH_ON and PINCH_OFF) and two
      // closed fists alike read as "pinched" and drive a spread.
      if (hands.length >= 2) {
        const a = hands[0].landmarks, b = hands[1].landmarks;
        const bothPinched = isPinchedNotFisted(a) && isPinchedNotFisted(b);
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
