# Design Lab · ideas and open feedback

Every piece of feedback the owner has given that has not been acted on yet. Tick a box when the
work is done AND pushed. This file is the single answer to "what is left to do": when he asks,
read this, not a memory and not a transcript.

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

- [ ] Move the way to The Golden Shore to the EDGE OF THE MAP, not far from the boat that leads to Carta Strapiana. It is currently the lamplighter's yard, inland.

## The Herbarium

Both of these are an explicit new request and therefore override the standing "never touch the
Herbarium" ruling. Nothing else in that world moves on the same pass.

- [ ] ASK FIRST, then decide: fold The Golden Shore into Appendix I with the others rather than alone on the late-accession sheet filed behind. Stated as a preference, not a ruling. Re-laying the plate also means re-cutting `probe-r10.js` again.
- [ ] The appendix should have to be OPENED: an envelope revealing the sheet of specimens, instead of being shown without effort.

## Carta Strapiana

- [ ] Build the two deeper rungs, VI THE THRESHOLD and VII THE FOOTPATH, with per-island drawn landscapes. Plates validated; rung VII must be an engraved perspective scene, never a photograph. The wave script is amended and has never been launched.
- [ ] Under `prefers-reduced-motion` the ship does not close distance, so the sail-in path to the keeper coast never opens. Pre-existing.
- [ ] `qa/probe-s4-prefix.js` fails on `islands === 290` when the build has 288. Stale probe.

## The Four-Color

- [ ] `qa/r18-phantom.js` reports two failures on internal house ads: a tap navigates instead of advancing, and ENTER opens the wrong issue. Pre-existing, A/B'd as byte-identical to the earlier build.

## The Long Way Through

- [ ] Latent: `window.__portal.ask()` can raise the carved notice while the landing card is still up, and `#landing` sits over `#portalask`, leaving the buttons mouse-dead. Not reachable in play.

## Across the worlds

- [ ] The space bar crosses on a focused YES in Pixel Docs City, The Herbarium, FIRST LIGHT and The Four-Color. The confirm law names only Y, N, Enter and Escape.
- [ ] Audit text clipping. Five worlds combine `white-space: nowrap` with a hidden overflow, between two and six places each; Pixel Docs City's door prompt was cutting hints mid-word until 2026-09-07 and nothing else has been checked.
- [ ] The ten-ideas wave for The Long Way Through.
- [ ] The ten-ideas wave for FIRST LIGHT.
- [ ] The ten-ideas wave for The Herbarium.

## Small and undecided

- [ ] DECIDE: the Herbarium's night view differs by five pixels inside a decorative moon ring, in roughly half of runs, against a zero-tolerance assertion that protects a real law (the appendix must be strictly additive). Either give that one assertion a documented, tight tolerance, or leave the battery permanently one short.
- [ ] The backup labels in the Golden Shore are misleading: the `.r19.bak` files are a mid-round snapshot that already contains the new crossings, while the true pre-round restore point is `.gs.bak`.
