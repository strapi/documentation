// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Strapi Documentation',
  tagline: 'Design APIs fast, manage content easily.',
  url: 'https://strapi-docs-docusaurus-poc.vercel.app/',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'https://strapi.io/assets/favicon-32x32.png',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'pwizla', // Usually your GitHub org/user name.
  projectName: 'strapi-docs-docusaurus-poc', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  themes: ['@docusaurus/theme-live-codeblock'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/pwizla/documentation',
          // lastVersion: '0.1.0',
          admonitions: {
            tag: ':::',
            keywords: ['strapi'],
            extendDefaults: true,
          },
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://strapi.io/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
    [
      'redocusaurus',
      {
        // Plugin Options for loading OpenAPI files
        specs: [
          {
            spec: 'docs/dev-docs/api/openapi.yaml',
            route: '/openapi/'
          },
        ],
        // Theme Options for modifying how redoc renders them
        theme: {
          // Change with your site colors
          primaryColor: '#4945FF',
        },
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      docs: {
        sidebar: {
          hideable: true
        },
      },
      navbar: {
        logo: {
          alt: 'Strapi Documentation Logo',
          src: 'img/logo.png',
        },
        items: [
          {
            type: 'doc',
            docId: 'dev-docs/hello',
            position: 'left',
            label: 'Developer Docs',
          },
          // {to: '/blog', label: 'Blog', position: 'right'},
          // {
          //   type: 'docsVersionDropdown' // temporarily disabled, enable again when adding versioning, see https://tutorial.docusaurus.io/docs/tutorial-extras/manage-docs-versions
          // },
          // {
          //   type: 'localeDropdown' // disabled as I couldn't make i18n work: navbar shows up but files seem 404s 🤷
          // }
          {
            type: 'doc',
            docId: 'user-docs/intro',
            position: 'left',
            label: 'User Guide'
          },
          {
            href: 'https://github.com/strapi/documentation',
            label: 'GitHub',
            position: 'right',
          },
          // {
          //   type: 'docsVersionDropdown', // temporarily disabled, enable again when adding versioning, see https://tutorial.docusaurus.io/docs/tutorial-extras/manage-docs-versions
          // }
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'User Guide',
                to: '/docs/user-docs/intro',
              },
              {
                label: 'Dev Docs',
                to: '/docs/dev-docs/hello',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/strapi',
              },
              {
                label: 'Discord',
                href: 'https://discord.strapi.io/',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/strapijs',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/strapi/documentation',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),

  plugins: [require.resolve("@cmfcmf/docusaurus-search-local")],
};

module.exports = config;
