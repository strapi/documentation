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
   arming dialog, which reads it as decline; see firstlight.js).

   A SWIPE IS A DISPLACEMENT, NOT A RUN OF FAST FRAMES. Two earlier versions
   asked each frame to clear a speed, and both failed the same way. At 1.0
   unit/s ordinary use fired the most destructive gesture in this vocabulary
   about every 17 seconds. Raised to 2.5 the false positives went to zero and
   the owner's own deliberate swipe stopped firing at all -- twice, on two
   evenings. The reason is that per-frame speed is not a property of the
   gesture: a real swipe accelerates and decelerates, its frames arrive 20 to
   70 ms apart on a camera that is also running a hand model, and ONE frame
   under the bar reset the streak and the distance accumulated with it. A test
   written with evenly spaced timestamps cannot see any of that, which is why
   one existed and passed while the gesture did not work.

   So the gesture is measured whole: the net lateral displacement of the palm
   over a short WINDOW, in hand widths, in screen space. No frame has to clear
   anything on its own.

   SWIPE_DIST = 0.7 hand widths in SWIPE_WINDOW = 0.25 s. That is a mean speed
   of 2.8 units/s, which keeps the margin the 2.5 threshold was chosen for:
   measured over 1819 consecutive frame pairs of the reference clip, all hand
   states included, ordinary motion runs a median of 0.064 and a p99 of 1.40
   units/s, and its single fastest frame reaches 2.04. Sustained over a
   quarter second it never comes close: the clip produces ZERO dismisses under
   this rule (asserted in qa-hand-gestures.js), while a deliberate swipe --
   two or three hand widths in about a fifth of a second -- clears 0.7 several
   times over.

   SWIPE_MIN_SAMPLES = 3 and SWIPE_MAX_JUMP = 0.75 are together the guard the
   old frame counter really provided, against the tracker rather than against
   the hand. A glitch teleports the palm a hand width between two frames and
   then sits still, and a window that only asked for three samples would fire
   on it the moment an ordinary third frame arrived to make up the count. So
   the displacement must also be PROGRESSIVE: no single interval inside the
   window may account for more than 0.75 of the net. A real swipe at any
   frame rate spreads itself over its frames, a sixth of the movement each at
   30 fps, so it clears that easily; a teleport carries all of it in one
   interval and is refused. 0.75 is deliberately generous, because a real
   swipe accelerates and its fastest interval does carry more than its share.

   DISMISS IS OUTWARD, and outward depends on which hand it is: brushing
   something away is an abduction, moving the arm away from the body's
   midline, which costs less than crossing in front of yourself. For a right
   hand that is rightward; for a left hand, leftward. The direction is judged
   in SCREEN space, after hand/hands.js's own mirror (`rawX = 1 - bx`), not in
   the raw landmark coordinates this file otherwise works in: a right hand
   moving to its own right is raw x DECREASING (the camera sees you facing it)
   but screen x INCREASING, which is the direction that actually reads as
   "outward" once mirrored for display. Measuring in raw space instead would
   invert the sign and the gesture would work backwards for everyone, so the
   flip is made explicit below rather than left to trial and error. Handedness
   is read off the same frame the landmarks come from; verified on the
   fixture: 1821 frames, one hand throughout, labelled "Right" with zero
   flips, and across 389 two-hand frames the two hands never once shared a
   label. A hand with no handedness reported accepts a swipe in EITHER
   direction: the direction exists to make the gesture comfortable, not to
   gate it shut when it is simply unknown.

   ONE SWIPE, ONE EVENT: after firing, the gesture re-arms only once the palm
   has settled, meaning its net displacement over the window falls back under
   SWIPE_REARM. Ending the open hand (a pinch, a fist, or losing the hand)
   re-arms it too. */
