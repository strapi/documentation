const sidebar = require('./sidebar.js');
const plugins = require('./plugins.js');

const checkLegacy = () => {
  if (process.env.DEPLOY_ENV == 'legacy') {
    return '/documentation/';
  } else {
    return '/';
  }
};

module.exports = {
  title: '',
  port: 8080,
  description: 'The headless CMS developers love.',
  base: checkLegacy(),
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
      `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src= 'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f); })(window,document,'script','dataLayer','GTM-KN9JRWG');`,
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
        text: 'Documentation',
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
                text: 'Content-Types Builder',
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
                text: 'Slack',
                link: 'https://slack.strapi.io',
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
    ],
    repo: 'strapi/documentation',
    docsDir: 'docs',
    docsBranch: 'main',
    algolia: {
      apiKey: 'a93451de224096fb34471c8b8b049de7',
      indexName: 'strapi',
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
      md.use(require('markdown-it-include'))
    }
  }
};
