const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const DocusaurusLlmsGenerator = require('./generate-llms');

const BASE = 'https://docs.strapi.io';
const PAGES = [
  {
    title: 'REST API',
    url: `${BASE}/cms/api/rest`,
    description: 'Query content over HTTP.',
    content: '# REST API\n\nBody.',
  },
];

test('llms.txt follows the llmstxt.org layout with when-to-use guidance', () => {
  const generator = new DocusaurusLlmsGenerator({ baseUrl: BASE, siteName: 'Strapi Documentation' });
  const txt = generator.generateLlmsTxt(PAGES);
  const lines = txt.split('\n');

  assert.equal(lines[0], '# Strapi Documentation');
  assert.ok(lines[2].startsWith('> '), 'blockquote right after the H1');

  const h2 = lines.filter((l) => l.startsWith('## '));
  assert.deepEqual(h2, [
    '## When to use this documentation',
    '## How to access this documentation',
    '## Pages',
  ]);
  assert.ok(txt.includes('https://strapi-docs.mcp.kapa.ai'));
  assert.ok(txt.includes('Accept: text/markdown'));
  assert.ok(txt.endsWith(`- [REST API](${BASE}/cms/api/rest.md): Query content over HTTP.`));
});

test('build output gets an index.md twin for the homepage', async () => {
  const outDir = path.join(await fs.mkdtemp(path.join(os.tmpdir(), 'llms-')), 'build');
  try {
    const generator = new DocusaurusLlmsGenerator({ baseUrl: BASE, outputDir: outDir });
    const llmsTxt = generator.generateLlmsTxt(PAGES);
    const count = await generator.writePerPageMarkdown(PAGES, llmsTxt);

    assert.equal(count, 2);
    assert.equal(await fs.readFile(path.join(outDir, 'index.md'), 'utf-8'), `${llmsTxt}\n`);
    assert.ok(await fs.pathExists(path.join(outDir, 'cms/api/rest.md')));
  } finally {
    await fs.remove(path.dirname(outDir));
  }
});
