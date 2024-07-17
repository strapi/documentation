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
        'dev-docs/quick-start',
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
          items: [
            {
              type: 'doc',
              label: 'Introduction to installation',
              id: 'dev-docs/installation',
            },
            'dev-docs/installation/cli',
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
            'dev-docs/configurations/guides/public-assets',
            'dev-docs/configurations/sso',
            'dev-docs/configurations/guides/rbac',
            'dev-docs/configurations/features',
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
            {
              type: 'category',
              label: 'Other Hosting Guides',
              link: {
                type: 'doc',
                id: 'dev-docs/deployment/hosting-guides',
              },
              collapsed: false,
              items: [
                {
                  type: 'doc',
                  label: 'Introduction to hosting guides',
                  id: 'dev-docs/deployment/hosting-guides',
                },
                'dev-docs/deployment/amazon-aws',
                'dev-docs/deployment/azure',
                'dev-docs/deployment/digitalocean-app-platform',
                'dev-docs/deployment/digitalocean',
                'dev-docs/deployment/heroku',
              ],
            },
            {
              type: 'category',
              label: 'Optional Software Guides',
              link: {
                type: 'doc',
                id: 'dev-docs/deployment/optional-software-guides',
              },
              collapsed: false,
              items: [
                {
                  type: 'doc',
                  label: 'Introduction to optional guides',
                  id: 'dev-docs/deployment/optional-software-guides',
                },
                'dev-docs/deployment/caddy-proxy',
                'dev-docs/deployment/haproxy-proxy',
                'dev-docs/deployment/nginx-proxy',
                'dev-docs/deployment/process-manager',
              ],
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
            {
              type: 'doc',
              label: 'Lifecycle hooks',
              id: 'dev-docs/api/document-service/lifecycle-hooks'
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
        'dev-docs/admin-panel-customization',
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
              label: 'Internationalization (i18n)',
              id: 'dev-docs/plugins/i18n',
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
            'dev-docs/plugins/development/plugin-cli',
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
                'dev-docs/plugins/guides/use-the-plugin-cli',
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
            id: 'dev-docs/migration/v4-to-v5/introduction'
          },
          label: 'Upgrade to Strapi 5',
          items: [
            {
              type: 'doc',
              label: 'Introduction',
              id: 'dev-docs/migration/v4-to-v5/introduction'
            },
            {
              type: 'doc',
              label: 'Breaking changes list',
              id: 'dev-docs/migration/v4-to-v5/breaking-changes',
            },
            {
              type: 'category',
              collapsed: true,
              label: 'Additional guides',
              link: {
                type: 'doc',
                id: 'dev-docs/migration/v4-to-v5/guides/introduction'
              },
              items: [
                {
                  type: 'doc',
                  label: 'Introduction to migration guides',
                  id: 'dev-docs/migration/v4-to-v5/introduction'
                },
                'dev-docs/migration/v4-to-v5/guides/plugins-migration',
                'dev-docs/migration/v4-to-v5/guides/helper-plugin',
                'dev-docs/migration/v4-to-v5/guides/from-entity-service-to-document-service',
              ],
            },
          ]
        }
      ],
    },
    'release-notes',
    'release-notes-detailed',
  ],
  userDocsSidebar: [
    {
      type: 'category',
      collapsed: false,
      label: 'Getting Started',
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
      items: [
        "cloud/getting-started/intro",
        {
          type: "doc",
          id: "cloud/getting-started/deployment",
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
      items: [
        "cloud/projects/overview",
        {
          type: "doc",
          label: "Project settings",
          id: "cloud/projects/settings",
        },
        'cloud/projects/collaboration',
        'cloud/projects/runtime-logs',
      ],
    },
    {
      type: "category",
      collapsed: false,
      label: "Deployments",
      items: [
        "cloud/projects/deploys",
        "cloud/projects/deploys-history",
      ],
    },
    {
      type: "category",
      collapsed: false,
      label: "Account management",
      items: [
        'cloud/account/account-settings',
        'cloud/account/account-billing',
      ]
    },
    {
      type: "category",
      collapsed: false,
      label: 'Advanced configuration',
      items: [
        'cloud/advanced/database',
        {
          type: "doc",
          id: "cloud/advanced/email",
          label: "Email provider",
        },
        {
          type: "doc",
          id: "cloud/advanced/upload",
          label: "Upload provider",
        },
      ]
    }
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
              href: '/dev-docs/plugins/i18n#usage-with-the-rest-api',
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
        id: 'dev-docs/migration/v4-to-v5/introduction'
      },
      label: 'Upgrade to Strapi 5',
      customProps: {
        new: true,
      },
      items: [
        {
          type: "doc",
          label: "Introduction",
          id: "dev-docs/migration/v4-to-v5/introduction"
        },
        'dev-docs/upgrade-tool',
        {
          type: "category",
          label: "Breaking changes",
          collapsed: true,
          link: {
            type: "doc",
            id: "dev-docs/migration/v4-to-v5/breaking-changes",
          },
          items: [
            {
              type: "doc",
              id: 'dev-docs/migration/v4-to-v5/breaking-changes',
              label: 'Index',
            },
            {
              type: "category",
              collapsed: false,
              label: "Configuration",
              link: {
                type: 'doc',
                id: "dev-docs/migration/v4-to-v5/breaking-changes"
              },
              items: [
                'dev-docs/migration/v4-to-v5/breaking-changes/removed-support-for-some-env-options',
                'dev-docs/migration/v4-to-v5/breaking-changes/strict-requirements-config-files',
                {
                  type: 'doc',
                  label: 'Server log level is `http`',
                  id: 'dev-docs/migration/v4-to-v5/breaking-changes/server-default-log-level',
                },
                {
                  type: 'doc',
                  label: 'Model config path uses uid',
                  id: 'dev-docs/migration/v4-to-v5/breaking-changes/model-config-path-uses-uid',
                },
                'dev-docs/migration/v4-to-v5/breaking-changes/remove-webhook-populate-relations',
                'dev-docs/migration/v4-to-v5/breaking-changes/default-index-removed',
                'dev-docs/migration/v4-to-v5/breaking-changes/server-proxy',
              ]
            },
            {
              type: "category",
              collapsed: false,
              label: "Content API",
              link: {
                type: 'doc',
                id: "dev-docs/migration/v4-to-v5/breaking-changes"
              },
              items: [
                'dev-docs/migration/v4-to-v5/breaking-changes/new-response-format',
                'dev-docs/migration/v4-to-v5/breaking-changes/use-document-id',
                'dev-docs/migration/v4-to-v5/breaking-changes/publication-state-removed',
                'dev-docs/migration/v4-to-v5/breaking-changes/sort-by-id',
                'dev-docs/migration/v4-to-v5/breaking-changes/no-find-page-in-document-service',
                'dev-docs/migration/v4-to-v5/breaking-changes/no-localizations-field',
                'dev-docs/migration/v4-to-v5/breaking-changes/attributes-and-content-types-names-reserved',
                // 'dev-docs/migration/v4-to-v5/breaking-changes/components-and-dynamic-zones-do-not-return-id', // not implemented yet
                'dev-docs/migration/v4-to-v5/breaking-changes/graphql-api-updated',
                'dev-docs/migration/v4-to-v5/breaking-changes/entity-service-deprecated',
                'dev-docs/migration/v4-to-v5/breaking-changes/default-input-validation',
                'dev-docs/migration/v4-to-v5/breaking-changes/lifecycle-hooks-document-service',
              ]
            },
            {
              type: "category",
              label: "Database",
              collapsed: false,
              link: {
                type: 'doc',
                id: "dev-docs/migration/v4-to-v5/breaking-changes"
              },
              items: [
                'dev-docs/migration/v4-to-v5/breaking-changes/mysql5-unsupported',
                'dev-docs/migration/v4-to-v5/breaking-changes/database-identifiers-shortened',
                'dev-docs/migration/v4-to-v5/breaking-changes/only-better-sqlite3-for-sqlite',
                'dev-docs/migration/v4-to-v5/breaking-changes/only-mysql2-package-for-mysql',
              ]
            },
            {
              type: "category",
              collapsed: false,
              label: "Plugins, providers, and admin panel customization",
              link: {
                type: 'doc',
                id: "dev-docs/migration/v4-to-v5/breaking-changes"
              },
              items: [
                'dev-docs/migration/v4-to-v5/breaking-changes/register-allowed-fields',
                'dev-docs/migration/v4-to-v5/breaking-changes/helper-plugin-deprecated',
                'dev-docs/migration/v4-to-v5/breaking-changes/inject-content-manager-component',
                'dev-docs/migration/v4-to-v5/breaking-changes/mailgun-provider-variables',
                'dev-docs/migration/v4-to-v5/breaking-changes/license-only',
              ]
            },
            {
              type: "category",
              label: "Strapi objects, methods, packages, and back-end cutomization",
              collapsed: false,
              items: [
                'dev-docs/migration/v4-to-v5/breaking-changes/fetch',
                'dev-docs/migration/v4-to-v5/breaking-changes/strapi-imports',
                'dev-docs/migration/v4-to-v5/breaking-changes/is-supported-image-removed',
                'dev-docs/migration/v4-to-v5/breaking-changes/strapi-utils-refactored',
                // 'dev-docs/migration/v4-to-v5/breaking-changes/strapi-container', // might change
                'dev-docs/migration/v4-to-v5/breaking-changes/core-service-methods-use-document-service',
                'dev-docs/migration/v4-to-v5/breaking-changes/i18n-content-manager-locale',
              ]
            },
            {
              type: "category",
              label: "Content Manager",
              collapsed: false,
              items: [
                'dev-docs/migration/v4-to-v5/breaking-changes/redux-content-manager-app-state',
                'dev-docs/migration/v4-to-v5/breaking-changes/edit-view-layout-and-list-view-layout-rewritten',
                'dev-docs/migration/v4-to-v5/breaking-changes/admin-panel-rbac-store-updated',
              ],
            },
            {
              type: "category",
              label: "Dependencies",
              collapsed: false,
              items: [
                'dev-docs/migration/v4-to-v5/breaking-changes/vite',
                'dev-docs/migration/v4-to-v5/breaking-changes/react-router-dom-6',
                {
                  type: 'doc',
                  label: 'Webpack Aliases Removed',
                  id: 'dev-docs/migration/v4-to-v5/breaking-changes/webpack-aliases-removed',
                },
                'dev-docs/migration/v4-to-v5/breaking-changes/koa-body-v6',
                'dev-docs/migration/v4-to-v5/breaking-changes/upgrade-to-apollov4',
              ]
            },
          ]
        },
        {
          type: 'category',
          label: 'Specific resources',
          link: { type: 'doc', id: 'dev-docs/migration/v4-to-v5/guides/introduction' },
          items: [
            'dev-docs/migration/v4-to-v5/guides/introduction',
            'dev-docs/migration/v4-to-v5/guides/plugins-migration',
            'dev-docs/migration/v4-to-v5/guides/helper-plugin',
            'dev-docs/migration/v4-to-v5/guides/from-entity-service-to-document-service',
          ]
        }
      ]
    },

  ]
};

module.exports = sidebars;
