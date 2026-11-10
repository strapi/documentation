# Interactive demos

Clickable product tours, like the former Guideflow embeds, captured from a real Strapi app instead of recorded by hand. Readers click the real buttons of the interface, or use Next and the ← → keys, to move through the steps.

Each demo has its own folder, `docusaurus/interactive-demos/<id>/`, named after the id that pages use. A demo has 5 parts:

| Part | File | Who edits it |
|---|---|---|
| Description: the tour in plain text | `docusaurus/interactive-demos/<id>/description.md` (optional) | You |
| Scenario: the steps, their target and their text | `docusaurus/interactive-demos/<id>/scenario.yaml` | You, or Claude from the description: the only file to change to change a demo |
| Setup: code that brings the demo app back to the state the scenario starts from | `docusaurus/interactive-demos/<id>/setup.js` (optional) | You, or Claude, when the tour creates or changes data |
| Captured demo: screenshots and target positions | `docusaurus/static/img/assets/interactive-demos/<id>/` and `docusaurus/interactive-demos/<id>/generated-capture.json` | `capture.js`, never by hand |
| Player: the React component that renders any captured demo | `docusaurus/src/components/InteractiveDemo/` | A front-end developer, to change how all demos look or behave |

In a page: `<InteractiveDemo id="content-manager" />`.

The scripts, `capture.js`, `explore.js` and `setup-demo-app.js`, are in `scripts/` next to this README. Run them from the strapi/documentation repository: they find it from the current folder, not from their own location, and take their dependencies (`js-yaml`, `playwright-core`) from `docusaurus/node_modules`. So the copy installed with the Inki plugin works as well as the one in the repository, as long as `yarn` has run in `docusaurus/`.

## Update a demo after a UI change

Run these commands from the root of the strapi/documentation repository.

1. Create the demo app, once per machine (or again after a Strapi release):

   ```bash
   node claude-plugins/inki/skills/inki-interactive-demo/scripts/setup-demo-app.js ~/strapi-demo --port 1337
   ```

   It creates the official Strapi example app, localizes Article, adds the French and German admin languages and the Documentation plugin, turns off the admin login rate limit and seeds the example data. Add `--version 5.61.0` to pin a Strapi version.

2. Start the app in a separate terminal and leave it running:

   ```bash
   cd ~/strapi-demo && npm run develop
   ```

   The Releases, Content History and Review Workflows demos need an Enterprise license. Keep the key in a file outside the repository and pass it when starting the app, without printing it:

   ```bash
   cd ~/strapi-demo && STRAPI_LICENSE="$(cat ~/.strapi-license)" npm run develop
   ```

3. Capture the demo:

   ```bash
   DEMO_STRAPI_URL=http://localhost:1337 DEMO_STRAPI_DIR=~/strapi-demo \
   DEMO_STRAPI_EMAIL=kai.doe@example.com DEMO_STRAPI_PASSWORD=YourPassw0rd \
   node claude-plugins/inki/skills/inki-interactive-demo/scripts/capture.js content-manager
   ```

   The first run creates the admin user, Kai Doe, with these credentials. Always use a made-up `example.com` address: the admin home page, the user menu and the users list display it, and it would end up in the published screenshots. `DEMO_STRAPI_DIR` is the demo app folder, where the Media Library demo takes the images it uploads. Each run resets what the scenario changes (see `setup.js`), so you can capture as often as needed. A run takes about a minute and captures light and dark screenshots at once.

4. Check the result with `yarn dev`, then commit the demo folder and the images.

The Internationalization demo starts by turning off localization on Article, and its tour turns it back on. If its capture stops midway, run it again until it completes before capturing other demos.

If the capture stops with `Target not visible: <selector>` or a timeout, the interface changed: the step's selector no longer matches. Fix the selector in `docusaurus/interactive-demos/<id>/scenario.yaml` and run the capture again. To find the new selector, `node claude-plugins/inki/skills/inki-interactive-demo/scripts/explore.js <id> --step <N>` replays the scenario up to that step, saves a screenshot and the accessibility tree (the roles and names that selectors use), and says whether the target is found.

