/* r10 patch 1: THE TWO CONTINENTS - world layout.
   Provinces (a community's pages of one product) packed into a great CMS
   continent and a smaller Cloud continent; only the 11 uncommunitied pages
   stay offshore. Deterministic, all data-derived. */
'use strict';
const fs = require('fs');
const F = 'deadreckoning.js';
let src = fs.readFileSync(F, 'utf8');
let fails = 0;
function splice(startAnchor, endAnchor, replacement, keepEnd) {
  const i = src.indexOf(startAnchor);
  if (i < 0) { console.error('START NOT FOUND: ' + startAnchor.slice(0, 60)); fails++; return; }
  const j = src.indexOf(endAnchor, i);
  if (j < 0) { console.error('END NOT FOUND: ' + endAnchor.slice(0, 60)); fails++; return; }
  src = src.slice(0, i) + replacement + (keepEnd ? endAnchor : '') + src.slice(j + endAnchor.length);
}
function rep(a, b) {
  if (src.indexOf(a) < 0) { console.error('NOT FOUND: ' + a.slice(0, 60)); fails++; return; }
  src = src.replace(a, b);
}

/* ---------- 1. loadData: the community force layout becomes the two-continent packing ---------- */
splice(
"  /* deterministic force layout of the 27 communities */",
"  world.positions = pos;",
`  /* ============================================================
     THE TWO CONTINENTS (owner order)
     The corpus holds two products, and the sea now says so plainly: every
     CMS page is ground on one great continent, every Cloud page on a
     smaller one across open water, and a community that bridges both
     keeps a province on each shore. A community's pages of one product
     make a PROVINCE; provinces are packed rim to rim, each set beside the
     province its pages cite hardest, so the interior borders fall where
     the citation graph says they fall. Only the 11 uncommunitied pages
     stay offshore: the data isolates them, so the sea does.
     ============================================================ */
  const n = communities.length;
  const provinces = [];
  communities.forEach((cm, ci) => {
    const by = { cms: [], cloud: [] };
    for (const m of cm.members) {
      const pg = content.pages[m];
      if (!pg) continue;
      (by[pg.product] || (by[pg.product] = [])).push(m);
    }
    for (const prod of ['cms', 'cloud']) {
      const mem = by[prod];
      if (!mem || !mem.length) continue;
      const hasHub = mem.indexOf(cm.hub) >= 0;
      const hub = hasHub ? cm.hub
        : mem.slice().sort((a, b) => (graph.inbound[b] || 0) - (graph.inbound[a] || 0))[0];
      provinces.push({ comm: ci, product: prod, members: mem, hub, primary: hasHub, size: mem.length });
    }
  });
  /* the ground a province needs: the same disc its member layout will fill */
  const SPACING_NM0 = 1.05;
  const archScale0 = m => m <= 1 ? 0 : 0.58 * SPACING_NM0 * Math.sqrt(m) + 0.30;
  for (const P of provinces) P.r = (archScale0(P.size) + 0.62) / world.nmPerUnit;
  const affinity = (A, B) => {
    if (A.comm === B.comm) return 40;
    const L = laneMap.get(Math.min(A.comm, B.comm) + '-' + Math.max(A.comm, B.comm));
    return L ? L.total : 0;
  };
  function packContinent(list, tag) {
    const rnd = rngFor('pack:' + tag);
    const L = list.slice().sort((a, b) => b.size - a.size || a.comm - b.comm);
    const placed = [];
    for (const P of L) {
      if (!placed.length) { P.x = 0; P.y = 0; placed.push(P); continue; }
      /* she goes ashore beside the province her pages cite hardest */
      let anchor = placed[0], aw = -1;
      for (const Q of placed) { const w = affinity(P, Q); if (w > aw) { aw = w; anchor = Q; } }
      let best = null, bc = 1e18;
      for (let s = 0; s < 64; s++) {
        const th = s / 64 * TAU + rnd() * 0.001;
        for (const f of [1.0, 1.12, 1.28, 1.5]) {
          const d = (P.r + anchor.r) * f;
          const x = anchor.x + Math.cos(th) * d, y = anchor.y + Math.sin(th) * d;
          let ok = true;
          for (const Q of placed) { if (Math.hypot(Q.x - x, Q.y - y) < (Q.r + P.r) * 0.94) { ok = false; break; } }
          if (!ok) continue;
          const cost = Math.hypot(x, y) + Math.hypot(x - anchor.x, y - anchor.y) * 0.4;
          if (cost < bc) { bc = cost; best = [x, y]; }
          break;
        }
      }
      if (!best) { P.x = (rnd() - 0.5); P.y = (rnd() - 0.5); } else { P.x = best[0]; P.y = best[1]; }
      placed.push(P);
    }
    /* settle: pulled to the middle, rims kept honest */
    for (let it = 0; it < 160; it++) {
      for (const P of L) { const m = Math.hypot(P.x, P.y) || 1; const pull = Math.min(0.004, m * 0.02); P.x -= P.x / m * pull; P.y -= P.y / m * pull; }
      for (let a = 0; a < L.length; a++) for (let b = a + 1; b < L.length; b++) {
        const A = L[a], B = L[b];
        let dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy);
        const need = (A.r + B.r) * 0.94;
        if (d < need) {
          if (d < 1e-9) { dx = 1e-6; dy = 0; d = 1e-6; }
          const push = (need - d) / d * 0.5;
          A.x -= dx * push; A.y -= dy * push; B.x += dx * push; B.y += dy * push;
        }
      }
    }
    let r = 0;
    for (const P of L) r = Math.max(r, Math.hypot(P.x, P.y) + P.r);
    return r;
  }
  const cmsP = provinces.filter(p => p.product === 'cms');
  const cloudP = provinces.filter(p => p.product === 'cloud');
  const Rcms = packContinent(cmsP, 'cms');
  const Rcloud = packContinent(cloudP, 'cloud');
  /* the CMS Main west of the middle sea, the Cloud Main east-north-east of
     her, a passage of open water between the two shores */
  const GAP = 9.5 / world.nmPerUnit;
  const cloudDx = Rcms + GAP + Rcloud, cloudDy = -Rcms * 0.34;
  for (const P of cloudP) { P.x += cloudDx; P.y += cloudDy; }
  /* centre the whole survey on its own weight, so the sheet sits square */
  let wsum = 0, wx = 0, wy = 0;
  for (const P of provinces) { wsum += P.size; wx += P.x * P.size; wy += P.y * P.size; }
  wx /= wsum; wy /= wsum;
  for (const P of provinces) { P.x -= wx; P.y -= wy; }
  world.provinces = provinces;
  world.continents = {
    cms: { x: -wx, y: -wy, r: Rcms, n: cmsP.reduce((s, p) => s + p.size, 0), provinces: cmsP.length },
    cloud: { x: cloudDx - wx, y: cloudDy - wy, r: Rcloud, n: cloudP.reduce((s, p) => s + p.size, 0), provinces: cloudP.length }
  };
  /* the 27 community positions the wind is derived from: each community
     stands at her primary province (the shore that holds her hub) */
  const pos = [];
  for (let k = 0; k < n; k++) pos.push({ x: 0, y: 0 });
  for (const P of provinces) if (P.primary) { pos[P.comm].x = P.x; pos[P.comm].y = P.y; }
  world.positions = pos;`,
false);

