# english-pass: DONE (2026-09-03, session_01B5iZjRV5uL3CPQU4ncGu7S)

- teleachat was already fully SHOP·DOCS 24/7 in English register; verified it, fixed
  its details-summary double-escaping (markupLeak on 2 pages, 1 missing block probe),
  added a favicon. garedenuit translated in full to English sleeper-railway register
  (THE NIGHT STATION, DEPARTURES · MAIN LINES, "no service cancelled tonight",
  IN THE SIDINGS, carriages/platforms/driver/crew, legend, footer, lost view).
  docsadeux rebranded to the English pun "Cite & Right", "C'est un match !" ->
  "It's a match!", fixed the same summary-escaping bug plus empty alts on profile photos.
- Numbers and mechanisms untouched: routes, hashes, times, train numbers, widths,
  and every displayed count are byte-identical logic; only display strings changed.
- Sweeps: all three builds 290/290, zero errors, zero thin pages, zero overflow.
- French proof: rendered DOM text of the home view and one deep view per build
  scanned for accented characters and MAINTENANT/SEULEMENT/VOIE/DEPARTS/GARE/
  ACHAT/mots/conseilleres (word-bounded): 0 hits in UI text, 0 even inside doc
  content. "Departs" as an English verb was reworded to "leaves" so the scan is
  unambiguous.
- shot-world.jpg + shot-read.jpg (1440x900) committed beside each build.
- Caveats: node --check clean on all three; teleachat helper scripts (check*.js,
  _translate.py) still grep for French words by design and were left untouched.
