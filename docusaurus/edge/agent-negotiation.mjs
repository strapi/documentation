/**
 * Markdown content negotiation for agents, run from the Vercel middleware.
 *
 * Every docs page has a Markdown twin next to its HTML (`/cms/intro` →
 * `/cms/intro.md`, the homepage → `/index.md`), written at build time by
 * scripts/generate-llms.js. A request whose Accept header prefers
 * `text/markdown` over `text/html` gets that twin from the page URL itself,
 * with `Content-Type: text/markdown` and `Vary: Accept`. A path with neither a
 * Markdown twin nor an HTML page gets a 404 with a Markdown body that points
 * to the agent entry points. Anything else falls through to the static site.
 */

/** q-value the Accept header gives to `type`, or 0 when it is not accepted. */
function qualityOf(accept, type) {
  const [major] = type.split('/');
  let best = 0;
  let bestSpecificity = -1;

  for (const range of accept.split(',')) {
    const [rawMedia, ...params] = range.trim().split(';');
    const media = rawMedia.trim().toLowerCase();
    let specificity;
    if (media === type) specificity = 2;
    else if (media === `${major}/*`) specificity = 1;
    else if (media === '*/*') specificity = 0;
    else continue;

    let q = 1;
    for (const param of params) {
      const [key, value] = param.trim().split('=');
      if (key.trim().toLowerCase() === 'q') q = Number.parseFloat(value);
    }
    if (Number.isNaN(q)) q = 0;

    // The most specific matching range sets the quality (RFC 9110, 12.5.1).
    if (specificity > bestSpecificity) {
      bestSpecificity = specificity;
      best = q;
    }
  }
  return best;
}

/**
 * Whether the client asks for `text/markdown` explicitly and ranks it above
 * `text/html`. Wildcards alone never select Markdown, so browsers and
 * `Accept: *\/*` clients keep getting HTML.
 */
export function prefersMarkdown(accept) {
  if (!accept || !/text\/markdown/i.test(accept)) return false;
  const markdown = qualityOf(accept, 'text/markdown');
  return markdown > 0 && markdown > qualityOf(accept, 'text/html');
}

/**
 * Path of the Markdown twin for a page path, or null for paths that already
 * name a file (`/llms.txt`, `/cms/intro.md`, `/img/logo.png`).
 */
export function markdownPathFor(pathname) {
  const trimmed = pathname.replace(/\/+$/, '');
  if (trimmed === '' || trimmed === '/index') return '/index.md';
  const lastSegment = trimmed.slice(trimmed.lastIndexOf('/') + 1);
  if (lastSegment.includes('.')) return null;
  return `${trimmed}.md`;
}

/** Markdown body served with a 404 to clients that asked for Markdown. */
export function notFoundMarkdown(pathname, origin) {
  const shownPath = pathname.replace(/`/g, '');
  return [
    '# Page not found',
    '',
    `No page exists at \`${shownPath}\` on the Strapi documentation.`,
    '',
    'Find the page you need from one of these entry points:',
    '',
    `- [llms.txt](${origin}/llms.txt): index of every documentation page, with a one-line summary and a link to its Markdown version`,
    `- [llms-full.txt](${origin}/llms-full.txt): the full documentation as a single Markdown file`,
    `- [Sitemap](${origin}/sitemap.xml): every page URL`,
    `- [Documentation home](${origin}/): start page of the Strapi 5 documentation`,
    '',
    'Every page is also available as Markdown: append `.md` to its URL, or request it with `Accept: text/markdown`.',
    '',
  ].join('\n');
}

// CloudFront in front of docs.strapi.io keys its cache on the URL only, not on
// Accept, so a cached Markdown response would be served to browsers. Markdown
// answers to a page URL must therefore never be stored by a shared cache.
const MARKDOWN_HEADERS = {
  'content-type': 'text/markdown; charset=utf-8',
  vary: 'Accept, Accept-Encoding',
  'cache-control': 'private, no-store',
};

/**
 * Response for an agent that prefers Markdown, or undefined to let the static
 * site answer. Never throws: a failed subrequest falls back to the HTML site.
 */
export async function negotiateMarkdown(request, fetchImpl = fetch) {
  try {
    if (request.method !== 'GET') return undefined;
    if (!prefersMarkdown(request.headers.get('accept'))) return undefined;

    const url = new URL(request.url);
    const markdownPath = markdownPathFor(url.pathname);
    if (!markdownPath) return undefined;

    const twin = await fetchImpl(new URL(markdownPath, url.origin), {
      headers: { accept: 'text/markdown' },
    });
    if (twin.ok) {
      const headers = new Headers(MARKDOWN_HEADERS);
      headers.set('link', `<${url.origin}${url.pathname}>; rel="alternate"; type="text/html"`);
      return new Response(twin.body, { status: 200, headers });
    }
    if (twin.status !== 404) return undefined;

    // No Markdown twin: pages such as /search exist only as HTML, so check
    // the page itself before calling the path missing.
    const page = await fetchImpl(new URL(url.pathname, url.origin), {
      method: 'HEAD',
      headers: { accept: 'text/html' },
    });
    if (page.status !== 404) return undefined;

    return new Response(notFoundMarkdown(url.pathname, url.origin), {
      status: 404,
      headers: MARKDOWN_HEADERS,
    });
  } catch {
    return undefined;
  }
}
