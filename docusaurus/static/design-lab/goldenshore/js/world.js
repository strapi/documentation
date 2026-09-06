// The light does the photorealism work: a real Sky atmosphere, one honey sun,
// ACES film rolloff, warm fog, a sea with a road of glitter, and PBR surfaces
// whose detail is painted to canvas at boot. WebGL2 pushed hard, honestly.

import * as THREE from 'three';
import { Sky } from '../vendor/Sky.js';
import { Water } from '../vendor/Water.js';
import { terrainHeight, terrainSlope, COAST_X, TERRACES } from './terrain.js';

export const WORLD = {
  renderer: null, scene: null, camera: null,
  sun: null, sunDir: new THREE.Vector3(), sky: null, water: null,
  windUniforms: [], godRays: [], hazePlanes: [], bobbers: [],
  keeperHour: false, sunElevation: 3.6, exposure: 0.62,
  reducedMotion: false, gulls: null, contextLost: false,
};

// ---------- height fog, patched into every fogged material ----------
// Warm air pools low: density falls off with altitude, so the terraces hold
// haze while the crag stands clear and each ridge reads as its own plane.
// Patched at module load, before any material ever compiles.
THREE.ShaderChunk.fog_pars_vertex = `
#ifdef USE_FOG
	varying vec3 vFogWorldPos;
#endif`;
THREE.ShaderChunk.fog_vertex = `
#ifdef USE_FOG
	vFogWorldPos = ( inverse( viewMatrix ) * mvPosition ).xyz;
#endif`;
THREE.ShaderChunk.fog_pars_fragment = `
#ifdef USE_FOG
	varying vec3 vFogWorldPos;
	uniform vec3 fogColor;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`;
THREE.ShaderChunk.fog_fragment = `
#ifdef USE_FOG
	{
		vec3 fogRay = vFogWorldPos - cameraPosition;
		float fogDist = length( fogRay );
		#ifdef FOG_EXP2
			float fogB = 0.060;
			float fogRy = fogRay.y / max( fogDist, 0.001 ) * fogB;
			float fogHInt = abs( fogRy ) > 0.00012
				? exp( -max( cameraPosition.y, 0.0 ) * fogB ) * ( 1.0 - exp( -fogDist * fogRy ) ) / fogRy
				: fogDist * exp( -max( cameraPosition.y, 0.0 ) * fogB );
			float fogAmt = fogDensity * ( 0.32 * fogDist + 1.05 * max( fogHInt, 0.0 ) );
			float fogFactor = 1.0 - exp( -fogAmt );
		#else
			float fogFactor = smoothstep( fogNear, fogFar, fogDist );
		#endif
		gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, clamp( fogFactor, 0.0, 1.0 ) );
	}
#endif`;

// ---------- procedural texture kitchen ----------

function makeCanvas(size) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  return [c, c.getContext('2d')];
}

