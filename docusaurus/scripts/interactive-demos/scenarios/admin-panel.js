// Admin panel tour, step for step the Guideflow tour it replaces.
// Runs against the demo app from setup-demo-app.js, with French and German added to
// the admin interface languages in its src/admin/app.js:
//   export default { config: { locales: ['fr', 'de'] }, bootstrap() {} };

const NAV = 'nav ul';
// CSS, not a role: once the menu is open, the rest of the page is aria-hidden.
const USER_MENU_BUTTON = "nav button[aria-haspopup=menu]";
const USER_MENU = 'role=menu';

module.exports = {
  title: 'Admin Panel Overview',
  viewport: { width: 1280, height: 800 },
  start: '/admin',

  // Brings the app back to the same state before every capture.
  async setup({ api }) {
    // The tour saves French as the interface language: the next capture must start in English.
    // The dark mode it saves lives in the browser only, and every capture starts a new browser.
    await api.put('/admin/users/me', { preferedLanguage: null });
  },

  intro: {
    text: 'Welcome to the guided tour of the Admin Panel!',
    button: "Let's start 🚀",
  },

  steps: [
    // Main navigation
    {
      explain: NAV,
      zoom: true,
      text: 'This is the navigation of the admin panel. It can be different from one project to another, depending on which plugins are available or not.',
    },
    {
      explain: NAV,
      text: "Let's see what's behind the main items of the admin panel navigation!",
    },
    {
      click: `${NAV} >> role=link[name="Content Manager"]`,
      text: "Let's start by visiting the **Content Manager**!",
    },
    {
      chapter: true,
      text: 'From the Content Manager, you can write and manage your content.',
    },
    {
      click: `${NAV} >> role=link[name="Media Library"]`,
      text: "Let's visit the **Media Library**!",
    },
    {
      chapter: true,
      text: 'From the Media Library, you can add and manage assets.',
    },
    {
      click: `${NAV} >> role=link[name="Content-Type Builder"]`,
      text: "Let's visit the **Content-type Builder**!",
    },
    {
      chapter: true,
      text: 'With the Content-type Builder, you can create and edit content types.',
    },
    {
      click: `${NAV} >> role=link[name="Settings"]`,
      text: "Let's take a look at the admin panel **Settings**!",
    },
    {
      chapter: true,
      text: 'A variety of settings, focusing on both the admin panel or your plugins, are accessible from here. Each setting is controlled by a system of user permissions.',
    },

    // User profile
    {
      before: [{ click: USER_MENU_BUTTON }],
      explain: [USER_MENU, USER_MENU_BUTTON],
      zoom: true,
      text: "Finally, let's visit your **user profile**!",
    },
    {
      explain: [USER_MENU, USER_MENU_BUTTON],
      zoom: true,
      text: 'You access your profile and its settings, as well as the logout button, by clicking on your initials in the navigation.',
    },
    {
      before: [{ click: 'role=menuitem[name="Profile settings"]' }],
      chapter: true,
      text: 'From your profile, you can change your account information, password and experience preferences.',
    },
    {
      explain: [
        'role=heading[name="Experience"]',
        'role=combobox[name="Interface language"]',
        'role=combobox[name="Interface mode"]',
      ],
      padding: 24,
      text: "Let's set up this account so that it fits our preferences: French language and a Dark Mode interface.",
    },
    {
      click: 'role=combobox[name="Interface language"]',
      text: 'Click here to choose another language.',
    },
    {
      click: 'role=option[name="Français"]',
      text: 'Click on "*Français*" to have the admin panel in French.',
    },
    {
      click: 'role=combobox[name="Interface mode"]',
      text: 'Click here to switch to dark mode.',
    },
    {
      click: 'role=option[name="Dark mode"]',
      text: 'Click on "*Dark Mode*" in the dropdown.',
    },
    {
      click: 'role=button[name="Save"]',
      text: 'Click on the *Save* button to confirm the new preferences for the account.',
    },
    {
      // The interface is now in French. Guideflow highlighted the "Saved" toast,
      // which captures hide: the highlight shows the saved preferences instead.
      explain: [
        'role=heading[name="Expérience"]',
        'role=combobox[name="Langue de l\'interface"]',
        'role=combobox[name="Mode d\'interface"]',
      ],
      padding: 24,
      text: "The account is now personalised based on our preferences, and we're ready to work more efficiently with the admin panel! 👏",
    },
    {
      chapter: true,
      text: 'This is the end of our guided tour!',
    },
  ],

  outro: {
    text: 'Thank you for following this guided tour!',
    links: [
      { label: 'Admin Panel docs 📖', href: '/cms/features/admin-panel' },
      { label: '🚀 Quick Start Guide', href: '/cms/quick-start' },
    ],
  },
};