`capture.js` needs `playwright-core` and a Chromium build. If `playwright-core` is not installed, point `PLAYWRIGHT_CORE_PATH` to a copy of it (for example the one in the Yarn cache).

## Weight and loading

Each screen is saved in WebP, in light and dark, at 2 widths: 1920 px for the page and 3840 px (`-hd`) for full screen and zoomed steps. The browser picks the size it needs through `srcset`. Identical screens are saved once. The Content Manager demo weighs 5.6 MB in the repository, and a reader who goes through all 38 steps downloads about 0.9 MB.

In the page, nothing loads before the demo gets close to the viewport (`loading="lazy"`), then one screen at a time, one step ahead. With data saver on or a 2G connection, the demo shows a "Load the demo" card and downloads nothing until it is clicked. This detection relies on `navigator.connection`, which some browsers lack: they get lazy loading only. A "Read the steps as text" list under each demo gives the steps to screen readers and to readers who skip the demo.

Recapturing only adds the screens that changed to the Git history.

## Write a demo from a plain-text description

Describe the tour in your own words in `docusaurus/interactive-demos/<id>/description.md`: the page it starts on, then each step in order, with the text of each bubble when you have one. Then run `/inki:inki-interactive-demo <id>` in Claude Code: it writes the scenario, captures the demo and lists where it had to differ from your description.

## Write or change a scenario

A scenario is a YAML file with a title, a viewport, a start URL, an intro, the steps and an outro:

```yaml
title: Content Manager Overview
viewport:
  width: 1280
  height: 800
start: /admin/content-manager/single-types/api::about.about

intro:
  text: Welcome to the guided tour of the Content Manager!
  button: Let's start 🚀

steps:
  - explain: nav[aria-label="Content Manager"]
    text: This is the navigation of the Content Manager.
  - click: role=button[name="Filters"]
    text: Click here to filter the entries listed in the table.
    after:
      - click: role=option[name="category"]

outro:
  text: Thank you for following this guided tour!
```

Each step's screenshot is taken before the reader acts: a `click` or `fill` step shows the element still to click, so a text about the result of the click belongs on the next step. The outro card is drawn over the last step's screenshot. Each capture opens a fresh browser: what the browser stores (filters in the URL, open panels) starts over, what the server stores (entries, list view columns) carries over.

Each step is one of:

| Step | Shows | Reader |
|---|---|---|
| `explain: selector` + `text` | White bubble, the rest of the screen dimmed | Clicks Next |
| `chapter: true` + `text` | Purple bubble in the center | Clicks the arrows |
| `click: selector` + `text` | Pulsing circle on the element, purple bubble | Clicks the element |
| `fill: selector` + `value` + `text` | Pulsing circle on the field | Clicks it, the value types itself |
| `do: [actions]` | Nothing: silent actions between steps | |

Options:

- `explain` takes one selector or a list (the highlight covers them all), `padding` widens the highlight and `zoom: true` zooms on it.
- `before: [actions]` runs before the screenshot, to open a dropdown for instance. `after: [actions]` runs after a `click` or `fill`, to pick an option in the list that opened, for instance.
- Actions are `goto`, `click`, `fill` (with `value`), `press`, `hover`, `upload` (with `files`, relative to the demo app folder), `waitFor` (a selector to wait for, after a server restart for instance, with an optional `timeout`) and `wait` (in ms).
- Use `# comments` to note why a step differs from what a reader might expect.
- Texts accept `**bold**`, `*italic*`, `[label](url)` and line breaks (`\n`).

The setup file exports one function, `async function setup({ api })`, where `api` calls the Strapi admin API (`get`, `post`, `put`, `del`) as the demo admin. It can return `{ start }` to replace the start URL, when the page to open is only known once the setup has created it.

Selectors are [Playwright selectors](https://playwright.dev/docs/other-locators). Prefer accessible names, which survive redesigns better than CSS classes: `role=button[name="Save"]`, `[aria-label="Locales"]`, `input[name=title]`. Accessible names are case-sensitive here: check them in the browser accessibility panel.
