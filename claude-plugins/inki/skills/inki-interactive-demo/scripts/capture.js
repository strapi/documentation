#!/usr/bin/env node
/**
 * Captures an interactive demo from a running Strapi app.
 *
 * Plays a scenario (docusaurus/interactive-demos/<id>/scenario.yaml) in a headless
 * browser, after running setup.js in the same folder if it exists to reset the app, takes a light and a dark screenshot at every step, records where the
 * targeted element sits, and writes:
 *   - static/img/assets/interactive-demos/<id>/<NN>.webp and <NN>_DARK.webp (1920 px wide),
 *     plus <NN>-hd.webp and <NN>-hd_DARK.webp (3840 px) for full screen and zoomed steps
 *   - docusaurus/interactive-demos/<id>/generated-capture.json (read by <InteractiveDemo />)
 *
 * Usage:
 *   DEMO_STRAPI_URL=http://localhost:1337 DEMO_STRAPI_DIR=~/strapi-demo \
 *   DEMO_STRAPI_EMAIL=... DEMO_STRAPI_PASSWORD=... \
 *   node claude-plugins/inki/skills/inki-interactive-demo/scripts/capture.js content-manager
 *
 * Run it from the strapi/documentation checkout: it finds the repository from the current
 * folder, not from its own location, so the copy installed with the Inki plugin works too.
 *
 * Requires playwright-core and a Chromium build. Set PLAYWRIGHT_CORE_PATH if
 * playwright-core is not resolvable from the docusaurus folder.
 *
 * Step types in a scenario:
 *   explain: selector | [selectors], text   highlight an area, reader clicks Next
 *                                            (`zoom: true` zooms on it, `padding` widens the highlight)
 *   chapter: true, text                      centered bubble with arrows, no highlight
 *   click: selector, text                    reader clicks the real element to continue
 *   fill: selector, value, text              reader clicks the field, the value gets typed
 *   do: [actions]                            silent actions, no step shown
 * Any step accepts `before: [actions]`, run before the screenshot, and click or fill steps
 * accept `after: [actions]`, run once the action is done (to pick an option in a list, say).
 * Actions: goto, click, fill (with value), press, hover, upload (with files), waitFor (with
 * timeout) and wait (ms). Relative `files` paths start from the demo app folder (DEMO_STRAPI_DIR).
 * The setup can return { start } to replace the scenario's start page.
 * Texts accept **bold**, *italic*, [label](url) and line breaks.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const { createRequire } = require('module');

// The docusaurus folder of the strapi/documentation checkout the command runs from.
function findDocusaurus(start) {
  for (let dir = path.resolve(start); ; dir = path.dirname(dir)) {
    for (const candidate of [dir, path.join(dir, 'docusaurus')]) {
      if (fs.existsSync(path.join(candidate, 'interactive-demos')) && fs.existsSync(path.join(candidate, 'package.json'))) return candidate;
    }
    if (dir === path.dirname(dir)) throw new Error('Run this command from the strapi/documentation repository.');
  }
}

const ROOT = findDocusaurus(process.cwd());
const DEMOS_DIR = path.join(ROOT, 'interactive-demos');
// Dependencies come from the docusaurus folder, not from wherever this script is installed.
const requireFromDocs = createRequire(path.join(ROOT, 'package.json'));
const yaml = requireFromDocs('js-yaml');
const SETTLE_MS = 700;
const SPOTLIGHT_PADDING = 6;
const CAPTURE_SCALE = 3; // 3840 px wide screenshots, sharp in full screen on high-density displays
const PAGE_SCALE = 1.5; // 1920 px wide, what the page loads
const WEBP_QUALITY = 0.85;

function loadPlaywright() {
  const candidates = [process.env.PLAYWRIGHT_CORE_PATH, 'playwright-core', 'playwright'].filter(Boolean);
  for (const candidate of candidates) {
    try {
      return requireFromDocs(candidate);
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
  // A fresh demo app has no admin yet: the first capture registers it.
  const init = await fetch(`${baseUrl}/admin/init`).then((res) => res.json());
  if (!init.data?.hasAdmin) {
    const res = await fetch(`${baseUrl}/admin/register-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstname: 'Kai', lastname: 'Doe', email, password }),
    });
    if (!res.ok) throw new Error(`Admin registration failed: ${res.status} ${await res.text()}`);
  }
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
    del: (url) => call('DELETE', url),
  };
}

// The demo app folder, where uploaded files are taken from.
function appDir() {
  return (process.env.DEMO_STRAPI_DIR || path.join(os.homedir(), 'strapi-demo')).replace(/^~(?=\/|$)/, os.homedir());
}

async function runActions(page, baseUrl, actions = []) {
  for (const action of actions) {
    if (action.goto) await page.goto(`${baseUrl}${action.goto}`);
    else if (action.fill) await page.locator(action.fill).first().fill(action.value);
    else if (action.click) await page.locator(action.click).first().click();
    else if (action.press) await page.keyboard.press(action.press);
    else if (action.hover) await page.locator(action.hover).first().hover();
    else if (action.upload) {
      const files = [].concat(action.files).map((file) => path.resolve(appDir(), file));
      await page.locator(action.upload).first().setInputFiles(files);
    }
    // Waits for an element, after a server restart for instance.
    if (action.waitFor) await page.locator(action.waitFor).first().waitFor({ timeout: action.timeout ?? 60000 });
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

// Loads a scenario, runs its setup, and opens a logged-in admin on its start page.
// Also used by explore.js.
async function openDemo(id, { scale = CAPTURE_SCALE, setup = true } = {}) {
  const scenarioFile = path.join(DEMOS_DIR, id, 'scenario.yaml');
  const scenario = fs.existsSync(scenarioFile) ? yaml.load(fs.readFileSync(scenarioFile, 'utf8')) : { steps: [] };
  const setupFile = path.join(DEMOS_DIR, id, 'setup.js');
  const baseUrl = (process.env.DEMO_STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '');
  const email = requireEnv('DEMO_STRAPI_EMAIL');
  const password = requireEnv('DEMO_STRAPI_PASSWORD');
  const viewport = scenario.viewport || { width: 1280, height: 800 };

  if (setup && fs.existsSync(setupFile)) {
    const overrides = await require(setupFile)({ api: await adminApi(baseUrl, email, password) });
    Object.assign(scenario, overrides);
  }

  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport, deviceScaleFactor: scale, colorScheme: 'light' });
  await context.addInitScript(() => {
    localStorage.setItem('STRAPI_GUIDED_TOUR', JSON.stringify({ tours: {}, enabled: false, hidden: true, completedActions: [] }));
    // Follow prefers-color-scheme so both themes can be captured without a reload.
    localStorage.setItem('STRAPI_THEME', 'system');
    // Toasts such as "Saved document" would linger on the next screenshots.
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style');
      style.textContent = '[data-sonner-toaster] { display: none !important; }';
      document.head.append(style);
    });
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/admin/auth/login`);
  await page.locator('input[name=email]').fill(email);
  await page.locator('input[name=password]').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL(/\/admin(\/)?$/);
  if (scenario.start) await page.goto(`${baseUrl}${scenario.start}`);
  await settle(page);
  return { scenario, viewport, baseUrl, browser, page };
}

// Plays what the reader does on a click or fill step, then its `after` actions.
async function act(page, baseUrl, step) {
  if (step.click) await page.locator(step.click).first().click();
  else if (step.fill) await page.locator(step.fill).first().fill(step.value);
  else return;
  await settle(page);
  await runActions(page, baseUrl, step.after);
}

async function main() {
  const id = process.argv[2];
  if (!id) throw new Error('Usage: node claude-plugins/inki/skills/inki-interactive-demo/scripts/capture.js <demo-id>');
  const imageDir = path.join(ROOT, 'static/img/assets/interactive-demos', id);
  const imageUrl = `/img/assets/interactive-demos/${id}`;
  const dataFile = path.join(DEMOS_DIR, id, 'generated-capture.json');
  // Screenshots go to a temporary folder and replace the demo images only once the whole
  // capture succeeds: a capture that stops midway leaves the current demo untouched.
  const stagingDir = fs.mkdtempSync(path.join(os.tmpdir(), `interactive-demo-${id}-`));
  try {
    await captureTo(id, stagingDir, imageDir, imageUrl, dataFile);
  } finally {
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
}

async function captureTo(id, stagingDir, imageDir, imageUrl, dataFile) {
  const { scenario, viewport, baseUrl, browser, page } = await openDemo(id);
  // Encodes WebP with the browser, so the script needs no image library.
  const encoder = await browser.newPage();
  const toWebp = (png, width) => encoder.evaluate(async ({ b64, width, quality }) => {
    const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
    const height = Math.round((bitmap.height * width) / bitmap.width);
    const canvas = new OffscreenCanvas(width, height);
    const context2d = canvas.getContext('2d');
    context2d.imageSmoothingQuality = 'high';
    context2d.drawImage(bitmap, 0, 0, width, height);
    const blob = await canvas.convertToBlob({ type: 'image/webp', quality });
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  }, { b64: png.toString('base64'), width, quality: WEBP_QUALITY }).then((data) => Buffer.from(data));
  const bytes = { light: 0, dark: 0 };

  // Identical screens share one image pair: explanation steps often stay on the same screen.
  const imagesByHash = new Map();
  const capture = async () => {
    await page.mouse.move(viewport.width - 2, viewport.height - 2);
    // Drop leftover focus rings and tooltips, unless a popover depends on that focus.
    await page.evaluate(() => {
      if (!document.querySelector('[role=dialog], [role=listbox], [data-radix-popper-content-wrapper]')) document.activeElement?.blur();
    });
    await page.waitForTimeout(150);
    const light = await page.screenshot({ type: 'png' });
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForTimeout(400);
    const dark = await page.screenshot({ type: 'png' });
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForTimeout(250);
    const hash = crypto.createHash('sha1').update(light).update(dark).digest('hex');
    if (!imagesByHash.has(hash)) {
      const name = String(imagesByHash.size + 1).padStart(2, '0');
      for (const [theme, png, suffix] of [['light', light, ''], ['dark', dark, '_DARK']]) {
        const normal = await toWebp(png, viewport.width * PAGE_SCALE);
        fs.writeFileSync(path.join(stagingDir, `${name}${suffix}.webp`), normal);
        fs.writeFileSync(path.join(stagingDir, `${name}-hd${suffix}.webp`), await toWebp(png, viewport.width * CAPTURE_SCALE));
        bytes[theme] += normal.length;
      }
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
    if (step.chapter) {
      steps.push({ type: 'chapter', image, text: step.text });
    } else if (step.explain) {
      const rect = await rectOf(page, step.explain, viewport, step.padding ?? SPOTLIGHT_PADDING);
      steps.push({ type: 'explain', image, text: step.text, rect, ...(step.zoom && { zoom: true }) });
    } else if (step.click) {
      const rect = await rectOf(page, step.click, viewport, 0);
      steps.push({ type: 'click', image, text: step.text, rect });
      await act(page, baseUrl, step);
    } else if (step.fill) {
      const rect = await rectOf(page, step.fill, viewport, 0);
      steps.push({ type: 'fill', image, text: step.text, rect, value: step.value });
      await act(page, baseUrl, step);
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
    // What a reader downloads to go through the whole demo, shown before loading on slow connections.
    bytes,
    intro: { ...scenario.intro, image: introImage },
    steps,
    outro: { ...scenario.outro, image: steps[steps.length - 1].image },
  };
  fs.rmSync(imageDir, { recursive: true, force: true });
  fs.cpSync(stagingDir, imageDir, { recursive: true });
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, `${JSON.stringify(demo, null, 2)}\n`);
  console.log(`\n${steps.length} steps, ${imagesByHash.size} image pairs -> ${path.relative(ROOT, dataFile)}`);
}

module.exports = { openDemo, act, runActions, rectOf, settle };

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
