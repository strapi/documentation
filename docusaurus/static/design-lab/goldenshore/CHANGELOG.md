# The Golden Shore

The marriage build. **The Living Coast is the trunk and it is intact.** The graft
is one thing and one thing only: the coast is now five distinct provinces drawn
from the official Strapi documentation taxonomy, and walking a footpath from one
into the next is watching one world hand you to another.

Round two closed the one real defect the verifier found: a third of the Upgrades
Wall's way-stations were standing in the Pine Highland's pine forest. **All 290
pages now stand on their own province's ground**, the fix is geographic and not
cosmetic, and the borders are unchanged to the tenth of a metre. The whole of it
is the first section below.

Everything below was measured in a headless Chromium walk of this build, with
`--use-angle=metal`, viewport 1440x900, the page at DPR 1 and the plates at DPR 2.
Numbers are reported as measured, worst run first where runs disagree.

---

## Round 2: every station stands on its own country

The marriage passed its verification and the verifier named one real defect: the
buildings were right and the geography was not. Twenty-five of the sixty-four
Upgrades way-stations, thirty-nine per cent of the largest province, stood on
Pine Highland ground, because the cliff road's switchback ladder ran west to
x=146 and south to z=-56, straight through the Highland's `plugins` district,
while every Wall anchor was east of x=168. Eight of them stood where their own
province carried under a tenth of the earth. Nine more pages had the same fault
at a tenth of the scale at the Forest Gate, and `/release-notes` was a Getting
Started page reading its lantern on the Upgrades Wall's crag.

**The fix is geographic.** Nothing was re-dressed to match the floor it happened
to land on, and no border was hardened to buy the answer. Districts moved,
way-posts were planted along the road the Wall's own pages already climb, and
seats that fell in another province are now passed over the same way seats that
fall in the sea always were.

### The ground under all 290 stations, measured before and then again after

`qa/g1-ground.js` reads the province field at every station's own position and
compares the page's **own** province, taken from `taxonomy.json` and nothing
else, with the province that actually holds the ground there.

| | before | after |
|---|---|---|
| pages standing on another province's ground | **35 of 290** | **0 of 290** |
| median own-province weight, whole corpus | 0.8687 | **0.9156** |
| mean own-province weight, whole corpus | 0.7842 | **0.8800** |
| lowest own-province weight anywhere | 0.0000 | **0.5539** |
| pages under 0.10 of their own ground | 8 | **0** |
| Upgrades stations on Pine Highland ground | 25 | **0** |
| Development / TypeScript stations on terraces ground | 6 | **0** |
| Features / Configurations stations on highland ground | 3 | **0** |
| `/release-notes`, a Getting Started page, on Wall ground | yes, weight 0.000 | **no, harbour 0.757** |

Province by province, own-province weight where the pages actually stand:

| province | pages | median before | median after | worst before | worst after |
|---|---|---|---|---|---|
| The Harbour Town | 23 | 0.9713 | 0.9713 | 0.0000 | **0.7585** |
| The Olive Terraces | 114 | 0.8853 | 0.8854 | 0.3583 | **0.5539** |
| The Pine Highland | 66 | 0.7641 | **0.8204** | 0.3735 | **0.5567** |
| The Upgrades Wall | 64 | 0.6794 | **0.9311** | 0.0410 | **0.7084** |
| The Cloud Archipelago | 23 | 0.9993 | 0.9993 | 0.9971 | 0.9971 |

Raw rows for both runs: `qa/geo/g1-before.json`, `qa/geo/g1-after.json`. The
verifier's own `qa/q2-provinces.js` agrees, from its own independent reading:
`pages standing on the wrong province ground: 0`, and 23 / 114 / 66 / 64 / 23
placed and standing on their own ground.

### What actually moved

1. **The cliff road was pulled off the pines.** `CLIFF_PTS` used to swing west to
   x=146 and south to z=-56. It now climbs between its own rails, x=168 to x=193,
   from the foot of the cliff to the head of the Crossing. Seven legs west of the
   ravine against eight before, 154 m of road against 171 m, the same ladder to be
   counted from the harbour mouth, and the east ladder beyond the Crossing
   untouched.

2. **Three Wall way-posts were planted on the road.** New in `terrain.js`:
   `POSTS`, anchors that shape the province field and nothing else. They flatten
   no terrain, carry no district and build no house. `road-foot` (172, -2),
   `road-mid` (170, -15) and `road-head` (172, -27), radius 7, put the Wall's
   country under the road the Wall's own pages climb. This is the verifier's own
   second suggestion, and it is the honest one: a province's country is the
   ground its road walks over, not only the districts it was handed.

3. **The Plugins district left the foot of the Wall.** `plugins` sat at
   (156, -44) with radius 20, which physically *contained* the corridor the
   Upgrades ladder needed; no amount of way-posting could have fixed that without
   lying. It moved down the ridge to (144, -64), 66 m clear of the Wall foot and
   in line with `dev` and `ts`, so the Pine Highland now reads as one ridge
   instead of an arm reaching under the cliff. Its twenty pages moved with it,
   district, floor tint, needle underfoot and all.

4. **The Highland's back country followed it.** The croft field at (128, -86) was
   80 m from any highland anchor and its huts were standing on terraces ground.
   It is now (132, -84) radius 20, and the third field moved from (176, -80) to
   (168, -84).

5. **A seat in another province is no longer a seat.** The concentric ring layout
   already refused seats in the water. It now also refuses seats where the page's
   own province does not hold at least 0.55 of the ground, and the overflow that
   used to drop on a hashed bearing now walks out of the district in the direction
   that keeps it deepest in its own country. Crofts get the same test. This is
   what closed the six Development and TypeScript strays and the three
   Configurations strays without touching a single building.

6. **The Golden Shore is the harbour's light.** `/release-notes` is officially
   `cms|Getting Started`; it was reading its lantern at the top of the Upgrades
   Wall on ground that carried none of its own province. The lighthouse has not
   moved and has not changed: it stands on the crag exactly where it stood, and
   still turns in the keeper's hour. What changed is whose cape it stands on. The
   harbour keeps the light, so the harbour keeps the cape: `crag` left the Wall's
   anchor list and a harbour way-post `lightcape` (240, -76, radius 13) took the
   headland. The door of the light moved eleven metres seaward to (239, -76), and
   the release notes are now read on harbour ground at 0.757. The Wall's weakest
   station anywhere still holds 0.708 of its own earth, and the Wall's country now
   ends where its last page does, at the approach.

