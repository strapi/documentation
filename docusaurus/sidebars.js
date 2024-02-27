/**
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  // tutorialSidebar: [{type: 'autogenerated', dirName: '.'}],

  // But you can create a sidebar manually
  devDocsSidebar: [
    {
      type: "category",
      collapsed: false,
      label: "🚀 Getting Started",
      items: [
        "dev-docs/intro",
        "dev-docs/quick-start",
        "dev-docs/faq",
        "dev-docs/usage-information",
      ],
    },
    {
      type: "category",
      collapsed: false,
      label: '⚙️ Setup & Deployment',
      link: {
        type: 'doc',
        id: 'dev-docs/setup-deployment',
      },
      items: [
        {
          type: 'doc',
          label: 'Introduction',
          id: 'dev-docs/setup-deployment',
        },
        {
          type: 'category',
          label: 'Installation',
          link: {type: 'doc', id: 'dev-docs/installation'},
          items: [
            {
              type: 'doc',
              label: 'Introduction',
              id: 'dev-docs/installation',
            },
            "dev-docs/installation/cli",
            {
                type: 'doc',
                id: "dev-docs/installation/docker",
                customProps: {
                    updated: true
                },
            },
          ],
        },
        'dev-docs/project-structure',
        {
          type: "category",
          label: "Configuration",
          items: [
            {
              type: 'doc',
              label: 'Introduction',
              id: 'dev-docs/configurations',
              customProps: {
                updated: true,
              },
            },
            'dev-docs/configurations/database',
            'dev-docs/configurations/server',
            'dev-docs/configurations/admin-panel',
            'dev-docs/configurations/middlewares',
            'dev-docs/configurations/api',
            {
              type: 'doc',
              id: 'dev-docs/configurations/plugins',
              customProps: {
                updated: true,
              },
            },
            'dev-docs/configurations/typescript',
            'dev-docs/configurations/api-tokens',
            'dev-docs/configurations/functions',
            'dev-docs/configurations/cron',
            'dev-docs/configurations/environment',
            'dev-docs/configurations/public-assets',
            'dev-docs/configurations/sso',
            'dev-docs/configurations/rbac',
            // 'dev-docs/configurations/features',
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
              label: 'Introduction',
              id: 'dev-docs/deployment',
            },
            {
              type: "doc",
              label: "☁️ Strapi Cloud",
              id: "cloud/getting-started/deployment",
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
                  label: 'Introduction',
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
                  label: 'Introduction',
                  id: 'dev-docs/deployment/optional-software-guides',
                },
                "dev-docs/deployment/caddy-proxy",
                "dev-docs/deployment/haproxy-proxy",
                "dev-docs/deployment/nginx-proxy",
                "dev-docs/deployment/process-manager",
              ],
            },
          ]
        }
      ]
    },
    {
      type: "category",
      collapsed: false,
      label: "📦 APIs",
      items: [
        {
          type: 'doc',
          label: 'Introduction/Concepts',
          id: 'dev-docs/api/content-api',
        },
        {
          type: 'category',
          label: 'REST API',
          items: [
            {
              type: "doc",
              id: "dev-docs/api/rest",
              label: "Introduction",
            },
            "dev-docs/api/rest/parameters",
            "dev-docs/api/rest/populate-select",
            "dev-docs/api/rest/filters-locale-publication",
            "dev-docs/api/rest/sort-pagination",
            "dev-docs/api/rest/relations",
            "dev-docs/api/rest/interactive-query-builder",
          ],
        },
        "dev-docs/api/graphql",
        {
          type: "category",
          label: "Entity Service API",
          items: [
            {
              type: "doc",
              id: "dev-docs/api/entity-service",
              label: "Introduction",
            },
            "dev-docs/api/entity-service/crud",
            "dev-docs/api/entity-service/filter",
            "dev-docs/api/entity-service/populate",
            "dev-docs/api/entity-service/order-pagination",
            "dev-docs/api/entity-service/components-dynamic-zones",
          ],
        },
        {
          type: "category",
          label: "Query Engine API",
          items: [
            {
              type: "doc",
              id: "dev-docs/api/query-engine",
              label: "Introduction",
            },
            "dev-docs/api/query-engine/single-operations",
            "dev-docs/api/query-engine/bulk-operations",
            "dev-docs/api/query-engine/filtering",
            "dev-docs/api/query-engine/populating",
            "dev-docs/api/query-engine/order-pagination",
          ],
        },
      ]
    },
    {
      type: "category",
      label: "🔧 Development",
      collapsed: false,
      items: [
        "dev-docs/admin-panel-customization",
        {
          type: "category",
          label: "Back-end customization",
          customProps: {
            updated: true,
          },
          items: [
            {
              type: "doc",
              id: "dev-docs/backend-customization",
              label: "Introduction",
            },
            {
              type: 'doc',
              id: 'dev-docs/backend-customization/requests-responses',
            },
            "dev-docs/backend-customization/routes",
            "dev-docs/backend-customization/policies",
            {
              type: 'doc',
              id: 'dev-docs/backend-customization/middlewares',
            },
            {
              type: 'doc',
              id: 'dev-docs/backend-customization/controllers',
              customProps: {
                updated: true,
              },
            },
            'dev-docs/backend-customization/services',
            'dev-docs/backend-customization/models',
            'dev-docs/backend-customization/webhooks',
            {
              type: 'category',
              label: '✨ Examples',
              collapsed: true,
              items: [
                {
                  type: 'doc',
                  label: 'Introduction',
                  id: 'dev-docs/backend-customization/examples',
                },
                {
                  type: 'doc',
                  label: 'Authentication',
                  id: 'dev-docs/backend-customization/examples/authentication',
                },
                {
                  type: 'doc',
                  label: 'Services, Controllers',
                  id: 'dev-docs/backend-customization/examples/services-and-controllers',
                },
                {
                  type: 'doc',
                  label: 'Policies',
                  id: 'dev-docs/backend-customization/examples/policies',
                },
                {
                  type: 'doc',
                  label: 'Routes',
                  id: 'dev-docs/backend-customization/examples/routes',
                },
                {
                  type: 'doc',
                  label: 'Global middlewares',
                  id: 'dev-docs/backend-customization/examples/middlewares',
                },
              ]
            }
          ]
        },
        'dev-docs/typescript',
        {
          type: "doc",
          label: "Providers",
          id: "dev-docs/providers",
        },
      ],
    },
    {
      type: "category",
      label: "💻 Developer Resources",
      collapsed: false,
      items: [
        "dev-docs/cli",
        {
          type: "category",
          label: "Data management",
          items: [
            {
              type: "doc",
              label: "Introduction",
              id: "dev-docs/data-management",
            },
            "dev-docs/data-management/export",
            "dev-docs/data-management/import",
            {
              type: "doc",
              label: "Data transfer",
              id: "dev-docs/data-management/transfer",
            },
          ],
        },
        "dev-docs/database-migrations",
        "dev-docs/error-handling",
        // "dev-docs/testing",
        {
          type: "category",
          label: "Integrations",
          items: [
            {
              type: "doc",
              label: "Introduction",
              id: "dev-docs/integrations",
            },
            "dev-docs/integrations/11ty",
            "dev-docs/integrations/angular",
            "dev-docs/integrations/dart",
            "dev-docs/integrations/flutter",
            "dev-docs/integrations/gatsby",
            "dev-docs/integrations/gridsome",
            "dev-docs/integrations/go",
            "dev-docs/integrations/graphql",
            "dev-docs/integrations/jekyll",
            "dev-docs/integrations/laravel",
            "dev-docs/integrations/next-js",
            "dev-docs/integrations/nuxt-js",
            "dev-docs/integrations/php",
            "dev-docs/integrations/python",
            "dev-docs/integrations/react",
            "dev-docs/integrations/ruby",
            "dev-docs/integrations/sapper",
            "dev-docs/integrations/svelte",
            "dev-docs/integrations/vue-js",
          ],
        },
      ],
    },
    {
      type: "category",
      collapsed: false,
      label: "🔌 Plugins",
      link: {
        type: 'doc',
        id: 'dev-docs/plugins',
      },
      items: [
        {
          type: 'doc',
          label: 'Introduction/Concepts',
          id: 'dev-docs/plugins',
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
              label: 'Introduction',
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
          customProps: {
            new: true,
          },
          link: {
            type: 'doc',
            id: 'dev-docs/plugins/developing-plugins',
          },
          items: [
            {
              type: 'doc',
              label: 'Introduction',
              id: 'dev-docs/plugins/developing-plugins'
            },
            'dev-docs/plugins/development/create-a-plugin',
            'dev-docs/plugins/development/plugin-structure',
            {
              type: 'doc',
              id: 'dev-docs/api/plugins/admin-panel-api',
              label: 'Admin Panel API',
            },
            {
              type: 'doc',
              id: 'dev-docs/api/plugins/server-api',
              label: 'Server API',
            },
            {
                type: 'doc',
                id: 'dev-docs/plugins/development/plugin-cli',
                customProps: {
                    new: true
                }
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
                {
                  type: 'doc',
                  id: 'dev-docs/plugins/guides/use-the-plugin-cli',
                  customProps: {
                    new: true,
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      type: "category",
      collapsed: false,
      label: "♻️ Update and Migration",
      items: [
        "dev-docs/update-version",
        "dev-docs/migration-guides",
        {
          type: "category",
          collapsed: true,
          label: "v3 to v4 migration guides",
          items: [
            {
              type: "category",
              collapsed: false,
              link: {
                type: "doc",
                id: "dev-docs/migration/v3-to-v4/code-migration",
              },
              label: "Code migration",
              items: [
                {
                  type: "category",
                  collapsed: true,
                  link: {
                    type: "doc",
                    id: "dev-docs/migration/v3-to-v4/code/backend",
                  },
                  label: "Backend migration",
                  items: [
                    "dev-docs/migration/v3-to-v4/code/configuration",
                    "dev-docs/migration/v3-to-v4/code/content-type-schema",
                    "dev-docs/migration/v3-to-v4/code/controllers",
                    "dev-docs/migration/v3-to-v4/code/dependencies",
                    "dev-docs/migration/v3-to-v4/code/global-middlewares",
                    "dev-docs/migration/v3-to-v4/code/graphql",
                    "dev-docs/migration/v3-to-v4/code/policies",
                    "dev-docs/migration/v3-to-v4/code/route-middlewares",
                    "dev-docs/migration/v3-to-v4/code/routes",
                    "dev-docs/migration/v3-to-v4/code/services",
                  ],
                },
                {
                  type: "category",
                  collapsed: true,
                  link: {
                    type: "doc",
                    id: "dev-docs/migration/v3-to-v4/code/frontend",
                  },
                  label: "Frontend migration",
                  items: [
                    "dev-docs/migration/v3-to-v4/code/strapi-global",
                    "dev-docs/migration/v3-to-v4/code/theming",
                    "dev-docs/migration/v3-to-v4/code/translations",
                    "dev-docs/migration/v3-to-v4/code/webpack",
                    "dev-docs/migration/v3-to-v4/code/wysiwyg",
                  ],
                },
              ],
            },
            {
              type: "category",
              collapsed: false,
              link: {
                type: "doc",
                id: "dev-docs/migration/v3-to-v4/plugin-migration",
              },
              label: "Plugin migration",
              items: [
                "dev-docs/migration/v3-to-v4/plugin/update-folder-structure",
                "dev-docs/migration/v3-to-v4/plugin/migrate-back-end",
                "dev-docs/migration/v3-to-v4/plugin/migrate-front-end",
                "dev-docs/migration/v3-to-v4/plugin/enable-plugin",
              ],
            },
            {
              type: "category",
              collapsed: false,
              link: {
                type: "doc",
                id: "dev-docs/migration/v3-to-v4/data-migration",
              },
              label: "Data migration",
              items: [
                "dev-docs/migration/v3-to-v4/data/sql",
                "dev-docs/migration/v3-to-v4/data/sql-relations",
                "dev-docs/migration/v3-to-v4/data/mongo",
                "dev-docs/migration/v3-to-v4/data/mongo-sql-cheatsheet",
              ],
            },
          ],
        },
      ],
    },
  ],

  userDocsSidebar: [
    "user-docs/intro",
    {
      type: "category",
      collapsed: false,
      label: "Content Manager",
      items: [
        "user-docs/content-manager/introduction-to-content-manager",
        "user-docs/content-manager/configuring-view-of-content-type",
        {
          type: "doc",
          id: "user-docs/content-manager/writing-content",
        },
        "user-docs/content-manager/managing-relational-fields",
        "user-docs/content-manager/translating-content",
        "user-docs/content-manager/reviewing-content",
        {
          type: 'doc',
          id: 'user-docs/content-manager/saving-and-publishing-content',
        },
        'user-docs/content-manager/adding-content-to-releases',
      ],
    },
    {
      type: "category",
      collapsed: false,
      label: "Content-type Builder",
      items: [
        "user-docs/content-type-builder/introduction-to-content-types-builder",
        "user-docs/content-type-builder/creating-new-content-type",
        {
          type: "doc",
          id: "user-docs/content-type-builder/configuring-fields-content-type",
          customProps: {
            updated: true,
          },
        },
        "user-docs/content-type-builder/managing-content-types",
      ],
    },
    {
      type: "category",
      collapsed: false,
      label: "Media Library",
      items: [
        {
          type: "autogenerated",
          dirName: "user-docs/media-library",
        },
      ],
    },
    {
      type: "category",
      customProps: {
        new: true
      },
      collapsed: false,
      label: "Releases",
      items: [
        'user-docs/releases/introduction',
        'user-docs/releases/creating-a-release',
        'user-docs/releases/managing-a-release',
      ],
    },
    {
      type: "category",
      collapsed: false,
      label: "Users, Roles & Permissions",
      items: [
        {
          type: "autogenerated",
          dirName: "user-docs/users-roles-permissions",
        },
      ],
    },
    {
      type: "category",
      collapsed: false,
      label: "Plugins",
      items: [
        {
          type: "autogenerated",
          dirName: "user-docs/plugins",
        },
      ],
    },
    {
      type: "category",
      collapsed: false,
      label: "General Settings",
      items: [
        "user-docs/settings/configuring-users-permissions-plugin-settings",
        "user-docs/settings/audit-logs",
        {
          type: "category",
          collapsed: false,
          label: "Configuring global settings",
          items: [
            "user-docs/settings/admin-panel",
            "user-docs/settings/API-tokens",
            "user-docs/settings/internationalization",
            "user-docs/settings/media-library-settings",
            {
              type: "doc",
              label: "Review Workflows",
              id: "user-docs/settings/review-workflows",
              customProps: {
                updated: true,
              },
            },
            "user-docs/settings/single-sign-on",
            "user-docs/settings/transfer-tokens",
          ],
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
          customProps: {
            updated: true,
          },
        },,
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
          customProps: {
            updated: true,
          },
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
        {
          type: "doc",
          id: "cloud/account/account-billing",
          label: "Account billing details",
          customProps: {
            updated: true,
          },
        },
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
      ]
    }
  ],

  restApiSidebar: [
    {
      type: "link",
      label: "⬅️ Back to Dev Docs content",
      href: "/dev-docs/intro",
    },
    {
      type: "category",
      collapsed: false,
      label: "REST API",
      items: [
        {
          type: "category",
          label: "Endpoints and basic requests",
          link: { type: "doc", id: "dev-docs/api/rest" },
          collapsed: false,
          items: [
            {
              type: "link",
              label: "Endpoints",
              href: "/dev-docs/api/rest#endpoints",
            },
            {
              type: "link",
              label: "Get entries",
              href: "/dev-docs/api/rest#get-entries",
            },
            {
              type: "link",
              label: "Get an entry",
              href: "/dev-docs/api/rest#get-an-entry",
            },
            {
              type: "link",
              label: "Create an entry",
              href: "/dev-docs/api/rest#create-an-entry",
            },
            {
              type: "link",
              label: "Update an entry",
              href: "/dev-docs/api/rest#update-an-entry",
            },
            {
              type: "link",
              label: "Delete an entry",
              href: "/dev-docs/api/rest#delete-an-entry",
            },
          ],
        },
        {
          type: "doc",
          id: "dev-docs/api/rest/interactive-query-builder",
          label: "✨ Interactive Query Builder",
        },
        {
          type: "doc",
          id: "dev-docs/api/rest/parameters",
        },
        {
          type: "category",
          label: "Populate and Select",
          link: { type: "doc", id: "dev-docs/api/rest/populate-select" },
          collapsed: false,
          items: [
            {
              type: "link",
              label: "Field selection",
              href: "/dev-docs/api/rest/populate-select#field-selection",
            },
            {
              type: "link",
              label: "Populate Relations & Media Fields",
              href: "/dev-docs/api/rest/populate-select#relations--media-fields",
            },
            {
              type: "link",
              label: "Populate Components & Dynamic Zones",
              href: "/dev-docs/api/rest/populate-select#components--dynamic-zones",
            },
            {
              type: "link",
              label: "Populating createdBy and updatedBy",
              href: "/dev-docs/api/rest/populate-select#populating-createdby-and-updatedby",
            },
            {
              type: "link",
              label: "Combining populate with other operators",
              href: "/dev-docs/api/rest/populate-select#combining-population-with-other-operators",
            },
          ],
        },
        {
          type: "category",
          collapsed: false,
          label: "Filters, Locale, Publication State",
          link: {
            type: "doc",
            id: "dev-docs/api/rest/filters-locale-publication",
          },
          items: [
            {
              type: "link",
              label: "Filtering",
              href: "/dev-docs/api/rest/filters-locale-publication#filtering",
            },
            {
              type: "link",
              label: "Complex filtering",
              href: "/dev-docs/api/rest/filters-locale-publication#complex-filtering",
            },
            {
              type: "link",
              label: "Deep filtering",
              href: "/dev-docs/api/rest/filters-locale-publication#deep-filtering",
            },
            {
              type: "link",
              label: "Locale",
              href: "/dev-docs/api/rest/filters-locale-publication#locale",
            },
            {
              type: "link",
              label: "Publication state",
              href: "/dev-docs/api/rest/filters-locale-publication#publication-state",
            },
          ],
        },
        {
          type: "category",
          collapsed: false,
          label: "Sort and Pagination",
          link: { type: "doc", id: "dev-docs/api/rest/sort-pagination" },
          items: [
            {
              type: "link",
              label: "Sorting",
              href: "/dev-docs/api/rest/sort-pagination#sorting",
            },
            {
              type: "link",
              label: "Pagination",
              href: "/dev-docs/api/rest/sort-pagination#pagination",
            },
            {
              type: "link",
              label: "Pagination by page",
              href: "/dev-docs/api/rest/sort-pagination#pagination-by-page",
            },
            {
              type: "link",
              label: "Pagination by offset",
              href: "/dev-docs/api/rest/sort-pagination#pagination-by-offset",
            },
          ],
        },
        {
          type: "category",
          collapsed: false,
          label: "Relations",
          link: { type: "doc", id: "dev-docs/api/rest/relations" },
          items: [
            {
              type: "link",
              label: "connect",
              href: "/dev-docs/api/rest/relations#connect",
            },
            {
              type: "link",
              label: "disconnect",
              href: "/dev-docs/api/rest/relations#disconnect",
            },
            {
              type: "link",
              label: "set",
              href: "/dev-docs/api/rest/relations#set",
            },
          ],
        },
      ],
    },
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
          label: 'Introduction',
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
            {
              type: 'doc',
              id: 'dev-docs/configurations/plugins',
              customProps: {
                updated: true,
              },
            },
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
            'dev-docs/configurations/rbac',
            'dev-docs/configurations/public-assets',
            'dev-docs/configurations/guides/access-cast-environment-variables',
            'dev-docs/configurations/guides/access-configuration-values',
          ]
        }
      ]
    },
  ],
};

module.exports = sidebars;