// Tileable value noise painted to a canvas, for roughness and height maps.
export function noiseCanvas(size, freq, contrast = 1, base = 0.5) {
  const [c, ctx] = makeCanvas(size);
  const img = ctx.createImageData(size, size);
  const g = [];
  for (let i = 0; i < freq * freq; i++) g.push(Math.random());
  const at = (x, y) => g[((y % freq + freq) % freq) * freq + ((x % freq + freq) % freq)];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = 0, amp = 0.55, f = freq / size;
      for (let o = 0; o < 4; o++) {
        const sx = x * f, sy = y * f;
        const ix = Math.floor(sx), iy = Math.floor(sy);
        const fx = sx - ix, fy = sy - iy;
        const s = (a, b, t) => a + (b - a) * (t * t * (3 - 2 * t));
        const period = Math.max(1, Math.round(freq * f * size / freq));
        void period;
        const n00 = at(ix, iy), n10 = at(ix + 1, iy), n01 = at(ix, iy + 1), n11 = at(ix + 1, iy + 1);
        v += amp * s(s(n00, n10, fx), s(n01, n11, fx), fy);
        amp *= 0.5; f *= 2;
      }
      const val = Math.max(0, Math.min(255, (base + (v - 0.5) * contrast) * 255));
      const i = (y * size + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = val; img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

// Height canvas to tangent-space normal map.
export function normalFromHeight(heightCanvas, strength = 1.6) {
  const size = heightCanvas.width;
  const src = heightCanvas.getContext('2d').getImageData(0, 0, size, size).data;
  const [c, ctx] = makeCanvas(size);
  const img = ctx.createImageData(size, size);
  const h = (x, y) => src[(((y + size) % size) * size + ((x + size) % size)) * 4] / 255;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (h(x + 1, y) - h(x - 1, y)) * strength;
      const dy = (h(x, y + 1) - h(x, y - 1)) * strength;
      const inv = 1 / Math.sqrt(dx * dx + dy * dy + 1);
      const i = (y * size + x) * 4;
      img.data[i] = (-dx * inv * 0.5 + 0.5) * 255;
      img.data[i + 1] = (-dy * inv * 0.5 + 0.5) * 255;
      img.data[i + 2] = (inv * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

export function canvasTexture(canvas, repeat = 1) {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  return t;
}

// Warm mottled plaster albedo: near-white so vertex colors keep the palette,
// with soft stains, ochre patches and faint weather streaks under the light.
function plasterAlbedo(size = 512) {
  const [c, ctx] = makeCanvas(size);
  ctx.fillStyle = '#efece6'; ctx.fillRect(0, 0, size, size);
  const noise = noiseCanvas(size, 6, 0.5);
  ctx.globalAlpha = 0.35; ctx.drawImage(noise, 0, 0); ctx.globalAlpha = 1;
  // big soft stains (damp, sun bleach)
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * size, y = Math.random() * size, r = 26 + Math.random() * 90;
    const g = ctx.createRadialGradient(x, y, 2, x, y, r);
    const warm = Math.random() > 0.5;
    const a = 0.045 + Math.random() * 0.075;
    g.addColorStop(0, warm ? `rgba(196,164,116,${a})` : `rgba(126,118,106,${a})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
  // faint vertical weather streaks
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * size, w = 2 + Math.random() * 7, h = 40 + Math.random() * 200;
    const y = Math.random() * size;
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, `rgba(112,100,84,${0.05 + Math.random() * 0.05})`);
    g.addColorStop(1, 'rgba(112,100,84,0)');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  }
  // fine speckle
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(90,80,66,0.05)';
    ctx.fillRect(Math.random() * size, Math.random() * size, 1.6, 1.6);
  }
  return c;
}

// Coursed limestone albedo: block pattern with per-block value jitter and
// darker mortar joints. Near-white so vertex colors carry the hue.
function stoneAlbedo(size = 512, courses = 9) {
  const [c, ctx] = makeCanvas(size);
  ctx.fillStyle = '#e7e2d8'; ctx.fillRect(0, 0, size, size);
  const ch = size / courses;
  for (let row = 0; row < courses; row++) {
    const y = row * ch;
    let x = (row % 2) * ch * -0.8;
    while (x < size) {
      const bw = ch * (1.4 + Math.random() * 1.3);
      const v = 0.86 + Math.random() * 0.2;
      ctx.fillStyle = `rgb(${(226 * v) | 0},${(219 * v) | 0},${(206 * v) | 0})`;
      ctx.fillRect(x + 2, y + 2, bw - 4, ch - 4);
      // per-block mottling
      for (let k = 0; k < 14; k++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(96,86,70,0.07)';
        ctx.fillRect(x + 3 + Math.random() * (bw - 8), y + 3 + Math.random() * (ch - 8), 3 + Math.random() * 8, 2 + Math.random() * 5);
      }
      x += bw;
    }
    // mortar shadow line
    ctx.fillStyle = 'rgba(70,60,48,0.5)';
    ctx.fillRect(0, y, size, 2);
  }
  const noise = noiseCanvas(size, 10, 0.4);
  ctx.globalAlpha = 0.22; ctx.drawImage(noise, 0, 0); ctx.globalAlpha = 1;
  return c;
}

// Directional wood grain, near-white, with worn darkened edges so every
// board face (0..1 UV) reads as a used plank. Grain runs along V.
function woodAlbedo(size = 256) {
  const [c, ctx] = makeCanvas(size);
  ctx.fillStyle = '#e4d9c8'; ctx.fillRect(0, 0, size, size);
  for (let x = 0; x < size; x += 2) {
    const v = 0.82 + 0.18 * Math.abs(Math.sin(x * 0.19 + Math.sin(x * 0.041) * 3.1));
    ctx.fillStyle = `rgba(${(150 * v) | 0},${(122 * v) | 0},${(92 * v) | 0},0.5)`;
    ctx.fillRect(x, 0, 2, size);
  }
  // long grain streaks
  for (let i = 0; i < 46; i++) {
    const x = Math.random() * size, len = 60 + Math.random() * 200, y = Math.random() * size;
    ctx.strokeStyle = `rgba(84,62,40,${0.1 + Math.random() * 0.16})`;
    ctx.lineWidth = 0.8 + Math.random() * 1.4;
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + (Math.random() - 0.5) * 7, y + len / 2, x + (Math.random() - 0.5) * 4, y + len);
    ctx.stroke();
  }
  // knots
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * size, y = Math.random() * size, r = 3 + Math.random() * 5;
    ctx.strokeStyle = 'rgba(70,50,32,0.5)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.ellipse(x, y, r, r * 1.7, 0, 0, 7); ctx.stroke();
    ctx.fillStyle = 'rgba(70,50,32,0.4)';
    ctx.beginPath(); ctx.ellipse(x, y, r * 0.4, r * 0.7, 0, 0, 7); ctx.fill();
  }
  // worn, sun-silvered edges of each plank face
  const edge = ctx.createLinearGradient(0, 0, 0, size);
  ctx.fillStyle = 'rgba(58,44,30,0.34)';
  ctx.fillRect(0, 0, size, 7); ctx.fillRect(0, size - 7, size, 7);
  ctx.fillRect(0, 0, 7, size); ctx.fillRect(size - 7, 0, 7, size);
  ctx.fillStyle = 'rgba(255,244,224,0.16)';
  ctx.fillRect(0, 8, size, 2); ctx.fillRect(0, size - 10, size, 2);
  void edge;
  return c;
}

// Terracotta tile-row albedo for the roof slopes under the instanced rows:
// horizontal courses with per-tile hue jitter and shadow under each course.
function tileAlbedo(size = 256, rows = 7) {
  const [c, ctx] = makeCanvas(size);
  ctx.fillStyle = '#b06a48'; ctx.fillRect(0, 0, size, size);
  const rh = size / rows;
  for (let r = 0; r < rows; r++) {
    const y = r * rh;
    const cols = 9;
    for (let k = 0; k < cols; k++) {
      const hue = 14 + Math.random() * 14, sat = 42 + Math.random() * 22, li = 38 + Math.random() * 17;
      ctx.fillStyle = `hsl(${hue},${sat}%,${li}%)`;
      ctx.fillRect(k * size / cols, y, size / cols - 1.5, rh - 2);
      // curved highlight per tile
      const g = ctx.createLinearGradient(k * size / cols, 0, (k + 1) * size / cols, 0);
      g.addColorStop(0, 'rgba(50,20,8,0.32)');
      g.addColorStop(0.5, 'rgba(255,214,170,0.18)');
      g.addColorStop(1, 'rgba(50,20,8,0.32)');
      ctx.fillStyle = g; ctx.fillRect(k * size / cols, y, size / cols - 1.5, rh - 2);
    }
    ctx.fillStyle = 'rgba(40,16,6,0.55)';
    ctx.fillRect(0, y + rh - 3, size, 3);
  }
  return c;
}

// Packed dirt with fine gravel for the terrain detail multiply.
function groundAlbedo(size = 256) {
  const [c, ctx] = makeCanvas(size);
  ctx.fillStyle = '#dcd2c0'; ctx.fillRect(0, 0, size, size);
  const noise = noiseCanvas(size, 12, 0.8);
  ctx.globalAlpha = 0.62; ctx.drawImage(noise, 0, 0); ctx.globalAlpha = 1;
  for (let i = 0; i < 5200; i++) {
    const v = Math.random();
    ctx.fillStyle = v > 0.6 ? 'rgba(255,250,238,0.14)' : 'rgba(74,60,44,0.17)';
    const s = 1 + Math.random() * 2.4;
    ctx.fillRect(Math.random() * size, Math.random() * size, s, s * 0.7);
  }
  // sparse dry-grass flecks
  for (let i = 0; i < 340; i++) {
    ctx.strokeStyle = `rgba(140,116,60,${0.1 + Math.random() * 0.14})`;
    ctx.lineWidth = 0.8;
    const x = Math.random() * size, y = Math.random() * size;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (Math.random() - 0.5) * 6, y - 3 - Math.random() * 5); ctx.stroke();
  }
  return c;
}

// Cobblestone albedo: staggered rounded setts, worn light tops, dark joints.
function cobbleAlbedo(size = 256) {
  const [c, ctx] = makeCanvas(size);
  ctx.fillStyle = '#5f574c'; ctx.fillRect(0, 0, size, size);
  const rows = 7, ch = size / rows;
  for (let r = 0; r < rows; r++) {
    const y = r * ch + ch / 2;
    const off = (r % 2) * ch * 0.55;
    for (let x = off; x < size + ch; x += ch * 1.06) {
      const rx = ch * (0.44 + Math.random() * 0.1), ry = ch * (0.38 + Math.random() * 0.08);
      const v = 0.78 + Math.random() * 0.34;
      const g = ctx.createRadialGradient(x - rx * 0.3, y - ry * 0.35, 1, x, y, rx);
      g.addColorStop(0, `rgb(${(176 * v) | 0},${(168 * v) | 0},${(156 * v) | 0})`);
      g.addColorStop(0.75, `rgb(${(142 * v) | 0},${(134 * v) | 0},${(122 * v) | 0})`);
      g.addColorStop(1, 'rgba(64,56,46,0.9)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(x, y, rx, ry, (Math.random() - 0.5) * 0.4, 0, 7); ctx.fill();
    }
  }
  const noise = noiseCanvas(size, 10, 0.4);
  ctx.globalAlpha = 0.16; ctx.drawImage(noise, 0, 0); ctx.globalAlpha = 1;
  return c;
}

// Packed dirt with two wheel ruts running along V, darker than the grass line.
function rutAlbedo(size = 256) {
  const [c, ctx] = makeCanvas(size);
  ctx.fillStyle = '#c9b795'; ctx.fillRect(0, 0, size, size);
  const noise = noiseCanvas(size, 9, 0.5);
  ctx.globalAlpha = 0.4; ctx.drawImage(noise, 0, 0); ctx.globalAlpha = 1;
  // the two ruts, soft edged, wandering a little
  for (const u of [0.30, 0.70]) {
    for (let y = 0; y < size; y += 2) {
      const wob = Math.sin(y * 0.05) * 3 + Math.sin(y * 0.013 + u * 9) * 4;
      const x = u * size + wob, w = size * 0.085;
      const g = ctx.createLinearGradient(x - w, 0, x + w, 0);
      g.addColorStop(0, 'rgba(84,66,44,0)');
      g.addColorStop(0.5, 'rgba(84,66,44,0.52)');
      g.addColorStop(1, 'rgba(84,66,44,0)');
      ctx.fillStyle = g; ctx.fillRect(x - w, y, w * 2, 2);
    }
  }
  // center crown keeps a little grass
  for (let i = 0; i < 130; i++) {
    const x = size * (0.42 + Math.random() * 0.16), y = Math.random() * size;
    ctx.strokeStyle = `rgba(122,116,58,${0.14 + Math.random() * 0.2})`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (Math.random() - 0.5) * 5, y - 3 - Math.random() * 6); ctx.stroke();
  }
  // gravel
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,248,232,0.10)' : 'rgba(74,60,44,0.13)';
    const s = 1 + Math.random() * 2;
    ctx.fillRect(Math.random() * size, Math.random() * size, s, s * 0.8);
  }
  return c;
}

// A goat track: one narrow worn line in the grass.
function goatAlbedo(size = 128) {
  const [c, ctx] = makeCanvas(size);
  ctx.fillStyle = '#a3915f'; ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += 2) {
    const wob = Math.sin(y * 0.09) * 4 + Math.sin(y * 0.023) * 5;
    const x = size / 2 + wob, w = size * 0.24;
    const g = ctx.createLinearGradient(x - w, 0, x + w, 0);
    g.addColorStop(0, 'rgba(206,186,142,0)');
    g.addColorStop(0.5, 'rgba(214,196,152,0.85)');
    g.addColorStop(1, 'rgba(206,186,142,0)');
    ctx.fillStyle = g; ctx.fillRect(x - w, y, w * 2, 2);
  }
  const noise = noiseCanvas(size, 7, 0.5);
  ctx.globalAlpha = 0.3; ctx.drawImage(noise, 0, 0); ctx.globalAlpha = 1;
  return c;
}

// One course of roman tiles for the instanced roof rows: U runs across the
// tile curve (dark channels, lit crown), V runs along the row with joints
// and per-tile value jitter.
function tileRowAlbedo(w = 64, h = 512, tiles = 8) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const th = h / tiles;
  for (let i = 0; i < tiles; i++) {
    const y = i * th;
    const hue = 15 + Math.random() * 9, sat = 48 + Math.random() * 14, li = 42 + Math.random() * 9;
    ctx.fillStyle = `hsl(${hue},${sat}%,${li}%)`;
    ctx.fillRect(0, y, w, th);
    // crown light and channel shade across the curve
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, 'rgba(44,18,8,0.42)');
    g.addColorStop(0.48, 'rgba(255,220,178,0.20)');
    g.addColorStop(1, 'rgba(44,18,8,0.42)');
    ctx.fillStyle = g; ctx.fillRect(0, y, w, th);
    // the joint where the next tile overlaps
    ctx.fillStyle = 'rgba(38,14,6,0.62)';
    ctx.fillRect(0, y + th - 3, w, 3);
    ctx.fillStyle = 'rgba(255,226,188,0.16)';
    ctx.fillRect(0, y + th - 5, w, 2);
    // weathering flecks
    for (let k = 0; k < 12; k++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,236,206,0.10)' : 'rgba(52,22,10,0.14)';
      ctx.fillRect(Math.random() * w, y + Math.random() * th, 2 + Math.random() * 4, 1.5 + Math.random() * 3);
    }
  }
  return c;
}

// Barrel staves: vertical planks with two dark iron bands.
function barrelAlbedo(size = 128) {
  const [c, ctx] = makeCanvas(size);
  ctx.fillStyle = '#7a5c3c'; ctx.fillRect(0, 0, size, size);
  const staves = 9, sw = size / staves;
  for (let i = 0; i < staves; i++) {
    const v = 0.82 + Math.random() * 0.3;
    ctx.fillStyle = `rgb(${(128 * v) | 0},${(96 * v) | 0},${(62 * v) | 0})`;
    ctx.fillRect(i * sw + 1, 0, sw - 2, size);
    ctx.fillStyle = 'rgba(40,26,14,0.55)';
    ctx.fillRect(i * sw, 0, 1.5, size);
  }
  for (const y of [size * 0.2, size * 0.8]) {
    ctx.fillStyle = 'rgba(38,32,26,0.92)'; ctx.fillRect(0, y - 4, size, 9);
    ctx.fillStyle = 'rgba(210,200,180,0.16)'; ctx.fillRect(0, y - 4, size, 2);
  }
  return c;
}

let SHARED = null;
export function sharedMaps() {
  if (SHARED) return SHARED;
  const stoneH = noiseCanvas(256, 8, 0.9);
  const plasterH = noiseCanvas(256, 16, 0.45);
  const tileH = tileAlbedo(256, 7);
  SHARED = {
    stoneNormal: canvasTexture(normalFromHeight(stoneH, 2.2)),
    stoneRough: canvasTexture(stoneH),
    plasterNormal: canvasTexture(normalFromHeight(plasterH, 1.1)),
    grainNormal: canvasTexture(normalFromHeight(noiseCanvas(128, 32, 0.8), 1.4)),
    plasterMap: (() => { const t = canvasTexture(plasterAlbedo(512)); t.colorSpace = THREE.SRGBColorSpace; return t; })(),
    stoneMap: (() => { const t = canvasTexture(stoneAlbedo(512, 9)); t.colorSpace = THREE.SRGBColorSpace; return t; })(),
    woodMap: (() => { const t = canvasTexture(woodAlbedo(256)); t.colorSpace = THREE.SRGBColorSpace; return t; })(),
    tileMap: (() => { const t = canvasTexture(tileH); t.colorSpace = THREE.SRGBColorSpace; return t; })(),
    tileNormal: canvasTexture(normalFromHeight(tileH, 1.6)),
    groundMap: (() => { const t = canvasTexture(groundAlbedo(256)); t.colorSpace = THREE.SRGBColorSpace; return t; })(),
    plasterRough: canvasTexture(noiseCanvas(256, 12, 0.5, 0.78)),
    cobbleMap: (() => { const t = canvasTexture(cobbleAlbedo(256)); t.colorSpace = THREE.SRGBColorSpace; return t; })(),
    cobbleNormal: canvasTexture(normalFromHeight(cobbleAlbedo(256), 2.6)),
    rutMap: (() => { const t = canvasTexture(rutAlbedo(256)); t.colorSpace = THREE.SRGBColorSpace; return t; })(),
    goatMap: (() => { const t = canvasTexture(goatAlbedo(128)); t.colorSpace = THREE.SRGBColorSpace; return t; })(),
    tileRowMap: (() => {
      const t = new THREE.CanvasTexture(tileRowAlbedo(64, 512, 8));
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return t;
    })(),
    barrelMap: (() => { const t = canvasTexture(barrelAlbedo(128)); t.colorSpace = THREE.SRGBColorSpace; return t; })(),
    stoneRough2: canvasTexture(noiseCanvas(256, 9, 0.45, 0.82)),
  };
  return SHARED;
}

// ---------- wind ----------

// mode: 'top' sways what rises (trees, grass), 'hang' ripples what hangs
// from its top edge (cloth), 'all' shifts the whole thing.
export function addWind(material, amplitude, mode = 'top') {
  const u = { uTime: { value: 0 }, uAmp: { value: amplitude } };
  const weight = mode === 'top' ? 'max( position.y, 0.0 )'
    : mode === 'hang' ? 'max( -position.y, 0.0 ) * 1.7'
    : '1.0';
  const flutter = mode === 'hang'
    ? `transformed.z += sin( uTime * 5.6 + phase * 3.1 - position.y * 7.0 ) * uAmp * 0.9 * weight;
       transformed.x += sin( uTime * 7.3 + phase * 2.2 - position.y * 9.0 ) * uAmp * 0.4 * weight;`
    : '';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = u.uTime;
    shader.uniforms.uAmp = u.uAmp;
    shader.vertexShader = 'uniform float uTime; uniform float uAmp;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      {
        vec4 wpos4 = modelMatrix * vec4( position, 1.0 );
        #ifdef USE_INSTANCING
          wpos4 = modelMatrix * instanceMatrix * vec4( position, 1.0 );
        #endif
        float phase = wpos4.x * 0.11 + wpos4.z * 0.13;
        float gust = sin( uTime * 1.25 + phase ) + 0.55 * sin( uTime * 2.3 + phase * 1.7 );
        float weight = ${weight};
        transformed.x += gust * uAmp * weight;
        transformed.z += gust * uAmp * 0.6 * weight;
        ${flutter}
      }`
    );
  };
  WORLD.windUniforms.push(u);
  return u;
}

// ---------- world assembly ----------

// The light never dies silent: renderer creation walks a retry ladder.
// Each attempt uses a fresh canvas, because a canvas whose context was
// refused can stay poisoned.
function tryRenderer(opts) {
  const canvas = document.createElement('canvas');
  canvas.id = 'scene';
  try {
    return new THREE.WebGLRenderer({ canvas, ...opts });
  } catch (err) {
    return null;
  }
}

export async function createRenderer() {
  let r = tryRenderer({ antialias: true, powerPreference: 'high-performance' });
  if (!r) r = tryRenderer({ antialias: false });
  if (!r) {
    await new Promise((res) => setTimeout(res, 300));
    r = tryRenderer({ antialias: false });
  }
  return r;
}

export function initWorld(renderer, reducedMotion) {
  WORLD.reducedMotion = reducedMotion;
  const dprAsk = parseFloat(new URLSearchParams(location.search).get('dpr'));
  renderer.setPixelRatio(dprAsk >= 1 && dprAsk <= 2 ? dprAsk : 1); // DPR 1 by law; ?dpr=2 only for the stills
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = WORLD.exposure;
  WORLD.renderer = renderer;

  // a lost context is paused, not fatal; a restored one resumes and relights
  renderer.domElement.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    WORLD.contextLost = true;
  });
  renderer.domElement.addEventListener('webglcontextrestored', () => {
    WORLD.contextLost = false;
    buildEnvironment(renderer, WORLD.scene);
  });

  const scene = new THREE.Scene();
  WORLD.scene = scene;
  // density feeds the patched height-fog integral above, linear not squared;
  // the color is lifted past sRGB so it still glows warm after ACES pulls it down
  scene.fog = new THREE.FogExp2(0xf5ad76, 0.0023);
  scene.fog.color.multiplyScalar(1.8);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 11000);
  camera.rotation.order = 'YXZ';
  WORLD.camera = camera;

  // Sky and sun. The sun stays eight to eleven degrees over the sea to the west.
  const sky = new Sky();
  sky.scale.setScalar(9000);
  scene.add(sky);
  WORLD.sky = sky;
  const su = sky.material.uniforms;
  su.turbidity.value = 10.0;
  su.rayleigh.value = 3.0;
  su.mieCoefficient.value = 0.004;
  su.mieDirectionalG.value = 0.76;

  const sun = new THREE.DirectionalLight(0xffa763, 8.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 700;
  const S = 95; // tight cascade around the walker
  sun.shadow.camera.left = -S; sun.shadow.camera.right = S;
  sun.shadow.camera.top = S; sun.shadow.camera.bottom = -S;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.9;
  scene.add(sun); scene.add(sun.target);
  WORLD.sun = sun;

  const hemi = new THREE.HemisphereLight(0xa9b6d8, 0x9a7448, 0.85);
  scene.add(hemi);

  setSun(WORLD.sunElevation);

  // Sea with a road of glitter to the harbor mouth.
  const waterNormalsCanvas = normalFromHeight(noiseCanvas(512, 40, 1.5), 2.4);
  const waterNormals = canvasTexture(waterNormalsCanvas, 1);
  const water = new Water(new THREE.PlaneGeometry(9000, 8000), {
    textureWidth: 512, textureHeight: 512,
    waterNormals,
    sunDirection: WORLD.sunDir.clone(),
    sunColor: 0xffa54d,
    waterColor: 0x0b3340,
    distortionScale: 2.7,
    fog: true,
  });
  water.rotation.x = -Math.PI / 2;
  water.position.set(-3000, 0.02, 0);
  water.material.uniforms.size.value = 6.0;
  water.material.uniforms.sunColor.value.setRGB(7.0, 3.1, 0.9);
  scene.add(water);
  WORLD.water = water;

  // the disc itself: an honest additive glow at the sun's true direction,
  // which the water mirror repays as the road of glitter
  {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(128, 128, 2, 128, 128, 128);
    g.addColorStop(0.0, 'rgba(255,246,222,1)');
    g.addColorStop(0.07, 'rgba(255,222,150,0.95)');
    g.addColorStop(0.2, 'rgba(255,176,88,0.42)');
    g.addColorStop(0.5, 'rgba(255,142,62,0.12)');
    g.addColorStop(1.0, 'rgba(255,130,50,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const sm = new THREE.SpriteMaterial({
      map: tex, blending: THREE.AdditiveBlending, depthWrite: false,
      transparent: true, fog: false, opacity: 0.95,
    });
    const glow = new THREE.Sprite(sm);
    glow.scale.setScalar(430);
    sm.opacity = 0.82;
    scene.add(glow);
    WORLD.sunGlow = glow;
  }
  if (WORLD.sunGlow) WORLD.sunGlow.position.copy(WORLD.sunDir).multiplyScalar(2800);

  buildTerrain(scene);
  buildFarRidges(scene);
  buildHazePlanes(scene);
  buildGulls(scene, reducedMotion);
  buildEnvironment(renderer, scene);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return WORLD;
}

