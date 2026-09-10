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

/* PINCH: thumb and index tip coming together, over hand size.

   PINCH_OFF WAS 1.00 AND THAT IS WHY NO PAGE COULD BE OPENED. The first band
   came from the reference clip, where closed frames sit at 0.04-0.42 and open
   frames at 1.18-1.56, so 1.00 looked like the middle of an empty gap. But
   that clip holds only three long deliberate holds. On the calibration clip
   (qa-fixtures/hand-calibration-2026-09-09.json), which holds five deliberate
   TAPS, the hand between two taps reads a median of 0.88, a third quartile of
   0.95 and a maximum of 1.11: it RELAXES between taps, it does not open. So
   the release threshold was above almost everything the hand does, one tap
   armed the grab, and it never let go: five taps came out as two pinch
   episodes, the second of them 3.1 seconds long, with the world believing it
   was being dragged the whole time.

   0.30 and 0.70, measured on that clip. His deliberate taps close to 0.16
   and his drags to 0.08; between taps the hand sits at 0.74 and above, clear
   of 0.70, so every tap releases, and the hysteresis band stays wide enough
   that a grab cannot flicker.

   ARMING IS TIGHT, 0.30 AND NOT 0.45, and that number is the answer to a
   question he asked: is a fist not the rest position? To this camera, in two
   dimensions, HIS FIST AND HIS PINCH ARE THE SAME PICTURE -- thumb to index
   reads a median of 0.26 in his fist take against 0.16 in his taps, and the
   index curls to 0.85 in both. Nothing separates them, so keeping a clenched
   fist as a rest and accepting the pinch he actually makes cannot both be
   had. What CAN be had, and is what 0.30 buys, is that a hand which is merely
   RELAXED is never a pinch: across the 204 frames of his brush take, where
   the hand is loose and half closed, thumb to index never once goes under
   0.35. So the rest position is the relaxed hand, or the hand out of frame,
   and a deliberately clenched fist counts as a pinch. Moving that number back
   to 0.45 restores the old behaviour if he prefers the fist. */
export const PINCH_ON = 0.30, PINCH_OFF = 0.70; // thumb to index, over hand size

/* A PINCH KEEPS THE OTHER FINGERS APART, and that is what tells one from a
   flat hand with the fingers closed. Closing the fingers brings the thumb in
   with them: on the calibration clip that gesture reads a thumb-to-index
   median of 0.29, deep inside the pinch band, so the world read it as a grab
   and suppressed the zoom for 76 of its 139 frames -- "je referme la main, ca
   ne dezoome pas". The two are cleanly separated by the aperture, index tip
   to pinky tip over hand size, on the frames where thumb and index are
   closed:
     a real pinch, tap and drag together: 0.53 to 0.91, p10 0.63, median 0.73
     the fingers closed together:         0.10 to 0.59, p90 0.50, median 0.38
   PINCH_FAN_MIN sits at 0.62, between those two. It gates ARMING only, and
   never the release: a drag that curls up on its way across the chart would
   otherwise drop the map halfway. */
export const PINCH_FAN_MIN = 0.62;

/* A CLOSED HAND CAN PINCH, BUT A FIST STILL RESTS. The owner asked for the
   first ("j'ai tendance a vouloir pincer avec le pouce et l'index en gardant
   les autres 3 doigts du poing fermes") and refused the second being given up
   ("non je ne veux pas ca", about a fist that opens counting as a click). Both
   are possible, but only through the index's own reach: a ring keeps the index
   out, a fist rolls it in.
   PINCH_INDEX_REACH sits at 0.58, between a fist's 0.54 and his tightest tap's
   0.61. It is consulted ONLY when the hand reads as a fist: an open hand that
   pinches is not asked to prove anything. PINCH_RING_FRAMES = 2 kills the
   three transition frames of a fist on its way open that do clear 0.58: a
   held ring passes it in 86ms at his frame rate, a hand passing through does
   not hold anything. */
export const PINCH_INDEX_REACH = 0.58, PINCH_RING_FRAMES = 2;

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
/* THE DEAD MAN'S SWITCH, and it has to follow the camera rather than a
   number. 150ms was chosen against a 30fps camera, where it is four and a
   half frames. The owner's camera runs at 23 fps on a light page, 43ms a
   frame, and the world is a good deal heavier than a light page: at 12 fps
   150ms is under two frames, so ordinary jitter reads as a hand that has
   gone. Every gesture then ends as an absence instead of a release, which
   evaluates no click and clears the swipe's trail -- which is exactly what
   "le pinch ne marche toujours pas" and "le balayage ne fonctionne pas" look
   like from the inside.
   So it is three times the interval the camera is actually delivering, and
   never less than 300ms. */
