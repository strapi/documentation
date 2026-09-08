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
export const PINCH_ON = 0.55, PINCH_OFF = 1.00; // thumb to index, over hand size

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

/* THE FAN drives zoom now: index tip to pinky tip, over hand size. The owner
   found the old two-hand pinch-distance zoom both the wrong gesture ("je
   prefererai qu'en fait on ferme ou ouvre la main... pour zoomer/dezoomer")
   and too sensitive, and it needed a second hand for a feature the second
   hand never otherwise earned its keep on (see source.js, numHands: 1). One
   open hand, closing or opening, is what replaces it.

   Measured on the fixture with the same hysteresis this file already runs:
   898 frames read OPEN (median fan 0.893), 292 read FISTED (median 0.396),
   631 read PINCHED (median 0.660). The fan overlaps the pinch band, so it is
   read only on a hand that is neither pinched nor fisted -- decided by the
   same two variables (`pinched`, `fisted`) that already gate everything else
   below, not a separate check of its own. It clears the fist band with
   plenty of room (fist's own max is 0.904, well under the dead zone floor
   below). */
function fanRatio(L) { return dist(L[LM.INDEX_TIP], L[LM.PINKY_TIP]) / handSize(L); }

/* FAN_NEUTRAL and FAN_DEADZONE are derived from that same 898-frame OPEN
   distribution, not chosen. Without a dead zone a hand held open and merely
   resting -- never neutral to the pixel -- would drift the zoom on its own,
   which is exactly the complaint against the old, oversensitive gesture.

   FAN_NEUTRAL is the distribution's median: 0.8935, rounds to 0.89.
   FAN_DEADZONE is the larger of its two half-spans to the 10th and 90th
   percentile (median-to-p10 is 0.097; median-to-p90 is 0.153) so the dead
   zone is at least as wide as the resting spread on EITHER side, not just
   the narrower one: 0.153, rounds to 0.15. A hand held open anywhere in
   [0.74, 1.04] produces no rate at all; 84% of the fixture's real open-hand
   frames land inside that band, resting, exactly where nothing should
   happen. */
const FAN_NEUTRAL = 0.89, FAN_DEADZONE = 0.15;

/* A BRIEF PINCH IS A CLICK. Timing cannot be measured from this fixture: it
   holds exactly two deliberate pinches, at 8.1s and 12.1s, both built to
   test drag hysteresis, and nothing shorter but one incidental 667ms pinch
   that was not a deliberate tap either. CLICK_MAX_MS instead follows the
   platform convention for tap vs. long-press (iOS and Android both draw
   that line at 500ms): 400ms sits comfortably under it, and more than 20x
   under either real hold in the fixture, so no genuine drag can misread as
   a click. CLICK_MAX_DIST IS measured: that one incidental still pinch
   moves the palm at most 0.0224 of hand size from where it started over its
   whole 667ms. 0.15 sits 6-7x above that natural jitter floor -- room for a
   real hand's tremor during a fast tap -- while staying far under the 0.73
   and 1.06 of hand size the two genuine holds accumulate once they actually
   start dragging. */
export const CLICK_MAX_MS = 400, CLICK_MAX_DIST = 0.15;

