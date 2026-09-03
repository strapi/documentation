  /* ==================================================================
     CAMERA — a real pinhole, orbiting low. Everything eases.
     ================================================================== */
  var SUN_AZ = 0.62, SUN_EL = 0.115;                /* radians */
  var sunDir = [cos(SUN_AZ) * cos(SUN_EL), sin(SUN_AZ) * cos(SUN_EL), sin(SUN_EL)];
  var sunGnd = [cos(SUN_AZ), sin(SUN_AZ)];
  var SHADOW_SLOPE = 0.34;                          /* graded, not astronomical */

  var cam = { az: 0.7, el: 0.227, dist: 900, tx: 0, ty: 0, fov: 0.78 };
  var camT = { az: 0.7, el: 0.227, dist: 900, tx: 0, ty: 0 };
  var HOME = null;
  var fly = null;
  var W = 0, H = 0, DPR = 1, FOC = 1, PCX = 0, PCY = 0, HORY = 0;
  var eye = [0, 0, 0], fwd = [0, 0, 0], rgt = [0, 0, 0], upv = [0, 0, 0];
  var sunSX = 0, sunSY = 0, sunAhead = false, SE = 0, CE = 1;

  function resize() {
    var r = worldEl.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 1.4);
    W = Math.max(2, Math.round(r.width)); H = Math.max(2, Math.round(r.height));
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    skyKey = '';
    if (paper && typeof fitHome === 'function') fitHome();
  }

  function updateCam() {
    var ca = cos(cam.az), sa = sin(cam.az), ce = cos(cam.el), se = sin(cam.el);
    SE = se; CE = ce;
    eye[0] = cam.tx + cam.dist * ce * ca;
    eye[1] = cam.ty + cam.dist * ce * sa;
    eye[2] = cam.dist * se;
    fwd[0] = -ce * ca; fwd[1] = -ce * sa; fwd[2] = -se;
    rgt[0] = -sa; rgt[1] = ca; rgt[2] = 0;
    upv[0] = -ca * se; upv[1] = -sa * se; upv[2] = ce;
    FOC = (H / 2) / Math.tan(cam.fov / 2);
    HZ_NEAR = cam.dist * 0.22;
    HZ_FAR = clamp(cam.dist * 3.1, 900, 12000);
    PCX = W / 2;
    /* Where the look-at point sits in frame. Down low this is a street
       photograph and the subject rides low under a lot of sky; from above it
       is a diorama on a table and the sheet wants the middle of the frame. */
    var hi = clamp((cam.el - 0.30) / 0.18, 0, 1);
    PCY = H * (0.36 + 0.16 * hi) + FOC * (se / ce) * 0.72 * (1 - hi);
    HORY = PCY - FOC * (se / ce);
    var vz = sunDir[0] * fwd[0] + sunDir[1] * fwd[1] + sunDir[2] * fwd[2];
    sunAhead = vz > 0.02;
    if (sunAhead) {
      var vx = sunDir[0] * rgt[0] + sunDir[1] * rgt[1];
      var vy = sunDir[0] * upv[0] + sunDir[1] * upv[1] + sunDir[2] * upv[2];
      sunSX = PCX + FOC * vx / vz; sunSY = PCY - FOC * vy / vz;
    } else { sunSX = -9999; sunSY = HORY; }
  }

  var px = 0, py = 0, pz = 0, pS = 0;
  function proj(x, y, z) {
    var dx = x - eye[0], dy = y - eye[1], dz = z - eye[2];
    pz = dx * fwd[0] + dy * fwd[1] + dz * fwd[2];
    if (pz < 6) return false;
    pS = FOC / pz;
    px = PCX + (dx * rgt[0] + dy * rgt[1]) * pS;
    py = PCY - (dx * upv[0] + dy * upv[1] + dz * upv[2]) * pS;
    return true;
  }
  function depthOf(x, y, z) {
    return (x - eye[0]) * fwd[0] + (y - eye[1]) * fwd[1] + (z - eye[2]) * fwd[2];
  }

  /* haze: the single effect that turns a diagram into a photograph */
  /* The haze is keyed to how far back the camera stands, the way a long lens
     compresses it: pulling out never dissolves the survey into fog. */
  var HZ_NEAR = 210, HZ_FAR = 2500, HZ_MAX = 0.70;
  function hazeAt(d) {
    var t = (d - HZ_NEAR) / (HZ_FAR - HZ_NEAR);
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return Math.pow(t, 1.45) * HZ_MAX;
  }