/* ---------- 2. buildIslands: per-province local layouts ---------- */
splice(
"  /* --- archipelagos: a local layout per community, hub pinned at the centre --- */",
"  /* --- the pages no community holds --- */",
`  /* --- provinces: a local layout per province, its hub pinned at the centre --- */
  /* A group of n islands at a mile between neighbours needs a disc of radius
     0.525 * s * sqrt(n) if it is packed the way circles pack. That is the
     radius below, with a little slack, so a province is a filled ground
     rather than a ring with an empty middle. */
  const SPACING_NM = 1.05;
  const archScaleNm = n => n <= 1 ? 0 : 0.58 * SPACING_NM * Math.sqrt(n) + 0.30;
  const provOf = new Map();
  for (let pi = 0; pi < world.provinces.length; pi++) {
    const P = world.provinces[pi];
    const members = P.members.slice().sort();
    const hub = P.hub;
    const n = members.length;
    const R = archScaleNm(n) / world.nmPerUnit;
    const minS = 0.95 / world.nmPerUnit;    // a mile, near enough, between neighbours
    const rnd = rngFor('prov:' + P.comm + ':' + P.product);
    /* a sunflower spiral fills a disc evenly; the hub holds the centre */
    const rest = members.filter(m => m !== hub);
    const local = [{ x: 0, y: 0, pin: true, slug: hub }];
    rest.forEach((m, k) => {
      const t = (k + 0.62) / rest.length;
      const r = R * Math.sqrt(t);
      const a = k * 2.399963 + rnd() * 0.30;
      local.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, pin: false, slug: m });
    });
    const idx = new Map(local.map((L, i2) => [L.slug, i2]));
    const springRest = R * 0.42;
    for (let it = 0; it < 200; it++) {
      const fx = new Array(local.length).fill(0), fy = new Array(local.length).fill(0);
      /* citations pull: pages that cite each other end up within reach */
      for (const m of members) {
        const i2 = idx.get(m), nb = nbrs.get(m);
        if (!nb) continue;
        for (const [o, w] of nb) {
          const j2 = idx.get(o);
          if (j2 == null || j2 === i2) continue;
          const dx = local[j2].x - local[i2].x, dy = local[j2].y - local[i2].y;
          const d = Math.hypot(dx, dy) + 1e-9;
          const k2 = 0.045 * Math.log(1 + w) * (d - springRest);
          fx[i2] += dx / d * k2; fy[i2] += dy / d * k2;
        }
      }
      const cool = 1 - it / 260;
      for (let k = 0; k < local.length; k++) {
        if (local[k].pin) continue;
        local[k].x += clamp(fx[k], -minS * 0.35, minS * 0.35) * cool;
        local[k].y += clamp(fy[k], -minS * 0.35, minS * 0.35) * cool;
      }
      /* then the hard rule: nobody sits on anybody */
      for (let a = 0; a < local.length; a++) for (let b = a + 1; b < local.length; b++) {
        let dx = local[b].x - local[a].x, dy = local[b].y - local[a].y;
        let d = Math.hypot(dx, dy);
        if (d >= minS) continue;
        if (d < 1e-9) { dx = minS * 0.5; dy = 0; d = minS * 0.5; }
        const push = (minS - d) / d * 0.5;
        const wa = local[a].pin ? 0 : (local[b].pin ? 1 : 0.5);
        const wb = local[b].pin ? 0 : (local[a].pin ? 1 : 0.5);
        local[a].x -= dx * push * 2 * wa; local[a].y -= dy * push * 2 * wa;
        local[b].x += dx * push * 2 * wb; local[b].y += dy * push * 2 * wb;
      }
      /* and the group keeps its water */
      for (const L of local) {
        if (L.pin) continue;
        const r = Math.hypot(L.x, L.y);
        if (r > R * 1.06) { L.x *= R * 1.06 / r; L.y *= R * 1.06 / r; }
      }
    }
    let rmax = 0;
    for (const L of local) {
      const isle = world.bySlug.get(L.slug);
      isle.pos.x = P.x + L.x;
      isle.pos.y = P.y + L.y;
      isle.prov = pi;
      provOf.set(L.slug, pi);
      rmax = Math.max(rmax, Math.hypot(L.x, L.y));
    }
    P.rmax = rmax;
  }
  /* the 27 communities keep their entry in the register, each standing at
     her primary province - the shore the wind was derived from */
  for (let ci = 0; ci < communities.length; ci++) {
    const C = communities[ci];
    const PP = world.provinces.find(p => p.comm === ci && p.primary);
    world.archipelagos.push({
      i: ci, hub: C.hub, size: C.members.length, purity: C.purity, dominant: C.dominant,
      name: (content.pages[C.hub] || {}).title || C.hub,
      x: PP ? PP.x : 0, y: PP ? PP.y : 0, r: PP ? (PP.rmax || 0) : 0, members: C.members
    });
  }
`,
true);

