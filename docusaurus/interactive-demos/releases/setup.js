// Setup for the releases demo (scenario.yaml in this folder): brings the demo app back to the state it starts from.

const ARTICLE = 'api::article.article';
const RELEASE = 'Spring 2027 Release';

// Articles the tour adds to the release from the list view, then publishes with it.
const BULK_ARTICLES = ['Beautiful picture', "The internet's Own boy"];

module.exports = async function setup({ api }) {
  // Releases created by a previous capture. Strapi refuses to delete a published release
  // ("Release already published"): those stay in the Done tab, which the tour never opens,
  // and the "Select a release" lists only show pending releases.
  const { data: releases } = await api.get('/content-releases?page=1&pageSize=100');
  for (const release of releases) {
    if (release.name === RELEASE && !release.releasedAt) await api.del(`/content-releases/${release.id}`);
  }

  // Publishing the release published these articles: put them back to draft only.
  const { results } = await api.get(`/content-manager/collection-types/${ARTICLE}?pageSize=100&locale=en`);
  for (const entry of results.filter((item) => BULK_ARTICLES.includes(item.title))) {
    if (entry.status !== 'draft') {
      await api.post(`/content-manager/collection-types/${ARTICLE}/${entry.documentId}/actions/unpublish?locale=en`, {});
    }
  }
};