export function setSun(elevationDeg) {
  WORLD.sunElevation = elevationDeg;
  const el = THREE.MathUtils.degToRad(elevationDeg);
  const az = Math.PI; // due west, straight down the harbor mouth
  const dir = new THREE.Vector3(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az) * 0.22 - 0.06);
  dir.normalize();
  WORLD.sunDir.copy(dir);
  WORLD.sky.material.uniforms.sunPosition.value.copy(dir);
  WORLD.sun.position.copy(dir.clone().multiplyScalar(420));
  if (WORLD.water) WORLD.water.material.uniforms.sunDirection.value.copy(dir);
  if (WORLD.sunGlow) WORLD.sunGlow.position.copy(dir).multiplyScalar(2800);
}

export function buildEnvironment(renderer, scene) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const skyScene = new THREE.Scene();
  const skyClone = new Sky();
  skyClone.scale.setScalar(2000);
  const a = WORLD.sky.material.uniforms, b = skyClone.material.uniforms;
  b.turbidity.value = a.turbidity.value; b.rayleigh.value = a.rayleigh.value;
  b.mieCoefficient.value = a.mieCoefficient.value; b.mieDirectionalG.value = a.mieDirectionalG.value;
  b.sunPosition.value.copy(a.sunPosition.value);
  skyScene.add(skyClone);
  const envTex = pmrem.fromScene(skyScene, 0.02).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.62;
  pmrem.dispose();
}

