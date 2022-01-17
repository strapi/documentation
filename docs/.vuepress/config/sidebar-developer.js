const developer = [
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
    initialOpenGroupIndex: -1, // make sure that no subgroup is expanded by default
    children: [
      {
        title: 'Back-end customization',
        collapsable: true,
        path: '/developer-docs/latest/development/backend-customization',
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
              '/developer-docs/latest/developer-resources/database-apis-reference/entity-service-api',
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
      {
        title: 'Migration',
        path: '/developer-docs/latest/update-migration-guides/migration-guides.html',
        collapsable: true,
        children: [
          {
            title: 'v4',
            path: '/developer-docs/latest/update-migration-guides/migration-guides.html#v4-stable-guides',
            collapsable: true,
            children: [
              {
                title: 'Plugin migration guide',
                path: '/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin-migration.html',
                collapsable: true,
                children: [
                  ['/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/enable-plugin.md', 'Enable a plugin'],
                  ['/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/update-folder-structure.md', 'Update the folder structure'],
                  ['/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/migrate-back-end.md', 'Migrate the back end'],
                  ['/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/migrate-front-end.md', 'Migrate the front end'],
                ]
              }
              // ['', 'Code migration guide'],
              // ['', 'Data migration guide'],
            ]
          },
          ['/developer-docs/latest/update-migration-guides/migration-guides.html#v3-stable-guides', 'v3 stable'],
        ]
      }
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
      // [
      //   '/developer-docs/latest/guides/registering-a-field-in-admin',
      //   'Registering a new field in the admin panel',
      // ],
      // ['/developer-docs/latest/guides/client', 'Setup a third party client'],
      ['/developer-docs/latest/guides/unit-testing', 'Unit testing'],
    ],
  },
];
