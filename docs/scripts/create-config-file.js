'use strict';

const path = require('path');
const fs = require('fs-extra');
// const sidebar = require('../.vuepress/sidebar');

const createConfigFile = async () => {
  const sidebar = await fs.readFile(path.resolve(__dirname, '..', '.vuepress', 'sidebar.js'));

  const content = `
${sidebar.toString()}
  
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
  '/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md',
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
        \`<div class="custom-block strapi"><p class="custom-block-title">🤓 \${info}</p>\`,
      after: '</div>',
    },
  ],
  [
    'vuepress-plugin-container',
    {
      type: 'tip',
      before: info => \`<div class="custom-block tip"><p class="custom-block-title">💡 \${info}</p>\`,
      after: '</div>',
    },
  ],
  [
    'vuepress-plugin-container',
    {
      type: 'note',
      before: info => \`<div class="custom-block note"><p class="custom-block-title">✏️ \${info}</p>\`,
      after: '</div>',
    },
  ],
  [
    'vuepress-plugin-container',
    {
      type: 'caution',
      before: info =>
        \`<div class="custom-block caution"><p class="custom-block-title">✋ \${info}</p>\`,
      after: '</div>',
    },
  ],
  [
    'vuepress-plugin-container',
    {
      type: 'warning',
      before: info =>
        \`<div class="custom-block warning"><p class="custom-block-title">️❗️ \${info}</p>\`,
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

module.exports = {
  title: '',
  port: 8080,
  description: 'The headless CMS developers love.',
  base: '/',
  plugins: plugins,
  head: [
    [
      'link',
      {
        rel: 'icon',
        href: 'https://strapi.io/assets/favicon-32x32.png',
      },
    ],
    [
      'meta',
      {
        property: 'og:title',
        content: 'Strapi Documentation',
      },
    ],
    [
      'meta',
      {
        property: 'og:type',
        content: 'article',
      },
    ],
    [
      'meta',
      {
        property: 'og:url',
        content: 'https://strapi.io/documentation/',
      },
    ],
    [
      'meta',
      {
        property: 'og:description',
        content: 'The headless CMS developers love.',
      },
    ],
    [
      'meta',
      {
        property: 'og:image',
        content: 'https://strapi.io/documentation/assets/meta.png',
      },
    ],
    [
      'meta',
      {
        property: 'og:article:author',
        content: 'strapi',
      },
    ],

    [
      'meta',
      {
        property: 'twitter:card',
        content: 'summary_large_image',
      },
    ],
    [
      'meta',
      {
        property: 'twitter:url',
        content: 'https://strapi.io/documentation/',
      },
    ],
    [
      'meta',
      {
        property: 'twitter:site',
        content: '@strapijs',
      },
    ],
    [
      'meta',
      {
        property: 'twitter:title',
        content: 'Strapi Documentation',
      },
    ],
    [
      'meta',
      {
        property: 'twitter:description',
        content: 'The headless CMS developers love.',
      },
    ],
    [
      'meta',
      {
        property: 'twitter:image',
        content: 'http://strapi.io/assets/images/strapi-website-preview.png',
      },
    ],
    [
      'script',
      {},
      \`(function(w, d, s, l, i) {
  w[l] = w[l] || [];
  w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  var f = d.getElementsByTagName(s)[0],
    j = d.createElement(s),
    dl = l != 'dataLayer' ? '&l=' + l : '';
  j.async = true;
  j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
  f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', 'GTM-KN9JRWG');
\`,
    ],
  ],
  themeConfig: {
    logo: '/assets/logo.png',
    nav: [
      {
        text: 'Resource Center',
        link: 'https://strapi.io/resource-center',
      },
      {
        text: 'v4 Documentation',
        items: [
          {
            text: 'Developer Docs',
            items: [
              {
                text: 'Getting Started',
                link: '/developer-docs/latest/getting-started/introduction.html',
              },
              {
                text: 'Setup & Deployment',
                link: '/developer-docs/latest/setup-deployment-guides/installation.html',
              },
              {
                text: 'Plugins',
                link: '/developer-docs/latest/plugins/plugins-intro.html',
              },
              {
                text: 'Development',
                link: '/developer-docs/latest/development/backend-customization.html',
              },
              {
                text: 'Update & Migration',
                link: '/developer-docs/latest/update-migration-guides/update-version.html',
              },
              {
                text: 'Developer Resources',
                link: '/developer-docs/latest/developer-resources/content-api/content-api.html',
              },
            ],
          },
          {
            text: 'User Guide',
            items: [
              {
                text: 'Getting Started',
                link: '/user-docs/latest/getting-started/introduction.html',
              },
              {
                text: 'Content Manager',
                link: '/user-docs/latest/content-manager/introduction-to-content-manager.html',
              },
              {
                text: 'Content-Type Builder',
                link:
                  '/user-docs/latest/content-types-builder/introduction-to-content-types-builder.html',
              },
              {
                text: 'Users, Roles, and Permissions',
                link:
                  '/user-docs/latest/users-roles-permissions/introduction-to-users-roles-permissions.html',
              },
              {
                text: 'Plugins',
                link: '/user-docs/latest/plugins/introduction-to-plugins.html',
              },
              {
                text: 'General Settings',
                link: '/user-docs/latest/settings/managing-global-settings.html',
              },
            ],
          },
        ],
      },
      {
        text: 'v3 documentation',
        link: 'https://docs-v3.strapi.io'
      },
      {
        text: 'Ecosystem',
        items: [
          {
            text: 'Strapi',
            items: [
              {
                text: 'Website',
                link: 'https://strapi.io',
              },
              {
                text: 'Blog',
                link: 'https://strapi.io/blog',
              },
              {
                text: 'StrapiConf 2021',
                link: 'https://www.strapi.io/strapi-conf-2021',
              },
            ],
          },
          {
            text: 'Community',
            items: [
              {
                text: 'Forum',
                link: 'https://forum.strapi.io',
              },
              {
                text: 'Discord',
                link: 'https://discord.strapi.io',
              },
              {
                text: 'Awesome-Strapi',
                link: 'https://github.com/strapi/awesome-strapi',
              },
            ],
          },
          {
            text: 'Resources',
            items: [
              {
                text: 'Tutorials',
                link: 'https://strapi.io/tutorials',
              },
              {
                text: 'Academy',
                link: 'https://academy.strapi.io/',
              },
            ],
          },
        ],
      },
      {
        text: "We're hiring!",
        link: 'https://strapi.io/careers#open-positions',
      },
    ],
    repo: 'strapi/documentation',
    docsDir: 'docs',
    docsBranch: 'main',
    algolia: {
      appId: '9FTY6J9E4X',
      apiKey: 'cf49c82a1865df2618a3d89e18657051',
      indexName: 'documentation',
    },
    editLinks: true,
    editLinkText: 'Improve this page',
    serviceWorker: true,
    sidebarDepth: 1,
    smoothScroll: false,
    sidebar: {
      '/developer-docs/latest/': sidebar.developer,
      '/user-docs/latest/': sidebar.user,
    },
  },
  markdown: {
    extendMarkdown: md => {
      // use more markdown-it plugins!
      md.use(require('markdown-it-include'));
    },
  },
};
  `;

  const destination = path.resolve(__dirname, '..', '.vuepress', 'config.js');

  await fs.writeFile(destination, content);
};

createConfigFile();
