# ALPENGLOW
## Proposal C, the gameplay-first reinvention of BY THE DEEP

**Logline.** Every documentation page is a summit. You climb it, one reach at a time, and the reward at the top is the page itself: the summit book that 77 guides have kept since March 2023. The sea is gone; the corpus became a mountain range, and the range is honest to the last meter, because every meter is a word count and every rope is a real citation.

**Name rationale.** BY THE DEEP was the sea, and the sea died twice in this lab. The vision demands a new name. *Alpenglow* is the pink light that touches only the highest, most exposed rock at dawn and dusk. In this world it touches only the pages edited in the last 90 days. The name is the freshness signal; the title is a data mapping.

---

## 1. WHY THIS SURVIVES THE TRIBUNAL

Constitutional compliance, stated up front because it drove every decision below:

| Law | How Alpenglow satisfies it |
|---|---|
| Playable at first paint, no intro toll | First frame: you are already ON the wall, three holds below the first ledge of Quick Start Guide. One caption: "Hold to reach. Release in the green." Nothing to dismiss, nothing to skip. |
| ONE clear verb, readable in seconds | CLIMB. A climber on a wall, a hand reaching, a swing arc. Strangers recognize it before they read anything. |
| One card one subject | Route card, topo card, summit book, badge card: each surface carries exactly one subject, calm poster composition, generous margins. |
| Reading first-class, crisp DOM, never themed | The summit book is a pure white DOM panel, no gouache, no grain, no tint. All 33 block kinds rendered natively (tabs as tabs, tables in scroll containers, code with copy, admonitions, details, columns, cards, images). |
| Utility path sacred | Persistent top bar on every frame: instant search over 290 titles/descriptions/tags, plus a full Index gazetteer grouped by product and section. Both open reading directly, zero climbing required, ever. Hash deep links (`#/cms/quick-start`) land straight in the reading panel. |
| Every visible fact data-derived | Heights are word counts, pitches are h2 headings, grades come from a published quantile formula, ropes are the 1,231 citation edges, signatures and dates come from provenance.json, groupings speak product + section per taxonomy.json. Section 5 is the complete ledger. |
| Fluid, 50+ fps, p95 <= 16.5 ms | One Canvas 2D world with prebaked offscreen layers; per-frame cost is the climber, the rope, and <= 60 particles. Reading is DOM, outside the canvas entirely. Budget in section 8. |
| Reduced-motion complete | Timing pendulum becomes a no-timing reach; rappels become cuts with captions; snow and sway removed; every state change remains visible. Full parity of progression. |
| Sound CC0, gentle, one toggle, silent-complete | Five quiet sounds (wind bed, rope creak, latch tock, page turn, distant chough), all CC0 with credits in the Almanac, default OFF, one toggle. The game is complete in silence. |
| English only | All copy, all labels, all captions. |
| No libraries, headless probes only | Vanilla JS + Canvas 2D + DOM. QA via the existing 290-slug headless sweep. |
| Register never used or rejected in the lab | Golden-age-of-alpinism gouache poster. No sea, no town, no garden, no radio, no print, no rail, no cave. Mountains are virgin territory in this lab. |

---

## 2. STORY: THE ASPIRANT GUIDE

You arrive at the **Guides' Bureau** of a high valley at the start of the season. Two ranges face each other across the valley floor: the **CMS range** (ten massifs, 254 summits) and the **Cloud range** (six massifs, 36 summits). Two hundred ninety documented summits in all.

Since the first ascent on **1 March 2023** (Cloud / Getting Started, the Deployment route), **77 guides** have opened and maintained these routes. On every summit stands a metal box, and in every box lies a **summit book**: the route's living document, kept current by whoever climbed last. This is real alpine practice; summit registers exist on real mountains, and here the register IS the documentation page. Reading is not a reward bolted onto the game. In this world, reading is literally what is at the top.

The bureau posts **50 open problems**: faces that no fixed rope has ever reached (the 50 uncited pages). It also keeps the legend of the **12 night ascents**, routes that were opened or repaired by headlamp after dark (the 12 pages with night-time commits, Docker installation alone counting four). And it keeps the Almanac, the distilled history of every ascent ever logged (gitlog-docs.txt).

