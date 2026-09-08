// The light does the photorealism work: a real Sky atmosphere, one honey sun,
// ACES film rolloff, warm fog, a sea with a road of glitter, and PBR surfaces
// whose detail is painted to canvas at boot. WebGL2 pushed hard, honestly.

import * as THREE from 'three';
import { Sky } from '../vendor/Sky.js';
import { Water } from '../vendor/Water.js';
import { terrainHeight, terrainSlope, COAST_X, TERRACES, provinceWeights, PROVINCE_KEYS, fbm as tfbm } from './terrain.js';

export const WORLD = {
  renderer: null, scene: null, camera: null,
  sun: null, sunDir: new THREE.Vector3(), sky: null, water: null,
  windUniforms: [], godRays: [], hazePlanes: [], bobbers: [],
  rimUniforms: [], gustAmp: 1, // weather scales every wind uniform through this
  keeperHour: false, sunElevation: 4.2, exposure: 0.70,
  reducedMotion: false, gulls: null, contextLost: false,
  sunDisc: null, sunHalo: null, hemi: null,
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
		// two gradients: warm air pools low in the terraces, cooling toward a
		// faint violet with altitude, so stacked ridge lines read as separate
		// planes. The violet is derived from the warm color so weather can
		// steer both through the one fogColor uniform.
		float fogAltT = smoothstep( 4.0, 64.0, vFogWorldPos.y );
		vec3 fogWarm = fogColor;
		vec3 fogCool = fogColor * vec3( 0.60, 0.60, 1.04 );
		vec3 fogCol2 = mix( fogWarm, fogCool, fogAltT );
		gl_FragColor.rgb = mix( gl_FragColor.rgb, fogCol2, clamp( fogFactor, 0.0, 1.0 ) );
	}
#endif`;

// ---------- procedural texture kitchen ----------

function makeCanvas(size) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  return [c, c.getContext('2d')];
}

// Dry soil at arm's length: fine speckle, a scatter of pebbles, and a few
// scuffed drags, tileable so it can be laid across the whole coast.
export function gritCanvas(size) {
  const [c, ctx] = makeCanvas(size);
  ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, size, size);
  const wrapDot = (x, y, r, fill) => {
    for (const dx of [-size, 0, size]) for (const dy of [-size, 0, size]) {
      ctx.beginPath(); ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
    }
  };
  for (let i = 0; i < size * 9; i++) {
    const v = Math.random();
    const g = v < 0.5 ? 96 + Math.random() * 42 : 150 + Math.random() * 60;
    wrapDot(Math.random() * size, Math.random() * size, 0.5 + Math.random() * 1.5,
      `rgba(${g | 0},${g | 0},${g | 0},0.55)`);
  }
  for (let i = 0; i < size / 3; i++) {           // pebbles
    const g = 140 + Math.random() * 70;
    wrapDot(Math.random() * size, Math.random() * size, 1.6 + Math.random() * 2.6,
      `rgba(${g | 0},${g | 0},${g | 0},0.42)`);
  }
  ctx.globalAlpha = 0.3; ctx.lineCap = 'round';
  for (let i = 0; i < size / 5; i++) {           // scuff drags
    const x = Math.random() * size, y = Math.random() * size, a = Math.random() * Math.PI;
    const l = 6 + Math.random() * 26;
    ctx.strokeStyle = Math.random() < 0.5 ? '#5c5c5c' : '#a8a8a8';
    ctx.lineWidth = 0.8 + Math.random() * 1.6;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  return c;
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
    const hue = 14 + Math.random() * 10, sat = 28 + Math.random() * 13, li = 37 + Math.random() * 8;
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
  const u = { uTime: { value: 0 }, uAmp: { value: amplitude }, baseAmp: amplitude };
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

// ---------- ground detail ----------
// The terrain carried one diffuse map tiled every 3.7 metres, which at eye
// height is a smear rather than ground. Two world-space grit layers and one
// slow macro layer are multiplied over it: the near layer gives the soil a
// texture you can stand on, the macro layer keeps a hundred-metre hillside
// from reading as a single flat wash.
export function addGroundDetail(material, detail, macro) {
  detail.wrapS = detail.wrapT = THREE.RepeatWrapping;
  macro.wrapS = macro.wrapT = THREE.RepeatWrapping;
  const prev = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    if (prev) prev(shader, renderer);
    shader.uniforms.uGDetail = { value: detail };
    shader.uniforms.uGMacro = { value: macro };
    shader.vertexShader = 'varying vec3 vGDPos;\n' + shader.vertexShader.replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\n\tvGDPos = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;'
    );
    shader.fragmentShader = 'uniform sampler2D uGDetail; uniform sampler2D uGMacro; varying vec3 vGDPos;\n'
      + shader.fragmentShader.replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        {
          float gA = texture2D( uGDetail, vGDPos.xz * 0.72 ).g;
          float gB = texture2D( uGDetail, vGDPos.xz * 0.171 ).g;
          float gM = texture2D( uGMacro, vGDPos.xz * 0.0225 ).g;
          diffuseColor.rgb *= mix( 1.0, gA, 0.44 ) * mix( 1.0, gB, 0.40 ) * ( 0.70 + 0.62 * gM );
          // dry litter drifts through the open ground, so the soil between
          // the tufts belongs to the same meadow they grow out of
          float thatch = smoothstep( 0.42, 0.86, gB ) * smoothstep( 0.30, 0.78, gM );
          diffuseColor.rgb = mix( diffuseColor.rgb, diffuseColor.rgb * vec3( 1.30, 1.16, 0.72 ), thatch * 0.55 );
        }`
      );
  };
}

// ---------- distance cull ----------
// Small life is drawn everywhere and read nowhere: past a given radius an
// instance is collapsed to a point in the vertex shader, which costs one
// compare and saves the whole fill. Fades over a band so nothing pops.
export function addDistanceCull(material, near, far) {
  const prev = material.onBeforeCompile;
  const u = { uCullNear: { value: near }, uCullFar: { value: far } };
  material.onBeforeCompile = (shader, renderer) => {
    if (prev) prev(shader, renderer);
    shader.uniforms.uCullNear = u.uCullNear;
    shader.uniforms.uCullFar = u.uCullFar;
    shader.vertexShader = 'uniform float uCullNear; uniform float uCullFar;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <project_vertex>',
      `{
        vec4 cullW = modelMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
        #ifdef USE_INSTANCING
          cullW = modelMatrix * instanceMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
        #endif
        float cullD = distance( cullW.xz, cameraPosition.xz );
        float cullK = 1.0 - smoothstep( uCullNear, uCullFar, cullD );
        transformed *= cullK;
      }
      #include <project_vertex>`
    );
  };
  return u;
}

