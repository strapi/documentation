# Interactive demos

Clickable product tours, like the former Guideflow embeds, captured from a real Strapi app instead of recorded by hand. Readers click the real buttons of the interface, or use Next and the ← → keys, to move through the steps.

A demo has 3 parts:

| Part | File | Who edits it |
|---|---|---|
| Scenario: the steps, their target and their text | `scenarios/<id>.js` | You |
| Captured demo: screenshots and target positions | `static/img/assets/interactive-demos/<id>/` and `src/components/InteractiveDemo/demos/<id>.json` | `capture.js`, never by hand |
| Player: the React component that renders any captured demo | `src/components/InteractiveDemo/` | Rarely |

In a page: `<InteractiveDemo id="content-manager" />`.

## Update a demo after a UI change

Run these commands from `docusaurus/`.

1. Create the demo app, once per machine (or again after a Strapi release):

   ```bash
   node scripts/interactive-demos/setup-demo-app.js ~/strapi-demo --port 1337
   ```

   It creates the official Strapi example app, localizes Article, turns off the admin login rate limit and seeds the example data. Add `--version 5.61.0` to pin a Strapi version.

2. Start the app in a separate terminal and leave it running:

   ```bash
   cd ~/strapi-demo && npm run develop
   ```

3. Capture the demo:

   ```bash
   DEMO_STRAPI_URL=http://localhost:1337 \
   DEMO_STRAPI_EMAIL=you@example.com DEMO_STRAPI_PASSWORD=YourPassw0rd \
   node scripts/interactive-demos/capture.js content-manager
   ```

   The first run creates the admin user with these credentials. Each run resets what the scenario changes (see `setup` in the scenario), so you can capture as often as needed. A run takes about a minute and captures light and dark screenshots at once.

4. Check the result with `yarn dev`, then commit the scenario, the JSON file and the images.

If the capture stops with `Target not visible: <selector>` or a timeout, the interface changed: the step's selector no longer matches. Fix the selector in the scenario and run the capture again.

`capture.js` needs `playwright-core` and a Chromium build. If `playwright-core` is not installed, point `PLAYWRIGHT_CORE_PATH` to a copy of it (for example the one in the Yarn cache).

## Weight and loading

Each screen is saved in WebP, in light and dark, at 2 widths: 1920 px for the page and 3840 px (`-hd`) for full screen and zoomed steps. The browser picks the size it needs through `srcset`. Identical screens are saved once. The Content Manager demo weighs 5.6 MB in the repository, and a reader who goes through all 38 steps downloads about 0.9 MB.

In the page, nothing loads before the demo gets close to the viewport (`loading="lazy"`), then one screen at a time, one step ahead. With data saver on or a 2G connection, the demo shows a "Load the demo" card and downloads nothing until it is clicked. This detection relies on `navigator.connection`, which some browsers lack: they get lazy loading only. A "Read the steps as text" list under each demo gives the steps to screen readers and to readers who skip the demo.

Recapturing only adds the screens that changed to the Git history.

## Write or change a scenario

A scenario exports a title, a start URL, an intro, the steps and an outro. Each step is one of:

| Step | Shows | Reader |
|---|---|---|
| `{ explain: selector, text }` | White bubble, the rest of the screen dimmed | Clicks Next |
| `{ chapter: true, text }` | Purple bubble in the center | Clicks the arrows |
| `{ click: selector, text }` | Pulsing circle on the element, purple bubble | Clicks the element |
| `{ fill: selector, value, text }` | Pulsing circle on the field | Clicks it, the value types itself |
| `{ do: [actions] }` | Nothing: silent actions between steps | |

Options:

- `explain` takes one selector or a list (the highlight covers them all), `padding` widens the highlight and `zoom: true` zooms on it.
- `before: [actions]` runs before the screenshot, to open a dropdown for instance. `after: [actions]` runs after a `click` or `fill`, to pick an option in the list that opened, for instance.
- Actions are `{ goto }`, `{ click }`, `{ fill, value }`, `{ press }` and `{ wait }`.
- Texts accept `**bold**`, `*italic*`, `[label](url)` and line breaks (`\n`).

Selectors are [Playwright selectors](https://playwright.dev/docs/other-locators). Prefer accessible names, which survive redesigns better than CSS classes: `role=button[name="Save"]`, `[aria-label="Locales"]`, `input[name=title]`. Accessible names are case-sensitive here: check them in the browser accessibility panel.