7. **A fifth handover was built, because there is now a fifth border.** Wall to
   Harbour on the cape had no threshold and no stone. It has both: two limewashed
   pillars a boat can pick out and a province stone reading **The Light's Cape**,
   built the way the other four are, on a spot the field itself chose.

### The borders did not harden to pay for it

`qa/g3-ecotone.mjs` walks a dense transect through each crossing and reports the
distance over which the leading province goes from a tenth of the ground to nine
tenths, and the steepest one-metre change in any province's weight anywhere on a
1 m lattice over the whole map, 430 by 260 metres of it.

| crossing | ecotone before | ecotone after |
|---|---|---|
| Terrace Gate, harbour to terraces | 38.4 m | **38.4 m** |
| Forest Gate, terraces to highland | 44.0 m | **44.0 m** |
| Wall foot, highland to wall | 49.0 m | **49.0 m** |
| Wall foot, southern transect | never resolved: the road was in the pines | **36.6 m** |
| Causeway, harbour to archipelago | 25.1 m | **25.1 m** |
| The Light's Cape, wall to harbour | did not exist | **48.4 m** |

**Steepest one-metre step in the province field, anywhere on the map: 0.0448,
at (53, -28), before and after, to four decimal places.** The three borders the
verifier walked are unchanged to the tenth of a metre. `ECOTONE` is still 11.0.
Nothing was sharpened.

Walked again on real held keys, `probe/borders.js`, four stops per border at 26 m
and 9 m either side:

```
Terrace Gate    harbor   harbor   terraces terraces
Forest Gate     terraces terraces highland highland
Wall foot       highland wall     wall     wall
Light's Cape    wall     wall     harbor   harbor
Causeway        harbor   harbor   cloud    cloud
```

The Wall foot now reads `highland` at 26 m back where it used to read `terraces`:
the border moved east off the three-province pile-up, so the approach to it is
the province you are actually leaving.

### The district floor tint lost its step

Inherited from the base build unchanged, and the one hard edge left in a build
whose whole argument is that edges are walks: the swept district floor stopped
dead at `r * sqrt(0.5)`, 0.7071 of the district radius. It now eases, full inside
0.500 r, gone by 0.920 r, on the same smoothstep the province blend and the
growth use.

Measured, not asserted. `qa/g11-tintdiff.js` serves the pushed build with **one
file swapped**, `world.js` carrying the old hard step and identical geography, so
subtracting the two terrain colour buffers vertex for vertex cancels the lattice,
the grain hash and everything else, and leaves only the tint. Bucketed by
normalised radius across every district at once:

```
u        mean(old lum - new lum)
0.406 .. 0.499     0.00000     identical: both builds are fully tinted here
0.546              0.00125
0.663              0.00888
0.686              0.01331
0.709              0.00648  <-- the old step at 0.7071 r
0.721             -0.01097      the sign flips across it
0.779             -0.01021
0.861             -0.00183
0.931              0.00000     identical again: both builds are untinted here
```

The one-band sign flip of 0.0175 across 0.7071 r **is** the old step, isolated;
it is the only discontinuity in the curve, and the new build is the smooth side
of it. `qa/geo/g11.json`.

Worth saying plainly: on the terrain's 3.24 m vertex lattice, under a per-vertex
grain of plus or minus eight per cent, that step was already below what an eye
could find. `qa/g10-tintring.js` looked for it in the rendered vertex colours
across all 23 districts and could not separate it from the grain. It was a defect
in the source, it is fixed in the source, and it cost nothing to fix.

### Nothing was lost, measured again

`qa/g8-nothinglost.js` counts the pushed build (**PRE**), the fixed build
(**NOW**) and the Living Coast (**A**) in one run.

| | A | before | after |
|---|---|---|---|
| stations | 290 | 290 | 290 |
| instanced instances, total | 40819 | 42793 | **42793** |
| instanced populations | 41 | 43 | **43** |
| separate meshes | 52 | 51 | 51 |
| point sprites | 2620 | 2620 | 2620 |
| living keepers | 12 | 12 | 12 |
| draw calls | 109 | 110 | 110 |
| haze planes / god rays / water / sky | 8 / yes / yes / yes | 8 / yes / yes / yes | 8 / yes / yes / yes |
| sun elevation | 4.2 | 4.2 | 4.2 |
| gates | — | 6 | **7**, the Light's Cape added |

**Populations smaller after than before: none. Populations that vanished: none.**
Stations by province, unchanged: 23 / 114 / 66 / 64 / 23. Stations by kind,
unchanged: 27 guides, 5 landmarks, 15 hubs, 142 houses, 35 stoa bays, 16
workshops, 50 crofts. Zero page errors, zero console errors, zero failed requests
in all three.

The grass is the one population that moved rather than stayed: 34,000 tufts live
in every build, none lost, but they follow the province field, so the counts in
fixed sample discs shifted with it. The Wall's own disc gained: 289 to 365 tufts,
and the crag 55 to 106, both toward the Living Coast's own figures rather than
away from them.

Re-run of the verifier's own suite on the fixed build:

| their check | result now |
|---|---|
| `q2` provinces | 5, 16/16 sections claimed once, 0 duplicates, 0 unmapped, **0 pages on the wrong ground** |
| `q3` / `q3b` / `q3c` / `q13` borders | all five crossings still read as handovers, on foot and flown |
| `q5` keepers | 12 keepers, same positions, same seven kit meshes, same cloth colours to the hex |
| `q7` weather | one event, five landings, 5 distinct fog colours in all four states, fog spread up to x3.27 |
| `q9` / `q9b` laws | Quick Start compass leads then goes out, **290/290 provenance lines match**, 290/290 crumbs official, logbook 5 province headers, lantern ring fills and the flame remembers |
| `q10` p95 at DPR 1 | **9.3 to 9.8 ms** over the 16-leg walk with the squall up, against A's 9.7 to 9.9 |
| `q11` final | 290 stations, failure card with working retry, 21 requests all 200, reduced-motion parity, 0 errors |
| `q15` depth | 0 pages under 0.25 of their own ground, let alone 0.10 |
| `q19` all pages | 290/290 open with real body text, `filter: none`, `opacity: 1`, `rgb(255,255,255)`, 0 failures |
| `q8` sweep | 15 pages deep-read, 0 failures, titles match source |