const LOST_MS_MIN = 300, LOST_FRAMES = 3;

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

/* A PINCH THAT DOES NOT TRAVEL IS A CLICK, and how long it lasts has nothing
   to do with it.

   THE FIRST VERSION ASKED FOR 400ms, and the owner could not open a single
   page with it: "je n'arrive toujours pas a pinch pour selectionner une
   page". That number came from the platform convention for a tap against a
   long-press, which iOS and Android both draw at 500ms -- a convention about
   a FINGER ON GLASS, where the finger arrives, touches and leaves in one
   motion. A hand pinching in the air is nothing like that: it closes, holds
   while the person checks that something happened, and opens. Half a second
   is a quick pinch by that standard. The fixture could not have caught this,
   as it was written: it holds no deliberate tap at all, so the one threshold
   in this file that gates the most ordinary act in the vocabulary was the
   one derived from a convention instead of from him. That is the same
   mistake as the swipe's, in a different unit.

   SO THE RULE IS THE MOUSE'S RULE. A mouse click is a press and a release
   without travel in between, at any speed: what separates a click from a
   drag is whether the pointer MOVED, not how long the button was down. The
   excursion test already does exactly that job, and it does it over the
   whole pinch rather than at its end, so a pinch that wanders and comes back
   is a drag and not a tap.

   CLICK_MAX_DIST IS MEASURED, and generously. The one incidental still pinch
   in the fixture moves the palm at most 0.0224 of hand size across its whole
   667ms, while the two genuine drag holds accumulate 0.73 and 1.06. Nothing
   the clip contains lands between 0.03 and 0.73, so 0.25 sits ten times over
   the still hand's own jitter -- room for a real hand's tremor while it
   holds -- and still three times under the smallest movement that was
   actually a drag.

   CLICK_MIN_MS stays, at 60ms, and it is not about the gesture: it is about
   the tracker. A pinch that appears and vanishes inside a frame or two is a
   landmark estimate wobbling, not a hand, and it must not open a page. */
export const CLICK_MIN_MS = 60, CLICK_MAX_DIST = 0.25;

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
export const SWIPE_DIST = 0.6, SWIPE_WINDOW = 0.25, SWIPE_MIN_SAMPLES = 3,
  SWIPE_REARM = 0.2;

const HAND_VOTES = 8;                         // about a third of a second at 23 fps
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function votedHand(votes) {
  if (!votes.length) return null;
  let right = 0;
  for (const v of votes) if (v === 'Right') right++;
  if (right * 2 === votes.length) return null;   // a real tie is not a hand
  return right * 2 > votes.length ? 'Right' : 'Left';
}

function handSize(L) {
  // rigid, always visible, and unaffected by which fingers are curled
  return Math.max(1e-6, dist(L[LM.WRIST], L[LM.MIDDLE_MCP]));
}
function pinchRatio(L) {
  return dist(L[LM.THUMB_TIP], L[LM.INDEX_TIP]) / handSize(L);
}
/* THE INDEX'S OWN REACH: its tip to its OWN knuckle, over hand size. This is
   what tells a thumb-index RING held in front of closed fingers from a fist,
   and it is the measure that was missing while those two looked identical.
   Index-tip-to-WRIST cannot do it -- 0.85 in both -- because a bent index
   reaching for the thumb ends up about as far from the wrist as a rolled one.
   Locally it is a different story: a fist rolls the index tip back onto its
   own knuckle, a ring keeps it out.
   Measured. A clenched fist: 0.20 to 0.54 across 69 of its 72 curled frames.
   His deliberate taps: 0.61 to 0.69, all 15 of them. His drag holds: 0.40 to
   0.68. The three fist frames that do reach past the threshold are the
   transition, the hand on its way open, which is why arming while fisted also
   asks for the ring to be HELD (see PINCH_RING_FRAMES). */
