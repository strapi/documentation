# Design Lab workbench — state transfer for cloud continuation

This branch carries the in-flight state of the Strapi Docs Design Lab so cloud agents can
continue the work independently of the local machine. Date of transfer: 2026-09-03.

## Layout
- `data/` — the canonical bundle: content.json (290 pages), graph.json (1231 citations),
  communities.json (27 link communities), provenance.json (per-page git history).
- `qa/sweep.js` — the 290-page verification harness (needs playwright-core + chromium; in a fresh
  environment run `npm i playwright-core && npx playwright-core install chromium` in a temp dir,
  or adapt the require path at the top of the file).
- `builds/<name>/` — each build's code (index.html + one css + one js). Every build expects
  content.json, graph.json, communities.json, provenance.json in ITS OWN directory: copy them in
  from `data/` before serving. Image srcs are root-absolute (/img/...): serve the repo's
  `docusaurus/static` as the web root, or symlink `img -> ../../docusaurus/static/img`.

## Standing rules (from the client)
- ALL interface copy in ENGLISH, always.
- No invented numbers: every displayed quantity comes from the data files; names only from
  provenance.json.
- Hash routing, all 290 pages fully rendered, zero console errors, no horizontal overflow,
  reduced-motion fallback, 4.5:1 reading contrast.

## Tasks
1. **diorama** (builds/diorama): a Canvas 2D golden-hour model city. CONTINUE THE IMPROVEMENT
   LOOP: (a) visual bug purge (depth sort, shadows, clipping, popping), (b) a LIVING LAYER of
   animated inhabitants themed by district (pedestrians, delivery vans between mutually-citing
   districts, pigeons, one cat on the derelict lots, gardeners on planted blocks, a moth at the
   lamps of the 15 night-edited pages), (c) 3+ rounds of fresh-eyed critique vs the bar of a
   hand-built exhibition diorama, then apply. iterlog/CHANGELOG.md is the round log.
2. **pixelcity** (builds/pixelcity): dense isometric PIXEL ART city per the genre laws written in
   the code comments (fixed 2:1 dimetric, sprite atlas authored in code, ~32 colour palette,
   1px outlines, integer zoom, no dead ground, animated tiny life). Finish it, then 2 critique
   rounds vs the genre bar.
3. **casefiles** (builds/casefiles): film-noir detective agency, corkboard with red string =
   the 1231 real citations, case files typed per page, the 50 uncited pages as COLD CASES,
   hard-boiled narrator whose every line restates real data. English. Finish and verify.
4. **nightradio** (builds/nightradio): shortwave receiver at night; 290 stations on a backlit
   dial in reading order; signal strength = inbound citations; the 50 uncited are unlisted
   frequencies; operators from provenance. English. Finish and verify.
5. **english pass** on teleachat, garedenuit, docsadeux (builds/...): translate every remaining
   French UI string to English in register (home-shopping / sleeper railway / dating app), keep
   all mechanics and numbers identical, prove no French remains in the rendered DOM.

## Definition of done, per build
node --check clean; all 290 slugs driven headlessly via location.hash with an in-page error
collector: zero errors, zero pages whose reading surface is under 400 chars, zero horizontal
overflow; two screenshots (shot-world.jpg, shot-read.jpg, 1440x900) committed alongside the code.

## Delivery
Commit results INTO THIS BRANCH under builds/, one commit per task, message style: imperative,
no prefixes, <= 80 chars. Push after each task so partial progress survives.

## Status
- **pixelcity** (2026-09-03, cloud continuation): DONE. Fixed the details-summary escaping bug
  (root cause of all 4 baseline sweep failures), then ran the two critique rounds against the
  genre bar. Round 1 added the missing tiny scenes: stall queues (33 queuers), dogs by benches
  (14), park fountains (30, three spray frames), harbour buoys (7), and a stippled deep-water
  falloff at the diorama edge. Round 2 made the FOR LEASE signs readable (10 street placards in
  3x5 pixel font, spread evenly across the 50 boarded shopfronts), seated the crane in an open
  yard so the mast no longer hides, and dressed the derelict LOT tiles with cracks and weeds.
  Verification: node --check clean; canonical sweep 290/290 pages, zero errors, zero thin pages,
  zero overflow, zero content loss; establishing view 0.9 ms/frame at 1440x900 (budget 30 ms);
  reduced-motion renders byte-identical posed frames. shot-world.jpg, shot-street.jpg,
  shot-read.jpg committed beside the code. Caveats: palette holds 39 ramp entries (brief said
  roughly 32); queue scenes can be occluded by foreground towers in the densest quarters.
- **diorama** (2026-09-03, cloud continuation): DONE. Baseline purge confirmed (sweep clean),
  then the living layer: 84 lane walkers scaled by district inbound citations, 21 vans on
  citation edges of weight >= 6, 27 plaza pigeons, 12 gardeners, one cat on the derelict lots,
  15 moths (one per night commit, 12 lamps), and one shared wind over laundry, awnings and
  smoke — the awning quads were degenerate (invisible since written) and were mended on the way,
  as was a prop cap that silently dropped everything baked after the street furniture. Three
  critique rounds applied and logged in iterlog/CHANGELOG.md (detail budget for landmark towers,
  establishing crop, elevation-keyed haze, bench clutter, roof tone, parapet returns, plate
  joints, bird size, well water, life cast-shadows, stall produce). A wide street view the
  parallel session flagged at 47-57 ms was root-caused (factory facades painted fixed 5x3 pane
  grids at sub-pixel size on 64 fronts) and mip-fixed: every known camera now inside budget.
  Final sweep 290/290 clean; reduced-motion tableau byte-identical; establishing 20.7 ms,
  street 10.1 ms, wide-street 34.5 ms, facade 23.5 ms at 1440x900 (budgets 30/40);
  shot-world.jpg, shot-read.jpg committed. Caveat: moths read only at street zoom by design.
- **english pass** (2026-09-03, cloud continuation, second firing): DONE. teleachat was
  already fully in SHOP·DOCS 24/7 English register — verified, and its details-summary
  double-escaping fixed (markup leaking as text on 2 pages, one lost block probe).
  garedenuit translated whole to sleeper-railway English: THE NIGHT STATION, DEPARTURES ·
  MAIN LINES, "no service cancelled tonight", IN THE SIDINGS, platforms/carriages/driver/
  crew, the full legend; accents dropped from the split-flap alphabet so no French letter
  ever flickers through a flap. docsadeux rebranded to the English pun "Cite & Right",
  "C'est un match !" -> "It's a match!", same summary-escaping fix plus real alt text on
  profile photos. Mechanics and numbers untouched (routes, hashes, train numbers, widths).
  Verification per build: node --check clean; sweep 290/290, zero errors, zero thin pages,
  zero overflow; rendered-DOM French scan of home + one deep view: 0 accented characters,
  0 of MAINTENANT/SEULEMENT/VOIE/DEPARTS/GARE/ACHAT/mots/conseilleres (English "departs"
  reworded to "leaves" so the scan is unambiguous); shot-world.jpg + shot-read.jpg
  (1440x900) committed beside each build. Caveat: helper scripts in the build dirs still
  mention French words because grepping for them is their job.
