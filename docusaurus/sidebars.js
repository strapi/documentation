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
    { // Getting Started
      type: 'category',
      label: 'Getting Started',
      className: 'category-getting-started',
      collapsible: false,
      items: [
        'dev-docs/quick-start',
        'dev-docs/project-structure',
        'dev-docs/installation',
        {
          type: 'doc',
          id: 'user-docs/features/admin-panel',
          label: 'Admin panel',
        },
        {
          type: 'doc',
          id: 'user-docs/features/content-manager',
          label: 'Content Manager',
        },
        {
          type: 'doc',
          id: 'user-docs/features/content-type-builder',
          label: 'Content Type Builder',
        },
        'dev-docs/deployment',
      ]
    },
    { // Features
      type: 'category',
      label: 'Features',
      collapsible: false,
      className: 'category-features',
      items: [
        {
          type: 'doc',
          label: 'API Tokens',
          id: 'user-docs/features/api-tokens',
        },
        {
          type: 'doc',
          label: 'Audit Logs',
          id: 'user-docs/features/audit-logs',
        },
        {
          type: 'doc',
          label: 'Content History',
          id: 'user-docs/features/content-history'
        },
        {
          type: 'doc',
          label: 'Data Management',
          id: 'user-docs/features/data-management'
        },
        {
          type: 'doc',
          label: 'Draft & Publish',
          id: 'user-docs/features/draft-and-publish'
        },
        'user-docs/features/email',
        {
          type: 'doc',
          label: 'Internationalization (i18n)',
          id: 'user-docs/features/internationalization',
        },
        {
          type: 'doc',
          label: 'Media Library',
          id: 'user-docs/features/media-library',
        },
        {
          type: 'doc',
          label: 'Role-Based Access Control (RBAC)',
          id: 'user-docs/features/rbac',
        },
        {
          type: 'doc',
          label: 'Releases',
          id: 'user-docs/features/releases',
        },
        {
          type: 'doc',
          label: 'Review Workflows',
          id: 'user-docs/features/review-workflows',
        },
        {
          type: 'doc',
          label: 'Single Sign-On (SSO)',
          id: 'user-docs/features/sso',
        },
        {
          type: 'doc',
          label: 'Static Preview',
          id: 'user-docs/features/preview',
        },
        {
          type: 'doc',
          label: 'Users & Permissions',
          id: 'user-docs/features/users-permissions',
        },
        {
          type: 'category',
          label: 'Strapi plugins',
          collapsed: true,
          items: [
            {
              type: 'doc',
              label: 'Documentation',
              id: 'dev-docs/plugins/documentation',
            },
            {
              type: 'doc',
              label: 'GraphQL',
              id: 'dev-docs/plugins/graphql',
            },
            {
              type: 'doc',
              label: 'Sentry',
              id: 'dev-docs/plugins/sentry',
            },
          ]
        },

      ]
    },
    { // APIs
      type: 'category',
      label: 'APIs',
      className: 'category-api',
      link: {type: 'doc', id:'dev-docs/api/content-api'},
      collapsible: false,
      collapsed: false,
      items: [
        'dev-docs/api/content-api',
        'dev-docs/api/document',
        {
          type: 'category',
          label: 'REST API',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'dev-docs/api/rest',
              label: 'Endpoints'
            },
            'dev-docs/api/rest/parameters',
            'dev-docs/api/rest/filters',
            'dev-docs/api/rest/locale',
            'dev-docs/api/rest/status',
            'dev-docs/api/rest/populate-select',
            'dev-docs/api/rest/relations',
            'dev-docs/api/rest/sort-pagination',
            'dev-docs/api/rest/upload',
            'dev-docs/api/rest/interactive-query-builder',
            'dev-docs/api/rest/guides/intro',
          ]
        },
        'dev-docs/api/graphql',
        {
          type: 'category',
          label: 'Document Service API',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'dev-docs/api/document-service',
              label: 'Available methods'
            },
            'dev-docs/api/document-service/fields',
            'dev-docs/api/document-service/filters',
            'dev-docs/api/document-service/locale',
            'dev-docs/api/document-service/middlewares',
            'dev-docs/api/document-service/populate',
            'dev-docs/api/document-service/sort-pagination',
            'dev-docs/api/document-service/status',
          ]
        }
      ]
    },
    { // Configurations
      type: 'category',
      label: 'Configurations',
      collapsed: false,
      collapsible: false,
      className: 'category-configurations',
      items: [
        {
          type: 'doc',
          label: 'Configurations introduction',
          id: 'dev-docs/configurations',
        },
        'dev-docs/configurations/admin-panel',
        'dev-docs/configurations/api',
        'dev-docs/configurations/cron',
        'dev-docs/configurations/database',
        'dev-docs/configurations/environment',
        'dev-docs/configurations/features',
        'dev-docs/configurations/functions',
        'dev-docs/configurations/middlewares',
        'dev-docs/configurations/plugins',
        {
          type: 'doc',
          id: 'dev-docs/providers',
          label: 'Email & Upload Providers'
        },
        'dev-docs/configurations/users-and-permissions-providers',
        'dev-docs/configurations/server',
        'dev-docs/configurations/typescript',
        {
          type: 'category',
          label: 'Guides',
          collapsed: true,
          items: [
            'dev-docs/configurations/guides/access-cast-environment-variables',
            'dev-docs/configurations/guides/access-configuration-values',
            'dev-docs/configurations/guides/public-assets',
            'dev-docs/configurations/guides/rbac',
            'dev-docs/configurations/guides/use-cron-jobs',
            'dev-docs/configurations/guides/configure-sso',
          ]
        }
      ]
    },
    { // Development
      type: 'category',
      label: 'Development',
      className: 'category-development',
      collapsible: false,
      collapsed: false,
      items: [
        'dev-docs/customization',
        {
          type: 'category',
          label: 'Backend customization',
          collapsible: true,
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'dev-docs/backend-customization',
              label: 'How the backend server works'
            },
            'dev-docs/backend-customization/routes',
            'dev-docs/backend-customization/policies',
            'dev-docs/backend-customization/middlewares',
            'dev-docs/backend-customization/controllers',
            'dev-docs/backend-customization/services',
            'dev-docs/backend-customization/models',
            'dev-docs/backend-customization/requests-responses',
            'dev-docs/backend-customization/webhooks',
          ]
        },
        {
          type: 'category',
          label: 'Admin panel customization',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'dev-docs/admin-panel-customization',
              label: 'What\'s possible'
            },
            'dev-docs/admin-panel-customization/bundlers',
            'dev-docs/admin-panel-customization/deployment',
            'dev-docs/admin-panel-customization/extension',
            'dev-docs/admin-panel-customization/host-port-path',
            'dev-docs/admin-panel-customization/options',
            'dev-docs/admin-panel-customization/wysiwyg-editor',
          ]
        },
        'dev-docs/cli',
        {
          type: 'doc',
          id: 'dev-docs/typescript',
          label: 'TypeScript'
        },
        'dev-docs/database-migrations',
        'dev-docs/database-transactions',
        'dev-docs/testing',
        'dev-docs/error-handling',
        'dev-docs/templates',
      ]
    },
    { // Plugins
      type: 'category',
      label: 'Plugins',
      className: 'category-plugins',
      collapsible: false,
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'user-docs/plugins/installing-plugins-via-marketplace',
          label: 'Marketplace'
        },
        {
          type: 'category',
          label: 'Plugins development',
          collapsed: true,
          items: [
            {
              type: 'doc',
              label: 'Developing plugins',
              id: 'dev-docs/plugins/developing-plugins'
            },
            'dev-docs/plugins/development/create-a-plugin',
            'dev-docs/plugins/development/plugin-sdk',
            'dev-docs/plugins/development/plugin-structure',
            'dev-docs/custom-fields',
            'dev-docs/plugins/admin-panel-api',
            'dev-docs/plugins/server-api',
            'dev-docs/plugins-extension',
          ]
        }
      ]
    },

    { // Upgrades
      type: 'category',
      label: 'Upgrades',
      className: 'category-upgrade',
      collapsible: false,
      collapsed: false,
      items: [
        'dev-docs/upgrade-tool',
        {
          type: 'category',
          label: 'v4 → v5',
          collapsed: true,
          items: [
            'dev-docs/migration/v4-to-v5/introduction-and-faq',
            'dev-docs/migration/v4-to-v5/step-by-step',
            'dev-docs/migration/v4-to-v5/breaking-changes',
            'dev-docs/migration/v4-to-v5/additional-resources/introduction'
          ]
        },
      ]
    }
  ],

  userDocsSidebar: [
    {
      type: 'category',
      collapsed: false,
      label: 'Getting Started',
      link: {
        type: "doc",
        id: "user-docs/intro",
      },
      items: [
        'user-docs/intro',
        {
          type: 'doc',
          id: 'user-docs/getting-started/user-guide-fundamentals',
          customProps: {
            updated: true,
          }
        },
        'user-docs/getting-started/setting-up-admin-panel',
      ],
    },
    {
      type: 'category',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'user-docs/content-manager/introduction-to-content-manager'
      },
      label: 'Content Manager',
      items: [
        'user-docs/content-manager/introduction-to-content-manager',
        'user-docs/content-manager/configuring-view-of-content-type',
        'user-docs/content-manager/writing-content',
        {
          type: 'doc',
          id: 'user-docs/content-manager/working-with-content-history',
          customProps: {
            new: true,
          }
        },
        'user-docs/content-manager/managing-relational-fields',
        'user-docs/content-manager/translating-content',
        'user-docs/content-manager/reviewing-content',
        {
          type: 'doc',
          id: 'user-docs/content-manager/saving-and-publishing-content',
          customProps: {
            updated: true,
          }
        },
        'user-docs/content-manager/adding-content-to-releases',
      ],
    },
    {
      type: 'category',
      collapsed: false,
      label: 'Content-type Builder',
      link: {
        type: "doc",
        id: "user-docs/content-type-builder/introduction-to-content-types-builder",
      },
      items: [
        {
          type: 'autogenerated',
          dirName: 'user-docs/content-type-builder'
        }
      ]
    },
    {
      type: 'category',
      collapsed: false,
      label: 'Media Library',
      link: {
        type: "doc",
        id: "user-docs/media-library/introduction-to-the-media-library",
      },
      items: [
        {
          type: 'autogenerated',
          dirName: 'user-docs/media-library'
        }
      ]
    },
    {
      type: "category",
      collapsed: false,
      label: "Releases",
      link: {
        type: "doc",
        id: "user-docs/releases/introduction",
      },
      items: [
        'user-docs/releases/introduction',
        'user-docs/releases/creating-a-release',
        'user-docs/releases/managing-a-release',
      ],
    },
    {
      type: 'category',
      collapsed: false,
      label: 'Users, Roles & Permissions',
      link: {
        type: "doc",
        id: "user-docs/users-roles-permissions/introduction-to-users-roles-permissions",
      },
      items: [
        {
          type: 'autogenerated',
          dirName: 'user-docs/users-roles-permissions'
        }
      ]
    },
    {
      type: 'category',
      collapsed: false,
      label: 'Plugins',
      link: {
        type: "doc",
        id: "user-docs/plugins/introduction-to-plugins",
      },
      items: [
        {
          type: 'autogenerated',
          dirName: 'user-docs/plugins'
        }
      ]
    },
    {
      type: 'category',
      collapsed: false,
      label: 'Settings',
      link: {
        type: "doc",
        id: "user-docs/settings/introduction",
      },
      items: [
       'user-docs/settings/introduction',
       'user-docs/settings/configuring-users-permissions-plugin-settings',
       'user-docs/settings/audit-logs',
        {
          type: 'category',
          collapsed: false,
          label: 'Configuring global settings',
          link: {
            type: 'doc',
            id: 'user-docs/settings/introduction'
          },
          items: [
            'user-docs/settings/admin-panel',
            'user-docs/settings/API-tokens',
            'user-docs/settings/internationalization',
            'user-docs/settings/media-library-settings',
            'user-docs/settings/releases',
            {
              type: 'doc',
              label: 'Review Workflows',
              id: 'user-docs/settings/review-workflows',
            },
            'user-docs/settings/single-sign-on',
            'user-docs/settings/transfer-tokens',
          ]
        },
      ],
    },
  ],
  cloudSidebar: [
    {
      type: "category",
      collapsed: false,
      label: "Getting Started",
      link: {
        type: "doc",
        id: "cloud/getting-started/intro",
      },
      items: [
        "cloud/getting-started/intro",
        {
          type: "doc",
          label: "Cloud fundamentals",
          id: "cloud/getting-started/cloud-fundamentals",
          customProps: {
            new: false,
          },
        },
        {
          type: "category",
          label: "Project deployment",
          link: { type: "doc", id: "cloud/getting-started/deployment-options" },
          customProps: {
            updated: false,
          },
          items: [
            {
              type: "doc",
              id: "cloud/getting-started/deployment",
              customProps: {
                updated: true,
              },
            },
            {
              type: "doc",
              id: "cloud/getting-started/deployment-cli",
              customProps: {
                new: true,
              },
             },
          ],
        },
        {
          type: "doc",
          id: "cloud/getting-started/usage-billing",
          customProps: {
            updated: false,
          },
        },
        "cloud/getting-started/caching",
        {
          type: "doc",
          label: "Notifications",
          id: "cloud/projects/notifications",
        },
      ],
    },
    {
      type: "category",
      collapsed: false,
      label: "Projects management",
      link: {
        type: "doc",
        id: "cloud/projects/overview",
      },
      items: [
        "cloud/projects/overview",
        {
          type: "doc",
          label: "Project settings",
          id: "cloud/projects/settings",
          customProps: {
            updated: true,
          },
        },
        "cloud/projects/collaboration",
        "cloud/projects/runtime-logs",
      ],
    },
    {
      type: "category",
      collapsed: false,
      label: "Deployments",
      link: {
        type: "doc",
        id: "cloud/projects/deploys",
      },
      items: ["cloud/projects/deploys", "cloud/projects/deploys-history"],
    },
    {
      type: "category",
      collapsed: false,
      label: "Account management",
      link: {
        type: "doc",
        id: "cloud/account/account-settings",
      },
      items: [
        "cloud/account/account-settings",
        {
          type: "doc",
          id: "cloud/account/account-billing",
          label: "Account billing & invoices",
          customProps: {
            updated: false,
          },
        },
      ],
    },
    {
      type: "category",
      collapsed: false,
      label: "Command Line Interface",
      link: {
        type: "doc",
        id: "cloud/cli/cloud-cli",
      },
      items: [
        {
          type: "doc",
          id: "cloud/cli/cloud-cli",
          label: "Strapi Cloud CLI",
          customProps: {
            new: true,
          },
        },
      ],
    },
    {
      type: "category",
      collapsed: false,
      label: "Advanced configuration",
      link: {
        type: "doc",
        id: "cloud/advanced/database",
      },
      items: [
        "cloud/advanced/database",
        {
          type: "doc",
          id: "cloud/advanced/email",
          label: "Email provider",
          customProps: {
            new: false,
          },
        },
        {
          type: "doc",
          id: "cloud/advanced/upload",
          label: "Upload provider",
          customProps: {
            new: false,
          },
        },
      ],
    },
  ],
  // cmsSidebar: [
  //   {
  //     type: 'link',
  //     label: '⬅️ Back to Dev Docs content',
  //     href: '/dev-docs/intro'
  //   },
  //   {
  //     type: 'category',
  //     collapsed: false,
  //     label: 'REST API reference',
  //     link: {
  //       type: 'doc',
  //       id: 'dev-docs/api/rest'
  //     },
  //     items: [
  //       {
  //         type: 'category',
  //         label: 'Endpoints and basic requests',
  //         link: {type: 'doc', id: 'dev-docs/api/rest'},
  //         collapsed: false,
  //         items: [
  //           {
  //             type: 'link',
  //             label: 'Endpoints',
  //             href: '/dev-docs/api/rest#endpoints',
  //           },
  //           {
  //             type: 'link',
  //             label: 'Get documents',
  //             href: '/dev-docs/api/rest#get-all'
  //           },
  //           {
  //             type: 'link',
  //             label: 'Get a document',
  //             href: '/dev-docs/api/rest#get'
  //           },
  //           {
  //             type: 'link',
  //             label: 'Create a document',
  //             href: '/dev-docs/api/rest#create'
  //           },
  //           {
  //             type: 'link',
  //             label: 'Update a document',
  //             href: '/dev-docs/api/rest#update'
  //           },
  //           {
  //             type: 'link',
  //             label: 'Delete a document',
  //             href: '/dev-docs/api/rest#delete'
  //           },
  //         ]
  //       },
  //       {
  //         type: 'doc',
  //         id: 'dev-docs/api/rest/interactive-query-builder',
  //         label: '✨ Interactive Query Builder'
  //       },
  //       {
  //         type: 'doc',
  //         id: 'dev-docs/api/rest/parameters'
  //       },
  //       {
  //         type: 'category',
  //         label: 'Populate and Select',
  //         link: {type: 'doc', id: 'dev-docs/api/rest/populate-select'},
  //         collapsed: false,
  //         items: [
  //           {
  //             type: 'link',
  //             label: 'Field selection',
  //             href: '/dev-docs/api/rest/populate-select#field-selection',
  //           },
  //           {
  //             type: 'link',
  //             label: 'Population',
  //             href: '/dev-docs/api/rest/populate-select#population',
  //           },
  //         ]
  //       },
  //       {
  //         type: 'category',
  //         collapsed: false,
  //         label: 'Filters, Locale, Publication State',
  //         link: {type: 'doc', id: 'dev-docs/api/rest/filters-locale-publication' },
  //         items: [
  //           {
  //             type: 'link',
  //             label: 'Filtering',
  //             href: '/dev-docs/api/rest/filters'
  //           },
  //           {
  //             type: 'link',
  //             label: 'Complex filtering',
  //             href: '/dev-docs/api/rest/filters-locale-publication#complex-filtering',
  //           },
  //           {
  //             type: 'link',
  //             label: 'Deep filtering',
  //             href: '/dev-docs/api/rest/filters-locale-publication#deep-filtering',
  //           },
  //           {
  //             type: 'link',
  //             label: 'Locale',
  //             href: '/dev-docs/api/rest/locale',
  //           },
  //           {
  //             type: 'link',
  //             label: 'Status',
  //             href: '/dev-docs/api/rest/status',
  //           },
  //         ],
  //       },
  //       {
  //         type: 'category',
  //         collapsed: false,
  //         label: 'Sort and Pagination',
  //         link: { type: 'doc', id: 'dev-docs/api/rest/sort-pagination'},
  //         items: [
  //           {
  //             type: 'link',
  //             label: 'Sorting',
  //             href: '/dev-docs/api/rest/sort-pagination#sorting'
  //           },
  //           {
  //             type: 'link',
  //             label: 'Pagination',
  //             href: '/dev-docs/api/rest/sort-pagination#pagination'
  //           },
  //           {
  //             type: 'link',
  //             label: 'Pagination by page',
  //             href: '/dev-docs/api/rest/sort-pagination#pagination-by-page'
  //           },
  //           {
  //             type: 'link',
  //             label: 'Pagination by offset',
  //             href: '/dev-docs/api/rest/sort-pagination#pagination-by-offset'
  //           },
  //         ]
  //       },
  //       {
  //         type: 'category',
  //         collapsed: false,
  //         label: 'Relations',
  //         link: {type: 'doc', id: 'dev-docs/api/rest/relations'},
  //         items: [
  //           {
  //             type: 'link',
  //             label: 'connect',
  //             href: '/dev-docs/api/rest/relations#connect'
  //           },
  //           {
  //             type: 'link',
  //             label: 'disconnect',
  //             href: '/dev-docs/api/rest/relations#disconnect'
  //           },
  //           {
  //             type: 'link',
  //             label: 'set',
  //             href: '/dev-docs/api/rest/relations#set'
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
  //       id: 'dev-docs/api/rest/guides/intro',
  //     },
  //     items: [
  //       {
  //         type: "doc",
  //         label: "Understanding populate",
  //         id: 'dev-docs/api/rest/guides/understanding-populate',
  //       },
  //       {
  //         type: "doc",
  //         label: "How to populate creator fields",
  //         id: 'dev-docs/api/rest/guides/populate-creator-fields',
  //       },
  //       {
  //         type: 'link',
  //         label: 'Additional resources',
  //         href: '/dev-docs/api/rest/guides/intro#additional-resources'
  //       },
  //     ],
  //   }
  // ],
  // devDocsConfigSidebar: [
  //   {
  //     type: 'link',
  //     label: '⬅️ Back to Dev Docs content',
  //     href: '/dev-docs/intro'
  //   },
  //   {
  //     type: 'category',
  //     collapsed: false,
  //     label: 'Configuration',
  //     link: {
  //       type: 'doc',
  //       id: 'dev-docs/configurations',
  //     },
  //     items: [
  //       {
  //         type: 'doc',
  //         label: 'Introduction to configurations',
  //         id: 'dev-docs/configurations',
  //       },
  //       {
  //         type: 'category',
  //         collapsed: false,
  //         label: 'Base configurations',
  //         link: {
  //           type: 'doc',
  //           id: 'dev-docs/configurations'
  //         },
  //         items: [
  //           'dev-docs/configurations/database',
  //           'dev-docs/configurations/server',
  //           'dev-docs/configurations/admin-panel',
  //           'dev-docs/configurations/middlewares',
  //           'dev-docs/configurations/api',
  //         ]
  //       },
  //       {
  //         type: 'category',
  //         label: 'Additional configurations',
  //         collapsed: false,
  //         link: {
  //           type: 'doc',
  //           id: 'dev-docs/configurations'
  //         },
  //         items: [
  //           'dev-docs/configurations/plugins',
  //           'dev-docs/configurations/typescript',
  //           'dev-docs/configurations/api-tokens',
  //           'dev-docs/configurations/functions',
  //           'dev-docs/configurations/cron',
  //           'dev-docs/configurations/environment',
  //           'dev-docs/configurations/sso',
  //           'dev-docs/configurations/features',
  //         ]
  //       },
  //       {
  //         type: 'category',
  //         label: 'Guides',
  //         collapsed: false,
  //         link: {
  //           type: 'doc',
  //           id: 'dev-docs/configurations'
  //         },
  //         items: [
  //           'dev-docs/configurations/guides/rbac',
  //           'dev-docs/configurations/guides/public-assets',
  //           'dev-docs/configurations/guides/access-cast-environment-variables',
  //           'dev-docs/configurations/guides/access-configuration-values',
  //           'dev-docs/configurations/guides/use-cron-jobs',
  //         ]
  //       }
  //     ]
  //   },
  // ],
  // devDocsMigrationV5Sidebar: [
  //   {
  //     type: 'link',
  //     label: '⬅️ Back to Dev Docs content',
  //     href: '/dev-docs/intro'
  //   },
  //   {
  //     type: 'category',
  //     collapsed: false,
  //     link: {
  //       type: 'doc',
  //       id: 'dev-docs/migration/v4-to-v5/introduction-and-faq'
  //     },
  //     label: 'Upgrade to Strapi 5',
  //     customProps: {
  //       new: true,
  //     },
  //     items: [
  //       {
  //         type: "doc",
  //         label: "Introduction and FAQ",
  //         id: "dev-docs/migration/v4-to-v5/introduction-and-faq"
  //       },
  //       {
  //         type: "doc",
  //         label: "Step-by-step guide",
  //         id: "dev-docs/migration/v4-to-v5/step-by-step"
  //       },
  //       {
  //         type: "doc",
  //         label: "Upgrade tool reference",
  //         id: 'dev-docs/upgrade-tool',
  //       },
  //       {
  //         type: "category",
  //         collapsible: true,
  //         collapsed: true,
  //         label: "Breaking changes",
  //         link: {
  //           type: 'doc',
  //           id: 'dev-docs/migration/v4-to-v5/breaking-changes'
  //         },
  //         items: [
  //           {
  //             type: "autogenerated",
  //             dirName: 'dev-docs/migration/v4-to-v5/breaking-changes'
  //           },
  //         ]
  //       },
  //       {
  //         type: 'category',
  //         label: 'Specific resources',
  //         collapsed: false,
  //         link: { type: 'doc', id: 'dev-docs/migration/v4-to-v5/additional-resources/introduction' },
  //         items: [
  //           'dev-docs/migration/v4-to-v5/additional-resources/introduction',
  //           'dev-docs/migration/v4-to-v5/additional-resources/from-entity-service-to-document-service',
  //           'dev-docs/migration/v4-to-v5/additional-resources/plugins-migration',
  //           'dev-docs/migration/v4-to-v5/additional-resources/helper-plugin',
  //         ]
  //       }
  //     ]
  //   },

  // ]
};

module.exports = sidebars;
