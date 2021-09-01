const checklinksIgnoredFiles = [
  '**/node_modules', // please never remove this one
  /**
   * Caution: Adding an individual file to this section
   * will prevent the _whole_ file from being scanned for broken links.
   *
   * Currently, there is no easy way to ignore a specific link inside a file.
   */

  /**
   * Files below give false positives
   */
  './developer-docs/latest/concepts/file-structure.md', // contains .md links that should not be treated as links
  './developer-docs/latest/guides/unit-testing.md', // line 190
  './developer-docs/latest/setup-deployment-guides/configurations.md', // line 940
  './developer-docs/latest/developer-resources/content-api/content-api.md', // line 810
  './developer-docs/latest/update-migration-guides/migration-guides/migration-guide-beta.20-to-3.0.0.md', // line 93
];

module.exports = [
  ['vuepress-plugin-element-tabs', {}],
  ['check-md', {
    ignore: checklinksIgnoredFiles,
  }],
  ['seo', {
    siteTitle: (_, $site) => $site.title,
    title: $page => $page.title,
  }],
  ['vuepress-plugin-code-copy', {
    color: '#ffffff',
    successText: 'Copied to clipboard!',
  }],
  ['@vuepress/back-to-top', {}],
  ['vuepress-plugin-container', {
    type: 'callout',
    defaultTitle: ''
  }],
  ['vuepress-plugin-container', {
    type: 'strapi',
    defaultTitle: '',
    before: info => `<div class="custom-block strapi"><p class="custom-block-title">🤓 ${info}</p>`,
    after: '</div>'
  }],
  ['vuepress-plugin-container', {
    type: 'tip',
    before: info => `<div class="custom-block tip"><p class="custom-block-title">💡 ${info}</p>`,
    after: '</div>'
  }],
  ['vuepress-plugin-container', {
    type: 'note',
    before: info => `<div class="custom-block note"><p class="custom-block-title">✏️ ${info}</p>`,
    after: '</div>'
  }],
  ['vuepress-plugin-container', {
    type: 'caution',
    before: info => `<div class="custom-block caution"><p class="custom-block-title">✋ ${info}</p>`,
    after: '</div>'
  }],
  ['vuepress-plugin-container', {
    type: 'warning',
    before: info => `<div class="custom-block warning"><p class="custom-block-title">⚠️  ${info}</p>`,
    after: '</div>'
  }],
  ['vuepress-plugin-container', {
    type: 'prerequisites',
    defaultTitle: 'PREREQUISITES'
  }],
  ['vuepress-plugin-container', {
    type: 'api-call',
    defaultTitle: ''
  }],
  ['vuepress-plugin-container', {
    type: 'request',
    defaultTitle: 'Request'
  }],
  ['vuepress-plugin-container', {
    type: 'response',
    defaultTitle: 'Response'
  }]
];
