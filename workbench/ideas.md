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
- [ ] The bridge does not reach the far side.
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

- [ ] ASK FIRST, then decide: fold The Golden Shore into Appendix I with the others rather than alone on the late-accession sheet filed behind. Stated as a preference, not a ruling. Re-laying the plate also means re-cutting `probe-r10.js` again.
- [ ] The appendix should have to be OPENED: an envelope revealing the sheet of specimens, instead of being shown without effort.

## Carta Strapiana

- [ ] Build the two deeper rungs, VI THE THRESHOLD and VII THE FOOTPATH, with per-island drawn landscapes. Plates validated; rung VII must be an engraved perspective scene, never a photograph. The wave script is amended and has never been launched.
- [ ] Under `prefers-reduced-motion` the ship does not close distance, so the sail-in path to the keeper coast never opens. Pre-existing.

## The Four-Color

- [ ] `qa/r18-phantom.js` reports two failures on internal house ads: a tap navigates instead of advancing, and ENTER opens the wrong issue. Pre-existing, A/B'd as byte-identical to the earlier build.

## The Long Way Through


## Across the worlds

See the three itemised idea lists at the end of this file.

## Small and undecided

- [ ] DECIDE: the Herbarium's night view differs by five pixels inside a decorative moon ring, in roughly half of runs, against a zero-tolerance assertion that protects a real law (the appendix must be strictly additive). Either give that one assertion a documented, tight tolerance, or leave the battery permanently one short.

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

- [x] The door prompts disagreed on case: the descriptive line under the title was sentence case on the sloop and capitals on the other five. (2026-09-07: all five follow the sloop now, case only, titles still capitals.)
- [x] Move the way to The Golden Shore to the EDGE OF THE MAP, not far from the boat that leads to Carta Strapiana. (2026-09-07: the lamplighter's yard now places after the harbour is measured and is constrained by proximity to the mooring, landing 9.4 tiles from the sloop.)

## Carta Strapiana

- [x] `qa/probe-s4-prefix.js` fails on `islands === 290` when the build has 288. Stale probe. (2026-09-07: the two release-notes pages are struck at source, so the survey holds 288; constant fixed with the reason beside it, PREFIX BOOT passes.)

## Across the worlds

- [x] The space bar disagreed across the network: four worlds let it press the focused answer, three swallowed it. (2026-09-07, owner ruled for the web convention, a focused button takes Space as a click: The Long Way Through and Carta Strapiana now honour it, probed both ways on the Long Way. THE GOLDEN SHORE IS A DELIBERATE EXCEPTION and keeps swallowing it, both because its own code argues Space is the likeliest stray press on a coast you walk, and because SPACE TO JUMP is on that world's punch list above.)
- [x] FIRST LIGHT clipped all three lines of its mission log. (2026-09-07: entries wrap now; the lock line had been losing FIRST SURVEY TARGET - BEGIN HERE and the photometer line its whole explanation. Panel cap 184 to 138px so it clears #prompt-sub. Battery ALL PASS.)
- [x] The Four-Color clipped its pocket tags, losing the issue count on the longer categories. (2026-09-07: they wrap to two lines in a slightly wider box; all sixteen measured, none clipped, none overlapping a neighbour.)
- [x] Audit text clipping across every world. (2026-09-07: swept all seven live, revealing hidden UI and measuring real overflow. Five are clean; the two that are not have their own open lines in the working list.)

## The Golden Shore

- [x] DECIDED how far the un-naming goes. (2026-09-07, owner: Pixel Docs City unchanged, the Herbarium unchanged, "les noms que tu as trouves sont parfaits"; he will flag any others as he finds them. The un-naming was a Golden Shore correction only, where the wave brief had wrongly demanded it.)
- [x] The backup labels were misleading. (2026-09-07: BACKUPS.md in that build now says which restore point is which and why one of them is not one.)
- [x] A keeper's line printed across a waymark's label at the bottom centre. (2026-09-07: the line measures the label as it speaks and stands above it; 45px of overlap before, none after.)

## The Long Way Through

- [x] The carved notice could rise behind the landing card with mouse-dead answers. (2026-09-07: the card stands aside first, without the walker pick a real dismissal opens; YES verified hit-testable.)
