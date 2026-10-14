/**
 * Round-trip proof for the sidebars.js editor.
 *
 * Run with: node --test scripts/badges/
 *
 * The property that matters is not "the file still parses" but "the sidebar
 * the site builds from is the one we had, plus exactly one badge". So every
 * case below reloads the edited file and compares the structure it exports,
 * rather than comparing text.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { setBadge, resetBadges } = require('./sidebar-editor.js');

const SIDEBARS = path.join(__dirname, '..', '..', 'sidebars.js');
const ORIGINAL = fs.readFileSync(SIDEBARS, 'utf8');
const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'sidebar-badges-'));

/** Load a sidebars.js source as a module, with no require cache in the way. */
function load(source) {
  const file = path.join(tmpdir, `sidebars-${Math.random().toString(36).slice(2)}.js`);
  fs.writeFileSync(file, source);
  const mod = require(file);
  delete require.cache[require.resolve(file)];
  fs.unlinkSync(file);
  return mod;
}

/**
 * Canonical form, so that `'cms/x'` and `{ type: 'doc', id: 'cms/x' }` compare
 * equal: the two are the same sidebar entry written two ways, and converting
 * one to the other is exactly what setting a badge on a bare string does.
 */
function canonical(items) {
  return (items || []).map((item) => {
    if (typeof item === 'string') return { id: item };
    if (item.type === 'doc') {
      const { type, ...rest } = item;
      return rest;
    }
    if (item.type === 'category') {
      return { ...item, items: canonical(item.items) };
    }
    return item;
  });
}

function tree(source) {
  const mod = load(source);
  return Object.fromEntries(Object.keys(mod).map((k) => [k, canonical(mod[k])]));
}

/** Every doc id the sidebar references, including category landing pages. */
function allDocIds(mod) {
  const ids = [];
  const walk = (items) => {
    for (const item of items || []) {
      if (typeof item === 'string') ids.push(item);
      else if (item.type === 'doc') ids.push(item.id);
      else if (item.type === 'category') {
        if (item.link && item.link.type === 'doc') ids.push(item.link.id);
        walk(item.items);
      }
    }
  };
  Object.keys(mod).forEach((k) => walk(mod[k]));
  return ids;
}

const DOC_IDS = allDocIds(load(ORIGINAL));
const BASELINE = resetBadges(ORIGINAL).source;
const BASELINE_TREE = tree(BASELINE);

/** How many sidebar entries point at each page. */
const OCCURRENCES = DOC_IDS.reduce((m, id) => m.set(id, (m.get(id) || 0) + 1), new Map());

test('the sidebar exposes the entries this suite expects', () => {
  assert.ok(DOC_IDS.length > 150, `only ${DOC_IDS.length} doc ids found`);
  // `cms/api/content-api` is both the landing page of the Content APIs
  // category and the first item inside it. Both are visible in the sidebar, so
  // a badge on that page has to land on both.
  const repeated = [...OCCURRENCES].filter(([, n]) => n > 1);
  assert.deepStrictEqual(repeated, [['cms/api/content-api', 2]]);
});

/**
 * Lines that differ between two sources, as plain text.
 *
 * The structural assertions below cannot see a lost trailing comma, because a
 * trailing comma does not change the exported sidebar. An early version of the
 * reset stripped the comma off every property in the file and every assertion
 * still passed, so the text itself is checked too.
 */
function changedLines(before, after) {
  const a = before.split('\n');
  const b = after.split('\n');
  const inB = new Map();
  b.forEach((line) => inB.set(line, (inB.get(line) || 0) + 1));
  const removed = [];
  for (const line of a) {
    const n = inB.get(line) || 0;
    if (n === 0) removed.push(line);
    else inB.set(line, n - 1);
  }
  return removed;
}

test('reset touches no line that has nothing to do with a badge', () => {
  const { source } = resetBadges(ORIGINAL);
  const touched = changedLines(ORIGINAL, source);
  const badgeRelated = /\b(new|updated)\s*:|customProps|^\s*[{}],?\s*$|^\s*type:\s*'doc',?\s*$|^\s*id:\s*'[^']+',?\s*$/;
  // The property that preceded a removed badge loses its trailing comma, which
  // is the one legitimate way an unrelated line can change.
  const kept = new Set(source.split('\n'));
  const collateral = touched.filter(
    (line) => !badgeRelated.test(line) && !kept.has(line.replace(/,\s*$/, '')),
  );
  assert.deepStrictEqual(collateral, [], 'reset rewrote lines unrelated to badges');
});

