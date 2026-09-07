# THE GOLDEN SHORE: THE LIVING COAST

*Committee A direction for the polish auditions. Register: photoreal presence, now inhabited. The original commission text this fork answers is preserved in repository history; this brief supersedes it for Committee A only.*

**Logline.** The same golden-hour keeper coast, five minutes before dinner: keepers walking their real rounds with lanterns, gulls working the harbor, a boat coming in with the month's catch of commits, goats on the terraces, laundry breathing between houses, a squall marching in off the sea and leaving a rainbow over the town, and the light finally finished, so that standing anywhere on the coast reads as a photograph of a place someone lives in, where all 290 real Strapi documentation pages are still the only content there is.

---

## WHAT THE WALK SHOWED, AND WHAT WE OWE

The committee walked the base build headless before writing a word (probe/walk-visionary/, six frames plus a perf pass). The verdict of the walk, stated honestly:

- **The west is a white sheet.** Looking down the pier at the sun (w2-west-sun.png) gives a pale disc in a washed pastel sky. No honey, no weight, no limb. This is standing debt one and it is real.
- **Backlit is dead.** East of town looking west (w3-backlit-terraces.png), the shadow side of a plaster house is a flat grey smear, the grass is paper cutouts, and nothing separates a figure from the hill behind it. Standing debt two, confirmed.
- **The buildings are boxes.** Quoins are glued-on blocks, windows are painted rectangles with one emissive quad, a house on the ravine floats above the slope on its downhill side (w4-crossing.png), and station signs read mirror-flipped from behind.
- **The shoreline dithers.** The water edge breaks into stipple artifacts against the sand (w1-arrival.png).
- **The frame is rich.** p50 8.2 ms, p95 9.2 ms over 722 samples walking at DPR 2 headless. There is honest room for roughly a tripling of scene cost before the 33 ms law is threatened. We will spend it on life and light, and we will measure again after every lot.

Both inherited light debts are paid in full in this direction, first, before any goat is modeled. The order of work is: light, then geometry, then life, then weather, then sound. A plate is shot after each lot and kept in planches/.

## ART DIRECTION

**The thesis.** The base build proved the coast; it has not yet proved the hour. The Living Coast direction says the missing ingredient is not more world, it is evidence of habitation caught in finished light. A photograph of the Mediterranean at 19:40 is convincing because of three things: the color of the sun on edges, the depth stack of hazed planes, and the small motions of people and animals finishing their day. We build exactly those three things.

**Paying debt one, the honey disc.** The Sky.js dome keeps doing atmosphere, but the sun itself becomes a drawn object: a billboard disc at true angular size slightly oversized to 1.1 degrees for the telephoto feel, limb-darkened from a near-white #FFF3D6 core to a deep #FF9E3D rim, with an additive halo falling off over about six degrees. Sky parameters move to turbidity around 8, rayleigh 2.1, mieCoefficient 0.006, mieDirectionalG 0.94, sun elevation living between 3.2 and 5.5 degrees. ACES exposure drops toward 0.7 so the disc saturates instead of clipping. Acceptance test, shot headless: a frame straight down the sun road where the disc reads honey against a graded orange-to-violet horizon band, and the water carries a saturated glitter road, not a white wash.

**Paying debt two, rim and backscatter.** Every vegetation material, every keeper figure, every laundry cloth and awning gets a fresnel rim term injected via onBeforeCompile: strength 0.9 on vegetation, 0.6 on figures, 0.35 on plaster edges, colored #FFB65C, masked to the sun's hemisphere so rims only bloom when backlit. Grass cards and olive canopies additionally get a cheap translucency term: when the sun is behind the card, transmitted warm light lifts the silhouette from inside. The warm hemisphere ground bounce is raised so shadow-side plaster reads as material, never as a void. Acceptance test: the w3 camera position reshot, with the house edge, the grass heads, and a keeper walking past all carrying a visible warm edge against the hill.

**God rays where they pay.** Three placements only: the cypress rows of the cliff road, the harbor gate at arrival, and the colonnade bays in the last hour. Additive shaft cards faded by view angle, plus a quarter-resolution radial shaft pass that runs only while the sun disc is on screen. If the shaft pass ever costs more than 2 ms at DPR 1 it ships as cards only, and the CHANGELOG says so.

**Depth planes.** The patched height fog stays and gets a second gradient: warm #F5AD76 pooling low in the terraces, cooling toward a faint violet with altitude, so ridge lines stack as four separate planes from any high vantage. Fog is the cheapest telephoto lens there is and this coast is shot on one.

**Grain, vignette, film.** The existing grain and vignette overlays stay. If, and only if, the p95 stays under 26 ms after all lots, a subtle chromatic offset at the frame corners may be added; it is the first thing cut.