### The Wall road, one camera, before and after

`qa/g2-roadshot.js`, same position, same bearing, same pitch, same weather, same
hour, served side by side against `iterlog/pregeography/`:

| | before | after |
|---|---|---|
| the switchback ladder from above the Wall foot | `iterlog/geoshots/road-ladder-before.png` | `iterlog/geoshots/road-ladder-after.png` |
| the Wall foot handover, from over the highland | `wall-foot-before.png` | `wall-foot-after.png` |
| eye height on the road at the old western turn | `road-eye-before.png` | `road-eye-after.png` |
| the crag and its light from the approach | `crag-before.png` | `crag-after.png` |
| the whole coast, the plate-4 camera | `coast-before.png` | `coast-after.png` |

In `road-ladder-before.png` the relimed shrines are scattered through the pine
forest among the highland's red roofs. In `road-ladder-after.png` the pines are
clear of them and the whole ladder stands on its own scree between the Wall foot
and the ravine. `wall-foot-before.png` shows the same thing from the other side:
white way-stations standing all the way in among the Development district's roofs
and its trees. In `wall-foot-after.png` they begin east of the cut, where the
Wall's ground begins.

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
`js/world.js`). Since round two that floor no longer stops dead at 0.7071 of the
district radius: it is full inside 0.500 r and gone by 0.920 r, on the same
smoothstep everything else here uses. Measured above.

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

## The five borders, walked

Each border marker stands at a **real crossing point of the province field**: a
spot found at build time where a step one way is one province and a step the other
way is the next, with room to build and a worn dirt approach laid to it from both
sides. The crossing bearing is the gradient of the field itself, not the angle of
the nearest road.

| border | where | what it is made of |
|---|---|---|
| The Terrace Gate | (26.8, 16.5) | lime on the seaward pier face, terrace red on the inland one, a pantile cap, drystone running off both shoulders into the walled olive country |
| The Forest Gate | (95.4, 3.3) | two pine trunks and a beam, no plaster at all, rail fence off both shoulders, the first pines behind it |
| The Wall foot | (154.7, 1.6) | no gate: the soil ends, the road is cut into coursed limestone, and the first relimed pillar of the sixty-four stands on the cut |
| The Light's Cape | (225.9, -66.5) | no gate either: a cape has no doorway. Two limewashed pillars a boat can pick out, where the Wall's last way-station gives out and the headland the harbour's light stands on begins |
| The Causeway | (-41.5, 49.7) | laid stone over the shelf with a kerb the sea washes, out of the harbour and into the archipelago |

`probe/borders.js` walks each of them on foot, deriving the direction from the
gate's own recorded bearing, and shoots four frames: 26 m before, 9 m before, 9 m
after, 26 m after. The province reported at each stop:

```
Terrace Gate    harbor   harbor   terraces terraces
Forest Gate     terraces terraces highland highland
Wall foot       highland wall     wall     wall
Light's Cape    wall     wall     harbor   harbor
Causeway        harbor   harbor   cloud    cloud
```

The Wall foot used to read `terraces` at 26 m back, because Configurations,
Development and Upgrades piled up within thirty metres of each other there. Round
two moved the border east off that pile-up and it now reads `highland` at 26 m
back: the approach to a border is the province you are actually leaving.

Plates `b1` to `b5` in `planches/` show each border from seven metres up and
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
| `planche-2-the-vista.png` | The vista. Fifteen metres above the north shoulder of the Upgrades Wall, fifty above the sea, looking west-north-west. The Wall's own bleached limestone is under the camera and behind it, and everything *in frame* is somebody else's ground, which is the point of the plate: maritime pine and cypress on the warm brown needle floor of the Pine Highland, the burnt terracotta and dark shingle of its roofs and the terraces' below that, the pale harbour beyond them, and the Cloud Archipelago on the water beside the sun road. |
| `planche-3-the-handover.png` | The handover, mid-walk on real held keys, with the low sun behind so both provinces are lit: harbour ground under the boots, the Terrace Gate on the crossing with its lime and terra faces and its drystone shoulders, and the red terra rossa of the Olive Terraces beyond it. |
| `planche-4-the-detail.png` | The detail, three quarters on at 8.6 m: an islet house on the Cloud Archipelago. Flat roof, parapet and its coping, quoins turning the corner, door reveal with jamb and lintel, slatted blue shutter, sill, threshold slab, lantern cage with one lit pane, and its own painted board reading `Project logs · since 2026-06-17 · 6 commits`. |

The five provinces, one plate each: `prov1-the-harbour-town.png`,
`prov2-the-olive-terraces.png`, `prov3-the-pine-highland.png`,
`prov4-the-upgrades-wall.png`, `prov5-the-cloud-archipelago.png`.

Three of those five cameras were re-set in round two, and why:

- **`prov1`** came back a wall filling the frame with no harbour town in it. The
  old eye-level mark stood a hand's breadth from a gable. It now stands on the
  rise north of the plaza at roof height with the sun off to the right, so the
  plate is what it says: limewash, terracotta, chimneys and their smoke,
  cypresses, the harbour behind, the Golden Shore on the skyline.
- **`prov3`** stood where the Plugins district used to be. That district moved
  down the ridge in round two, so the camera followed it and looks west over its
  roofs into the light: dark shingle, grey render, maritime pine and cypress.
- **`prov4`** stood south of the old ladder and came back mostly shadow once the
  road moved. It now looks back down the switchbacks from the high bank above the
  Crossing: the whole road of relimed way-stations on its own pale scree, their
  lanterns lit, and the Pine Highland stopping dead at the foot of it.

The five borders: `b1-terrace-gate.png`, `b2-forest-gate.png`,
`b3-wall-foot.png`, `b4-the-causeway.png`, `b5-the-lights-cape.png`.

