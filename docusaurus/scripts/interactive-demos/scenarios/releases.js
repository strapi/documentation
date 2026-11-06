// Releases tour: the Guideflow tour it replaces, plus a partial release (Release all ready items).
// Runs against the demo app from setup-demo-app.js. Releases is an Enterprise feature:
// start the app with a license (STRAPI_LICENSE) or the Releases pages do not exist.
// Partial releases need a Strapi version that includes strapi/strapi#28339. While that PR
// requires it, also enable the next design system in the app's config/features.js:
//   module.exports = { future: { unstableNextDesignSystem: true } };
// Set DEMO_STRAPI_DIR so setup can remove the releases a previous capture published.

const fs = require('fs');
const path = require('path');

const ARTICLE = 'api::article.article';
const RELEASE = 'Spring 2027 Release';
// A date in the future: a release cannot be scheduled in the past.
const RELEASE_DATE = '05/28/2027';
const RELEASE_TIME = '16:00';
// Articles the tour adds to the release from the list view, then publishes with it.
const BULK_ARTICLES = ['Beautiful picture', "The internet's Own boy"];
// The second one is not ready: setup gives it a slug a published entry cannot have.
const NOT_READY_ARTICLE = BULK_ARTICLES[1];
const INVALID_SLUG = "the internet's own boy";
const EDIT_ARTICLE = "What's inside a Black Hole";

const MAIN_NAV = 'nav';
const CM_NAV = 'nav[aria-label="Content Manager"]';
const DIALOG = '[role=dialog]';
const MENU = '[role=menu]';
// The button that opened the menu: an open menu hides the rest of the page from role selectors.
const MENU_BUTTON = 'button[aria-haspopup=menu][aria-expanded=true]';
const RELEASES_PANEL = 'aside:has(h2:text-is("Releases"))';
const ENTRY_PANEL = 'aside:has(h2:text-is("Entry"))';
const RELEASE_HEADER = 'main h1';
const STATUS_BADGE = 'main h1 + *';
const READY_ROW = `main [role=grid] >> role=row[name*="${BULK_ARTICLES[0]}"]`;
const NOT_READY_ROW = `main [role=grid] >> role=row[name*="${NOT_READY_ARTICLE}"]`;

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

