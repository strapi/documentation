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
        },
        'cms/deployment',
      ]
    },
    { // Features
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
          id: 'cms/features/content-history'
        },
        'cms/features/custom-fields',
        {
          type: 'doc',
          label: 'Data Management',
          id: 'cms/features/data-management'
        },
        {
          type: 'doc',
          label: 'Draft & Publish',
          id: 'cms/features/draft-and-publish'
        },
        'cms/features/email',

        {
          type: 'doc',
          label: 'Internationalization (i18n)',
          id: 'cms/features/internationalization',
        },
        {
          type: 'doc',
          label: 'Media Library',
          id: 'cms/features/media-library',
        },
        {
          type: 'doc',
          label: 'Preview',
          id: 'cms/features/preview',
          customProps: {
            new: true,
          }
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
          ]
        },

      ]
    },
    { // APIs
      type: 'category',
      label: 'APIs',
      className: 'category-cms-api',
      link: {type: 'doc', id:'cms/api/content-api'},
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
              label: 'Endpoints'
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
          ]
        },
        {
          type: 'doc',
          label: 'Strapi Client',
          id: 'cms/api/client',
          customProps: {
            new: true,
          }
        },
        'cms/api/graphql',
        {
          type: 'category',
          label: 'Document Service API',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'cms/api/document-service',
              label: 'Available methods'
            },
            'cms/api/document-service/fields',
            'cms/api/document-service/filters',
            'cms/api/document-service/locale',
            'cms/api/document-service/middlewares',
            'cms/api/document-service/populate',
            'cms/api/document-service/sort-pagination',
            'cms/api/document-service/status',
          ]
        }
      ]
    },
    { // Configurations
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
        'cms/configurations/admin-panel',
        'cms/configurations/api',
        'cms/configurations/cron',
        {
          type: 'category',
          collapsed: true,
          collapsible: true,
          label: "Database",
          items: [
            {
              type: 'doc',
              id: 'cms/configurations/database',
              label: 'Database configuration',
            },
            'cms/database-migrations',
            'cms/database-transactions',
          ]
        },
        'cms/configurations/environment',
        'cms/configurations/features',
        // 'cms/configurations/functions', // TODO: moved to Development — add the TOC component here to highlight the move
        'cms/configurations/middlewares',
        'cms/configurations/plugins',
        // { // TODO: moved to Features - add the TOC component here to highlight the move
          // type: 'doc',
          // id: 'cms/providers',
          // label: 'Email & Upload Providers'
        // },
        // 'cms/configurations/users-and-permissions-providers', // TODO: removed from TOC - add the TOC component here to highlight where to find them now
        'cms/configurations/server',
        {
          type: 'category',
          label: 'Guides',
          collapsed: true,
          items: [
            // 'cms/configurations/guides/access-cast-environment-variables',  // TODO: removed from TOC and linked from configuration page - add TOC component?
            'cms/configurations/guides/access-configuration-values',
            'cms/configurations/guides/public-assets',
            // 'cms/configurations/guides/rbac', // TODO: removed from TOC and linked from feature page - add TOC component?
            // 'cms/configurations/guides/use-cron-jobs', // TODO: removed from TOC and linked from configuration page - add TOC component?
            // 'cms/configurations/guides/configure-sso', // TODO: removed from TOC and linked from feature page - add TOC component?
          ]
        }
      ]
    },
    { // Development
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
        { // Backend customization
          type: 'category',
          label: 'Backend customization',
          collapsible: true,
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'cms/backend-customization',
              label: 'How the backend server works'
            },
            'cms/backend-customization/requests-responses',
            'cms/backend-customization/routes',
            'cms/backend-customization/policies',
            'cms/backend-customization/middlewares',
            'cms/backend-customization/controllers',
            'cms/backend-customization/services',
            'cms/backend-customization/models',
            'cms/backend-customization/webhooks',
          ]
        },
        { // Admin panel customization
          type: 'category',
          label: 'Admin panel customization',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'cms/admin-panel-customization',
              label: 'What\'s possible' // TODO check if we can keep the page as-is or if we need to create a new "Introdution" page
            },
            // 'cms/admin-panel-customization/logos', // TODO actual page to create
            // 'cms/admin-panel-customization/favicon', // TODO actual page to create
            // 'cms/admin-panel-customization/locales-translations', // TODO actual page to create
            {
              type: 'doc',
              id: 'cms/admin-panel-customization/wysiwyg-editor',
              label: 'Rich text editor',
            },
            'cms/admin-panel-customization/bundlers',
            // 'cms/admin-panel-customization/deployment', // TODO move where appropriate
            {
              type: 'doc',
              id: 'cms/admin-panel-customization/extension',
              label: 'Admin panel extension'
            },
            // 'cms/admin-panel-customization/host-port-path', // TODO move where appropriate
            // 'cms/admin-panel-customization/options', // TODO move where appropriate or remove
          ]
        },
        { 
          type: 'doc',
          label: 'Homepage customization',
          id: 'cms/admin-panel-customization/homepage',
          customProps: {
            new: true,
          }
        },
        // 'cms/cli', // TODO moved to its own category, add TOC component here to highlight it
        // { // TODO moved to introduction, add TOC component here to highlight it
        //   type: 'doc',
        //   id: 'cms/typescript',
        //   label: 'TypeScript'
        // },
        'cms/error-handling',
        'cms/templates',
        'cms/testing',
      ]
    },
    {
      type: 'category',
      label: 'TypeScript',
      collapsed: false,
      collapsible: false,
      className: 'category-cms-typescript', // TODO: add CSS for icon
      items: [
        {
          type: 'doc',
          id: 'cms/typescript',
          label: 'Introduction'
        },
        {
          type: 'doc',
          id: 'cms/configurations/typescript',
          label: 'Configuration'
        },
        {
          type: 'doc',
          id: 'cms/typescript/development',
          label: 'Development'
        },
        {
          type: 'doc',
          id: 'cms/typescript/guides',
          label: 'Guides' // TODO ensure label is overriden
        }
        // 'cms/typescript/adding-support-to-existing-project' // ? will be linked from the Guides page
      ]
    },
    { // Command Line Interface
      type: 'category',
      label: 'Command Line Interface',
      className: 'category-cms-cli', // TODO add CSS for icon
      collapsed: false,
      collapsible: false,
      items: [
        'cms/cli'
      ]
    },
    { // Plugins
      type: 'category',
      label: 'Plugins',
      className: 'category-cms-plugins',
      collapsible: false,
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'cms/plugins/installing-plugins-via-marketplace',
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
              id: 'cms/plugins-development/developing-plugins'
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
          ]
        }
      ]
    },

    { // Upgrades
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
            'cms/migration/v4-to-v5/additional-resources/introduction'
          ]
        },
      ]
    }
  ],

  cloudSidebar: [
    { // Getting Started
      type: "category",
      collapsed: false,
      label: "Getting Started",
      collapsible: false,
      className: "category-cloud-getting-started",
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
          customProps: {
            updated: false,
          },
          items: [
            {
              type: "doc",
              id: "cloud/getting-started/deployment-options",
            },
            {
              type: "doc",
              id: "cloud/getting-started/deployment",
              customProps: {
                updated: false,
              },
            },
            {
              type: "doc",
              id: "cloud/getting-started/deployment-cli",
              customProps: {
                new: false,
              },
             },
          ],
        },
        {
          type: "doc",
          id: "cloud/getting-started/usage-billing",
          customProps: {
            updated: true,
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
    { // Projects Management
      type: "category",
      collapsed: false,
      collapsible: false,
      label: "Projects management",
      className: "category-cloud-projects",
      items: [
        "cloud/projects/overview",
        {
          type: "doc",
          label: "Project settings",
          id: "cloud/projects/settings",
          customProps: {
            updated: false,
          },
        },
        "cloud/projects/collaboration",
        "cloud/projects/runtime-logs",
      ],
    },
    { // Deployments
      type: "category",
      collapsed: false,
      collapsible: false,
      label: "Deployments",
      className: "category-cloud-deployments",
      items: [
        "cloud/projects/deploys",
        "cloud/projects/deploys-history"
      ],
    },
    { // Account Management
      type: "category",
      collapsed: false,
      collapsible: false,
      className: "category-cloud-account",
      label: "Account management",
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
    { // CLI
      type: "category",
      collapsed: false,
      collapsible: false,
      className: "category-cloud-cli",
      label: "Command Line Interface",
      items: [
        {
          type: "doc",
          id: "cloud/cli/cloud-cli",
          label: "Strapi Cloud CLI",
          customProps: {
            new: false,
          },
        },
      ],
    },
    { // Advanced configurations
      type: "category",
      collapsed: false,
      collapsible: false,
      className: "category-cloud-configurations",
      label: "Advanced configuration",
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