Signing all 290 books is how an aspirant becomes a guide. That is the campaign. That is why 290 pages and 77 hands live here: **the mountain is the corpus**. Every mountain fact is a git fact or a graph fact, and the fiction never has to lie, because alpinism already speaks in first ascents, route logs, signatures, grades, and maintained ropes, which is exactly the language of a documentation repository.

---

## 3. GAMEPLAY: THE VERB IS CLIMB

### 3.1 The one verb

**CLIMB.** Hold to reach, release to latch. Everything else (rappelling a citation, signing a book, tending a rope) is a downstream consequence of climbing. A stranger watching over your shoulder for five seconds knows what game this is.

### 3.2 The micro-loop (one move, ~2 seconds)

1. **Hold** (mouse button, touch, or Space): the climber's free hand extends toward the next hold and a **pendulum arc** swings across it, a wedge of the arc marked green.
2. **Release inside the green**: the hand latches, the body pulls up with a satisfying single-beat animation, grip refills slightly.
3. **Release outside the green**: the hand slips, the climber sags back one hold on the rope with a soft bounce. Never further back than the last piton (the start of the current pitch). No death, no fail screen, ever.
4. **Grip** (the chalk-bag meter) drains slowly while holding (6/s) and trickles down even at rest on small holds (2/s), refilling at ledges. Grip empty = automatic sag to the piton and a breather. Grip is the tension; the ledge is the release.

Base pendulum period 1.2 s, green window 28 degrees. On **crux pitches** the window narrows to 16 degrees and the period quickens to 0.9 s. Where a route forks (optional h3 variants), Left/Right arrows or tapping a side picks the line before the reach.

### 3.3 The pitch loop (one h2 section, 60 to 90 seconds)

Routes are divided into **pitches, and the pitches are the page's real h2 headings.** Quick Start Guide has five pitches because it has five h2s, and Pitch 1 is literally named "Part A: Create a new project with Strapi". Topping out a pitch lands you on a **belay ledge**:

- The pitch's heading text stamps onto the route topo card.
- A **Peek** button opens the reading panel scrolled to that exact heading anchor. Reading is woven into the middle of the climb, not just the summit; a climber who wants to read Part B right now reads Part B right now.
- Grip refills, a piton is set (your new floor).

Pages with no h2 (some breaking-changes children run 129 words) are **boulder problems**: one short, single-pitch scramble, five to eight moves, done in twenty seconds. The corpus's variety in page length becomes the game's variety in session length, for free.

### 3.4 The summit (the session beat)

Top out and the **summit box opens**. The summit book IS the page: full, crisp, first-class reading (spec in section 6). Under the title, the provenance line, all real:

> Route opened 6 Feb 2025 by Pierre Wizla · 36 ascents · 7 signatures · last signed 2 Sep 2026 · maintained 573 days

Then the two release beats:

1. **Sign the book.** Your mark joins the list, one stone is added to the summit cairn (localStorage, per-visitor, wrapped in try/catch). The Ascent Log ticks: 88 / 290.
2. **The descent is the citation graph.** From the summit station, the page's real outbound citations hang as **fixed ropes**, each labeled with its true destination title. Choose one and **rappel**: a fast, gorgeous zipline down the catenary to the next peak's base (1.5 to 2.5 s). Traversing the graph is the reward motion of the game. From Media Library you can ride to "Upload files using the REST API" because that edge exists in graph.json, and for no other reason.

"One more pitch" psychology is built from real data: from every summit you can SEE the ropes leading onward and read their real destination labels. The cliffhanger is the citation graph itself.

### 3.5 Progression (all thresholds data-derived)

