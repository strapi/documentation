// Internationalization (i18n) tour, step for step the Guideflow tour it replaces.
// Runs against the demo app from setup-demo-app.js.
// The tour starts from a project with English only and an Article collection type
// that is not localized yet: setup brings the app back to that state.

const ARTICLE = 'api::article.article';
const SETTINGS_NAV = 'nav[aria-label="Settings"]';
const LOCALE_DIALOG = 'role=dialog';
const ENTRY = "What's inside a Black Hole";
const TITLE_FR = "Qu'y a-t-il dans un trou noir ?";
const DESCRIPTION_FR = 'La réponse est peut-être dans cet article…';

// Waits for the server to answer again after a Content-type Builder change restarts it.
async function waitForRestart(api) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    try {
      await api.get('/i18n/locales');
      return;
    } catch (error) {
      // The server is still restarting.
    }
  }
  throw new Error('The Strapi server did not come back after the restart');
}

module.exports = {
  title: 'Internationalization (i18n)',
  viewport: { width: 1280, height: 800 },
  start: '/admin/settings/application-infos',

  // Brings the app back to the same state before every capture.
  async setup({ api }) {
    // The tour enables Internationalization on Article: turn it off first.
    // Turning it off also deletes the entries of the other locales.
    const { data } = await api.get(`/content-type-builder/content-types/${ARTICLE}`);
    const { schema } = data;
    if (schema.pluginOptions?.i18n?.localized) {
      const { visible, restrictRelationsTo, ...contentType } = schema;
      const attributes = {};
      for (const [name, attribute] of Object.entries(schema.attributes)) {
        const { pluginOptions, inversedBy, mappedBy, ...rest } = attribute;
        attributes[name] = rest;
      }
      await api.put(`/content-type-builder/content-types/${ARTICLE}`, {
        contentType: { ...contentType, pluginOptions: { i18n: { localized: false } }, attributes },
        components: [],
      });
      await waitForRestart(api);
    }

    // The tour starts with English only, displayed as "English (en)".
    const locales = await api.get('/i18n/locales');
    for (const locale of locales) {
      if (locale.isDefault) {
        if (locale.name !== 'English (en)') await api.put(`/i18n/locales/${locale.id}`, { name: 'English (en)' });
      } else {
        await api.del(`/i18n/locales/${locale.id}`);
      }
    }
  },

  intro: {
    text: 'Welcome to the guided tour of the Internationalization (i18n) feature!',
    button: "Let's go 🚀",
  },

  steps: [
    // Locales
    {
      click: `${SETTINGS_NAV} a:has-text("Internationalization")`,
      text: 'First, we need to go to the **Settings** of the admin panel, to configure the **Internationalization** feature.',
    },
    {
      click: 'role=button[name="Add new locale"]',
      text: 'Languages available via the Internationalization feature are called "**locales**". Let\'s add new ones!',
    },
    {
      before: [{ click: `${LOCALE_DIALOG} >> role=combobox[name="Locales"]` }, { hover: 'role=option[name="French (fr)"]' }],
      click: 'role=option[name="French (fr)"]',
      text: "You can choose any of the 500+ locales available in the *Locales* dropdown. For example, let's select French.",
    },
    {
      fill: 'input[name=name]',
      value: 'French',
      text: 'You can decide which *Locale display name* to give your new locale.',
    },
    {
      click: `${LOCALE_DIALOG} >> role=tab[name="Advanced settings"]`,
      text: '**Advanced settings** are available when adding or editing locales.',
    },
    {
      explain: `${LOCALE_DIALOG} >> role=tabpanel[name="Advanced settings"]`,
      text: 'This is where a new locale can be set as the default one.',
    },
    {
      before: [{ click: `${LOCALE_DIALOG} >> role=tab[name="Basic settings"]` }],
      click: `${LOCALE_DIALOG} >> role=button[name="Save"]`,
      text: "Let's save our new locale!",
    },
    // German, added off screen like in the Guideflow tour.
    {
      do: [
        { click: 'role=button[name="Add new locale"]' },
        { click: `${LOCALE_DIALOG} >> role=combobox[name="Locales"]` },
        { click: 'role=option[name="German (de)"]' },
        { fill: 'input[name=name]', value: 'German' },
        { click: `${LOCALE_DIALOG} >> role=button[name="Save"]` },
      ],
    },
    {
      chapter: true,
      text: 'You can repeat this procedure as many times as you want, to add more locales to your project!',
    },
    {
      explain: ['role=button[name="Edit French locale"]', 'role=button[name="Delete French locale"]'],
      text: 'From the Internationalization settings you can also:\n• ✏️ **Edit** a locale\n• 🗑️ **Delete** a locale',
    },
    {
      click: 'role=button[name="Edit English (en) locale"]',
      text: "Let's edit the English locale to modify the display name!",
    },
    {
      fill: 'input[name=name]',
      value: 'English',
      text: 'We can remove the "(en)" part to make the display name fit with the others.',
    },
    {
      click: `${LOCALE_DIALOG} >> role=button[name="Save"]`,
      text: "Don't forget to save!",
    },

    // Content-type Builder
    {
      before: [{ goto: `/admin/plugins/content-type-builder/content-types/${ARTICLE}` }],
      explain: `a[href="/admin/plugins/content-type-builder"]`,
      text: 'Now, we need to make sure Internationalization is enabled in the **Content-type Builder**.',
    },
    {
      click: 'role=button[name="Edit"s]',
      text: "Let's edit our Article collection type to enable the feature!",
    },
    {
      click: 'role=tab[name="Advanced settings"]',
      text: 'Go to the **Advanced settings** of the collection type.',
    },
    {
      click: 'role=checkbox[name="Internationalization"]',
      text: 'Tick the Internationalization box to enable the feature for the Article collection type.',
    },
    {
      click: 'role=button[name="Finish"]',
      text: "Don't forget to click on *Finish* to confirm the changes!",
    },

    // Content Manager
    {
      before: [
        { click: 'nav[aria-label="Content-Type Builder"] >> role=button[name="Save"s]' },
        { wait: 3000 },
        // The restart overlay blocks clicks: this click waits until the server is back.
        { click: `a[href="/admin/content-manager"]` },
        // Lets the admin settle after the restart.
        { wait: 5000 },
        { goto: `/admin/content-manager/collection-types/${ARTICLE}?page=1&pageSize=10&sort=title:ASC&plugins[i18n][locale]=en` },
        { waitFor: `text=${ENTRY}`, timeout: 120000 },
      ],
      explain: `a[href="/admin/content-manager"]`,
      text: "Finally, we can move to the **Content Manager** to manage content in the different locales we've added earlier!",
    },
    {
      click: `role=gridcell[name="${ENTRY}"]`,
      text: "For now, our articles are only available in English. Let's make a version of this one in another locale!",
    },
    {
      before: [
        { waitFor: 'role=button[name="Publish"]', timeout: 60000 },
        { click: '[aria-label="Locales"]' },
      ],
      click: 'role=option[name="Create French locale"]',
      text: "Let's create a version of our article in the French locale!",
    },
    {
      fill: 'input[name=title]',
      value: TITLE_FR,
      text: 'You can fill in one field at a time for the new locale.',
    },
    {
      explain: 'input[name=title]',
      text: 'For example, we can translate the title of the article into French.',
    },
    {
      click: 'role=button[name="Fill in from another locale"]',
      text: 'Or we can click the *Fill in from another locale* button to automatically fill in all the fields with existing content from a chosen locale.',
    },
    {
      before: [{ click: 'role=alertdialog >> role=combobox[name="Locale"]' }],
      click: 'role=option[name="English"]',
      text: "Let's try reusing the content from the English version of the article. Note however that all the fields will be automatically filled in, meaning that the content we just filled in will be erased!",
    },
    {
      click: 'role=button[name="Yes, fill in"]',
      text: "Let's go ahead with the automatic fill-in from another locale!",
    },
    {
      // The fill-in scrolls the page down to the dynamic zone.
      before: [{ hover: 'main h1' }],
      chapter: true,
      text: "Let's properly fill in all our fields in French!",
    },
    {
      before: [
        { fill: 'input[name=title]', value: TITLE_FR },
        { fill: 'textarea[name=description]', value: DESCRIPTION_FR },
        { hover: 'main h1' },
      ],
      click: 'role=button[name="Save"]',
      text: "And let's not forget to save!",
    },
    {
      before: [{ hover: 'main h1' }],
      chapter: true,
      text: 'And we are done: new locales are available for our articles and we have created a French version for one of them! ✨',
    },
  ],

  outro: {
    text: 'Thank you for following this guided tour!',
    links: [
      { label: 'i18n documentation 📖', href: '/cms/features/internationalization' },
      { label: '🚀 Quick Start Guide', href: '/cms/quick-start' },
    ],
  },
};
