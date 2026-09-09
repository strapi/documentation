/* THE CAMERA SOURCE. The only file in this world that knows MediaPipe exists.
   Everything above it consumes plain frames, which is why the filter, the
   state machine and the wiring can all be proved without a webcam.

   Two things here are not implementation detail, they are the feature:

   NOTHING IS FETCHED BEFORE THE ARMING CLICK. Eleven megabytes over the wire,
   for something almost no visitor will switch on, must not be spent on their
   behalf. The import is dynamic and lives inside arm().

   DISARMING STOPS EVERY TRACK. The camera indicator light going out is the
   only trustworthy statement about a camera; a sentence on a page is not one.
   That promise has to hold even when disarm() lands in the middle of arm():
   a pending arm() carries an abort token, checked after every await, and
   whatever it already acquired by the time the abort is noticed (a stream,
   a landmarker) is torn down right there rather than handed to a state that
   claims to be off. disarm() also closes the current landmarker, so a source
   that is armed once and never rearmed does not hold WASM/GPU resources for
   the life of the page; arm() separately closes a landmarker it is about to
   replace, for the case where it is called again without an intervening
   disarm(). */

const CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1';
const MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export function makeCameraSource() {
  let state = 'off', stream = null, landmarker = null, video = null, raf = 0;
  let visionPromise = null; // memoized: the 11MB import is paid for once per source, not once per arm()
  let armToken = null;      // the in-flight arm()'s cancellation flag, or null when idle
  let lastVideoTime = -1;
  const subs = [];
  const emit = (f) => { for (const cb of subs) cb(f); };
  const stopTracks = (s) => { if (s) s.getTracks().forEach(t => t.stop()); };

  async function loop() {
    if (state !== 'on') return;
    if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
      lastVideoTime = video.currentTime;
      let res = null;
      try { res = landmarker.detectForVideo(video, performance.now()); } catch (e) { res = null; }
      if (res) {
        const hands = (res.landmarks || []).map((landmarks, i) => ({
          landmarks,
          handedness: (res.handednesses && res.handednesses[i] && res.handednesses[i][0]
            && res.handednesses[i][0].categoryName) || 'Right',
        }));
        emit({ hands });
      } else emit({ hands: [] });
    }
    if (state === 'on') raf = requestAnimationFrame(loop);
  }

  return {
    state: () => state,
    onFrame(cb) { subs.push(cb); },
    disarm() {
      // a pending arm(), if any, must never reach 'on' after this call: it
      // will find this token stale the next time it checks, right after
      // whichever await it is currently suspended on, and unwind from there.
      // Marking it aborted here, before anything else, is also what makes
      // closing landmarker below safe: that pending arm() can now only ever
      // take its own aborted branches, none of which touch this variable
      // (it either closes ITS OWN new instance and returns without reading
      // landmarker at all, or it has already synchronously promoted a new
      // instance into landmarker before its next await, in which case that
      // is the very instance being closed here). Either way, nothing is
      // left for it to promote over this close, and nothing here gets
      // closed twice.
      if (armToken) { armToken.aborted = true; armToken = null; }
      if (raf) cancelAnimationFrame(raf), raf = 0;
      // every track, or the light stays on and the promise on the page is a lie
      if (stream) { stopTracks(stream); stream = null; }
      if (video) { video.srcObject = null; video = null; }
      // close it here too, not only when a later arm() replaces it: without
      // this, a source that is armed once and never rearmed holds its
      // landmarker's WASM/GPU resources for the life of the page.
      if (landmarker) { try { landmarker.close(); } catch (e) {} landmarker = null; }
      state = 'off';
      lastVideoTime = -1;
    },
    async arm() {
      if (state === 'on' || state === 'loading') return;
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { state = 'unsupported'; return; }
      state = 'loading';
      const token = { aborted: false };
      armToken = token;

      let vision;
      try {
        if (!visionPromise) visionPromise = import(/* @vite-ignore */ `${CDN}/vision_bundle.mjs`);
        vision = await visionPromise;
      } catch (e) {
        visionPromise = null; // do not memoize a failed fetch, a retry must be possible
        if (!token.aborted) state = 'unreachable';
        return;
      }
      if (token.aborted) return; // disarm() already put state back to 'off'

      let built;
      try {
        const files = await vision.FilesetResolver.forVisionTasks(`${CDN}/wasm`);
        if (token.aborted) return;
        built = await vision.HandLandmarker.createFromOptions(files, {
          baseOptions: { modelAssetPath: MODEL, delegate: 'GPU' },
          // ONE HAND. The second hand never drove anything a single hand
          // could not: the old two-hand pinch-distance zoom is gone (see
          // gestures.js), and nothing else in this world ever looked past
          // hands[0]. Tracking a second hand cost a real frame of work for
          // no feature, and left which hand counts as "primary" dependent on
          // MediaPipe's own return order, which is not stable across frames.
          runningMode: 'VIDEO', numHands: 1,
        });
      } catch (e) {
        if (!token.aborted) state = 'unreachable';
        return;
      }
      if (token.aborted) {
        // built, but disarm() ran before this line and can never see it:
        // nothing else references it, so it must close itself here or the
        // wasm/GPU resources behind it just leak with no loop to blame.
        try { built.close(); } catch (e) {}
        return;
      }
      // disarm() already closes landmarker on its way out, so this only
      // ever fires when arm() is called again WITHOUT an intervening
      // disarm() (a retry after 'denied'/'unreachable'/'unsupported'):
      // close the instance from that previous attempt before replacing it.
      if (landmarker && landmarker !== built) { try { landmarker.close(); } catch (e) {} }
      landmarker = built;

      let acquired;
      try {
        acquired = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' }, audio: false,
        });
      } catch (e) {
        if (!token.aborted) {
          state = 'denied';
          if (landmarker) { try { landmarker.close(); } catch (error) {} landmarker = null; }
        }
        return;
      }
      if (token.aborted) {
        // the exact bug this file exists to prevent: disarm() ran before
        // this stream existed, so it never had a chance to stop it. Stop
        // it here instead, or the camera light comes on after a refusal.
        stopTracks(acquired);
        return;
      }
      stream = acquired;

      video = document.createElement('video');
      video.autoplay = true; video.playsInline = true; video.muted = true;
      video.srcObject = stream;
      try { await video.play(); } catch (error) {
        if (!token.aborted) { this.disarm(); state = 'denied'; }
        return;
      }
      if (token.aborted) return; // disarm() already tore down stream/video/state

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
