# Design Lab · ideas and open feedback

Every piece of feedback the owner has given that has not been acted on yet. This file is the single
answer to "what is left to do": when he asks, read this, not a memory and not a transcript.

Tick a box when the work is done AND pushed, then move the line down to **Archives** at the
foot of this file, keeping the section it came from. The working list above stays short that way.

Last updated 2026-09-09.

## Across the lab

- [ ] **FIRST LIGHT is the only world with no way back to the Design Lab.** Every other world has
  one. Not a regression: it never had one at any point in its history.
  Settled by LOOKING at the rendered page, after four grep-based answers that each contradicted the
  last and all of which the owner corrected. Recorded because the method failure is the useful part:
  every grep was a narrow proxy for the question. Searching `index.html` missed the worlds that
  draw their interface in JavaScript; searching for the words "design lab" missed any world whose
  way home is worded in its own idiom; searching for a link to `../` produced a FALSE POSITIVE on
  FIRST LIGHT, because its crossings point at `../longway/` and the like. Loading the page and
  asking the DOM for visible links answered it in one go: none.
  When building it, match FIRST LIGHT's own idiom, and keep it discreet enough that it does not
  hint at the crossings, which stay easter eggs.

## FIRST LIGHT

- [ ] **The cold open's sub-prompt is printed on top of the mission log.** Seen on FIRST LIGHT's own
  gallery card, at 1200 by 750: "FIRST SURVEY TARGET - BEGIN HERE - URS-043..." and "TRAINS ARRIVING
  - CLICK THE BEACON - OR PRESS / TO SEARCH" are drawn over two lines of the log panel, both
  unreadable. The changelog records the same collision being fixed once by bringing the log panel's
  cap down from 184px to 138px, so this is that fix not holding at a shorter viewport rather than a
  new fault. Measure at several heights and make the two boxes exclude each other instead of
  agreeing at one size.

## FIRST LIGHT, hand control

