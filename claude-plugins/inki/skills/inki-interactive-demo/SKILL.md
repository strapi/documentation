---
name: inki-interactive-demo
description: "Create or update an interactive demo (the clickable product tours that replaced Guideflow) from a plain-text description of its steps: finds the UI elements in a running Strapi demo app, writes the YAML scenario, captures it and checks the result."
argument-hint: "<demo-id> [description file or text]"
user-invocable: true
---

# /inki:inki-interactive-demo: write an interactive demo from a plain-text description

Interactive demos are clickable tours captured from a real Strapi app. Each demo is a YAML scenario played by a capture script. This skill turns a description written by a person ("highlight the navigation, then click Article…") into that scenario, captures it, and checks the screens.

Everything about the system is in `docusaurus/scripts/interactive-demos/README.md`. Read it first, completely: it defines the step types, the actions, the selectors and how to run the scripts.

## Input

`$ARGUMENTS`: the demo id (kebab-case, e.g. `content-manager`), optionally followed by a path to the description or the description itself.

The description lives in `docusaurus/scripts/interactive-demos/scenarios/<id>.md`. If the user gave the description inline, write it to that file first, as they wrote it. If neither exists, ask the user to describe the tour: which page it starts on, then each step in order, with the text to show when they have one.

Two cases:

- **New demo** (no `<id>.yaml`): build the scenario from the description.
- **Update** (`<id>.yaml` exists): the description, the UI or both changed. Start from the existing YAML. Keep every step the description still asks for, and change only what the description or the UI requires.

## Step 1: Check the demo app

The scripts need a running demo app and these environment variables (see the README, "Update a demo after a UI change"):

- `DEMO_STRAPI_URL` (default `http://localhost:1337`), `DEMO_STRAPI_DIR` (the app folder), `DEMO_STRAPI_EMAIL`, `DEMO_STRAPI_PASSWORD`.
- `PLAYWRIGHT_CORE_PATH` if `playwright-core` is not installed.

Check that `$DEMO_STRAPI_URL/admin` answers. If it does not, give the user the setup and start commands from the README and stop: do not create or start an app yourself unless the user asks.

Rules that always apply:

- **The admin email must be a made-up `example.com` address.** The home page, the user menu and the users list show it, and it ends up in the published screenshots. If `DEMO_STRAPI_EMAIL` is a real address, stop and tell the user.
- **Never print, copy or write the Enterprise license.** Features such as Releases, Content History or Review Workflows need the app started with `STRAPI_LICENSE="$(cat <license file>)"`. Check them with `curl -s $DEMO_STRAPI_URL/admin/project-type` (`isEE: true`).
- Headless browsers only.

## Step 2: Turn the description into a plan

How the capture works, which shapes the plan:

- Every step's screenshot is taken **before** the reader acts: a `click` or `fill` step shows the screen with the element still to click, and its bubble sits on that screen.
- The outro card is drawn over the **last step's** screenshot.
- Each capture opens a fresh browser: anything stored in the browser (filters in the URL, open panels) starts over, while anything stored on the server (entries, releases, content-type settings) carries over from the previous capture or from other demos.

Read `<id>.md` and map each sentence to one step of the scenario (step types in the README):

| The description says | Step |
|---|---|
| Show, highlight, point at, explain an area | `explain` (`zoom: true` when it asks to zoom on a small area) |
| Click, open, go to (the reader does it) | `click` |
| Pick an option in a dropdown | `click: role=option[name="..."]`, with `before` clicking the dropdown to open it |
| Type, fill in, enter a value in a field | `fill` with `value` |
| A pause, a section title, a message with no target | `chapter` |
| Something that happens off-screen between two steps | a silent `do` step, or `before` / `after` actions |
| Text about the **result** of a click ("Click Save: 'Saved!'") | the click step gets an instruction text, and the result text goes on the next step. If the click is the last step, add an `explain` or `chapter` step after it to show the result |

Texts:

- When the description gives the text of a bubble (usually in quotes), use it **word for word**.
- When it does not, write one: one or two short sentences, the same tone as the other demos ("Let's…", "Click on…"), UI labels exactly as the interface displays them in `*italic*` or `**bold**`. Never name a button or field that the interface does not display. No em dashes.
- `\n` only for real paragraph breaks or list items, never to wrap a line.

