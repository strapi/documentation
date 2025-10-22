/**
 *
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  cmsSidebar: [
    {
      // Getting Started
      type: 'category',
      label: 'Getting Started',
      className: 'category-cms-getting-started',
      collapsible: false,
      items: [
        'cms/quick-start',
        'cms/project-structure',
        'cms/installation',
        {
          type: 'doc',
          id: 'cms/features/admin-panel',
          label: 'Admin panel',
        },
        {
          type: 'doc',
          id: 'cms/features/content-manager',
          label: 'Content Manager',
        },
        {
          type: 'doc',
          id: 'cms/features/content-type-builder',
          label: 'Content Type Builder',
          customProps: {
            updated: true,
          },
        },
        'cms/deployment',
      ],
    },
    {
      // Features
      type: 'category',
      label: 'Features',
      collapsible: false,
      className: 'category-cms-features',
      items: [
        {
          type: 'doc',
          label: 'API Tokens',
          id: 'cms/features/api-tokens',
        },
        {
          type: 'doc',
          label: 'Audit Logs',
          id: 'cms/features/audit-logs',
        },
        {
          type: 'doc',
          label: 'Content History',
          id: 'cms/features/content-history',
        },
        'cms/features/custom-fields',
        {
          type: 'doc',
          label: 'Data Management',
          id: 'cms/features/data-management',
        },
        {
          type: 'doc',
          label: 'Draft & Publish',
          id: 'cms/features/draft-and-publish',
        },
        'cms/features/email',

        {
          type: 'doc',
          label: 'Internationalization (i18n)',
          id: 'cms/features/internationalization',
          customProps: {
            updated: true,
          },
        },
        {
          type: 'doc',
          label: 'Media Library',
          id: 'cms/features/media-library',
          customProps: {
            updated: true,
          },
        },
        {
          type: 'doc',
          label: 'Preview',
          id: 'cms/features/preview',
          customProps: {
            new: false,
          },
        },
        {
          type: 'doc',
          label: 'Role-Based Access Control (RBAC)',
          id: 'cms/features/rbac',
        },
        {
          type: 'doc',
          label: 'Releases',
          id: 'cms/features/releases',
        },
        {
          type: 'doc',
          label: 'Review Workflows',
          id: 'cms/features/review-workflows',
        },
        {
          type: 'doc',
          label: 'Single Sign-On (SSO)',
          id: 'cms/features/sso',
        },
        {
          type: 'doc',
          label: 'Users & Permissions',
          id: 'cms/features/users-permissions',
        },
        {
          type: 'category',
          label: 'Strapi plugins',
          collapsed: true,
          items: [
            {
              type: 'doc',
              label: 'Documentation',
              id: 'cms/plugins/documentation',
            },
            {
              type: 'doc',
              label: 'GraphQL',
              id: 'cms/plugins/graphql',
            },
            {
              type: 'doc',
              label: 'Sentry',
              id: 'cms/plugins/sentry',
            },
          ],
        },
      ],
    },
    {
      // APIs
      type: 'category',
      label: 'APIs',
      className: 'category-cms-api',
      link: { type: 'doc', id: 'cms/api/content-api' },
      collapsible: false,
      collapsed: false,
      items: [
        'cms/api/content-api',
        'cms/api/document',
        {
          type: 'category',
          label: 'REST API',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'cms/api/rest',
              label: 'Endpoints',
            },
            'cms/api/rest/parameters',
            'cms/api/rest/filters',
            'cms/api/rest/locale',
            'cms/api/rest/status',
            'cms/api/rest/populate-select',
            'cms/api/rest/relations',
            'cms/api/rest/sort-pagination',
            'cms/api/rest/upload',
            'cms/api/rest/interactive-query-builder',
            'cms/api/rest/guides/intro',
          ],
        },
        {
          type: 'doc',
          label: 'Strapi Client',
          id: 'cms/api/client',
          customProps: {
            new: false,
          },
        },
        'cms/api/openapi',
        'cms/api/graphql',
        {
          type: 'category',
          label: 'Document Service API',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'cms/api/document-service',
              label: 'Available methods',
            },
            'cms/api/document-service/fields',
            'cms/api/document-service/filters',
            'cms/api/document-service/locale',
            'cms/api/document-service/middlewares',
            'cms/api/document-service/populate',
            'cms/api/document-service/sort-pagination',
            'cms/api/document-service/status',
          ],
        },
      ],
    },
    {
      // Configurations
      type: 'category',
      label: 'Configurations',
      collapsed: false,
      collapsible: false,
      className: 'category-cms-configurations',
      items: [
        {
          type: 'doc',
          label: 'Configurations introduction',
          id: 'cms/configurations',
        },
        {
          type: 'category',
          label: 'Admin panel',
          collapsed: true,
          customProps: {
            updated: false,
            text: 'The section has been simplified',
            tooltip: `We simplified the admin panel configuration section to make it easier to navigate and find what you need.</div>
              <div>The new structure groups configurations by their purpose, making it more intuitive to locate specific settings.</div>
              <div><em>Notes: </em>
              <ul>
                <li>Lifecycle functions documentation has been moved to the Development section.</li>
                <li>Email and Upload Providers documentation have been included in the corresponding Features pages.</li>
              </div>`,
          },
          items: [
            {
              type: 'link',
              label: 'Introduction',
              href: '/cms/configurations/admin-panel',
            },
            {
              type: 'link',
              label: 'Admin panel behavior',
              href: '/cms/configurations/admin-panel#admin-panel-behavior',
            },
            {
              type: 'link',
              label: 'Admin panel server',
              href: '/cms/configurations/admin-panel#admin-panel-server',
            },
            {
              type: 'link',
              label: 'API tokens',
              href: '/cms/configurations/admin-panel#api-tokens',
            },
            {
              type: 'link',
              label: 'Audit Logs',
              href: '/cms/configurations/admin-panel#audit-logs',
            },
            {
              type: 'link',
              label: 'Authentication',
              href: '/cms/configurations/admin-panel#authentication',
            },
            {
              type: 'link',
              label: 'Feature flags',
              href: '/cms/configurations/admin-panel#feature-flags',
            },
            {
              type: 'link',
              label: 'Forgot password',
              href: '/cms/configurations/admin-panel#forgot-password',
            },
            {
              type: 'link',
              label: 'Rate limiting',
              href: '/cms/configurations/admin-panel#rate-limiting',
            },
            {
              type: 'link',
              label: 'Strapi AI',
              href: '/cms/configurations/admin-panel#strapi-ai',
              customProps: {
                new: true,
              },
            },
            {
              type: 'link',
              label: 'Transfer tokens',
              href: '/cms/configurations/admin-panel#transfer-tokens',
            },
            {
              type: 'link',
              label: 'Examples',
              href: '/cms/configurations/admin-panel#configuration-examples',
            },
          ],
        },
        'cms/configurations/api',
        {
          type: 'doc',
          id: 'cms/configurations/cron',
          customProps: {
            updated: false,
          },
        },
        {
          type: 'category',
          collapsed: true,
          collapsible: true,
          label: 'Database',
          customProps: {
            tooltip:
              'This section now regroups all the database-related configurations and guides, including migrations and transactions.',
          },
          items: [
            {
              type: 'doc',
              id: 'cms/configurations/database',
              label: 'Database configuration',
            },
            'cms/database-migrations',
            'cms/database-transactions',
          ],
        },
        'cms/configurations/environment',
        'cms/configurations/features',
        'cms/configurations/middlewares',
        'cms/configurations/plugins',
        'cms/configurations/server',
      ],
    },
    {
      // Development
      type: 'category',
      label: 'Development',
      className: 'category-cms-development',
      collapsible: false,
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'cms/customization', // TODO: rename to Introduction
          label: 'Introduction',
        },
        'cms/configurations/functions',
        {
          // Backend customization
          type: 'category',
          label: 'Backend customization',
          collapsible: true,
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'cms/backend-customization',
              label: 'Overview',
            },
            'cms/backend-customization/requests-responses',
            'cms/backend-customization/routes',
            'cms/backend-customization/policies',
            'cms/backend-customization/middlewares',
            'cms/backend-customization/controllers',
            'cms/backend-customization/services',
            'cms/backend-customization/models',
            'cms/backend-customization/webhooks',
          ],
        },
        {
          // Admin panel customization
          type: 'category',
          label: 'Admin panel customization',
          collapsed: true,
          customProps: {
            updated: false,
            tooltip: 'This section has been reorganized, see details below.',
          },
          items: [
            {
              type: 'html',
              value: 'placeholder', // a value is required for the HTML type, but it is not rendered
              customProps: {
                tooltipTitle: `The section has been reorganized`,
                tooltipContent: `We have reorganized the admin panel customization section to make it easier to navigate and find what you need.</div>
                  <br/><br/>
                  <div>The new structure groups customizations by their purpose, making it more intuitive to locate specific settings.</div>
                  <br/>
                  <div><em>Note: </em>
                    Deployment-related configuration, including host, port, and path configuration, has been moved to the Configurations > Admin panel > <a href="/cms/configurations/admin-panel#admin-panel-server">Admin panel server</a> page.
                  </div>`,
              },
            },
            {
              type: 'doc',
              id: 'cms/admin-panel-customization',
              label: 'Overview',
            },
            'cms/admin-panel-customization/logos',
            'cms/admin-panel-customization/favicon',
            'cms/admin-panel-customization/locales-translations',
            {
              type: 'doc',
              id: 'cms/admin-panel-customization/wysiwyg-editor',
              label: 'Rich text editor',
            },
            'cms/admin-panel-customization/bundlers',
            'cms/admin-panel-customization/theme-extension',
            {
              type: 'doc',
              id: 'cms/admin-panel-customization/extension',
              label: 'Admin panel extension',
            },
          ],
        },
        {
          type: 'doc',
          label: 'Homepage customization',
          id: 'cms/admin-panel-customization/homepage',
          customProps: {
            new: false,
          },
        },
        'cms/error-handling',
        'cms/templates',
        'cms/testing',
      ],
    },
    {
      type: 'category',
      label: 'TypeScript',
      collapsed: false,
      collapsible: false,
      className: 'category-cms-typescript',
      items: [
        {
          type: 'doc',
          id: 'cms/typescript',
          label: 'Introduction',
        },
        {
          type: 'doc',
          id: 'cms/configurations/typescript',
          label: 'Configuration',
        },
        {
          type: 'doc',
          id: 'cms/typescript/development',
          label: 'Development',
        },
        {
          type: 'doc',
          id: 'cms/typescript/guides',
          label: 'Guides',
        },
      ],
    },
    {
      // Command Line Interface
      type: 'category',
      label: 'Command Line Interface',
      className: 'category-cms-cli',
      collapsed: false,
      collapsible: false,
      items: ['cms/cli'],
    },
    {
      // Plugins
      type: 'category',
      label: 'Plugins',
      className: 'category-cms-plugins',
      collapsible: false,
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'cms/plugins/installing-plugins-via-marketplace',
          label: 'Marketplace',
        },
        {
          type: 'category',
          label: 'Plugins development',
          collapsed: true,
          items: [
            {
              type: 'doc',
              label: 'Developing plugins',
              id: 'cms/plugins-development/developing-plugins',
            },
            'cms/plugins-development/create-a-plugin',
            'cms/plugins-development/plugin-structure',
            'cms/plugins-development/plugin-sdk',
            'cms/plugins-development/admin-panel-api',
            'cms/plugins-development/content-manager-apis',
            'cms/plugins-development/server-api',
            'cms/plugins-development/plugins-extension',
            'cms/plugins-development/guides/pass-data-from-server-to-admin',
            'cms/plugins-development/guides/store-and-access-data',
            'cms/plugins-development/guides/create-components-for-plugins',
          ],
        },
      ],
    },

    {
      // Upgrades
      type: 'category',
      label: 'Upgrades',
      className: 'category-cms-upgrade',
      collapsible: false,
      collapsed: false,
      items: [
        'cms/upgrade-tool',
        {
          type: 'category',
          label: 'v4 → v5',
          collapsed: true,
          items: [
            'cms/migration/v4-to-v5/introduction-and-faq',
            'cms/migration/v4-to-v5/step-by-step',
            'cms/migration/v4-to-v5/breaking-changes',
            'cms/migration/v4-to-v5/additional-resources/introduction',
          ],
        },
      ],
    },
  ],

  cloudSidebar: [
    {
      // Getting Started
      type: 'category',
      collapsed: false,
      label: 'Getting Started',
      collapsible: false,
      className: 'category-cloud-getting-started',
      items: [
        'cloud/getting-started/intro',
        {
          type: 'doc',
          label: 'Cloud fundamentals',
          id: 'cloud/getting-started/cloud-fundamentals',
          customProps: {
            new: false,
          },
        },
        {
          type: 'category',
          label: 'Project deployment',
          customProps: {
            updated: false,
          },
          items: [
            {
              type: 'doc',
              id: 'cloud/getting-started/deployment-options',
            },
            {
              type: 'doc',
              id: 'cloud/getting-started/deployment',
              customProps: {
                updated: false,
              },
            },
            {
              type: 'doc',
              id: 'cloud/getting-started/deployment-cli',
              customProps: {
                new: false,
              },
            },
          ],
        },
        {
          type: 'doc',
          id: 'cloud/getting-started/usage-billing',
          customProps: {
            updated: false,
          },
        },
        'cloud/getting-started/caching',
        {
          type: 'doc',
          label: 'Notifications',
          id: 'cloud/projects/notifications',
        },
      ],
    },
    {
      // Projects Management
      type: 'category',
      collapsed: false,
      collapsible: false,
      label: 'Projects management',
      className: 'category-cloud-projects',
      items: [
        'cloud/projects/overview',
        {
          type: 'doc',
          label: 'Project settings',
          id: 'cloud/projects/settings',
          customProps: {
            updated: true,
          },
        },
        'cloud/projects/collaboration',
        'cloud/projects/runtime-logs',
      ],
    },
    {
      // Deployments
      type: 'category',
      collapsed: false,
      collapsible: false,
      label: 'Deployments',
      className: 'category-cloud-deployments',
      items: ['cloud/projects/deploys', 'cloud/projects/deploys-history'],
    },
    {
      // Account Management
      type: 'category',
      collapsed: false,
      collapsible: false,
      className: 'category-cloud-account',
      label: 'Account management',
      items: [
        'cloud/account/account-settings',
        {
          type: 'doc',
          id: 'cloud/account/account-billing',
          label: 'Account billing & invoices',
          customProps: {
            updated: false,
          },
        },
      ],
    },
    {
      // CLI
      type: 'category',
      collapsed: false,
      collapsible: false,
      className: 'category-cloud-cli',
      label: 'Command Line Interface',
      items: [
        {
          type: 'doc',
          id: 'cloud/cli/cloud-cli',
          label: 'Strapi Cloud CLI',
          customProps: {
            new: false,
          },
        },
      ],
    },
    {
      // Advanced configurations
      type: 'category',
      collapsed: false,
      collapsible: false,
      className: 'category-cloud-configurations',
      label: 'Advanced configuration',
      items: [
        'cloud/advanced/database',
        {
          type: 'doc',
          id: 'cloud/advanced/email',
          label: 'Email provider',
          customProps: {
            new: false,
          },
        },
        {
          type: 'doc',
          id: 'cloud/advanced/upload',
          label: 'Upload provider',
          customProps: {
            new: false,
          },
        },
      ],
    },
  ],
  // devDocsRestApiSidebar: [
  //   {
  //     type: 'link',
  //     label: '⬅️ Back to Dev Docs content',
  //     href: '/cms/intro'
  //   },
  //   {
  //     type: 'category',
  //     collapsed: false,
  //     label: 'REST API reference',
  //     link: {
  //       type: 'doc',
  //       id: 'cms/api/rest'
  //     },
  //     items: [
  //       {
  //         type: 'category',
  //         label: 'Endpoints and basic requests',
  //         link: {type: 'doc', id: 'cms/api/rest'},
  //         collapsed: false,
  //         items: [
  //           {
  //             type: 'link',
  //             label: 'Endpoints',
  //             href: '/cms/api/rest#endpoints',
  //           },
  //           {
  //             type: 'link',
  //             label: 'Get documents',
  //             href: '/cms/api/rest#get-all'
  //           },
  //           {
  //             type: 'link',
  //             label: 'Get a document',
  //             href: '/cms/api/rest#get'
  //           },
  //           {
  //             type: 'link',
  //             label: 'Create a document',
  //             href: '/cms/api/rest#create'
  //           },
  //           {
  //             type: 'link',
  //             label: 'Update a document',
  //             href: '/cms/api/rest#update'
  //           },
  //           {
  //             type: 'link',
  //             label: 'Delete a document',
  //             href: '/cms/api/rest#delete'
  //           },
  //         ]
  //       },
  //       {
  //         type: 'doc',
  //         id: 'cms/api/rest/interactive-query-builder',
  //         label: '✨ Interactive Query Builder'
  //       },
  //       {
  //         type: 'doc',
  //         id: 'cms/api/rest/parameters'
  //       },
  //       {
  //         type: 'category',
  //         label: 'Populate and Select',
  //         link: {type: 'doc', id: 'cms/api/rest/populate-select'},
  //         collapsed: false,
  //         items: [
  //           {
  //             type: 'link',
  //             label: 'Field selection',
  //             href: '/cms/api/rest/populate-select#field-selection',
  //           },
  //           {
  //             type: 'link',
  //             label: 'Population',
  //             href: '/cms/api/rest/populate-select#population',
  //           },
  //         ]
  //       },
  //       {
  //         type: 'category',
  //         collapsed: false,
  //         label: 'Filters, Locale, Publication State',
  //         link: {type: 'doc', id: 'cms/api/rest/filters-locale-publication' },
  //         items: [
  //           {
  //             type: 'link',
  //             label: 'Filtering',
  //             href: '/cms/api/rest/filters'
  //           },
  //           {
  //             type: 'link',
  //             label: 'Complex filtering',
  //             href: '/cms/api/rest/filters-locale-publication#complex-filtering',
  //           },
  //           {
  //             type: 'link',
  //             label: 'Deep filtering',
  //             href: '/cms/api/rest/filters-locale-publication#deep-filtering',
  //           },
  //           {
  //             type: 'link',
  //             label: 'Locale',
  //             href: '/cms/api/rest/locale',
  //           },
  //           {
  //             type: 'link',
  //             label: 'Status',
  //             href: '/cms/api/rest/status',
  //           },
  //         ],
  //       },
  //       {
  //         type: 'category',
  //         collapsed: false,
  //         label: 'Sort and Pagination',
  //         link: { type: 'doc', id: 'cms/api/rest/sort-pagination'},
  //         items: [
  //           {
  //             type: 'link',
  //             label: 'Sorting',
  //             href: '/cms/api/rest/sort-pagination#sorting'
  //           },
  //           {
  //             type: 'link',
  //             label: 'Pagination',
  //             href: '/cms/api/rest/sort-pagination#pagination'
  //           },
  //           {
  //             type: 'link',
  //             label: 'Pagination by page',
  //             href: '/cms/api/rest/sort-pagination#pagination-by-page'
  //           },
  //           {
  //             type: 'link',
  //             label: 'Pagination by offset',
  //             href: '/cms/api/rest/sort-pagination#pagination-by-offset'
  //           },
  //         ]
  //       },
  //       {
  //         type: 'category',
  //         collapsed: false,
  //         label: 'Relations',
  //         link: {type: 'doc', id: 'cms/api/rest/relations'},
  //         items: [
  //           {
  //             type: 'link',
  //             label: 'connect',
  //             href: '/cms/api/rest/relations#connect'
  //           },
  //           {
  //             type: 'link',
  //             label: 'disconnect',
  //             href: '/cms/api/rest/relations#disconnect'
  //           },
  //           {
  //             type: 'link',
  //             label: 'set',
  //             href: '/cms/api/rest/relations#set'
  //           },
  //         ]
  //       },
  //     ]
  //   },
  //   {
  //     type: "category",
  //     label: "Rest API guides",
  //     collapsed: false,
  //     link: {
  //       type: 'doc',
  //       id: 'cms/api/rest/guides/intro',
  //     },
  //     items: [
  //       {
  //         type: "doc",
  //         label: "Understanding populate",
  //         id: 'cms/api/rest/guides/understanding-populate',
  //       },
  //       {
  //         type: "doc",
  //         label: "How to populate creator fields",
  //         id: 'cms/api/rest/guides/populate-creator-fields',
  //       },
  //       {
  //         type: 'link',
  //         label: 'Additional resources',
  //         href: '/cms/api/rest/guides/intro#additional-resources'
  //       },
  //     ],
  //   }
  // ],
  // devDocsConfigSidebar: [
  //   {
  //     type: 'link',
  //     label: '⬅️ Back to Dev Docs content',
  //     href: '/cms/intro'
  //   },
  //   {
  //     type: 'category',
  //     collapsed: false,
  //     label: 'Configuration',
  //     link: {
  //       type: 'doc',
  //       id: 'cms/configurations',
  //     },
  //     items: [
  //       {
  //         type: 'doc',
  //         label: 'Introduction to configurations',
  //         id: 'cms/configurations',
  //       },
  //       {
  //         type: 'category',
  //         collapsed: false,
  //         label: 'Base configurations',
  //         link: {
  //           type: 'doc',
  //           id: 'cms/configurations'
  //         },
  //         items: [
  //           'cms/configurations/database',
  //           'cms/configurations/server',
  //           'cms/configurations/admin-panel',
  //           'cms/configurations/middlewares',
  //           'cms/configurations/api',
  //         ]
  //       },
  //       {
  //         type: 'category',
  //         label: 'Additional configurations',
  //         collapsed: false,
  //         link: {
  //           type: 'doc',
  //           id: 'cms/configurations'
  //         },
  //         items: [
  //           'cms/configurations/plugins',
  //           'cms/configurations/typescript',
  //           'cms/configurations/api-tokens',
  //           'cms/configurations/functions',
  //           'cms/configurations/cron',
  //           'cms/configurations/environment',
  //           'cms/configurations/sso',
  //           'cms/configurations/features',
  //         ]
  //       },
  //       {
  //         type: 'category',
  //         label: 'Guides',
  //         collapsed: false,
  //         link: {
  //           type: 'doc',
  //           id: 'cms/configurations'
  //         },
  //         items: [
  //           'cms/configurations/guides/rbac',
  //           'cms/configurations/guides/public-assets',
  //           'cms/configurations/guides/access-cast-environment-variables',
  //           'cms/configurations/guides/access-configuration-values',
  //           'cms/configurations/guides/use-cron-jobs',
  //         ]
  //       }
  //     ]
  //   },
  // ],
  // devDocsMigrationV5Sidebar: [
  //   {
  //     type: 'link',
  //     label: '⬅️ Back to Dev Docs content',
  //     href: '/cms/intro'
  //   },
  //   {
  //     type: 'category',
  //     collapsed: false,
  //     link: {
  //       type: 'doc',
  //       id: 'cms/migration/v4-to-v5/introduction-and-faq'
  //     },
  //     label: 'Upgrade to Strapi 5',
  //     customProps: {
  //       new: true,
  //     },
  //     items: [
  //       {
  //         type: "doc",
  //         label: "Introduction and FAQ",
  //         id: "cms/migration/v4-to-v5/introduction-and-faq"
  //       },
  //       {
  //         type: "doc",
  //         label: "Step-by-step guide",
  //         id: "cms/migration/v4-to-v5/step-by-step"
  //       },
  //       {
  //         type: "doc",
  //         label: "Upgrade tool reference",
  //         id: 'cms/upgrade-tool',
  //       },
  //       {
  //         type: "category",
  //         collapsible: true,
  //         collapsed: true,
  //         label: "Breaking changes",
  //         link: {
  //           type: 'doc',
  //           id: 'cms/migration/v4-to-v5/breaking-changes'
  //         },
  //         items: [
  //           {
  //             type: "autogenerated",
  //             dirName: 'cms/migration/v4-to-v5/breaking-changes'
  //           },
  //         ]
  //       },
  //       {
  //         type: 'category',
  //         label: 'Specific resources',
  //         collapsed: false,
  //         link: { type: 'doc', id: 'cms/migration/v4-to-v5/additional-resources/introduction' },
  //         items: [
  //           'cms/migration/v4-to-v5/additional-resources/introduction',
  //           'cms/migration/v4-to-v5/additional-resources/from-entity-service-to-document-service',
  //           'cms/migration/v4-to-v5/additional-resources/plugins-migration',
  //           'cms/migration/v4-to-v5/additional-resources/helper-plugin',
  //         ]
  //       }
  //     ]
  //   },

  // ]
};

module.exports = sidebars;
