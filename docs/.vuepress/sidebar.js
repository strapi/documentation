module.exports = {
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
        ['/developer-docs/latest/setup-deployment-guides/configurations.md', 'Configurations'],
        {
          title: 'Deployment',
          path: '/developer-docs/latest/setup-deployment-guides/deployment',
          collapsable: true,
          initialOpenGroupIndex: -1, // make sure that no subgroup is open by default — if set to 0, 'Hosting Provider Guides' is expanded
          children: [
            {
              title: 'Hosting Provider Guides',
              path:
                '/developer-docs/latest/setup-deployment-guides/deployment.html#hosting-provider-guides',
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
              ],
              sidebarDepth: 2,
            },
            {
              title: 'Optional Software Guides',
              path:
                '/developer-docs/latest/setup-deployment-guides/deployment.html#optional-software-guides',
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
      children: [
        ['/developer-docs/latest/development/backend-customization', 'Backend customization'],
        ['/developer-docs/latest/development/backend-customization/models.md', 'Models'],
        ['/developer-docs/latest/development/admin-customization', 'Admin panel customization'],
        {
          title: 'Strapi plugins',
          path: '/developer-docs/latest/development/plugin-customization.html',
          collapsable: true,
          children: [
            ['/developer-docs/latest/development/plugins/documentation', 'API Documentation'],
            ['/developer-docs/latest/development/plugins/email', 'Email'],
            ['/developer-docs/latest/development/plugins/graphql', 'GraphQL'],
            ['/developer-docs/latest/development/plugins/i18n', 'Internationalization (i18n)'],
            ['/developer-docs/latest/development/plugins/upload', 'Upload'],
            ['/developer-docs/latest/development/plugins/users-permissions', 'Users & Permissions'],
          ],
          sidebarDepth: 1,
        },
        ['/developer-docs/latest/development/local-plugins-customization.md', 'Local plugins'],
      ],
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
      title: '💻 Developer Resources',
      collapsable: false,
      initialOpenGroupIndex: -1, // make sure that no subgroup is expanded by default
      sidebarDepth: 2,
      children: [
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
        {
          title: 'Database APIs Reference',
          collapsable: false,
          sidebarDepth: 1,
          children: [
            ['/developer-docs/latest/developer-resources/database-apis-reference/rest-api.md', 'REST API'],
            ['/developer-docs/latest/developer-resources/database-apis-reference/graphql-api.md', 'GraphQL API'],
            {
              title: 'Query Engine API',
              path: '/developer-docs/latest/developer-resources/database-apis-reference/query-engine-api.html',
              collapsable: true,
              // sidebarDepth: 3,
              children: [
                [
                  '/developer-docs/latest/developer-resources/database-apis-reference/query-engine/single-operations.md',
                  'Single Operations'
                ],
                [
                  '/developer-docs/latest/developer-resources/database-apis-reference/query-engine/bulk-operations.md',
                  'Bulk Operations'
                ],
                [
                  '/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.md',
                  'Filtering'
                ],
                [
                  '/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md',
                  'Populating'
                ],
                [
                  '/developer-docs/latest/developer-resources/database-apis-reference/query-engine/order-pagination.md',
                  'Ordering & Pagination'
                ],
              ]
            },
          ]
        },
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
        ['/user-docs/latest/content-manager/translating-content', 'Translating content'],
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
}