**Palette.** Unchanged from the commission: honey limestone, white and ochre plaster, terracotta, dusty olive, dark cypress, hammered-gold sea. Strapi violet #4945FF stays reserved for human care: banners, lantern trim, the Quick Start door, and now also the painted stern rail of the fishing boat and the thread tying the laundry lines.

**Ten times the geometry, spent where feet go.** A modular building kit replaces box-plus-texture within 40 meters of any walkable path: real door reveals with 12 cm jambs, window reveals with sills and working shutter geometry, balconies with baluster rows, chimney stacks with crowns, quoins that turn the corner as real courses, and roof edges that show actual half-round tile ends, ridge caps, and eaves shadows. Every kit piece is an InstancedMesh family; a building is an assembly seeded by its slug hash, so the same page always grows the same house. Beyond 40 meters the current silhouettes remain as LOD0. Pier planks become individual instanced boards with per-plank warp and nail heads. Boats get ribs, thwarts, mast, standing rigging as thin cylinders, coiled rope, and cork floats. Rocks grow to a family of five silhouettes, olives to three gnarled variants with segmented trunks, cypress to two, plus one umbrella pine for the headland. Props everywhere sensible and nowhere silly: barrels, crates, nets drying on rails, lobster pots, amphorae, laundry lines with wind-waved cloth, cafe tables under awnings on the market terrace, tool racks and troughs in the workshop quarter, three new-wood beehives beside the fresh-mortared AI pavilions. Defects from the walk are paid in the same lot: foundation plinths extend two meters into the slope so no house floats, signs get back boards so they never read mirrored, and the shoreline gets a foam band with depth fade so the water edge stops dithering.

**The performance law.** p95 at or under 33 ms at DPR 1, measured over a scripted 90 second walk that crosses all six provinces during a squall with twelve keepers active, reported without rounding in the CHANGELOG after every lot. Draw call ceiling 120, instanced everything. The base build's measured headroom is what funds this direction; the day the walk breaches 33 ms, the newest lot loses detail until it fits, and the plate caption says what was cut.

## THE WORLD PLAN

**Six provinces, one coast.** Provinces are the official taxonomy regrouped only by adjacency, never renamed; every boundary stone still carries the real section name and count, and district identity now extends into ground palette, vegetation mix, prop set, and soundscape.

1. **The Saltwater Harbor.** All 23 Cloud pages at the waterline. Wet dark stone, tide pools, nets, the working pier. Real data: the five cornerstone offices whose first commits all read 2023-03-01, the oldest stones on the coast; the harbormaster's desk at Project settings, 78 commits across 1,238 days of care; the 29 harbor stairs, the only paths that touch both salt and town, because exactly 29 citation edges cross between Cloud and CMS.
2. **Gatefront and Market Terrace.** Getting Started (19 CMS pages plus the 8 Cloud getting-started pages at the stair heads) and Features (26). Whitewash and ochre, awnings, cafe tables, laundry lines strung between houses, the violet door of Quick Start, 19 renovations by 5 hands since 2025-02-06. The three AI pavilions stand here in fresh mortar with scaffolding still up, honestly, because their first commits are 2026-04-23 and 2026-05-28. The CMS CLI signal mast rises over the terrace, one page, and answers the Cloud CLI mast down at the water.
3. **The Colonnade.** Content APIs, 43 pages as limestone stoa bays in dry oat grass, cicada country. Real data: 171 endpoint plaques carved with true methods and paths; the wellhouse of the Document Service API at the center, 48 roads drinking from it, 8 rooms radiating off the well, last filled 2026-07-23; the long guide of Understanding populate, 1,916 words of prose end to end by the corpus's own count, built as one continuous walk so you can always see the next column.
4. **The Workshop Quarter.** Configurations (45) plus Cloud Advanced configuration (5). Tool walls, workbenches under awnings, troughs, woodsmoke. Real data drives the smoke: a workshop chimney smokes only if its page was touched in the 30 days before the corpus date, and exactly 42 pages across the coast qualify, so the quarter reads worked-in without a single invented fire.
5. **The Olive Uplands.** Development (32), Plugins development (28), and the blue-shuttered TypeScript row (6). Groves, drystone walls, goat paths. The 50 zero-inbound crofts hide here and in the high maquis, off every path, one fig tree each, the explorer's reward unchanged.
6. **The Cliff Road.** Upgrades, 64 stations of switchbacks in wind-bent maquis and agave, entered over the stone Crossing of Breaking changes, 57 roads in and 52 out, re-mortared 2026-08-31, ending at the Golden Shore itself, relit 126 times since 2024-09-10, most recently 2026-09-02, by two hands only, once after midnight.

**Weather as passing events.** This committee's answer to HOW: weather is not a dial, it is something that happens to you while you are doing something else. A coast clock runs roughly ten-minute acts and draws the next event from a weighted bag, clear weighted heaviest; a pennant on the pier telegraphs the draw a minute early for anyone who learns to read it. Four states, all eased over 20 to 40 seconds, never cut:

