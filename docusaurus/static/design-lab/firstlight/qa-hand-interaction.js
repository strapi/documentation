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
      /* NO MODE TO CHOOSE. The owner refused the two modes this file used to
         click between: "je ne veux pas avoir a gerer 2 modes: j'elargis la
         main, ca zoom, je referme la main, ca dezoom". So an opening hand
         zooms from the first frame, with nothing selected first. */
      const initialScale = window.__handProbe.cam().ts;
      for (let index = 0; index < 15; index++) await push(0.7 + index * 0.04);
      output.openingZoomsWithNoMode = window.__handProbe.cam().ts > initialScale * 1.3;
      for (let index = 0; index < 8; index++) await push(0.9, 0.38);
      const targetX = (1 - (0.38 - 0.2) / 0.6) * innerWidth;
      output.pointerSettlesWithinQuarterSecond = Math.abs(lastMove.x - targetX) < 20;
      await push(0.9);
      await push(0.8);
      const start = window.__handProbe.cam();
      for (let index = 1; index <= 12; index++) await push(0.8 + index * 0.04);
      const opened = window.__handProbe.cam();
      output.spreadZoomsIn = opened.ts > start.ts * 1.8;
      /* A HAND HELD OPEN AND STILL MUST NOT DRIFT THE SCALE, which is the
         point of the dead zone and of the trend gate. The first frames of
         this rest are not part of the question: the aperture is smoothed over
         three frames, so the tail of the spread above is still inside the
         window and legitimately finishes its own gesture. Three resting
         frames flush it, and the drift is measured after that. */
      for (let index = 0; index < 3; index++) await push(1.28);
      const resting = window.__handProbe.cam();
      for (let index = 0; index < 12; index++) await push(1.28 + (index % 2 ? 0.005 : -0.005));
      output.restingDoesNotDrift = window.__handProbe.cam().ts === resting.ts;
      for (let index = 1; index <= 12; index++) await push(1.28 - index * 0.04);
      output.closingZoomsOut = window.__handProbe.cam().ts < opened.ts / 1.8;
      /* A STALLED CAMERA STILL LOSES THE HAND, and 800ms is not a round
         number either: the watchdog now waits four of the camera's own frames
         and never less than 400ms, and the dead man's switch three frames and
         never less than 300ms. Both were fixed at 180 and 150ms, chosen
         against a 30fps camera; on a page heavy enough to slow the camera
         down they fired on ordinary jitter and tore down every gesture in
         progress, which is what "le pinch ne marche toujours pas" looked like
         from the inside. The cost of the trade is here: a camera that truly
         stops is noticed in about half a second rather than a fifth of one. */
      const beforeLoss = window.__handProbe.cam().ts;
      await wait(800);
      output.stalledSourceHidesReticle = !document.getElementById('hand-reticle').classList.contains('on');
      await push(1.4);
      output.reentryDoesNotZoom = window.__handProbe.cam().ts === beforeLoss;
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
      /* 23 is not a round number, it is the rate his camera was measured at
         on the calibration clip: 43ms between frames, and the rate at which
         two versions of this gesture had already failed. */
      output.swipeAtFrameRates = [15, 23, 30, 60].map(fps => {
        const swipe = makeGestureReader();
        let count = 0;
        for (let index = 0; index <= Math.ceil(fps * 0.3); index++) {
          count += swipe.read(hand(0.9, 0.7 - index / fps * 0.72), index / fps).filter(event => event.type === 'dismiss').length;
        }
        return count;
      });
      /* THE PANEL IS STILL PRESSED BY THE HAND, and CAMERA OFF is what is
         left on it: a way out that needs no gesture to be recognised, which
         matters most on the day a gesture is not. */
      const zoomButton = document.querySelector('[data-hand-off]').getBoundingClientRect();
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
      output.pinchPressesCameraOff = api.state() === 'off';
      output.offHidesPanel = document.getElementById('hand-panel').hidden;
      output.headerFits = Array.from(document.querySelector('#topbar').children).every(element => {
        const rect = element.getBoundingClientRect();
        return rect.width === 0 || rect.right <= innerWidth;
      });
      api.destroy();
      return output;
    });
    console.log(JSON.stringify(result, null, 2));
    for (const [name, value] of Object.entries(result)) {
      if (name === 'swipeAtFrameRates') assert.deepEqual(value, [1, 1, 1, 1], name);
      else assert.equal(value, true, name);
    }
    assert.deepEqual(errors, []);
    console.log('PASS: physical landmark sequences through the hand controls and chart');
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
