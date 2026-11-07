// Content History tour, step for step the Guideflow tour it replaces.
// Runs against the demo app from setup-demo-app.js, started with an Enterprise license
// (Content History is an Enterprise feature): STRAPI_LICENSE=... npm run develop.

const ARTICLE = 'api::article.article';
const TITLE = "What's inside a Black Hole";
const AUTHOR = 'Sarah Baker';
// The previous version has the first category, the current one the second.
const OLD_CATEGORY = 'news';
const NEW_CATEGORY = 'nature';
// Same default as capture.js.
const BASE_URL = (process.env.DEMO_STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '');
const TOKEN_NAME = 'Content History demo';
const VERSIONS = 'aside:has(h2:text-is("Versions"))';

const idOf = (media) => (media && typeof media === 'object' ? media.id : media);

// Turns the dynamic zone returned by the Content Manager into data it accepts back.
const blocksInput = (blocks = []) => blocks.map(({ id, __component, ...fields }) => {
  const block = { __component };
  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) block[key] = value.map(idOf);
    else if (value && typeof value === 'object') block[key] = idOf(value);
    else block[key] = value;
  }
  return block;
});

module.exports = {
  title: 'Content History',
  viewport: { width: 1280, height: 800 },
  // Replaced in setup by the edit view of the entry it recreates.
  start: '/admin/content-manager/collection-types/api::article.article',

  // History versions cannot be deleted, so every capture recreates the article
  // and gives it the same 3 versions: published, modified, published again.
  async setup({ api }) {
    const findByName = async (uid, name) => {
      const { results } = await api.get(`/content-manager/collection-types/${uid}?pageSize=100`);
      const entry = results.find((item) => item.name === name);
      if (!entry) throw new Error(`No ${uid} named ${name}`);
      return entry;
    };
    const author = await findByName('api::author.author', AUTHOR);
    const oldCategory = await findByName('api::category.category', OLD_CATEGORY);
    const newCategory = await findByName('api::category.category', NEW_CATEGORY);

    const { results } = await api.get(`/content-manager/collection-types/${ARTICLE}?pageSize=100&locale=en`);
    const existing = results.filter((item) => item.title === TITLE);
    if (!existing.length) throw new Error(`No article titled ${TITLE}`);
    const { data: source } = await api.get(`/content-manager/collection-types/${ARTICLE}/${existing[0].documentId}?locale=en`);
    const content = {
      title: source.title,
      description: source.description,
      slug: source.slug,
      cover: idOf(source.cover),
      blocks: blocksInput(source.blocks),
      author: { connect: [{ id: author.id }] },
    };
    for (const entry of existing) {
      for (const locale of ['fr', 'en']) {
        await api.del(`/content-manager/collection-types/${ARTICLE}/${entry.documentId}?locale=${locale}`).catch(() => {});
      }
    }

    // The article comes back through the Content API, which records no history version.
    const tokens = await api.get('/admin/api-tokens');
    for (const token of tokens.data.filter((item) => item.name === TOKEN_NAME)) {
      await api.del(`/admin/api-tokens/${token.id}`);
    }
    const { data: token } = await api.post('/admin/api-tokens', {
      name: TOKEN_NAME,
      description: 'Created by the Content History interactive demo capture',
      type: 'full-access',
      lifespan: null,
    });
    const response = await fetch(`${BASE_URL}/api/articles?status=published&locale=en`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.accessKey}` },
      body: JSON.stringify({
        data: {
          ...content,
          author: { connect: [author.documentId] },
          category: { connect: [oldCategory.documentId] },
        },
      }),
    });
    if (!response.ok) throw new Error(`Article creation failed: ${response.status} ${await response.text()}`);
    const { data: created } = await response.json();
    await api.del(`/admin/api-tokens/${token.id}`);

    const url = `/content-manager/collection-types/${ARTICLE}/${created.documentId}`;
    // Version 1: published with the old category.
    await api.post(`${url}/actions/publish?locale=en`, {
      ...content,
      blocks: blocksInput((await api.get(`${url}?locale=en`)).data.blocks),
      author: { connect: [{ id: author.id }] },
      category: { connect: [{ id: oldCategory.id }] },
    });
    // Version 2: the draft gets the new category, so it is modified.
    const { data: draft } = await api.get(`${url}?locale=en`);
    await api.put(`${url}?locale=en`, {
      ...content,
      blocks: blocksInput(draft.blocks),
      author: { connect: [{ id: author.id }] },
      category: { disconnect: [{ id: oldCategory.id }], connect: [{ id: newCategory.id }] },
    });
    // Version 3: published again, the current version.
    const { data: modified } = await api.get(`${url}?locale=en`);
    await api.post(`${url}/actions/publish?locale=en`, {
      ...content,
      blocks: blocksInput(modified.blocks),
      author: { connect: [{ id: author.id }] },
      category: { connect: [{ id: newCategory.id }] },
    });

    module.exports.start = `/admin${url}?plugins[i18n][locale]=en`;
  },

  intro: {
    text: 'Welcome to the guided tour of the Content History feature!',
    button: "Let's go 🚀",
  },

  steps: [
    {
      explain: 'role=button[name="More actions"]',
      text: '**Content History** is accessible via this button, which lists several options for the entry.',
    },
    {
      before: [{ click: 'role=button[name="More actions"]' }],
      click: 'role=menuitem[name="Content History"]',
      text: 'Click on *Content History*.',
    },
    {
      chapter: true,
      text: 'This is the Content History interface! It shows the state of your content type at a chosen time.',
    },
    {
      explain: VERSIONS,
      text: 'This is where you can see current and past versions of your content type. For each version, you can see:\n• the date and time,\n• the name of the user who edited the version,\n• and the status (if **Draft & Publish** is enabled).',
    },
    {
      click: `${VERSIONS} li:nth-child(3) a`,
      text: "Let's click on a previous version!",
    },
    {
      explain: 'main div:has(> div > label:text-is("category"))',
      text: 'In this previous version, the category was "news" but it was later changed to "nature".',
    },
    {
      click: 'role=button[name="Restore"]',
      text: 'If we want the content type to go back to that previous version, we can click on the **Restore** button.',
    },
    {
      click: 'role=alertdialog >> role=button[name="Restore"]',
      text: 'Restoring a previous version of the content type means overriding the "current" one, but as a draft that can be later published.\n\nLet\'s confirm by clicking on **Restore** again!',
    },
    {
      chapter: true,
      text: "And that's it! We've used Content History to restore a previous version ✨",
    },
  ],

  outro: {
    text: 'Thank you for following this guided tour!',
    links: [
      { label: 'Content History docs 📖', href: '/cms/features/content-history' },
      { label: '🚀 Quick Start Guide', href: '/cms/quick-start' },
    ],
  },
};
