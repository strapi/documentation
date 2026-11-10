#!/usr/bin/env node
/**
 * Shows the demo app at a given point of a scenario, to write or fix its steps.
 *
 * Replays scenarios/<id>.yaml (after its setup) up to a step, then saves a screenshot and the
 * page's accessibility tree (the roles and names that selectors such as role=button[name="Save"]
 * use), and checks whether that step's selectors match a visible element.
 *
 * Usage:
 *   DEMO_STRAPI_URL=... DEMO_STRAPI_EMAIL=... DEMO_STRAPI_PASSWORD=... \
 *   node scripts/interactive-demos/explore.js <id> [--step N] [--url /admin/...] [--out dir] [--no-setup]
 *
 *   --step N     stop where step N is shown, after its `before` actions (default: after the last step)
 *   --url PATH   then open this admin page, to explore beyond the steps written so far
 *   --out DIR    where to write step-N.png and step-N.aria.yaml (default: <tmp>/interactive-demos/<id>)
 *   --no-setup   do not run <id>.setup.js first
 *
 * The scenario file can be missing or have no steps yet: the script then opens its start page
 * (or --url) so you can look for the first selectors.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { openDemo, act, runActions, rectOf } = require('./capture');

function option(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function main() {
  const id = process.argv[2];
  if (!id || id.startsWith('--')) throw new Error('Usage: node scripts/interactive-demos/explore.js <id> [--step N] [--url PATH] [--out DIR] [--no-setup]');
  const outDir = option('out') || path.join(os.tmpdir(), 'interactive-demos', id);
  fs.mkdirSync(outDir, { recursive: true });

  const { scenario, viewport, baseUrl, browser, page } = await openDemo(id, { scale: 1, setup: !process.argv.includes('--no-setup') });
  const steps = scenario.steps || [];
  const stop = option('step') ? Number(option('step')) : steps.length + 1;

  try {
    for (const [index, step] of steps.entries()) {
      const number = index + 1;
      if (number > stop) break;
      await runActions(page, baseUrl, step.before);
      if (number === stop) break;
      await runActions(page, baseUrl, step.do);
      await act(page, baseUrl, step);
    }
    const url = option('url');
    if (url) await runActions(page, baseUrl, [{ goto: url }]);

    const label = stop > steps.length ? 'end' : `step-${stop}`;
    const screenshot = path.join(outDir, `${label}.png`);
    const tree = path.join(outDir, `${label}.aria.yaml`);
    await page.screenshot({ path: screenshot });
    fs.writeFileSync(tree, await page.locator('body').ariaSnapshot());
    console.log(`Page: ${page.url().replace(baseUrl, '')}`);
    console.log(`Screenshot: ${screenshot}`);
    console.log(`Accessibility tree: ${tree}`);

    const step = steps[stop - 1];
    const target = step && (step.explain || step.click || step.fill);
    if (target) {
      // Say why a selector fails, without waiting for the 30 s default timeout.
      let usable = true;
      for (const selector of [].concat(target)) {
        const matches = await page.locator(selector).count();
        const visible = matches && (await page.locator(selector).first().isVisible());
        if (!visible) {
          usable = false;
          console.log(`Step ${stop}: "${selector}" ${matches ? `matches ${matches} element(s), but the first one is hidden` : 'matches nothing'}`);
        }
      }
      if (usable) {
        const rect = await rectOf(page, target, viewport, 0);
        console.log(`Step ${stop} target found at ${JSON.stringify(rect)} (% of the screen)`);
      } else {
        console.log('Look for the element in the accessibility tree: it may be inside a closed list or menu (add a `before` click), or have another name.');
        process.exitCode = 2;
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