module.exports = {
  title: 'Releases',
  viewport: { width: 1280, height: 800 },
  start: '/admin/plugins/content-releases',

  // Brings the app back to the same state before every capture.
  async setup({ api }) {
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
  },

  intro: {
    text: 'Welcome to the guided tour of the Releases feature!',
    button: "Let's go 🚀",
  },

  steps: [
    // Releases page
    {
      explain: `${MAIN_NAV} >> role=link[name="Releases"]`,
      text: 'The Releases feature is directly accessible from the **navigation of the admin panel**.',
    },
    {
      explain: 'main [role=grid]',
      text: 'All created releases will be displayed in this table, with their status, schedule, entries and release mode.',
    },
    {
      click: 'role=button[name="New Release"]',
      text: "Let's click the *New Release* button to **create a new release**!",
    },
    {
      fill: `${DIALOG} >> role=textbox[name="Release name"]`,
      value: RELEASE,
      text: "Let's give a name to our release.",
    },
    {
      click: `${DIALOG} >> role=checkbox[name="I don't have a release date yet"]`,
      // Clicking ticks the box: untick it again so the release stays scheduled.
      after: [{ click: `${DIALOG} >> role=checkbox[name="I don't have a release date yet"]` }],
      text: 'Here you can decide whether the release is scheduled or not.',
    },
    {
      click: 'role=combobox[name="Date"]',
      after: [{ fill: 'role=combobox[name="Date"]', value: RELEASE_DATE }, { press: 'Enter' }],
      text: "Since it is a **scheduled release**, let's choose a release date.",
    },
    {
      click: 'role=combobox[name="Time"]',
      after: [{ click: `role=option[name="${RELEASE_TIME}"]` }],
      text: "And let's define a release time.",
    },
    {
      explain: `${DIALOG} >> role=radiogroup[name="Release mode"]`,
      text: 'The **release mode** defines what happens if some entries are not ready when the release is published.',
    },
    {
      click: `${DIALOG} >> role=radio[name="Release all ready items"]`,
      text: "Let's choose *Release all ready items*: entries that are ready will be published, and the others **skipped**.",
    },
    {
      click: `${DIALOG} >> role=button[name="Create release"]`,
      text: 'Click on *Create release*.',
    },

    // Release details
    {
      chapter: true,
      text: "Our release has been created!\n\nLet's explore the available options!",
    },
    {
      before: [{ click: 'role=button[name="Release edit and delete menu"]' }],
      explain: [MENU_BUTTON, MENU],
      text: 'By clicking on the ... button, you can access the *Edit* and *Delete* buttons.',
    },
    {
      before: [{ press: 'Escape' }],
      explain: 'role=button[name="Refresh"]',
      text: 'The *Refresh* button allows you to reload the page, for instance to make sure all content types related to the release are well displayed with their current status.',
    },
    {
      explain: 'main >> role=button[name="Publish"]',
      text: 'And finally the *Publish* button allows you to **manually publish the release**.',
    },

    // Edit view
    {
      click: `${MAIN_NAV} >> role=link[name="Content Manager"]`,
      // The Content Manager opens on its first single type: go on to the Article list.
      after: [{ click: `${CM_NAV} a:has-text("Article")` }],
      text: "Now let's move to the Content Manager to **add content types to the newly created release**!",
    },
    {
      click: `role=gridcell[name="${EDIT_ARTICLE}"]`,
      text: "Let's go to the **edit view** of this article!",
    },
    {
      before: [{ click: 'role=button[name="More document actions"]' }],
      explain: [ENTRY_PANEL, MENU],
      text: 'In the Entry area, click the ... button to access the *Add to release* button.',
    },
    {
      before: [
        { click: 'role=menuitem[name="Add to release"]' },
        { click: `${DIALOG} >> role=combobox[name="Select a release"]` },
      ],
      click: `role=option[name="${RELEASE}"]`,
      text: 'In the dialog, select the release the article should be added to!',
    },
    {
      click: `${DIALOG} >> role=button[name="Continue"]`,
      text: 'Click the *Continue* button!',
    },
    {
      explain: RELEASES_PANEL,
      text: 'A Release area is now displayed in the edit view to show information related to the release.',
    },
    {
      before: [{ click: `${RELEASES_PANEL} >> role=button[name="Release action options"]` }],
      explain: [MENU_BUTTON, MENU],
      text: "✏️ Note that clicking on the ... button will give you access to a link to **edit the release**, and another to **remove the article from the release**.\n\nLet's try using it!",
    },
    { do: [{ click: 'role=menuitem[name="Remove from release"]' }] },

    // List view
    {
      click: `${CM_NAV} a:has-text("Article")`,
      text: "Now let's go back to the **list view** to try another way to add articles in our release!",
    },
    {
      click: `role=row[name*="${BULK_ARTICLES[0]}"] >> role=checkbox`,
      text: "Let's tick some boxes to select several articles!",
    },
    {
      click: `role=row[name*="${BULK_ARTICLES[1]}"] >> role=checkbox`,
      text: 'Another one!',
    },
    {
      explain: 'role=button[name="Add to Release"]',
      text: 'Via the list view, you can **add to a release several articles at the same time**! Let\'s click the button!',
    },
    {
      before: [
        { click: 'role=button[name="Add to Release"]' },
        { click: `${DIALOG} >> role=combobox[name="Select a release"]` },
      ],
      click: `role=option[name="${RELEASE}"]`,
      text: "Exactly as we did previously via the edit view: let's select a release.",
    },
    {
      click: `${DIALOG} >> role=button[name="Continue"]`,
      text: 'And click on *Continue*.',
    },

    // Back to the release
    {
      click: `${MAIN_NAV} >> role=link[name="Releases"]`,
      text: "Let's go back to Releases via the admin panel navigation!",
    },
    {
      click: `role=link[name*="${RELEASE}"]`,
      text: 'Click on the release.',
    },
    {
      explain: 'main [role=grid]',
      text: 'Our articles have properly been added to the release!\n\nHovering an article displays buttons to **open the article** and to **remove it from the release**.',
    },
    {
      explain: [`${READY_ROW} >> role=gridcell >> nth=4`, `${NOT_READY_ROW} >> role=gridcell >> nth=4`],
      text: "Each has a **status** indicating whether or not they're ready to be published.",
    },
    {
      click: `role=button[name="Why ${NOT_READY_ARTICLE} isn’t ready"]`,
      text: 'Clicking on the reason next to a *Not ready* status will display more details.',
    },
    {
      explain: DIALOG,
      text: "The side panel lists what prevents the entry from being published: here, the slug of the article doesn't match the expected format. *Go to entry* opens the article to fix it.",
    },
    {
      before: [{ press: 'Escape' }],
      explain: ['main [role=tab] >> nth=0', 'main [role=tab] >> nth=2'],
      text: 'The *Ready* and *Not ready* tabs filter the entries by status.',
    },
    {
      explain: [RELEASE_HEADER, STATUS_BADGE],
      text: 'Since the release mode is *Release all ready items*, the release is **Ready** even though one article is not: this article will be skipped.',
    },
    {
      click: 'main >> role=button[name="Publish"]',
      // The page shows the result only once the publication is over.
      after: [{ waitFor: 'main >> text=Released on' }],
      text: "Let's try publishing the release!",
    },
    {
      explain: [RELEASE_HEADER, STATUS_BADGE, 'main span:has-text("Released on")'],
      text: 'The release\'s status is now **Partial**: 1 of the 2 articles was published, and the other one was skipped.',
    },
    {
      explain: [`${READY_ROW} >> role=gridcell >> nth=4`, `${NOT_READY_ROW} >> role=gridcell >> nth=4`],
      text: 'The table confirms which article was published and which one was **skipped**, and why.',
    },
    {
      explain: 'role=button[name="Create release from skipped entries"]',
      text: 'Once the skipped article is fixed, *Create release from skipped* creates a new release with the skipped entries, to publish them later.',
    },
    {
      chapter: true,
      text: "And that's it! We've learned to use the Releases feature from its creating to publishing! ✨",
    },
  ],

  outro: {
    text: 'Thank you for following this guided tour!',
    links: [
      { label: 'Releases documentation 📖', href: '/cms/features/releases' },
      { label: '🚀 Quick Start Guide', href: '/cms/quick-start' },
    ],
  },
};
