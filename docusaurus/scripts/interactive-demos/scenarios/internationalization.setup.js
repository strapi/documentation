// Setup for the internationalization scenario (internationalization.yaml): brings the demo app back to the state it starts from.

const ARTICLE = 'api::article.article';

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
};
