#!/usr/bin/env node
/**
 * Captures an interactive demo from a running Strapi app.
 *
 * Plays a scenario (scripts/interactive-demos/scenarios/<id>.js) in a headless
 * browser, takes a light and a dark screenshot at every step, records where the
 * targeted element sits, and writes:
 *   - static/img/assets/interactive-demos/<id>/<NN>.jpg and <NN>_DARK.jpg
 *   - src/components/InteractiveDemo/demos/<id>.json (read by <InteractiveDemo />)
 *
 * Usage:
 *   DEMO_STRAPI_URL=http://localhost:1337 \
 *   DEMO_STRAPI_EMAIL=... DEMO_STRAPI_PASSWORD=... \
 *   node scripts/interactive-demos/capture.js content-manager
 *
 * Requires playwright-core and a Chromium build. Set PLAYWRIGHT_CORE_PATH if
 * playwright-core is not resolvable from this directory.
 *
 * Step types in a scenario:
 *   { explain: selector | selector[] | null, text }  highlight an area, reader clicks Next
 *   { click: selector, text }                        reader clicks the real button to continue
 *   { fill: selector, value, text }                  reader clicks the field, the value gets typed
 *   { do: [actions] }                                silent actions, no step shown
 * Any step accepts `before: [actions]`, run before the screenshot.
 * Actions: { goto }, { click }, { fill, value }, { press }, { wait }.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '../..');
const SETTLE_MS = 700;
const SPOTLIGHT_PADDING = 6;

function loadPlaywright() {
  const candidates = [process.env.PLAYWRIGHT_CORE_PATH, 'playwright-core', 'playwright'].filter(Boolean);
  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch (error) {
      // Try the next candidate.
    }
  }
  throw new Error('playwright-core not found. Install it or set PLAYWRIGHT_CORE_PATH.');
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

async function adminApi(baseUrl, email, password) {
  const response = await fetch(`${baseUrl}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error(`Admin login failed: ${response.status}`);
  const { data } = await response.json();
  const call = async (method, url, body) => {
    const res = await fetch(`${baseUrl}${url}`, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.token}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`${method} ${url} failed: ${res.status} ${await res.text()}`);
    return res.json();
  };
  return {
    get: (url) => call('GET', url),
    put: (url, body) => call('PUT', url, body),
    post: (url, body) => call('POST', url, body),
  };
}

async function runActions(page, baseUrl, actions = []) {
  for (const action of actions) {
    if (action.goto) await page.goto(`${baseUrl}${action.goto}`);
    else if (action.fill) await page.locator(action.fill).first().fill(action.value);
    else if (action.click) await page.locator(action.click).first().click();
    else if (action.press) await page.keyboard.press(action.press);
    if (action.wait) await page.waitForTimeout(action.wait);
    await settle(page);
  }
}

async function settle(page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(SETTLE_MS);
}

async function rectOf(page, selectors, viewport, padding) {
  const list = (Array.isArray(selectors) ? selectors : [selectors]).filter(Boolean);
  if (!list.length) return null;
  const boxes = [];
  for (const selector of list) {
    const box = await page.locator(selector).first().boundingBox();
    if (!box) throw new Error(`Target not visible: ${selector}`);
    boxes.push(box);
  }
  const x1 = Math.max(0, Math.min(...boxes.map((b) => b.x)) - padding);
  const y1 = Math.max(0, Math.min(...boxes.map((b) => b.y)) - padding);
  const x2 = Math.min(viewport.width, Math.max(...boxes.map((b) => b.x + b.width)) + padding);
  const y2 = Math.min(viewport.height, Math.max(...boxes.map((b) => b.y + b.height)) + padding);
  const pct = (value, total) => Math.round((value / total) * 10000) / 100;
  return {
    x: pct(x1, viewport.width),
    y: pct(y1, viewport.height),
    w: pct(x2 - x1, viewport.width),
    h: pct(y2 - y1, viewport.height),
  };
}

async function main() {
  const id = process.argv[2];
  if (!id) throw new Error('Usage: node scripts/interactive-demos/capture.js <scenario-id>');
  const scenario = require(path.join(__dirname, 'scenarios', `${id}.js`));
  const baseUrl = (process.env.DEMO_STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '');
  const email = requireEnv('DEMO_STRAPI_EMAIL');
  const password = requireEnv('DEMO_STRAPI_PASSWORD');
  const viewport = scenario.viewport || { width: 1280, height: 800 };
  const quality = scenario.jpegQuality || 80;

  const imageDir = path.join(ROOT, 'static/img/assets/interactive-demos', id);
  const imageUrl = `/img/assets/interactive-demos/${id}`;
  const dataFile = path.join(ROOT, 'src/components/InteractiveDemo/demos', `${id}.json`);
  fs.rmSync(imageDir, { recursive: true, force: true });
  fs.mkdirSync(imageDir, { recursive: true });
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });

  if (scenario.setup) await scenario.setup({ api: await adminApi(baseUrl, email, password) });

  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport, deviceScaleFactor: scenario.deviceScaleFactor || 1.5, colorScheme: 'light' });
  await context.addInitScript(() => {
    localStorage.setItem('STRAPI_GUIDED_TOUR', JSON.stringify({ tours: {}, enabled: false, hidden: true, completedActions: [] }));
    // Follow prefers-color-scheme so both themes can be captured without a reload.
    localStorage.setItem('STRAPI_THEME', 'system');
  });
  const page = await context.newPage();

  await page.goto(`${baseUrl}/admin/auth/login`);
  await page.locator('input[name=email]').fill(email);
  await page.locator('input[name=password]').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL(/\/admin(\/)?$/);
  await page.goto(`${baseUrl}${scenario.start}`);
  await settle(page);

  // Identical screens share one image pair: explanation steps often stay on the same screen.
  const imagesByHash = new Map();
  const capture = async () => {
    await page.mouse.move(viewport.width - 2, viewport.height - 2);
    // Drop leftover focus rings and tooltips, unless a popover depends on that focus.
    await page.evaluate(() => {
      if (!document.querySelector('[role=dialog], [role=listbox], [data-radix-popper-content-wrapper]')) document.activeElement?.blur();
    });
    await page.waitForTimeout(150);
    const light = await page.screenshot({ type: 'jpeg', quality });
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForTimeout(400);
    const dark = await page.screenshot({ type: 'jpeg', quality });
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForTimeout(250);
    const hash = crypto.createHash('sha1').update(light).update(dark).digest('hex');
    if (!imagesByHash.has(hash)) {
      const name = String(imagesByHash.size + 1).padStart(2, '0');
      fs.writeFileSync(path.join(imageDir, `${name}.jpg`), light);
      fs.writeFileSync(path.join(imageDir, `${name}_DARK.jpg`), dark);
      imagesByHash.set(hash, `${imageUrl}/${name}`);
    }
    return imagesByHash.get(hash);
  };

  const steps = [];
  const introImage = await capture();
  for (const [index, step] of scenario.steps.entries()) {
    const label = `step ${index + 1}`;
    await runActions(page, baseUrl, step.before);
    if (step.do) {
      await runActions(page, baseUrl, step.do);
      continue;
    }
    const image = await capture();
    if ('explain' in step) {
      steps.push({ type: 'explain', image, text: step.text, rect: await rectOf(page, step.explain, viewport, SPOTLIGHT_PADDING) });
    } else if (step.click) {
      const rect = await rectOf(page, step.click, viewport, 0);
      steps.push({ type: 'click', image, text: step.text, rect });
      await page.locator(step.click).first().click();
      await settle(page);
    } else if (step.fill) {
      const rect = await rectOf(page, step.fill, viewport, 0);
      steps.push({ type: 'fill', image, text: step.text, rect, value: step.value });
      await page.locator(step.fill).first().fill(step.value);
      await settle(page);
    } else {
      throw new Error(`Unknown type for ${label}`);
    }
    process.stdout.write(`  ${label} ${steps[steps.length - 1].type} -> ${image}\n`);
  }

  await browser.close();

  const demo = {
    id,
    title: scenario.title,
    width: viewport.width,
    height: viewport.height,
    intro: { ...scenario.intro, image: introImage },
    steps,
    outro: { ...scenario.outro, image: steps[steps.length - 1].image },
  };
  fs.writeFileSync(dataFile, `${JSON.stringify(demo, null, 2)}\n`);
  console.log(`\n${steps.length} steps, ${imagesByHash.size} image pairs -> ${path.relative(ROOT, dataFile)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
