// Documentation plugin tour, step for step the Guideflow tour it replaces.
// Runs against the demo app from setup-demo-app.js, with @strapi/plugin-documentation
// installed in it (same version as @strapi/strapi), so the app serves the Swagger UI
// at /documentation/v1.0.0.

const SWAGGER_ARTICLE_TOGGLE = 'h3[data-tag="Article"] button.expand-operation';

module.exports = {
  title: 'Documentation plugin',
  viewport: { width: 1280, height: 800 },
  // The Guideflow starts on the Home page, but its Profile widget shows the admin email,
  // which must not end up in published screenshots. Any page shows the same navigation.
  start: '/admin/content-manager',

  // The tour changes nothing on the server: Swagger UI only expands sections and opens
  // the authorization dialog in the browser. Fails early if the plugin is missing.
  async setup({ api }) {
    await api.get('/documentation/getInfos');
  },

  intro: {
    text: 'Welcome to the guided tour of the Documentation plugin!',
    button: "Let's go 🚀",
  },

  steps: [
    {
      click: 'nav a[aria-label="Documentation"]',
      text: 'Click here to access the plugin',
    },
    {
      click: 'role=link[name="Open documentation"]',
      text: 'Open the API documentation',
    },
    {
      click: SWAGGER_ARTICLE_TOGGLE,
      text: 'Browse your API',
    },
    {
      click: SWAGGER_ARTICLE_TOGGLE,
      text: 'Use the toggle to show/hide details',
    },
    {
      click: 'button.authorize',
      text: 'Click here if you need to authenticate your queries with a JWT (JSON web token).',
    },
  ],

  outro: {
    text: 'Thank you for following this guided tour!',
    links: [
      { label: 'Documentation plugin docs 📖', href: '/cms/plugins/documentation' },
      { label: '🚀 Quick Start Guide', href: '/cms/quick-start' },
    ],
  },
};