- **The Ascent Log**: peaks signed / 290, drawn as a filling ridgeline silhouette per massif, grouped strictly by product + section (the taxonomy law). Completing a massif inks its full topo silhouette, an Imhof-style relief vignette, into your log.
- **Grades**: each route wears a real alpine grade (F, PD, AD, D, TD, ED) computed from a published formula: density = code blocks + tables, cut at the corpus quantiles 0 / 1 / 4 / 7 / 17 / 28. The legend in the Almanac shows the formula and the cuts. F routes teach the verb; ED monsters (the helper-plugin migration wall carries 45 code blocks) are endgame.
- **The 50 Open Problems**: the uncited faces. No rope arrives there; they sit off the rope network as untracked snow, reachable only by walking in from the valley (or by search, always). First top-out earns the **First Traverse** pennant for that face. Fifty pennants is the completionist chase, and it drags players precisely into the least-visited corner of the corpus, which is the most beautiful thing a docs game can do.
- **The 12 Night Ascents**: the night-edited pages can be climbed "by headlamp": the world dips to dusk for that ascent, the green window glows warm in the lamp cone. All 12 collected = the Headlamp badge. Docker installation, with 4 real night commits, is the crown of this set.
- **Giants and boulders**: heights are word counts, in meters. Project structure is a 79 m boulder by the trailhead. Release Notes Archives is the 10,828 m impossible giant looming past the head of the valley, taller than anything on Earth, exactly as absurd as a ten-thousand-word page is, and everyone will want to climb it.

### 3.6 The care act

Routes whose book has not been signed in over two years (from provenance `last`) show **frost on the fixed rope**. At such a summit the game offers a five-second ritual: **re-coil the rope** (a slow circular drag; on reduced motion, a single click). The route is marked "tended by a reader" in your log, and the card quietly surfaces the page's real GitHub edit URL as *"Report worn rope to the Guides' Bureau"*. The care act is gentle in the fiction and real in the world: the game routes attention toward stale pages and hands the visitor the actual repair tool.

### 3.7 Anti-frustration, honesty of skill

- Any route can be **hiked** instead of climbed: an automatic slow walk-up at 4x speed, no timing input at all, no badges earned. Play stays primary but skill never gates content.
- The utility path never touches the game at all: search and Index open reading instantly.
- Falls cost at most the current pitch. Grip and timing create tension, never punishment.

### 3.8 Controls summary

| Input | Action |
|---|---|
| Hold + release (mouse / touch / Space) | Reach, latch |
| Left / Right (or tap side) | Choose branch at a fork |
| Click a rope end / R | Rappel a citation |
| M | Map (the full poster panorama) |
| / | Focus search |
| I | Index gazetteer |
| Esc | Close panel |

---

## 4. THE WORLD

A single continuous **side-view panorama**, left to right: the ten CMS massifs in nav order, the valley floor with the Guides' Bureau at the center, then the six Cloud massifs. Every trailhead carries a painted sign with the OFFICIAL grouping only, product + section + count, per taxonomy.json:

> CMS · GETTING STARTED, 19 summits · CMS · FEATURES, 26 · CMS · AI, 3 · CMS · CONTENT APIS, 43 · CMS · CONFIGURATIONS, 45 · CMS · DEVELOPMENT, 32 · CMS · TYPESCRIPT, 6 · CMS · COMMAND LINE INTERFACE, 1 · CMS · PLUGINS DEVELOPMENT, 28 · CMS · UPGRADES, 64 ||| CLOUD · GETTING STARTED, 8 · CLOUD · PROJECTS MANAGEMENT, 5 · CLOUD · DEPLOYMENTS, 2 · CLOUD · ACCOUNT MANAGEMENT, 2 · CLOUD · COMMAND LINE INTERFACE, 1 · CLOUD · ADVANCED CONFIGURATION, 5

Within a massif, peaks stand along the ridge in content.json reading order. The 27 link communities are never shown or named (the law); they may only silently inform which massifs are drawn adjacent across the valley so that rope fans stay short and legible.

**Cols.** A handful of stations are drawn as mountain passes rather than peaks when their inbound count dwarfs their height. The Breaking Changes col is the canon example: 852 m low, but **57 ropes arrive and 52 depart**, 109 rope ends at one station, the busiest crossroads in the range. The map makes the truth of the graph visible at a glance: the most important place in the corpus is not its longest page.

