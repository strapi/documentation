/* THE HUD. Its whole reason to exist: when the hand does not respond, you must
   be able to SEE why. Without feedback a gesture interface is a haunted screen.

   The reticle is a ring, not an arrow: there is no cursor in this language and
   an arrowhead would promise pixel precision the hand does not have. The
   monitor is an instrument of the ship, amber on near-black like everything
   else in FIRST LIGHT, and never a video-call window. */

export function mountHud() {
  let reticle = document.getElementById('hand-reticle');
  if (!reticle) {
    reticle = document.createElement('div');
    reticle.id = 'hand-reticle';
    reticle.setAttribute('aria-hidden', 'true');
    reticle.innerHTML = '<i class="hr-ring"></i><i class="hr-dot"></i><span class="hr-tag"></span>';
    document.body.appendChild(reticle);
  }
  const tag = reticle.querySelector('.hr-tag');
  const panel = document.createElement('aside');
  panel.id = 'hand-panel';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Hand controls');
  /* No mode buttons: the owner refused modes ("je ne veux pas avoir a gerer 2
     modes"). What is left is what the panel is actually for: saying what the
     tracker sees, and a way to turn the camera off that needs no gesture. */
  panel.innerHTML = '<div class="hand-status" role="status">WAITING FOR YOUR HAND</div><div class="hand-modes"><button type="button" data-hand-off>CAMERA OFF</button></div><p class="hand-hint">Open your hand to zoom in, close it to zoom out. Pinch briefly to open a page, hold a pinch and move to drag.</p>';
  document.body.appendChild(panel);
  const status = panel.querySelector('.hand-status');
  const hint = panel.querySelector('.hand-hint');
  panel.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button || !window.__hands) return;
    if (button.hasAttribute('data-hand-off')) window.__hands.disarm();
  });
  window.addEventListener('hand:state', (event) => {
    panel.hidden = event.detail.state === 'off';
    status.textContent = ({ on: 'WAITING FOR YOUR HAND', loading: 'STARTING CAMERA…', denied: 'CAMERA ACCESS UNAVAILABLE', unsupported: 'CAMERA NOT SUPPORTED', unreachable: 'TRACKING MODEL UNAVAILABLE' })[event.detail.state] || 'CAMERA OFF';
  });
  window.addEventListener('hand:pose', (event) => {
    /* THE PANEL IS THE ONLY WAY IN, when a gesture does not work, to tell
       apart "it cannot see my hand", "it sees the pinch but will not call it
       a click" and "there is nothing under the reticle to open". Two evenings
       went into that question with nothing on screen to answer it. The frame
       rate is here for the same reason: everything with a time in it is
       scaled by it, and it is the number that differs most between a light
       page and this world. A held message wins for a moment, so a refusal is
       readable rather than overwritten by the next frame. */
    if (holdUntil > performance.now()) return;
    const fps = event.detail.fps ? ` · ${Math.round(event.detail.fps)} FPS` : '';
    status.textContent = (event.detail.posture === 'rest' ? 'RESTING'
      : event.detail.posture === 'pinch' ? 'PINCH HELD'
      : 'HAND TRACKED') + fps;
  });
  let holdUntil = 0;
  const say = (text, ms = 1600) => { status.textContent = text; holdUntil = performance.now() + ms; };
  window.addEventListener('hand:noclick', (e) => {
    say(e.detail.why === 'too brief'
      ? 'PINCH TOO BRIEF TO BE A CLICK'
      : `PINCH, NOT A CLICK · THE HAND TRAVELLED ${e.detail.travel.toFixed(2)}`);
  });
  window.addEventListener('hand:dismiss', () => say('BRUSH SEEN'));
  let x = 0, y = 0, pending = false;

  const paint = () => {
    pending = false;
    reticle.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };
  const schedule = () => { if (!pending) { pending = true; requestAnimationFrame(paint); } };

  window.addEventListener('hand:present', () => reticle.classList.add('on'));
  window.addEventListener('hand:absent', () => {
    reticle.classList.remove('on', 'grabbing');
    status.textContent = 'WAITING FOR YOUR HAND';
  });
  window.addEventListener('hand:move', (e) => { x = e.detail.x; y = e.detail.y; schedule(); });
  window.addEventListener('hand:grab', () => reticle.classList.add('grabbing'));
  window.addEventListener('hand:release', () => reticle.classList.remove('grabbing'));

  return {
    /* the world says what a gesture actually did, since only it knows: see
       its hand:click listener */
    say,
    setSnapped(label) {
      tag.textContent = label || '';
      reticle.classList.toggle('snapped', !!label);
    },
  };
}
