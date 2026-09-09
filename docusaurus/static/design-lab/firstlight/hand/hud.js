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
  panel.innerHTML = '<div class="hand-status" role="status">WAITING FOR YOUR HAND</div><div class="hand-modes"><button type="button" data-hand-mode="navigate" aria-pressed="true">NAVIGATE</button><button type="button" data-hand-mode="zoom" aria-pressed="false">ZOOM</button><button type="button" data-hand-off>CAMERA OFF</button></div><p class="hand-hint">Pinch briefly to open. Hold a pinch and move to drag.</p>';
  document.body.appendChild(panel);
  const status = panel.querySelector('.hand-status');
  const hint = panel.querySelector('.hand-hint');
  panel.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button || !window.__hands) return;
    if (button.hasAttribute('data-hand-off')) window.__hands.disarm();
    else window.__hands.setMode(button.dataset.handMode);
  });
  window.addEventListener('hand:state', (event) => {
    panel.hidden = event.detail.state === 'off';
    status.textContent = ({ on: 'WAITING FOR YOUR HAND', loading: 'STARTING CAMERA…', denied: 'CAMERA ACCESS UNAVAILABLE', unsupported: 'CAMERA NOT SUPPORTED', unreachable: 'TRACKING MODEL UNAVAILABLE' })[event.detail.state] || 'CAMERA OFF';
  });
  window.addEventListener('hand:mode', (event) => {
    for (const button of panel.querySelectorAll('[data-hand-mode]')) {
      button.setAttribute('aria-pressed', String(button.dataset.handMode === event.detail.mode));
    }
    hint.textContent = event.detail.mode === 'zoom'
      ? 'Spread fingers to zoom in; bring them together to zoom out. Hold still to stop. Make a fist to rest.'
      : 'Pinch briefly to open. Hold a pinch and move to drag.';
  });
  window.addEventListener('hand:pose', (event) => {
    status.textContent = event.detail.posture === 'rest' ? 'RESTING'
      : event.detail.posture === 'pinch' ? 'PINCH HELD'
      : event.detail.mode === 'zoom' ? 'ZOOM READY · MOVE YOUR FINGERS' : 'HAND TRACKED · AIM AND PINCH';
  });
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
    setSnapped(label) {
      tag.textContent = label || '';
      reticle.classList.toggle('snapped', !!label);
    },
  };
}
