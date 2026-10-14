/**
 * Text-level editor for `sidebars.js`.
 *
 * The badges this manipulates are `customProps: { new: true }` and
 * `customProps: { updated: true }` on a sidebar entry. Everything else in the
 * file — comments, section headers, the `enterprise` / `growth` / `ai` badges,
 * explicit `label:` overrides, formatting — must survive untouched, which is
 * why this edits the source text rather than reprinting a parsed tree. A
 * generator would reformat the whole 780-line file on every release.
 *
 * Three shapes of entry exist, and all three must be supported:
 *
 *   'cms/deployment',                        <- most of the file
 *   items: ['cms/cli'],                      <- the same thing, inline
 *   { type: 'doc', id: 'cms/deployment' }    <- the rest
 *
 * The first two have nowhere to hang a `customProps`, so setting a badge on
 * one converts it to the object form, and the reset converts it back. Without
 * that second half the file would drift: every page badged once would stay an
 * object for good, and each release would leave `sidebars.js` a little longer
 * than the release before it.
 */

const BADGE_KEYS = ['new', 'updated'];

/**
 * Walk the source once, recording which characters are real code and where the
 * string literals are.
 *
 * Both are needed. Brace matching must not trip on a brace inside a comment or
 * a string, and `sidebars.js` has both: commented-out entries at the top, and
 * HTML markup in `type: 'html'` items. Finding an entry, on the other hand,
 * means finding a string literal, which the code mask deliberately excludes.
 */
function scan(src) {
  const mask = new Uint8Array(src.length);
  const literals = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') {
      const quote = c;
      const start = i;
      i++;
      while (i < src.length) {
        if (src[i] === '\\') { i += 2; continue; }
        if (src[i] === quote) { i++; break; }
        i++;
      }
      literals.push({ start, end: i, value: src.slice(start + 1, i - 1) });
      continue;
    }
    mask[i] = 1;
    i++;
  }
  return { mask, literals };
}

/** Span of the object literal enclosing `pos`, braces included. */
function enclosingObject(src, mask, pos) {
  let depth = 0;
  let i = pos;
  while (i >= 0) {
    if (mask[i]) {
      if (src[i] === '}') depth++;
      else if (src[i] === '{') {
        if (depth === 0) break;
        depth--;
      }
    }
    i--;
  }
  if (i < 0) return null;

  const start = i;
  depth = 0;
  for (let j = start; j < src.length; j++) {
    if (!mask[j]) continue;
    if (src[j] === '{') depth++;
    else if (src[j] === '}') {
      depth--;
      if (depth === 0) return { start, end: j };
    }
  }
  return null;
}

/** Nearest non-whitespace character before `pos`, and its index. */
function prevNonSpace(src, pos) {
  let i = pos - 1;
  while (i >= 0 && /\s/.test(src[i])) i--;
  return { char: src[i], index: i };
}

/** Nearest non-whitespace character at or after `pos`. */
function nextNonSpace(src, pos) {
  let i = pos;
  while (i < src.length && /\s/.test(src[i])) i++;
  return { char: src[i], index: i };
}

/** Indentation of the line containing `pos`. */
function indentAt(src, pos) {
  const lineStart = src.lastIndexOf('\n', pos - 1) + 1;
  return (src.slice(lineStart, pos).match(/^[ \t]*/) || [''])[0];
}

/** The `customProps: { ... }` block owned directly by the object at `span`. */
function findCustomProps(src, mask, span) {
  const re = /\bcustomProps:\s*\{/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    if (m.index < span.start || m.index > span.end) continue;
    const braceAt = src.indexOf('{', m.index + 'customProps:'.length);
    const inner = enclosingObject(src, mask, braceAt + 1);
    if (!inner) continue;
    const owner = enclosingObject(src, mask, m.index);
    if (owner && owner.start === span.start) return { keyStart: m.index, span: inner };
  }
  return null;
}

function carriesBadge(src, mask, span, type) {
  const existing = findCustomProps(src, mask, span);
  if (!existing) return false;
  const inner = src.slice(existing.span.start + 1, existing.span.end);
  return new RegExp(`\\b${type}:\\s*true\\b`).test(inner);
}