function buildTerrain(scene) {
  const SIZE = 1100, SEG = 340;
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const cSand = new THREE.Color(0xcfa46f);
  const cGrass = new THREE.Color(0x97854a);
  const cDry = new THREE.Color(0xbb9857);
  const cRock = new THREE.Color(0x8d8072);
  const cTerrace = new THREE.Color(0xac9166);
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + 90, z = pos.getZ(i);
    const h = terrainHeight(x, z);
    pos.setX(i, x); pos.setY(i, h);
    const slope = terrainSlope(x, z);
    if (h < 1.0) tmp.copy(cSand);
    else {
      const dryness = Math.min(1, Math.max(0, (h - 3) / 40));
      tmp.copy(cGrass).lerp(cDry, dryness * 0.85);
      let onTerrace = 0;
      for (const tr of TERRACES) {
        const dx = x - tr.x, dz = z - tr.z;
        if (dx * dx + dz * dz < tr.r * tr.r * 0.5) { onTerrace = 1; break; }
      }
      if (onTerrace) tmp.lerp(cTerrace, 0.55);
      if (slope > 0.55) tmp.lerp(cRock, Math.min(1, (slope - 0.55) * 1.8));
    }
    // grain variation
    const n = (Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1;
    const v = 0.92 + Math.abs(n) * 0.16;
    colors[i * 3] = tmp.r * v; colors[i * 3 + 1] = tmp.g * v; colors[i * 3 + 2] = tmp.b * v;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const maps = sharedMaps();
  const tn = maps.stoneNormal.clone(); // the shared map keeps its own tiling
  tn.repeat.set(420, 420);
  tn.needsUpdate = true;
  const gm = maps.groundMap.clone();
  gm.repeat.set(300, 300);
  gm.needsUpdate = true;
  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.96, metalness: 0.0, map: gm,
    normalMap: tn, normalScale: new THREE.Vector2(0.65, 0.65),
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  scene.add(mesh);
}

// Ridgelines behind the headland, so the eye finds successive telephoto
// planes milked apart by the height fog. Scenery, not signage.
function buildFarRidges(scene) {
  const layers = [
    { x: 640, amp: 60, base: 30, c: 0x8f7f66, seed: 4.7 },
    { x: 1020, amp: 95, base: 48, c: 0x97846a, seed: 9.1 },
    { x: 1500, amp: 150, base: 72, c: 0xa08a6e, seed: 13.9 },
  ];
  for (const L of layers) {
    const n = 60, span = 3400;
    const pos = [];
    for (let i = 0; i < n; i++) {
      const z0 = -span / 2 + (i / n) * span, z1 = -span / 2 + ((i + 1) / n) * span;
      const y0 = L.base + (Math.sin(z0 * 0.0016 + L.seed) * 0.5 + 0.5) * L.amp
        + Math.sin(z0 * 0.0058 + L.seed * 2.7) * L.amp * 0.16;
      const y1 = L.base + (Math.sin(z1 * 0.0016 + L.seed) * 0.5 + 0.5) * L.amp
        + Math.sin(z1 * 0.0058 + L.seed * 2.7) * L.amp * 0.16;
      pos.push(
        L.x, -30, z0, L.x, y0, z0, L.x, -30, z1,
        L.x, -30, z1, L.x, y0, z0, L.x, y1, z1,
      );
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: L.c, roughness: 1, side: THREE.DoubleSide }));
    scene.add(mesh);
  }
}