**Light.** One horizontal poster sun. Peaks whose `last` commit is within 90 days catch **alpenglow pink** at the light line (on 6 Sep 2026 that includes Media Library and Cron jobs, both signed 2 Sep 2026). Routes stale past two years show frost. The 12 night-ascent peaks carry a tiny headlamp glimmer at world dusk. Weather is freshness; the range IS a freshness dashboard, wearing a gouache coat.

---

## 5. DATA MAPPING LEDGER (every visible fact, its source)

| Visible thing | Source | Rule |
|---|---|---|
| 290 peaks | content.json `pages` | one page = one peak, no exceptions |
| Peak height (m) | graph.json `words` | meters = word count, labeled on the route card (79 m boulder to 10,828 m giant) |
| Ridge order | content.json `order` | reading order along each massif ridge |
| Massif grouping + trailhead signs | taxonomy.json | product + section ONLY, with true counts (10 CMS + 6 Cloud massifs) |
| Pitches, their names | content.json `headings` level 2 | pitch count = h2 count; ledge label = the real heading text; h3 = optional variant forks |
| Crux pitches | content.json blocks per h2 span | an h2 section containing code blocks climbs as a crux |
| Route grade F..ED | graph.json `code` + table count from content.json | density = code + tables; quantile cuts 0/1/4/7/17/28 published in the Almanac |
| Fixed ropes | graph.json `edges` (1,231) | one rope = one citation, drawn source to target, label = target title |
| Anchor bolts at a station | graph.json `inbound` | bolt count = inbound count (Breaking Changes 57, Document Service 48, Users & Permissions 40) |
| 50 open problems (untracked snow) | inbound = 0 | the 50 uncited pages, listed by name at the Bureau |
| Summit book contents | content.json `blocks` | the full real page, all block kinds, crisp DOM |
| Provenance line | provenance.json | "Route opened `first` by `topAuthor` · `commits` ascents · `authors.length` signatures · last signed `last` · maintained `careDays` days" |
| Signatures in the book | provenance.json `authors` | the real names, only the real names (77 distinct across the range) |
| Night ascents (headlamp) | provenance.json `night` | the 12 pages with night commits; Docker installation shows 4 |
| Alpenglow / frost | provenance.json `last` | pink if <= 90 days ago, frost if > 730 days |
| The Almanac | gitlog-docs.txt distilled | the Bureau's ledger of ascents; also carries the grade formula and sound credits |
| Search / Index | content.json titles, descriptions, tags; taxonomy sections | instant filter; gazetteer grouped by product + section |