export const SWIPE_DIST = 0.7, SWIPE_WINDOW = 0.25, SWIPE_MIN_SAMPLES = 3,
  SWIPE_MAX_JUMP = 0.75, SWIPE_REARM = 0.2;

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
  let grabStartT = null, grabStartPalm = null, grabMaxDistance = 0;
  // THE SWIPE: the palm's recent path, alive only while the hand reads open.
  // Oldest first, trimmed to SWIPE_WINDOW, in RAW landmark x (the screen flip
  // is applied where the displacement is read, once).
  let swipeTrail = [], swipeFired = false;

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
          swipeTrail = []; swipeFired = false;
        }
        return evs;
      }
      lastSeen = t;
      if (!present) { present = true; evs.push({ type: 'present' }); }

      const primary = hands[0];
      const L = primary.landmarks;
      const pr = pinchRatio(L);
      const fc = fistCurl(L);
      if (pinched && grabStartPalm) {
        grabMaxDistance = Math.max(grabMaxDistance, dist(palmCentre(L), grabStartPalm) / handSize(L));
      }

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
          grabMaxDistance = 0;
          evs.push({ type: 'grab', hand: primary.handedness });
        } else if (pinched && pr > PINCH_OFF) {
          pinched = false;
          if (grabStartT !== null) {
            const heldMs = (t - grabStartT) * 1000;
            const moved = dist(palmCentre(L), grabStartPalm) / handSize(L);
            if (heldMs >= 60 && heldMs <= CLICK_MAX_MS && Math.max(moved, grabMaxDistance) <= CLICK_MAX_DIST) {
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
        evs.push({ type: 'pose', aperture: fanRatio(L), posture: 'open' });
        const dev = fanRatio(L) - FAN_NEUTRAL;
        if (Math.abs(dev) > FAN_DEADZONE) {
          evs.push({ type: 'fan', rate: dev > 0 ? dev - FAN_DEADZONE : dev + FAN_DEADZONE });
        }

        const pc = palmCentre(L);
        swipeTrail.push({ t, x: pc.x });
        // the window is a time window, and it keeps the sample that has just
        // fallen out of it as the oldest one, so a displacement is always
        // measured over the full window rather than over whatever is left
        while (swipeTrail.length > 2 && t - swipeTrail[1].t > SWIPE_WINDOW) swipeTrail.shift();
        const oldest = swipeTrail[0];
        // screen space, not raw landmark space, and this is the only place
        // the flip happens: see the comment on SWIPE_DIST above for why it is
        // not optional
        const hs = handSize(L);
        const net = -(pc.x - oldest.x) / hs;
        // the largest single interval in the window, which is how a tracking
        // jump is told apart from a hand actually travelling
        let jump = 0;
        for (let i = 1; i < swipeTrail.length; i++) {
          jump = Math.max(jump, Math.abs(swipeTrail[i].x - swipeTrail[i - 1].x) / hs);
        }
        const dir = net > 0 ? 1 : -1;
        // outward for THIS hand: rightward (+1) for a hand labelled Right,
        // leftward (-1) for one labelled Left, either direction for a hand
        // with no handedness reported at all
        const wantDir = primary.handedness === 'Right' ? 1 : primary.handedness === 'Left' ? -1 : 0;
        const outward = wantDir === 0 || dir === wantDir;
        if (swipeFired) {
          if (Math.abs(net) < SWIPE_REARM) swipeFired = false;
        } else if (swipeTrail.length >= SWIPE_MIN_SAMPLES
                   && t - oldest.t <= SWIPE_WINDOW
                   && Math.abs(net) >= SWIPE_DIST
                   && jump <= SWIPE_MAX_JUMP * Math.abs(net)
                   && outward) {
          swipeFired = true;
          evs.push({ type: 'dismiss' });
        }
      } else {
        evs.push({ type: 'pose', posture: fisted ? 'rest' : 'pinch', aperture: null });
        swipeTrail = []; swipeFired = false;
      }

      return evs;
    },
  };
}