The intro (text and button) and the outro (text and links to docs pages, as `/cms/...` paths) come from the description, or follow the pattern of the existing demos.

For a new demo, write the skeleton of `<id>.yaml` first: `title` (from the description, or the feature name like the other demos), `viewport` (`width: 1280`, `height: 800` unless the screens need more room), `start`, `intro` and `outro`, with `steps: []`. Then add the steps one by one in Step 3.

## Step 3: Find the selectors, step by step

Use the exploration script to see the app exactly where a step is shown:

```bash
cd docusaurus
node scripts/interactive-demos/explore.js <id> --step <N> --out <scratch folder>
```

It runs the setup, replays the scenario up to step N (after that step's `before` actions), and writes a screenshot (`step-N.png`) and the accessibility tree (`step-N.aria.yaml`). It also says whether step N's target matches a visible element. With no steps yet, or to look beyond the last step, add `--url /admin/...`.

Before exploring, search the existing scenarios for the same screens: `grep -n "Filters" docusaurus/scripts/interactive-demos/scenarios/*.yaml`. A selector that already works in another demo is the best starting point.

For each step, in order:

1. Run `explore.js` at that step and look at the screenshot and the tree.
2. Pick the selector, preferring accessible names from the tree: `role=button[name="Save"]`, `role=option[name="category"]`, `[aria-label="Locales"]`, `input[name=title]`. Names are case-sensitive: copy them from the tree. Use CSS only when no accessible name exists (an open menu hides the rest of the page from role selectors, for instance).
3. Add the step to `<id>.yaml` and run `explore.js --step <N>` again until it reports the target as found. When it says a selector matches nothing or only hidden elements, look in the tree: the element is often inside a closed dropdown or menu (add a `before` click) or has another name.

When the description asks for something the UI no longer has, use the closest equivalent and note it as a deviation (Step 6). When a step text would then become false, fix only the false part.

Use `# comments` in the YAML to explain any non-obvious choice: a CSS selector, a workaround, a deviation from the description.

## Step 4: Write the setup when the tour changes data

If the tour creates, edits, publishes or deletes anything, the next capture would start from a different state. Write `scenarios/<id>.setup.js` (see the README and the existing setup files) that brings the app back to the state the tour starts from, through the admin API (`api.get`, `api.post`, `api.put`, `api.del`).

A tour that only looks at pages also needs a setup when its screens show data that other demos change: an entry count, the list view columns (stored on the server), a release list. Pin that state in the setup, or reuse what an existing setup file does (`content-manager.setup.js` sets the Article list columns, for instance).

## Step 5: Capture, twice

```bash
node scripts/interactive-demos/capture.js <id>
```

It prints one line per step, `step N <type> -> <image>`: keep it, Step 6 uses it to pair steps with screenshots, since steps on the same screen share one image.

When a step fails (`Target not visible`, a timeout), run `explore.js --step <N>` on it, fix the step, and capture again. Once it passes, **run the capture a second time in a row**: both runs must succeed, which proves the setup resets the app.

## Step 6: Check the result

1. Look at the screenshots in `docusaurus/static/img/assets/interactive-demos/<id>/` (light and `_DARK`). They are WebP files: convert the ones you open to PNG first (`sips -s format png <file> --out <scratch folder>` on macOS). They show the bare interface, without bubble or highlight. Using the capture log, check that the screen of each step shows what its text says.
2. Privacy: no real email address in any screenshot, and `grep "@" docusaurus/src/components/InteractiveDemo/demos/<id>.json` finds only `example.com` addresses.
3. For a new demo, ask the user which docs page shows it, then add `<InteractiveDemo id="<id>" />` there and check the page in `yarn dev`: go through the demo once.
4. If a docs page or the component changed, run `yarn build` (check its exit code, never through a pipe).

## Step 7: Report

Keep it short:

- Steps in the scenario, and how many the description asked for.
- **Deviations**: each place where the scenario differs from the description, with the reason.
- Image pairs, and two weights: what a reader downloads to go through the demo (`bytes` in the JSON, light and dark) and what the images add to the repository (`du -sh` of the image folder, all sizes included).
- Files changed: `<id>.md`, `<id>.yaml`, `<id>.setup.js` (if any), the JSON and the images, and the docs page.

Do not commit: leave that to the user, or to `/inki:commit` when asked.
