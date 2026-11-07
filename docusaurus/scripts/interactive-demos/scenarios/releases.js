// Releases tour, step for step the Guideflow tour it replaces.
// Runs against the demo app from setup-demo-app.js. Releases is an Enterprise feature:
// start the app with a license (STRAPI_LICENSE) or the Releases pages do not exist.

const ARTICLE = 'api::article.article';
const RELEASE = 'Spring 2027 Release';
// A date in the future: a release cannot be scheduled in the past.
const RELEASE_DATE = '05/28/2027';
const RELEASE_TIME = '16:00';
// Articles the tour adds to the release from the list view, then publishes with it.
const BULK_ARTICLES = ['Beautiful picture', "The internet's Own boy"];
const EDIT_ARTICLE = "What's inside a Black Hole";

const MAIN_NAV = 'nav';
const CM_NAV = 'nav[aria-label="Content Manager"]';
const DIALOG = '[role=dialog]';
const MENU = '[role=menu]';
// The button that opened the menu: an open menu hides the rest of the page from role selectors.
const MENU_BUTTON = 'button[aria-haspopup=menu][aria-expanded=true]';
const RELEASES_PANEL = 'aside:has(h2:text-is("Releases"))';
const ENTRY_PANEL = 'aside:has(h2:text-is("Entry"))';

module.exports = {
  title: 'Releases',
  viewport: { width: 1280, height: 800 },
  start: '/admin/plugins/content-releases',

  // Brings the app back to the same state before every capture.
  async setup({ api }) {
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
      explain: ['role=tablist[name="Releases list"]', 'role=tabpanel'],
      text: 'All created releases will be displayed in this area, first in the **Pending tab** then in the **Done tab** once they happened.',
    },
    {
      click: 'role=button[name="New Release"]',
      text: "Let's click the *New Release* button to **create a new release**!",
    },
    {
      fill: `${DIALOG} >> role=textbox[name="Name"]`,
      value: RELEASE,
      text: "Let's give a name to our release.",
    },
    {
      click: 'role=checkbox[name="Schedule release"]',
      // Clicking unticks the box: tick it again so the release stays scheduled.
      after: [{ click: 'role=checkbox[name="Schedule release"]' }],
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
      click: `${DIALOG} >> role=button[name="Continue"]`,
      text: 'Click on *Continue*.',
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
      text: 'Our articles have properly been added to the release!',
    },
    {
      click: 'role=button[name="Ready to publish"]',
      text: "Each has a **status** indicating whether or not they're ready to be published.",
    },
    {
      explain: ['role=button[name="Ready to publish"]', '[data-radix-popper-content-wrapper]'],
      text: 'Clicking on the arrow next to the status will display more details.',
    },
    {
      before: [{ press: 'Escape' }, { click: 'main [role=grid] >> role=button[name="Release action options"]' }],
      explain: [MENU_BUTTON, MENU],
      text: 'And for each article, you can click on ... to access a link to **edit the article** and a button to remove it from the release.',
    },
    {
      before: [{ press: 'Escape' }],
      click: 'main >> role=button[name="Publish"]',
      // The page shows the Done status only once the publication is over.
      after: [{ waitFor: 'main >> text=This entry was' }],
      text: "Since we're all good with our articles, let's try publishing the release!",
    },
    {
      chapter: true,
      text: 'We can now see that the release\'s status is "Done" and that for both articles the table confirms that they were published!',
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
