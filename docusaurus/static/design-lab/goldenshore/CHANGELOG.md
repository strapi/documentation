# The Golden Shore

The marriage build. **The Living Coast is the trunk and it is intact.** The graft
is one thing and one thing only: the coast is now five distinct provinces drawn
from the official Strapi documentation taxonomy, and walking a footpath from one
into the next is watching one world hand you to another.

Everything below was measured in a headless Chromium walk of this build, with
`--use-angle=metal`, viewport 1440x900, the page at DPR 1 and the plates at DPR 2.
Numbers are reported as measured, worst run first where runs disagree.

---

## What was kept, and how it was checked

The Living Coast's own inventory, re-verified on this build rather than assumed:

| kept | verified |
|---|---|
| the honey disc, its limb, its aureole and halo | `planches/planche-1-arrival.png`, `plate1-the-long-light.png` |
| the warm rim on every backlit grass head, cypress and shoulder | `plate2c-laundry-between-houses.png`, `planche-3-the-handover.png` |
| ridges stacked as separate hazed planes | `planche-2-the-vista.png` |
| twelve keepers on real rounds, provenance-true lines | `probe/asserts.js`: 9 assertions, 8 pass, 1 honest mismatch, all twelve lines printed |
| the lantern tending act, reading real days since last commit | unchanged; `probe/final.js` |
| gulls, boats, laundry, crates, nets, goats, cicadas | `plate1`, `plate2-evidence-of-habitation.png`, `plate2b-a-keeper-on-his-round.png` |
| weather as events that cross the water, not states that toggle | the squall curtain still marches from mid-sea; `plate5-the-squall.png` |
| the crisp untinted DOM overlay | `probe/allpages.js`: 290 / 290 open, `filter: none`, `opacity: 1`, page `rgb(255,255,255)` |
| Quick Start led to first | the compass still carries the violet door until it is read |
| the graceful WebGL failure card | unchanged, with its working RETRY |
| relative paths, `localStorage` behind try/catch, no new libraries | verified below |

**Nothing in the trunk was deleted.** Two things were *moved*, and both are named
here so nobody has to find them missing:

- **The three umbrella pines on the crag are gone as three separate merged
  meshes.** They are not gone as trees. They were the headland's parasols
  standing on the one province that has to read as bare rock, and they are now
  old wide-crowned instances inside the new maritime pine population, up in the
  pine country where a parasol pine belongs. They cost no draw call of their own
  any more, and that saving is what keeps the frame at the ceiling rather than
  over it.
- **The CMS signal mast moved from (66, -4) to the harbour point at (22, -54).**
  Its page is `cms|Command Line Interface`, which is a Harbour Town section, and
  at its old spot it stood alone inside terrace country as a one-district island
  in the province field. On the point it answers the Cloud mast across the water,
  which is what the two masts were always for.

The base build's per-district ground tints were *not* replaced by the province
palettes. They are read **over** them: the province says which coast you are on,
the district still says which yard you are standing in (`DISTRICT_TINT` in
`js/world.js`).

---

## The five provinces

Membership is the page's own **product and section** and nothing else. Sixteen
official sections, five coasts, 290 pages, counted from the built world:

| province | pages | official sections it holds |
|---|---|---|
| The Harbour Town | 23 | Getting Started 19 · AI 3 · Command Line Interface 1 |
| The Olive Terraces | 114 | Features 26 · Configurations 45 · Content APIs 43 |
| The Pine Highland | 66 | Development 32 · TypeScript 6 · Plugins development 28 |
| The Upgrades Wall | 64 | Upgrades 64 |
| The Cloud Archipelago | 23 | Cloud: Getting Started 8 · Projects management 5 · Deployments 2 · Account management 2 · Command Line Interface 1 · Advanced configuration 5 |
| **total** | **290** | **16 sections, every page, nothing invented** |

There is no community anywhere in this. `PROVINCE_OF_SECTION` is built by reading
`PROVINCES[key].sections`, and every province sign in the world prints the
official section names and their true counts off the same object.

### What each province is made of

Every province has its own ground, flora, building vernacular, working gear and
weather habits. These are not tints on one hillside; the palettes were measured.

**The ground, measured.** Same hour, same camera angle, same lit face, mean RGB
of the lower centre of a 600x400 frame (`probe/swatch.js`):

