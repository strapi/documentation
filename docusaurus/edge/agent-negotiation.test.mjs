import test from 'node:test';
import assert from 'node:assert/strict';
import {
  prefersMarkdown,
  markdownPathFor,
  notFoundMarkdown,
  negotiateMarkdown,
} from './agent-negotiation.mjs';

const ORIGIN = 'https://docs.strapi.io';

/** Fake fetch that serves the given path → status map and records calls. */
function fakeFetch(routes) {
  const calls = [];
  const impl = async (url, init = {}) => {
    const { pathname } = new URL(url);
    calls.push({ pathname, method: init.method || 'GET' });
    const status = routes[pathname] ?? 404;
    const body = status === 200 && init.method !== 'HEAD' ? `# body of ${pathname}` : null;
    return new Response(body, { status, headers: { 'cache-control': 'public, max-age=0, must-revalidate' } });
  };
  impl.calls = calls;
  return impl;
}

function get(path, accept) {
  return new Request(`${ORIGIN}${path}`, { headers: accept ? { accept } : {} });
}

test('prefersMarkdown: explicit text/markdown wins', () => {
  assert.equal(prefersMarkdown('text/markdown'), true);
  assert.equal(prefersMarkdown('text/markdown, text/html;q=0.5'), true);
  assert.equal(prefersMarkdown('text/markdown;q=0.9, */*;q=0.1'), true);
});

test('prefersMarkdown: browsers and wildcards keep HTML', () => {
  assert.equal(prefersMarkdown(null), false);
  assert.equal(prefersMarkdown('*/*'), false);
  assert.equal(prefersMarkdown('text/html'), false);
  assert.equal(
    prefersMarkdown('text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'),
    false,
  );
  assert.equal(prefersMarkdown('text/html, text/markdown'), false);
  assert.equal(prefersMarkdown('text/html;q=0.9, text/markdown;q=0.5'), false);
  assert.equal(prefersMarkdown('text/markdown;q=0'), false);
});

test('markdownPathFor maps pages to their Markdown twin', () => {
  assert.equal(markdownPathFor('/'), '/index.md');
  assert.equal(markdownPathFor(''), '/index.md');
  assert.equal(markdownPathFor('/cms/intro'), '/cms/intro.md');
  assert.equal(markdownPathFor('/cms/intro/'), '/cms/intro.md');
  assert.equal(markdownPathFor('/cms/intro.md'), null);
  assert.equal(markdownPathFor('/llms.txt'), null);
  assert.equal(markdownPathFor('/img/logo.png'), null);
});

test('notFoundMarkdown explains the error and links to llms.txt', () => {
  const body = notFoundMarkdown('/nope', ORIGIN);
  assert.match(body, /^# Page not found/);
  assert.ok(body.includes(`${ORIGIN}/llms.txt`));
  assert.ok(body.includes(`${ORIGIN}/sitemap.xml`));
  assert.ok(body.length >= 20);
  assert.ok(!notFoundMarkdown('/a`b', ORIGIN).includes('a`b'));
});

test('homepage with Accept: text/markdown returns index.md with Vary: Accept', async () => {
  const fetchImpl = fakeFetch({ '/index.md': 200 });
  const res = await negotiateMarkdown(get('/', 'text/markdown'), fetchImpl);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'text/markdown; charset=utf-8');
  assert.equal(res.headers.get('vary'), 'Accept, Accept-Encoding');
  assert.equal(res.headers.get('cache-control'), 'public, max-age=0, must-revalidate');
  assert.equal(await res.text(), '# body of /index.md');
});

test('doc page with Accept: text/markdown returns its .md twin', async () => {
  const fetchImpl = fakeFetch({ '/cms/intro.md': 200 });
  const res = await negotiateMarkdown(get('/cms/intro/', 'text/markdown'), fetchImpl);
  assert.equal(res.status, 200);
  assert.equal(await res.text(), '# body of /cms/intro.md');
  assert.equal(res.headers.get('link'), `<${ORIGIN}/cms/intro/>; rel="alternate"; type="text/html"`);
});

test('missing path with Accept: text/markdown returns a Markdown 404', async () => {
  const fetchImpl = fakeFetch({});
  const res = await negotiateMarkdown(get('/does-not-exist', 'text/markdown'), fetchImpl);
  assert.equal(res.status, 404);
  assert.equal(res.headers.get('content-type'), 'text/markdown; charset=utf-8');
  assert.equal(res.headers.get('vary'), 'Accept, Accept-Encoding');
  assert.match(await res.text(), /llms\.txt/);
  assert.deepEqual(fetchImpl.calls.map((c) => `${c.method} ${c.pathname}`), [
    'GET /does-not-exist.md',
    'HEAD /does-not-exist',
  ]);
});

test('HTML-only page without a twin falls through to HTML', async () => {
  const fetchImpl = fakeFetch({ '/search': 200 });
  const res = await negotiateMarkdown(get('/search', 'text/markdown'), fetchImpl);
  assert.equal(res, undefined);
});

test('HTML requests are untouched and trigger no subrequest', async () => {
  const fetchImpl = fakeFetch({ '/index.md': 200 });
  assert.equal(await negotiateMarkdown(get('/', 'text/html'), fetchImpl), undefined);
  assert.equal(await negotiateMarkdown(get('/', null), fetchImpl), undefined);
  assert.equal(fetchImpl.calls.length, 0);
});

test('file paths and non-GET requests are untouched', async () => {
  const fetchImpl = fakeFetch({});
  assert.equal(await negotiateMarkdown(get('/cms/intro.md', 'text/markdown'), fetchImpl), undefined);
  const head = new Request(`${ORIGIN}/`, { method: 'HEAD', headers: { accept: 'text/markdown' } });
  assert.equal(await negotiateMarkdown(head, fetchImpl), undefined);
  assert.equal(fetchImpl.calls.length, 0);
});

test('upstream errors fall back to the static site', async () => {
  const failing = async () => { throw new Error('network'); };
  assert.equal(await negotiateMarkdown(get('/', 'text/markdown'), failing), undefined);
  const serverError = fakeFetch({ '/index.md': 500 });
  assert.equal(await negotiateMarkdown(get('/', 'text/markdown'), serverError), undefined);
});
