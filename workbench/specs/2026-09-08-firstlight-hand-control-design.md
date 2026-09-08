# FIRST LIGHT · hand control

**Date:** 2026-09-08
**World:** FIRST LIGHT (`docusaurus/static/design-lab/firstlight/`, branch `repo/experimental-design-firstlight`)
**Status:** design approved, not implemented

A webcam gesture interface for FIRST LIGHT, alongside mouse and keyboard and never
replacing them. The reference is Minority Report: one gesture language applied to
everything on screen, no cursor, no click.

## Where the idea came from, and one correction

The owner saw Annie Wang's Google codelab *Build a Multimodal AI agent with Graph RAG,
ADK & Memory Bank* and asked whether its camera interface could drive FIRST LIGHT.

That codelab is about **agent memory**: Graph RAG for knowledge, Memory Bank for
persistence between sessions. Two different camera technologies could be behind
"move things with the webcam", and they are not interchangeable:

| | local hand tracking | model in the loop |
|---|---|---|
| what | MediaPipe Tasks Vision, 21 landmarks, in the browser | camera streamed to a model that understands the scene |
| latency | 20-30 ms | hundreds of ms |
| needs | nothing | API key, therefore a backend |
| cost | none | per session |
| privacy | no frame leaves the machine | frames leave the machine |
| fit | continuous control | discrete understanding |

A screenshot of the codelab settled it: the 21-point skeleton drawn over the hand and
the `Hand Detected (OPEN)` pill are **MediaPipe running locally**. The graph behind it
is the Graph RAG part, separate.

**The decision: both, layered, hand tracking first.** The hand layer is local and needs
no key, no backend and no network. A model layer may come later for discrete moments
where understanding beats measuring; it is out of scope here and is the only part that
would require standing up a backend. The Design Lab ships as static pages with no
backend and no secrets, which is why the local layer is the one that can exist at all.

## What the hand does

All four roles were wanted, arriving progressively:

1. fly the star map,
2. work the instruments,
3. aim at and lock a body,
4. read a page without touching the keyboard.

These are not four features. In Minority Report there is **one vocabulary** applied to
every surface. So: one grammar, four surfaces, delivered in stages.

## Architecture: a two-tier grammar

This is the shape that lets the core stay small forever while per-instrument richness
stays unlimited.

### `hands.js` — knows nothing about FIRST LIGHT

Owns the camera, the landmarker, the smoothing and the gesture state machine. Publishes
two things and nothing else:

- **Tier 1, the common grammar.** Five semantic events, stable forever, learned once,
  valid on every surface: `present`, `move`, `grab`, `release`, `spread`. `spread` carries a
  *signed* scale delta, so one event covers zooming in and out; there is no separate pinch-in. This is what
  produces the Minority Report feeling: one language over the whole screen.
- **Tier 2, the raw frame.** The 21 landmarks, normalised, with handedness and
  confidence, published as-is. An instrument that wants its own verb (really turning the
  receiver dial, tilting the camera, pulling the sample tray) recognises it **itself**,
  from the frame, and **only while it has focus**.

A dial gesture is dial code and lives in the dial. The core never grows.

### `hands-hud.js` — the feedback

The reticle and the on-screen monitor. Separate because it is the part that will be
redesigned most. The monitor shows the skeleton over a small, deliberately low-resolution
preview with the current hand state written above it, in the world's own idiom: an
instrument panel in amber on near-black, never a video-call window.

### The seam

`firstlight.js` is a **classic script** of 6,439 lines with no modules and no build step.
So `hands.js` is a separate `<script type="module">` (MediaPipe is ESM) that dispatches
`CustomEvent`s on `window`, and the existing file listens with `addEventListener`. No
coupling, no build step, and the existing file barely changes.

### The invariant

**Nothing in FIRST LIGHT imports MediaPipe.** Camera off, refused, or unsupported: no
subscriber ever fires and the world is exactly what it is today. Mouse and keyboard lose
nothing, and nothing anywhere is reachable only by camera.

## What the world already provides

Three findings from reading `firstlight.js` that shaped this design rather than fighting it:

- **`pick(wx, wy, 15 / cam.s)` already exists.** It is the radius picker behind mouse
  hover. Magnetic snapping is therefore already built; the reticle has nothing to invent.
- **The camera has `cam.x/y/s` and also `cam.tx/ty`**, so a damping loop is already
  running. The hand drives the *target*, not the position, and jitter is absorbed by
  machinery that has been there since the beginning. This is the correct fix for hand
  tremor and it is free.
