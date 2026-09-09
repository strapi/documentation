/* WHERE THE DESIGN LAB'S WORLDS LIVE. One module, because the gallery and the
   thumbnailer must never disagree about it: on 2026-09-09 most cards in the
   lab showed a world that could not load, and the two scripts pointing
   separately at the same disposable directory is how that happened.

   THE STORY, so it is not repeated. Both scripts served every world out of
   the scratchpad of session 0d8629c6 under /private/tmp. Six of those living
   build dirs lost their data bundles some time around 00:16 that morning
   (content.json, graph.json, communities.json, provenance.json, and FIRST
   LIGHT's parts/), so the worlds genuinely failed: a fetch of a file the
   server answers 404 to, with an empty body, throws "Unexpected end of JSON
   input", which is exactly what FIRST LIGHT's card was showing, under its own
   "Instrument failure" heading. The scratchpad is disposable by design. Every
   one of the living worlds also has a branch of strapi/documentation carrying
   a complete, self-contained copy WITH its data, so that is what is served
   now.

   THREE SOURCES, in this order:
     1. the WORKTREE, when that branch happens to be checked out somewhere.
        Its working files are what someone is editing right now, so a live
        preview has to show those rather than the last commit.
     2. the BRANCH, read straight out of git as blobs. No checkout, no copy,
        nothing to rot, and exactly what was pushed.
     3. the old SCRATCHPAD path, for the few archived worlds that have no
        branch of their own yet. When it is gone they show the holding page,
        which is the truth rather than a broken world. */

const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');

const REPO = '/Users/piwi/code/documentation';
const LABROOT = 'docusaurus/static/design-lab';
const IMG = REPO + '/docusaurus/static/img';
/* The cards live on the workbench branch, not in /private/tmp, for the same
   reason the worlds do: a gallery cannot stand on a disposable directory. */
const THUMBS = '/Users/piwi/code/documentation-wt-design-lab/workbench/qa/gallery-thumbs';
const SP = '/private/tmp/claude-501/-Users-piwi-code-documentation/0d8629c6-231f-4fec-94af-6fe3669d37b8/scratchpad';
const FINAL = SP + '/final/builds';

const PLACES = {
  longway:        { branch: 'repo/experimental-design-longway',       wdir: 'longway' },
  pixelcity:      { branch: 'repo/experimental-design-pixelcity',     wdir: 'pixelcity' },
  herbarium:      { branch: 'repo/experimental-design-herbarium',     wdir: 'herbarium' },
  firstlight:     { branch: 'repo/experimental-design-firstlight',    wdir: 'firstlight' },
  cartastrapiana: { branch: 'repo/experimental-design-carta',         wdir: 'carta-strapiana' },
  bythedeep:      { branch: 'repo/experimental-design-bythedeep',     wdir: 'bythedeep' },
  secreta:        { branch: 'repo/experimental-design-fourcolor',     wdir: 'fourcolor' },
  goldenshore:    { branch: 'repo/experimental-design-goldenshore',   wdir: 'goldenshore' },
  cityx:          { branch: 'repo/experimental-design-city',          wdir: 'city' },
  workingsea:     { branch: 'repo/experimental-design-coastoflights', wdir: 'coastoflights' },
  /* no branch of their own yet */
  alpenglow:      { dir: FINAL + '/btd-prop-c' },
  secretb:        { dir: FINAL + '/secret-b' },
};

function git(args, opts) {
  return execFileSync('git', ['-C', REPO].concat(args), Object.assign({ maxBuffer: 512 * 1024 * 1024 }, opts || {}));
}
function gitText(args) { return String(git(args, { encoding: 'utf8' })).trim(); }

/* Every branch checked out somewhere right now, branch -> path. Read once:
   a worktree appearing later is a restart, not a bug. */
const WORKTREES = (() => {
  const map = Object.create(null);
  let cur = null;
  try {
    for (const line of gitText(['worktree', 'list', '--porcelain']).split('\n')) {
      if (line.startsWith('worktree ')) cur = line.slice(9).trim();
      else if (line.startsWith('branch refs/heads/') && cur) map[line.slice(18).trim()] = cur;
    }
  } catch (e) { /* not a repo: everything falls through to the scratchpad */ }
  return map;
})();

/* Held for a moment, because rev() and every single asset request ask for it
   and each miss costs a git process. */
const SRC_TTL = 2000;
const srcCache = Object.create(null);

function resolve(key) {
  const p = PLACES[key];
  if (!p) return { kind: 'none' };
  if (p.branch) {
    const wt = WORKTREES[p.branch];
    if (wt) {
      const d = path.join(wt, LABROOT, p.wdir);
      if (fs.existsSync(path.join(d, 'index.html'))) return { kind: 'worktree', dir: d, branch: p.branch };
    }
    for (const ref of [p.branch, 'origin/' + p.branch]) {
      try {
        const [sha, ct] = gitText(['log', '-1', '--format=%H %ct', ref]).split(' ');
        if (sha) return { kind: 'branch', sha, when: (+ct) * 1000, root: LABROOT + '/' + p.wdir, branch: p.branch };
      } catch (e) { /* try the next ref */ }
    }
  }
  if (p.dir) return { kind: 'scratchpad', dir: p.dir };
  return { kind: 'none' };
}

function source(key) {
  const hit = srcCache[key];
  if (hit && Date.now() - hit.at < SRC_TTL) return hit.s;
  const s = resolve(key);
  srcCache[key] = { at: Date.now(), s };
  return s;
}

/* Blobs are keyed by the commit they came from, so a new commit is a new key
   and nothing has to be invalidated by hand. */
const blobs = new Map();

function readWorld(key, rel, cb) {
  const s = source(key);
  if (s.dir) return fs.readFile(path.join(s.dir, rel), cb);
  if (s.kind !== 'branch') return cb(new Error('no source for ' + key));
  const k = s.sha + ':' + rel;
  if (blobs.has(k)) return cb(null, blobs.get(k));
  let buf;
  try { buf = git(['cat-file', 'blob', s.sha + ':' + s.root + '/' + rel]); }
  catch (e) { return cb(e); }
  if (blobs.size > 300) blobs.clear();
  blobs.set(k, buf);
  cb(null, buf);
}

function rev(key) {
  const s = source(key);
  if (s.kind === 'branch') {
    /* a world on a branch is complete by construction: what is served is what
       was pushed, and the commit is its revision */
    let n = 0;
    try { n = gitText(['ls-tree', '--name-only', s.sha + ':' + s.root]).split('\n').filter(Boolean).length; } catch (e) {}
    return { rev: s.when, files: n, ready: n > 0, src: 'branch' };
  }
  if (!s.dir) return { rev: 0, files: 0, ready: false, src: '' };
  let newest = 0, n = 0, has = false;
  try {
    for (const f of fs.readdirSync(s.dir)) {
      if (f.startsWith('prev-') || f === 'content.json' || f === 'graph.json') continue;
      if (!/\.(html|css|js)$/.test(f)) continue;
      const st = fs.statSync(path.join(s.dir, f));
      newest = Math.max(newest, Math.floor(st.mtimeMs)); n++;
      if (f === 'index.html') has = true;
    }
  } catch (e) { /* not there yet */ }
  return { rev: newest, files: n, ready: has, src: s.kind };
}

module.exports = { REPO, LABROOT, IMG, THUMBS, SP, FINAL, PLACES, source, readWorld, rev };
