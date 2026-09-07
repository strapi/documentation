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
- [ ] Move the boat to Carta Strapiana to the LEFT of the jetty and much further down the beach.
- [ ] Restore the Quick Start guide as the FIRST building after the jetty, about ten metres past the portal. Buildings currently block the portal, which also breaks QUICK START FIRST.
- [ ] A full discoverability pass on this world's crossings, since they must stay easter eggs.
- [ ] Finish the province ground wave. Round 1 is complete on disk with its backup served side by side; the run was killed.
- [ ] A keeper's toast can land on top of a waymark's reading line, two text layers colliding at bottom centre.

## Pixel Docs City

Settled otherwise, and not to be re-tuned.

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

- [ ] Latent: `window.__portal.ask()` can raise the carved notice while the landing card is still up, and `#landing` sits over `#portalask`, leaving the buttons mouse-dead. Not reachable in play.

## Across the worlds

- [ ] The space bar crosses on a focused YES in Pixel Docs City, The Herbarium, FIRST LIGHT and The Four-Color. The confirm law names only Y, N, Enter and Escape.
- [ ] FIRST LIGHT clips **all three lines of its mission log**, in a 412px box: by 58px, 252px and 936px. The worst line is cut to about a third of itself.
- [ ] The Four-Color clips 2 of the 7 visible `.pocket-tag` labels by 17px each, for example "GETTING STARTED · 19 ISSUES" in 141px. Sixteen exist in the DOM, so more will clip as other pockets come into view.
See the three itemised idea lists at the end of this file.

## Small and undecided

- [ ] DECIDE: the Herbarium's night view differs by five pixels inside a decorative moon ring, in roughly half of runs, against a zero-tolerance assertion that protects a real law (the appendix must be strictly additive). Either give that one assertion a documented, tight tolerance, or leave the battery permanently one short.
- [ ] The backup labels in the Golden Shore are misleading: the `.r19.bak` files are a mid-round snapshot that already contains the new crossings, while the true pre-round restore point is `.gs.bak`.

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

- [x] Move the way to The Golden Shore to the EDGE OF THE MAP, not far from the boat that leads to Carta Strapiana. (2026-09-07: the lamplighter's yard now places after the harbour is measured and is constrained by proximity to the mooring, landing 9.4 tiles from the sloop.)

## Carta Strapiana

- [x] `qa/probe-s4-prefix.js` fails on `islands === 290` when the build has 288. Stale probe. (2026-09-07: the two release-notes pages are struck at source, so the survey holds 288; constant fixed with the reason beside it, PREFIX BOOT passes.)

## Across the worlds

- [x] Audit text clipping across every world. (2026-09-07: swept all seven live, revealing hidden UI and measuring real overflow. Five are clean; two are not, below.)
