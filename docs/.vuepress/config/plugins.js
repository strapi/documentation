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
  './developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md',
  './developer-docs/latest/developer-resources/database-apis-reference/entity-service/filter.md',
  './developer-docs/latest/development/backend-customization/models.md',
  './developer-docs/latest/guides/count-graphql.md', // might be removed once GraphQL customization is ready
  './developer-docs/latest/setup-deployment-guides/configurations.md', // the script thinks filename[]() at line 977 is a real link
  './developer-docs/latest/development/backend-customization/webhooks.md', // 'missing" links are in commented part of file
];

const plugins = [
  ['vuepress-plugin-element-tabs', {}],
  [
    'check-md',
    {
      ignore: checklinksIgnoredFiles,
    },
  ],
  [
    'seo',
    {
      siteTitle: (_, $site) => $site.title,
      title: $page => $page.title,
    },
  ],
  ['@vuepress/medium-zoom'],
  [
    'vuepress-plugin-code-copy',
    {
      color: '#ffffff',
      successText: 'Copied to clipboard!',
    },
  ],
  ['@vuepress/back-to-top', {}],
  [
    'vuepress-plugin-container',
    {
      type: 'callout',
      defaultTitle: '',
    },
  ],
  [
    'vuepress-plugin-container',
    {
      type: 'strapi',
      defaultTitle: '',
      before: info =>
        `<div class="custom-block strapi"><p class="custom-block-title">🤓 ${info}</p>`,
      after: '</div>',
    },
  ],
  [
    'vuepress-plugin-container',
    {
      type: 'tip',
      before: info => `<div class="custom-block tip"><p class="custom-block-title">💡 ${info}</p>`,
      after: '</div>',
    },
  ],
  [
    'vuepress-plugin-container',
    {
      type: 'note',
      before: info => `<div class="custom-block note"><p class="custom-block-title">✏️ ${info}</p>`,
      after: '</div>',
    },
  ],
  [
    'vuepress-plugin-container',
    {
      type: 'caution',
      before: info =>
        `<div class="custom-block caution"><p class="custom-block-title">✋ ${info}</p>`,
      after: '</div>',
    },
  ],
  [
    'vuepress-plugin-container',
    {
      type: 'warning',
      before: info =>
        `<div class="custom-block warning"><p class="custom-block-title">️❗️ ${info}</p>`,
      after: '</div>',
    },
  ],
  [
    'vuepress-plugin-container',
    {
      type: 'prerequisites',
      defaultTitle: 'PREREQUISITES',
    },
  ],
  [
    'vuepress-plugin-container',
    {
      type: 'api-call',
      defaultTitle: '',
    },
  ],
  [
    'vuepress-plugin-container',
    {
      type: 'request',
      defaultTitle: 'Request',
    },
  ],
  [
    'vuepress-plugin-container',
    {
      type: 'response',
      defaultTitle: 'Response',
    },
  ],
];
