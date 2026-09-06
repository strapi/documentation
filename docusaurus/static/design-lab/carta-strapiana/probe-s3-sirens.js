'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e).slice(0, 250)));
  page.on('console', m => { if (m.type() === 'error') errs.push('C ' + m.text().slice(0, 200)); });
  await page.goto('http://127.0.0.1:8123/index.html?scale=1&sail=full');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.evaluate(() => { try { localStorage.removeItem('carta.sirensRead'); } catch (e) {} });
  await page.mouse.click(400, 160);   /* the first gesture wakes the graph */
  await page.waitForFunction(() => window.__helmSound && window.__helmSound.sirens &&
    window.__helmSound.sirens.lure && window.__helmSound.sirens.home, null, { timeout: 30000 });
  const loaded = await page.evaluate(() => ({ ...diag.sirens,
    lureLen: Math.round(sound.sirens.lure.buf.duration), homeLen: Math.round(sound.sirens.home.buf.duration) }));
  console.log('LOADED', JSON.stringify(loaded));

  /* the loneliest dark shore: the isle the lure can honestly sing for */
  const target = await page.evaluate(() => {
    let best = null, bs = -1;
    for (const I of world.islands) {
      if (I.inbound !== 0 || sound.sirens.resolved.has(I.slug)) continue;
      let dmin = 1e9;
      for (const J of world.islands) if (J.inbound > 0)
        dmin = Math.min(dmin, Math.hypot(J.pos.x - I.pos.x, J.pos.y - I.pos.y) * world.nmPerUnit);
      if (dmin > bs) { bs = dmin; best = I; }
    }
    return { slug: best.slug, citedClearance: +bs.toFixed(2) };
  });
  console.log('TARGET', JSON.stringify(target));

  /* within hailing: the lure rises, panned toward her */
  await page.evaluate(sl => {
    const I = world.bySlug.get(sl);
    /* east of the bow: ship north of her... place her starboard */
    ship.x = I.pos.x - 2.0 / world.nmPerUnit; ship.y = I.pos.y;
    ship.bearing = ship.orderedBearing = 0; ship.omega = 0; ship.orderHist = [[env.t, 0]];
    ship.boundLock = false;
  }, target.slug);
  await page.waitForTimeout(1500);
  const near = await page.evaluate(() => ({ st: diag.sirenState, g: +sound.sirens.lureG.gain.value.toFixed(3) }));
  console.log('LURE-NEAR', JSON.stringify({ near, sings: near.st.gain > 0.05, ceilingOk: near.st.gain <= 0.321, panRight: near.st.pan > 0.3 }));

  /* beyond range: silence */
  await page.evaluate(sl => {
    const I = world.bySlug.get(sl);
    ship.x = I.pos.x - 20 / world.nmPerUnit; ship.y = I.pos.y;
  }, target.slug);
  await page.waitForTimeout(2600);
  const far = await page.evaluate(() => ({ st: diag.sirenState, g: +sound.sirens.lureG.gain.value.toFixed(3) }));
  console.log('LURE-FAR', JSON.stringify({ far, silent: far.st.gain === 0 && far.g < 0.05 }));

  /* the first dark-shore anchoring: Read Us Home, once, whole */
  await page.evaluate(sl => { placeShipAtDistance(0.3, world.bySlug.get(sl)); dropAnchor(world.bySlug.get(sl)); }, target.slug);
  await page.waitForTimeout(1600);
  const song = await page.evaluate(() => ({ song: diag.sirenSong, playing: sound.sirens.homePlaying,
    resolved: [...sound.sirens.resolved].length, lureG: +sound.sirens.lureG.gain.value.toFixed(3),
    stored: (function(){ try { return JSON.parse(localStorage.getItem('carta.sirensRead')).length; } catch(e){ return -1; } })() }));
  console.log('SONG', JSON.stringify(song));

  /* resolution on read: her sirens are silent for the rest of the visit */
  await page.evaluate(() => { sound.sirenKill(); weighAnchor(); });
  await page.evaluate(sl => {
    const I = world.bySlug.get(sl);
    ship.x = I.pos.x - 2.0 / world.nmPerUnit; ship.y = I.pos.y;
  }, target.slug);
  await page.waitForTimeout(1200);
  const after = await page.evaluate(t => ({ st: diag.sirenState,
    thisOneSilent: diag.sirenState.target !== t }), target.slug);
  console.log('RESOLVED', JSON.stringify(after));

  /* the toggle kills them */
  const killed = await page.evaluate(() => {
    const was = sound.sirens.homePlaying;
    sound.toggle();
    const r = { was, playing: sound.sirens.homePlaying, on: sound.on, lure: sound.sirens.lureG.gain.value };
    sound.toggle();
    return r;
  });
  console.log('KILL', JSON.stringify(killed));

  /* the register survives the reload (localStorage, wrapped) */
  await page.reload();
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.mouse.click(400, 160);
  await page.waitForFunction(() => window.__helmSound && window.__helmSound.sirens && diag.sirens, null, { timeout: 30000 });
  const persisted = await page.evaluate(t => ({ resolved: diag.sirens.resolved,
    has: sound.sirens.resolved.has(t) }), target.slug);
  console.log('PERSISTED', JSON.stringify(persisted));

  console.log('ERRS', JSON.stringify(errs));
  await br.close();
})();