// Warm haze pooling in the terraces: honest height-fog fakery.
function buildHazePlanes(scene) {
  const [c, ctx] = makeCanvas(128);
  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,188,118,0.11)');
  grad.addColorStop(1, 'rgba(255,196,130,0.0)');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.MeshBasicMaterial({
    map: tex, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, fog: false, side: THREE.DoubleSide,
  });
  const spots = [
    [-8, 0, 4, 200], [52, 34, 9, 190], [60, 10, 8, 240], [120, -20, 18, 300],
    [100, 26, 17, 200], [185, -30, 32, 280], [235, -70, 46, 220], [-10, 60, 4, 200],
  ];
  for (const [x, z, y, s] of spots) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat.clone());
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y + 6, z);
    m.scale.set(s, s * 0.7, 1);
    m.renderOrder = 6;
    m.userData.base = 1.35;
    scene.add(m);
    WORLD.hazePlanes.push(m);
  }
}

function buildGulls(scene, reducedMotion) {
  if (reducedMotion) return;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    -0.9, 0.18, 0, 0, 0, 0, 0, 0.06, -0.28,
    0.9, 0.18, 0, 0, 0, 0, 0, 0.06, -0.28,
  ]), 3));
  geo.computeVertexNormals();
  const mat = new THREE.MeshBasicMaterial({ color: 0xfff1dc, side: THREE.DoubleSide, fog: true });
  const gulls = new THREE.InstancedMesh(geo, mat, 7);
  gulls.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(gulls);
  WORLD.gulls = { mesh: gulls, seeds: [...Array(7)].map((_, i) => i * 1.37 + 0.6) };
}

