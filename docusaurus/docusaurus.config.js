// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

// const redirects = require('./redirects');
const {themes} = require('prism-react-renderer');
// const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Strapi 5 Documentation',
  tagline: 'Design APIs fast, manage content easily.',
  url: 'https://docs.strapi.io',
  baseUrl: '/',
  onBrokenLinks: 'throw', // replace with 'throw' to stop building if broken links
  onBrokenMarkdownLinks: 'throw',
  onBrokenAnchors: 'throw',
  favicon: 'https://strapi.io/assets/favicon-32x32.png',

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
      src: '/js/redirector.js',
      async: false, // Load synchronously to ensure it runs before page navigation
    },
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
      // src: 'https://unpkg.com/@phosphor-icons/web@2.0.3',
      src: 'https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1', // fallback
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
      // 'data-modal-override-open-class-search': 'DocSearch-Button',
      // 'data-modal-title-search': 'Search Strapi Docs',
      'data-modal-open-on-command-k': 'true',
      // 'data-search-mode-enabled': true,
      'data-modal-override-open-class': "kapa-widget-button",
      'data-modal-title-ask-ai': 'Ask your question',
      'data-modal-border-radius': '4px',
      'data-submit-query-button-bg-color': '#4945FF',
      'data-modal-body-padding-top': '20px',
      'data-modal-y-offset': "25vh",
      async: true,
    },
    {
      src: `https://cdn.amplitude.com/script/181a95e5a6b8053f7ffb7da9f0ef7ef4.experiment.js`,
      async: true,
    },
  ],
  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/regular/style.css', // fallback
      type: 'text/css',
      rel: 'stylesheet',
    },
    {
      href: 'https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/fill/style.css', // fallback
      type: 'text/css',
      rel: 'stylesheet',
    },
    {
      href: 'https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/bold/style.css', // fallback
      type: 'text/css',
      rel: 'stylesheet',
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
          "You are viewing an all-new version of Strapi Docs 🧑🏽‍🔬 Feel free to <a target='_blank' rel='noopener noreferrer' href='https://forms.gle/D1SXb8kYBVR7qijp6'>give your feedback!</a>",
        backgroundColor: '#F3E5FA',
        textColor: '#091E42',
        isCloseable: true,
      },
      docs: {
        sidebar: {
          hideable: true,
        },
      },
      algolia: {
         appId: '392RJ63O14',
         apiKey: 'ed62374a794e8da5accb298e13618614',
         indexName: 'cmsDocs',
         insights: true,
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
            docId: 'cms/intro',
            position: 'left',
            // label: 'CMS',
            html: '<i class="ph-fill ph-feather"></i> CMS'
          },
          {
            type: 'doc',
            docId: 'cloud/getting-started/intro',
            position: 'left',
            html: '<i class="ph-fill ph-cloud"></i> Cloud',
          },
          {
            href: 'https://github.com/strapi/documentation',
            position: 'right',
            html: '<i class="ph-fill ph-github-logo"></i> GitHub',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Updates & Support',
            items: [
              {
                label: "What's new?",
                href: '/whats-new'
              },
              {
                label: "Release notes",
                href: '/release-notes'
              },
              {
                label: "FAQ",
                href: '/cms/faq'
              },
              {
                label: "Community & Support",
                href: '/cms/community'
              },
              {
                label: "Usage information",
                href: '/cms/usage-information'
              },
            ]
          },
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
        additionalLanguages: ['bash', 'diff', 'json'],
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
    // [ // Disabled
    //   '@docusaurus/plugin-client-redirects',
    //   {
    //     redirects: redirects,
    //   }
    // ]
    /**
     * Seems like we have an issue where a medium-zoom--hidden class is applied on the second, top-most (z-index wise) image,
     * actually hiding the image when zoomed in. Found no related issue in the plugin's repo, might have to dig whether it's
     * related to the Docusaurus canary build or not.
     */
  ],
};

module.exports = config;