// ---------- rim light and backscatter, debt two paid ----------

// Fresnel rim in the sun's own honey, masked to the hemisphere that faces
// the sun, so edges only bloom when backlit. Optional translucency lifts
// grass cards and olive canopies from inside when the sun stands behind
// them. Injected through onBeforeCompile so every material keeps its PBR.
// Weather can pull the whole effect down through uRimGlobal.
const RIM_GLOBAL = { value: 1.0 };
export function addRim(material, strength, opts = {}) {
  const u = {
    uRimStrength: { value: strength },
    uRimSun: { value: WORLD.sunDir },
    uRimColor: { value: new THREE.Color(opts.color !== undefined ? opts.color : 0xFFB65C) },
    uTrans: { value: opts.trans || 0 },
  };
  const prev = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    if (prev) prev(shader, renderer);
    shader.uniforms.uRimStrength = u.uRimStrength;
    shader.uniforms.uRimSun = u.uRimSun;
    shader.uniforms.uRimColor = u.uRimColor;
    shader.uniforms.uTrans = u.uTrans;
    shader.uniforms.uRimGlobal = RIM_GLOBAL;
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
      {
        vec3 rimV = normalize( vViewPosition );
        vec3 rimSunView = normalize( ( viewMatrix * vec4( uRimSun, 0.0 ) ).xyz );
        float rimBacklit = smoothstep( 0.05, 0.55, dot( normalize( -vViewPosition ), rimSunView ) );
        float rimFres = pow( 1.0 - clamp( dot( normalize( normal ), rimV ), 0.0, 1.0 ), 3.0 );
        float rimSunSide = 0.35 + 0.65 * clamp( dot( normalize( normal ), rimSunView ) * 0.5 + 0.5, 0.0, 1.0 );
        totalEmissiveRadiance += uRimColor * ( rimFres * rimBacklit * rimSunSide * uRimStrength * uRimGlobal );
        if ( uTrans > 0.0 ) {
          // Light through a leaf only reaches the eye where the leaf is thin.
          // Without the fresnel weight the whole canopy lit up as one solid
          // gold blob, which is how an olive tree became a paper lantern.
          float rimThru = pow( clamp( dot( normalize( -vViewPosition ), rimSunView ), 0.0, 1.0 ), 5.0 );
          float rimThin = 0.16 + 0.84 * rimFres;
          totalEmissiveRadiance += uRimColor * vec3( 1.0, 0.86, 0.55 ) * ( rimThru * rimThin * uTrans * uRimGlobal );
        }
      }`
    );
    shader.fragmentShader = 'uniform float uRimStrength; uniform vec3 uRimSun; uniform vec3 uRimColor; uniform float uTrans; uniform float uRimGlobal;\n' + shader.fragmentShader;
    if (typeof window !== 'undefined') {
      window.__rimCompiled = (window.__rimCompiled || 0) + 1;
      window.__rimHasInject = shader.fragmentShader.indexOf('rimBacklit') >= 0;
    }
  };
  WORLD.rimUniforms.push(u);
  return u;
}
// Layer 1 draws for the eye and the shadow, never for the sea mirror:
// the Water reflection camera stays on layer 0, so small life and overlay
// effects skip the mirror pass and the draw budget breathes.
export function noReflect(o) {
  if (o.traverse) o.traverse(a => { if (a.layers) a.layers.set(1); });
  else if (o.layers) o.layers.set(1);
}

export function setRimGlobal(v) { RIM_GLOBAL.value = v; }
export function getRimGlobal() { return RIM_GLOBAL.value; }

// ---------- marine haze on the sea ----------
// Held here rather than on the scene fog so the sea line is under this
// build's control and not at the mercy of a uniform refresh it never gets.
export const SEA_HAZE = { value: new THREE.Color(0.300, 0.208, 0.152) };
export const SEA_HAZE_K = { value: 0.0021 };

// ---------- sky gain ----------
// The Preetham dome clips to a white sheet under ACES around a low sun.
// A single gain uniform, shared with the PMREM environment clone, pulls the
// dome under the tone curve's shoulder so the horizon grades orange to
// violet and the aureole saturates to honey instead of blowing out.
export const SKY_GAIN = { value: 0.40 };
export function patchSky(sky) {
  const m = sky.material;
  m.uniforms.skyGain = SKY_GAIN;
  m.fragmentShader = ('uniform float skyGain;\n' + m.fragmentShader).replace(
    'gl_FragColor = vec4( retColor, 1.0 );',
    `float alt = normalize( vWorldPosition - cameraPosition ).y;
		// the aureole. Preetham stacks so much energy within a few degrees of a
		// low sun that the dome bleaches white and swallows the disc. Two curves
		// hold it honey: a wide warm tint, and a tight brightness clamp so the
		// drawn disc is always the brightest body in the frame.
		float sunWide = pow( smoothstep( 0.80, 0.9990, cosTheta ), 1.25 );
		float sunTight = pow( smoothstep( 0.958, 0.99985, cosTheta ), 1.30 );
		vec3 warmed = retColor * mix( vec3( 1.0 ), vec3( 1.26, 0.68, 0.30 ), sunWide * 0.92 );
		// only the tight core is pulled down: darkening the wide dome muddies
		// the whole sky to slate, which is a different failure from the one
		// being paid off here
		// hold the sky under white within ten degrees of the sun, so the drawn
		// body is the only thing in frame allowed to reach the top of the curve
		warmed *= mix( 1.0, 0.235, sunTight );
		// the violet shoulder: low sky away from the sun grades to grape, which
		// is what makes the warm half read warm at all
		float away = 1.0 - smoothstep( -0.55, 0.30, cosTheta );
		float low = 1.0 - smoothstep( 0.015, 0.40, alt );
		float band = smoothstep( -0.10, 0.03, alt ) * low;
		warmed = mix( warmed, warmed * vec3( 0.92, 0.775, 1.18 ), band * away * 0.50 );
		// the sea line. A razor cut between sky and water is the one thing no
		// golden-hour photograph has: a pale warm bar of marine haze softens it.
		// Below the horizon the Preetham dome clamps its zenith angle at ninety
		// degrees and paints one flat sheet at full horizon brightness. Nothing
		// looks at it directly, but the sea mirror samples it through the wave
		// distortion, and that is where the white sheet at the sea line was
		// really coming from. Fold it down and the water finds its colour.
		float below = smoothstep( 0.004, -0.045, alt );
		warmed = mix( warmed, warmed * vec3( 0.26, 0.27, 0.32 ), below );
		float hz = exp( - abs( alt ) * 20.0 );
		warmed += vec3( 0.052, 0.036, 0.028 ) * hz * ( 0.34 + 0.66 * smoothstep( -0.30, 0.92, cosTheta ) );
		gl_FragColor = vec4( warmed * skyGain, 1.0 );`
  );
  m.needsUpdate = true;
  return sky;
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
  /* (2026-09-08) THE DPR LAW IS REPEALED, and the measurement is why. It read
     "DPR 1 by law; ?dpr=2 only for the stills", written when the cost of the
     pixels was unknown. Measured on a walk at 1440x900: DPR 1 costs 8.3 ms a
     frame, DPR 2 costs 14.6. Quadrupling the pixels costs seventy-six percent
     more time, not four hundred, because this world is bound by its three
     million triangles and not by its fill. Rendering at half the resolution of
     a Retina screen was the single largest thing standing between this coast
     and looking modern, and it was free to give back.
     The device's own ratio is honoured up to 2, ?dpr= still overrides, and
     `stepDownPixelRatio` below drops it a notch on a machine that cannot hold
     the frame. */
  const dprAsk = parseFloat(new URLSearchParams(location.search).get('dpr'));
  const dprAuto = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dprAsk >= 0.5 && dprAsk <= 3 ? dprAsk : dprAuto);
  WORLD.dprLadder = [2, 1.5, 1.25, 1];
  WORLD.dprForced = !!(dprAsk >= 0.5 && dprAsk <= 3);
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
  scene.fog.color.multiplyScalar(1.42);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 11000);
  camera.rotation.order = 'YXZ';
  camera.layers.enable(1);
  WORLD.camera = camera;

  // Sky and sun. The sun stays eight to eleven degrees over the sea to the west.
  const sky = patchSky(new Sky());
  sky.scale.setScalar(9000);
  scene.add(sky);
  WORLD.sky = sky;
  // Debt one, the sky half: more dust, less blue power, a tighter forward
  // scatter, so the western sky grades orange to violet instead of washing white.
  const su = sky.material.uniforms;
  su.turbidity.value = 8.0;
  su.rayleigh.value = 2.1;
  su.mieCoefficient.value = 0.006;
  su.mieDirectionalG.value = 0.94;

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
  sun.shadow.camera.layers.enable(1);
  scene.add(sun); scene.add(sun.target);
  WORLD.sun = sun;

  // Debt two, the fill half: warm ground bounce raised so shadow-side
  // plaster reads as material, never as a void.
  const hemi = new THREE.HemisphereLight(0x9EB2D6, 0xC98A4E, 1.34);
  scene.add(hemi);
  WORLD.hemi = hemi;

  // The other half of debt two. A hemisphere alone leaves a backlit wall
  // grey, because the strongest fill at this hour is not the dome, it is the
  // ground and the sea throwing the sun back up under the eaves. One cheap
  // unshadowed directional, aimed up from beneath the sun's own bearing,
  // gives the shadow side its colour back without a second shadow pass.
  const bounce = new THREE.DirectionalLight(0xF0A860, 1.55);
  bounce.castShadow = false;
  scene.add(bounce);
  WORLD.bounce = bounce;

  setSun(WORLD.sunElevation);

  // Sea with a road of glitter to the harbor mouth.
  const waterNormalsCanvas = normalFromHeight(noiseCanvas(512, 40, 1.5), 2.4);
  const waterNormals = canvasTexture(waterNormalsCanvas, 1);
  const water = new Water(new THREE.PlaneGeometry(20000, 20000), {
    textureWidth: 512, textureHeight: 512,
    waterNormals,
    sunDirection: WORLD.sunDir.clone(),
    sunColor: 0xffa54d,
    waterColor: 0x0a2e3a,
    distortionScale: 2.6,
    fog: true,
  });
  water.rotation.x = -Math.PI / 2;
  water.position.set(-6000, 0.02, 0);
  water.material.uniforms.size.value = 6.0;
  water.material.uniforms.sunColor.value.setRGB(8.5, 2.9, 0.5);
  // Two faults in the vendored Water, both of which showed as a blown white
  // bar at the sea line. First, the mirror target is rendered with tone
  // mapping and output encoding already applied, so its texels are display
  // sRGB; the shader then treats them as linear and tone maps a second time,
  // which makes the sea brighter than the sky it is mirroring. Linearize the
  // sample and it sits under the sky where it belongs. Second, the fog is
  // mixed in after the colorspace conversion, so a linear fog colour is
  // written into sRGB output and clips; move it above the tone mapping.
  {
    const fs = water.material.fragmentShader;
    const before = 'vec3 reflectionSample = vec3( texture2D( mirrorSampler, mirrorCoord.xy / mirrorCoord.w + distortion ) );';
    const after = `vec3 reflectionSample = vec3( texture2D( mirrorSampler, mirrorCoord.xy / mirrorCoord.w + distortion ) );
					reflectionSample = pow( max( reflectionSample, vec3( 0.0 ) ), vec3( 2.2 ) );`;
    let out = fs.indexOf(before) >= 0 ? fs.replace(before, after) : fs;
    // The sea's own marine haze, in place of the scene fog. Three only
    // refreshes a material's fog uniforms when it decides the material is
    // dirty, and the vendored Water kept a stale, pale, near-white value
    // that washed the whole sea into one flat sheet at every distance. This
    // is the white sheet the build owed a fix for, and it is not the sky's
    // fault. One explicit uniform, one honest exponential, and the far
    // water now grades into the sky instead of standing in front of it.
    out = out.replace(
      'gl_FragColor = vec4( outgoingLight, alpha );',
      `float seaD = length( worldToEye );
					float seaK = 1.0 - exp( - seaD * uSeaHazeK );
					outgoingLight = mix( outgoingLight, uSeaHaze, clamp( seaK, 0.0, 1.0 ) );
					gl_FragColor = vec4( outgoingLight, alpha );`
    );
    water.material.fragmentShader = 'uniform vec3 uSeaHaze; uniform float uSeaHazeK;\n' + out;
    water.material.uniforms.uSeaHaze = SEA_HAZE;
    water.material.uniforms.uSeaHazeK = SEA_HAZE_K;
    water.material.fog = false;
    water.material.needsUpdate = true;
  }
  scene.add(water);
  WORLD.water = water;

  // Debt one, the disc half: the sun becomes a drawn object. A limb-darkened
  // billboard disc at 1.1 degrees, near-white core to a deep honey rim, over
  // an additive halo falling off across about six degrees. ACES at 0.7
  // saturates the disc instead of clipping it to a white sheet.
  {
    // The disc. Real limb darkening runs bright at the centre and falls to a
    // deeper, redder edge, and the edge itself is nearly hard: the whole body
    // is drawn inside 0.94 of the sprite so the limb never dissolves into a
    // ring, which is how the first pass read.
    const R = 128, EDGE = 118;
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(R, R, 2, R, R, EDGE);
    // Limb darkening, but compressed. A true solar limb ramp across a body
    // only fourteen pixels wide reads as a dark ring, not as a sun, so the
    // named core and limb colours are kept and the fall between them is
    // shortened until the edge reads as a clean honey rim.
    g.addColorStop(0.00, 'rgba(255,252,242,1)');  // near-white core
    g.addColorStop(0.46, 'rgba(255,243,214,1)');  // #FFF3D6, the named core
    g.addColorStop(0.78, 'rgba(255,226,176,1)');
    g.addColorStop(0.93, 'rgba(255,212,152,1)');
    g.addColorStop(0.985, 'rgba(255,196,128,1)'); // honey rim, held to the edge
    g.addColorStop(1.00, 'rgba(255,150,54,0)');   // one texel of antialias, no more
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(R, R, EDGE, 0, Math.PI * 2); ctx.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const dm = new THREE.SpriteMaterial({
      map: tex, depthWrite: false, depthTest: true, transparent: true, fog: false,
      toneMapped: true,
    });
    // Pushed well past white so ACES lands the body at the top of the curve.
    // The disc must out-shine its own aureole or it reads as a hole in a sheet.
    dm.color.setRGB(4.1, 2.68, 1.24);
    const disc = new THREE.Sprite(dm);
    disc.renderOrder = -4;
    // 1.1 degrees of true body, plus the sprite's own transparent margin
    const DISC_DEG = 1.1;
    disc.userData.w = 2800 * Math.tan(THREE.MathUtils.degToRad(DISC_DEG)) * (R / EDGE);
    disc.scale.set(disc.userData.w, disc.userData.w, 1);
    scene.add(disc);
    WORLD.sunDisc = disc;

    // The aureole that hugs the body. Photographs of a low sun show the disc
    // bleeding into a tight, saturated ring of glare before the wide halo
    // begins; without it the disc looks pasted on.
    const mkGlow = (stops) => {
      const gc = document.createElement('canvas'); gc.width = gc.height = 256;
      const gx = gc.getContext('2d');
      const gg = gx.createRadialGradient(128, 128, 1, 128, 128, 128);
      stops.forEach(([o, col]) => gg.addColorStop(o, col));
      gx.fillStyle = gg;
      gx.beginPath(); gx.arc(128, 128, 128, 0, Math.PI * 2); gx.fill();
      const t = new THREE.CanvasTexture(gc);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };
    const inner = new THREE.Sprite(new THREE.SpriteMaterial({
      map: mkGlow([
        [0.00, 'rgba(255,228,178,0.52)'],
        [0.12, 'rgba(255,208,140,0.40)'],
        [0.32, 'rgba(255,180,96,0.19)'],
        [0.62, 'rgba(255,158,68,0.06)'],
        [1.00, 'rgba(255,150,60,0)'],
      ]),
      blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true,
      transparent: true, fog: false, opacity: 0.62,
    }));
    inner.userData.w = 2800 * Math.tan(THREE.MathUtils.degToRad(2.9)) * 2;
    inner.scale.set(inner.userData.w, inner.userData.w, 1);
    inner.renderOrder = -2;
    scene.add(inner);
    WORLD.sunGlow = inner;

    // the wide halo: additive, falling off over about six degrees
    const hm = new THREE.SpriteMaterial({
      map: mkGlow([
        [0.00, 'rgba(255,190,112,0.42)'],
        [0.18, 'rgba(255,168,84,0.26)'],
        [0.44, 'rgba(255,144,56,0.108)'],
        [0.74, 'rgba(255,132,46,0.030)'],
        [1.00, 'rgba(255,124,40,0)'],
      ]),
      blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true,
      transparent: true, fog: false, opacity: 0.85,
    });
    const halo = new THREE.Sprite(hm);
    halo.userData.w = 2800 * Math.tan(THREE.MathUtils.degToRad(6.0)) * 2;
    halo.scale.set(halo.userData.w, halo.userData.w, 1);
    halo.renderOrder = -3;
    scene.add(halo);
    WORLD.sunHalo = halo;
  }
  placeSun(WORLD.sunDir);

  buildTerrain(scene);
  buildFoam(scene);
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

// The body, its aureole and its halo ride the sun vector together. Near the
// horizon the disc is flattened the way refraction flattens a real one, and
// the whole stack dims as it sets so it never out-runs the tone curve.
function placeSun(dir) {
  if (!WORLD.sunDisc) return;
  const alt = Math.max(-0.02, dir.y);
  const squash = 1 - 0.10 * Math.exp(-alt * 26);
  const d = WORLD.sunDisc, gl = WORLD.sunGlow, ha = WORLD.sunHalo;
  d.position.copy(dir).multiplyScalar(2800);
  d.scale.set(d.userData.w, d.userData.w * squash, 1);
  if (gl) {
    gl.position.copy(dir).multiplyScalar(2810);
    gl.scale.set(gl.userData.w, gl.userData.w * (0.5 + 0.5 * squash), 1);
  }
  if (ha) {
    ha.position.copy(dir).multiplyScalar(2820);
    ha.scale.set(ha.userData.w, ha.userData.w * (0.5 + 0.5 * squash), 1);
  }
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
  if (WORLD.bounce) {
    // up out of the water on the same bearing, so the fill reads as sea light
    WORLD.bounce.position.set(dir.x * 300, -190, dir.z * 300);
    WORLD.bounce.target.position.set(0, 0, 0);
    WORLD.bounce.target.updateMatrixWorld();
  }
  if (WORLD.water) WORLD.water.material.uniforms.sunDirection.value.copy(dir);
  placeSun(dir);
}

export function buildEnvironment(renderer, scene) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const skyScene = new THREE.Scene();
  const skyClone = patchSky(new Sky());
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

// The ground itself says which province you are in. One palette per province,
// blended by the same soft weights the flora reads, so the earth changes over
// the same tens of metres the growth does and a border is a walk, not a seam.
const PROV_GROUND = {
  // sand, then the warm cobble dust of a worked harbour
  harbor:   { lo: new THREE.Color(0xD6B084), hi: new THREE.Color(0xC1A87E) },
  // terra rossa: the red iron earth the olives stand in, drying to dust gold
  terraces: { lo: new THREE.Color(0xA85B2E), hi: new THREE.Color(0xBC8442) },
  // needle floor over granite grit, the darkest and greenest ground here
  highland: { lo: new THREE.Color(0x635B3C), hi: new THREE.Color(0x666B4C) },
  // bare bleached limestone and its own scree, the only cool ground on the
  // coast: the Wall reads white from the harbour mouth and that is the point
  wall:     { lo: new THREE.Color(0xE6E6DA), hi: new THREE.Color(0xD2D6D0) },
  // shell sand, salt-pale, nothing on it but thorn
  cloud:    { lo: new THREE.Color(0xF2ECD6), hi: new THREE.Color(0xE8E4D2) },
};

// The district floors, kept from the base build and re-read over the province
// blend rather than instead of it.
const DISTRICT_TINT = {
  plaza:   [new THREE.Color(0xC3AE88), 0.42], features: [new THREE.Color(0xBCA271), 0.36],
  ai:      [new THREE.Color(0xC3AE88), 0.36], apis:     [new THREE.Color(0xC5A96A), 0.40],
  config:  [new THREE.Color(0xA68F60), 0.38], dev:      [new THREE.Color(0x93894F), 0.34],
  ts:      [new THREE.Color(0x93894F), 0.34], plugins:  [new THREE.Color(0x8F8A52), 0.34],
  clicms:  [new THREE.Color(0xC5A96A), 0.32],
};
for (const id of ['upgrades', 'upmid', 'bankw', 'banke', 'uphigh', 'approach', 'crag'])
  DISTRICT_TINT[id] = [new THREE.Color(0xCFC8B2), 0.34];
for (const id of ['cl-gs', 'cl-proj', 'cl-dep', 'cl-acct', 'cl-cli', 'cl-adv'])
  DISTRICT_TINT[id] = [new THREE.Color(0xE9E2CC), 0.40];

function sstepW(a, b, v) {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function buildTerrain(scene) {
  const SIZE = 1100, SEG = 340;
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const cSand = new THREE.Color(0xd4ab77);
  const cRock = new THREE.Color(0x958876);
  const cGranite = new THREE.Color(0x8C8880);
  const cLime = new THREE.Color(0xD2D2C4);
  const cTerrace = new THREE.Color(0xac9166);
  const cWet = new THREE.Color(0x6E6A5C);
  const tmp = new THREE.Color(), tmp2 = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + 90, z = pos.getZ(i);
    const h = terrainHeight(x, z);
    pos.setX(i, x); pos.setY(i, h);
    const slope = terrainSlope(x, z);
    if (h < 1.0) {
      tmp.copy(cSand);
      // the harbor waterline is wet, dark, worked stone, not holiday sand
      if (z > 26 && x < 46 && x > -46) tmp.lerp(cWet, 0.55);
      if (h < 0.35) tmp.lerp(cWet, 0.30);
    } else {
      // the province blend: every palette weighted, so the border eases
      const w = provinceWeights(x, z);
      const dryness = Math.min(1, Math.max(0, (h - 3) / 40));
      const macro = tfbm(x * 0.021, z * 0.021, 3);
      tmp.setRGB(0, 0, 0);
      for (let pi = 0; pi < PROVINCE_KEYS.length; pi++) {
        const pg = PROV_GROUND[PROVINCE_KEYS[pi]];
        tmp2.copy(pg.lo).lerp(pg.hi, dryness * 0.72 + macro * 0.30);
        tmp.r += tmp2.r * w[pi]; tmp.g += tmp2.g * w[pi]; tmp.b += tmp2.b * w[pi];
      }
      // A swept district floor is paler and flatter than the country round it,
      // and each district still keeps the working tint the base build gave it
      // on top of its province: harbour wet stone, gatefront pale cobble,
      // colonnade oat gold, workshop worked ochre, upland olive, cliff-road
      // grey-green, islet lime. The province says which coast you are on; the
      // district still says which yard you are standing in.
      // The floor used to stop dead at 0.707 of the district radius, a hard
      // ring in a build whose whole argument is that edges are walks. It now
      // eases out over the last third of the district, the same way the
      // province blend and the growth do, so a yard fades into its country.
      let dtF = 0, dtId = null;
      for (const tr of TERRACES) {
        const dx = x - tr.x, dz = z - tr.z;
        const d2 = dx * dx + dz * dz;
        const rOut = tr.r * 0.92;
        if (d2 >= rOut * rOut) continue;
        const f = 1 - sstepW(tr.r * 0.50, rOut, Math.sqrt(d2));
        if (f > dtF) { dtF = f; dtId = tr.id; }
      }
      if (dtF > 0.002) {
        tmp.lerp(cTerrace, 0.30 * dtF);
        const dt = DISTRICT_TINT[dtId];
        if (dt) tmp.lerp(dt[0], dt[1] * dtF);
      }
      if (slope > 0.55) {
        // the rock that breaks through is the province's own: granite under
        // the pines, pale limestone on the Wall and round the islets, warm
        // grey everywhere else. An islet flank has to stay light or the
        // whole archipelago reads as a row of dark lumps at this hour.
        const w2 = provinceWeights(x, z);
        tmp2.copy(cRock).lerp(cGranite, w2[2]).lerp(cLime, Math.min(1, w2[3] + w2[4]));
        tmp.lerp(tmp2, Math.min(1, (slope - 0.55) * 1.8));
      }
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
  addGroundDetail(mat, canvasTexture(gritCanvas(256), 1), canvasTexture(noiseCanvas(128, 4, 1.25), 1));
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  mesh.userData.__terrain = true;
  scene.add(mesh);
  buildShallows(scene);
}

// The shelf under the archipelago, read off the top of the water: a turquoise
// veil painted over the sea where the sand comes up, so the Cloud reads
// Cycladic from the Wall and the causeway looks like it has something to
// stand on. One merged mesh, one draw, out of the sea mirror.
function buildShallows(scene) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 6, 128, 128, 128);
  g.addColorStop(0, 'rgba(96,206,190,0.46)');
  g.addColorStop(0.34, 'rgba(78,190,182,0.29)');
  g.addColorStop(0.70, 'rgba(60,166,170,0.11)');
  g.addColorStop(1, 'rgba(50,150,162,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const parts = [];
  const veil = (x, z, rx, rz) => {
    const p2 = new THREE.PlaneGeometry(1, 1).toNonIndexed();
    p2.rotateX(-Math.PI / 2);
    p2.scale(rx, 1, rz);
    p2.translate(x, 0.10, z);
    parts.push(p2);
  };
  for (const tr of TERRACES) if (tr.id.startsWith('cl-')) veil(tr.x, tr.z, tr.r * 3.5, tr.r * 3.2);
  veil(-96, 82, 150, 130); // the whole shelf, faint
  let total = 0;
  for (const g2 of parts) total += g2.attributes.position.count;
  const pos = new Float32Array(total * 3), uv = new Float32Array(total * 2);
  let off = 0;
  for (const g2 of parts) {
    pos.set(g2.attributes.position.array, off * 3);
    uv.set(g2.attributes.uv.array, off * 2);
    off += g2.attributes.position.count;
    g2.dispose();
  }
  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  merged.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  const m = new THREE.Mesh(merged, new THREE.MeshBasicMaterial({
    map: tex, transparent: true, depthWrite: false, fog: true,
  }));
  m.renderOrder = 3;
  noReflect(m);
  scene.add(m);
}

// The water edge stopped dithering the day it got a foam band: a soft
// alpha ribbon that follows the true waterline contour and hides the
// grazing-angle seam between sea plane and sand.
function buildFoam(scene) {
  const pos = [], uv = [];
  const zs = [];
  for (let z = -260; z <= 260; z += 3) zs.push(z);
  const waterlineX = (z) => {
    let lo = COAST_X - 36, hi = COAST_X + 40;
    for (let i = 0; i < 18; i++) {
      const mid = (lo + hi) / 2;
      if (terrainHeight(mid, z) > 0.02) hi = mid; else lo = mid;
    }
    return (lo + hi) / 2;
  };
  const OUT = 5.5, IN = 2.4, y = 0.09;
  let prev = null;
  for (const z of zs) {
    const wx = waterlineX(z);
    const cur = { a: [wx - OUT, y, z], b: [wx + IN, y + 0.02, z], v: z * 0.08 };
    if (prev) {
      pos.push(...prev.a, ...prev.b, ...cur.b, ...prev.a, ...cur.b, ...cur.a);
      uv.push(0, prev.v, 1, prev.v, 1, cur.v, 0, prev.v, 1, cur.v, 0, cur.v);
    }
    prev = cur;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  const nor = new Float32Array(pos.length);
  for (let i = 0; i < nor.length; i += 3) nor[i + 1] = 1;
  geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  // foam texture: bright lace at the sand edge fading seaward
  const c = document.createElement('canvas'); c.width = 128; c.height = 64;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 128, 64);
  for (let x = 0; x < 128; x++) {
    const t = x / 127;
    for (let yy = 0; yy < 64; yy++) {
      const n = Math.abs(Math.sin(x * 0.43 + yy * 0.9) * Math.sin(x * 0.11 - yy * 0.31));
      const edge = Math.pow(t, 2.2);
      const a = Math.max(0, edge * (0.35 + 0.65 * n) - 0.04);
      ctx.fillStyle = `rgba(255,232,206,${(a * 0.62).toFixed(3)})`;
      ctx.fillRect(x, yy, 1, 1);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  const mat = new THREE.MeshBasicMaterial({
    map: tex, transparent: true, depthWrite: false, fog: true, opacity: 0.72,
    color: 0xFFE7C8,
    polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 3;
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
    mesh.userData.__terrain = true;
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
    m.layers.set(1);
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
  for (const u of WORLD.windUniforms) {
    u.uTime.value = WORLD.reducedMotion ? 0 : t;
    u.uAmp.value = u.baseAmp * WORLD.gustAmp;
  }
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
      const ex = WORLD.gullExcite || 0; // the boat is in: the flock works the berth
      const s = seeds[i], a = t * 0.055 * (0.7 + (i % 3) * 0.18) * (1 + ex * 1.4) + s * 2.4;
      const r = (60 + (i % 4) * 22) * (1 - ex * 0.45);
      _gp.set(-30 - ex * 42 + Math.cos(a) * r, 26 - ex * 9 + Math.sin(t * 0.5 + s) * 4 + i * 2.5, ex * 4 + Math.sin(a) * r * 0.8);
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
    // A horizontal additive plane seen edge on projects to a thin bar of
    // pure glare across the sky, which is exactly the white sheet this build
    // owes a fix for. The fade has to be sharp, not linear.
    const t2 = (dy / d - 0.05) / 0.25;
    const tilt = t2 <= 0 ? 0 : t2 >= 1 ? 1 : t2 * t2 * (3 - 2 * t2);
    // and they are pools, not a coast-wide wash: from the high bank the whole
    // set stacked into one white bank over the town
    const t3 = (d - 70) / 110;
    const near = 1 - (t3 <= 0 ? 0 : t3 >= 1 ? 1 : t3 * t3 * (3 - 2 * t3));
    hp.material.opacity = hp.userData.base * tilt * near;
  }
  // God rays fade by view angle against the sun.
  if (WORLD.godRays.length) {
    const view = new THREE.Vector3();
    cam.getWorldDirection(view);
    const facing = Math.max(0, view.dot(WORLD.sunDir));
    const rg = WORLD.godRayGain === undefined ? 1 : WORLD.godRayGain;
    for (const g of WORLD.godRays) g.material.opacity = g.userData.base * (0.25 + 0.75 * facing) * rg;
  }
}

// The keeper's hour: the sun two degrees lower, one stop warmer.
export function enterKeeperHour() {
  if (WORLD.keeperHour) return;
  WORLD.keeperHour = true;
  WORLD.targetElevation = 3.2; // the floor of the golden band, never below
  WORLD.targetExposure = 0.76;
}
/* One notch down the ladder, and never back up: a machine that cannot hold the
   frame at this resolution will not hold it a minute later either, and a ratio
   that oscillates is worse to look at than one that is simply lower. Called
   from the frame loop with the rolling p95; does nothing if ?dpr= was asked. */
export function stepDownPixelRatio(p95) {
  if (!WORLD.renderer || WORLD.dprForced || !WORLD.dprLadder) return false;
  if (!(p95 > 20)) return false;
  const now = WORLD.renderer.getPixelRatio();
  const next = WORLD.dprLadder.find((v) => v < now - 0.01);
  if (next === undefined) return false;
  WORLD.renderer.setPixelRatio(next);
  WORLD.renderer.setSize(window.innerWidth, window.innerHeight);
  return next;
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
