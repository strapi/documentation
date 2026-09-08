# Design Lab favicons

Three proposals for the Design Lab itself and three for each of the seven living worlds,
24 in all. Plain SVG on a 32x32 viewBox, no external references, no text.

Every mark uses its own world's real palette, read out of that world's stylesheet or source
rather than invented: `longway.js` INKS, `pixelcity.js` PAL, `s7.css`, `firstlight.css`,
`deadreckoning.css`, `fourcolor.css`, and the material colours in the Golden Shore's
`world.js`.

## The rule they were drawn to

A favicon is judged at sixteen pixels beside a title, not on a plate. Six of the first
twenty-four failed that test and were redrawn before anyone saw them:

| mark | what was wrong | what was done |
|---|---|---|
| `lab/2-contact-sheet` | nine frames were colour mush at 16 | four frames at twice the size |
| `lab/3-overprint` | `mix-blend-mode` on the group blends the group against the page, not the children against each other, so the three passes just stacked and the last one won | `isolation` on the group, `mix-blend-mode` on each child |
| `longway/1-lantern-walker` | a cream blob; the lantern had disappeared | narrower figure, lantern enlarged and moved clear of the silhouette |
| `herbarium/3-drawer` | three small drawer fronts were brown bands | one open drawer, one big brass pull, sheets showing |
| `carta/2-coast` | five small soundings and a hairline bearing were mud | bold coast, three large soundings, one thick bearing |
| `fourcolor/2-registration` | four colour squares in a 2x2 is the Windows logo and nothing else | the printer's real registration target, quartered in the four inks |

## Installing one

Copy the chosen file next to that world's `index.html` and add one line to its head:

```html
<link rel="icon" href="favicon.svg" type="image/svg+xml">
```

Safari wants a raster fallback for pinned tabs. If that matters, render 32x32 and 180x180
PNGs from the same SVG so the drawing keeps one source of truth.
