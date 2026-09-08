/* THE CAMERA SOURCE. The only file in this world that knows MediaPipe exists.
   Everything above it consumes plain frames, which is why the filter, the
   state machine and the wiring can all be proved without a webcam.

   Two things here are not implementation detail, they are the feature:

   NOTHING IS FETCHED BEFORE THE ARMING CLICK. Eleven megabytes over the wire,
   for something almost no visitor will switch on, must not be spent on their
   behalf. The import is dynamic and lives inside arm().

   DISARMING STOPS EVERY TRACK. The camera indicator light going out is the
   only trustworthy statement about a camera; a sentence on a page is not one. */

const CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1';
const MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export function makeCameraSource() {
  let state = 'off', stream = null, landmarker = null, video = null, raf = 0;
  const subs = [];
  const emit = (f) => { for (const cb of subs) cb(f); };

  async function loop() {
    if (state !== 'on') return;
    if (video.readyState >= 2) {
      let res = null;
      try { res = landmarker.detectForVideo(video, performance.now()); } catch (e) { res = null; }
      if (res) {
        const hands = (res.landmarks || []).map((landmarks, i) => ({
          landmarks,
          handedness: (res.handednesses && res.handednesses[i] && res.handednesses[i][0]
            && res.handednesses[i][0].categoryName) || 'Right',
        }));
        emit({ hands });
      }
    }
    raf = requestAnimationFrame(loop);
  }

  return {
    state: () => state,
    onFrame(cb) { subs.push(cb); },
    disarm() {
      if (raf) cancelAnimationFrame(raf), raf = 0;
      // every track, or the light stays on and the promise on the page is a lie
      if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
      if (video) { video.srcObject = null; video = null; }
      state = 'off';
    },
    async arm() {
      if (state === 'on' || state === 'loading') return;
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { state = 'unsupported'; return; }
      state = 'loading';
      let vision;
      try {
        vision = await import(/* @vite-ignore */ `${CDN}/vision_bundle.mjs`);
      } catch (e) { state = 'unreachable'; return; }
      try {
        const files = await vision.FilesetResolver.forVisionTasks(`${CDN}/wasm`);
        landmarker = await vision.HandLandmarker.createFromOptions(files, {
          baseOptions: { modelAssetPath: MODEL, delegate: 'GPU' },
          runningMode: 'VIDEO', numHands: 2,
        });
      } catch (e) { state = 'unreachable'; return; }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' }, audio: false,
        });
      } catch (e) { state = 'denied'; return; }
      video = document.createElement('video');
      video.autoplay = true; video.playsInline = true; video.muted = true;
      video.srcObject = stream;
      await video.play().catch(() => {});
      state = 'on';
      raf = requestAnimationFrame(loop);
    },
  };
}

/* The same interface, driven by hand. Every probe above this file uses it, so
   the wiring, the HUD and the world are all provable with no camera at all. */
export function makeFakeSource() {
  let state = 'off';
  const subs = [];
  return {
    state: () => state,
    onFrame(cb) { subs.push(cb); },
    async arm() { state = 'on'; },
    disarm() { state = 'off'; },
    push(frame) { if (state === 'on') for (const cb of subs) cb(frame); },
  };
}
