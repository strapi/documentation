  /* --------------------------------------------------------------- audio */
  /* ON by default. The AudioContext is created and resumed by a one-time
     capture listener on the first pointerdown/keydown; until then every
     sound function returns silently. One small analog-style rack — detuned
     oscillators, filtered seeded noise, a feedback tape echo with wow —
     and every sound in it maps to a countable, measured event:
       room bed        the observatory itself (runs while sound is on)
       lock            a page becomes the locked beacon
       ping            one commit (night commits one octave lower)
       transit         a dark body starts dipping the beacon's light
       thud            the transit lands: a body is detected
       contact         first contact with an uncited page
       triang          a survey triangulated new bodies onto the chart
       chart           FULL CHART revealed
       warp            a search selection warps the probe
       almanac         the old atlas is opened
       hall pad        the Hall of Hands is open
       plate           the survey completes at 290/290
     Toggling SOUND off silences everything for the visit. */

  var AC = null, audioOn = true, audioUnlocked = false, rack = null;
  var bedNodes = null, hallNodes = null;

  function ensureAC() {
    if (AC) return true;
    try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; }
    return !!AC;
  }

  /* seeded noise: the same hiss every visit, never random garnish */
  function noiseBuf(c, secs) {
    var n = Math.max(1, Math.floor(c.sampleRate * secs));
    var b = c.createBuffer(1, n, c.sampleRate);
    var d = b.getChannelData(0);
    var rnd = mulberry32(29761);
    for (var i = 0; i < n; i++) d[i] = rnd() * 2 - 1;
    return b;
  }

  /* the rack: master -> gentle compressor -> out, plus a feedback tape
     echo (lowpassed loop, slow wow on the delay line) fed by R.send */
  function makeRack(c) {
    var master = c.createGain(); master.gain.value = 1;
    var comp = c.createDynamicsCompressor();
    try {
      comp.threshold.value = -22; comp.knee.value = 18; comp.ratio.value = 5;
      comp.attack.value = 0.01; comp.release.value = 0.32;
    } catch (e) {}
    master.connect(comp); comp.connect(c.destination);
    var echo = c.createDelay(1.5); echo.delayTime.value = 0.33;
    var fb = c.createGain(); fb.gain.value = 0.42;
    var damp = c.createBiquadFilter(); damp.type = 'lowpass'; damp.frequency.value = 1500; damp.Q.value = 0.4;
    echo.connect(damp); damp.connect(fb); fb.connect(echo);
    var wet = c.createGain(); wet.gain.value = 0.55; damp.connect(wet); wet.connect(master);
    var send = c.createGain(); send.gain.value = 1; send.connect(echo);
    try {
      var wow = c.createOscillator(); wow.frequency.value = 0.4;
      var wowG = c.createGain(); wowG.gain.value = 0.0035;
      wow.connect(wowG); wowG.connect(echo.delayTime); wow.start();
    } catch (e) {}
    return { ctx: c, dry: master, send: send };
  }

  /* the observatory bed: breathing lowpassed noise + a deep detuned pair
     + mission-loop hiss. A room tone, never music. */
  function buildBed(R, t) {
    var c = R.ctx;
    var out = c.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(1, t + 1.6);
    out.connect(R.dry);
    var buf = noiseBuf(c, 3);
    var src = c.createBufferSource(); src.buffer = buf; src.loop = true;
    var lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 230; lp.Q.value = 0.8;
    var ng = c.createGain(); ng.gain.value = 0.02;
    src.connect(lp); lp.connect(ng); ng.connect(out);
    var lfo = c.createOscillator(); lfo.frequency.value = 0.05;      /* one breath per 20 s */
    var lg = c.createGain(); lg.gain.value = 95;
    lfo.connect(lg); lg.connect(lp.frequency);
    var o1 = c.createOscillator(); o1.type = 'sine'; o1.frequency.value = 55;
    var o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.value = 55.35;
    var og = c.createGain(); og.gain.value = 0.011;
    o1.connect(og); o2.connect(og); og.connect(out);
    var hs = c.createBufferSource(); hs.buffer = buf; hs.loop = true;
    var hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4300;
    var hg = c.createGain(); hg.gain.value = 0.0028;
    var hlfo = c.createOscillator(); hlfo.frequency.value = 0.08;
    var hlg = c.createGain(); hlg.gain.value = 0.0013;
    hlfo.connect(hlg); hlg.connect(hg.gain);
    hs.connect(hp); hp.connect(hg); hg.connect(out);
    src.start(t); hs.start(t); lfo.start(t); hlfo.start(t); o1.start(t); o2.start(t);
    return { out: out, stops: [src, hs, lfo, hlfo, o1, o2] };
  }

  /* the Hall of Hands: a hushed sustained pad while the wall is open */
  function buildHallPad(R, t) {
    var c = R.ctx;
    var out = c.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.028, t + 1.4);
    var lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; lp.Q.value = 0.6;
    lp.connect(out); out.connect(R.dry);
    var sg = c.createGain(); sg.gain.value = 0.4; out.connect(sg); sg.connect(R.send);
    var stops = [];
    [110, 110.6, 164.8, 220.9].forEach(function (f) {
      var o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
      var g = c.createGain(); g.gain.value = f > 200 ? 0.35 : 1;
      o.connect(g); g.connect(lp); o.start(t); stops.push(o);
    });
    var lfo = c.createOscillator(); lfo.frequency.value = 0.11;
    var lg = c.createGain(); lg.gain.value = 140;
    lfo.connect(lg); lg.connect(lp.frequency); lfo.start(t); stops.push(lfo);
    return { out: out, stops: stops };
  }

  function releaseNodes(nodes, secs) {
    if (!nodes || !AC) return;
    try {
      var t = AC.currentTime;
      nodes.out.gain.cancelScheduledValues(t);
      nodes.out.gain.setValueAtTime(Math.max(nodes.out.gain.value, 0.0001), t);
      nodes.out.gain.exponentialRampToValueAtTime(0.0001, t + secs);
      nodes.stops.forEach(function (n) { try { n.stop(t + secs + 0.1); } catch (e) {} });
    } catch (e) {}
  }

  function startBed() {
    if (!rack || bedNodes || !audioOn) return;
    try { bedNodes = buildBed(rack, AC.currentTime + 0.02); } catch (e) { bedNodes = null; }
  }
  function stopBed() {
    if (bedNodes) { releaseNodes(bedNodes, 0.5); bedNodes = null; }
  }

  /* --- the event voices ------------------------------------------------ */
  var SND = {
    /* one commit = one ping; night commits ring one octave lower */
    ping: function (R, t, night) {
      var c = R.ctx;
      var o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = night ? 330 : 660;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.045, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(g); g.connect(R.dry);
      var s = c.createGain(); s.gain.value = 0.22; g.connect(s); s.connect(R.send);
      o.start(t); o.stop(t + 0.2);
    },
    /* the receiver finds the carrier: detuned saw pair through a rising bandpass */
    lock: function (R, t) {
      var c = R.ctx;
      var f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 9;
      f.frequency.setValueAtTime(340, t);
      f.frequency.exponentialRampToValueAtTime(940, t + 0.5);
      var g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.05, t + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
      var o1 = c.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 220;
      var o2 = c.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = 221.7;
      o1.connect(f); o2.connect(f); f.connect(g); g.connect(R.dry);
      var s = c.createGain(); s.gain.value = 0.25; g.connect(s); s.connect(R.send);
      o1.start(t); o2.start(t); o1.stop(t + 0.6); o2.stop(t + 0.6);
    },
    /* photometric dip: a noise sweep falling with the occlusion */
    transit: function (R, t) {
      var c = R.ctx;
      var src = c.createBufferSource(); src.buffer = noiseBuf(c, 1.6);
      var bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 7;
      bp.frequency.setValueAtTime(2600, t);
      bp.frequency.exponentialRampToValueAtTime(160, t + 1.5);
      var g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.05, t + 0.12);
      g.gain.setValueAtTime(0.05, t + 1.1);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.55);
      src.connect(bp); bp.connect(g); g.connect(R.dry);
      var s = c.createGain(); s.gain.value = 0.3; g.connect(s); s.connect(R.send);
      src.start(t); src.stop(t + 1.6);
    },
    /* the transit lands: a body is on the chart */
    thud: function (R, t) {
      var c = R.ctx;
      var o = c.createOscillator(), g = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(96, t);
      o.frequency.exponentialRampToValueAtTime(44, t + 0.3);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.085, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      o.connect(g); g.connect(R.dry);
      o.start(t); o.stop(t + 0.55);
    },
    /* first contact: low reverent thump, then a sparse chime on the tape */
    contact: function (R, t) {
      var c = R.ctx;
      var o = c.createOscillator(), g = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(82, t);
      o.frequency.exponentialRampToValueAtTime(41, t + 0.5);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.09, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      o.connect(g); g.connect(R.dry);
      o.start(t); o.stop(t + 1);
      [1174.66, 987.77, 1567.98].forEach(function (f, k) {
        var co = c.createOscillator(), cg = c.createGain();
        co.type = 'sine'; co.frequency.value = f;
        var tt = t + 0.55 + k * 0.42;
        cg.gain.setValueAtTime(0.0001, tt);
        cg.gain.exponentialRampToValueAtTime(0.02, tt + 0.015);
        cg.gain.exponentialRampToValueAtTime(0.0001, tt + 0.5);
        co.connect(cg); cg.connect(R.dry);
        var s = c.createGain(); s.gain.value = 0.8; cg.connect(s); s.connect(R.send);
        co.start(tt); co.stop(tt + 0.55);
      });
    },
    /* triangulation complete: two short filtered confirmation blips */
    triang: function (R, t) {
      var c = R.ctx;
      [523.25, 659.25].forEach(function (f, k) {
        var o = c.createOscillator(), g = c.createGain();
        var lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1300;
        o.type = 'square'; o.frequency.value = f;
        var tt = t + k * 0.15;
        g.gain.setValueAtTime(0.0001, tt);
        g.gain.exponentialRampToValueAtTime(0.026, tt + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.11);
        o.connect(lp); lp.connect(g); g.connect(R.dry);
        var s = c.createGain(); s.gain.value = 0.3; g.connect(s); s.connect(R.send);
        o.start(tt); o.stop(tt + 0.16);
      });
    },
    /* the full chart opens: one rising filtered swell */
    chart: function (R, t) {
      var c = R.ctx;
      var o = c.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(110, t);
      o.frequency.exponentialRampToValueAtTime(220, t + 1.1);
      var lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 4;
      lp.frequency.setValueAtTime(240, t);
      lp.frequency.exponentialRampToValueAtTime(2600, t + 1.1);
      var g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.034, t + 0.25);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.35);
      o.connect(lp); lp.connect(g); g.connect(R.dry);
      var s = c.createGain(); s.gain.value = 0.35; g.connect(s); s.connect(R.send);
      o.start(t); o.stop(t + 1.4);
    },
    /* search warp: a theremin glide with slow vibrato */
    warp: function (R, t) {
      var c = R.ctx;
      var o = c.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(310, t);
      o.frequency.exponentialRampToValueAtTime(760, t + 0.55);
      o.frequency.exponentialRampToValueAtTime(620, t + 0.95);
      var vib = c.createOscillator(); vib.frequency.value = 5.6;
      var vg = c.createGain(); vg.gain.value = 7;
      vib.connect(vg); vg.connect(o.frequency);
      var g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.042, t + 0.09);
      g.gain.setValueAtTime(0.042, t + 0.7);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.05);
      o.connect(g); g.connect(R.dry);
      var s = c.createGain(); s.gain.value = 0.3; g.connect(s); s.connect(R.send);
      o.start(t); vib.start(t); o.stop(t + 1.1); vib.stop(t + 1.1);
    },
    /* the almanac opens: a burst of tape flutter and reel dust */
    almanac: function (R, t) {
      var c = R.ctx;
      var o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = 392;
      var fl = c.createOscillator(); fl.frequency.value = 6.3;
      var fg = c.createGain(); fg.gain.value = 26;
      fl.connect(fg); fg.connect(o.frequency);
      var g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.028, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      o.connect(g); g.connect(R.dry);
      var s = c.createGain(); s.gain.value = 0.5; g.connect(s); s.connect(R.send);
      var nz = c.createBufferSource(); nz.buffer = noiseBuf(c, 0.15);
      var hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2500;
      var ng = c.createGain(); ng.gain.value = 0.012;
      nz.connect(hp); hp.connect(ng); ng.connect(R.dry);
      o.start(t); fl.start(t); nz.start(t + 0.02);
      o.stop(t + 0.65); fl.stop(t + 0.65);
    },
    /* 290/290: a slow staggered chord, long tails on the tape */
    plate: function (R, t) {
      var c = R.ctx;
      [220, 277.18, 329.63, 415.3].forEach(function (f, k) {
        var o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
        var lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 950;
        var g = c.createGain();
        var tt = t + k * 0.14;
        g.gain.setValueAtTime(0.0001, tt);
        g.gain.exponentialRampToValueAtTime(0.024, tt + 0.3);
        g.gain.exponentialRampToValueAtTime(0.0001, tt + 2.1);
        o.connect(lp); lp.connect(g); g.connect(R.dry);
        var s = c.createGain(); s.gain.value = 0.45; g.connect(s); s.connect(R.send);
        o.start(tt); o.stop(tt + 2.2);
      });
    }
  };

  function safeSnd(name) {
    if (!audioOn || !rack || !AC) return;
    try { SND[name](rack, AC.currentTime + 0.02); } catch (e) { /* silence, never errors */ }
  }
  function sndTriangulated(delay) {
    if (!audioOn || !rack || !AC) return;
    try { SND.triang(rack, AC.currentTime + (delay || 0.1)); } catch (e) {}
  }
  function audioCore(i) {
    if (!audioOn || !rack || !AC) return;
    var p = stars[i].prov;
    var shown = Math.min(Math.max(1, p.commits), 64);
    var nightShown = Math.min(p.night || 0, shown);
    var t0 = AC.currentTime + 0.05;
    try {
      for (var k = 0; k < shown; k++) {
        var frac = shown <= 1 ? 0 : k / (shown - 1);
        SND.ping(rack, t0 + frac * 4, k >= shown - nightShown);
      }
    } catch (e) {}
  }
  function audioContact() { safeSnd('contact'); }

  /* one-time unlock on the first human gesture */
  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    document.removeEventListener('pointerdown', unlockAudio, true);
    document.removeEventListener('keydown', unlockAudio, true);
    if (!ensureAC()) return;
    try { if (AC.state === 'suspended') AC.resume(); } catch (e) {}
    try { rack = makeRack(AC); } catch (e) { rack = null; return; }
    if (audioOn) {
      startBed();
      safeSnd('lock');
      announceOnce('sound', 'SOUND ON · every sound is a measurement: the room tone is the observatory, pings are commits, a falling noise sweep is a transit, the low thump is first contact · the SOUND control silences it');
    }
  }
  document.addEventListener('pointerdown', unlockAudio, true);
  document.addEventListener('keydown', unlockAudio, true);

  /* headless self-test: render one event offline, report its signature */
  window.__probeSound = function (name, secs) {
    try {
      var durs = { bed: 4, hall: 2.5, plate: 3, contact: 2.5, transit: 2, chart: 2, warp: 1.6, lock: 1.2, almanac: 1.6 };
      var dur = secs || durs[name] || 1.2;
      var OC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      var o = new OC(1, Math.ceil(44100 * dur), 44100);
      var R = makeRack(o);
      if (name === 'bed') buildBed(R, 0);
      else if (name === 'hall') buildHallPad(R, 0);
      else if (name === 'ping') SND.ping(R, 0.02, false);
      else if (name === 'pingNight') SND.ping(R, 0.02, true);
      else SND[name](R, 0.02);
      return o.startRendering().then(function (buf) {
        var d = buf.getChannelData(0), n = d.length;
        var rms = 0, peak = 0, zc = 0, e1 = 0, e2 = 0, half = n >> 1;
        for (var i = 0; i < n; i++) {
          var v = d[i], av = v < 0 ? -v : v;
          rms += v * v; if (av > peak) peak = av;
          if (i && ((d[i - 1] < 0 && v >= 0) || (d[i - 1] >= 0 && v < 0))) zc++;
          if (i < half) e1 += v * v; else e2 += v * v;
        }
        rms = Math.sqrt(rms / n);
        return { name: name, dur: dur, rms: rms, peak: peak,
                 zcrHz: zc / (2 * dur), split: (e1 + e2) > 0 ? e2 / (e1 + e2) : 0 };
      });
    } catch (e) {
      return Promise.resolve({ name: name, error: String(e && e.message) });
    }
  };

