# Design Lab · ideas and open feedback

Every piece of feedback the owner has given that has not been acted on yet. This file is the single
answer to "what is left to do": when he asks, read this, not a memory and not a transcript.

Tick a box when the work is done AND pushed, then move the line down to **Archives** at the
foot of this file, keeping the section it came from. The working list above stays short that way.

Last updated 2026-09-07.

## The Golden Shore

The newest world and the least worn in, so most of this is world craft rather than polish.

- [ ] Footsteps are not believable, "on dirait limite un vélo". Rebuild them.
- [ ] Vary footsteps with the ground underfoot: decking, earth, sand, stone, and so on.
- [ ] Introduce collisions. Walking through a wall or a fence must not be possible.
- [ ] Add SPACE to jump over an obstacle.
- [ ] Make swimming possible.
- [ ] The bridge does not reach the far side. (2026-09-07, measured along z=-28: the ground steps from 28.07 at x=186 to 31.85 at x=188, a 3.8 m wall at the WEST end of the span, and from 31.73 at x=204 to 32.89 at x=206, a 1.2 m step at the east. Also puzzling: the measured ground across the span sits ABOVE the deck formula's 30.4-31.55, so terrain may be burying the arch. Blocked on seeing it: the player loop overwrites any camera the probe sets, so no usable elevation could be framed. ASK HIM for a screenshot of the gap, which settled the crate question in seconds.)
- [ ] The rain, or possibly the snow, sounds very metallic.
- [ ] Wind and waves are indistinguishable. Waves should only be heard near the shore, fading as you walk inland.
- [ ] The stand leading to The Four-Color is too visible.
- [ ] The loan crate to the Herbarium sits ON THE ARRIVAL JETTY, the first thing a visitor meets. Move it somewhere that has to be found.
- [ ] Check the other five crossings for the same fault: an easter egg standing where you cannot miss it.
- [ ] Move the boat to Carta Strapiana to the LEFT of the jetty and much further down the beach.
- [ ] Restore the Quick Start guide as the FIRST building after the jetty, about ten metres past the portal. Buildings currently block the portal, which also breaks QUICK START FIRST.
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


## Across the worlds

See the three itemised idea lists at the end of this file.

## Small and undecided


# The three ten-idea lists

Proposed and approved in full ("j'aimerais que tu implementes TOUTES ces idees"), never built. Each
was written as one binding condition of a wave, so each is buildable on its own; ticking them one at
a time is fine. Every one of them must hold the world's existing laws: nothing gates the reading,
one label at a time, and no regression.

## The Long Way Through

- [ ] **The night lantern.** At night the walker carries a small lantern in the flat idiom; its warm pool travels with her and becomes the focus of the frame.
- [ ] **The memory cairns.** Passing a gate whose page was read in a previous visit shows a small cairn beside it, the real date of that reading engraved on it.
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

## Carta Strapiana

- [x] Under reduced motion the ship closed no distance. (2026-09-07: the hull is frozen by design and travel goes by passage, but the knots kept climbing, so the log reported way she was not making. She reads zero now; a passage still closes 1.6 nm to 1.2 in three seconds.)
- [x] `qa/probe-s4-prefix.js` fails on `islands === 290` when the build has 288. Stale probe. (2026-09-07: the two release-notes pages are struck at source, so the survey holds 288; constant fixed with the reason beside it, PREFIX BOOT passes.)

## Across the worlds

- [x] The space bar disagreed across the network: four worlds let it press the focused answer, three swallowed it. (2026-09-07, owner ruled for the web convention, a focused button takes Space as a click: The Long Way Through and Carta Strapiana now honour it, probed both ways on the Long Way. THE GOLDEN SHORE IS A DELIBERATE EXCEPTION and keeps swallowing it, both because its own code argues Space is the likeliest stray press on a coast you walk, and because SPACE TO JUMP is on that world's punch list above.)
- [x] FIRST LIGHT clipped all three lines of its mission log. (2026-09-07: entries wrap now; the lock line had been losing FIRST SURVEY TARGET - BEGIN HERE and the photometer line its whole explanation. Panel cap 184 to 138px so it clears #prompt-sub. Battery ALL PASS.)
- [x] The Four-Color clipped its pocket tags, losing the issue count on the longer categories. (2026-09-07: they wrap to two lines in a slightly wider box; all sixteen measured, none clipped, none overlapping a neighbour.)
- [x] Audit text clipping across every world. (2026-09-07: swept all seven live, revealing hidden UI and measuring real overflow. Five are clean; the two that are not have their own open lines in the working list.)

## The Golden Shore

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
