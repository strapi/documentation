// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Strapi Documentation',
  tagline: 'Design APIs fast, manage content easily.',
  url: 'https://docs.strapi.io/',
  baseUrl: '/',
  onBrokenLinks: 'throw', // replace with 'throw' to stop building if broken links
  onBrokenMarkdownLinks: 'throw',
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

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-live-codeblock', '@docusaurus/theme-mermaid'],

  scripts: [
    {
      src:
        '/js/hotjar.js',
      type: 'module',
      async: true,
    },
    {
      src:
        '/js/particle.js',
      type: 'module',
      async: true,
    },
    {
      src:
        '/js/firework.js',
      type: 'module',
      async: true,
    },
    {
      src:
        '/js/ball.js',
      type: 'module',
      async: true,
    },
    {
      src:
        '/js/bar.js',
      type: 'module',
      async: true,
    },
    {
      src:
        '/js/game.js',
      type: 'module',
      async: true,
    },
    {
      src: '/js/particleProfiles.js',
      type: 'module',
      async: true,
    },
  ],
  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/strapi/documentation/edit/main/docusaurus',
          admonitions: {
            tag: ':::',
            keywords: [
              // Admonitions defaults
              'note',
              'tip',
              'info',
              'caution',
              'danger',

              // Admonitions custom
              'callout',
              'prerequisites',
              'strapi',
              'warning',
            ],
          },
        },
        // we're using docs-only mode for now — see https://docusaurus.io/docs/docs-introduction
        blog: false,
        theme: {
          customCss: require.resolve('./src/scss/__index.scss'),
        },
      },
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
      // announcementBar: {
      //   id: 'support_us',
      //   content: "We're rebuilding our documentation from the ground up (see <a href='/'>status page</a>). Looking for the complete Strapi documentation? Please visit <a target='_blank' rel='noopener noreferrer' href='https://docs.strapi.io'>docs.strapi.io</a>.",
      //   backgroundColor: '#F3E5FA',
      //   textColor: '#091E42',
      //   isCloseable: true,
      // },
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        },
      },
      algolia: {
        appId: '392RJ63O14',
        apiKey: '8cf63dc4a24ff4087407f9f5bd188aae',
        indexName: 'strapiDocsNextstrapiDocsNext',
      },
      navbar: {
        hideOnScroll: false,
        logo: {
          alt: 'Strapi Documentation Logo',
          src: 'img/logo.png',
          srcDark: 'img/logo-dark.png',
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
            type: 'doc',
            docId: 'cloud/getting-started/intro',
            position: 'left',
            label: 'Strapi Cloud'
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
                label: 'Dev Docs',
                to: '/dev-docs/intro',
              },
              {
                label: 'User Guide',
                to: '/user-docs/intro',
              },
              {
                label: 'Strapi Cloud',
                to: '/cloud/intro'
              },
              {
                label: 'v3 Docs (unsupported)',
                href: 'https://docs-v3.strapi.io'
              },
              {
                label: 'Contributor Docs',
                href: 'https://contributor.strapi.io'
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discord.strapi.io/',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/strapijs',
              },
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/strapi',
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
              {
                label: 'Strapi.io',
                href: 'https://strapi.io',
              }
            ],
          },
        ],
      },
      prism: {
        theme: darkCodeTheme,
        darkTheme: darkCodeTheme,
      },
      zoom: {
        // selector: '.markdown :not(em) > img', // temporarily disabled to ensure it works with themed images
      },
      hubspot: {
        accountId: 6893032,
        async: false, // OPTIONAL: sets the async attribute on the script tag, defaults to false
        defer: false, // OPTIONAL: sets the defer attribute on the script tag, defaults to false
      },
    }),

  plugins: [
    [
      '@docusaurus/plugin-google-tag-manager',
      {
        containerId: 'GTM-WT49VGT',
      },
    ],
    'docusaurus-plugin-hubspot',
    'docusaurus-plugin-sass',
    'docusaurus-plugin-image-zoom',
    /**
     * Seems like we have an issue where a medium-zoom--hidden class is applied on the second, top-most (z-index wise) image,
     * actually hiding the image when zoomed in. Found no related issue in the plugin's repo, might have to dig whether it's
     * related to the Docusaurus canary build or not.
     */
    // [
    //   '@docusaurus/plugin-client-redirects',
    //   {
    //     fromExtensions: ['html', 'htm'], // /myPage.html -> /myPage
    //     redirects: [
    //       // /docs/oldDoc -> /docs/newDoc
    //       {
    //         to: '/dev-docs/admin-panel-customization',
    //         from: ['/developer-docs/latest/development/admin-customization', '/developer-docs/latest/development/admin-customization.html'],
    //       },
    //       // Redirect from multiple old paths to the new path
    //       // {
    //       //   to: '/docs/newDoc2',
    //       //   from: ['/docs/oldDocFrom2019', '/docs/legacyDocFrom2016'],
    //       // },
    //     ],
    //   },
    // ],
  ],
};

module.exports = config;
