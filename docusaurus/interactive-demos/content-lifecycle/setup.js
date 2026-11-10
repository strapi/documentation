// Setup for the content-lifecycle demo (scenario.yaml in this folder): brings the demo app back to the state it starts from.

const ARTICLE = 'api::article.article';
const TITLES = ['Black holes, explained', 'Les trous noirs, expliqués'];
const RELEASE = 'Space Week';

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

module.exports = async function setup({ api }) {
  // The tour translates the article: Article must be localized. The internationalization
  // demo turns localization off, so turn it back on when it is off.
  const { data } = await api.get(`/content-type-builder/content-types/${ARTICLE}`);
  const { schema } = data;
  if (!schema.pluginOptions?.i18n?.localized) {
    const { visible, restrictRelationsTo, ...contentType } = schema;
    const attributes = {};
    for (const [name, attribute] of Object.entries(schema.attributes)) {
      const { inversedBy, mappedBy, ...rest } = attribute;
      attributes[name] = { ...rest, pluginOptions: { ...rest.pluginOptions, i18n: { localized: true } } };
    }
    await api.put(`/content-type-builder/content-types/${ARTICLE}`, {
      contentType: { ...contentType, pluginOptions: { ...schema.pluginOptions, i18n: { localized: true } }, attributes },
      components: [],
    });
    await waitForRestart(api);
  }

  // English and French only (the internationalization tour adds German).
  const locales = await api.get('/i18n/locales');
  for (const locale of locales.filter((item) => !['en', 'fr'].includes(item.code))) {
    await api.del(`/i18n/locales/${locale.id}`);
  }
  if (!locales.some((locale) => locale.code === 'fr')) {
    await api.post('/i18n/locales', { name: 'French (fr)', code: 'fr', isDefault: false });
  }

  // The release created by a previous capture. The tour never publishes it, so it can be deleted.
  const { data: releases } = await api.get('/content-releases?page=1&pageSize=100');
  for (const release of releases) {
    if (release.name === RELEASE && !release.releasedAt) await api.del(`/content-releases/${release.id}`);
  }

  // The blog post created by a previous capture, in both locales.
  for (const locale of ['fr', 'en']) {
    const { results } = await api.get(`/content-manager/collection-types/${ARTICLE}?pageSize=100&locale=${locale}`);
    for (const entry of results.filter((item) => TITLES.includes(item.title))) {
      await api.del(`/content-manager/collection-types/${ARTICLE}/${entry.documentId}?locale=${locale}`);
    }
  }

  // The list view columns, which other demos change.
  const { data: configuration } = await api.get(`/content-manager/content-types/${ARTICLE}/configuration`);
  const { layouts, metadatas, settings } = configuration.contentType;
  // GET returns a computed `list.mainField` that PUT rejects.
  for (const field of Object.values(metadatas)) delete field.list?.mainField;
  await api.put(`/content-manager/content-types/${ARTICLE}/configuration`, {
    layouts: { ...layouts, list: ['id', 'title', 'description', 'category'] },
    metadatas,
    settings,
  });
};