- **Clear Gold.** The default finished golden hour described above.
- **Sirocco Haze.** Warm dust flattens the far planes, the sun softens to a fat apricot disc you can look at, shadows go pale, cicadas thicken. The vista becomes four stacked paper cutouts and photographs beautifully.
- **Squall Passage.** A slate curtain forms on the western horizon, visibly marches across the sea lane over about ninety seconds, swallows the sun road, arrives as wind, rain bands, rattling lantern glass and swinging laundry, passes over and east, and leaves the stone dark, the air rinsed, and a double rainbow standing over the town for one held minute. Keepers shelter under eaves while it passes and then resume their rounds; nothing about reading is interrupted.
- **Mist Burn-off.** A rarer opening act: the coast wakes wrapped in white-gold mist pooled in the terraces, station lanterns burning as haloed points, and the sun burns it off over two minutes into Clear Gold. Most likely on arrival, so some visitors get a different first photograph and a reason to return.

Weather is theater and says so: the last page of the logbook states, quietly, that on this coast the weather is weather, and the lanterns, dates, counts, and names are real. Reduced motion receives the same four states as one-second crossfades, no marching curtain, no rain streaking, no lightning; rainbows are permitted because they hold still.

**Buildings tied to what a station is.** Six types plus the default terrace house, resolved landmark first, then hub, guide, workshop, stoa, croft. Explained honestly on the logbook's final page, titled How to read this town.

1. **Hub courtyard houses.** The 18 stations with 15 or more inbound citations (Users and Permissions at 40, REST API at 25, Draft and Publish at 24, and their peers): two stories, arcaded porch, courtyard, benches, many paths converging in worn cobble. A hub looks like a place people gather because in the data it is.
2. **Leaf crofts.** The 50 pages nothing links to: one-room drystone, low door, no path, a fig tree. Loneliness rendered honestly.
3. **Workshop fronts.** The 50 Configurations and Advanced configuration pages: wide awning, workbench, tool wall, chimney smoking only on real recent care.
4. **Guide trailhouses.** The 13 guide pages plus the 27 Getting Started pages: porch, bench, painted route board, and numbered waymark posts out front, one per real numbered step list the page contains.
5. **Reference stoa bays.** The 43 Content APIs pages: open colonnade bays, endpoint plaques carved with real method and path.
6. **Landmark singletons.** The Crossing, the Golden Shore, the Wellhouse, the five harbor cornerstones, and the two CLI signal masts, each justified by the data cited above.

## THE NPC PLAN

**Who they are.** Keepers: the people the provenance file records 2,108 acts of care by. They are roles in the fiction, never portraits; the only proper names anywhere on the coast remain the engraved topAuthor names the lanterns already carry, straight from provenance.json. Figures are low-poly but articulated, walking silhouettes with lantern in hand after the light drops, dressed from a small cloth palette with one violet thread each. Every figure receives the rim and backscatter treatment; a backlit keeper on a ridge line is one of the three photographs this direction exists for.

**Rounds are real routes.** Keepers path only along citation footpaths, edge by edge from graph.json, at a walking 1.2 meters per second, pausing about ten seconds at each station to tend, hands cupped at the lantern, the same gesture the visitor learns with F. Within four meters a keeper stops, turns to face you, and offers one quiet caption line. Every number and date in every line is verifiable in the shipped data files, and the walk probe asserts each one at build time.

**The roster of twelve** (one for each station the provenance file says was tended after midnight, which the logbook notes):

1. **The Harbormaster.** Round: the five 2023-03-01 cornerstones. Line: "Five stones laid in one day, the first of March, 2023. This desk alone has taken 78 rounds of care across 1,238 days."
2. **The Lamplighter.** Round: up the 64 stations of the cliff road to the lamp room. Line: "Relit 126 times since 2024-09-10. The last was 2026-09-02. Two hands, all the way up, once after midnight."
3. **The Bridge-tender.** Round: pacing the Crossing. Line: "Fifty-seven roads arrive and fifty-two leave. Re-mortared 2026-08-31. Cross when you are ready."
4. **The Night-hand.** Round: leaning at the Docker house doorway, smoked lantern glass. Line: "Twelve visits by seven hands since 2025-02-06, and four of them after midnight. Some sentences will not wait for morning."
5. **The Net-mender.** Round: the 29 harbor stairs. Line: "Twenty-nine paths touch both salt and stone. I walk every one before dark."
6. **The Wellkeeper.** Round: the wellhouse and its eight rooms. Line: "Forty-eight roads drink at this well. Eight rooms off the courtyard. Filled fresh on 2026-07-23."
7. **The Gardener of the Colonnade.** Round: Understanding populate, end to end. Line: "One thousand nine hundred sixteen words under one roofline. Everyone loses the thread once. The columns are there so you find it again."
8. **The Newcomers' Guide.** Round: pier gate to the violet door and back. Line: "Nineteen renovations by five hands since 2025-02-06, all keeping one promise: start here, build something real before the sun is down."
9. **The Crofter.** Round: a slow loop past the unmarked crofts. Line: "Fifty houses no road remembers. I remember. That is the whole job."
10. **The Goatherd.** Round: the terrace walls between the workshop quarter and the groves, goats ahead of her. Line: "Forty-five workshops and thirty-two yards on this hill. Somebody keeps the goats out of all of them."
11. **The Fisher.** Round: brings the boat in on the coast clock, ties up, stacks crates on the quay. Line: "Forty-two crates this month. One for every house touched since the fourth of August. Good month."
12. **The Archivist.** Round: the release notes archive lane below the lighthouse. Line: "Two thousand one hundred and eight acts of care by seventy-seven keepers. I have written every one of them down."