/**
 * Locate one sidebar entry for `docId` that does not already carry `type`.
 *
 * One page can appear more than once in the sidebar: `cms/api/content-api` is
 * both a category's landing page and the first item inside it, and both are
 * visible, so both must end up badged. Skipping the occurrences that already
 * carry the badge is what lets the caller loop until they all do. Pass a null
 * `type` to find any entry at all.
 */
function findEntry(src, docId, type) {
  const { mask, literals } = scan(src);

  for (const literal of literals) {
    if (literal.value !== docId) continue;

    // An array element: the string stands where an entry object could stand.
    const before = prevNonSpace(src, literal.start);
    const after = nextNonSpace(src, literal.end);
    if ((before.char === '[' || before.char === ',') && (after.char === ',' || after.char === ']')) {
      return { kind: 'bare', literal, mask };
    }

    // The `id:` of an entry object.
    if (before.char === ':' && /\bid\s*:$/.test(src.slice(Math.max(0, before.index - 4), before.index + 1))) {
      let span = enclosingObject(src, mask, literal.start);
      if (!span) continue;
      // A category declares its landing page as `link: { type: 'doc', id }`.
      // The badge belongs on the category, which is one level up.
      if (src.slice(0, span.start).trimEnd().endsWith('link:')) {
        span = enclosingObject(src, mask, span.start - 1);
        if (!span) continue;
      }
      if (type && carriesBadge(src, mask, span, type)) continue;
      return { kind: 'object', span, mask };
    }
  }
  return null;
}

/** Replace a bare string entry with the object form carrying the badge. */
function expandBare(source, literal, docId, type) {
  const lineStart = source.lastIndexOf('\n', literal.start - 1) + 1;
  const inline = source.slice(lineStart, literal.start).trim() !== '';

  if (inline) {
    const object = `{ type: 'doc', id: '${docId}', customProps: { ${type}: true } }`;
    return source.slice(0, literal.start) + object + source.slice(literal.end);
  }

  const indent = indentAt(source, literal.start);
  const object = [
    '{',
    `${indent}  type: 'doc',`,
    `${indent}  id: '${docId}',`,
    `${indent}  customProps: {`,
    `${indent}    ${type}: true`,
    `${indent}  }`,
    `${indent}}`,
  ].join('\n');
  return source.slice(0, literal.start) + object + source.slice(literal.end);
}

/** Add the badge to one entry object, merging with any existing customProps. */
function badgeObject(source, span, mask, type) {
  const existing = findCustomProps(source, mask, span);

  if (existing) {
    const inner = source.slice(existing.span.start + 1, existing.span.end);
    const other = BADGE_KEYS.find((k) => k !== type);
    const otherRe = new RegExp(`\\b${other}:\\s*true\\b`);
    if (otherRe.test(inner)) {
      return {
        source:
          source.slice(0, existing.span.start + 1) +
          inner.replace(otherRe, `${type}: true`) +
          source.slice(existing.span.end),
        status: 'replaced',
      };
    }
    // Inserted first, so the trailing-comma shape of the block is left as it was.
    const firstProp = inner.match(/\n([ \t]*)\S/);
    const at = existing.span.start + 1;
    const separator = firstProp ? `\n${firstProp[1]}` : ' ';
    return {
      source: `${source.slice(0, at)}${separator}${type}: true,${source.slice(at)}`,
      status: 'added',
    };
  }

  const inner = source.slice(span.start + 1, span.end);
  const trimmed = inner.replace(/\s+$/, '');
  const separator = trimmed.endsWith(',') ? '' : ',';

  if (!inner.includes('\n')) {
    return {
      source:
        source.slice(0, span.start + 1) +
        `${trimmed}${separator} customProps: { ${type}: true } ` +
        source.slice(span.end),
      status: 'added',
    };
  }

  const objIndent = indentAt(source, span.start);
  const propIndent = `${objIndent}  `;
  const rebuilt =
    `${trimmed}${separator}\n` +
    `${propIndent}customProps: {\n` +
    `${propIndent}  ${type}: true\n` +
    `${propIndent}}\n` +
    `${objIndent}`;
  return {
    source: source.slice(0, span.start + 1) + rebuilt + source.slice(span.end),
    status: 'added',
  };
}