```
harbour    86  57  40     warm cobble dust over sand
terraces   46  27  22     terra rossa, the darkest and reddest ground here
highland   49  38  28     needle floor over granite grit, olive and cold
wall      111  79  62     bleached limestone, the brightest ground on the coast
cloud      99  92  87     shell sand, the only near-neutral ground (R/B 1.14)
```

At four degrees over the horizon a flat ground takes about fifteen per cent of the
sun, so all five are dark in absolute terms. What separates them is the relation,
and the relation holds: two dark provinces that differ in hue, two bright ones
that differ in temperature, and the harbour between.

**The flora.** Every species reads the same soft province field the ground reads,
so growth thins out and hands over across the same tens of metres the earth does:

- **Cypress** belongs to the harbour and the terraces and thins to nothing as the
  pine country takes over. That fade is half of the Forest Gate handover.
- **Olive**: 170 trees, weighted to the terraces, reaching a little into the
  harbour, none on the Wall and none at sea.
- **Maritime pine**: 300 new trees, the Pine Highland's whole silhouette. A bare
  leaning pole with two broken branch stubs for two thirds of its height, then
  four or five cushions on one plane so the crown has bites taken out of it
  against a low sun. One in nine is an old wide parasol.
- **Maquis**: 1,500 clumped bushes where the base build had 150 wind-bent scrub
  on the cliff road only. Tinted by province (rockrose under the olives, myrtle
  under the pines, thorn on the Wall, salt cushion on the islets), two in five
  gone the colour of last year's growth, and 42 per cent of them wind-flattened
  sprawls made in the instance rather than in a second geometry.
- **Agave** is the Wall's rosette and grows nowhere else.
- **Grass**: still 34,000 real geometry tufts, now mixed and thinned by province.
  The Wall carries 22 per cent of harbour density, which is what makes it read as
  bare rock from a kilometre away.
- **Rock** is province-tinted too, and the Wall sheds scree while every islet is
  ringed by the stone the sea has not finished.
- **Nothing grows in a gateway.** The town publishes its six thresholds into
  `GATES` and the vegetation keeps out of them, the way it already kept out of
  the roads.

**The building vernacular** (`VERN` in `js/town.js`), applied through the same
house kit the base build used, so every reveal, quoin, sill and shutter slat
survives:

| province | walls | roof | joinery | ashlar |
|---|---|---|---|---|
| Harbour Town | limewash over harbour stone | terracotta pantile | green, dark oak, ochre | warm grey |
| Olive Terraces | the same lime mixed with the red earth it stands on | pantile burnt deeper by the same clay | green, red-brown | warm ochre |
| Pine Highland | grey-green render, timbered upper floor, deep eaves | dark shingle | bottle green | granite grey |
| Upgrades Wall | relimed every spring | stone slab | weathered grey | pale limestone |
| Cloud Archipelago | whitewash, no weathering, flat roof and parapet, outside stair, water butt instead of a chimney | lime-washed slab | blue | near-white |

Plaster ages toward the grey of its own province by real first-commit date, and
the ageing is damped to a tenth on the islets, because whitewash is not a colour,
it is a chore.

**The working gear.** A harbour keeps barrels, nets and 42 crates. The terraces
press oil: three worn millstones on their beds. The highland cuts and stacks
timber: nine seasoning stacks and their sawhorses. The Wall builds cairns out of
what falls on the road: eight of them. The archipelago rakes salt and turns its
boats over: mooring bollards in door blue, four salt pans, and hulls keel-up on
trestles with their keels uppermost.

**The keepers are re-dressed, not recoloured at random.** Each of the twelve
declares the province it keeps and takes that province's working wool and hat:
sea-faded indigo and straw in the harbour, madder over the red earth, loden wool
and dark felt under the pines, undyed cloth with lime dust on everything on the
Wall, salt-bleached linen on the islets. Every spoken line is unchanged and still
asserted against the shipped data. Two rounds were re-routed because their ground
moved: the Harbormaster now walks the two Cloud islets his five cornerstone pages
stand on, going out and back along the causeway rather than over open water, and
the Netmender mends her nets on the causeway itself, which is where the
twenty-nine crossing roads now land.