The base build's own plates, all re-shot on this coast so nothing in the folder is
stale: `plate1-the-long-light.png`, `plate2-evidence-of-habitation.png`,
`plate2b-a-keeper-on-his-round.png`, `plate2c-laundry-between-houses.png`,
`plate3-the-colonnade.png`, `plate4-the-whole-coast.png`, `plate5-the-squall.png`,
`plate6-reading-is-sovereign.png`.

Walked border strips are in `probe/borders/`, per-province weather frames in
`probe/wx/`, and the measured ground swatches in `probe/swatch/`. Round two's
before-and-after camera pairs are in `iterlog/geoshots/`, and the whole
pre-geography build is kept in `iterlog/pregeography/` so any of it can be served
beside this one.

**Every plate in the folder is a plate of this build**, and that is measured
rather than claimed. `qa/g6-platefresh2.js` re-shoots the vista from the pushed
build, from the pre-geography build and from a second independent session of the
pushed build, with one identical declared camera, and compares all three against
the shipped file:

| | full frame | downsampled to 96x60 |
|---|---|---|
| the same build, two separate sessions: the noise floor | 7.08 | 6.87 |
| **the shipped plate against this build** | **7.03** | **6.82** |
| the shipped plate against the pre-geography build | 8.37 | 8.28 |

The shipped plate sits *at* the two-session floor against the current build and
clearly outside it against the old one. The floor is not zero because half the
frame is wind-moved foliage; within one session, two frames 1.8 seconds apart
already differ by 2.97.

---

## Known and not hidden

- **Hue separation is compressed at distance.** At four degrees of solar
  elevation, with an amber sun and the sunward haze the base build's light depends
  on, everything more than about a hundred and fifty metres away goes the same
  honey. The provinces separate in the near and middle field, in the vertical
  surfaces and in the growth, and they separate measurably in the swatches. They
  do not separate on a far hillside seen into the sun, and no amount of palette
  work will make them, short of changing the hour, which was not on the table.
- **Two of the four land borders fall inside built-up ground.** The Terrace Gate
  and the Forest Gate stand where the province field genuinely crosses, and that
  place happens to be between two ring towns rather than in open country. The gate
  spot search guarantees six and a half metres of clearance and lays a dirt
  approach, but a walker crossing there is walking a street, not a meadow. The
  Wall foot, the Light's Cape and the Causeway are all three in the open.
- **The islet flanks go very dark on their shaded side.** They are lit only by the
  hemisphere and a warm ground bounce at this hour, which is correct, and it is
  still the weakest thing in a close approach from the east. The slope rock was
  given a pale limestone tint for exactly this and it only half fixes it.
- **Peak draws sit exactly on the ceiling, not under it.** 120 of 120. Three cuts
  bought that and they are named above; there is no margin left for another
  species without another cut.
- **The crag is the harbour's cape now, and it looks a shade warmer for it.**
  Giving the Golden Shore's headland to the province whose light stands on it is
  what put `/release-notes` on its own ground, and it moves that headland's earth
  from the Wall's bleached limestone toward the harbour's warm sand. At four
  degrees of sun the difference is small and arguably the name's own argument, but
  it is a change to the climax of the walk and it is named here rather than left
  to be found: `iterlog/geoshots/crag-before.png` against `crag-after.png`.
- **The Wall's western ecotone is the narrowest of the five.** 36.6 m on the
  southern transect against 38 to 49 m elsewhere. It is still tens of metres and
  still the same `ECOTONE` of 11.0; it is narrower only because the Wall's
  way-posts and the Highland's `plugins` district are 26 m apart there rather than
  60. Nothing was sharpened to get it.
- **`localStorage` is still keyed `longlight.read`** after the rename to The
  Golden Shore. Harmless, and changing it would drop every reader's record of what
  they have read, so it stays.

## 2026-09-07 · THE PORTAL NETWORK, EIGHTH ROUND: SIX WAYS HOME

## ROUND 1 — THE MAP OF THE SEVEN CROSSING IMPLEMENTATIONS

Read before a line was written, so that the Golden Shore is joined to the network in each
world's own grammar instead of having a generic button bolted onto it.

