/**
 * Back up the MeiliSearch "strapi-docs" index before any modification
 * (re-scrape, ranking-rule change, category-order run, etc.).
 *
 * Exports two JSON files into an output directory:
 *   - <index>-settings.<timestamp>.json   (ranking rules, searchable/displayed
 *     attributes, synonyms, etc. — the part most easily clobbered by a scrape)
 *   - <index>-documents.<timestamp>.json   (every indexed document, paginated)
 *
 * It uses the native fetch (Node >= 18, already required by this repo) and the
 * same REST pattern as analyze-categories.js, so it needs NO extra dependency.
 *
 * Env vars (admin/master key needed to read settings + all documents):
 *   MEILISEARCH_HOST         e.g. https://ms-xxxx.fra.meilisearch.io
 *   MEILISEARCH_MASTER_KEY   admin/master key
 *
 * Optional:
 *   MEILISEARCH_INDEX        index UID (default: strapi-docs)
 *   MEILISEARCH_BACKUP_DIR   output dir (default: ./meilisearch-backups)
 *
 * Usage:
 *   cd docusaurus && yarn meilisearch:backup
 *   # or: node -r dotenv/config scripts/meilisearch/backup-index.js
 *
 * Restore (manual, when needed):
 *   settings:  PATCH <host>/indexes/<index>/settings   with the settings JSON
 *   documents: POST  <host>/indexes/<index>/documents  with the documents array
 */

const fs = require('fs');
const path = require('path');

const HOST = process.env.MEILISEARCH_HOST;
const KEY = process.env.MEILISEARCH_MASTER_KEY;
const INDEX = process.env.MEILISEARCH_INDEX || 'strapi-docs';
const OUT_DIR = process.env.MEILISEARCH_BACKUP_DIR || path.join(process.cwd(), 'meilisearch-backups');
const PAGE = 1000;

function fail(msg) {
  console.error(`Error: ${msg}`);
  process.exit(1);
}

async function api(pathname) {
  const res = await fetch(`${HOST}${pathname}`, {
    headers: { Authorization: `Bearer ${KEY}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${pathname} -> HTTP ${res.status} ${res.statusText} ${body.slice(0, 200)}`);
  }
  return res.json();
}

async function backup() {
  if (!HOST || !KEY) {
    fail('Missing env vars. Set MEILISEARCH_HOST and MEILISEARCH_MASTER_KEY.');
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  // Build a filesystem-safe timestamp from the current time. (Computed at run
  // time on purpose: this is a CLI script, not a workflow-cached step.)
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');

  console.log(`Backing up index "${INDEX}" from ${HOST}`);

  // 1. Settings
  console.log('Fetching settings...');
  const settings = await api(`/indexes/${INDEX}/settings`);
  const settingsFile = path.join(OUT_DIR, `${INDEX}-settings.${stamp}.json`);
  fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
  console.log(`  -> ${settingsFile}`);

  // 2. Documents (paginated)
  console.log('Fetching documents...');
  const docs = [];
  let offset = 0;
  for (;;) {
    const page = await api(`/indexes/${INDEX}/documents?limit=${PAGE}&offset=${offset}`);
    const batch = page.results || [];
    docs.push(...batch);
    if (batch.length < PAGE) break;
    offset += PAGE;
    console.log(`  ...${docs.length} documents so far`);
  }
  const docsFile = path.join(OUT_DIR, `${INDEX}-documents.${stamp}.json`);
  fs.writeFileSync(docsFile, JSON.stringify(docs, null, 2));
  console.log(`  -> ${docsFile} (${docs.length} documents)`);

  console.log('\nBackup complete.');
  console.log('Restore settings : PATCH ' + `${HOST}/indexes/${INDEX}/settings` + ' with the settings JSON');
  console.log('Restore documents: POST  ' + `${HOST}/indexes/${INDEX}/documents` + ' with the documents array');
}

backup().catch((e) => fail(e.message));
