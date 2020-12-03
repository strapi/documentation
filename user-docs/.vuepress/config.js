module.exports = {
  title: null,
  description: 'The headless CMS developers love.',
  base: '/user-docs/',
  plugins: [
    '@vuepress/medium-zoom',
    'vuepress-plugin-element-tabs',
    [
      '@vuepress/google-analytics',
      {
        ga: 'UA-54313258-1',
      },
    ],
  ],
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
        content: 'Strapi User Documentation',
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
        content: 'https://strapi.io/user-docs/',
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
        content: 'https://strapi.io/user-docs/assets/meta.png',
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
        content: 'https://strapi.io/user-docs/',
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
        content: 'Strapi User Documentation',
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
  ],
  themeConfig: {
    logo: '/assets/logo.png',
    nav: [
      {
        text: 'Versions',
        items: [
          {
            text: 'Version Latest',
            link: '/latest/',
          },
        ],
      },
      {
        text: 'Website',
        link: 'https://strapi.io',
      },
      {
        text: 'Forum',
        link: 'https://forum.strapi.io',
      },
      {
        text: 'Slack',
        link: 'https://slack.strapi.io',
      },
      {
        text: 'Blog',
        link: 'https://strapi.io/blog',
      },
      {
        text: 'Tutorials',
        link: 'https://strapi.io/tutorials',
      },
    ],
    repo: 'strapi/documentation',
    docsDir: 'user-docs',
    docsBranch: 'documentation',
    algolia: {
      apiKey: 'a93451de224096fb34471c8b8b049de7',
      indexName: 'strapi',
    },
    editLinks: true,
    editLinkText: 'Improve this page',
    serviceWorker: true,
    sidebarDepth: 2,
    sidebar: {
      '/latest/': [
        {
          collapsable: false,
          title: '',
          children: [
            ['/latest/getting-started/introduction', 'Welcome to the Strapi user guide!'],
          ],
        },
        {
          collapsable: false,
          title: 'Content Manager',
          children: [
            ['/latest/content-manager/introduction-to-content-manager', 'Introduction to the Content Manager'],
            ['/latest/content-manager/configuring-view-of-content-type', 'Configuring the view of a content type'],
            ['/latest/content-manager/writing-content', 'Writing content'],
            ['/latest/content-manager/saving-and-publishing-content', 'Saving, publishing and deleting content'],
          ],
        },
        {
          collapsable: false,
          title: 'Content-Types Builder',
          children: [

          ],
        },
        {
          collapsable: false,
          title: 'Users, roles & permissions',
          children: [

          ],
        },
        {
          collapsable: false,
          title: 'Plugins',
          children: [

          ],
        },
        {
          collapsable: false,
          title: 'Settings',
          children: [

          ],
        },
      ],
    }
  },
};