| World | Where the crossings live | The affordance | The confirm | The beat and the jump |
|---|---|---|---|---|
| The Long Way Through | `longway.js`, `PORTAL` / `PORTAL_LINES` / `PORTAL_ASK` (~l.6371) plus the placements in the walk loop | geography: an overlook above a valley, a kiosk spinner rack, a flowered verge, a sloop and the ink water off Land's End, and one moving star among the constellations | `#portalask` carved notice, `portalAsk/portalYes/portalNo`, Y / N / Esc / Tab, `paYes` focused | `PORTAL.active` beat timed by `PORTAL_DUR`, then `../KEY/`; REDUCED crosses at once |
| Pixel Docs City | `pixelcity.js`, `PORTALS` array + `PORTAL_BY_KIND` (~l.5283) | five stations, six berths placed by the town builder as `spots` with a door prompt: a bookshop, a botanist stall, two moorings, a fingerpost, an observatory | `#portalsign`: a wooden town sign, `THIS WAY LEAVES TOWN - ANOTHER WORLD ENTIRELY. GO?`, `[Y]ES` / `[N]O`, Y / N / Esc / Tab / backdrop-click | `#portalbeat` line + `sndSynth`, 980 ms, then `P.href` |
| The Herbarium | `appendix.js`, `SPECIMENS` (~l.330) on one appendix plate filed after the last drawer | six specimens received on exchange, each a pressed sheet with figure, binomial, field note and collector mark | the loan slip: `Loan desk · recall of loan`, `This specimen returns to its origin – another world entirely. Follow it?`, YES / NO, Y / N / Esc / Tab | seal thumps, sheet goes `appdx-lending`, `CROSS_MS` 720 ms, then `sp.href` |
| FIRST LIGHT | `firstlight.js`, `askCrossing` / `CROSS_DEST` (~l.1223) | instruments doing what they always did: the aft camera, the telephoto ridge, sample-tray cell 07, the scope's rigged sail echo, the receiver's guard band, the four-colour insert in the mission papers | `#gonogo` GO / NO-GO poll, `YOU WILL GO THROUGH THIS DOOR TO ANOTHER WORLD`, Y / N / Esc / Tab / Enter, capture-phase so the room hears nothing else | a log line, a sound, `crossTo(key, ms)` then `../KEY/` |
| Carta Strapiana | `deadreckoning.js`, `eggs` + `PORTAL_Q` + `crossTo/reallyCross` (~l.8116, l.8934) | six marks derived from the survey: the nameless city, the ink water, the coastal path, the moving star, the pressed specimen in the log, the bottle; each is also printed on the A3 chart in `a3chart.js` | `#portal` plate, one question per key in the sailor's voice, `po-yes` / `po-no`, Y / N / Esc / Tab / Enter; NO sets a 45 s `denyT` so the sea stops asking | `captionNow(beat)` then `../KEY/` after ms; REDUCED goes at once |
| The Four-Color | `fourcolor-cast.js`, `SIBLINGS` (~l.9981) and `sibAdPage` / `portalConfirm` | interstitial house ads in the back matter only: one `sibad` page and one `backad` page per issue, never mid-story | `.portal-confirm`: `HOLD ON THERE, PILGRIM!`, an editor's note naming the destination, `YES — SEND ME THROUGH!` / `NO — I'LL STAY ON THE STAND`, Y / N / Esc / Tab | no beat: `location.href = ad.dir` |
| The Golden Shore | nothing: it was born after the network was fixed | — | — | — |

Common law read off all six working implementations, and kept by everything added in this round:
one question before any crossing, phrased in the world's own voice and naming the destination;
YES and NO as real controls reachable by mouse and Tab; Y confirms, N and Escape decline, Enter
takes the focused control; NO is the safe default and returns the exact moment before the ask;
nothing crosses on a stray press; reduced motion gets the same question and skips only the beat.

## ROUND 2 — WHAT WAS BUILT, AND WHAT WAS TAKEN OUT

This world had nothing: it was born after the network was fixed at seven
highlights. It now has **six ways home**, and they are built in this coast's own
idiom, which is a walked coast — six things standing on ground you reach on foot,
lettered, and read from where you stand before anything asks you anything: a
fingerpost at the head of the coast path, a milestone on the road out of town, a
loan crate roped shut on the quay, a lit window on the pine ridge, a chart-boat
at her mooring, and a newsstand on the promenade.

### 1 · BY THE DEEP LEFT THE NETWORK

The owner's ruling: *"il faut enlever le bateau qui fait reference a By The Deep
car ce projet est aux archives maintenant."* Not only the boat. Every affordance
in every world that led to By the Deep is gone, whole — not re-pointed at
something else, not left riding at anchor with nothing behind it — and every
hole a removal left is closed in the terms of the world it was cut from. By the
Deep is still playable in the archives; it has simply stopped being a place the
living projects point at.

| world | what led to By the Deep | what came out | how the hole was closed |
|---|---|---|---|
| The Long Way Through | the sea off Land's End turned to living cartoon ink — three hard swirls, flicked drops, and a prompt at the bench: FAR OUT, THE SEA TURNS TO LIVING INK | the swirls, the drops, the prompt, the `PORTAL_DUR` / `PORTAL_LINES` / `PORTAL_ASK` entries and the `inkX` debug spot | Land's End had two sea exits and now has one, the sloop off the point. The far water is water again, and the 290 lights on it are the whole of what that shore has to show |
| Pixel Docs City | a rubber-hose steamer at the second mooring, winking as the courier came near | the hull, the funnel, both bakes of her face, the wink tick, `steamerProp`, the berth and the `PORTALS` entry | the harbour ran two berths so two vessels had room. It runs one, and the engraved sloop — which used to lie off-centre to leave the steamer room — now lies where a single vessel lies, at the middle of the quay |
| The Herbarium | *Laminaria buffa*, an inked cartoon kelp, one of six loans on the appendix plate, with its own loan slip | the sheet, the figure, the slip, and the sway rules written for the one living specimen | a plate with a hole in it is a plate nobody mounted. The plate was re-laid for five: a six-column measure, each sheet spanning two, three over a centred two. Every count the plate states — lede, field number, header, label — now says five |
| FIRST LIGHT | the receiver's guard band carried a carrier past C27, a cartoon orchestra a century old, and holding it took the room down | the caption row, the hold, the `CARRIER` read-out, the two-second broadcast voice and its duration entry | the guard band is what a guard band is: ruled off, marked GB, and empty. The needle still runs the whole band and still reads the frequency out; past C27 it now reads `GUARD BAND · NO SIGNAL` |
| Carta Strapiana | the ink water — the deepest sounding in the survey, drawn in another hand, with a white-gloved buoy waving in it | the patch, the buoy, the approach hint, the `inkstain` on the deck chart *and* on the A3 sheet, the rumour line, `EGG_HINTS.ink`, and the portal question | the deepest water is only deep water again. The slot it vacated is now a different water to sail to and a different mark to make for: the keeper coast |
| The Four-Color | a Saturday-matinee house ad, BY THE DEEP, in the back matter | the ad, its screened art, and the title from the stand's rotation | the house does not advertise a title that is out of print. The stand carries six titles, the rotation counts to six, and the two ads in any one issue are still guaranteed to be different titles |

Nothing points at By the Deep from any living project. Grepped, and then walked:
the matrix probe below intercepts `../bythedeep/` in all seven worlds and reports
**0 attempts to reach it** across the whole 42-pair sweep.

### 2 · SIX CROSSINGS OUT, ONE PER WORLD, EACH NATIVE TO IT

Every one of them is discovered the way that world teaches discovery, and every
one of them is honestly about the Golden Shore: golden hour, a keeper coast, and
lanterns that hold the days since a page was tended.

| world | the crossing | how you find it | what it says about the Golden Shore |
|---|---|---|---|
| The Long Way Through | **THE EVENING STAR** — the first light out, low in the west over the country the walk came from, and the only warm star on that sky | she is a star among the citation stars, and the trail already taught you that one star up there answers a hover; hers is a different colour and a different hour | *she stands over a coast still in the light*, and the crossing reads WEST UNDER THE EVENING STAR, TO THE COAST STILL IN THE LIGHT |
| Pixel Docs City | **THE LAMPLIGHTER'S YARD** — a low walled yard off a working street: a rack of trimmed lanterns each burning at its own strength, a ladder, and a handcart loaded with the shaft pointing west | a station in the streets like the other five, found by walking into it, announced in the same one-line door prompt every threshold in town uses | THE CART IS LOADED FOR THE COAST ROAD WEST · A LAMP FOR EVERY PAGE — and at golden hour the line changes to *The lamplighter is leaving now, while the light lasts*, because that is when the cart really goes out |
| The Herbarium | **HELICHRYSUM VESPERTINUM**, an everlasting cut on the cliff road below the lamp room at the last hour of light, on a late-accession sheet of its own filed directly behind the finished plate | a specimen on loan with a loan slip, exactly like the others; the second sheet is filed behind the first, where a herbarium files a late arrival | *dry on the stem before it was ever picked, and so the only sheet in this cabinet that has not lost its colour* — and the sheet's own label carries the 290 lanterns, one for every page, each only as bright as the days since somebody last tended it |
| FIRST LIGHT | **THE SECOND TRACE** on the photometer — a channel the instrument was never asked for, far to the red of anything we are pointed at, and not a body: a staircase that does not change while we watch it | it is on an instrument already open in the readings panel, and the survey already taught you that instruments answer a hand | somebody else's *evening photometry, taken from the ground, at a station whose sun has not gone down*: one lamp per page of the same 290, each read at the brightness they leave it. A sister survey of the same lab, done by hand, with lanterns |
| Carta Strapiana | **THE KEEPER COAST** — a low coast past the last surveyed water, terraced and lit, with the lamp room on her shoulder, and her mark printed on the chart | a landfall you raise on the bow and can also click, like the nameless city; her mark is on the deck chart and on the A3 sheet, hatched inland the way a surveyor marks ground he has only seen from the water | the sailor's plate asks *That coast is still in the sun, and every terrace on it is lit. Stand in for it?* Her position is the survey's own: the sector of the sea whose islands took ink most recently |
| The Four-Color | **A HOUSE AD**, THE GOLDEN SHORE, in the back matter only — never mid-story | one `sibad` page and one `backad` page per issue, as the stand has always run them | ONE WEEK IN THE LAST HOUR OF LIGHT · *The keeper coast where the sun NEVER quite goes down! 290 lanterns burning along the terraces, one for every page, each one brighter the sooner somebody last tended it.* Coupon: BOOK MY WEEK ON THE KEEPER COAST |

### 3 · SIX WAYS HOME, BUILT ON A WALKED COAST

The Golden Shore's idiom is a coast you walk, so its ways out are **places on
the ground**. There is no list, no menu and no floating panel of destinations.
There are six things standing where a working coast actually puts a thing down
when a way leaves, every one of them lettered, and you read the lettering from
where you stand before anything asks you anything.

| the thing | where it stands | what is written on it | where it goes |
|---|---|---|---|
| the coast path **fingerpost** | at the head of the cliff road on the light's cape, x 236 z −61, with a walkers' cairn heaped beside it and the lamp room over its shoulder | THE LONG WAY THROUGH · 290 pages walked end to end, dusk the whole way — and the near arm names the cape you are standing on | The Long Way Through |
| the **milestone** on the shore road | set into the kerb in the gateway at the causeway head, x −26 z 42, where the town's made ground stops | PIXEL DOCS CITY · one day's walk up the coast · 290 lit windows, one for every page | Pixel Docs City |
| the **loan crate** on the quay | roped shut on the pier boards among the coast's own crates, x −60 z 1.4, waiting for the packet | TO THE HERBARIUM · pressed on this coast · carriage paid · dry side up | The Herbarium |
| the **lit window** of the night-sighting hut | on the pine ridge, x 135 z 19, shutter hooked back and the lamp already burning | FIRST LIGHT · 290 bodies on one plate · sighting begins at dark | FIRST LIGHT |
| the **chart-boat** at her mooring | lying alongside the pier on the south side, her bollard at x −78 z −2.55, her transom lettered, her sail furled on the boom | CARTA STRAPIANA · sails on the tide · 1,231 roads run as sea-lanes | Carta Strapiana |
| the **newsstand** on the promenade | inside the harbour gate, x −34 z 11, shutter half down and the spinner rack still turning | THE FOUR-COLOR · this week's issue in · 290 pages, printed in four colours | The Four-Color |

Every figure on them is this coast's own: 290 is the page count it lights, and
1,231 is the true number of links in the graph it stands on.

They read like the lanterns read, because they are read by the same label in
the same place in the same three lines: the thing's name, what is written on it,
and what the key does. At range you get the inscription; close to, you get the
longer reading. The only difference is what the key does — **E on a lantern
opens a page, E on a waymark asks a question** — and a lantern within reach
always wins the label by a clear margin, because the reading is sovereign and a
page is never shouldered aside by a signpost. (The probe caught that rule
working: from thirteen metres back the fingerpost yields its label to an
Upgrades way-station standing nine metres off, and only takes it back when you
are actually at the post. The lettering is on the post either way.)

Cost, because the draw-call ceiling on this build is a law: the whole set is one
material and one atlas — sawn oak, cut limestone, crate deal, kiosk paint, hemp,
tarred boat timber, iron, the four comic covers on the rack and all eight
lettered faces in the same texture — merged into **one mesh per waymark**, so the
frustum throws away the five you are not standing in front of. Nothing here casts
a shadow and nothing here is drawn into the water. Measured on the build's own
sixteen-leg route with the squall up, at DPR 1: **peak 118 draw calls with
the ways in and 112 with them hidden, against a ceiling of 120**, and p95
frame time 9.8 ms.

### 4 · THE CONFIRM LAW, KEPT IN SEVEN VOICES

Every new crossing asks before it takes you, in the shape its own world already
uses, and the answer is reachable by mouse, by Tab, by Y and N, by Enter and by
Escape. Nothing crosses on a stray press.

| world | the shape of the question | wording |
|---|---|---|
| The Long Way Through | the carved notice `#portalask` | A WAY OFF THE TRAIL · WEST UNDER THE EVENING STAR, TO THE COAST STILL IN THE LIGHT · YES · Y — GO THROUGH / NO · N — STAY |
| Pixel Docs City | the wooden town sign `#portalsign` | BOUND FOR THE LAMPLIGHTER'S YARD · THIS WAY LEAVES TOWN - ANOTHER WORLD ENTIRELY. GO? · [Y]ES / [N]O |
| The Herbarium | the loan slip | Loan desk · recall of loan · *This specimen returns to its origin – another world entirely. Follow it?* · YES / NO |
| FIRST LIGHT | the GO / NO-GO poll `#gonogo` | YOU WILL GO THROUGH THIS DOOR TO **ANOTHER WORLD** · THE SHORE STATION THAT IS STILL IN DAYLIGHT |
| Carta Strapiana | the sailor's plate `#portal` | *That coast is still in the sun, and every terrace on it is lit. Stand in for it?* — and a NO sets a 45-second silence, so the sea stops asking |
| The Four-Color | the editor's note `.portal-confirm` | HOLD ON THERE, PILGRIM! · *this coupon is a genuine PORTAL … next stop, THE GOLDEN SHORE, a whole other world* · YES — SEND ME THROUGH! / NO — I'LL STAY ON THE STAND |
| The Golden Shore | the crossing card `#crosscard`, on limewashed paper over the coast you can still see | A way off this coast · *The coast path leaves this cape for The Long Way Through — a whole other world, walked at dusk from end to end. Take it?* · Yes — take it / No — stay on the coast · Y goes · N or Escape stays · Tab moves between them |

