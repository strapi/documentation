/**
 * This file is the backyup the old config.js one.
 * @Piwi & @DerrickMehaffy I'll let you decide if you want to keep it.
 */

const sidebar = {
  developer: [
    {
      title: '🚀 Getting Started',
      collapsable: false,
      children: [
        ['/developer-docs/latest/getting-started/introduction', 'Introduction'],
        ['/developer-docs/latest/getting-started/quick-start', 'Quick Start Guide'],
        ['/developer-docs/latest/getting-started/troubleshooting', 'Frequently Asked Questions'],
        ['/developer-docs/latest/getting-started/usage-information', 'Usage Information'],
      ],
    },
    {
      title: '⚙️ Setup & Deployment',
      collapsable: false,
      sidebarDepth: 0,
      initialOpenGroupIndex: -1, // make sure that no subgroup is expanded by default
      children: [
        {
          title: 'Installation',
          path: '/developer-docs/latest/setup-deployment-guides/installation.html',
          collapsable: true,
          sidebarDepth: 1,
          children: [
            ['/developer-docs/latest/setup-deployment-guides/installation/cli.md', 'CLI'],
            ['/developer-docs/latest/setup-deployment-guides/installation/docker.md', 'Docker'],
            [
              '/developer-docs/latest/setup-deployment-guides/installation/digitalocean-one-click.md',
              'DigitalOcean One-Click',
            ],
            [
              '/developer-docs/latest/setup-deployment-guides/installation/platformsh.md',
              'Platform.sh One-Click',
            ],
            [
              '/developer-docs/latest/setup-deployment-guides/installation/render.md',
              'Render One-Click',
            ],
          ],
        },
        ['/developer-docs/latest/setup-deployment-guides/file-structure.md', 'Project structure'],
        {
          title: 'Configurations',
          path: '/developer-docs/latest/setup-deployment-guides/configurations.html',
          collapsable: true,
          children: [
            {
              title: 'Required configurations',
              collapsable: true,
              children: [
                [
                  '/developer-docs/latest/setup-deployment-guides/configurations/required/databases.md',
                  'Database',
                ],
                [
                  '/developer-docs/latest/setup-deployment-guides/configurations/required/server.md',
                  'Server',
                ],
                [
                  '/developer-docs/latest/setup-deployment-guides/configurations/required/admin-panel.md',
                  'Admin panel',
                ],
                [
                  '/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.md',
                  'Middlewares',
                ],
              ],
            },
            {
              title: 'Optional configurations',
              collapsable: true,
              children: [
                [
                  '/developer-docs/latest/setup-deployment-guides/configurations/optional/api-tokens.md',
                  'API tokens',
                ],
                [
                  '/developer-docs/latest/setup-deployment-guides/configurations/optional/functions.md',
                  'Functions',
                ],
                [
                  '/developer-docs/latest/setup-deployment-guides/configurations/optional/cronjobs.md',
                  'Cron jobs',
                ],
                [
                  '/developer-docs/latest/setup-deployment-guides/configurations/optional/api.md',
                  'API',
                ],
                [
                  '/developer-docs/latest/setup-deployment-guides/configurations/optional/plugins.md',
                  'Plugins',
                ],
                [
                  '/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md',
                  'Environment',
                ],
                [
                  '/developer-docs/latest/setup-deployment-guides/configurations/optional/public-assets.md',
                  'Public Assets',
                ],
                [
                  '/developer-docs/latest/setup-deployment-guides/configurations/optional/sso.md',
                  'Single Sign On (SSO)',
                ],
                [
                  '/developer-docs/latest/setup-deployment-guides/configurations/optional/rbac.md',
                  'Role-Based Access Control (RBAC)',
                ],
              ],
            },
          ],
        },
        {
          title: 'Deployment',
          path: '/developer-docs/latest/setup-deployment-guides/deployment.html',
          collapsable: true,
          initialOpenGroupIndex: -1, // make sure that no subgroup is open by default — if set to 0, 'Hosting Provider Guides' is expanded
          children: [
            {
              title: 'Hosting Provider Guides',
              path: '/developer-docs/latest/setup-deployment-guides/deployment.html#hosting-provider-guides',
              collapsable: true,
              children: [
                [
                  '/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/21yunbox.md',
                  '21YunBox',
                ],
                [
                  '/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/amazon-aws.md',
                  'Amazon AWS',
                ],
                [
                  '/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/azure.md',
                  'Azure',
                ],
                [
                  '/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/digitalocean-app-platform.md',
                  'DigitalOcean App Platform',
                ],
                [
                  '/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/digitalocean.md',
                  'DigitalOcean Droplets',
                ],
                [
                  '/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/google-app-engine.md',
                  'Google App Engine',
                ],
                [
                  '/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/heroku.md',
                  'Heroku',
                ],
                [
                  '/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/qovery.md',
                  'Qovery',
                ],
                [
                  '/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/render.md',
                  'Render',
                ],
                [
                  '/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/microtica.md',
                  'Microtica',
                ],
              ],
              sidebarDepth: 2,
            },
            {
              title: 'Optional Software Guides',
              path: '/developer-docs/latest/setup-deployment-guides/deployment.html#optional-software-guides',
              collapsable: true,
              children: [
                [
                  '/developer-docs/latest/setup-deployment-guides/deployment/optional-software/caddy-proxy.md',
                  'Caddy',
                ],
                [
                  '/developer-docs/latest/setup-deployment-guides/deployment/optional-software/haproxy-proxy.md',
                  'HAProxy',
                ],
                [
                  '/developer-docs/latest/setup-deployment-guides/deployment/optional-software/nginx-proxy.md',
                  'Nginx',
                ],
              ],
              sidebarDepth: 2,
            },
          ],
          sidebarDepth: 0,
        },
      ],
    },
    {
      title: '🔧 Development',
      collapsable: false,
      initialOpenGroupIndex: -1, // make sure that no subgroup is expanded by default
      children: [
        {
          title: 'Back-end customization',
          collapsable: true,
          path: '/developer-docs/latest/development/backend-customization.html',
          children: [
            ['/developer-docs/latest/development/backend-customization/routes.md', 'Routes'],
            ['/developer-docs/latest/development/backend-customization/policies.md', 'Policies'],
            [
              '/developer-docs/latest/development/backend-customization/middlewares.md',
              'Middlewares',
            ],
            [
              '/developer-docs/latest/development/backend-customization/controllers.md',
              'Controllers',
            ],
            [
              '/developer-docs/latest/development/backend-customization/requests-responses.md',
              'Requests & Responses',
            ],
            ['/developer-docs/latest/development/backend-customization/services.md', 'Services'],
            ['/developer-docs/latest/development/backend-customization/models.md', 'Models'],
            ['/developer-docs/latest/development/backend-customization/webhooks.md', 'Webhooks'],
          ],
        },
        ['/developer-docs/latest/development/admin-customization', 'Admin panel customization'],
        ['/developer-docs/latest/development/plugins-extension.md', 'Plugins extension'],
        ['/developer-docs/latest/development/plugins-development.md', 'Plugins development'],
      ],
    },
    {
      title: '💻 Developer Resources',
      collapsable: false,
      initialOpenGroupIndex: -1, // make sure that no subgroup is expanded by default
      sidebarDepth: 2,
      children: [
        {
          title: 'APIs Reference',
          collapsable: true,
          initialOpenGroupIndex: -1,
          sidebarDepth: 1,
          children: [
            {
              title: 'REST API',
              path: '/developer-docs/latest/developer-resources/database-apis-reference/rest-api.html',
              collapsable: true,
              initialOpenGroupIndex: -1,
              // sidebarDepth: 3,
              children: [
                {
                  title: 'API Parameters',
                  collapsable: true,
                  initialOpenGroupIndex: -1,
                  children: [
                    [
                      '/developer-docs/latest/developer-resources/database-apis-reference/rest/filtering-locale-publication.md',
                      'Filtering, Locale, and Publication State'
                    ],
                    [
                      '/developer-docs/latest/developer-resources/database-apis-reference/rest/populating-fields.md',
                      'Population & Field Selection'
                    ],
                    [
                      '/developer-docs/latest/developer-resources/database-apis-reference/rest/sort-pagination.md',
                      'Sort & Pagination'
                    ],
                  ]
                },
                [
                  '/developer-docs/latest/developer-resources/database-apis-reference/rest-api.html',
                  'API Endpoints'
                ]
              ],
            },
            [
              '/developer-docs/latest/developer-resources/database-apis-reference/graphql-api.md',
              'GraphQL API',
            ],
            {
              title: 'Query Engine API',
              path:
                '/developer-docs/latest/developer-resources/database-apis-reference/query-engine-api.html',
              collapsable: true,
              // sidebarDepth: 3,
              children: [
                [
                  '/developer-docs/latest/developer-resources/database-apis-reference/query-engine/single-operations.md',
                  'Single Operations',
                ],
                [
                  '/developer-docs/latest/developer-resources/database-apis-reference/query-engine/bulk-operations.md',
                  'Bulk Operations',
                ],
                [
                  '/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.md',
                  'Filtering',
                ],
                [
                  '/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md',
                  'Populating',
                ],
                [
                  '/developer-docs/latest/developer-resources/database-apis-reference/query-engine/order-pagination.md',
                  'Ordering & pagination',
                ],
              ],
            },
            {
              title: 'Entity Service API',
              path:
                '/developer-docs/latest/developer-resources/database-apis-reference/entity-service-api.html',
              collapsable: true,
              children: [
                [
                  '/developer-docs/latest/developer-resources/database-apis-reference/entity-service/crud.md',
                  'CRUD operations',
                ],
                [
                  '/developer-docs/latest/developer-resources/database-apis-reference/entity-service/filter.md',
                  'Filters',
                ],
                [
                  '/developer-docs/latest/developer-resources/database-apis-reference/entity-service/populate.md',
                  'Populate',
                ],
                [
                  '/developer-docs/latest/developer-resources/database-apis-reference/entity-service/order-pagination.md',
                  'Ordering & pagination',
                ],
                [
                  '/developer-docs/latest/developer-resources/database-apis-reference/entity-service/components-dynamic-zones.md',
                  'Components and dynamic zones',
                ],
              ],
            },
            {
              title: 'Plugin APIs Reference',
              collapsable: true,
              children: [
                [
                  '/developer-docs/latest/developer-resources/plugin-api-reference/server.md',
                  'Server API for plugins',
                ],
                [
                  '/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md',
                  'Admin Panel API for plugins',
                ],
              ],
            },
          ],
        },
        ['/developer-docs/latest/developer-resources/cli/CLI', 'Command Line Interface'],
        ['/developer-docs/latest/developer-resources/error-handling.md', 'Error handling'],
        ['/developer-docs/latest/developer-resources/database-migrations.md', 'Database migrations'],
        {
          title: 'Integrations',
          path: '/developer-docs/latest/developer-resources/content-api/integrations.html',
          collapsable: true,
          sidebarDepth: 1,
          children: [
            ['/developer-docs/latest/developer-resources/content-api/integrations/react', 'React'],
            [
              '/developer-docs/latest/developer-resources/content-api/integrations/vue-js',
              'Vue.js',
            ],
            [
              '/developer-docs/latest/developer-resources/content-api/integrations/angular',
              'Angular',
            ],
            [
              '/developer-docs/latest/developer-resources/content-api/integrations/next-js',
              'Next.js',
            ],
            [
              '/developer-docs/latest/developer-resources/content-api/integrations/nuxt-js',
              'Nuxt.js',
            ],
            [
              '/developer-docs/latest/developer-resources/content-api/integrations/graphql',
              'GraphQL',
            ],
            [
              '/developer-docs/latest/developer-resources/content-api/integrations/gatsby',
              'Gatsby',
            ],
            [
              '/developer-docs/latest/developer-resources/content-api/integrations/gridsome',
              'Gridsome',
            ],
            [
              '/developer-docs/latest/developer-resources/content-api/integrations/jekyll',
              'Jekyll',
            ],
            ['/developer-docs/latest/developer-resources/content-api/integrations/11ty', '11ty'],
            [
              '/developer-docs/latest/developer-resources/content-api/integrations/svelte',
              'Svelte',
            ],
            [
              '/developer-docs/latest/developer-resources/content-api/integrations/sapper',
              'Sapper',
            ],
            ['/developer-docs/latest/developer-resources/content-api/integrations/ruby', 'Ruby'],
            [
              '/developer-docs/latest/developer-resources/content-api/integrations/python',
              'Python',
            ],
            ['/developer-docs/latest/developer-resources/content-api/integrations/dart', 'Dart'],
            [
              '/developer-docs/latest/developer-resources/content-api/integrations/flutter',
              'Flutter',
            ],
            ['/developer-docs/latest/developer-resources/content-api/integrations/go', 'Go'],
            ['/developer-docs/latest/developer-resources/content-api/integrations/php', 'PHP'],
            [
              '/developer-docs/latest/developer-resources/content-api/integrations/laravel',
              'Laravel',
            ],
          ],
        },
      ],
    },
    {
      title: '🧩 Strapi plugins',
      path: '/developer-docs/latest/plugins/plugins-intro.html',
      collapsable: false,
      children: [
        ['/developer-docs/latest/plugins/graphql', 'GraphQL'],
        ['/developer-docs/latest/plugins/i18n', 'Internationalization (i18n)'],
        ['/developer-docs/latest/plugins/users-permissions', 'Users & Permissions'],
        ['/developer-docs/latest/plugins/email', 'Email'],
        ['/developer-docs/latest/plugins/upload', 'Upload'],
        ['/developer-docs/latest/plugins/documentation', 'API Documentation'],
      ],
      sidebarDepth: 1,
    },
    {
      title: '♻️ Update & Migration',
      collapsable: false,
      children: [
        ['/developer-docs/latest/update-migration-guides/update-version.md', 'Update'],
        ['/developer-docs/latest/update-migration-guides/migration-guides.md', 'Migration'],
      ],
    },
    {
      title: '📚 Guides',
      collapsable: true,
      children: [
        ['/developer-docs/latest/guides/auth-request', 'Authenticated request'],
        // ['/developer-docs/latest/guides/slug', 'Create a slug system'],
        // ['/developer-docs/latest/guides/is-owner', 'Create is owner policy'],
        // ['/developer-docs/latest/guides/custom-admin', 'Custom admin'],
        // ['/developer-docs/latest/guides/custom-data-response', 'Custom data response'],
        ['/developer-docs/latest/guides/draft', 'Draft system'],
        // ['/developer-docs/latest/guides/error-catching', 'Error catching'],
        // ['/developer-docs/latest/guides/external-data', 'Fetching external data'],
        ['/developer-docs/latest/guides/jwt-validation', 'JWT validation'],
        ['/developer-docs/latest/guides/process-manager', 'Process manager'],
        ['/developer-docs/latest/guides/scheduled-publication', 'Scheduled publication'],
        // ['/developer-docs/latest/guides/secure-your-app', 'Secure your application'],
        // ['/developer-docs/latest/guides/send-email', 'Send email programmatically'],
        [
          '/developer-docs/latest/guides/registering-a-field-in-admin',
          'Registering a new field in the admin panel',
        ],
        // ['/developer-docs/latest/guides/client', 'Setup a third party client'],
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
        ['/user-docs/latest/content-manager/translating-content', 'Translating content'],
        [
          '/user-docs/latest/content-manager/saving-and-publishing-content',
          'Saving, publishing and deleting content',
        ],
      ],
    },
    {
      collapsable: false,
      title: 'Content-type Builder',
      children: [
        [
          '/user-docs/latest/content-types-builder/introduction-to-content-types-builder',
          'Introduction to the Content-type Builder',
        ],
        [
          '/user-docs/latest/content-types-builder/creating-new-content-type',
          'Creating content types',
        ],
        [
          '/user-docs/latest/content-types-builder/managing-content-types',
          'Managing content types',
        ],
        [
          '/user-docs/latest/content-types-builder/configuring-fields-content-type',
          'Configuring fields for content types',
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
        [
          '/user-docs/latest/users-roles-permissions/configuring-administrator-roles',
          'Configuring administrator roles',
        ],
        [
          '/user-docs/latest/users-roles-permissions/managing-administrators',
          'Managing administrator accounts',
        ],
        [
          '/user-docs/latest/users-roles-permissions/configuring-end-users-roles',
          'Configuring end-users roles',
        ],
        [
          '/user-docs/latest/users-roles-permissions/managing-end-users',
          'Managing end-users accounts',
        ],
      ],
    },
    {
      collapsable: false,
      title: 'Plugins',
      children: [
        ['/user-docs/latest/plugins/introduction-to-plugins', 'Introduction to plugins'],
        [
          '/user-docs/latest/plugins/installing-plugins-via-marketplace',
          'Installing plugins via the Marketplace',
        ],
        ['/user-docs/latest/plugins/strapi-plugins', 'List of Strapi plugins'],
      ],
    },
    {
      collapsable: false,
      title: 'General settings',
      children: [
        ['/user-docs/latest/settings/managing-global-settings', 'Managing global settings'],
        [
          '/user-docs/latest/settings/configuring-users-permissions-plugin-settings',
          'Configuring Users & Permissions plugin settings',
        ],
      ],
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

module.exports = {
  title: '',
  port: 8080,
  description: 'The headless CMS developers love.',
  base: '/',
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
                text: 'Development',
                link: '/developer-docs/latest/development/backend-customization.html',
              },
              {
                text: 'Developer Resources',
                link: '/developer-docs/latest/developer-resources/database-apis-reference/rest-api.html',
              },
              {
                text: 'Plugins',
                link: '/developer-docs/latest/plugins/plugins-intro.html',
              },
              {
                text: 'Update & Migration',
                link: '/developer-docs/latest/update-migration-guides/update-version.html',
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
                text: 'Content-type Builder',
                link:
                  '/user-docs/latest/content-types-builder/introduction-to-content-types-builder.html',
              },
              {
                text: 'Users, Roles, and Permissions',
                link: '/user-docs/latest/users-roles-permissions/introduction-to-users-roles-permissions.html',
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
          {
            text: 'Older versions',
            items: [
              {
                text: 'v3 Documentation',
                link: 'https://docs-v3.strapi.io'
              }
            ],
          },
        ],
      },
      {
        text: 'v3 documentation',
        link: 'https://docs-v3.strapi.io',
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
  plugins: plugins,
};
