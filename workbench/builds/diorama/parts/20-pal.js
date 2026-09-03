
  /* ---------------------------------------------------------- palette
     The reference is a terracotta and cream model city at golden hour: warm
     clay, burnt sienna, ochre, cream stucco, sage shutters, weathered copper.
     The light is amber, the shadows are violet, and blue-grey is allowed only
     where there is actually glass. */
  var C = {
    sun:     hx('#FFC98A'),
    glow:    hx('#FF9A63'),
    skyLo:   hx('#FFD4A4'),
    skyMid:  hx('#D9A48F'),
    skyHi:   hx('#7A6A93'),
    haze:    hx('#F0CBA0'),
    shadow:  hx('#6B4C77'),
    table:   hx('#33241E'),
    tableHi: hx('#5A4034'),
    paper:   hx('#F4E6C9'),
    paperLo: hx('#DCC49B'),
    print:   hx('#8B7659'),
    earth:   hx('#C7A97F'),
    earthHi: hx('#E3C79A'),
    water:   hx('#3F8F84'),
    jade:    hx('#5E7C45'),
    jadeHi:  hx('#9AAE5E'),
    lit:     hx('#FFCE86'),
    copper:  hx('#6FA894'),
    clay:    hx('#B85B38'),
    clayHi:  hx('#D97C4C'),
    ink:     hx('#2A1D16')
  };

  /* Materials, keyed by archetype. base is the body colour, k is how greedily
     the surface takes the low key light, roof is the colour of its pantiles or
     its parapet, trim is the stone the sills, lintels and cornices are cut
     from. */
  var ARCH = {
    tower:    { name: 'Tower',      what: 'code and endpoints', mat: 'cream stucco and glass',
                base: '#E4CBA4', k: 0.46, roof: '#9A8468', trim: '#F3E3C2', glass: 1, chip: '#E4CBA4' },
    workshop: { name: 'Workshop',   what: 'step by step',       mat: 'burnt sienna brick',
                base: '#AE5433', k: 0.44, roof: '#B85B38', trim: '#E2C79E', glass: 0, chip: '#AE5433' },
    records:  { name: 'Records',    what: 'tables and config',  mat: 'warm grey stone',
                base: '#BFA684', k: 0.42, roof: '#8E7A62', trim: '#EBDCBB', glass: 0, chip: '#BFA684' },
    civic:    { name: 'Monument',   what: 'cited concepts',     mat: 'limestone and copper',
                base: '#EFDCB6', k: 0.50, roof: '#6FA894', trim: '#FBF1D8', glass: 0, chip: '#EFDCB6' },
    scaffold: { name: 'Scaffolded', what: 'migration pages',    mat: 'ochre behind a frame',
                base: '#CE8B41', k: 0.46, roof: '#A9702F', trim: '#EBD3A4', glass: 0, chip: '#CE8B41' },
    shed:     { name: 'Shed',       what: 'short stubs',        mat: 'terracotta and tin',
                base: '#C1613C', k: 0.44, roof: '#93624A', trim: '#E0C49B', glass: 0, chip: '#C1613C' },
    garden:   { name: 'Planted',    what: 'prose, no code',     mat: 'olive canopy',
                base: '#6E8A4E', k: 0.46, roof: '#5E7C45', trim: '#C9BE94', glass: 0, chip: '#6E8A4E' }
  };
  var ARCH_ORDER = ['tower', 'workshop', 'records', 'civic', 'scaffold', 'garden', 'shed'];

  /* Three colourways per archetype, chosen by a hash of the slug, so a
     quarter is a warm patchwork of clay, ochre and cream rather than one
     repeated swatch. */
  var MVAR = {
    tower:    ['#E4CBA4', '#D3A876', '#C98A63'],
    workshop: ['#AE5433', '#9A4732', '#BE6A42'],
    records:  ['#C3A882', '#CBAA75', '#B29A7E'],
    civic:    ['#EFDCB6', '#E8D0A2', '#F4E5C8'],
    scaffold: ['#CE8B41', '#BE7A38', '#DA9E58'],
    shed:     ['#C1613C', '#AC5337', '#CE7A4C'],
    garden:   ['#6E8A4E', '#647F49', '#7C9757']
  };

  /* extra materials the composer reaches for, past the seven archetypes */
  var MX = [
    { base: '#E4CBA4', k: 0.46 },   /* 0..6 are the archetypes, filled below   */
    null, null, null, null, null, null,
    { base: '#5B5348', k: 0.24 },   /* 7  structural steel                     */
    { base: '#B85B38', k: 0.52 },   /* 8  clay pantile                         */
    { base: '#F3E3C2', k: 0.54 },   /* 9  cut stone trim                       */
    { base: '#6FA894', k: 0.44 },   /* 10 weathered copper                     */
    { base: '#7C8B5E', k: 0.40 },   /* 11 sage shutters and joinery            */
    { base: '#8FA3B4', k: 0.30 },   /* 12 glass                                */
    { base: '#9A7C55', k: 0.34 },   /* 13 timber, planks, hoardings            */
    { base: '#C3462F', k: 0.48 },   /* 14 awning red                           */
    { base: '#3C3A44', k: 0.26 },   /* 15 tarmac, tarpaulin, dark tin          */
    { base: '#D8C49A', k: 0.44 },   /* 16 pale render                          */
    null, null, null, null,         /* 17-20 the paint on a parked van         */
    null, null, null,               /* 21-23 the stripes of a market canopy    */
    { base: '#A44C2E', k: 0.52 },   /* 24 pantile, weathered darker            */
    { base: '#C96C3E', k: 0.52 }    /* 25 pantile, freshly laid                */
  ];
  var M_STEEL = 7, M_TILE = 8, M_TRIM = 9, M_COPPER = 10, M_SHUT = 11,
      M_GLASS = 12, M_WOOD = 13, M_AWN = 14, M_DARK = 15, M_RENDER = 16;
  var M_TILES = [8, 24, 25];

  /* ------------------------------------------------------------ state */
  var B = null, G = null, COM = null;
  var pages = {}, order = [], orderIx = {};
  var adjOut = {}, adjIn = {};
  var rec = {};
  var dists = [];
  var navFlat = [];
  var cur = null;
  var searchIdx = [], searchReady = false;
  var river = { pts: [], bridges: [], poly: null };
  var lanes = [], highways = [];
  var bounds = { cx: 0, cy: 0, r: 800 };
  var props = [], paper = null;

  var P = 30;                 /* lot pitch, world units */
  var GAP = 4;                /* the sliver between neighbours on one block */
  var SW = 9;                 /* the street between superblocks */
  var STOREY = 9.2;           /* one floor */
  var GFH = 14.5;             /* the ground floor is always taller */

  var docEl, worldEl, sideEl, rbodyEl, tipEl, cv, ctx;

  /* ------------------------------------------------------------- boot */
  function boot() {
    docEl = $('#doc'); worldEl = $('#world'); sideEl = $('#side'); rbodyEl = $('#rbody');
    tipEl = $('#tip'); cv = $('#city'); ctx = cv.getContext('2d', { alpha: false });

    Promise.all([
      fetch('content.json').then(function (r) { return r.json(); }),
      fetch('graph.json').then(function (r) { return r.json(); }),
      fetch('communities.json').then(function (r) { return r.json(); })
    ]).then(function (res) {
      B = res[0]; G = res[1]; COM = res[2];
      pages = B.pages; order = B.order;
      order.forEach(function (s, i) { orderIx[s] = i; });
      $('#ver').textContent = B.version;

      buildAdj();
      classify();
      layout();

      buildNav();
      wire();
      route();                       /* reader first: content on screen fast */
      document.body.classList.remove('booting');

      requestAnimationFrame(function () {
        bakeSprites();
        bakeCity();
        bakeProps();
        bakePaper();
        resize();
        homeShot();
        buildHud();
        startLoop();
        if (cur) locate(false);
        idle(buildSearchIndex);
      });
    })['catch'](function (e) {
      document.body.classList.remove('booting');
      docEl.innerHTML = '<h1>The survey could not be loaded</h1><p>' + esc(String(e && e.message || e)) + '</p>';
    });
  }
  function idle(fn) {
    if (window.requestIdleCallback) requestIdleCallback(fn, { timeout: 1400 });
    else setTimeout(fn, 260);
  }