/* ---------- 3. orphans: they keep company with the PROVINCE their citations point into ---------- */
rep(
`    const nb = nbrs.get(isle.slug);
    const tally = new Map();
    if (nb) for (const [o, w] of nb) {
      const c = of[o];
      if (c != null) tally.set(c, (tally.get(c) || 0) + w);
    }
    if (tally.size) {
      /* it keeps company with the archipelago its citations point into: laid
         just outside that group's rim, on the bearing of its strongest tie */
      let best = -1, bw = -1;
      for (const [c, w] of tally) if (w > bw) { bw = w; best = c; }
      const A = world.archipelagos[best];
      const rnd = rngFor('orphan:' + isle.slug);
      const a = rnd() * TAU;
      const r = A.r + (0.9 + rnd() * 0.5) / world.nmPerUnit;
      isle.pos.x = A.x + Math.cos(a) * r;
      isle.pos.y = A.y + Math.sin(a) * r;
      isle.nearComm = best;`,
`    const nb = nbrs.get(isle.slug);
    const tally = new Map();
    if (nb) for (const [o, w] of nb) {
      const c = provOf.get(o);
      if (c != null) tally.set(c, (tally.get(c) || 0) + w);
    }
    if (tally.size) {
      /* it keeps company with the province its citations point into: laid
         just off that shore, an island the mainland never took in */
      let best = -1, bw = -1;
      for (const [c, w] of tally) if (w > bw) { bw = w; best = c; }
      const A = world.provinces[best];
      const rnd = rngFor('orphan:' + isle.slug);
      /* off the SEAWARD side of that province: outward from her continent */
      const K = world.continents[A.product];
      let ox = A.x - K.x, oy = A.y - K.y;
      const om = Math.hypot(ox, oy);
      if (om < 1e-6) { ox = 0; oy = -1; } else { ox /= om; oy /= om; }
      const a = Math.atan2(oy, ox) + (rnd() - 0.5) * 1.4;
      const r = (A.rmax || A.r) + (1.6 + rnd() * 1.1) / world.nmPerUnit;
      isle.pos.x = A.x + Math.cos(a) * r;
      isle.pos.y = A.y + Math.sin(a) * r;
      isle.nearComm = A.comm;
      isle.nearProv = best;`,
false);

/* ---------- 4. the separation pass pins every province hub ---------- */
rep("const pinned = new Set(world.archipelagos.map(a => a.hub));",
    "const pinned = new Set(world.provinces.map(p => p.hub));");

/* ---------- 5. isle objects carry their province ---------- */
rep("      comm: of[slug] == null ? -1 : of[slug],",
    "      comm: of[slug] == null ? -1 : of[slug],\n      prov: -1, nearProv: null,");

fs.writeFileSync(F, src);
console.log(fails ? 'FAILED ' + fails : 'patched clean');
