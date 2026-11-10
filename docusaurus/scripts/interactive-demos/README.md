# Interactive demos

Clickable product tours, like the former Guideflow embeds, captured from a real Strapi app instead of recorded by hand. Readers click the real buttons of the interface, or use Next and the ← → keys, to move through the steps.

A demo has 5 parts:

| Part | File | Who edits it |
|---|---|---|
| Description: the tour in plain text | `scenarios/<id>.md` (optional) | You |
| Scenario: the steps, their target and their text | `scenarios/<id>.yaml` | You, or Claude from the description: the only file to change to change a demo |
| Setup: code that brings the demo app back to the state the scenario starts from | `scenarios/<id>.setup.js` (optional) | Rarely |
| Captured demo: screenshots and target positions | `static/img/assets/interactive-demos/<id>/` and `src/components/InteractiveDemo/demos/<id>.json` | `capture.js`, never by hand |
| Player: the React component that renders any captured demo | `src/components/InteractiveDemo/` | Rarely |

In a page: `<InteractiveDemo id="content-manager" />`.

## Update a demo after a UI change

Run these commands from `docusaurus/`.

1. Create the demo app, once per machine (or again after a Strapi release):

   ```bash
   node scripts/interactive-demos/setup-demo-app.js ~/strapi-demo --port 1337
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
   node scripts/interactive-demos/capture.js content-manager
   ```

   The first run creates the admin user, Kai Doe, with these credentials. Always use a made-up `example.com` address: the admin home page, the user menu and the users list display it, and it would end up in the published screenshots. `DEMO_STRAPI_DIR` is the demo app folder, where the Media Library demo takes the images it uploads. Each run resets what the scenario changes (see `<id>.setup.js`), so you can capture as often as needed. A run takes about a minute and captures light and dark screenshots at once.

4. Check the result with `yarn dev`, then commit the scenario, the JSON file and the images.

The Internationalization demo starts by turning off localization on Article, and its tour turns it back on. If its capture stops midway, run it again until it completes before capturing other demos.

If the capture stops with `Target not visible: <selector>` or a timeout, the interface changed: the step's selector no longer matches. Fix the selector in `scenarios/<id>.yaml` and run the capture again.

`capture.js` needs `playwright-core` and a Chromium build. If `playwright-core` is not installed, point `PLAYWRIGHT_CORE_PATH` to a copy of it (for example the one in the Yarn cache).

## Weight and loading

Each screen is saved in WebP, in light and dark, at 2 widths: 1920 px for the page and 3840 px (`-hd`) for full screen and zoomed steps. The browser picks the size it needs through `srcset`. Identical screens are saved once. The Content Manager demo weighs 5.6 MB in the repository, and a reader who goes through all 38 steps downloads about 0.9 MB.

In the page, nothing loads before the demo gets close to the viewport (`loading="lazy"`), then one screen at a time, one step ahead. With data saver on or a 2G connection, the demo shows a "Load the demo" card and downloads nothing until it is clicked. This detection relies on `navigator.connection`, which some browsers lack: they get lazy loading only. A "Read the steps as text" list under each demo gives the steps to screen readers and to readers who skip the demo.

Recapturing only adds the screens that changed to the Git history.

## Write a demo from a plain-text description

Describe the tour in `scenarios/<id>.md`, in your own words: the page it starts on, then each step in order, with the text of each bubble when you have one. For example:

```markdown
Start on the Article list view in the Content Manager.
Intro: "Let's see how to filter entries!", button "Let's go 🚀".

1. Highlight the Filters button: "Filters help you find specific entries."
2. Click Filters.
3. Pick the "category" field in the list that opens.
4. Type "nature" in the value field.
5. Click Add filter: "Only nature articles are left!"

End: "Thank you for following this guided tour!", with a link to the Content Manager docs.
```

Then, in Claude Code, run `/inki:inki-interactive-demo <id>`. It reads the description, finds each element in the running demo app, writes `<id>.yaml` (and `<id>.setup.js` when the tour changes data), captures the demo twice, checks the screens, and lists where the scenario had to differ from the description. Run it again after changing the description or when the interface changes.

To look at the app yourself at a given step, the way `/inki:inki-interactive-demo` does:

```bash
node scripts/interactive-demos/explore.js <id> --step 5 --out /tmp/explore
```

It replays the scenario up to step 5, then saves a screenshot and the accessibility tree (the roles and names that selectors use), and says whether step 5's target is found. Add `--url /admin/...` to open another page, for a new scenario with no steps yet.

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
  links:
    - label: Content Manager docs 📖
      href: /cms/features/content-manager
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
