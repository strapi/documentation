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

/** Temp docs dir with two Cloud pages and a sidebar using a generated index. */
async function generatedIndexFixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'llms-index-'));
  const docsDir = path.join(root, 'docs');
  await fs.outputFile(
    path.join(docsDir, 'cloud/account/account-settings.md'),
    '---\ntitle: Profile settings\ndescription: Manage your profile.\n---\n\n# Profile settings\n\nBody.',
  );
  await fs.outputFile(
    path.join(docsDir, 'cloud/account/account-billing.md'),
    '---\ntitle: Account billing\ndescription: Read your invoices.\n---\n\n# Account billing\n\nBody.',
  );
  const sidebarPath = path.join(root, 'sidebars.js');
  await fs.outputFile(
    sidebarPath,
    `module.exports = { cloudSidebar: [{
      type: 'category',
      label: 'Account management',
      link: { type: 'generated-index', slug: '/cloud/account' },
      items: [
        'cloud/account/account-settings',
        { type: 'doc', id: 'cloud/account/account-billing', label: 'Account billing & invoices' },
      ],
    }] };`,
  );
  return { root, docsDir, sidebarPath };
}

test('generated-index categories become pages listing their children', async () => {
  const { root, docsDir, sidebarPath } = await generatedIndexFixture();
  try {
    const generator = new DocusaurusLlmsGenerator({ baseUrl: BASE, docsDir, sidebarPath });
    const pages = await generator.extractAllPages();
    const index = pages.find((p) => p.url === `${BASE}/cloud/account`);

    assert.ok(index, 'the generated index is emitted as a page');
    assert.equal(index.title, 'Account management');
    assert.equal(index.generatedIndex, true);
    assert.equal(
      index.content,
      [
        'This page is an index with no content of its own. The Account management section contains the following pages:',
        '',
        `- [Profile settings](${BASE}/cloud/account/account-settings.md): Manage your profile.`,
        `- [Account billing & invoices](${BASE}/cloud/account/account-billing.md): Read your invoices.`,
      ].join('\n'),
    );

    assert.ok(generator.generateLlmsTxt(pages).includes(`- [Account management](${BASE}/cloud/account.md)`));
    assert.ok(!generator.generateLlmsFullTxt(pages).includes('# Account management'));
  } finally {
    await fs.remove(root);
  }
});
