const developer = [
  {
    title: '🚀 Getting Started',
    collapsable: false,
    children: [
      ['/developer-docs/latest/getting-started/introduction.html', 'Introduction'],
      ['/developer-docs/latest/getting-started/quick-start.html', 'Quick Start Guide'],
      ['/developer-docs/latest/getting-started/troubleshooting.html', 'Frequently Asked Questions'],
      ['/developer-docs/latest/getting-started/usage-information.html', 'Usage Information'],
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
          ['/developer-docs/latest/setup-deployment-guides/installation/cli.html', 'CLI'],
          ['/developer-docs/latest/setup-deployment-guides/installation/docker.html', 'Docker'],
        ],
      },
      ['/developer-docs/latest/setup-deployment-guides/file-structure.html', 'Project structure'],
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
                '/developer-docs/latest/setup-deployment-guides/configurations/required/databases.html',
                'Database',
              ],
              [
                '/developer-docs/latest/setup-deployment-guides/configurations/required/server.html',
                'Server',
              ],
              [
                '/developer-docs/latest/setup-deployment-guides/configurations/required/admin-panel.html',
                'Admin panel',
              ],
              [
                '/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.html',
                'Middlewares',
              ],
            ],
          },
          {
            title: 'Optional configurations',
            collapsable: true,
            children: [
              [
                '/developer-docs/latest/setup-deployment-guides/configurations/optional/api-tokens.html',
                'API tokens',
              ],
              [
                '/developer-docs/latest/setup-deployment-guides/configurations/optional/functions.html',
                'Functions',
              ],
              [
                '/developer-docs/latest/setup-deployment-guides/configurations/optional/cronjobs.html',
                'Cron jobs',
              ],
              [
                '/developer-docs/latest/setup-deployment-guides/configurations/optional/api.html',
                'API',
              ],
              [
                '/developer-docs/latest/setup-deployment-guides/configurations/optional/plugins.html',
                'Plugins',
              ],
              [
                '/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.html',
                'Environment',
              ],
              [
                '/developer-docs/latest/setup-deployment-guides/configurations/optional/public-assets.html',
                'Public Assets',
              ],
              [
                '/developer-docs/latest/setup-deployment-guides/configurations/optional/sso.html',
                'Single Sign On (SSO)',
              ],
              [
                '/developer-docs/latest/setup-deployment-guides/configurations/optional/rbac.html',
                'Role-Based Access Control (RBAC)',
              ],
              [
                '/developer-docs/latest/setup-deployment-guides/configurations/optional/typescript.html',
                'TypeScript',
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
            title: "Strapi Cloud",
            path: '/developer-docs/latest/setup-deployment-guides/deployment/strapi-cloud.html',
            collapsable: true,
          },
          {
            title: 'Hosting Provider Guides',
            path:
              '/developer-docs/latest/setup-deployment-guides/deployment.html#hosting-provider-guides',
            collapsable: true,
            children: [
              [
                '/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/amazon-aws.html',
                'Amazon AWS',
              ],
              [
                '/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/azure.html',
                'Azure',
              ],
              [
                '/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/digitalocean-app-platform.html',
                'DigitalOcean App Platform',
              ],
              [
                '/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/digitalocean.html',
                'DigitalOcean Droplets',
              ],
              [
                '/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/google-app-engine.html',
                'Google App Engine',
              ],
              [
                '/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/heroku.html',
                'Heroku',
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
                '/developer-docs/latest/setup-deployment-guides/deployment/optional-software/caddy-proxy.html',
                'Caddy',
              ],
              [
                '/developer-docs/latest/setup-deployment-guides/deployment/optional-software/haproxy-proxy.html',
                'HAProxy',
              ],
              [
                '/developer-docs/latest/setup-deployment-guides/deployment/optional-software/nginx-proxy.html',
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
          ['/developer-docs/latest/development/backend-customization/routes.html', 'Routes'],
          ['/developer-docs/latest/development/backend-customization/policies.html', 'Policies'],
          [
            '/developer-docs/latest/development/backend-customization/middlewares.html',
            'Middlewares',
          ],
          [
            '/developer-docs/latest/development/backend-customization/controllers.html',
            'Controllers',
          ],
          [
            '/developer-docs/latest/development/backend-customization/requests-responses.html',
            'Requests & Responses',
          ],
          ['/developer-docs/latest/development/backend-customization/services.html', 'Services'],
          ['/developer-docs/latest/development/backend-customization/models.html', 'Models'],
          ['/developer-docs/latest/development/backend-customization/webhooks.html', 'Webhooks'],
        ],
      },
      ['/developer-docs/latest/development/admin-customization', 'Admin panel customization'],
      ['/developer-docs/latest/development/plugins-extension.md', 'Plugins extension'],
      ['/developer-docs/latest/development/plugins-development.md', 'Plugins development'],
      ['/developer-docs/latest/development/custom-fields.md', 'Custom fields'],
      ['/developer-docs/latest/development/typescript.md', 'TypeScript'],
      ['/developer-docs/latest/development/providers.md', 'Providers'],
      ['/developer-docs/latest/development/export-import.md', 'Data export-import'],
    ],
  },
  {
    title: '💻 Developer Resources',
    collapsable: false,
    initialOpenGroupIndex: -1, // make sure that no subgroup is expanded by default
    sidebarDepth: 2,
    children: [
      {
        title: 'REST API',
        path: '/developer-docs/latest/developer-resources/database-apis-reference/rest-api.html',
        collapsable: true,
        initialOpenGroupIndex: -1,
        sidebarDepth: 3,
        children: [
          ['/developer-docs/latest/developer-resources/database-apis-reference/rest-api.html', 'API endpoints'],
          {
            title: 'API parameters',
            path: '/developer-docs/latest/developer-resources/database-apis-reference/rest/api-parameters.html',
            collapsable: true,
            initialOpenGroupIndex: -1,
            children: [
              [
                '/developer-docs/latest/developer-resources/database-apis-reference/rest/filtering-locale-publication.html',
                'Filtering, Locale, and Publication State'
              ],
              [
                '/developer-docs/latest/developer-resources/database-apis-reference/rest/populating-fields.html',
                'Population & Field Selection'
              ],
              [
                '/developer-docs/latest/developer-resources/database-apis-reference/rest/sort-pagination.html',
                'Sort & Pagination'
              ],
            ]
          },
        ],
      },
      [
        '/developer-docs/latest/developer-resources/database-apis-reference/graphql-api.html',
        'GraphQL API',
      ],
      {
        title: 'Entity Service API',
        path:
          '/developer-docs/latest/developer-resources/database-apis-reference/entity-service-api.html',
        collapsable: true,
        children: [
          [
            '/developer-docs/latest/developer-resources/database-apis-reference/entity-service/crud.html',
            'CRUD operations',
          ],
          [
            '/developer-docs/latest/developer-resources/database-apis-reference/entity-service/filter.html',
            'Filters',
          ],
          [
            '/developer-docs/latest/developer-resources/database-apis-reference/entity-service/populate.html',
            'Populate',
          ],
          [
            '/developer-docs/latest/developer-resources/database-apis-reference/entity-service/order-pagination.html',
            'Ordering & pagination',
          ],
          [
            '/developer-docs/latest/developer-resources/database-apis-reference/entity-service/components-dynamic-zones.html',
            'Components and dynamic zones',
          ],
        ],
      },
      {
        title: 'Query Engine API',
        path:
          '/developer-docs/latest/developer-resources/database-apis-reference/query-engine-api.html',
        collapsable: true,
        // sidebarDepth: 3,
        children: [
          [
            '/developer-docs/latest/developer-resources/database-apis-reference/query-engine/single-operations.html',
            'Single Operations',
          ],
          [
            '/developer-docs/latest/developer-resources/database-apis-reference/query-engine/bulk-operations.html',
            'Bulk Operations',
          ],
          [
            '/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.html',
            'Filtering',
          ],
          [
            '/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.html',
            'Populating',
          ],
          [
            '/developer-docs/latest/developer-resources/database-apis-reference/query-engine/order-pagination.html',
            'Ordering & pagination',
          ],
        ],
      },
      {
        title: 'Plugin APIs',
        collapsable: true,
        children: [
          [
            '/developer-docs/latest/developer-resources/plugin-api-reference/server.html',
            'Server API for plugins',
          ],
          [
            '/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.html',
            'Admin Panel API for plugins',
          ],
        ],
      },
      ['/developer-docs/latest/developer-resources/cli/CLI', 'Command Line Interface'],
      ['/developer-docs/latest/developer-resources/error-handling.html', 'Error handling'],
      ['/developer-docs/latest/developer-resources/unit-testing', 'Unit testing'],
      ['/developer-docs/latest/developer-resources/database-migrations.html', 'Database migrations'],
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
      ['/developer-docs/latest/plugins/sentry', 'Sentry'],
      ['/developer-docs/latest/plugins/documentation', 'API Documentation'],
    ],
    sidebarDepth: 1,
  },
  {
    title: '♻️ Update & Migration',
    collapsable: false,
    children: [
      ['/developer-docs/latest/update-migration-guides/update-version.html', 'Update'],
      {
        title: 'Migration',
        path: '/developer-docs/latest/update-migration-guides/migration-guides.html',
        collapsable: true,
        children: [
          ['/developer-docs/latest/update-migration-guides/migration-guides.html#v4-guides', 'v4 migration guides'],
          {
            title: 'v3 to v4 migration guides',
            path: '/developer-docs/latest/update-migration-guides/migration-guides.html#v3-to-v4-migration-guides',
            collapsable: true,
            children: [
              {
                title: 'Code migration guide',
                initialOpenGroupIndex: -1, // make sure that no subgroup is expanded by default
                path: '/developer-docs/latest/update-migration-guides/migration-guides/v4/code-migration.html',
                collapsable: true,
                children: [
                  {
                    title: 'Updating the back end',
                    path: '/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend.html',
                    collapsable: true,
                    children: [
                      ['/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/configuration.html', 'Configurations'],
                      ['/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/dependencies.html', 'Dependencies'],
                      ['/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/routes.html', 'Routes'],
                      ['/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/controllers.html', 'Controllers'],
                      ['/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/services.html', 'Services'],
                      ['/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/content-type-schema.html', 'Content-type schema'],
                      ['/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/policies.html', 'Policies'],
                      ['/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/route-middlewares.html', 'Route middlewares'],
                      ['/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/global-middlewares.html', 'Global middlewares'],
                      ['/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/graphql.html', 'GraphQL'],
                    ]
                  },
                  {
                    title: 'Updating the front end',
                    path: '/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend.html',
                    collapsable: true,
                    children: [
                      ['/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/wysiwyg.html', 'WYSIWYG customization'],
                      ['/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/translations.html', 'Translations'],
                      ['/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/webpack.html', 'Webpack configuration'],
                      ['/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/theming.html', 'Theme customizations'],
                      ['/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/strapi-global.html', 'Strapi global variable calls'],
                    ]
                  }
                ]
              },
              {
                title: 'Data migration guide',
                path: '/developer-docs/latest/update-migration-guides/migration-guides/v4/data-migration.html',
                collapsable: true,
                children: [
                  ['/developer-docs/latest/update-migration-guides/migration-guides/v4/data/sql.html', 'SQL v3 to v4 migration'],
                  ['/developer-docs/latest/update-migration-guides/migration-guides/v4/data/sql-relations.html', 'SQL relations cheatsheet'],
                  ['/developer-docs/latest/update-migration-guides/migration-guides/v4/data/mongo.html', 'MongoDB v3 to SQL v3 migration'],
                  ['/developer-docs/latest/update-migration-guides/migration-guides/v4/data/mongo-sql-cheatsheet.html', 'MongoDB vs. SQL cheatsheet'],
                ],
              },
              {
                title: 'Plugin migration guide',
                path: '/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin-migration.html',
                collapsable: true,
                children: [
                  ['/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/update-folder-structure.html', 'Updating the folder structure'],
                  ['/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/migrate-back-end.html', 'Migrating the back end'],
                  ['/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/migrate-front-end.html', 'Migrating the front end'],
                  ['/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/enable-plugin.html', 'Enabling a plugin'],
                ]
              },
            ]
          },
          // ['/developer-docs/latest/update-migration-guides/migration-guides.html#v3-guides', 'v3 migration guides'], // commented out as it creates a "visual bug" and this is just a link to v3 docs after all
        ],
      },
    ],
  },
];