- **The zoom voice is already written for a hand.** Its comment reads: *"one continuous
  voice per zoom gesture, exactly as long as the hand keeps turning, pitch rides the zoom
  itself."* A spread gesture suits that design better than a wheel does.

## The gestures

The core is one learnable sentence: **a pinch is a hold.** Everything follows.

| gesture | detection | effect |
|---|---|---|
| open palm | hand detected, fingers extended | present; moves the reticle, which snaps to the nearest body |
| pinch, one hand | thumb tip to index tip below threshold | grab. Moving while pinched drags the map |
| pinch, two hands | both pinched | the distance between them drives scale. Apart zooms in, together zooms out. Moving both in parallel also pans, though one hand is enough to pan |
| fist | all fingers curled | lock: enter the snapped body. With nothing snapped it does nothing, and the reticle says so rather than guessing at the nearest body off-screen |
| hand leaves frame | tracking lost | release, always |

This is the trackpad model lifted into the air, which is a virtue: nobody has to learn it.

Two choices open to reversal: the **fist** enters a body, leaving the pinch to mean only
holding; and **lowering your hand does nothing** — the reticle stays where it was rather
than falling, so an arm can rest without losing its target.

## The four decisions that separate "it works" from "it is pleasant"

- **Hysteresis on every threshold.** Pinch arms below 0.045 normalised distance and
  disarms above 0.065. Without that band a pinch held at the threshold flickers and the
  map convulses. Same for the fist.
- **A One Euro filter, not a moving average.** It smooths hard when the hand is still and
  lets go when the hand moves fast, so stillness is calm without paying lag on motion. A
  fixed average forces a choice between the two.
- **A comfort rectangle.** The camera frame is not mapped to the screen one to one. A box
  at the centre, about 60% of the frame, covers the whole screen. Otherwise reaching a
  corner means reaching the edge of the camera's view, which is where gorilla arm is born.
- **A dead man's switch.** Tracking lost for more than 150 ms emits `release`. The world
  must never be stranded in a grabbed state because somebody stepped out of frame.

Inference runs on its own loop at about 30 fps, decoupled from rendering, and the two kinds
of signal travel differently on purpose: **discrete events are pushed** from the inference
loop the moment a threshold is crossed, so a grab is never late; **continuous position is
pulled**, the render loop reading the latest smoothed point each frame rather than being
driven by it. If the model stalls, the map still runs at 60 and the reticle simply stops
where it was.

## Camera, permission and trust

Nothing starts on load: not the permission prompt, not the 8 MB. A control in the
instrument strip reads `HAND CONTROL · OFF`. Clicking it downloads, asks and arms.

Turning it off calls `stop()` on every track so **the camera light actually goes out**.
That is the trust signal, not a reassuring sentence. The page states plainly that no
frame leaves the machine, which is true and verifiable, because there is no network call
to make.

### Degradation, all silent but for one line

| case | what happens |
|---|---|
| no `getUserMedia`, no WebGL | the control says why in one line, the world is untouched |
| permission denied | one line, no nagging, the control stays re-armable |
| model fails to load | a progress indication, then a clean failure |
| `prefers-reduced-motion` | the hand works, the reticle does not animate |

## Testing

The architecture separates the two levels for free.

1. **The state machine, with no camera at all.** Hand-built sequences of 21 landmarks are
   injected directly. This is where the things that actually break are tested: hysteresis
   (a pinch held at the threshold must not flicker), the dead man's switch (tracking lost
   150 ms emits `release`), the comfort box mapping (a point at the edge of the box lands
   at the edge of the screen). Deterministic, instant, no assets.
2. **The whole chain, with a fake camera.** Chromium accepts
   `--use-file-for-fake-video-capture=hand.y4m` and MediaPipe treats the file as a webcam.
   This proves the real pipeline, headless, never opening a window.

Plus a non-regression: FIRST LIGHT's existing verification sweep must pass **unchanged**
with the module present and unarmed.

**One asset is needed and cannot be fabricated:** a 15-second clip of a real hand facing
the camera performing the five gestures, converted to y4m. Once recorded it is the
reference test forever. Level 1 runs without it.

## Stages

1. **Hand present, reticle snapping, drag the map, spread to zoom.** Nothing else.
2. Grab, release and lock as a complete tier-1 grammar across the map.
3. Tier-2 instrument verbs, one instrument at a time.
4. Hands-free reading.

## Out of scope

- The model-in-the-loop layer. It needs a key and therefore a backend, and it is a
  separate project with a separate spec.
- Graph RAG and Memory Bank. Interesting, and a different project.
- Any change to mouse or keyboard behaviour.