function indexReach(L) {
  return dist(L[LM.INDEX_TIP], L[LM.INDEX_MCP]) / handSize(L);
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
  let swipeTrail = [], swipeFired = false, swipePending = false;
  /* HANDEDNESS IS VOTED ON, NOT READ. The dismiss direction depends on which
     hand it is, so a single misread label refuses the gesture outright. On the
     calibration clip the landmarker calls this hand Right 1172 times and Left
     27 times, and it flips six times -- during the fast movements, which is
     exactly when a brush is being performed. So the last HAND_VOTES readings
     decide, by majority: at 23 fps that is about a third of a second, long
     enough that one stray frame cannot invert the gesture and short enough to
     follow a real change of hand. */
  let handVotes = [];
  // consecutive frames of a held thumb-index ring, which is what a fisted
  // hand has to show before it may arm a pinch
  let ringFrames = 0;
  /* what the camera is actually delivering, in seconds between frames, most
     recent last. Everything with a time in it is scaled by this. */
  let gaps = [], lastFrameT = null;
  const frameGap = () => {
    if (gaps.length < 3) return 0.043;             // 23 fps until proven otherwise
    const s2 = [...gaps].sort((a, b) => a - b);
    return s2[Math.floor(s2.length / 2)];
  };
  const lostMs = () => Math.max(LOST_MS_MIN, frameGap() * 1000 * LOST_FRAMES);

  return {
    state: () => ({ present, pinched, fisted, fps: frameGap() > 0 ? 1 / frameGap() : 0 }),
    read(frame, t) {
      const evs = [];
      const hands = (frame && frame.hands) || [];

      if (hands.length === 0) {
        if (lastSeen !== null && (t - lastSeen) * 1000 >= lostMs()) {
          // the dead man's switch: never strand the world holding something
          if (pinched) { pinched = false; evs.push({ type: 'release', hand: null }); }
          if (fisted) fisted = false;
          if (present) { present = false; evs.push({ type: 'absent' }); }
          grabStartT = null; grabStartPalm = null;
          swipeTrail = []; swipeFired = false; swipePending = false; handVotes = []; ringFrames = 0;
        }
        return evs;
      }
      if (lastFrameT !== null && t > lastFrameT && t - lastFrameT < 1) {
        gaps.push(t - lastFrameT);
        if (gaps.length > 24) gaps.shift();
      }
      lastFrameT = t;
      lastSeen = t;
      if (!present) { present = true; evs.push({ type: 'present' }); }

      const primary = hands[0];
      const L = primary.landmarks;
      if (primary.handedness) {
        handVotes.push(primary.handedness);
        if (handVotes.length > HAND_VOTES) handVotes.shift();
      }
      const handed = votedHand(handVotes);
      const pr = pinchRatio(L);
      const fc = fistCurl(L);
      if (pinched && grabStartPalm) {
        grabMaxDistance = Math.max(grabMaxDistance, dist(palmCentre(L), grabStartPalm) / handSize(L));
      }

      /* A CLOSED HAND CAN PINCH, and the fist stops being able to veto it.
         "j'ai tendance a vouloir pincer avec le pouce et l'index en gardant
         les autres 3 doigts du poing fermes": that is how he pinches, and it
         was the one shape the recogniser refused. It refused it twice over --
         the fist detector claimed the hand first and forced a release, and
         the aperture gate added yesterday asked the other fingers to stay
         apart -- so his pinch only ever armed if the hand happened to drift
         open while he held it, which is exactly the "hold for a second or two
         and release" he had to learn.

         MEASURED, AND THE MEASUREMENT IS WHY THIS IS NOT A SEPARATION. On the
         reference clip, the frames where thumb and index are closed with the
         other three curled read an index curl of 0.84 to 0.89 -- the same
         0.86 to 1.02 a real fist reads on the calibration clip. In two
         dimensions, at this frame rate, a thumb-index ring held in front of
         curled fingers and a fist are the same picture. So there is nothing to
         tell apart, and the choice is which of the two gestures to keep.

         His pinch wins, because the fist never had an action: nothing listens
         for `lock`, and its detection existed only to stop a closing hand
         from reading as a grab -- the very thing he wants it to read as. The
         cost, stated plainly: a hand that closes into a fist in front of an
         armed camera and opens again without travelling now opens a page. The
         rest position is the hand out of frame, which the dead man's switch
         already handles.

         `fisted` still exists, and still suppresses the aperture, so a
         closing hand cannot also spin the zoom. */
      if (!fisted && fc < FIST_ON) {
        fisted = true;
        evs.push({ type: 'lock', hand: primary.handedness });
      } else if (fisted && fc > FIST_OFF) {
        fisted = false;
      }

      {
        /* THE ONE SHAPE THAT IS NOT A PINCH: the fingers held straight and
           joined, which is his zoom-out gesture and brings the thumb in with
           them. That one IS separable, and on the aperture rather than on the
           thumb: with the fingers extended (fist curl over FIST_ON) and the
           tips gathered (aperture under PINCH_FAN_MIN), the hand is a flat
           closed hand and not a ring. Measured on the calibration clip:
           fingers joined read a fist curl of 1.29 to 1.54 with an aperture of
           0.24 to 0.50, while every real pinch of his -- open-handed or
           curled -- either spreads the aperture past 0.6 or curls the fingers
           under FIST_ON. It gates ARMING only: a pinch that changes shape
           while it drags keeps holding. */
        const together = fc > FIST_ON && fanRatio(L) < PINCH_FAN_MIN;
        // a held ring: thumb and index closed with the index still reaching,
        // which is the only thing that tells his closed-hand pinch from a fist
        if (pr < PINCH_ON && indexReach(L) > PINCH_INDEX_REACH) ringFrames++;
        else ringFrames = 0;
        const mayArm = !fisted || ringFrames >= PINCH_RING_FRAMES;
        if (!pinched && pr < PINCH_ON && !together && mayArm) {
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
            const travel = Math.max(moved, grabMaxDistance);
            // the reason is reported either way: a pinch that is not read as
            // a click is the single most confusing thing this vocabulary can
            // do, and the panel says which of the two tests refused it
            if (heldMs >= CLICK_MIN_MS && travel <= CLICK_MAX_DIST) {
              evs.push({ type: 'click', heldMs, travel });
            } else {
              evs.push({ type: 'noclick', heldMs, travel,
                         why: heldMs < CLICK_MIN_MS ? 'too brief' : 'the hand travelled' });
            }
          }
          grabStartT = null; grabStartPalm = null;
          evs.push({ type: 'release', hand: primary.handedness });
        }
      }

      // THE APERTURE, which zoom reads, only on a hand that is genuinely
      // open this frame: dragging or fisting must never also spin the zoom.
      if (!fisted && !pinched) {
        // the pose carries the raw palm and hand size as well as the
        // aperture, because whoever turns an aperture into zoom has to know
        // whether the HAND was moving while the fingers were: see the zoom
        // gate in hands.js
        evs.push({ type: 'pose', posture: 'open', aperture: fanRatio(L),
                   size: handSize(L), palm: palmCentre(L) });
        const dev = fanRatio(L) - FAN_NEUTRAL;
        if (Math.abs(dev) > FAN_DEADZONE) {
          evs.push({ type: 'fan', rate: dev > 0 ? dev - FAN_DEADZONE : dev + FAN_DEADZONE });
        }
      } else {
        evs.push({ type: 'pose', posture: fisted ? 'rest' : 'pinch', aperture: null });
      }

      /* THE SWIPE RUNS ON ANY HAND THAT IS NOT A FIST, pinched or not, and
         that is measured rather than relaxed on principle. On the calibration
         clip the owner's brushing hand reads thumb-to-index at a median of
         0.56, dipping under the arming threshold: he brushes with a RELAXED
         hand, thumb near the index, not a flat open one. With the swipe gated
         on an unpinched hand, 80 of that take's frames were invisible to it
         and not one brush fired.
         What separates a brush from a drag is not the shape of the hand, it
         is the speed. His brushes cover up to 1.47 hand widths in 214ms; his
         drags cover 1.00 in 1.9 to 4.0 SECONDS, twenty times slower. The
         displacement rule below already tells those apart by a factor of
         five, so it does the discriminating, and the hand is allowed to be
         however he holds it.
         AND A FIST DOES NOT STOP IT EITHER, which it did until his third
         test: on the calibration clip his brushing hand reads a fist curl
         down to 0.85, so part of every brush was claimed by the fist detector
         and the swipe went silent for those frames. He brushes with a relaxed
         hand and a relaxed hand is a half-closed one. The displacement is the
         whole of the test now. */
      /* AND NOT WHILE PINCHING: a pinched hand is dragging, and a drag that
         wanders up the screen would otherwise scroll a page as well as move
         the chart. His brushing hand is never pinched now that arming asks
         for 0.30 (measured: it never goes under 0.35), so this costs the
         gesture nothing. */
      if (!pinched) {
        const pc = palmCentre(L);
        swipeTrail.push({ t, x: pc.x, y: pc.y });
        /* trimmed to samples strictly INSIDE the window. An earlier version
           kept the one that had just fallen out of it, so that a displacement
           was always measured over the full window, and then asked the span
           to be within the window as well: the two cannot both hold. At 23
           fps, the frame rate the calibration clip was actually taken at, the
           extra sample put every span at 254 to 267ms against a 250ms window
           and the rule refused every single brush the owner performed. */
        while (swipeTrail.length > 1 && t - swipeTrail[0].t > SWIPE_WINDOW) swipeTrail.shift();
        const oldest = swipeTrail[0];
        // screen space, not raw landmark space, and this is the only place
        // the flip happens: see the comment on SWIPE_DIST above for why it is
        // not optional
        const hs = handSize(L);
        /* THE SWEEP HAS TWO AXES NOW. Sideways is the brush that dismisses;
           up and down is what he asked for to read a page: "j'aimerais
           pouvoir scroller sur la page en deplacant la main vers le haut et
           le bas de facon repetee". One gesture, one dominant axis: whichever
           of the two displacements is larger decides which it was, so a brush
           cannot also scroll and a scroll cannot also dismiss. y is not
           mirrored, only x is. */
        const netX = -(pc.x - oldest.x) / hs;
        const netY = (pc.y - oldest.y) / hs;
        const horizontal = Math.abs(netX) >= Math.abs(netY);
        const net = horizontal ? netX : netY;
        const dir = net > 0 ? 1 : -1;
        /* NO REVERSAL INSIDE THE WINDOW. A hand travelling covers its
           distance without changing its mind; a hand waving about, or a
           tracker that jumps and comes back, does not. This replaced a guard
           that asked no single interval to carry more than three quarters of
           the net, which was written against a tracker glitch at 30 fps and
           refused real gestures at 23: the owner's brush covers 1.43 hand
           widths of which one 43ms frame carries 1.27, because that is what a
           fast hand looks like when the camera only sees it three times. */
        let reversed = false;
        for (let i = 1; i < swipeTrail.length; i++) {
          const step = horizontal
            ? -(swipeTrail[i].x - swipeTrail[i - 1].x) / hs
            : (swipeTrail[i].y - swipeTrail[i - 1].y) / hs;
          if (step * dir < -SWIPE_REARM) { reversed = true; break; }
        }
        // outward for THIS hand: rightward (+1) for a hand labelled Right,
        // leftward (-1) for one labelled Left, either direction for a hand
        // with no handedness reported at all
        const wantDir = handed === 'Right' ? 1 : handed === 'Left' ? -1 : 0;
        const outward = wantDir === 0 || dir === wantDir;
        /* ONE FRAME OF CONFIRMATION. A hand being taken OUT of the picture
           sweeps sideways exactly like a brush, and on the calibration clip
           the take that does that twice fired two dismisses. So a qualifying
           window arms the gesture and the NEXT frame that still shows a hand
           fires it: a hand that is gone by then was leaving, not brushing.
           The cost is one frame, 43ms at the rate his camera runs. */
        if (swipeFired) {
          if (Math.abs(net) < SWIPE_REARM) swipeFired = false;
        } else if (swipePending) {
          const which = swipePending;
          swipePending = false; swipeFired = true;
          /* a sideways brush MEANS nothing here, and neither does a vertical
             sweep: gestures.js recognises, and whoever is listening decides
             (today: the arming dialog reads a brush as decline, and the
             reader reads one as close and a sweep as scroll) */
          if (which === 'x') evs.push({ type: 'dismiss' });
          else evs.push({ type: 'sweep', dir: which === 'down' ? 'down' : 'up' });
        } else if (swipeTrail.length >= SWIPE_MIN_SAMPLES
                   && Math.abs(net) >= SWIPE_DIST
                   && !reversed
                   && (horizontal ? outward : true)) {
          // up and down are both meaningful, so the vertical axis has no
          // outward direction to respect: only the sideways one does
          swipePending = horizontal ? 'x' : (dir > 0 ? 'down' : 'up');
        }
      } else {
        swipeTrail = []; swipeFired = false; swipePending = false;
      }

      return evs;
    },
  };
}
