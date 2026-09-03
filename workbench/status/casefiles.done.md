# casefiles: DONE

Built case.js from scratch against the existing HTML/CSS shell: pannable/zoomable corkboard with 18 precincts, 290 pins, all 1,231 citations drawn as sagging red string on canvas (hover lights a pin's threads, drag-vs-click properly separated), full typed case files (stable CASE No., OPENED/LAST SEEN, WITNESSES, Exhibits A..N, polaroid photos, KNOWN ASSOCIATES, outfit purity gag), cold-case drawer for the 50 uncited pages, search, plain-words key.
Sweep: 290/290 checked, 0 failed (zero JS errors, no thin pages, no overflow, no content loss); node --check clean; shot-world.jpg and shot-read.jpg committed.
Caveats: night-shift stamp count comes from provenance (12 pages with night>0, not the 15 the brief guessed); board string layer is intentionally faint at full zoom-out and brightens on hover; precinct labels only readable once zoomed in.
Fixed along the way: setPointerCapture was swallowing pin clicks; cold-file card lines now stack; key overlay hidden attribute was overridden by its own CSS.
Committed as "Finish the Case Files noir corkboard build" on repo/design-lab-workbench.