**Ambient life, counted honestly where it claims a count.** Gulls work the harbor in a small flock and get loud when the boat comes in; the 42 crates on the quay are the real count of pages touched in the corpus's final 30 days; goats are goats and claim nothing; laundry lines breathe with the same gust phase as the trees. Under reduced motion, keepers stand at their stations and still face you and speak, the boat is moored, the gulls rest on the pilings, and nothing drifts.

## THE SOUND PLAN

All sound is synthesized in WebAudio at runtime, no files, no libraries, nothing downloaded. One AudioContext created on the first user gesture. One real toggle, M or the small speaker glyph, default gentle at half gain, state kept in localStorage behind try/catch. Nothing in the world is ever gated by audio; every spoken line is a caption first.

- **Shore.** Two pink-noise surf voices through slow lowpass swells on eight to eleven second periods, gain shaped by true distance to the waterline, equal-power panned by listener heading. Faint through the walls of the reading overlay, at one tenth, like a house by the sea.
- **Wind.** Bandpassed noise whose gust envelope is the same phase uniform that sways the vegetation, so ears and eyes agree; stronger on the cliff road, rustle shelf added only near trees, laundry adds a soft flap on gust peaks.
- **Cicadas.** Granular chirp beds in the colonnade and the groves, density falling as the sun drops, silenced by the squall, returning one by one after, which is the truest thing a squall does.
- **Gulls.** FM cries triggered from actual flock positions, sparse by default, excited for a minute when the boat ties up.
- **Goat bells.** Quiet inharmonic resonators panned from the actual goat agents, uplands only.
- **Footsteps.** Surface-true: boards, cobbles, dirt, dry grass resolved from the material under the player, cadence from real stride, volume from speed.
- **Lanterns.** A warm low hum with faint glass ticks inside six meters of any station, scaled by the lantern's real brightness, which is to say by days since last commit. The tend act adds one soft rising chime as the flame steadies.
- **Keepers.** Fabric-quiet footsteps; one low wooden knock when a keeper turns to you and the caption appears. No voices. The coast stays quiet enough to think in.
- **Weather.** Rain as comb-filtered noise with intensity following the curtain's true distance, thunder as soft brown rumbles, never cracks; the rainbow minute is nearly silent, sparse drips only; sirocco thickens the wind bed and mutes the high shelf.

## LAWS ACKNOWLEDGED

Reading is sovereign and untouched: the DOM overlay, Quick Start first, taxonomy signage on every boundary stone, and the tend-the-lantern act ship exactly as they stand. All asset and data paths stay relative for gallery-prefix serving. p95 at or under 33 ms at DPR 1 walking, measured over the scripted six-province squall walk and reported honestly. Reduced motion has full parity as specified per feature above. localStorage stays behind try/catch. English only. No em dashes anywhere, in world or in code comments. No new libraries beyond the vendored Three.js r170. Headless Chromium only for every probe and plate, viewport 1440x900, plates at DPR 2, --use-angle=metal, never a visible window. Every visible fact traces to content.json, graph.json, taxonomy.json, or provenance.json; the weather and the goats are the only fiction, and the logbook says so.

## PLATE LIST (for the audition shoot)

1. **The Catch.** From the quay at boat-tie-up: honey sun disc low over the water, rigging and ribs against the glitter road, gulls up, the Fisher stacking real crates, rim light on every line.
2. **The Squall Minute.** From the market terrace: the slate curtain halfway across the sea, half the coast still gold and half already grey, laundry standing out on the wind, one keeper sheltering under the colonnade.
3. **The Rounds.** From below the cliff road at dusk: the Lamplighter three switchbacks up, backlit, lantern swinging, the lighthouse turning above and the town lights pricking on below, fog planes stacked to the horizon.