test('reset removes every badge and nothing else', () => {
  const { source, removed } = resetBadges(ORIGINAL);
  assert.ok(removed > 0, 'expected the file to carry hand-placed badges today');
  assert.equal(resetBadges(source).removed, 0, 'reset is not idempotent');
  // Structure is unchanged apart from the badge keys themselves.
  const before = tree(ORIGINAL);
  const after = tree(source);
  const strip = (node) => {
    if (Array.isArray(node)) return node.map(strip);
    if (node && typeof node === 'object') {
      const copy = { ...node };
      if (copy.customProps) {
        const { new: _n, updated: _u, ...rest } = copy.customProps;
        if (Object.keys(rest).length === 0) delete copy.customProps;
        else copy.customProps = rest;
      }
      return Object.fromEntries(Object.entries(copy).map(([k, v]) => [k, strip(v)]));
    }
    return node;
  };
  assert.deepStrictEqual(after, strip(before));
});

for (const type of ['new', 'updated']) {
  test(`setting '${type}' on each of the ${DOC_IDS.length} entries keeps the sidebar intact`, () => {
    for (const id of DOC_IDS) {
      const { source, status, occurrences } = setBadge(BASELINE, id, type);
      assert.equal(status, 'added', `${id}: unexpected status ${status}`);
      assert.equal(occurrences, OCCURRENCES.get(id), `${id}: edited ${occurrences} entries`);

      const after = tree(source);

      // Exactly one entry gained the badge, and it is the right one.
      let badged = 0;
      const visit = (nodes) => {
        for (const node of nodes) {
          if (node && node.customProps && node.customProps[type]) {
            badged++;
            assert.equal(node.id ?? (node.link && node.link.id), id, `badge landed on ${node.id}`);
          }
          if (node && node.items) visit(node.items);
        }
      };
      Object.values(after).forEach(visit);
      assert.equal(
        badged,
        OCCURRENCES.get(id),
        `${id}: ${badged} entries carry the badge, expected ${OCCURRENCES.get(id)}`,
      );

      // And the file is byte-for-byte the baseline once the badge is removed.
      assert.equal(resetBadges(source).source, BASELINE, `${id}: reset does not restore the file`);
    }
  });
}

test('setting the same badge twice changes nothing', () => {
  const once = setBadge(BASELINE, DOC_IDS[0], 'updated');
  const twice = setBadge(once.source, DOC_IDS[0], 'updated');
  assert.equal(twice.status, 'unchanged');
  assert.equal(twice.source, once.source);
});

test("'new' replaces 'updated' on the same entry", () => {
  const first = setBadge(BASELINE, DOC_IDS[0], 'updated');
  const second = setBadge(first.source, DOC_IDS[0], 'new');
  assert.equal(second.status, 'replaced');
  assert.equal(resetBadges(second.source).source, BASELINE);
});

test('a badge on an entry that already carries enterprise or ai keeps it', () => {
  const mod = load(BASELINE);
  let host = null;
  const walk = (items) => {
    for (const item of items || []) {
      if (item && item.customProps && (item.customProps.enterprise || item.customProps.ai)) {
        host = item.id || (item.link && item.link.id);
      }
      if (item && item.items) walk(item.items);
    }
  };
  Object.keys(mod).forEach((k) => walk(mod[k]));
  assert.ok(host, 'no entry carries enterprise or ai in the sidebar');

  const { source, status } = setBadge(BASELINE, host, 'new');
  assert.equal(status, 'added');
  const after = tree(source);
  let checked = false;
  const visit = (nodes) => {
    for (const node of nodes) {
      if (node && (node.id === host || (node.link && node.link.id === host))) {
        assert.ok(node.customProps.new, 'the new badge was not set');
        assert.ok(
          node.customProps.enterprise || node.customProps.ai,
          'the pre-existing badge was dropped',
        );
        checked = true;
      }
      if (node && node.items) visit(node.items);
    }
  };
  Object.values(after).forEach(visit);
  assert.ok(checked, `entry ${host} not found after editing`);
  assert.equal(resetBadges(source).source, BASELINE);
});

test('an unknown page reports not-found instead of editing anything', () => {
  const { source, status } = setBadge(BASELINE, 'cms/does-not-exist', 'new');
  assert.equal(status, 'not-found');
  assert.equal(source, BASELINE);
});

test.after(() => fs.rmSync(tmpdir, { recursive: true, force: true }));
