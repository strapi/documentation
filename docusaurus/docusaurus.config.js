// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Strapi 5 Documentation',
  tagline: 'Design APIs fast, manage content easily.',
  url: 'https://docs.strapi.io/',
  baseUrl: '/',
  onBrokenLinks: 'throw', // replace with 'throw' to stop building if broken links
  onBrokenMarkdownLinks: 'throw',
  favicon: 'https://strapi.io/assets/favicon-32x32.png',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  headTags: [
    { // Useful for SEO even if we don't have multiple languages
      tagName: 'link',
      attributes: {
        rel: 'alternate',
        href: 'https://docs.strapi.io',
        hreflang: 'en',
      },
    },
  ],

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-live-codeblock', '@docusaurus/theme-mermaid'],

  scripts: [
    {
      src: '/js/hotjar.js',
      type: 'module',
      async: true,
    },
    {
      src: '/js/particle.js',
      type: 'module',
      async: true,
    },
    {
      src: '/js/firework.js',
      type: 'module',
      async: true,
    },
    {
      src: '/js/ball.js',
      type: 'module',
      async: true,
    },
    {
      src: '/js/bar.js',
      type: 'module',
      async: true,
    },
    {
      src: '/js/game.js',
      type: 'module',
      async: true,
    },
    {
      src: '/js/particleProfiles.js',
      type: 'module',
      async: true,
    },
    {
      /**
       * Kapa AI widget script and parameters
       * See https://docs.kapa.ai/installation-widget#optional-configuration-parameters-
       */
      src: 'https://widget.kapa.ai/kapa-widget.bundle.js',
      'data-website-id': 'f1838a12-ad58-4224-9fab-2f0704eeeb52',
      'data-project-name': 'Strapi',
      'data-project-logo': 'https://strapi.io/assets/favicon-32x32.png',
      'data-button-hide': 'true',
      'data-modal-disclaimer': 'Disclaimer: Answers are AI-generated and might be inaccurate. Please ensure you double-check the information provided by visiting source pages.',
      'data-project-color': '#4945FF',
      'data-button-bg-color': '#32324D',
      // 'data-modal-open-on-command-k': 'true',
      'data-modal-override-open-class': "kapa-widget-button",
      'data-modal-title-ask-ai': 'Ask your question',
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
          /**
           * Both flags below have been disabled
           * since it doesn't seem to play well
           * with Vercel-hosted websites 🤷
           */
          // showLastUpdateAuthor: true,
          // showLastUpdateTime: true,
        },
        // we're using docs-only mode for now — see https://docusaurus.io/docs/docs-introduction
        blog: false,
        theme: {
          customCss: require.resolve('./src/scss/__index.scss'),
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      announcementBar: {
        id: 'support_us',
        content:
          "You are viewing the Strapi 5 docs 🥳 Don't panic! Strapi v4 is still supported until March 2026. Strapi v4 docs are now hosted at <a target='_blank' rel='noopener noreferrer' href='https://docs-v4.strapi.io'>docs-v4.strapi.io</a>.",
        backgroundColor: '#F3E5FA',
        textColor: '#091E42',
        isCloseable: true,
      },
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        },
      },
      algolia: {
         appId: '392RJ63O14',
         apiKey: 'ed62374a794e8da5accb298e13618614',
         indexName: 'strapiDocsv5beta',
      },
      navbar: {
        hideOnScroll: false,
        logo: {
          alt: 'Strapi Documentation Logo',
          src: 'img/logo-v5.png',
          srcDark: 'img/logo-v5-dark.png',
        },
        items: [
          {
            type: 'doc',
            docId: 'dev-docs/quick-start',
            position: 'left',
            label: 'Quick Start Guide',
          },
          {
            type: 'doc',
            docId: 'user-docs/intro',
            position: 'left',
            label: 'User Guide',
          },
          {
            type: 'doc',
            docId: 'dev-docs/intro',
            position: 'left',
            label: 'Developer Docs',
          },
          {
            type: 'doc',
            docId: 'cloud/getting-started/intro',
            position: 'left',
            label: 'Cloud Documentation',
          },
          {
            type: 'doc',
            docId: 'release-notes',
            position: 'left',
            label: 'Release Notes',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Additional resources',
            items: [
              {
                label: 'v4 Docs',
                href: 'https://docs-v4.strapi.io'
              },
              {
                label: 'Contributor Docs',
                href: 'https://contributor.strapi.io'
              },
              {
                label: 'Strapi Design System',
                href: 'https://design-system.strapi.io/'
              },
              {
                label: 'v3 Docs (unsupported)',
                href: 'https://docs-v3.strapi.io'
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
              },
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
    }),

  plugins: [
    [
      '@docusaurus/plugin-google-tag-manager',
      {
        containerId: 'GTM-WT49VGT',
      },
    ],
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
