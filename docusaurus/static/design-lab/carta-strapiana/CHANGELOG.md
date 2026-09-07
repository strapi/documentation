# Carta Strapiana — the Golden Shore crossing

## 2026-09-07 · THE PORTAL NETWORK, EIGHTH ROUND: THE GOLDEN SHORE JOINS

The network was fixed when there were seven highlights. The Golden Shore was born after it and
was in it nowhere. This round adds one crossing out of this world to the Golden Shore, native to
this world's own grammar, and six ways home built on the Golden Shore's walked coast, so that
from each of the seven you can reach the other six.

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

This world's own new thing is **THE KEEPER COAST**: a low coast lying past the
last surveyed water, terraced and lit, with the lamp room on her shoulder and one
lantern along her for every page of the survey. She lies in the sector of the sea
whose islands took ink most recently — the survey's own freshest quarter, because
the coast where the light has not finished is the one somebody tended last — and
her mark is printed on the chart, hatched inland the way a surveyor marks ground
he has only seen from the water. She stands in the slot the ink water used to
hold, and the ink water is gone with the project it led to.

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

`qa/r19/keepercoast.js` — the coast raised on the bow at three miles and again at one, her mark shot on the chart, the plate raised by clicking her, and the sailor's NO proven to stand her off and silence the sea for 45 seconds.

## 2026-09-07 · the archived world leaves the source too

The owner asked for every reference to the archived sea to go from the living
worlds, not only its crossings. The crossings were already gone; what remained
were the provenance sentences in the source comments, which named it. Those
sentences now say what changed without naming it, and the full provenance stays
in this changelog. Carta Strapiana keeps its leadline call, `"By the deep, N!"`,
which is the sounding cry the sea was named after and not a reference to it.

## 2026-09-07 · THE QUIET OPENING, and the sirens stop overlapping the sea

The owner: *"les musiques que j'ai creees avec suno se declenchent trop tot, il
faudrait qu'elles arrivent au moins 3 a 5 minutes apres qu'on ait commence
l'application... je dirais meme qu'elles doivent arriver apres qu'on ait lu au
moins 4 pages"*, and *"elles ne doivent pas se chevaucher avec les autres
planches sonores"*.

**Two gates, and BOTH must be open.** Four minutes since this page loaded, the
middle of the three-to-five window he named, AND four distinct pages read. Both
are counted from the load, never from a stored visit, so an arrival is quiet
every single time, including for a returning reader whose islands are already
charted. Until both open, the lure stays at nothing and the anchoring song does
not begin: `sirenTick` will not raise her and `sirenAnchor` returns early.

**The ambient bus.** Wind, sea and rain now pass through one gain that rests at
1 and sits after the bed's own laws, so nothing in the mix changes when it is
idle. The sirens lean on it: the bed steps back in proportion as the lure rises,
and all the way back to 0.12 while the song is sung whole, coming up again over
two seconds when she finishes. The two songs already handed over to each other;
now neither shares the air with the water.

`probe-siren-gate.js` — twelve checks, all passing: the gate shut on arrival with
the lure at zero and no song; time alone not enough; three pages not enough; the
fourth opening it and a re-read counting once; the bus resting at 1, stepping to
0.363 within two seconds of the song starting and recovering to 0.901 after it.

## 2026-09-07 · the featured verse slot is removed

The owner: *"pour les verses, enleve ce mecanisme, je n'avais pas trouve de
chants de marins qui me plaisent donc j'ai abandonne l'idee."*

The suno folder held two unrelated things under one name. The SIRENS stay: two
recordings, event-driven, tied to the drowned register and now gated behind the
quiet opening. The VERSES were something else entirely, a featured shanty that
would take the deck alone while the crew stood silent, credited by caption, on
a rotation starting 45 to 90 seconds after load. It never had a recording and
now never will, so it is gone rather than left waiting: `loadSuno`,
`playFeatured`, `featured`, `featIx`, `nextFeatureAt` and the trigger in the
programme loop, plus `holdUntil`, which only `playFeatured` ever set and which
would otherwise have been a guard that could never fire. The manifest keeps
only its `sirens` key and the folder README says what the folder now is.

Worth noting for later: had a verse ever been added, it would have arrived
between 45 and 90 seconds after load, which is precisely what the quiet opening
was just built to prevent. The two slots were never gated alike.

Re-verified after the removal with `probe-siren-gate.js`: twelve checks, all
still passing, zero console errors.

## 2026-09-07 · the prefix probe counts the sea as it is

`qa/probe-s4-prefix.js` asserted `islands === 290` and had been failing on it.
Not a defect in the world: the two release-notes pages are struck from the sea
at source by `NOT_CHARTED` in `loadData`, because a release note is not a place
you sail to, so the survey holds 288 islands and always has since that ruling.
The probe simply never heard about it. Now `CHARTED = 288`, with the reason
written beside it. PREFIX BOOT: PASS.

## 2026-09-07 · Space answers the focused word on the plate

Same ruling as the rest of the network: a focused button takes Space as a click,
so the plate honours it exactly as it honours Enter, answering whichever word
holds focus. It is safe against the spyglass, which also lives on Space:
`portalKeydown` runs first in the dispatch and returns immediately when no plate
is open, so the glass path is reached exactly as before and only a raised plate
ever sees the key.

## 2026-09-07 · becalmed means becalmed

Under reduced motion the hull is frozen on purpose, and travel happens by
passage instead of by sailing. But the knots went on climbing with the sail, so
the instruments read way through the water while the ship had not moved an inch
and no distance ever closed. A log that reports a speed the vessel is not making
is the one thing a chart may not do.

She reads zero now. The passage is untouched and remains how she crosses to
anywhere, the keeper coast included: measured under reduced motion, a passage
still closes 1.6 nm to 1.2 in three seconds.

The portal verifier had filed this as "the sail-in path never opens", which was
the symptom; the cause was an instrument telling a story the sea was not.
