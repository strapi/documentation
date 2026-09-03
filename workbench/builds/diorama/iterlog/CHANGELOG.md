# Diorama iteration log

## Salvaged baseline (before cloud continuation)
The verified visual bug purge was salvaged mid-run into the branch
(commit "Apply verified visual bug purge to the diorama, salvaged mid-run").
Cloud continuation re-ran the canonical 290-page sweep on that baseline:
290/290, zero errors, zero thin pages, zero overflow. It holds.

## Round 0 — the living layer (2026-09-03)
One coherent system of inhabitants on the existing rAF loop, drawn inside the
existing depth-sorted prop stream, moved by one clock (`LT`) and one wind
(`WINDV`). Reduced motion pins the clock: the whole layer holds a posed,
byte-identical tableau (verified: two successive paints identical).

- **Pedestrians** (84): pace the intra-district citation lanes; per-district
  count = round(sum of members' inbound citations / 16), clamped 1..12. They
  turn at the lane's doorways (never walk into living rooms), stride with
  counterphase legs and a coat bob.
- **Delivery vans** (21): one per inter-district citation edge of weight >= 6,
  travelling the drawn road, keeping right, fading in/out at the depots so
  nothing pops. Verified moving ~14 u/s.
- **Pigeons** (27): grey-blue crumbs on the monument plazas, wandering
  lissajous lines, pecking between steps.
- **One cat**: a closed catmull round through the nearest-neighbour chain of
  derelict lots, tail up and swaying with the wind.
- **Gardeners** (12): kneel at the edge of planted beds (a figure inside the
  lot was painted over by its own planting — moved to the path), torso
  rocking, one arm down in the planting.
- **Moths** (15): one per night commit (00:00-06:00) from provenance.json —
  15 night edits across 12 pages; each circles its page's kerb lamp on a
  restless orbit. /cms/installation/docker carries 4.
- **Shared wind**: laundry hems blow through the line in a travelling wave;
  shop and loading-door awnings breathe (their canvas quads were degenerate
  — zero area, invisible since they were written — now sloped and mended);
  chimney smoke leans flatter in gusts.

Bugs found and fixed on the way:
- gatherProps capped visible props at 720 in bake order; the static street
  furniture alone (1604 props total) exhausted the cap, so anything appended
  after it was silently never drawn. Raised to a safety cap of 1800; the
  size/haze gates are the real cull.
- Awnings: `fqo(u0, w, u1, w, out)` with equal heights = zero-area quad.
  Added `fqa` (wall edge at the top, outer rail pushed out and dropped) and
  rebuilt both awnings on it.

Verification: node --check clean; canonical sweep 290/290, zero errors, zero
thin pages, zero overflow, zero content loss. Frame averages at 1440x900
(24-frame prof): establishing 13.8 ms (budget 30), mid-zoom 12.2 ms, street
9.4 ms (budget 40), facade close-up 14.8 ms.

## Round 1 — fresh eyes vs the exhibition bar (2026-09-03)
Judged the four fixed viewpoints (whole diorama / mid-zoom on the
document-service district / street at the breaking-changes quarter / facade
close-up) against a hand-built exhibition diorama. Gaps found, in order of
impact, all applied:

1. **The landmark tower of the mid-zoom stood blank.** The per-frame detail
   budget (quota 1.05x screen area, 30 buildings) was spent by small near
   buildings before the subject of the shot got its windows. Raised to 2.0x
   and 44 while resting (drag budget unchanged). The document-service tower
   now carries its full curtain-wall at the distance the shot is framed.
2. **The establishing shot was half empty table.** The home fit now lets the
   near deckle bleed behind the HUD (the printed name stays strict above it)
   and allows real side bleed; the sheet fills the frame.
3. **Atmospheric haze on a tabletop.** A model an arm's length away does not
   fog: haze now fades with camera elevation (full in the streets, 45% of
   itself looking down from above). Far quarters read crisp at the
   establishing shot.
4. **The maker's bench was bare.** Added a craft knife, a paint pot with
   dropped lid and a wet brush, an eraser, and curled pencil shavings by the
   pencil point, all beside the torn edge.
5. **Near flat roofs read as raw fill** — gravel/lightwell dressing threshold
   lowered (44px -> 30px face width) and strengthened.
6. **Manhole covers** at street junctions once a quarter fills the frame.

Frame averages after: establishing 18.5 ms (budget 30), mid-zoom 27.4 ms,
street 16.0 ms (budget 40), facade close-up ~38 ms (fill-rate at extreme
close-up; no stated budget, kept under the 40 ms street bar).

## Round 2 — fresh eyes vs the exhibition bar (2026-09-03)
1. **Flat roofs washed to cream.** With the sun on the horizon a roof
   catches sky, not sun: roofCol keeps more of the body colour (mix 0.66 ->
   0.47, top lift 1.10 -> 1.03). The scaffolded quarter's rooftops now read
   ochre, not overexposed.
2. **A parapet return on every sizeable flat top**, independent of the
   detail budget, so no roof anywhere reads as raw fill.
3. **Paving joints on the district plate** once the camera is at street
   level (screen radius > 700): the ground is slabs, not one pour.
4. **Table banding.** The haze-stepped ground strips banded visibly at
   grazing angles: 56 -> 88 strips, gentler packing exponent.
5. **The pencil had bled behind the HUD** after the tighter establishing
   crop: moved up beside the near deckle, fully in frame again.

Frame averages after: establishing 18.5 ms, mid-zoom 29.8 ms, street
12.5 ms, facade 37.6 ms.
