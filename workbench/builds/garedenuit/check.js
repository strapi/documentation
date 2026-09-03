/* Self-check: headless sweep of La Gare de Nuit. */
const path = require("path");
const http = require("http");
const fs = require("fs");
const { execSync } = require("child_process");

const PWROOT = "/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core";
const { chromium } = require(PWROOT);

const DIR = __dirname;
const PORT = 8674;

// ---- tiny static server ----
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".svg": "image/svg+xml", ".webp": "image/webp", ".mp4": "video/mp4", ".ico": "image/x-icon" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0].split("#")[0]);
  if (p === "/") p = "/index.html";
  const file = path.join(DIR, p);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end("nf"); return; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream" });
    res.end(data);
  });
});

(async () => {
  await new Promise(r => server.listen(PORT, r));
  const content = JSON.parse(fs.readFileSync(path.join(DIR, "content.json")));
  const prov = JSON.parse(fs.readFileSync(path.join(DIR, "provenance.json")));
  const graph = JSON.parse(fs.readFileSync(path.join(DIR, "graph.json")));
  const ORDER = content.order;

  // pick slugs: every 4th + night pages + siding samples + endpoint-heavy pages
  const set = new Set();
  ORDER.forEach((s, i) => { if (i % 4 === 0) set.add(s); });
  Object.keys(prov).forEach(s => { if (prov[s].night > 0) set.add(s); });
  ["/cms/api/rest", "/cms/api/document-service", "/cms/api/graphql", "/cms/quick-start",
   "/cms/intro", "/cms/api/rest/populate-select"].forEach(s => set.add(s));
  ORDER.filter(s => !graph.inbound[s]).slice(0, 6).forEach(s => set.add(s));
  const slugs = [...set];
  console.log("checking", slugs.length, "slugs");

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on("console", msg => { if (msg.type() === "error") errors.push("[console] " + msg.text().slice(0, 300)); });
  page.on("pageerror", e => errors.push("[pageerror] " + String(e).slice(0, 300)));
  page.on("requestfailed", r => {
    const f = r.failure();
    if (f && f.errorText !== "net::ERR_ABORTED") errors.push("[reqfail] " + r.url() + " " + f.errorText);
  });

  const base = "http://localhost:" + PORT + "/index.html";
  let bad = [];

  // 1. empty hash -> /cms/intro
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".paper", { timeout: 8000 });
  const h0 = await page.evaluate(() => location.hash);
  const t0 = await page.title();
  if (h0 !== "#/cms/intro") bad.push("empty hash did not redirect: " + h0);
  if (!/La Gare de Nuit/.test(t0)) bad.push("bad title: " + t0);
  console.log("redirect ok:", h0, "|", t0);

  // 2. timing: fresh load to first content
  const tStart = Date.now();
  await page.goto(base + "#/cms/quick-start", { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".paper");
  console.log("first content ms:", Date.now() - tStart);

  // 3. hall + quais + legende
  for (const r of ["#/gare", "#/quais", "#/legende"]) {
    await page.evaluate(h => { location.hash = h; }, r);
    await page.waitForTimeout(600);
    const ow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (ow > 1) bad.push("overflow on " + r + ": " + ow);
    console.log("view", r, "overflow:", ow);
  }
  const rows = await page.evaluate(() => { location.hash = "#/gare"; return null; });
  await page.waitForTimeout(400);
  const rowCount = await page.evaluate(() => document.querySelectorAll(".brow").length);
  if (rowCount !== ORDER.length) bad.push("board rows " + rowCount + " != " + ORDER.length);
  console.log("board rows:", rowCount);

  // 4. all sampled slugs
  let n = 0;
  for (const slug of slugs) {
    await page.evaluate(h => { location.hash = h; }, "#" + slug);
    try {
      await page.waitForSelector(".paper", { timeout: 8000 });
    } catch (e) { bad.push("no .paper on " + slug); continue; }
    const res = await page.evaluate(() => ({
      len: (document.querySelector(".paper") || {}).innerText ? document.querySelector(".paper").innerText.length : 0,
      ow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      title: document.title
    }));
    if (res.len < 250) bad.push("short page " + slug + " len=" + res.len);
    if (res.ow > 1) bad.push("overflow " + slug + " " + res.ow + "px");
    if (!res.title || res.title.indexOf("Gare de Nuit") === -1) bad.push("title " + slug + ": " + res.title);
    n++;
    if (n % 20 === 0) console.log("  …", n, "pages checked");
  }
  console.log("pages checked:", n);

  // 5. back/forward
  await page.evaluate(() => { location.hash = "#/cms/intro"; });
  await page.waitForTimeout(300);
  await page.evaluate(() => { location.hash = "#/cms/installation"; });
  await page.waitForTimeout(300);
  await page.goBack();
  await page.waitForTimeout(300);
  const backHash = await page.evaluate(() => ({ h: location.hash, t: document.title }));
  if (backHash.h !== "#/cms/intro" || !/Introduction|intro/i.test(backHash.t)) bad.push("back nav failed: " + JSON.stringify(backHash));
  await page.goForward();
  await page.waitForTimeout(300);
  const fwd = await page.evaluate(() => location.hash);
  if (fwd !== "#/cms/installation") bad.push("forward nav failed: " + fwd);
  console.log("back/forward ok:", backHash.h, "->", fwd);

  // 6. search over all 290
  await page.evaluate(() => { location.hash = "#/gare"; });
  await page.waitForTimeout(300);
  await page.fill("#search", "graphql");
  await page.waitForTimeout(250);
  const sr = await page.evaluate(() => document.querySelectorAll(".sr-item").length);
  if (sr < 1) bad.push("search returned nothing for graphql");
  console.log("search results for 'graphql':", sr);
  await page.fill("#search", "");

  await browser.close();

  // 7. screenshots at 1440x900
  const b2 = await chromium.launch();
  const p2 = await b2.newPage({ viewport: { width: 1440, height: 900 } });
  p2.on("pageerror", e => errors.push("[shot pageerror] " + String(e).slice(0, 200)));
  await p2.goto(base + "#/gare", { waitUntil: "domcontentloaded" });
  await p2.waitForSelector(".brow");
  await p2.waitForTimeout(2600);
  await p2.screenshot({ path: path.join(DIR, "shot-world.jpg"), type: "jpeg", quality: 80 });
  await p2.goto(base + "#/cms/api/document-service", { waitUntil: "domcontentloaded" });
  await p2.waitForSelector(".paper");
  await p2.waitForTimeout(900);
  await p2.screenshot({ path: path.join(DIR, "shot-read.jpg"), type: "jpeg", quality: 80 });
  await b2.close();

  server.close();
  console.log("\n==== RESULT ====");
  console.log("console/page errors:", errors.length);
  errors.slice(0, 20).forEach(e => console.log("  ", e));
  console.log("failures:", bad.length);
  bad.slice(0, 40).forEach(b => console.log("  ", b));
  if (!errors.length && !bad.length) console.log("ALL CLEAR");
  process.exit(errors.length || bad.length ? 1 : 0);
})().catch(e => { console.error("CHECK CRASH", e); process.exit(2); });
