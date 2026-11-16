// Setup for the releases demo (scenario.yaml in this folder): brings the demo app back to the state it starts from.

const fs = require('fs');
const path = require('path');
const ARTICLE = 'api::article.article';
const RELEASE = 'Spring 2027 Release';

// Articles the tour adds to the release from the list view, then publishes with it.
const BULK_ARTICLES = ['Beautiful picture', "The internet's Own boy"];

// The second one is not ready: setup gives it a slug a published entry cannot have.
const NOT_READY_ARTICLE = BULK_ARTICLES[1];
const INVALID_SLUG = "the internet's own boy";

// Strapi refuses to delete a release once published, and the releases list shows every release:
// remove the releases a previous capture published straight from the demo app's SQLite database.
function deletePublishedReleases() {
  const appDir = process.env.DEMO_STRAPI_DIR;
  const file = appDir && path.join(appDir.replace(/^~(?=\/)/, process.env.HOME), '.tmp/data.db');
  if (!file || !fs.existsSync(file)) {
    console.warn('DEMO_STRAPI_DIR not set or not a SQLite app: releases published by a previous capture stay in the list.');
    return;
  }
  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync(file);
  const ids = db
    .prepare('SELECT id FROM strapi_releases WHERE name LIKE ? AND released_at IS NOT NULL')
    .all(`${RELEASE}%`)
    .map((row) => row.id);
  if (ids.length) {
    const list = ids.join(',');
    db.exec('BEGIN');
    db.exec(`DELETE FROM strapi_release_actions WHERE id IN (SELECT release_action_id FROM strapi_release_actions_release_lnk WHERE release_id IN (${list}))`);
    db.exec(`DELETE FROM strapi_release_actions_release_lnk WHERE release_id IN (${list})`);
    db.exec(`DELETE FROM strapi_releases WHERE id IN (${list})`);
    db.exec('COMMIT');
  }
  db.close();
}

module.exports = async function setup({ api }) {
  // Releases created by a previous capture: pending ones through the API, published ones from the database.
  const { data: releases } = await api.get('/content-releases?page=1&pageSize=100');
  for (const release of releases) {
    if (release.name.startsWith(RELEASE) && !release.releasedAt) await api.del(`/content-releases/${release.id}`);
  }
  deletePublishedReleases();

  const { results } = await api.get(`/content-manager/collection-types/${ARTICLE}?pageSize=100&locale=en`);
  for (const entry of results.filter((item) => BULK_ARTICLES.includes(item.title))) {
    // Publishing the release published this article: put it back to draft only.
    if (entry.status !== 'draft') {
      await api.post(`/content-manager/collection-types/${ARTICLE}/${entry.documentId}/actions/unpublish?locale=en`, {});
    }
    // A draft accepts this slug, publication does not: the article is not ready.
    if (entry.title === NOT_READY_ARTICLE) {
      await api.put(`/content-manager/collection-types/${ARTICLE}/${entry.documentId}?locale=en`, { slug: INVALID_SLUG });
    }
  }
};
