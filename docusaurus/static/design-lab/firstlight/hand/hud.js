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
  let x = 0, y = 0, pending = false;

  const paint = () => {
    pending = false;
    reticle.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };
  const schedule = () => { if (!pending) { pending = true; requestAnimationFrame(paint); } };

  window.addEventListener('hand:present', () => reticle.classList.add('on'));
  window.addEventListener('hand:absent', () => reticle.classList.remove('on', 'grabbing'));
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