const _gm = new THREE.Matrix4(), _gp = new THREE.Vector3(), _gq = new THREE.Quaternion(), _gs = new THREE.Vector3(1, 1, 1);
export function updateWorld(dt, t) {
  if (WORLD.water && !WORLD.reducedMotion) WORLD.water.material.uniforms.time.value += dt * 0.8;
  for (const u of WORLD.windUniforms) u.uTime.value = WORLD.reducedMotion ? 0 : t;
  if (!WORLD.reducedMotion) {
    for (const b of WORLD.bobbers) {
      b.obj.position.y = b.baseY + Math.sin(t * 0.7 + b.phase) * 0.05;
      b.obj.rotation.z = b.baseRZ + Math.sin(t * 0.9 + b.phase * 1.7) * 0.028;
      b.obj.rotation.x = Math.sin(t * 0.55 + b.phase) * 0.02;
    }
  }
  if (WORLD.gulls) {
    const { mesh, seeds } = WORLD.gulls;
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i], a = t * 0.055 * (0.7 + (i % 3) * 0.18) + s * 2.4;
      const r = 60 + (i % 4) * 22;
      _gp.set(-30 + Math.cos(a) * r, 26 + Math.sin(t * 0.5 + s) * 4 + i * 2.5, Math.sin(a) * r * 0.8);
      _gq.setFromEuler(new THREE.Euler(0, -a + Math.PI / 2, Math.sin(t * 2.2 + s) * 0.35));
      const flap = 1 + Math.sin(t * 6 + s * 3) * 0.14;
      _gs.set(1.15, flap, 1.15);
      _gm.compose(_gp, _gq, _gs);
      mesh.setMatrixAt(i, _gm);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }
  // Shadow cascade follows the walker, snapped to reduce shimmer.
  const cam = WORLD.camera;
  const sx = Math.round(cam.position.x / 4) * 4, sz = Math.round(cam.position.z / 4) * 4;
  WORLD.sun.target.position.set(sx, 0, sz);
  WORLD.sun.position.set(sx, 0, sz).addScaledVector(WORLD.sunDir, 420);
  // Haze pools vanish when seen edge on, so they never draw lines in the sky.
  for (const hp of WORLD.hazePlanes) {
    const dy = Math.abs(cam.position.y - hp.position.y);
    const d = Math.max(1, cam.position.distanceTo(hp.position));
    const tilt = Math.min(1, (dy / d) * 6);
    hp.material.opacity = hp.userData.base * tilt;
  }
  // God rays fade by view angle against the sun.
  if (WORLD.godRays.length) {
    const view = new THREE.Vector3();
    cam.getWorldDirection(view);
    const facing = Math.max(0, view.dot(WORLD.sunDir));
    for (const g of WORLD.godRays) g.material.opacity = g.userData.base * (0.25 + 0.75 * facing);
  }
}

// The keeper's hour: the sun two degrees lower, one stop warmer.
export function enterKeeperHour() {
  if (WORLD.keeperHour) return;
  WORLD.keeperHour = true;
  WORLD.targetElevation = WORLD.sunElevation - 2.0;
  WORLD.targetExposure = 0.76;
}
export function tickKeeperHour(dt) {
  if (!WORLD.keeperHour || WORLD.targetElevation === undefined) return false;
  const speed = WORLD.reducedMotion ? 1000 : 0.09;
  const el = THREE.MathUtils.damp(WORLD.sunElevation, WORLD.targetElevation, speed * 12, dt);
  const ex = THREE.MathUtils.damp(WORLD.renderer.toneMappingExposure, WORLD.targetExposure, speed * 12, dt);
  WORLD.renderer.toneMappingExposure = ex;
  setSun(el);
  if (Math.abs(el - WORLD.targetElevation) < 0.02) {
    setSun(WORLD.targetElevation);
    WORLD.targetElevation = undefined;
    buildEnvironment(WORLD.renderer, WORLD.scene);
    WORLD.scene.fog.color.setHex(0xf0a878).multiplyScalar(1.75);
    return true; // transition finished
  }
  return false;
}
