// Content Manager tour, step for step the Guideflow tour it replaces.
// Runs against the demo app from setup-demo-app.js.

const ARTICLE = 'api::article.article';
const CM_NAV = 'nav[aria-label="Content Manager"]';
const TITLE_EN = 'How I wrote my first article with Strapi';
const TITLE_FR = "Comment j'ai créé mon premier article avec Strapi";
const CATEGORY = 'story';

module.exports = {
  title: 'Content Manager Overview',
  viewport: { width: 1280, height: 800 },
  start: '/admin/content-manager/single-types/api::about.about',

  // Brings the app back to the same state before every capture.
  async setup({ api }) {
    // The tour shows English and French only (the internationalization tour adds German).
    const locales = await api.get('/i18n/locales');
    for (const locale of locales.filter((item) => !['en', 'fr'].includes(item.code))) {
      await api.del(`/i18n/locales/${locale.id}`);
    }
    if (!locales.some((locale) => locale.code === 'fr')) {
      await api.post('/i18n/locales', { name: 'French (fr)', code: 'fr', isDefault: false });
    }

    // Entries created by a previous capture.
    for (const locale of ['fr', 'en']) {
      const { results } = await api.get(`/content-manager/collection-types/${ARTICLE}?pageSize=100&locale=${locale}`);
      for (const entry of results.filter((item) => [TITLE_EN, TITLE_FR].includes(item.title))) {
        await api.del(`/content-manager/collection-types/${ARTICLE}/${entry.documentId}?locale=${locale}`);
      }
    }

    const { data } = await api.get(`/content-manager/content-types/${ARTICLE}/configuration`);
    const { layouts, metadatas, settings } = data.contentType;
    // GET returns a computed `list.mainField` that PUT rejects.
    for (const field of Object.values(metadatas)) delete field.list?.mainField;
    await api.put(`/content-manager/content-types/${ARTICLE}/configuration`, {
      layouts: { ...layouts, list: ['id', 'title', 'description', 'category'] },
      metadatas,
      settings,
    });
  },

  intro: {
    text: 'Welcome to the guided tour of the Content Manager!',
    button: "Let's start 🚀",
  },

  steps: [
    // Single types
    {
      explain: CM_NAV,
      text: 'This is the navigation of the Content Manager. It gives access to all content-types created beforehand in the Content-type Builder.',
    },
    {
      explain: CM_NAV,
      text: 'The content-types are organised in 2 categories, *Collection types* and *Single types*, to make it easier to find them. But feel free to also use the search button! 🔍',
    },
    {
      explain: 'main',
      text: 'Here we have an example of a **Single type**, which can only have one entry.',
    },
    {
      explain: 'main',
      text: 'Therefore, with Single types, we directly land on their **edit view**.',
    },
    {
      click: `${CM_NAV} a:has-text("Article")`,
      text: "Let's see an example of a **Collection type** to compare!",
    },

    // List view
    {
      explain: 'main',
      text: '"Article" is a **Collection type**. It can manage several entries.',
    },
    {
      explain: 'main',
      text: 'We first land on the **list view**, where we can choose which entry to edit.',
    },
    {
      explain: 'main',
      text: "Let's explore the list view! 🚀",
    },
    {
      explain: ['role=button[name="Search"]', 'role=button[name="Filters"]'],
      text: 'These are the 🔍 **search** and **filter** buttons to help you find specific entries in the table.',
    },
    {
      explain: '[aria-label="Select a locale"]',
      text: 'This dropdown allows you to display in the table the entries based on the language, called "**locale**", they\'re available in.',
    },
    {
      explain: 'role=button[name="View settings"]',
      text: 'This is the **settings** button, from which you can decide which fields to display or not in the table. It also gives access to the configuration of the list view.',
    },
    {
      chapter: true,
      text: "Let's try using all these buttons together!",
    },
    {
      click: 'role=button[name="Filters"]',
      text: 'Click here to filter the entries listed in the table.',
    },
    {
      before: [{ click: '[aria-label="Select field"]' }],
      click: 'role=option[name="category"]',
      text: 'Let\'s filter based on the "category" field!',
    },
    {
      fill: 'input[name=value]',
      value: 'nature',
      text: 'Let\'s filter entries which category is "nature".',
    },
    {
      click: 'role=button[name="Add filter"]',
      text: 'Click on *Add filter* to apply the new filter on the table.',
    },
    {
      chapter: true,
      text: "We now have only 2 entries left in our filtered table!\n\nTalking about the table, let's configure it so that it fits our preferences!",
    },
    {
      click: 'role=button[name="View settings"]',
      text: 'Click on the settings button.',
    },
    {
      click: 'role=checkbox[name="author"]',
      text: 'Click here to display the "author" field in the table of entries.',
    },
    {
      chapter: true,
      text: 'Authors are now displayed in the table!',
    },
    {
      explain: 'a:has-text("Configure the view")',
      text: '💡 If you want to define the displayed fields more permanently, you can set your preferences via the *Configure the view* button.',
    },
    {
      before: [{ press: 'Escape' }],
      click: 'role=link[name="Create new entry"]',
      text: 'Now that we\'ve explored the list view, let\'s discover the edit view by **creating a new entry** for "Article"!',
    },

    // Edit view
    {
      explain: 'main',
      text: "Let's explore the edit view!",
    },
    {
      explain: ['main a:has-text("Back")', 'main h1', 'role=tab[name="published"]'],
      zoom: true,
      text: 'Here is the name of your entry and its status, "Draft". Note that the concept of draft is only available if **Draft & Publish** is enabled.',
    },
    {
      explain: ['main a:has-text("Back")', 'main h1', 'role=tab[name="published"]'],
      zoom: true,
      text: 'You can also see the **Draft** and **Publish tabs** which respectively allow you to edit the entry and see in read-only mode what the published entry looks like.',
    },
    {
      explain: '[aria-label="Locales"]',
      text: 'This dropdown allows you to switch between the **locales** in which the entry is available.',
    },
    {
      explain: 'role=button[name="Fill in from another locale"]',
      text: 'This button allows you to automatically reuse the content of one locale for another.',
    },
    {
      explain: 'role=button[name="More actions"]',
      text: 'This button gives access to several other options for the entry, such as:\n• **Edit the model**, to be redirected to the Content-type Builder\n• **Configure the view**, to set up differently how the edit view fields are displayed\n• **Content History**, a feature to see the edition history of the entry\n• **Delete entry**, to delete the entry in one specific locale or all of them',
    },
    {
      explain: ['input[name=title]', 'input[name=category]', 'role=button[name="Add a component to blocks"]'],
      padding: 24,
      text: 'These are the fields of the entry, which were defined in the Content-type Builder, and can be filled in here.',
    },
    {
      explain: ['role=button[name="Publish"]', 'role=button[name="Save"]'],
      padding: 20,
      text: 'This is the area where you can **save** and **publish content**.\n\nYou can also click on **...** to add your content to a **release** (if Releases is available) as well as **unpublish the entry**.',
    },
    {
      fill: 'input[name=title]',
      value: TITLE_EN,
      text: "Let's try some of those options, starting with filling in some fields. Let's start with a title!",
    },
    {
      click: 'input[name=category]',
      after: [{ click: `role=option[name="${CATEGORY}"]` }],
      text: "Now let's choose a category for our new article.",
    },
    {
      click: 'role=button[name="Save"]',
      text: "Don't forget to **save** your changes!",
    },
    {
      before: [{ click: '[aria-label="Locales"]' }],
      click: 'role=option[name="Create French (fr) locale"]',
      text: "Now let's create a French version of our article!",
    },
    {
      fill: 'input[name=title]',
      value: TITLE_FR,
      text: "Let's translate the title in French.",
    },
    {
      click: 'input[name=category]',
      after: [{ click: `role=option[name="${CATEGORY}"]` }],
      text: "And let's add a category for this version as well!",
    },
    {
      click: 'role=button[name="Save"]',
      text: "And let's not forget to save again!",
    },
    {
      chapter: true,
      text: 'This is the Content Manager in a nutshell!',
    },
  ],

  outro: {
    text: 'Thank you for following this guided tour!',
    links: [
      { label: 'Content Manager docs 📖', href: '/cms/features/content-manager' },
      { label: '🚀 Quick Start Guide', href: '/cms/quick-start' },
    ],
  },
};