/* THE SWIPE. Recognised here, generally, on any open hand; what a `dismiss`
   MEANS is decided entirely by whoever is listening (today: the hand-control
   arming dialog, which reads it as decline; see firstlight.js). Lateral palm
   speed, over hand size, per second -- the same ratio-to-hand-size rule as
   everything else in this file, not a raw image-space speed: a threshold in
   raw units would mean "swipe harder the further you sit from the camera",
   the exact mistake this file's own PINCH/FIST thresholds already correct
   elsewhere.

   SWIPE_SPEED WAS FIRST SET TO 1.0, from a measurement taken in raw image
   units and applied here without converting it -- a hand is roughly 0.279
   of the frame, so a raw-unit speed reads about 3.6x SMALLER than the same
   motion measured over hand size. The result was a threshold about 3.6x too
   low for the units this code actually compares against.

   RE-MEASURED IN THE RIGHT UNITS (lateral palm speed over hand size, per
   second), over 1819 consecutive frame pairs across the whole fixture,
   every hand state included: median 0.064, p90 0.53, p99 1.40, single-frame
   maximum 2.04. Sustained runs of SWIPE_FRAMES=4 consecutive frames past a
   threshold, on this same natural footage with no deliberate swipe anywhere
   in it:
     threshold 1.0 -> 4 involuntary triggers
     threshold 1.5 -> 0
     threshold 2.0 -> 0
     threshold 2.5 -> 0
   At the old 1.0, ordinary use fires the single most destructive gesture in
   this vocabulary (a dismiss disarms the camera) roughly every 17 seconds
   by accident.

   SWIPE_SPEED = 2.5, not 1.5, even though 1.5 already shows zero here: 1.5
   sits barely above this clip's own p99 (1.40) and BELOW its single fastest
   frame (2.04), so a slightly brisker day reaches it. 2.5 clears that
   fastest natural frame with real margin, while a deliberate swipe -- two
   or three hand widths in about a fifth of a second -- reads as ten or more
   in these units: the margin sits on the safe side of a gesture that cannot
   be undone. (This file's own state reset on every pinch/fist transition,
   see makeGestureReader below, already suppresses two of those four raw
   1.0-threshold triggers before the direction gate below even runs; the
   number above is measured without either protection, on purpose, so the
   choice of 2.5 does not quietly depend on them.)

   DISMISS IS OUTWARD, and outward depends on which hand it is: brushing
   something away is an abduction, moving the arm away from the body's
   midline, which costs less than crossing in front of yourself. For a
   right hand that is rightward; for a left hand, leftward. The direction is
   judged in SCREEN space, after hand/hands.js's own mirror (`rawX = 1 -
   bx`), not in the raw landmark coordinates this file otherwise works in
   throughout: a right hand moving to its own right is raw x DECREASING (the
   camera sees you facing it) but screen x INCREASING, which is the
   direction that actually reads as "outward" once mirrored for display.
   Measuring in raw space instead would invert the sign and the gesture
   would work backwards for everyone, so the flip is made explicit here
   (screenSpeed = -rawSpeed) rather than left to be discovered by trial and
   error. Handedness is read off the same frame the landmarks come from
   (`h`); verified on the fixture: 1821 frames, one hand throughout,
   labelled "Right" with zero flips, and across 389 two-hand frames the two
   hands never once shared a label. A hand with no handedness reported (or a
   source that never sends one) accepts a swipe in EITHER direction, still
   requiring it stay consistent for the full streak: the direction only
   exists to make the gesture comfortable, not to gate it shut when it is
   simply unknown. */
export const SWIPE_SPEED = 2.5, SWIPE_FRAMES = 4;

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

/* PALM CENTRE: the wrist plus the index, middle and pinky knuckles (0, 5, 9,
   17). These four points are the rigid dorsal plate of the hand -- the part
   that does NOT fold when the fingers curl into a fist or draw together into
   a pinch. This is what the reticle is anchored to (see the report on the
   old pinch-point anchor this replaced), what the click above measures its
   "did the hand actually move" test from, and what the swipe below tracks
   for lateral speed. */
export function palmCentre(L) {
  const pts = [L[LM.WRIST], L[LM.INDEX_MCP], L[LM.MIDDLE_MCP], L[LM.PINKY_MCP]];
  return {
    x: pts.reduce((sum, pt) => sum + pt.x, 0) / pts.length,
    y: pts.reduce((sum, pt) => sum + pt.y, 0) / pts.length,
  };
}