**Weather is climate, not a filter.** The four states and the ten-minute clock are
the base build's, untouched, and the squall still marches in off the sea lane with
the sun burning a hole through it. What is new is that the state is weighted by
the province you are standing in, eased at walking pace with the same soft field
the ground uses. Measured (`probe/wxprov.js`, fog density x 10^-4):

```
state      harbour   terraces  highland  wall      cloud
clear      23        24        27        18        20
sirocco    27        43        41        46        27
squall     43 r0.60  52 r0.69  61 r0.71  35 r0.59  55 r0.78
mist       65        61       102        44       110
```

The mist pools under the pines and out over the archipelago and burns off first
on the Wall. The sirocco is dust off the red terraces and a hot wind on bare rock,
and the sea washes it out. The squall is rain on the water and in the pines,
gust and dust on the terraces (gust 2.21 against the harbour's 1.68), and on the
Wall you are half above it: the least rain and the most wind on the coast, gust
3.08. The absolute figures still drift while a 24 to 40 second crossfade is
running; the relation between the columns is the claim.

**The footfall changed too.** `surfaceAt` is province-true and the synthesized
audio has a recipe for each new one: sand, pine needles with a crack in them,
loose scree that slides half a step with you, and bright islet shell. The wind's
own band follows the province (380 Hz in the harbour, 900 in the pines, 1,300 on
bare limestone, 320 at sea), and the cicadas were moved out of the pine shade and
off the water into the hot dry country where they belong.

---

## The four borders, walked

Each border marker stands at a **real crossing point of the province field**: a
spot found at build time where a step one way is one province and a step the other
way is the next, with room to build and a worn dirt approach laid to it from both
sides. The crossing bearing is the gradient of the field itself, not the angle of
the nearest road.

| border | where | what it is made of |
|---|---|---|
| The Terrace Gate | (26.8, 16.5) | lime on the seaward pier face, terrace red on the inland one, a pantile cap, drystone running off both shoulders into the walled olive country |
| The Forest Gate | (95.4, 3.3) | two pine trunks and a beam, no plaster at all, rail fence off both shoulders, the first pines behind it |
| The Wall foot | (150.2, 12.2) | no gate: the soil ends, the road is cut into coursed limestone, and the first relimed pillar of the sixty-four stands on the cut |
| The Causeway | (-41.5, 49.7) | laid stone over the shelf with a kerb the sea washes, out of the harbour and into the archipelago |

`probe/borders.js` walks each of them on foot, deriving the direction from the
gate's own recorded bearing, and shoots four frames: 26 m before, 9 m before, 9 m
after, 26 m after. The province reported at each stop:

```
Terrace Gate   harbor   harbor   terraces terraces
Forest Gate    terraces terraces highland highland
Wall foot      terraces highland wall     wall
Causeway       harbor   harbor   cloud    cloud
```

The Wall foot reads `terraces` at 26 m back rather than `highland`, and that is
honest rather than broken: three provinces meet within thirty metres there,
because Configurations, Development and Upgrades genuinely sit that close in the
taxonomy. At 9 m back, where a walker actually crosses, it is highland.

Plates `b1` to `b4` in `planches/` show each border from seven metres up and
twenty back, high enough to see over the last roofs of the province you are
leaving. The ecotone is 11 m of softmax falloff, which is why the ground under
your boots has already started to redden twenty metres before you reach the
Terrace Gate. That is what eased means, and it is deliberate.

### What the graft cost the map

The six Cloud districts left the harbour hillside and became six islets across a
shallow shelf, tied to the shore and to each other by the causeway. That is the
one structural change to the base build's layout, and it is the thing the brief
asked for. Consequences, all handled:

- The islets are **plateaus, not domes**: the terrace flatten runs at 0.985 with a
  0.80 shoulder offshore, because a Cycladic village needs a flat top.
- The shelf raises the sea floor to -1.5 m under the archipelago, which is why the
  water there goes turquoise; a single merged veil paints the shallows.
- Cloud districts get their own tight ring layout scaled to the islet, and no
  station is ever seated below 1.9 m of ground.
- **No path is worn across open water.** `buildPaths` samples five points along
  every graph edge and drops any that crosses sea without a causeway under it.
- Crofts hide in the back country of their **own** province, so the four unlinked
  Cloud pages are huts on the seaward shoulder of an islet rather than strangers
  dropped in someone else's earth.
- The twenty-nine harbour stairs, one for each real cms-to-cloud road, now go
  *down* to the water instead of up to a quarter of the town, and the causeway
  carries on from their foot.

---

## Frame budget, reported honestly

Scripted 110-second walk on foot: the pier, the harbour gate, down the stairs and
out along the causeway to two islets and back, the signal mast, the AI yard, the
market, **the Terrace Gate**, the colonnade and the wellhouse, **the Forest Gate**,
the pine highland, **the Wall foot**, every switchback, the Crossing and the crag.
Squall forced and fully settled with rain up, twelve keepers walking, DPR 1,
1440x900, ANGLE Metal, nothing else on the machine.

| run | samples | p50 | p95 | peak draws | peak triangles |
|---|---|---|---|---|---|
| 1 | 12,000 | 8.3 ms | 9.5 ms | 120 | 2,911,170 |
| 2 | 12,000 | 8.3 ms | 9.6 ms | 120 | 2,911,170 |
| 3 | 12,000 | 8.3 ms | 9.6 ms | 120 | 2,901,090 |
| 4 | 12,000 | 8.3 ms | **9.9 ms** | 120 | 2,911,170 |

**The number to hold me to is the worst one: p95 9.9 ms at DPR 1.** The law is
33 ms. The base build's own published figure on its own shorter route was p50 9.3,
p95 16.0; this build is faster on a longer walk with a whole extra province in it.

One caveat stated plainly: `dt` here is the interval between animation frames, so
p50 8.3 ms is the 120 Hz display cadence and not a measure of how much headroom is
left underneath it. p95 is the honest figure because it is where the cadence is
missed.

**Peak 120 draw calls, counted across every pass in the frame** (main, water
reflection, shadow map), which is the honest way to count them. The base build's
stated ceiling is 120 and its own measured peak was 117 on its route. Getting the
graft under the ceiling cost two named cuts and one merge:

- A pine's shadow is its crown, not its pole: the trunk mesh receives but does not
  cast, and the shadow pass is one draw shorter.
- The maquis is **one** silhouette, not two. A second geometry read better and
  cost a draw in both the main and the shadow pass, which is exactly the pair that
  put the pier frame over. The sprawl habit is made per instance instead, with a
  squash and a widen, so 42 per cent of the bushes lie along the wind anyway.
- The crag's three parasol pines were folded into the instanced maritime pine
  population, as above.

Counted from the built scene: **42,793 instances across 43 instanced meshes**,
alongside 51 plain meshes, 3 sprites and 3 point clouds. The largest populations
are 34,000 grass tufts, 4,643 terracotta tile rows, 1,500 maquis bushes, 300 pine
trunks and 300 pine crowns, 290 lanterns and 170 olives.

The peak frame is the pier head looking west during the squall, which is the base
build's own worst case too: the water reflection pass plus the curtain plus rain.

---

## Boot and conformance, all re-verified on this build

- **Boots clean headless**: 290 stations, 12 keepers, 110 draws at rest, zero
  console errors, zero page errors, zero failed requests. One console warning, and
  it is the base build's own honest one: `populate-words: data says 2152, brief
  said 1916; the data wins.`
- **All 290 pages open crisp and untinted.** `probe/allpages.js` opens every one:
  290 of 290 with real body text, a crumb and a provenance line; the shortest body
  is 466 characters (`/cms/typescript/guides`); the reader computes to
  `filter: none`, `opacity: 1`, page background `rgb(255, 255, 255)`.
- **Quick Start still leads.** `/cms/quick-start` returns 18,684 characters, 5
  section headings, 34 links, 52 code elements, under `19 commits by 5 hands ·
  first 2025-02-06 · last 2026-07-22`.
- **Prefix serving with a trailing slash.** Mounted on a second server at
  `/g/abc123/` and opened as `http://127.0.0.1:8664/g/abc123/`: 290 stations, 6
  gates, title `The Golden Shore`, **zero 404s, zero failed requests, zero
  errors**.
- **Reduced motion parity**: the same twelve keepers, the same four states, the
  squall still reaches full rain, zero errors.
- **Sound**: still entirely synthesized WebAudio, no files, no libraries; armed on
  the first real gesture and toggled off by M in the probe.
- **The logbook** now groups the sixteen official sections under their five
  provinces (21 rows: 5 province headers, 16 sections) and gained a second legend
  line naming every province vernacular. The building legend is untouched.
- **`localStorage`** every read and write behind try/catch. **No new libraries**:
  vendored Three.js r170, `Sky`, `Water`, `PointerLockControls`. **English only.
  No em dashes. Relative paths throughout.**

### The keeper assertions, unchanged

Nine numeric assertions against the shipped data. Eight pass. One does not, and it
is the same one the base build reported and refused to hide:

```
populate-words: data says 2,152, brief said 1,916
```

The data wins. The Gardener of the Colonnade says 2,152 words and the build logs
the discrepancy as a console warning.

---

## Plates

The four commissioned plates:

| plate | what it is |
|---|---|
| `planche-1-arrival.png` | The arrival. No input at all: the pier boards, the drying nets, the violet banner, the harbour gate with a keeper walking under it, the Golden Shore on the crag. |
| `planche-2-the-vista.png` | The vista. Nine metres up on the shoulder of the Upgrades Wall looking west-north-west: bleached limestone underfoot, the dark shingle roofs of the Pine Highland below, the pale harbour beyond, and the Cloud Archipelago on the water beside the sun road. |
| `planche-3-the-handover.png` | The handover, mid-walk on real held keys, with the low sun behind so both provinces are lit: harbour ground under the boots, the Terrace Gate on the crossing with its lime and terra faces and its drystone shoulders, and the red terra rossa of the Olive Terraces beyond it. |
| `planche-4-the-detail.png` | The detail, three quarters on at 8.6 m: an islet house on the Cloud Archipelago. Flat roof, parapet and its coping, quoins turning the corner, door reveal with jamb and lintel, slatted blue shutter, sill, threshold slab, lantern cage with one lit pane, and its own painted board reading `Project logs · since 2026-06-17 · 6 commits`. |

The five provinces, one plate each: `prov1-the-harbour-town.png`,
`prov2-the-olive-terraces.png`, `prov3-the-pine-highland.png`,
`prov4-the-upgrades-wall.png`, `prov5-the-cloud-archipelago.png`.

The four borders: `b1-terrace-gate.png`, `b2-forest-gate.png`,
`b3-wall-foot.png`, `b4-the-causeway.png`.

The base build's own plates, all re-shot on this coast so nothing in the folder is
stale: `plate1-the-long-light.png`, `plate2-evidence-of-habitation.png`,
`plate2b-a-keeper-on-his-round.png`, `plate2c-laundry-between-houses.png`,
`plate3-the-colonnade.png`, `plate4-the-whole-coast.png`, `plate5-the-squall.png`,
`plate6-reading-is-sovereign.png`.

Walked border strips are in `probe/borders/`, per-province weather frames in
`probe/wx/`, and the measured ground swatches in `probe/swatch/`.

---

## Known and not hidden

- **Hue separation is compressed at distance.** At four degrees of solar
  elevation, with an amber sun and the sunward haze the base build's light depends
  on, everything more than about a hundred and fifty metres away goes the same
  honey. The provinces separate in the near and middle field, in the vertical
  surfaces and in the growth, and they separate measurably in the swatches. They
  do not separate on a far hillside seen into the sun, and no amount of palette
  work will make them, short of changing the hour, which was not on the table.
- **Two of the three land borders fall inside built-up ground.** The Terrace Gate
  and the Forest Gate stand where the province field genuinely crosses, and that
  place happens to be between two ring towns rather than in open country. The gate
  spot search guarantees six and a half metres of clearance and lays a dirt
  approach, but a walker crossing there is walking a street, not a meadow. The
  Wall foot and the Causeway are both in the open.
- **The islet flanks go very dark on their shaded side.** They are lit only by the
  hemisphere and a warm ground bounce at this hour, which is correct, and it is
  still the weakest thing in a close approach from the east. The slope rock was
  given a pale limestone tint for exactly this and it only half fixes it.
- **Peak draws sit exactly on the ceiling, not under it.** 120 of 120. Three cuts
  bought that and they are named above; there is no margin left for another
  species without another cut.
- The `-26 m` sample at the Wall foot reports `terraces`, as explained above.
