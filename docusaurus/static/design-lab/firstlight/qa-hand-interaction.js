'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');

(async () => {
  const server = spawn(process.execPath, [path.join(__dirname, 'serve.js')]);
  let browser;
  try {
    const port = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Server timeout')), 5000);
      server.stderr.on('data', data => { clearTimeout(timer); reject(new Error(String(data))); });
      server.stdout.on('data', data => {
        const match = String(data).match(/PORT=(\d+)/);
        if (match) { clearTimeout(timer); resolve(Number(match[1])); }
      });
    });
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ body: '' }));
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${port}/`);
    await page.waitForFunction(() => window.__handProbe && window.__hands);
    const result = await page.evaluate(async () => {
      const { makeFakeSource } = await import('./hand/source.js');
      const { startHands } = await import('./hand/hands.js');
      const { makeGestureReader } = await import('./hand/gestures.js');
      const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
      const source = makeFakeSource();
      window.__hands.destroy();
      const api = startHands({ source });
      window.__hands = api;
      await api.arm();
      document.getElementById('gd-next').click();
      const hand = (aperture = 0.9, palmX = 0.5, pinched = false) => {
        const size = 0.18;
        const landmarks = Array.from({ length: 21 }, () => ({ x: palmX, y: 0.45 }));
        landmarks[0] = { x: palmX, y: 0.45 + size };
        landmarks[5] = { x: palmX - size * 0.4, y: 0.45 };
        landmarks[17] = { x: palmX + size * 0.4, y: 0.45 };
        landmarks[8] = { x: palmX - size * aperture / 2, y: 0.45 - size };
        landmarks[20] = { x: palmX + size * aperture / 2, y: 0.45 - size };
        landmarks[12] = { x: palmX, y: 0.45 - size };
        landmarks[16] = { x: palmX + size * 0.2, y: 0.45 - size };
        landmarks[4] = { x: landmarks[8].x + size * (pinched ? 0.2 : 1.3), y: landmarks[8].y };
        return { hands: [{ landmarks, handedness: 'Right' }] };
      };
      const push = async (aperture, palmX = 0.5, pinched = false) => {
        source.push(hand(aperture, palmX, pinched));
        await wait(34);
      };
      const output = {};
      let lastMove;
      window.addEventListener('hand:move', event => { lastMove = event.detail; });
      const initialScale = window.__handProbe.cam().ts;
      for (let index = 0; index < 15; index++) await push(0.7 + index * 0.04);
      output.navigationDoesNotZoom = window.__handProbe.cam().ts === initialScale;
      for (let index = 0; index < 8; index++) await push(0.9, 0.38);
      const targetX = (1 - (0.38 - 0.2) / 0.6) * innerWidth;
      output.pointerSettlesWithinQuarterSecond = Math.abs(lastMove.x - targetX) < 20;
      await push(0.9);
      document.querySelector('[data-hand-mode="zoom"]').click();
      await push(0.8);
      const start = window.__handProbe.cam();
      for (let index = 1; index <= 12; index++) await push(0.8 + index * 0.04);
      const opened = window.__handProbe.cam();
      output.spreadZoomsIn = opened.ts > start.ts * 1.8;
      for (let index = 0; index < 12; index++) await push(1.28 + (index % 2 ? 0.005 : -0.005));
      output.restingDoesNotDrift = window.__handProbe.cam().ts === opened.ts;
      for (let index = 1; index <= 12; index++) await push(1.28 - index * 0.04);
      output.closingZoomsOut = window.__handProbe.cam().ts < opened.ts / 1.8;
      const beforeLoss = window.__handProbe.cam().ts;
      await wait(300);
      output.stalledSourceHidesReticle = !document.getElementById('hand-reticle').classList.contains('on');
      await push(1.4);
      output.reentryDoesNotZoom = window.__handProbe.cam().ts === beforeLoss;
      document.querySelector('[data-hand-mode="navigate"]').click();
      await push(0.9);
      const beforeDrag = window.__handProbe.cam().tx;
      await push(0.9, 0.5, true);
      for (let index = 1; index <= 8; index++) await push(0.9, 0.5 - index * 0.015, true);
      output.dragFollowsHand = window.__handProbe.cam().tx < beforeDrag - 50;
      const reader = makeGestureReader();
      reader.read(hand(0.9), 0);
      reader.read(hand(0.9, 0.5, true), 0.05);
      reader.read(hand(0.9, 0.6, true), 0.15);
      reader.read(hand(0.9, 0.5, true), 0.22);
      output.returningDragDoesNotClick = !reader.read(hand(0.9), 0.3).some(event => event.type === 'click');
      output.swipeAtFrameRates = [15, 30, 60].map(fps => {
        const swipe = makeGestureReader();
        let count = 0;
        for (let index = 0; index <= Math.ceil(fps * 0.3); index++) {
          count += swipe.read(hand(0.9, 0.7 - index / fps * 0.72), index / fps).filter(event => event.type === 'dismiss').length;
        }
        return count;
      });
      const zoomButton = document.querySelector('[data-hand-mode="zoom"]').getBoundingClientRect();
      const buttonFrame = pinched => {
        const frame = hand(0.9, 0.5, pinched);
        const targetPalmX = 0.2 + 0.6 * (1 - (zoomButton.x + zoomButton.width / 2) / innerWidth);
        const targetPalmY = 0.2 + 0.6 * (zoomButton.y + zoomButton.height / 2) / innerHeight;
        for (const point of frame.hands[0].landmarks) {
          point.x += targetPalmX - 0.5;
          point.y += targetPalmY - 0.495;
        }
        return frame;
      };
      for (let index = 0; index < 15; index++) { source.push(buttonFrame(false)); await wait(34); }
      source.push(buttonFrame(true)); await wait(100);
      source.push(buttonFrame(false)); await wait(34);
      output.pinchSelectsZoomButton = api.mode() === 'zoom';
      api.disarm();
      output.offHidesPanel = document.getElementById('hand-panel').hidden;
      output.offResetsMode = api.mode() === 'navigate';
      output.headerFits = Array.from(document.querySelector('#topbar').children).every(element => {
        const rect = element.getBoundingClientRect();
        return rect.width === 0 || rect.right <= innerWidth;
      });
      api.destroy();
      return output;
    });
    console.log(JSON.stringify(result, null, 2));
    for (const [name, value] of Object.entries(result)) {
      if (name === 'swipeAtFrameRates') assert.deepEqual(value, [1, 1, 1], name);
      else assert.equal(value, true, name);
    }
    assert.deepEqual(errors, []);
    console.log('PASS: physical landmark sequences through the hand controls and chart');
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
