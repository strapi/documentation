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
  devDocsSidebar: [
    { // Getting Started
      type: 'category',
      collapsed: false,
      label: '🚀 Getting Started',
      link: {type: 'doc', id: 'dev-docs/intro'},
      items: [
        {
          type: 'doc',
          id: 'dev-docs/intro',
          customProps: {
            updated: true,
          },
        },
        {
          type: 'doc',
          id: 'dev-docs/quick-start',
          customProps: {
            updated: true,
          },
        },
        {
          type: 'doc',
          id: 'dev-docs/whats-new',
          label: "What's new?",
          customProps: {
            udpated: true
          }
        },
        'dev-docs/faq',
        'dev-docs/community',
        'dev-docs/usage-information',
      ]
    },
    { // Setup & Deployment
      type: 'category',
      collapsed: false,
      label: '⚙️ Setup & Deployment',
      link: {
        type: 'doc',
        id: 'dev-docs/setup-deployment',
      },
      items: [
        {
          type: 'doc',
          label: 'Introduction to Setup & Deployment',
          id: 'dev-docs/setup-deployment',
        },
        {
          type: 'category',
          label: 'Installation',
          link: {type: 'doc', id: 'dev-docs/installation'},
          customProps: {
            updated: true,
          },
          items: [
            {
              type: 'doc',
              label: 'Introduction to installation',
              id: 'dev-docs/installation',
            },
            {
              type: 'doc',
              id: 'dev-docs/installation/cli',
              customProps: {
                updated: true,
              },
            },
            'dev-docs/installation/docker',
          ]
        },
        'dev-docs/project-structure',
        {
          type: 'category',
          label: 'Configuration',
          items: [
            {
              type: 'doc',
              label: 'Introduction to configuration',
              id: 'dev-docs/configurations',
            },
            'dev-docs/configurations/database',
            'dev-docs/configurations/server',
            'dev-docs/configurations/admin-panel',
            'dev-docs/configurations/middlewares',
            'dev-docs/configurations/api',
            'dev-docs/configurations/plugins',
            'dev-docs/configurations/typescript',
            'dev-docs/configurations/api-tokens',
            'dev-docs/configurations/functions',
            'dev-docs/configurations/cron',
            'dev-docs/configurations/environment',
            'dev-docs/configurations/sso',
            'dev-docs/configurations/features',
            'dev-docs/configurations/guides/rbac',
            'dev-docs/configurations/guides/public-assets',
            'dev-docs/configurations/guides/access-cast-environment-variables',
            'dev-docs/configurations/guides/access-configuration-values',
            'dev-docs/configurations/guides/use-cron-jobs',
          ],
        },
        {
          type: 'category',
          label: 'Deployment',
          link: {
            type: 'doc',
            id: 'dev-docs/deployment',
          },
          items: [
           {
              type: 'doc',
              label: 'Introduction to deployment',
              id: 'dev-docs/deployment',
            },
            {
              type: 'doc',
              label: '☁️ Strapi Cloud',
              id: 'cloud/getting-started/deployment',
            },
          ]
        }
      ]
    },
    { // Content APIs
      type: 'category',
      collapsed: false,
      label: '📦 Content API',
      link: {type: 'doc', id: 'dev-docs/api/content-api'},
      items: [
        {
          type: 'doc',
          label: 'APIs Introduction & Concepts',
          id: 'dev-docs/api/content-api',
          customProps: {
            updated: true,
          },
        },
        {
          type: 'category',
          label: 'REST API',
          customProps: {
            updated: true,
          },
          link: {
            type: 'doc',
            id: 'dev-docs/api/rest'
          },
          items: [
            {
              type: 'doc',
              id: 'dev-docs/api/rest',
              label: 'Introduction to REST APIs',
            },
            'dev-docs/api/rest/parameters',
            'dev-docs/api/rest/populate-select',
            'dev-docs/api/rest/filters-locale-publication',
            'dev-docs/api/rest/sort-pagination',
            'dev-docs/api/rest/relations',
            'dev-docs/api/rest/interactive-query-builder',
            'dev-docs/api/rest/guides/intro',
          ]
        },
        {
          type: 'doc',
          id: 'dev-docs/api/graphql',
          customProps: {
            updated: true,
          },
        },
        // {
        //   type: 'category',
        //   label: 'Integrations',
        //   link: {
        //     type: 'doc',
        //     id: 'dev-docs/integrations',
        //   },
        //   items: [
        //     {
        //       type:'doc',
        //       id: 'dev-docs/integrations',
        //       label: 'Introduction to integrations',
        //     },
        //     'dev-docs/integrations/11ty',
        //     'dev-docs/integrations/angular',
        //     'dev-docs/integrations/dart',
        //     'dev-docs/integrations/flutter',
        //     'dev-docs/integrations/gatsby',
        //     'dev-docs/integrations/gridsome',
        //     'dev-docs/integrations/go',
        //     'dev-docs/integrations/graphql',
        //     'dev-docs/integrations/jekyll',
        //     'dev-docs/integrations/laravel',
        //     'dev-docs/integrations/next-js',
        //     'dev-docs/integrations/nuxt-js',
        //     'dev-docs/integrations/php',
        //     'dev-docs/integrations/python',
        //     'dev-docs/integrations/react',
        //     'dev-docs/integrations/ruby',
        //     'dev-docs/integrations/sapper',
        //     'dev-docs/integrations/svelte',
        //     'dev-docs/integrations/vue-js',
        //   ]
        // },
        {
          type: 'category',
          label: 'Document Service API',
          link: {
            type: 'doc',
            id: 'dev-docs/api/document-service'
          },
          customProps: {
            new: true
          },
          items: [
            {
              type: 'doc',
              label: 'Introduction & Concepts',
              id: 'dev-docs/api/document'
            },
            {
              type: 'doc',
              label: 'Available methods',
              id: 'dev-docs/api/document-service'
            },
            {
              type: 'doc',
              label: 'Filters',
              id: 'dev-docs/api/document-service/filters'
            },
            {
              type: 'doc',
              label: 'Populate',
              id: 'dev-docs/api/document-service/populate'
            },
            {
              type: 'doc',
              label: 'Fields',
              id: 'dev-docs/api/document-service/fields'
            },
            {
              type: 'doc',
              label: 'Sort & Pagination',
              id: 'dev-docs/api/document-service/sort-pagination'
            },
            {
              type: 'doc',
              label: 'Locale',
              id: 'dev-docs/api/document-service/locale'
            },
            {
              type: 'doc',
              label: 'Status',
              id: 'dev-docs/api/document-service/status'
            },
            {
              type: 'doc',
              label: 'Middlewares',
              id: 'dev-docs/api/document-service/middlewares'
            },
          ]
        },
      ]
    },
    { // Advanced features
      type: 'category',
      label: '🔧 Advanced features',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'dev-docs/advanced-features'
      },
      items: [
        {
          type: 'doc',
          label: 'Introduction to advanced features',
          id: 'dev-docs/advanced-features',
          customProps: {
            new: true,
          },
        },
        {
          type: 'doc',
          label: 'Internationalization (i18n)',
          customProps: {
            updated: true,
          },
          id: 'dev-docs/i18n',
        },
        {
          type: 'doc',
          id: 'dev-docs/cli',
          customProps: {
            updated: true,
          },
        },
        {
          type: 'category',
          label: 'TypeScript',
          link: {
            type: 'doc',
            id: 'dev-docs/typescript'
          },
          items: [
            'dev-docs/typescript',
            'dev-docs/typescript/development',
            'dev-docs/typescript/adding-support-to-existing-project',
          ]
        },
        {
          type: 'doc',
          label: 'Providers',
          id: 'dev-docs/providers',
        },
        {
          type: 'doc',
          label: 'Templates',
          id: 'dev-docs/templates',
          customProps: {
            updated: true,
          }
        },
        {
          type: 'category',
          label: 'Data management',
          link: {
            type: 'doc',
            id: 'dev-docs/data-management',
          },
          items: [
            {
              type: 'doc',
              label: 'Introduction to data management',
              id: 'dev-docs/data-management',
            },
            'dev-docs/data-management/export',
            'dev-docs/data-management/import',
            {
              type: 'doc',
              label: 'Data transfer',
              id: 'dev-docs/data-management/transfer',
            }
          ],
        },
        'dev-docs/database-migrations',
        'dev-docs/database-transactions',
        'dev-docs/testing',
        'dev-docs/error-handling',
      ]
    },
    { // Customization
      type: 'category',
      collapsed: false,
      label: '🛠 Customization',
      link: {
        type: 'doc',
        id: 'dev-docs/customization',
      },
      items: [
        {
          type: 'doc',
          label: 'Customization Introduction & Concepts',
          id: 'dev-docs/customization',
          customProps: {
            new: true,
          },
        },
        {
          type: 'category',
          label: 'Back-end customization',
          customProps: {
            updated: true,
          },
          link: {
            type: 'doc',
            id: 'dev-docs/backend-customization'
          },
          items: [
            {
              type: 'doc',
              id: 'dev-docs/backend-customization',
              label: 'Introduction to backend customization',
            },
            {
              type: 'doc',
              id: 'dev-docs/backend-customization/requests-responses',
            },
            'dev-docs/backend-customization/routes',
            'dev-docs/backend-customization/policies',
            'dev-docs/backend-customization/middlewares',
            'dev-docs/backend-customization/controllers',
            'dev-docs/backend-customization/services',
            'dev-docs/backend-customization/models',
            'dev-docs/backend-customization/webhooks',
          ]
        },
        {
          type: 'category',
          label: 'Admin panel customization',
          customProps: {
            updated: true,
          },
          link: {
            type: 'doc',
            id: 'dev-docs/admin-panel-customization',
          },
          items: [
            {
              type: 'doc',
              id: 'dev-docs/admin-panel-customization',
              label: 'Introduction to admin panel customization',
            },
            'dev-docs/admin-panel-customization/host-port-path',
            'dev-docs/admin-panel-customization/options',
            'dev-docs/admin-panel-customization/bundlers',
            'dev-docs/admin-panel-customization/wysiwyg-editor',
            'dev-docs/admin-panel-customization/extension',
            'dev-docs/admin-panel-customization/deployment',
          ]
        },
      ]
    },
    { // Plugins
      type: 'category',
      collapsed: false,
      label: '🔌 Plugins',
      link: {
        type: 'doc',
        id: 'dev-docs/plugins',
      },
      items: [
        {
          type: 'doc',
          label: 'Plugins Introduction & Concepts',
          id: 'dev-docs/plugins'
        },
        {
          type: 'category',
          label: 'Using plugins',
          link: {
            type: 'doc',
            id: 'dev-docs/plugins/using-plugins'
          },
          items: [
            {
              type: 'doc',
              label: 'Introduction to using plugins',
              id: 'dev-docs/plugins/using-plugins'
            },
            {
              type: 'doc',
              label: 'Documentation',
              id: 'dev-docs/plugins/documentation',
            },
            {
              type: 'doc',
              label: 'Email',
              id: 'dev-docs/plugins/email',
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
            {
              type: 'doc',
              label: 'Upload',
              id: 'dev-docs/plugins/upload',
            },
            {
              type: 'doc',
              label: 'Users & Permissions',
              id: 'dev-docs/plugins/users-permissions',
            },
          ]
        },
        {
          type: 'category',
          label: 'Developing plugins',
          link: {
            type: 'doc',
            id: 'dev-docs/plugins/developing-plugins',
          },
          items: [
            {
              type: 'doc',
              label: 'Introduction to developing plugins',
              id: 'dev-docs/plugins/developing-plugins'
            },
            'dev-docs/plugins/development/create-a-plugin',
            'dev-docs/plugins/development/plugin-structure',
            'dev-docs/plugins/development/plugin-sdk',
            {
              type: 'doc',
              id: 'dev-docs/plugins/admin-panel-api',
              label: 'Admin Panel API',
            },
            {
              type: 'doc',
              id: 'dev-docs/plugins/server-api',
              label: 'Server API',
            },
            'dev-docs/custom-fields',
            'dev-docs/plugins-extension',
            {
              type: 'category',
              label: 'Guides',
              link: {
                type: 'doc',
                id: 'dev-docs/plugins/developing-plugins',
              },
              items: [
                'dev-docs/plugins/guides/store-and-access-data',
                'dev-docs/plugins/guides/pass-data-from-server-to-admin',
                'dev-docs/plugins/development/create-a-plugin',
              ]
            }
          ]
        }
      ]
    },
    { // Update & Migration
      type: 'category',
      collapsed: false,
      label: '♻️ Upgrades',
      customProps: {
        new: true,
      },
      link: {
        type: 'doc',
        id: 'dev-docs/upgrades',
      },
      items: [
        {
          type: 'doc',
          label: 'Introduction to upgrades',
          id: 'dev-docs/upgrades',
        },
        {
          type: 'doc',
          id: 'dev-docs/upgrade-tool',
        },
        {
          type: 'category',
          collapsed: false,
          link: {
            type: 'doc',
            id: 'dev-docs/migration/v4-to-v5/introduction-and-faq'
          },
          label: 'Upgrade to Strapi 5',
          items: [
            {
              type: 'doc',
              label: 'Introduction and FAQ',
              id: 'dev-docs/migration/v4-to-v5/introduction-and-faq'
            },
            {
              type: 'doc',
              label: 'Step-by-step guide',
              id: 'dev-docs/migration/v4-to-v5/step-by-step'
            },
            {
              type: 'doc',
              label: 'Breaking changes list',
              id: 'dev-docs/migration/v4-to-v5/breaking-changes',
            },
            {
              type: 'category',
              collapsed: false,
              label: 'Specific resources',
              link: {
                type: 'doc',
                id: 'dev-docs/migration/v4-to-v5/additional-resources/introduction'
              },
              items: [
                {
                  type: 'doc',
                  label: 'Introduction to migration guides',
                  id: 'dev-docs/migration/v4-to-v5/introduction-and-faq'
                },
                'dev-docs/migration/v4-to-v5/additional-resources/plugins-migration',
                'dev-docs/migration/v4-to-v5/additional-resources/helper-plugin',
                'dev-docs/migration/v4-to-v5/additional-resources/from-entity-service-to-document-service',
              ],
            },
          ]
        }
      ],
    },
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
        'user-docs/getting-started/user-guide-fundamentals',
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
      label: 'General Settings',
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
  restApiSidebar: [
    {
      type: 'link',
      label: '⬅️ Back to Dev Docs content',
      href: '/dev-docs/intro'
    },
    {
      type: 'category',
      collapsed: false,
      label: 'REST API reference',
      link: {
        type: 'doc',
        id: 'dev-docs/api/rest'
      },
      items: [
        {
          type: 'category',
          label: 'Endpoints and basic requests',
          link: {type: 'doc', id: 'dev-docs/api/rest'},
          collapsed: false,
          items: [
            {
              type: 'link',
              label: 'Endpoints',
              href: '/dev-docs/api/rest#endpoints',
            },
            {
              type: 'link',
              label: 'Get documents',
              href: '/dev-docs/api/rest#get-documents'
            },
            {
              type: 'link',
              label: 'Get a document',
              href: '/dev-docs/api/rest#get-a-document'
            },
            {
              type: 'link',
              label: 'Create a document',
              href: '/dev-docs/api/rest#create-a-document'
            },
            {
              type: 'link',
              label: 'Update a document',
              href: '/dev-docs/api/rest#update-a-document'
            },
            {
              type: 'link',
              label: 'Delete a document',
              href: '/dev-docs/api/rest#delete-a-document'
            },
          ]
        },
        {
          type: 'doc',
          id: 'dev-docs/api/rest/interactive-query-builder',
          label: '✨ Interactive Query Builder'
        },
        {
          type: 'doc',
          id: 'dev-docs/api/rest/parameters'
        },
        {
          type: 'category',
          label: 'Populate and Select',
          link: {type: 'doc', id: 'dev-docs/api/rest/populate-select'},
          collapsed: false,
          items: [
            {
              type: 'link',
              label: 'Field selection',
              href: '/dev-docs/api/rest/populate-select#field-selection',
            },
            {
              type: 'link',
              label: 'Population',
              href: '/dev-docs/api/rest/populate-select#population',
            },
          ]
        },
        {
          type: 'category',
          collapsed: false,
          label: 'Filters, Locale, Publication State',
          link: {type: 'doc', id: 'dev-docs/api/rest/filters-locale-publication' },
          items: [
            {
              type: 'link',
              label: 'Filtering',
              href: '/dev-docs/api/rest/filters-locale-publication#filtering'
            },
            {
              type: 'link',
              label: 'Complex filtering',
              href: '/dev-docs/api/rest/filters-locale-publication#complex-filtering',
            },
            {
              type: 'link',
              label: 'Deep filtering',
              href: '/dev-docs/api/rest/filters-locale-publication#deep-filtering',
            },
            {
              type: 'link',
              label: 'Locale',
              href: '/dev-docs/api/rest/filters-locale-publication#locale',
            },
            {
              type: 'link',
              label: 'Status',
              href: '/dev-docs/api/rest/filters-locale-publication#status',
            },
          ],
        },
        {
          type: 'category',
          collapsed: false,
          label: 'Sort and Pagination',
          link: { type: 'doc', id: 'dev-docs/api/rest/sort-pagination'},
          items: [
            {
              type: 'link',
              label: 'Sorting',
              href: '/dev-docs/api/rest/sort-pagination#sorting'
            },
            {
              type: 'link',
              label: 'Pagination',
              href: '/dev-docs/api/rest/sort-pagination#pagination'
            },
            {
              type: 'link',
              label: 'Pagination by page',
              href: '/dev-docs/api/rest/sort-pagination#pagination-by-page'
            },
            {
              type: 'link',
              label: 'Pagination by offset',
              href: '/dev-docs/api/rest/sort-pagination#pagination-by-offset'
            },
          ]
        },
        {
          type: 'category',
          collapsed: false,
          label: 'Relations',
          link: {type: 'doc', id: 'dev-docs/api/rest/relations'},
          items: [
            {
              type: 'link',
              label: 'connect',
              href: '/dev-docs/api/rest/relations#connect'
            },
            {
              type: 'link',
              label: 'disconnect',
              href: '/dev-docs/api/rest/relations#disconnect'
            },
            {
              type: 'link',
              label: 'set',
              href: '/dev-docs/api/rest/relations#set'
            },
          ]
        },
      ]
    },
    {
      type: "category",
      label: "Rest API guides",
      collapsed: false,
      link: {
        type: 'doc',
        id: 'dev-docs/api/rest/guides/intro',
      },
      items: [
        {
          type: "doc",
          label: "Understanding populate",
          id: 'dev-docs/api/rest/guides/understanding-populate',
        },
        {
          type: "doc",
          label: "How to populate creator fields",
          id: 'dev-docs/api/rest/guides/populate-creator-fields',
        },
        {
          type: 'link',
          label: 'Additional resources',
          href: '/dev-docs/api/rest/guides/intro#additional-resources'
        },
      ],
    }
  ],
  devDocsConfigSidebar: [
    {
      type: 'link',
      label: '⬅️ Back to Dev Docs content',
      href: '/dev-docs/intro'
    },
    {
      type: 'category',
      collapsed: false,
      label: 'Configuration',
      link: {
        type: 'doc',
        id: 'dev-docs/configurations',
      },
      items: [
        {
          type: 'doc',
          label: 'Introduction to configurations',
          id: 'dev-docs/configurations',
        },
        {
          type: 'category',
          collapsed: false,
          label: 'Base configurations',
          link: {
            type: 'doc',
            id: 'dev-docs/configurations'
          },
          items: [
            'dev-docs/configurations/database',
            'dev-docs/configurations/server',
            'dev-docs/configurations/admin-panel',
            'dev-docs/configurations/middlewares',
            'dev-docs/configurations/api',
          ]
        },
        {
          type: 'category',
          label: 'Additional configurations',
          collapsed: false,
          link: {
            type: 'doc',
            id: 'dev-docs/configurations'
          },
          items: [
            'dev-docs/configurations/plugins',
            'dev-docs/configurations/typescript',
            'dev-docs/configurations/api-tokens',
            'dev-docs/configurations/functions',
            'dev-docs/configurations/cron',
            'dev-docs/configurations/environment',
            'dev-docs/configurations/sso',
            'dev-docs/configurations/features',
          ]
        },
        {
          type: 'category',
          label: 'Guides',
          collapsed: false,
          link: {
            type: 'doc',
            id: 'dev-docs/configurations'
          },
          items: [
            'dev-docs/configurations/guides/rbac',
            'dev-docs/configurations/guides/public-assets',
            'dev-docs/configurations/guides/access-cast-environment-variables',
            'dev-docs/configurations/guides/access-configuration-values',
            'dev-docs/configurations/guides/use-cron-jobs',
          ]
        }
      ]
    },
  ],
  devDocsMigrationV5Sidebar: [
    {
      type: 'link',
      label: '⬅️ Back to Dev Docs content',
      href: '/dev-docs/intro'
    },
    {
      type: 'category',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'dev-docs/migration/v4-to-v5/introduction-and-faq'
      },
      label: 'Upgrade to Strapi 5',
      customProps: {
        new: true,
      },
      items: [
        {
          type: "doc",
          label: "Introduction and FAQ",
          id: "dev-docs/migration/v4-to-v5/introduction-and-faq"
        },
        {
          type: "doc",
          label: "Step-by-step guide",
          id: "dev-docs/migration/v4-to-v5/step-by-step"
        },
        {
          type: "doc",
          label: "Upgrade tool reference",
          id: 'dev-docs/upgrade-tool',
        },
        {
          type: "category",
          label: "Breaking changes",
          collapsed: false,
          link: {
            type: "doc",
            id: "dev-docs/migration/v4-to-v5/breaking-changes",
          },
          items: [
            {
              type: "doc",
              id: 'dev-docs/migration/v4-to-v5/breaking-changes',
              label: 'Complete list',
            },
            {
              type: "link",
              label: "Database",
              href: "/dev-docs/migration/v4-to-v5/breaking-changes#database",
            },
            {
              type: "link",
              label: "Dependencies",
              href: "/dev-docs/migration/v4-to-v5/breaking-changes#dependencies",
            },
            {
              type: "link",
              label: "Configuration",
              href: "/dev-docs/migration/v4-to-v5/breaking-changes#configuration",
            },
            {
              type: "link",
              label: "Strapi objects, methods, packages, and back-end cutomization",
              href: "/dev-docs/migration/v4-to-v5/breaking-changes#strapi-objects-methods-packages-and-back-end-customization",
            },
            {
              type: "link",
              label: "Plugins, providers, and admin panel customization",
              href: "/dev-docs/migration/v4-to-v5/breaking-changes#plugins-providers-and-admin-panel-customization",
            },
            {
              type: "link",
              label: "Content API",
              href: "/dev-docs/migration/v4-to-v5/breaking-changes#content-api",
            },
          ]
        },
        {
          type: 'category',
          label: 'Specific resources',
          collapsed: false,
          link: { type: 'doc', id: 'dev-docs/migration/v4-to-v5/additional-resources/introduction' },
          items: [
            'dev-docs/migration/v4-to-v5/additional-resources/introduction',
            'dev-docs/migration/v4-to-v5/additional-resources/from-entity-service-to-document-service',
            'dev-docs/migration/v4-to-v5/additional-resources/plugins-migration',
            'dev-docs/migration/v4-to-v5/additional-resources/helper-plugin',
          ]
        }
      ]
    },

  ]
};

module.exports = sidebars;