Game state that is NOT a fact (your cairn stones, badges, tended routes) lives in localStorage, is visually distinct (always "your mark", drawn in the player's rope-red), and never counterfeits a data fact.

---

## 6. READING: THE SUMMIT BOOK PANEL

- Right-side panel, 60% width on desktop, full-screen sheet on mobile; the world dims behind but keeps breathing (reduced motion: static dim).
- **Pure document surface**: white / near-black ink, zero texture, zero gouache, zero tint. Typography: Inter (Google Fonts, system-ui fallback) for text, monospace stack for code. 4.5:1 contrast minimum, both themes.
- Renders **all block kinds** in the corpus: tldr, p, h2 to h6 with anchor links, ul / ol, tables in `overflow-x: auto` containers, fenced code with language tag + Copy, tabs as real accessible tab controls, all admonition kinds (tip, note, caution, warning, info, danger, prerequisites, strapi, version, growth, enterprise, cloud-business, callout), details / summary, columns, cards, hr, images served from /img.
- Internal links do double duty: the panel navigates instantly (reading never waits), and behind it the world quietly rappels to the target peak so the world is always standing where you are reading.
- Hash routing: `#/cms/quick-start` opens the book directly; `#/cms/quick-start@part-a-create-a-new-project-with-strapi` lands on the anchor. Every page reachable, every page rendered, zero climbing in the way.

---

## 7. ART DIRECTION

**Register: golden age of alpinism, gouache travel poster.** The world looks like a 1925 PLM railway-company alpine poster that a cartographer annotated by hand.

**References.**
- Roger Broders' PLM posters (Chamonix, Sainte-Maxime): flat confident gouache planes, hard-edged shadows, monumental simplification.
- Emil Cardinaux's 1908 Zermatt poster: the archetype of the heroic peak in banded light.
- Eduard Imhof's Swiss relief shading: for the map view and the massif vignettes in the Ascent Log.
- Alpine Club route topos: hand-inked route lines with pitch tick marks and belay circles, the visual grammar of the topo cards.
- Herbert Matter's Engelberg posters: for the courage of scale contrast (tiny climber, enormous face).

**Materials and rendering.** Flat gouache planes, two to three value steps per rock face, no gradients except banded poster skies (discrete bands, never smooth). Crisp hard shadows from the one low sun. Paper grain as a single subtle multiply layer on the WORLD only, never on cards, never on the reading panel. Route lines and all topo annotation in ink with deterministic seeded hand-wobble (same page, same wobble, forever). The climber is a small vector figure, maybe 40 px tall, defined by silhouette and one accent: the rope-red sweater.

**Palette.**
- Day: glacier paper #F4F1E8, sky bands #2E6F9E to #0E3A5C, rock ochre #C08A3E and #8A5A28, shadow slate #274156, pine #1F4A38, snow #FAFAF5.
- Signature accent: **rope red #C4452C** for ropes, route lines, the sweater, and nothing else. When 57 red ropes fan out of Breaking Changes col, red has been saved all game for exactly that.
- Alpenglow #E8A6A0, only on fresh-edit peaks at the light line.
- Night (headlamp ascents and dark theme): indigo bands #0B1B33 / #122A4C, blue-grey snow #9FB2C8, headlamp cone #F5D9A0.

**Typography.** World and cards: Jost (Google Fonts, geometric poster sans, fallback system sans), wide tracking and small caps for massif signs. Reading panel: Inter + monospace, deliberately unthemed.

**Composition discipline.** One card, one subject: the route card shows one route; the topo card shows one climb in progress; the summit book shows one page; the badge card shows one badge. The screen at rest holds the wall, the climber, the top bar, and at most one card.

**Sound** (one toggle, default off, complete in silence): wind bed, rope creak on reach, latch tock, page turn on opening the book, one distant alpine chough. All CC0 (freesound.org, CC0-filtered), credited by file and author in the Almanac.

---

## 8. PERFORMANCE AND ROBUSTNESS BUDGET

- One Canvas 2D world canvas + DOM for panels. No WebGL needed, no libraries.
- Prebaked offscreen layers: sky bands (1 canvas), far ridges (1 per visible massif), the current wall segment baked per pitch (holds, rock planes, ink lines). Per-frame dynamic draws: climber (~30 ops), active rope (1 path), pendulum arc (2 ops), particles hard-capped at 60, labels in a DOM overlay (transform-only updates).
- Target sustained 50+ fps, p95 frame <= 16.5 ms on a mid laptop; rAF loop with delta clamp; zero allocations in the hot path (pooled particles, preformatted label strings).
- Reduced motion (`prefers-reduced-motion`): pendulum replaced by a no-timing reach (every hold latches on click; crux pitches instead ask for the correct branch choice), rappels become cuts with a one-line caption, particles and sway removed, dim transitions become instant. Progression parity is total.
- localStorage wrapped in try/catch everywhere; the game renders correctly with no stored state (fresh aspirant every visit, and that is a valid life).
- QA: the standing 290-slug headless sweep (location.hash driver, in-page error collector, >= 400 chars reading surface, no horizontal overflow), plus a 60 s scripted climb-and-rappel probe sampling frame times for the p95 gate. Headless only.

---

## 9. THE THREE PLANCHES

### Planche 1: THE ARRIVAL
1440x900, daylight. We are mid-wall on **Quick Start Guide, 3,663 m**, three holds below the Pitch 1 belay. The climber (rope-red sweater, chalk bag) is frozen mid-reach, the pendulum arc drawn with its green window just ahead of the swing marker: the exact moment a stranger understands the game. Bottom center, one caption in Jost: "Hold to reach. Release in the green." Top-left, the topo card: route name, "3,663 m · PD · 5 pitches", and "Pitch 1: Part A: Create a new project with Strapi" with its belay circle. Bottom-left, the trailhead sign: "CMS · GETTING STARTED, 19 summits". Top bar quiet on the right: search field, Index, sound toggle (off), Ascent Log 0 / 290. Behind: the Getting Started ridge in flat gouache with banded cerulean sky, and far down-valley one pink-lit summit, Cron jobs, wearing alpenglow because it was really signed on 2 Sep 2026. Grip meter (chalk bag) at 92. Nothing else on screen.

### Planche 2: THE SUMMIT BOOK
Topped out on **Media Library, 5,096 m, CMS · Features massif**. Left 40%: the dimmed gouache world; the climber sits by the cairn, the summit box open, **18 anchor bolts** glinting in a row at the station (18 real inbound ropes, arriving from down-valley as thin red threads). Right 60%: the reading panel, white and textureless: title "Media Library", provenance line "Route opened 6 Feb 2025 by Pierre Wizla · 36 ascents · 7 signatures · last signed 2 Sep 2026 · maintained 573 days". Below, the real page mid-scroll: an open tab control, a tip admonition with its left rule, a fenced code block with its Copy button, one interface screenshot loaded from /img, the edge of a table peeking inside its scroll container. The cursor rests on an internal link, and behind the panel one red rope has pulled taut toward a peak labeled "Upload files using the REST API": the world already leaning toward where the reading goes. Panel footer: "Sign the book" and "Report worn rope (Guides' Bureau on GitHub)".

### Planche 3: THE COL OF FIFTY-SEVEN ROPES (signature spectacle)
Dusk, indigo sky bands, the last alpenglow dying on the fresh peaks. The **Breaking Changes col, 852 m**, saddled low in front of the enormous silhouette of the Upgrades massif ("CMS · UPGRADES, 64 summits" on the pass sign). Into the col converge **57 red ropes** from across the entire valley, a taut catenary fan that is the poster shot of the whole project, and **52 ropes depart** the far side toward the breaking-changes faces; small ink label plates hang at the near ends ("Document Service API", "Plugins upgrade summary", "Database columns"). The player is mid-rappel down one departing rope toward "Entity Service API deprecated", body tucked, rope humming. Across the darkening range, exactly **12 headlamp glimmers** mark the night-ascent peaks, the brightest cluster of four at Docker installation. Bottom edge: the Ascent Log ridgeline, massif silhouettes partly inked. Red has been rationed all game so this frame can spend it.

---

## 10. BUILD PLAN (indicative, one build directory, no libraries)

1. **Data pass**: derive the world model from the five files at load (peaks, ridges, cols, grades, ropes, freshness); one pure function, unit-probed against the counts in this brief (290 / 1,231 / 50 / 77 / 12 / 16 massifs).
2. **Reading panel + search + Index + hash routing first** (the sacred path ships before the game): all 33 block kinds, 290 pages sweep-clean.
3. **The wall**: pitch baking, climb loop, grip, forks, ledges, Peek.
4. **The range**: panorama, map view, rappel traversal, cols, alpenglow/frost/headlamp light states.
5. **Progression**: Ascent Log, pennants, badges, care act, Almanac (grade formula + credits).
6. **Polish gates**: perf probe (p95 <= 16.5 ms), reduced-motion parity pass, contrast audit, the standing 290-slug sweep, two committed screenshots (shot-world.jpg, shot-read.jpg).

## 11. RISKS AND ANSWERS

- **"Is climbing fun without physics libraries?"** The loop is timing + resource (pendulum + grip), the oldest reliable tension pair in arcade design, and it is fully deterministic and cheap. GIRP proved climbing tension; we keep the tension and remove the cruelty (piton floors, hike mode).
- **"Does reading interrupt play?"** Never the other way around: reading is the summit, Peek exists at every ledge, and the utility path bypasses everything. The game is the longest possible route TO reading, never a wall in front of it.
- **"Mountain kitsch?"** The discipline is the poster register: flat planes, rationed red, one sun, one card. Broders, not Bob Ross.
- **"290 peaks legible?"** Grouping is only ever product + section (16 signed massifs); the map is a poster panorama, not a graph hairball; ropes render as bundles at map zoom and resolve only near stations.
