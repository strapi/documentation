// Setup for the content-manager scenario (content-manager.yaml): brings the demo app back to the state it starts from.

const ARTICLE = 'api::article.article';
const TITLE_EN = 'How I wrote my first article with Strapi';
const TITLE_FR = "Comment j'ai créé mon premier article avec Strapi";

module.exports = async function setup({ api }) {
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
};