In every one of them YES carries the focus so a keyboard walker can answer at
once, and NO is the safe default: doing nothing, pressing Escape, or clicking the
ground behind the card all leave you exactly where you stood, with the moment
handed back untouched.

Reduced motion gets the same question and skips only the beat, in every world
that has a beat. On the Golden Shore `qa/r19/reduced.js` raises all six cards
under `prefers-reduced-motion: reduce`: the card is up, YES has the focus,
Escape declines with nothing navigated, Y crosses, the card carries no animation
and no backdrop blur, and the boot is clean.

One thing the probe changed. On a coast you walk with WASD, the likeliest stray
press there is is the space bar — and a focused button takes the space bar as a
click, so the first build of the crossing card crossed on a space. The card now
swallows it. The only ways through are Y, Enter on the focused YES, and a mouse
on YES; W, the arrow keys and the space bar do nothing at all while it is up.

### 5 · THE 42 PAIRS, WALKED

The claim is not "the Golden Shore is joined". The claim is that the lab has no
dead end and no one-way street: from each of the seven living projects you can
reach the other six, which is 42 ordered pairs exactly. `qa/r19/matrix.js` (in
the Golden Shore's own `qa/`, and shared by all seven) walks or drives every one
of them **through each world's own affordance and each world's own confirm**, and
records the href the world actually tried to load. The seven are served under one
gallery prefix, exactly as they are in the gallery, so `../KEY/` is resolved by
the server and not by the probe. Every sibling document request is intercepted
and answered with a stub, so the crossing is really made and the probe still
stays in the world it started in.

**42 of 42 ordered pairs exercised, and not one of them refused.**

| from ↓ to → | LW | PDC | HERB | FL | CS | 4C | GS |
|---|---|---|---|---|---|---|---|
| **LW** | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **PDC** | ✓ | · | ✓ | ✓ | ✓ | ✓ | ✓ |
| **HERB** | ✓ | ✓ | · | ✓ | ✓ | ✓ | ✓ |
| **FL** | ✓ | ✓ | ✓ | · | ✓ | ✓ | ✓ |
| **CS** | ✓ | ✓ | ✓ | ✓ | · | ✓ | ✓ |
| **4C** | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ |
| **GS** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · |

LW · The Long Way Through | PDC · Pixel Docs City | HERB · The Herbarium |
FL · FIRST LIGHT | CS · Carta Strapiana | 4C · The Four-Color | GS · The Golden Shore

How each column was driven, in each world's own grammar and never around it:

- **The Long Way Through** — the carved notice raised by the same call every
  affordance on the trail makes, then the trail's own Y.
- **Pixel Docs City** — the courier walked to each station's spot and ENTER
  pressed at the threshold, with the camera zoomed into the streets because
  `cam.z >= 2` is the town's own condition for offering a door at all; then the
  town sign's YES.
- **The Herbarium** — the specimen pressed on the appendix plate, then the loan
  slip signed with Y.
- **FIRST LIGHT** — `askCrossing`, the same call every instrument makes, then GO.
- **Carta Strapiana** — sailed: anchored off the nameless city, stood in for the
  lamplit coast, fished the bottle out, took the path off the longest shore,
  followed the pressed sprig out of the log, and held the glass on the one that
  moves; then the sailor's plate answered.
- **The Four-Color** — the issue on the stand whose back matter carries that
  title, opened, paged to the ad, the coupon clipped, then Y.
- **The Golden Shore** — walked up to the thing on foot, read at range, read
  close to, E, then Y.

Page errors across the whole sweep: **none**. The only console lines in the sweep are twelve identical 404s from The Four-Color, for `images/plates/index.json` and `images/plates/manifest.json` — two optional plate-art files that build has always probed for and always done without; they predate this round and are unchanged by it. Attempts to reach
`../bythedeep/` from any living project: **0**.

The lab is served for this by `qa/r19/serve-lab.js`, which puts all seven under
`/lab/design/<world>/`. Every one of the seven boots clean under that prefix and
every `../KEY/` in every world resolves through it.

### 6 · WHAT DID NOT MOVE

- **QUICK START FIRST** holds in every world. Nothing added here competes with
  it: the Golden Shore's compass still leads to `/cms/quick-start` and goes out
  when it is read, and Pixel Docs City's standing invitation still overrides
  every door in town — including the new yard — until the courier walks off the
  landing tile, which is why the matrix probe has to walk away from it before
  the town will offer any threshold at all.
- **The reading stays sovereign.** On the Golden Shore a lantern in reach beats
  a waymark in reach by a clear margin, and the nearest ways stand more than
  eight metres clear of any station in any case.
- **Every existing crossing still works and still reads as it did.** The matrix
  below drives all of them, not only the new ones.
- **Every build boots clean headless** and serves correctly under its gallery
  prefix — `/lab/design/<world>/` in the probe, with `../KEY/` resolved by the
  server exactly as the gallery resolves it. `qa/r19/boot7.js` (in the Golden
  Shore's `qa/`) boots all seven twice, once in motion and once under
  `prefers-reduced-motion: reduce`: fourteen boots, zero page errors, and the
  only console lines anywhere are The Four-Color's two optional plate-art files,
  which it has always probed for and always done without.
- The Pixel Docs City **observatory sprite is untouched**: the broad low drum,
  the gallery ring, the true hemisphere dome and the telescope angled out of its
  open shutter are exactly as they were redrawn by hand.
- **Backups**: every file changed in this round has a `.r19.bak` beside it.

### 7 · WHAT THE LOOKING CHANGED

Every new crossing was shot in place and looked at against the world it sits in,
and four of them were rebuilt because of what the plate showed:

- **The fingerpost** stood with its arms 0.62 m off the post, so the post ate the
  first letter of THE LONG WAY THROUGH, and its cairn was a column of stones
  hanging in the air at the post's own ground height. The arms moved out to
  0.95 m and the cairn became a heap laid on the ground it actually stands on.
- **The chart-boat** had 0.18 m of freeboard and read from the quay as a mast
  with nothing under it. Her rail now stands 0.62 m out of the water and her
  hull draws deeper, so she reads as a boat lying alongside.
- **The lamplighter's yard** in Pixel Docs City was placed on an open enough
  street and a six-storey block still stood between it and the town's default
  heading: the yard was only ever seen by turning the town. A yard is a low
  thing, so its site test now asks for nothing built on the three-by-three in
  front of it, which is the quarter the default view looks over.
- **The lit window** was a pale panel: at golden hour a plastered wall in full
  sun is bright, and an unlit quad inside the tone mapping is no brighter. It is
  out of the tone mapping now, and the hut got the door it was missing.
- The **milestone** stood in scrub with no road in sight and its lettering in
  shade. It moved into the gateway at the causeway head, where the town's own
  law says nothing grows, and it is taller and set into a kerb.
- The **newsstand** was so dark it read as a black box, and its spinner rack was
  a blank slab. The paint came up, a counter shelf went in, and the rack now
  carries eight little covers in four colours, off register.
- The **keeper coast**'s chart mark was pinned to the sheet's margin under the
  engraver's whale. It now slides along the margin until it is clear of the
  beasts, because a coast hatched under a whale is a coast nobody can read.

### 8 · THIS WORLD'S OWN PROBE

`qa/r19/ways.js` — every one of the six walked to, read at range and close to, and each confirm exercised ten ways: E raises it, a stray press does nothing, Tab trades the two both ways, Escape declines, N declines, the mouse declines, Enter on NO declines, Y goes, the mouse goes, Enter on YES goes. `qa/r19/perf.js` — the draw-call cost, measured with the ways in and with them hidden. `qa/r19/matrix.js` — the 42 pairs. `qa/r19/reduced.js` — the same six under reduced motion. `qa/r19/boot7.js` — all seven booted in both motion modes. `qa/r19/serve-lab.js` — the gallery-prefix server all seven are probed through.

## 2026-09-07 · the keeper stops speaking over what you are reading

A keeper's line sits at 17 percent from the foot and a waymark's label climbs
from 13, so the two met at the bottom centre: `42 crates on the quay, one for
each page touched this month` printed straight across the night-sighting hut's
own description. Caught by the portal verifier in `way-firstlight-near.png`.

The line now measures the label at the moment it speaks and stands just above
it; with no label up, it hands the placement back to the stylesheet and sits
where it always did. Measured against a real label: 45px of overlap before,
none after, and the line still well on screen.

`BACKUPS.md` also lands, because the restore points here were mislabelled: the
`.gs.bak` files are the true pre-round state and the `.r19.bak` files are a
mid-round snapshot that already carries the new crossings.

## 2026-09-07 · the crossings stop announcing where they go

The owner caught the loan crate naming The Herbarium twice over: on a sign
painted into the world, `TO THE HERBARIUM`, and again in the confirm. He was
right, and the fault is in the brief rather than the build. The law he validated
reads `THIS WAY LEAVES TOWN - ANOTHER WORLD ENTIRELY`, which names nothing; the
wave brief for this world added "each names its destination honestly", and the
builder did as it was told.

All six crossings now say they lead somewhere else without saying where. The
signs became local names for local things: THE INLAND WAY, UP THE COAST, ON
EXCHANGE, NIGHT SIGHTING, THE CHART-BOAT, THIS WEEK'S ISSUE. Each confirm keeps
its shape and its honesty about leaving, losing only the proper noun: *"This
crate goes back to a whole other world, a cabinet that keeps these same pages as
pressed plants. Go with it?"*

The six names that remain in this file are in a source comment, which no player
reads and which a maintainer needs.

## 2026-09-07 · the footsteps stop sounding like a bicycle

The owner: *"les bruits de pas ne sont pas réalistes, on dirait limite un vélo,"*
and then *"fais les varier en fonction du sol."* The second half was already
true: eight recipes, one per surface the provinces put underfoot, chosen by
`surfaceAt` from the pier boards to the Wall's scree. The fault was elsewhere,
and it was two faults compounding.

Every footfall was ONE filtered click with a six-millisecond attack. And the
gait fired on an exact interval, `stepAcc > 0.78`, every time. An even train of
identical ticks is a freewheel, which is precisely what he heard.

A real footfall is two sounds: a heel that lands, and a toe that scuffs forty
milliseconds behind it. Every step is now both, each surface saying what the two
are made of; the level, the filter frequency and the heel-to-toe gap are drawn
fresh at every step; the feet alternate across the stereo field; and the stride
itself is jittered where it is counted, 0.70 to 0.87, so the rhythm breathes.
The pine litter cracks under about half of steps and not the others.

Nothing is louder than it was. It simply stopped being a machine.