export function makeGestureReader() {
  let present = false, pinched = false, fisted = false;
  let lastSeen = null;
  // THE CLICK: captured at the instant a grab arms, read back at the instant
  // it releases naturally. Never set on the fist-forced release below: a
  // closing hand overriding a pinch is not a released click, it is a
  // gesture changing its mind.
  let grabStartT = null, grabStartPalm = null;
  // THE SWIPE: a short streak counter, alive only while the hand reads
  // open. swipeFired guards against firing `dismiss` on every frame of a
  // streak that keeps qualifying past the fourth -- one swipe, one event.
  let swipeStreak = 0, swipeDir = 0, swipeFired = false;
  let lastPalmX = null, lastPalmT = null;

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
          grabStartT = null; grabStartPalm = null;
          lastPalmX = null; lastPalmT = null; swipeStreak = 0; swipeDir = 0; swipeFired = false;
        }
        return evs;
      }
      lastSeen = t;
      if (!present) { present = true; evs.push({ type: 'present' }); }

      const primary = hands[0];
      const L = primary.landmarks;
      const pr = pinchRatio(L);
      const fc = fistCurl(L);

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
        if (pinched) {
          pinched = false;
          evs.push({ type: 'release', hand: primary.handedness });
          // becoming a fist is the hand changing its mind, not a click
          grabStartT = null; grabStartPalm = null;
        }
      } else if (fisted && fc > FIST_OFF) {
        fisted = false;
      }

      if (!fisted) {
        if (!pinched && pr < PINCH_ON) {
          pinched = true;
          grabStartT = t;
          grabStartPalm = palmCentre(L);
          evs.push({ type: 'grab', hand: primary.handedness });
        } else if (pinched && pr > PINCH_OFF) {
          pinched = false;
          if (grabStartT !== null) {
            const heldMs = (t - grabStartT) * 1000;
            const moved = dist(palmCentre(L), grabStartPalm) / handSize(L);
            if (heldMs <= CLICK_MAX_MS && moved <= CLICK_MAX_DIST) {
              evs.push({ type: 'click' });
            }
          }
          grabStartT = null; grabStartPalm = null;
          evs.push({ type: 'release', hand: primary.handedness });
        }
      }

      // FAN (zoom rate) and SWIPE (dismiss): both read only on a hand that
      // is, this frame, genuinely open -- neither pinched nor fisted -- so
      // dragging or fisting never also spins the zoom or fires a dismiss.
      if (!fisted && !pinched) {
        const dev = fanRatio(L) - FAN_NEUTRAL;
        if (Math.abs(dev) > FAN_DEADZONE) {
          evs.push({ type: 'fan', rate: dev > 0 ? dev - FAN_DEADZONE : dev + FAN_DEADZONE });
        }

        const pc = palmCentre(L);
        if (lastPalmX !== null && lastPalmT !== null && t > lastPalmT) {
          const dt = t - lastPalmT;
          const rawSpeed = ((pc.x - lastPalmX) / handSize(L)) / dt;
          // screen space, not raw landmark space: see the comment on
          // SWIPE_SPEED above for why this flip is not optional.
          const screenSpeed = -rawSpeed;
          const dir = screenSpeed > SWIPE_SPEED ? 1 : screenSpeed < -SWIPE_SPEED ? -1 : 0;
          // outward for THIS hand: rightward (+1) for a hand labelled
          // Right, leftward (-1) for one labelled Left, either direction
          // (0, meaning "match whatever dir already is") for a hand with no
          // handedness reported at all.
          const wantDir = primary.handedness === 'Right' ? 1 : primary.handedness === 'Left' ? -1 : 0;
          const qualifies = dir !== 0 && (wantDir === 0 || dir === wantDir);
          if (qualifies && dir === swipeDir) swipeStreak++;
          else { swipeStreak = qualifies ? 1 : 0; swipeDir = qualifies ? dir : 0; swipeFired = false; }
          if (swipeStreak >= SWIPE_FRAMES && !swipeFired) {
            swipeFired = true;
            evs.push({ type: 'dismiss' });
          }
        }
        lastPalmX = pc.x; lastPalmT = t;
      } else {
        lastPalmX = null; lastPalmT = null;
        swipeStreak = 0; swipeDir = 0; swipeFired = false;
      }

      return evs;
    },
  };
}
