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
