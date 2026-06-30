/**
 * Shared helpers for extracting content from the API layout components
 * (<Endpoint>, <ApiCall>, <Request>, <Response>) used across the docs.
 *
 * The code that backs these components lives in their PROPS (e.g. Endpoint's
 * `codeTabs={[...]}` and `responses={[...]}`, or fenced code inside the
 * children of <Request>/<Response>), NOT in plain Markdown fences. The
 * llms-full.txt generator (generate-llms.js) already turns these into readable
 * text; this module exposes pure functions so the llms-code.txt generator
 * (generate-llms-code.js) can pull the SAME code out as structured snippets.
 *
 * Everything here is a pure function (no `this`), so both generators can share
 * it without duplicating the JSX-scanning logic.
 */

'use strict';

/**
 * Extract a full JSX block starting at `startIdx` for a given component name.
 * Handles nested braces/brackets/template literals in props and children.
 * Returns { fullMatch, propsString, children } or null.
 *
 * (Ported verbatim in behavior from generate-llms.js so the two generators
 * scan components identically.)
 */
function extractJsxBlock(text, startIdx, componentName) {
  let i = startIdx + componentName.length + 1; // skip past `<ComponentName`
  const len = text.length;

  // Phase 1: Find the end of the opening tag (either `/>` or `>`)
  let depth = { brace: 0, bracket: 0, paren: 0 };
  let inString = null; // null, '"', "'", '`'
  // Stack of template-literal interpolation depths: when we enter `${`, we push
  // the current brace depth so the matching `}` can pop us back into the
  // template literal instead of being counted as a stray closing brace. Without
  // this, every `${...}` leaves brace depth permanently unbalanced and the
  // opening-tag scan overruns the whole component.
  const tplInterp = [];
  const propsStart = i;
  let selfClosing = false;
  let openTagEnd = -1;

  while (i < len) {
    const ch = text[i];
    const prev = i > 0 ? text[i - 1] : '';

    if (inString) {
      if (inString === '`') {
        // Enter an interpolation `${ ... }` — leave string mode and track depth.
        if (ch === '$' && i + 1 < len && text[i + 1] === '{' && prev !== '\\') {
          tplInterp.push(inString);
          inString = null;
          depth.brace++;
          i += 2;
          continue;
        }
        if (ch === '`' && prev !== '\\') {
          inString = null;
        }
      } else if (ch === inString && prev !== '\\') {
        inString = null;
      }
      i++;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      i++;
      continue;
    }

    if (ch === '{') { depth.brace++; i++; continue; }
    if (ch === '}') {
      depth.brace--;
      // If this `}` closes a template-literal interpolation, resume the
      // template literal we suspended on `${`.
      if (tplInterp.length > 0) {
        inString = tplInterp.pop();
      }
      i++;
      continue;
    }
    if (ch === '[') { depth.bracket++; i++; continue; }
    if (ch === ']') { depth.bracket--; i++; continue; }
    if (ch === '(') { depth.paren++; i++; continue; }
    if (ch === ')') { depth.paren--; i++; continue; }

    if (depth.brace === 0 && depth.bracket === 0 && depth.paren === 0) {
      if (ch === '/' && i + 1 < len && text[i + 1] === '>') {
        selfClosing = true;
        openTagEnd = i + 2;
        break;
      }
      if (ch === '>') {
        openTagEnd = i + 1;
        break;
      }
    }

    i++;
  }

  if (openTagEnd === -1) return null;

  const propsString = text.substring(propsStart, i).trim();

  if (selfClosing) {
    return {
      fullMatch: text.substring(startIdx, openTagEnd),
      propsString,
      children: '',
    };
  }

  // Phase 2: Find closing tag </ComponentName>
  const closingTag = `</${componentName}>`;
  let tagDepth = 1;
  let j = openTagEnd;
  const openTag = `<${componentName}`;

  while (j < len && tagDepth > 0) {
    if (text.substring(j, j + openTag.length) === openTag) {
      tagDepth++;
      j += openTag.length;
      continue;
    }
    if (text.substring(j, j + closingTag.length) === closingTag) {
      tagDepth--;
      if (tagDepth === 0) break;
      j += closingTag.length;
      continue;
    }
    j++;
  }

  if (tagDepth !== 0) return null;

  const children = text.substring(openTagEnd, j);
  const fullEnd = j + closingTag.length;

  return {
    fullMatch: text.substring(startIdx, fullEnd),
    propsString,
    children,
  };
}

