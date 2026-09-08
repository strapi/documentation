/* The only thing the page loads eagerly, and it loads nothing else. It mounts
   the reticle, wires the button, and imports nothing from MediaPipe until the
   button is pressed. */
import { mountHud } from './hud.js';
import { startHands } from './hands.js';

const hud = mountHud();
window.__handHud = hud;                 /* the world uses this to name what is snapped */
const btn = document.getElementById('handctlbtn');
if (btn) {
  const api = startHands({});
  window.__hands = api;                 /* probes and the world read the state here */
  const label = (s) => {
    const kbd = btn.querySelector('kbd');
    if (kbd) kbd.textContent = s === 'on' ? 'ON' : s === 'loading' ? '…' : 'OFF';
    btn.setAttribute('aria-pressed', String(s === 'on'));
    btn.classList.toggle('warn', s === 'denied' || s === 'unsupported' || s === 'unreachable');
    btn.title = s === 'denied' ? 'Camera permission was refused. Click to ask again.'
      : s === 'unsupported' ? 'This browser cannot open a camera here.'
      : s === 'unreachable' ? 'The tracking model could not be downloaded.'
      : '';
  };
  window.addEventListener('hand:state', (e) => label(e.detail.state));
  btn.addEventListener('click', async () => {
    // 'loading' must be disarmable too, not just 'on': without this, a
    // second click mid-download called arm() again, which source.js's own
    // arm() no-ops on while already 'loading', so the button had no way to
    // cancel an 11 MB download in progress.
    var s = api.state();
    if (s === 'on' || s === 'loading') api.disarm(); else await api.arm();
  });
}
