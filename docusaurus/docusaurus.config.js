// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Strapi Documentation',
  tagline: 'Design APIs fast, manage content easily.',
  url: 'https://docs-next.strapi.io/',
  baseUrl: '/',
  onBrokenLinks: 'warn', // replace with 'throw' to stop building if broken links
  onBrokenMarkdownLinks: 'warn',
  favicon: 'https://strapi.io/assets/favicon-32x32.png',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  // organizationName: 'strapi', // Usually your GitHub org/user name.
  // projectName: 'documentation', // Usually your repo name.

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
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/strapi/documentation',
          // lastVersion: '0.1.0',
          admonitions: {
            tag: ':::',
            keywords: ['strapi', 'callout', 'prerequisites'],
            extendDefaults: true,
          },
        },
        blog: false, // we're using docs-only mode for now — see https://docusaurus.io/docs/docs-introduction
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
      announcementBar: {
        id: 'support_us',
        content: "We're rebuilding our documentation from the ground up (see <a href='/'>status page</a>). Looking for the complete Strapi documentation? Please visit <a target='_blank' rel='noopener noreferrer' href='https://docs.strapi.io'>docs.strapi.io</a>.",
        backgroundColor: '#F3E5FA',
        textColor: '#091E42',
        isCloseable: false,
      },
      docs: {
        sidebar: {
          hideable: true
        },
      },
      navbar: {
        logo: {
          alt: 'Strapi Documentation Logo',
          src: 'img/logo-beta.png',
        },
        items: [
          {
            type: 'doc',
            docId: 'dev-docs/intro',
            position: 'left',
            label: 'Developer Docs',
          },
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
                to: '/docs/dev-docs/intro',
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
                to: 'https://strapi.io/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/strapi/documentation',
              },
            ],
          },
        ],
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),

  plugins: [
    // 'plugin-image-zoom', // temp. disabled while we fix the bug
    /**
     * Seems like we have an issue where a medium-zoom--hidden class is applied on the second, top-most (z-index wise) image,
     * actually hiding the image when zoomed in. Found no related issue in the plugin's repo, might have to dig whether it's
     * related to the Docusaurus canary build or not.
     */
    [
      require.resolve("@cmfcmf/docusaurus-search-local"),
      {
        indexBlog: false,
      }
    ],
  ],
};

module.exports = config;
