// Content Manager tour. Runs against the Strapi example app (`npx create-strapi-app --example`)
// with Article localized, so the list view shows the locale picker.

const ARTICLE = 'api::article.article';
const CM_NAV = 'nav[aria-label="Content Manager"]';

module.exports = {
  title: 'Content Manager overview',
  viewport: { width: 1280, height: 800 },
  start: '/admin/content-manager/single-types/api::about.about',

  async setup({ api }) {
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
    button: "Let's start",
  },

  steps: [
    {
      explain: CM_NAV,
      text: 'This is the navigation of the Content Manager. It gives access to all content-types created beforehand in the Content-type Builder.',
    },
    {
      explain: CM_NAV,
      text: 'The content-types are organised in 2 categories, **Collection types** and **Single types**, to make it easier to find them. You can also use the search field.',
    },
    {
      explain: 'main',
      text: 'Here we have an example of a **Single type**, which can only have one entry.',
    },
    {
      explain: 'main',
      text: 'Therefore, with Single types, we directly land on their edit view.',
    },
    {
      click: `${CM_NAV} a:has-text("Article")`,
      text: "Let's see an example of a Collection type to compare!",
    },
    {
      explain: 'main h1',
      text: '"Article" is a **Collection type**. It can manage several entries.',
    },
    {
      explain: 'main table',
      text: 'We first land on the **list view**, where we can choose which entry to edit.',
    },
    {
      explain: ['role=button[name="Search"]', 'role=button[name="Filters"]'],
      text: 'These are the search and filter buttons to help you find specific entries in the table.',
    },
    {
      explain: '[aria-label="Select a locale"]',
      text: 'This dropdown displays the entries based on the language, called "locale", they are available in.',
    },
    {
      explain: 'role=button[name="View settings"]',
      text: 'This is the settings button, from which you can decide which fields to display in the table. It also gives access to the configuration of the list view.',
    },
    {
      explain: null,
      text: "Let's try using all these buttons together!",
    },
    {
      click: 'role=button[name="Filters"]',
      text: 'Click here to filter the entries listed in the table.',
    },
    {
      click: '[aria-label="Select field"]',
      text: 'Choose the field to filter on.',
    },
    {
      click: 'role=option[name="category"]',
      text: 'Let\'s filter based on the "category" field!',
    },
    {
      fill: 'input[name=value]',
      value: 'nature',
      text: 'Let\'s filter entries whose category is "nature".',
    },
    {
      click: 'role=button[name="Add filter"]',
      text: 'Click on **Add filter** to apply the new filter on the table.',
    },
    {
      explain: 'main table',
      text: 'We now have only 2 entries left in our filtered table! Now, let\'s configure the table so that it fits our preferences.',
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
      explain: 'a:has-text("Configure the view")',
      text: 'To define the displayed fields more permanently, set your preferences with the **Configure the view** button.',
    },
    {
      before: [{ press: 'Escape' }],
      explain: 'main table',
      text: 'Authors are now displayed in the table!',
    },
    {
      click: 'role=link[name="Create new entry"]',
      text: "Now that we've explored the list view, let's discover the edit view by creating a new entry!",
    },
  ],

  outro: {
    text: 'This prototype stops here. The full tour continues with the edit view.',
    links: [
      { label: 'Content Manager docs', href: '/cms/features/content-manager' },
      { label: 'Quick Start Guide', href: '/cms/quick-start' },
    ],
  },
};
