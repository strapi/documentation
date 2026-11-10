// Setup for the draft-and-publish scenario (draft-and-publish.yaml): brings the demo app back to the state it starts from.

const ARTICLE = 'api::article.article';

// Entries the Content Manager tour creates, removed so the list shows the 5 example articles.
const CM_TOUR_TITLES = ['How I wrote my first article with Strapi', "Comment j'ai créé mon premier article avec Strapi"];

module.exports = async function setup({ api }) {
  for (const locale of ['fr', 'en']) {
    const { results } = await api.get(`/content-manager/collection-types/${ARTICLE}?pageSize=100&locale=${locale}`);
    for (const entry of results) {
      if (CM_TOUR_TITLES.includes(entry.title)) {
        await api.del(`/content-manager/collection-types/${ARTICLE}/${entry.documentId}?locale=${locale}`);
      } else if (entry.status !== 'draft') {
        // The tour publishes articles: every article starts as a draft.
        await api.post(`/content-manager/collection-types/${ARTICLE}/${entry.documentId}/actions/unpublish?locale=${locale}`, {});
      }
    }
  }

  // The same columns as in Guideflow, so that the Status column fits in the viewport.
  const { data } = await api.get(`/content-manager/content-types/${ARTICLE}/configuration`);
  const { layouts, metadatas, settings } = data.contentType;
  // GET returns a computed `list.mainField` that PUT rejects.
  for (const field of Object.values(metadatas)) delete field.list?.mainField;
  await api.put(`/content-manager/content-types/${ARTICLE}/configuration`, {
    layouts: { ...layouts, list: ['id', 'title', 'description'] },
    metadatas,
    settings,
  });
};
