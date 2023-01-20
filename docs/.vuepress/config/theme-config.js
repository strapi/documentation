const themeConfig = {
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
              text: 'Plugins',
              link: '/developer-docs/latest/plugins/plugins-intro.html',
            },
            {
              text: 'Development',
              link: '/developer-docs/latest/development/backend-customization.html',
            },
            {
              text: 'Update & Migration',
              link: '/developer-docs/latest/update-migration-guides/update-version.html',
            },
            {
              text: 'Developer Resources',
              link: '/developer-docs/latest/developer-resources/database-apis-reference/rest-api.html',
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
              link:
                '/user-docs/latest/users-roles-permissions/introduction-to-users-roles-permissions.html',
            },
            {
              text: 'Media Library',
              link:
                '/user-docs/latest/media-library/introduction-to-media-library.html',
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
      ],
    },
    {
      text: 'Other Docs',
      items: [
        {
          text: 'v3 documentation',
          link: 'https://docs-v3.strapi.io',
        },
        {
          text: 'New beta documentation',
          link: 'https://docs-next.strapi.io',
        },
      ],
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
              text: 'StrapiConf 2022',
              link: 'https://www.youtube.com/playlist?list=PL7Q0DQYATmvgTWQH91NhIdY2BFdDYntPP',
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
              link: 'https://strapi.io/blog/categories/tutorials?type=v4',
            },
          ],
        },
      ],
    },
    {
      text: "Strapi Cloud waitlist",
      link: 'https://strp.cc/3GIEKKZ',
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
};
