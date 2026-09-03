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