function setBadgeOnce(source, docId, type) {
  const found = findEntry(source, docId, type);
  if (!found) return { source, status: 'not-found' };
  if (found.kind === 'bare') {
    return { source: expandBare(source, found.literal, docId, type), status: 'added' };
  }
  return badgeObject(source, found.span, found.mask, type);
}

/**
 * Add `new: true` or `updated: true` to every sidebar entry for `docId`.
 *
 * Returns { source, status, occurrences } where status is 'added', 'replaced',
 * 'unchanged' (every entry already carries it) or 'not-found' (the page has no
 * sidebar entry, so it cannot carry a badge at all). `occurrences` counts the
 * entries edited, which is more than one for a page listed twice.
 */
function setBadge(source, docId, type) {
  if (!BADGE_KEYS.includes(type)) throw new Error(`unknown badge type: ${type}`);

  const exists = findEntry(source, docId, null) !== null;

  let out = source;
  let occurrences = 0;
  let status = null;

  // Each pass edits one entry and shifts every offset after it, so the search
  // restarts from the edited text rather than caching spans.
  for (;;) {
    const step = setBadgeOnce(out, docId, type);
    if (step.status === 'not-found') break;
    out = step.source;
    occurrences++;
    if (status === null || status === 'added') status = step.status;
  }

  if (occurrences === 0) status = exists ? 'unchanged' : 'not-found';
  return { source: out, status, occurrences };
}

/**
 * Remove every `new: true` and `updated: true` from the file, drop any
 * `customProps` block left empty, and write entries that carry nothing but
 * `type` and `id` back as the bare string they came from.
 *
 * The collapse never touches a category's `link: { type: 'doc', id }`, where a
 * bare string would be invalid: it only fires on an object that opens its own
 * line or that directly follows a `[` or a `,`, which is to say on an object
 * standing where a string could stand.
 *
 * Returns { source, removed } where removed is the number of badges dropped.
 */
function resetBadges(source) {
  let removed = 0;
  let out = source;

  for (;;) {
    const { mask } = scan(out);
    const re = /\b(new|updated):\s*true\s*,?/g;
    let hit = null;
    let m;
    while ((m = re.exec(out)) !== null) {
      if (mask[m.index]) { hit = m; break; }
    }
    if (!hit) break;

    const lineStart = out.lastIndexOf('\n', hit.index - 1) + 1;
    const lineEnd = out.indexOf('\n', hit.index);
    const line = out.slice(lineStart, lineEnd === -1 ? out.length : lineEnd);

    out = line.trim() === hit[0].trim()
      ? out.slice(0, lineStart) + out.slice(lineEnd === -1 ? out.length : lineEnd + 1)
      : out.slice(0, hit.index) + out.slice(hit.index + hit[0].length);
    removed++;
  }

  // Drop the `customProps: {}` left behind, on its own line or inline.
  out = out.replace(/\n[ \t]*customProps:\s*\{\s*\},?(?=\n)/g, '');
  out = out.replace(/,?\s*customProps:\s*\{\s*\}\s*,?/g, (all) => (all.includes(',') ? ',' : ''));
  // Tidy the block the badge came out of, and only that block. A dangling
  // comma is legal JavaScript, so this is cosmetic — but a rule written any
  // wider than one `customProps` strips the trailing comma off every property
  // in the file, and the release diff stops being readable.
  out = out.replace(
    /(customProps:\s*\{)([^{}]*)(\})/g,
    (_all, open, inner, close) => open + inner.replace(/,(\s*)$/, '$1').replace(/\{\s{2,}/, '{ ') + close,
  );
  // Collapse `{ type: 'doc', id: 'x' }` back to `'x'`, both shapes.
  out = out.replace(
    /^([ \t]*)\{\s*type:\s*'doc',\s*id:\s*('[^']+'),?\s*\}/gm,
    (_all, indent, id) => `${indent}${id}`,
  );
  out = out.replace(
    /([[,]\s*)\{\s*type:\s*'doc',\s*id:\s*('[^']+'),?\s*\}/g,
    (_all, lead, id) => `${lead}${id}`,
  );

  return { source: out, removed };
}

module.exports = { setBadge, resetBadges, findEntry, BADGE_KEYS };