// ---- Prop extraction helpers (pure) ----

/** Extract a simple string prop: prop="value" or prop='value' */
function extractStringProp(propsString, propName) {
  const regex = new RegExp(`${propName}=["']([^"']*?)["']`);
  const match = propsString.match(regex);
  return match ? match[1] : null;
}

/** Extract an array prop: prop={[...]} — returns the raw string inside [...] */
function extractArrayProp(propsString, propName) {
  const marker = `${propName}={[`;
  const idx = propsString.indexOf(marker);
  if (idx === -1) return null;

  let i = idx + marker.length;
  let depth = 1;
  let inString = null;
  const tplInterp = [];
  const len = propsString.length;

  while (i < len && depth > 0) {
    const ch = propsString[i];
    const prev = i > 0 ? propsString[i - 1] : '';

    if (inString) {
      if (inString === '`') {
        if (ch === '$' && i + 1 < len && propsString[i + 1] === '{' && prev !== '\\') {
          tplInterp.push(inString);
          inString = null;
          depth++;
          i += 2; continue;
        }
        if (ch === '`' && prev !== '\\') inString = null;
      } else if (ch === inString && prev !== '\\') {
        inString = null;
      }
      i++; continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') { inString = ch; i++; continue; }
    if (ch === '[' || ch === '{' || ch === '(') { depth++; i++; continue; }
    if (ch === ']') { depth--; if (depth === 0) break; i++; continue; }
    if (ch === '}' || ch === ')') {
      depth--;
      if (ch === '}' && tplInterp.length > 0) { inString = tplInterp.pop(); }
      i++; continue;
    }
    i++;
  }

  return propsString.substring(idx + marker.length, i);
}

/** Split an array string into individual object items (top-level { ... } blocks) */
function parseSimpleArray(arrayContent) {
  const items = [];
  let depth = 0;
  let inString = null;
  const tplInterp = [];
  let start = -1;

  for (let i = 0; i < arrayContent.length; i++) {
    const ch = arrayContent[i];
    const prev = i > 0 ? arrayContent[i - 1] : '';

    if (inString) {
      if (inString === '`') {
        if (ch === '$' && i + 1 < arrayContent.length && arrayContent[i + 1] === '{' && prev !== '\\') {
          tplInterp.push(inString);
          inString = null;
          depth++;
          i++; continue;
        }
        if (ch === '`' && prev !== '\\') inString = null;
      } else if (ch === inString && prev !== '\\') {
        inString = null;
      }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') { inString = ch; continue; }

    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (tplInterp.length > 0) {
        inString = tplInterp.pop();
      } else if (depth === 0 && start !== -1) {
        items.push(arrayContent.substring(start, i + 1));
        start = -1;
      }
    }
  }

  return items;
}

/** Extract a simple field value from an object string: field: 'value' or field: "value" */
function getObjectField(objString, fieldName) {
  const regex = new RegExp(`${fieldName}:\\s*['"]([\\s\\S]*?)(?<!\\\\)['"]`);
  const match = objString.match(regex);
  return match ? match[1] : null;
}

/** Extract a template literal field: field: `value` */
function extractTemplateLiteral(objString, fieldName) {
  const marker = `${fieldName}: \``;
  let idx = objString.indexOf(marker);
  if (idx === -1) {
    const marker2 = `${fieldName}:\``;
    idx = objString.indexOf(marker2);
    if (idx === -1) return null;
    idx += marker2.length;
  } else {
    idx += marker.length;
  }

  let i = idx;
  let depth = 0;
  const len = objString.length;

  while (i < len) {
    const ch = objString[i];
    const prev = i > 0 ? objString[i - 1] : '';
    // Escaped `\${` and `\`` are literal characters inside the value, not
    // interpolation/terminator — skip them.
    if (ch === '$' && i + 1 < len && objString[i + 1] === '{' && prev !== '\\') {
      depth++;
      i += 2;
      continue;
    }
    if (ch === '}' && depth > 0) {
      depth--;
      i++;
      continue;
    }
    if (ch === '`' && depth === 0 && prev !== '\\') {
      return objString.substring(idx, i);
    }
    i++;
  }

  return objString.substring(idx);
}

// ---- Language inference ----

/**
 * Map an Endpoint codeTab label (e.g. "cURL", "JavaScript", "GraphQL") to a
 * fenced-code language hint for llms-code.txt.
 */
/**
 * Un-escape a code string pulled out of a JSX template literal: the MDX source
 * escapes backticks and `${` so they don't terminate the literal, but the real
 * code uses them literally.
 */
function unescapeTemplateCode(code) {
  return code
    .replace(/\\`/g, '`')
    .replace(/\\\$\{/g, '${');
}

function labelToLanguage(label, code) {
  const l = (label || '').toLowerCase();
  if (l.includes('curl')) return 'bash';
  if (l.includes('graphql')) return 'graphql';
  if (l.includes('typescript') || l === 'ts') return 'typescript';
  if (l.includes('javascript') || l === 'js' || l.includes('node')) return 'javascript';
  if (l.includes('json')) return 'json';
  if (l.includes('python')) return 'python';
  if (l.includes('php')) return 'php';
  if (l.includes('ruby')) return 'ruby';
  // Label is generic (e.g. "Shorthand", "Example") — guess from the code itself.
  return detectLanguageFromCode(code) || 'bash';
}

/**
 * Best-effort language detection from a code body, used when the codeTab label
 * is generic. Conservative: only returns a language on a clear signal.
 */
function detectLanguageFromCode(code) {
  if (!code) return null;
  const c = code.trim();
  // GraphQL query/mutation block.
  if (/^\s*(query|mutation|subscription|fragment)\b/.test(c) || /^\s*\{[\s\S]*\}\s*$/.test(c) && /\b(edges|nodes|node)\b/.test(c)) {
    return 'graphql';
  }
  // JS/TS signals.
  if (/\b(await|const|let|require\(|=>|strapi\.|fetch\(|import\s)/.test(c)) {
    return 'javascript';
  }
  // Shell / curl.
  if (/^\s*(curl|GET|POST|PUT|DELETE|PATCH)\b/.test(c) || /^\s*\$\s/.test(c)) {
    return 'bash';
  }
  // JSON object/array.
  if (/^\s*[{[]/.test(c) && /["}\]]\s*$/.test(c)) {
    return 'json';
  }
  return null;
}

/**
 * Extract code snippets carried by <Endpoint> components in `content`.
 * Each snippet: { language, code, description, variantGroupId, tabLabel }.
 *
 * `codeTabs` entries become request snippets (one per tab, grouped as variants
 * of the same endpoint); `responses` entries become JSON response snippets.
 */
function extractEndpointSnippets(content, sectionTitle) {
  const snippets = [];
  let remaining = content;
  let offset = 0;
  let endpointIndex = 0;

  while (true) {
    const startIdx = remaining.indexOf('<Endpoint', offset);
    if (startIdx === -1) break;

    const extracted = extractJsxBlock(remaining, startIdx, 'Endpoint');
    if (!extracted) { offset = startIdx + 9; continue; }

    const { propsString, fullMatch } = extracted;
    endpointIndex += 1;

    const method = extractStringProp(propsString, 'method') || 'GET';
    const epPath = extractStringProp(propsString, 'path') || '';
    const title = extractStringProp(propsString, 'title') || '';
    const header = `${method} ${epPath}${title ? ' — ' + title : ''}`.trim();
    const variantGroupId = `endpoint:${sectionTitle || ''}:${endpointIndex}`;

    // Request code tabs (cURL / JS / GraphQL ...) — variants of one request.
    const codeTabsRaw = extractArrayProp(propsString, 'codeTabs');
    if (codeTabsRaw) {
      for (const tab of parseSimpleArray(codeTabsRaw)) {
        const label = getObjectField(tab, 'label') || 'Example';
        const code = extractTemplateLiteral(tab, 'code') || getObjectField(tab, 'code') || '';
        if (code.trim()) {
          const cleanCode = unescapeTemplateCode(code.trim());
          snippets.push({
            language: labelToLanguage(label, cleanCode),
            code: cleanCode,
            description: header,
            variantGroupId,
            tabLabel: label,
          });
        }
      }
    }

    // Responses — JSON bodies.
    const responsesRaw = extractArrayProp(propsString, 'responses');
    if (responsesRaw) {
      for (const resp of parseSimpleArray(responsesRaw)) {
        const status = getObjectField(resp, 'status') || '200';
        const statusText = getObjectField(resp, 'statusText') || 'OK';
        const body = extractTemplateLiteral(resp, 'body') || getObjectField(resp, 'body');
        if (body && body.trim()) {
          snippets.push({
            language: 'json',
            code: unescapeTemplateCode(body.trim()),
            description: `${header} — Response ${status} ${statusText}`,
            variantGroupId: `${variantGroupId}:response`,
            tabLabel: `Response ${status}`,
          });
        }
      }
    }

    offset = startIdx + fullMatch.length;
    remaining = remaining; // unchanged; we advance via offset
  }

  return snippets;
}

/**
 * Extract code snippets carried by <ApiCall>/<Request>/<Response> components.
 * The code lives in fenced blocks INSIDE the children of Request/Response, so
 * we surface those fences with a sensible language + description.
 *
 * Each snippet: { language, code, description, variantGroupId, tabLabel }.
 */
function extractApiCallSnippets(content, sectionTitle) {
  const snippets = [];
  let remaining = content;
  let offset = 0;
  let apiCallIndex = 0;

  while (true) {
    const startIdx = remaining.indexOf('<ApiCall', offset);
    if (startIdx === -1) break;

    const extracted = extractJsxBlock(remaining, startIdx, 'ApiCall');
    if (!extracted) { offset = startIdx + 8; continue; }

    const { children, fullMatch } = extracted;
    apiCallIndex += 1;
    const variantGroupId = `apicall:${sectionTitle || ''}:${apiCallIndex}`;

    for (const part of ['Request', 'Response']) {
      const re = new RegExp(`<${part}[^>]*?(?:title=["']([^"']*)["'])?[^>]*>([\\s\\S]*?)<\\/${part}>`, 'g');
      let m;
      while ((m = re.exec(children)) !== null) {
        const partTitle = m[1] || part;
        const inner = m[2] || '';
        // Pull fenced code blocks out of the part's children.
        const fenceRe = /```(\w+)?\n?([\s\S]*?)```/g;
        let f;
        while ((f = fenceRe.exec(inner)) !== null) {
          const lang = f[1] || (part === 'Response' ? 'json' : 'bash');
          const code = (f[2] || '').trim();
          if (code) {
            snippets.push({
              language: lang,
              code,
              description: partTitle,
              variantGroupId: `${variantGroupId}:${part.toLowerCase()}`,
              tabLabel: partTitle,
            });
          }
        }
      }
    }

    offset = startIdx + fullMatch.length;
  }

  return snippets;
}

/**
 * Extract all API-component code snippets (Endpoint + ApiCall) from a page's
 * content, tagged with the section heading they appear under.
 *
 * Returns an array of { language, code, description, section, variantGroupId,
 * tabLabel }.
 */
function extractApiComponentSnippets(content, currentSectionFor) {
  // currentSectionFor(index) → section title for a character offset, or a
  // simpler approach: callers usually pass per-section content already. Here we
  // operate on the whole doc and attach the nearest preceding heading.
  const all = [];

  // Build a quick offset→section map from ## / ### headings.
  const headingRe = /^(#{2,4})\s+(.+?)\s*$/gm;
  const headings = [];
  let hm;
  while ((hm = headingRe.exec(content)) !== null) {
    headings.push({ index: hm.index, title: hm[2].replace(/\{#[^}]+\}/, '').trim() });
  }
  const sectionAt = (idx) => {
    let title = '';
    for (const h of headings) {
      if (h.index <= idx) title = h.title; else break;
    }
    return title;
  };

  // For section tagging we need offsets, so re-scan with offsets here.
  const tagAndPush = (componentName, extractFn) => {
    let offset = 0;
    while (true) {
      const startIdx = content.indexOf(`<${componentName}`, offset);
      if (startIdx === -1) break;
      const block = extractJsxBlock(content, startIdx, componentName);
      if (!block) { offset = startIdx + componentName.length + 1; continue; }
      const section = sectionAt(startIdx);
      const localSnippets = extractFn(block.fullMatch, section);
      for (const s of localSnippets) {
        all.push({ ...s, section });
      }
      offset = startIdx + block.fullMatch.length;
    }
  };

  tagAndPush('Endpoint', (frag, section) => extractEndpointSnippets(frag, section));
  tagAndPush('ApiCall', (frag, section) => extractApiCallSnippets(frag, section));

  return all;
}

module.exports = {
  extractJsxBlock,
  extractStringProp,
  extractArrayProp,
  parseSimpleArray,
  getObjectField,
  extractTemplateLiteral,
  labelToLanguage,
  extractEndpointSnippets,
  extractApiCallSnippets,
  extractApiComponentSnippets,
};
