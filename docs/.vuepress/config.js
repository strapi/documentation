const sidebar = {
  developer: [
    {
      collapsable: false,
      title: '🚀 Getting Started',
      children: [
        ['/developer-docs/latest/getting-started/introduction', 'Introduction'],
        ['/developer-docs/latest/getting-started/quick-start', 'Quick Start Guide'],
        ['/developer-docs/latest/getting-started/troubleshooting', 'Frequently Asked Questions'],
        ['/developer-docs/latest/getting-started/usage-information', 'Usage Information'],
      ],
    },
    {
      collapsable: false,
      title: '⚙️ Setup & Deployment',
      children: [
        ['/developer-docs/latest/setup-deployment-guides/installation.md', 'Installation'],
        ['/developer-docs/latest/setup-deployment-guides/file-structure.md', 'Project structure'],
        ['/developer-docs/latest/setup-deployment-guides/configurations.md', 'Configurations'],
        ['/developer-docs/latest/setup-deployment-guides/deployment.md', 'Deployment'],
      ],
    },
    {
      collapsable: false,
      title: '🔧 Development',
      children: [
        ['/developer-docs/latest/development/backend-customization.md', 'Backend customization'],
        ['/developer-docs/latest/development/admin-customization.md', 'Admin panel customization'],
        ['/developer-docs/latest/development/plugin-customization.md', 'Strapi plugins'],
        ['/developer-docs/latest/development/local-plugins-customization.md', 'Local plugins'],
      ],
    },
    {
      collapsable: false,
      title: '♻️ Update & Migration',
      children: [
        ['/developer-docs/latest/update-migration-guides/update-version.md', 'Update'],
        ['/developer-docs/latest/update-migration-guides/migration-guides.md', 'Migration'],
      ],
    },
    {
      collapsable: false,
      title: '💻 Developer Resources',
      children: [
        ['/developer-docs/latest/developer-resources/content-api/content-api.md', 'Content API'],
        ['/developer-docs/latest/developer-resources/content-api/integrations.md', 'Integrations'],
        ['/developer-docs/latest/developer-resources/cli/CLI', 'Command Line Interface'],
        [
          '/developer-docs/latest/developer-resources/global-strapi/api-reference',
          'Global Strapi API Reference',
        ],
      ],
    },
    {
      collapsable: true,
      title: '📚 Guides',
      children: [
        ['/developer-docs/latest/guides/api-token', 'API tokens'],
        ['/developer-docs/latest/guides/auth-request', 'Authenticated request'],
        ['/developer-docs/latest/guides/count-graphql', 'Count with GraphQL'],
        ['/developer-docs/latest/guides/slug', 'Create a slug system'],
        ['/developer-docs/latest/guides/is-owner', 'Create is owner policy'],
        ['/developer-docs/latest/guides/custom-admin', 'Custom admin'],
        ['/developer-docs/latest/guides/custom-data-response', 'Custom data response'],
        ['/developer-docs/latest/guides/draft', 'Draft system'],
        ['/developer-docs/latest/guides/error-catching', 'Error catching'],
        ['/developer-docs/latest/guides/external-data', 'Fetching external data'],
        ['/developer-docs/latest/guides/jwt-validation', 'JWT validation'],
        ['/developer-docs/latest/guides/process-manager', 'Process manager'],
        ['/developer-docs/latest/guides/scheduled-publication', 'Scheduled publication'],
        ['/developer-docs/latest/guides/secure-your-app', 'Secure your application'],
        ['/developer-docs/latest/guides/send-email', 'Send email programmatically'],
        [
          '/developer-docs/latest/guides/registering-a-field-in-admin',
          'Registering a new field in the admin panel',
        ],
        ['/developer-docs/latest/guides/client', 'Setup a third party client'],
        ['/developer-docs/latest/guides/unit-testing', 'Unit testing'],
      ],
    },
  ],
  user: [
    {
      collapsable: false,
      title: '',
      children: [
        ['/user-docs/latest/getting-started/introduction', 'Welcome to the Strapi user guide!'],
      ],
    },
    {
      collapsable: false,
      title: 'Content Manager',
      children: [
        [
          '/user-docs/latest/content-manager/introduction-to-content-manager',
          'Introduction to the Content Manager',
        ],
        [
          '/user-docs/latest/content-manager/configuring-view-of-content-type',
          'Configuring the views of a content type',
        ],
        ['/user-docs/latest/content-manager/writing-content', 'Writing content'],
        [
          '/user-docs/latest/content-manager/managing-relational-fields',
          'Managing relational fields',
        ],
        [
          '/user-docs/latest/content-manager/saving-and-publishing-content',
          'Saving, publishing and deleting content',
        ],
      ],
    },
    {
      collapsable: false,
      title: 'Content-Types Builder',
      children: [
        [
          '/user-docs/latest/content-types-builder/introduction-to-content-types-builder',
          'Introduction to the Content-Types Builder',
        ],
        [
          '/user-docs/latest/content-types-builder/creating-new-content-type',
          'Creating content types',
        ],
        [
          '/user-docs/latest/content-types-builder/saving-editing-deleting-content-type',
          'Saving and deleting content types',
        ],
      ],
    },
    {
      collapsable: false,
      title: 'Users, Roles & Permissions',
      children: [
        [
          '/user-docs/latest/users-roles-permissions/introduction-to-users-roles-permissions',
          'Introduction to users, roles & permissions',
        ],
      ],
    },
    {
      collapsable: false,
      title: 'Plugins',
      children: [['/user-docs/latest/plugins/introduction-to-plugins', 'Introduction to plugins']],
    },
    {
      collapsable: false,
      title: 'General settings',
      children: [['/user-docs/latest/settings/managing-global-settings', 'Managing global settings']],
    },
  ],
};

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

module.exports = {
  title: '',
  port: 8080,
  description: 'The headless CMS developers love.',
  base: '/documentation/',
  plugins: {
    '@vuepress/medium-zoom': {},
    'vuepress-plugin-element-tabs': {},
    '@vuepress/google-analytics': {
      ga: 'UA-54313258-1',
    },
    'check-md': {
      ignore: checklinksIgnoredFiles,
    },
    seo: {
      siteTitle: (_, $site) => $site.title,
      title: $page => $page.title,
    },
  },
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
  ],
  themeConfig: {
    logo: '/assets/logo.png',
    nav: [
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
                link: '/user-docs/latest/settings/managing-global-settings.html'
              }
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
};
