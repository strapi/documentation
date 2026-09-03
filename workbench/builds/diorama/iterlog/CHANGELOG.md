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