- [ ] **Re-test the whole vocabulary with your own hand.** WAITING ON HIM, and it is the only thing
  left on this feature. Six causes have been found and fixed since he last touched it, five of them
  measured off his own calibration clip rather than reasoned about, and the two that had been
  reasoned about turned out to be wrong. Nothing is left to guess: what remains is whether it FEELS
  right, which no probe can answer. If it does not, the dials are ZOOM_GAIN in firstlight.js (2.4,
  one unhurried open of the hand covers the world's whole zoom range), the aperture dead zone in
  hands.js (0.025), SWIPE_DIST in gestures.js (0.6 of a hand width in 0.25s, against his own
  weakest deliberate brush at 0.82), and the drag gain.

**The lesson, and it is the twelfth of the day.** Every test asserts that a positive deviation
produces a positive rate, which is self-consistent whichever way the physical gesture actually maps.
A sign inversion is invisible to a suite that only checks its own convention against itself. The
same blindness explains the swipe: the tests prove the threshold rejects ordinary motion, and
nothing anywhere proves a real gesture passes it. **Both faults are the same shape: no test
connects the code's convention to a human's actual movement.** The fixture can only fix that if it
contains the gestures, so the next reference clip must include a deliberate swipe, a deliberate
fan open and a deliberate fan close, each named and timed.
**2026-09-09, half answered.** Both faults are fixed and both now have tests that connect the code
to a movement: a synthetic deliberate swipe at four frame rates and on jittered frames, and an
aperture sweep driven through the real pipeline from a fake camera to the camera target. Synthetic
is not the same as his hand, so the clip is still worth recording, and it is the only way to settle
the two items left open above.


Stage 1 shipped on `repo/experimental-design-firstlight` and the owner tested it. The gesture
vocabulary is being revised from that test. Decisions taken 2026-09-08, in his words where they
were his:

## The Golden Shore

- [ ] **The weather is a fixed script, and it should not be.** Four states exist and are good (`clear`, `sirocco`, `squall`, `mist`), but `stateAt()` runs the same ten-minute reel every visit in the same order at the same seconds: mist only on a 40 percent arrival coin, clear to 300 s, sirocco to 396, clear to 424, squall to 540, clear after. Asked 2026-09-08: make it genuinely varied, so it is not always windy, sometimes rains, sometimes storms, sometimes fogs. **No snow, it is a beach.** Two pieces: give the sequence real variability (weighted choice with sensible transitions and durations rather than a fixed reel), and add a proper thunderstorm, since `squall` is rain and wind with no lightning and no thunder. Any state can be previewed today with `?wx=clear|sirocco|squall|mist`.

- [ ] **The footsteps are better but not what he had in mind.** Second build shipped 2026-09-08 (commit 6bbabf8ae): impacts instead of filtered puffs, nine grounds separated by grain count, loudness spread 1.35:1, `workbench/qa/measure-steps.js` asserts all three. His verdict: "ce n'est pas exactement ce que j'avais en tête mais implémente déjà ça, on améliorera ensuite". Ask what he had in mind before touching it again.

The newest world and the least worn in, so most of this is world craft rather than polish.

- [ ] Check the other five crossings for the same fault: an easter egg standing where you cannot miss it.
- [ ] A full discoverability pass on this world's crossings, since they must stay easter eggs.
- [ ] Finish the province ground wave. Round 1 is complete on disk with its backup served side by side; the run was killed.

## Pixel Docs City



## The Herbarium

Both of these are an explicit new request and therefore override the standing "never touch the
Herbarium" ruling. Nothing else in that world moves on the same pass.


## Carta Strapiana

- [ ] Build the two deeper rungs, VI THE THRESHOLD and VII THE FOOTPATH, with per-island drawn landscapes. Plates validated; rung VII must be an engraved perspective scene, never a photograph. The wave script is amended and has never been launched.

## The Four-Color


- [x] The phantom battery's two failures. (2026-09-07: neither was a defect. ENTER ran after a tap that had already navigated; and the tap check demanded the law the owner replaced when he asked that clickable things stay clickable in guided view. Re-cut, five checks pass.)
## The Long Way Through

- [ ] **The signposts are drawn to a fixed size and the text runs off them.** Reported 2026-09-09
  with a shot: a board on the trail carries a label whose characters cross its right edge and hang
  in the air past the frame. The board has to be sized to its content instead, wrapping onto two
  lines or three when the label needs them, and the post, the shadow and the hit box have to follow
  the board rather than assume its old size. Check the longest labels in the corpus, not the one in
  the shot: page titles run to well over sixty characters.

## The Long Way Through


## Across the worlds

See the three itemised idea lists at the end of this file.

## Small and undecided


# The three ten-idea lists

Proposed and approved in full ("j'aimerais que tu implementes TOUTES ces idees"), never built. Each
was written as one binding condition of a wave, so each is buildable on its own; ticking them one at
a time is fine. Every one of them must hold the world's existing laws: nothing gates the reading,
one label at a time, and no regression.

## The Golden Shore

- [ ] **The Design Lab portal is a local dev server, not a page in the repo.** `workbench/qa/livepreview.js` generates the gallery at localhost:8787 and is now tracked, but nothing in `docusaurus/static/` serves it. If the lab is ever to be shown at a URL, that page has to be written.

## The Long Way Through

- [ ] **The gorge echo.** Where the real relief forms a gorge, the whistle returns an echo, delayed by the width and pitch-shifted.
- [ ] **The migrations.** Small flocks cross the sky toward sections updated in the last 30 real days, from git truth, occasionally and never busy.
- [ ] **The bench postcards.** Sitting at a bench or picnic table offers WRITE A POSTCARD: a crisp canvas-composed postcard of the current vista.
- [ ] **The kiosk radio.** Sheltering at the kiosk while it rains reveals a radio; turning it on plays the rendered stems from `listening/stems`, one at a time.
- [ ] **The dog learns tricks.** At real milestones of pages read this visit (5, 15, 30, 60) she learns a trick, announced quietly and listed in the Key.
- [ ] **The engraved keepers.** Each 10,000-word waymarker gains one engraved line naming the top real committer of that stretch, from git provenance.
- [ ] **The long shadow.** At dusk only, the walker's shadow stretches ahead and its tip leans toward the next unread page in walking order. Subtle, never a pointer.
- [ ] **Today on the trail.** A Key sub-page listing the real on-this-day commits: who tended what, years ago today.

## FIRST LIGHT

- [ ] **The mission log.** Every page read files a transmission entry, with the real visit timestamp, into a memory bank that visibly fills.
- [ ] **Signal decay and relays.** Bodies with nought to two inbound citations arrive through static, visual and audible, in proportion to their obscurity.
- [ ] **The burn.** Travel between systems becomes a manoeuvre: thrust, drift, flip, retro-burn with a doppler hum, on one held key, the arrival always framed.
- [ ] **Spectrography.** Scanning a body before landing shows its composition spectrum from the real block census: code, tables, images, admonitions.
- [ ] **The dark side.** Bodies rotate slowly; landing on the night side stages the approach under the lander's floodlight cone. The reading itself stays lit.
- [ ] **Solar weather.** Flares derived from the real recent commit history wash the system with brief aurora and briefly extend scan range.
- [ ] **The derelicts.** Pages with zero inbound citations drift as silent derelict stations; docking one powers it back on.
- [ ] **The constellations.** Completing every page of an official section draws that section's constellation on the map, its bodies joined in thin engraved lines.
- [ ] **The long ping.** One key pings; every unvisited body in range answers in order of distance, pitch mapped to its word count.
- [ ] **The probe ages.** Hull patina and antenna wear accumulate with real distance travelled this visit, inspectable close up at the mission hub.

## The Herbarium

- [x] A real opening animation for the envelope. (2026-09-07: three movements, flap, drawn out clipped from inside, then unfolded flat from 83 degrees; measured through the movement, reduced motion exempt.)
- [x] Fold The Golden Shore into Appendix I with the others. (2026-09-07: Appendix II retired, grid three and three, prose and field notes follow.)
- [x] The appendix has to be OPENED: an envelope revealing the sheet. (2026-09-07: laid paper, a flap on its own fold, a wax seal; a real button with aria-expanded, and the plate is out of the document until it opens.)
- [x] The five-pixel night flake. (2026-09-07: one named tolerance of 8 pixels at delta 32 on that assertion only; the strictly-additive law and the other four views keep zero.)
Note: these predate the envelope idea above, and the two should be designed together.

- [ ] **The seasons of the garden.** Each specimen's bloom state follows its real freshness: tended recently in flower, long untended gone to seed.
- [ ] **The pressing bench.** Any specimen can be PRESSED into a botanical plate, a crisp canvas-composed image with the drawn specimen and its real provenance.
- [ ] **The pollinators.** A few bees travel the real citation edges between specimens, traffic proportional to edge weight, never more than a handful on screen.
- [ ] **The gardener's rounds.** A watering-can care act: watering a specimen marks it into MY BEDS, a personal page of kept specimens with their dates.
- [ ] **The greenhouse of hybrids.** The real CMS-to-Cloud cross citations grow as grafted hybrids in a small annex, each labelled with both parents.
- [ ] **The Latin binomials.** Each specimen gains a period binomial derived deterministically from its taxonomy and slug, openly a flourish of the fiction.
- [ ] **The loupe.** Hovering with the loupe reveals micro-detail from the real block census: code veins in the leaves, table lattices in the petals.
- [ ] **The seed exchange.** Leaving through a portal hands you a seed packet named for the destination; returning later plants a souvenir specimen.
- [ ] **The sound of the garden.** A hush bed, gentle by default and really toggleable: paper rustle on page turns, distant rain on the greenhouse glass.
- [ ] **The card catalog.** Search gains the body of an old card-catalog drawer: typed index cards with real metadata, pulled out and read.

# Archives

Done and pushed. Kept for the record, and so a rollback knows what it is undoing.

## Pixel Docs City

- [x] The gallery card showed a mid-game view with popups. (2026-09-07: the thumbnailer now frames the whole island on arrival, plain afternoon, nothing over it; recipe kept in workbench/qa/.)
- [x] The funnies and the botanist's stall stood too close to the landing. (2026-09-07: 11.1 and 5.8 tiles from spawn became 28.6 and 23.6; place2x2 learned the extra predicate place1 had.)
- [x] The door prompts disagreed on case: the descriptive line under the title was sentence case on the sloop and capitals on the other five. (2026-09-07: all five follow the sloop now, case only, titles still capitals.)
- [x] Move the way to The Golden Shore to the EDGE OF THE MAP, not far from the boat that leads to Carta Strapiana. (2026-09-07: the lamplighter's yard now places after the harbour is measured and is constrained by proximity to the mooring, landing 9.4 tiles from the sloop.)

## The Golden Shore

- [x] Introduce collisions. (2026-09-07, commit f32aa4d0f: the fences got colliders and the resolver stopped skipping. The complaint read as walls; measuring showed the walls already held and it was the fences that had none.)
- [x] Add SPACE to jump. (2026-09-07, commit b4ac996a4: it clears exactly what it should and no more; collider heights were set so a fence is vaultable and a wall is not.)
- [x] The rain sounds metallic. (2026-09-07, commit 36cf8845e: the comb filter was the metal. A comb is a plate resonator, so rain through one is rain on a roof of tin; rebuilt without it.)
- [x] Wind and waves were one sound. (2026-09-07, commit 62077002a: the surf became brown noise against the wind, and it now fades with distance from the water instead of following you inland.)

## The Golden Shore

- [x] The post-processing chain. (2026-09-08: yesterday's "it washes the colour out" was wrong, and wrong because the two frames compared came from two page loads of a world whose sun moves. A/B'd on one page with the sun frozen it is 7% brighter, 9% warmer, 7% less saturated everywhere, which is highlights kept in half float rather than clipped into an 8-bit canvas. Cost settled it instead: bloom 2.2 ms, ambient occlusion 7.2, the bare round trip 7.1 at retina. Ships as bloom only, and only under a 1.5 pixel ratio. Two real defects found on the way: the composer target had no multisampling while the canvas has MSAA, and canvas readback returns black off WebGL.)

## Across the lab

- [x] The Design Lab's own favicon. (2026-09-08: the portal is `workbench/qa/livepreview.js` serving localhost:8787, not a page in the repo, so it had no head to put an icon in and no route to serve one. It now serves /favicon.svg from the chosen file on the workbench, so the drawing keeps one source of truth, and links it from all three pages it writes: the gallery, the holding page and the GPU check. The script itself was untracked and disposable; it is in the repo now.)
, three proposals per subject. (2026-09-08: 24 marks, each in its own world's real palette read out of its own source. Judged at sixteen pixels in a tab, not on a plate; six failed that and were redrawn. Pierre chose eight; the seven worlds are installed and pushed, the lab's overprint waits for a portal to exist.)

## The Long Way Through

- [x] The night lantern. (2026-09-08: she really carries it. drawFigure reports where the leading hand ended up, so a bail, a dark frame, lit horn behind two astragals, a cap, a ring and a flame hang from the fist and swing with the arm. Sized a fifth of her height on purpose: true proportion on a 57-pixel figure is seven pixels and reads as nothing.)
- [x] The memory cairns. (2026-09-08: a door onto a page read on an earlier day gets four flat stones on a dated kerb slab. PACK.visited had to stop storing a plain 1 and start storing the local day; older saves keep working and raise nothing. They stand at the citation doors, not at the province portal, which draws only for the staged page ahead: 120 over a 2,500 m walk.)

## Carta Strapiana

- [x] Under reduced motion the ship closed no distance. (2026-09-07: the hull is frozen by design and travel goes by passage, but the knots kept climbing, so the log reported way she was not making. She reads zero now; a passage still closes 1.6 nm to 1.2 in three seconds.)
- [x] `qa/probe-s4-prefix.js` fails on `islands === 290` when the build has 288. Stale probe. (2026-09-07: the two release-notes pages are struck at source, so the survey holds 288; constant fixed with the reason beside it, PREFIX BOOT passes.)

## Across the worlds

- [x] The space bar disagreed across the network: four worlds let it press the focused answer, three swallowed it. (2026-09-07, owner ruled for the web convention, a focused button takes Space as a click: The Long Way Through and Carta Strapiana now honour it, probed both ways on the Long Way. THE GOLDEN SHORE IS A DELIBERATE EXCEPTION and keeps swallowing it, both because its own code argues Space is the likeliest stray press on a coast you walk, and because SPACE TO JUMP is on that world's punch list above.)
- [x] FIRST LIGHT clipped all three lines of its mission log. (2026-09-07: entries wrap now; the lock line had been losing FIRST SURVEY TARGET - BEGIN HERE and the photometer line its whole explanation. Panel cap 184 to 138px so it clears #prompt-sub. Battery ALL PASS.)
- [x] The Four-Color clipped its pocket tags, losing the issue count on the longer categories. (2026-09-07: they wrap to two lines in a slightly wider box; all sixteen measured, none clipped, none overlapping a neighbour.)
- [x] Audit text clipping across every world. (2026-09-07: swept all seven live, revealing hidden UI and measuring real overflow. Five are clean; the two that are not have their own open lines in the working list.)

## The Golden Shore

- [x] Move the boat to Carta Strapiana left and far down the beach. (2026-09-08: not a move but a redraw, since she was moored by construction. Hauled out 61 m down the shore, bow to the sea, heeled on two shores, stake and painter in the sand.)
- [x] The Four-Color stand was too visible. (2026-09-08: it stood 11 m off the harbour gate; moved to the quiet side street south of the square, 76 m from the landing and out of the gate corridor.)
- [x] Make swimming possible. (2026-09-08: the sea refused you in one line; now below 0.45 you swim, eye riding 0.30 above the surface at four tenths pace, with strokes instead of footfalls. Measured 0.37 in the sea, 3.67 back ashore.)
- [x] The Quick Start was jammed under the harbour gate. (2026-09-08: 61 m back, and the gate corridor is reserved so the grid cannot hand the arch to the next house.)
- [x] The bridge did not reach either bank. (2026-09-07: the west approach descends to 26.8 while the deck began flat at 30.4, a wall of 3.5 m; the east bank stood 1.3 above it. The span reaches back to x=182 and the deck lifts from 30.2 to 31.6, the two bank heights. Both ends meet their ground within 0.1 m.)
- [x] Restore the Quick Start as the first building after the jetty. (2026-09-07: it was pinned 54 m inland behind a dozen houses; swapped onto the nearest plot, first station at 16 m.)
- [x] The loan crate sat on the arrival jetty. (2026-09-07: moved behind the north edge of the town, 69 m from the landing, verified by collider.)
- [x] Footsteps unbelievable and not varying with the ground. (2026-09-07: the eight per-surface recipes were already there; the fault was one click per footfall on an exact stride. Heel and toe, randomised, alternating feet, jittered stride.)
- [x] Introduce collisions. (2026-09-07: measured first, he was NOT going through walls, 0.02 m worst over 1625 samples. He was going through the highland rail fences, which were drawn and never registered. Registered, plus the resolver substepped.)
- [x] SPACE to jump over an obstacle. (2026-09-07: 4.7 m/s, apex 1.11 m measured, ground only, no pogo. Colliders may carry a height; the fence at 1.05 is vaultable, buildings are not.)
- [x] The rain sounded metallic. (2026-09-07: it was noise through a comb filter with a fixed 11.5 ms delay, which is the recipe for a struck metal plate. Rebuilt as hiss, roar and separate drops.)
- [x] Wind and waves indistinguishable, and the waves should fade inland. (2026-09-07: both were white noise in neighbouring bands and the wind sat at 380 Hz where the sea lives. Sea is brown an octave lower, wind moved to 680, swell period 11-15 s. Surf halves every 18 m: 0.507 at the water, 0.000 in the pines.)
- [x] DECIDED how far the un-naming goes. (2026-09-07, owner: Pixel Docs City unchanged, the Herbarium unchanged, "les noms que tu as trouves sont parfaits"; he will flag any others as he finds them. The un-naming was a Golden Shore correction only, where the wave brief had wrongly demanded it.)
- [x] The backup labels were misleading. (2026-09-07: BACKUPS.md in that build now says which restore point is which and why one of them is not one.)
- [x] A keeper's line printed across a waymark's label at the bottom centre. (2026-09-07: the line measures the label as it speaks and stands above it; 45px of overlap before, none after.)

## The Long Way Through

- [x] The whistle sounded like a wolf whistle. (2026-09-07, two attempts: rise-peak-fall is exactly that curve. Now two short flat blasts, staccato; pitch range 2273-2484 Hz against 1460-2660-1880 before.)
- [x] Her bark was inaudible and unlike a dog. (2026-09-07, third attempt: a Wikimedia Commons recording, CC BY-SA 3.0, trimmed to one bark and credited; level doubled by arithmetic, 0.0156 to 0.0316 into the mix.)
- [x] She barks once as she settles at your feet, on top of the answer from far off.
- [x] About one bolt in five, a second thunder clap at three times the first.
- [x] Land's End is out of the Tab index. (2026-09-07: it sat at the top and gave away the end of the trail; still reached on foot, from the last page, or by #lands-end.)
- [x] Halve the music, whatever file is playing. (2026-09-07: one level at the music bus, LAYER_LEVEL mus 0.5, effects left at 1.)
- [x] The carved notice could rise behind the landing card with mouse-dead answers. (2026-09-07: the card stands aside first, without the walker pick a real dismissal opens; YES verified hit-testable.)

## FIRST LIGHT, hand control

- [x] DECIDE: the hand has two modes, and you did not ask for that. (2026-09-09: removed, on his answer, "je ne veux pas avoir a gerer 2 modes: j'elargis la main, ca zoom, je referme la main, ca dezoom". They existed because the aperture band overlapped the pinch band and every gesture fought its neighbour; the calibration clip settled that at the recogniser instead, by telling a real pinch from a flat closed hand on the aperture. The panel keeps what it is for: what the tracker sees, and a way to turn the camera off that needs no gesture.)
- [x] The modal does not capture the consent: neither the brush nor the pinch does anything. (2026-09-09, commit 6541f0c6e: one root cause for both, and neither was where two evenings of reasoning had put it. The pinch never RELEASED: the band asked thumb-to-index back over 1.00 and his hand between two taps reads a median of 0.88, so one tap armed the grab and it never let go; five taps came out as two episodes, the second 3.1 seconds long. And the brush was gated on an unpinched hand, while he brushes with a relaxed one, thumb near the index, so 80 frames of that take were invisible to it. Both are measured off his clip now: five clicks from five taps, three dismisses from five brushes, and zero of either across 2061 frames of ordinary use.)
- [x] I cannot pinch to select a page. (2026-09-09, commit 6541f0c6e: the release threshold above, plus a click that no longer depends on duration in either direction. A pinch that does not travel is a click however long it is held, which is the mouse's own rule; the 400ms cap was a touchscreen convention and one of his five taps ran to 733ms. His taps travel 0.027 to 0.054 of a hand width and his drags 1.00, so the bound sits at 0.25.)
- [x] Closing the hand does not zoom out. (2026-09-09: closing the fingers brings the thumb in with them, so the gesture read a thumb-to-index median of 0.29, inside the pinch band, and the world grabbed the chart and went blind to the zoom for 76 of its 139 frames. The aperture separates them cleanly, 0.53 to 0.91 for a real pinch against 0.10 to 0.59 for the fingers closed, and it now gates arming a pinch. His aperture range for zoom is 0.50 closed, 0.97 at rest, 1.25 spread.)
- [x] One misread label refuses the brush. (2026-09-09: the landmarker calls his hand Right 1172 times and Left 27, flipping six times, and the flips land during the fast movements, which is exactly when a brush happens. A single Left frame inverted the direction gate and refused the gesture. The last eight readings vote on it now, about a third of a second at his frame rate.)
- [x] The recorder, and the test that never existed. (2026-09-09, commits 82b22ef5c, afad10479, dd6da3d2d: hand/record.html records eight labelled takes at his own pace, started with his other hand, landmarks only; qa-hand-calibration.js replays the result and asserts what his gestures actually do. Two of my own bugs in the swipe were only visible at the 23 fps his camera really runs at: a window that kept a sample from outside itself and then required the span to be inside it, and a glitch guard that refuses a genuinely fast hand.)
- [x] The second hand does nothing. (2026-09-08: the landmarker asks for one hand, which is cheaper per frame and removes the question of which hand is primary.)
- [x] An arming dialog that teaches the gestures, and is answered BY a gesture. (2026-09-08, and finished 2026-09-09: it reuses the #guide dialog, a brief pinch confirms, a brush of the open hand declines and goes through the real disarm path so the camera actually stops. Two faults found after it shipped are fixed with it: it owns the hand while it waits, in commit 716fd5ba1, and its copy is rewritten for the two modes under a bumped session key so anyone who saw the old wording sees the new one. Both answers stay clickable by mouse, and the panel adds a third way out.)
- [x] A brief pinch that does not move opens the page. (2026-09-08, hardened 2026-09-09 in commit d3628e821: the click measures the pinch's WHOLE excursion rather than where it happened to end, so a pinch that wanders and comes back is a drag and not a tap, and it asks for at least 60ms so a one-frame flicker cannot open a page.)
- [x] The fist loses its action and keeps its job. (2026-09-08, and still true: nothing listens for a lock, and the detection stays because a closing hand brings thumb and index together and would otherwise read as a grab every time he rests his hand. The panel's status now says RESTING when it sees one, so the fist is legible instead of silent.)
- [x] Zoom: drop the two-hand pinch distance, use one hand opening and closing. (2026-09-09: the two-hand pinch is gone and one hand does it, as asked. The RATE-with-a-dead-zone half of the proposal was built, tested by him, and replaced the same day: a rate read off an absolute aperture is what made opening the hand dezoom. The measurements that proposal rested on still hold and are still in gestures.js, which keeps measuring the fan for them; nothing consumes it. Zoom is a relative delta now, in its own mode.)
- [x] Opening the hand zooms OUT instead of in. (2026-09-09, commit d3628e821: NOT a sign inversion, which is why reading the code for one found nothing. The fan drove the zoom from the hand's ABSOLUTE aperture against a neutral, so opening a closed hand spent the first half of the movement below that neutral and dezoomed while it opened, and a hand resting on the wrong side of the neutral drifted on its own. Zoom is the aperture's frame-to-frame CHANGE now: opening always zooms in and closing always zooms out, wherever the hand starts. Proven through the whole stack, from fake camera frames to cam.ts: an aperture sweep from fingers together to spread takes the scale 0.90 to 4.50, and the reverse sweep brings it back.)
- [x] The swipe to decline does not fire. (2026-09-09, commit d3628e821: none of the three candidates was it. The rule was wrong in kind, not in value. A per-frame speed is not a property of a gesture: a real swipe accelerates and decelerates, its frames arrive 20 to 70 ms apart on a camera that is also running a hand model, and ONE frame under the bar reset the streak and the distance accumulated with it. So the swipe is measured whole now: 0.7 of a hand width of net lateral displacement inside 0.25s, with a progressive-displacement guard so a one-frame tracking jump cannot pass as a gesture. Measured: zero dismisses across the 2061 frames of the reference clip, one dismiss for a deliberate swipe at 15, 24, 30 and 60 fps and on jittered 20-70ms frames, none for a hand crossing one hand width over four tenths of a second, none inward, none for a teleport. Proven through the real pipeline too, wall clock and all: the arming dialog closes and the camera goes off.)

- [x] The dialog does not capture the hand. (2026-09-09, commit 716fd5ba1: the rule existed, on exactly one of the world's six hand listeners, hand:click, and move, grab, release and fan never consulted it. It now lives in one predicate, handCaptured(), read by one wrapper, onHandControl(), that every control listener goes through, so a listener added later cannot skip it. present and absent stay direct because they only ever clear state, and taking focus releases whatever the chart was holding, so a hand pinched as the camera arms does not keep the map grabbed. The reticle keeps tracking throughout: the visitor has to see the camera found their hand while reading what the gestures do. qa-hand-map.js gained THE DIALOG OWNS THE HAND, which asserts on the camera targets and not on the dialog, and failed on both freeze assertions before the change.)

## Across the lab
- [x] FIRST LIGHT's top bar overflows by 77 pixels. (2026-09-09, commits db0d2ca25 and d3628e821: `qa-topbar.js` measures the bar at seven widths and names what falls off, which the report could not: the ? button ended at 1285 and the mission clock at 1357 in a 1280 viewport, and the search box was crushed to 190px on the way, a flex row paying for itself with the only item that can shrink. The fix, from the Codex pass taken over here, is a media query under 1450px that hides the strapline, the clock and the key caps and puts a floor under the search. Passes at 1280, 1366, 1440, 1512, 1600, 1728 and 1920. Room for the way home now exists in that bar.)

- [x] Most of the gallery cards show a world that does not work. (2026-09-09, commits d85e27010, da575a0be, 2631659c5, 86a1eaf24: two defects, both fixed. The gallery served every world from the scratchpad of session 0d8629c6 under /private/tmp, where six living build dirs had lost their data bundles around 00:16 that morning, so the worlds genuinely failed and their cards were their own error dialogs. Serving now resolves through qa/worldsource.js: the worktree if that branch is checked out, else the branch read straight out of git as blobs, else the old path for the two archives that have no branch yet. And the thumbnailer no longer publishes whatever it captured: five gates stand between a screenshot and a card, a rejected shot leaves the old card alone, and three recipes were wrong too, the Long Way entering a door, the Herbarium's key panel covering the cabinet, the Golden Shore arriving in mist. All twelve cards reshot and looked at one by one. qa/labcheck.js now answers the whole question in one command, and says 12 of 12 today.)
