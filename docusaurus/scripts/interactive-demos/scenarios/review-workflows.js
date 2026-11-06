// Review Workflows tour, step for step the Guideflow tour it replaces.
// Runs against the demo app from setup-demo-app.js, started with an Enterprise license
// (STRAPI_LICENSE): Review Workflows is not available without it.

const ARTICLE = 'api::article.article';
const CM_NAV = 'nav[aria-label="Content Manager"]';
const RW_PANEL = 'aside:has(h2:text-is("Review Workflows"))';
const ROLES_FROM = 'role=combobox[name="Roles that can change from this stage"]';
// Column order once setup has set the list view: select, id, title, to be released in,
// review stage, assignee, available in, status. With the description column too, the
// Review Workflows columns would be scrolled out of the 1280 px wide table.
const STAGE_CELL = 'role=gridcell >> nth=4';
const ASSIGNEE_CELL = 'role=gridcell >> nth=5';
// Entries the Content Manager tour may leave behind in a shared demo app.
const EXTRA_TITLES = ['How I wrote my first article with Strapi', "Comment j'ai créé mon premier article avec Strapi"];
const DEFAULT_STAGES = [
  { name: 'To do', color: '#4945FF' },
  { name: 'Ready to review', color: '#9736E8' },
  { name: 'In progress', color: '#EE5E52' },
  { name: 'Reviewed', color: '#328048' },
];

const stageRoles = (stage, role) => [
  { click: `role=button[name="${stage}"]` },
  { click: `role=region[name="${stage}"] >> ${ROLES_FROM}` },
  { click: `role=option[name="${role}"]` },
  { press: 'Escape' },
];

module.exports = {
  title: 'Review Workflows',
  viewport: { width: 1280, height: 800 },
  start: '/admin/settings/review-workflows',

  // Brings the app back to the same state before every capture: only the Default
  // workflow, with its 4 stages, no role restriction, no required stage and no
  // content type, and no assignee on any article.
  async setup({ api }) {
    const { data: workflows } = await api.get('/review-workflows/workflows?populate=stages');
    for (const workflow of workflows.filter((item) => item.name !== 'Default')) {
      await api.del(`/review-workflows/workflows/${workflow.id}`);
    }
    let workflow = workflows.find((item) => item.name === 'Default');
    if (!workflow) {
      ({ data: workflow } = await api.post('/review-workflows/workflows', { data: { name: 'Default', stages: DEFAULT_STAGES } }));
    }

    // Assignees can only be changed while Article uses a workflow.
    if (!workflow.contentTypes.includes(ARTICLE)) {
      await api.put(`/review-workflows/workflows/${workflow.id}`, { data: { contentTypes: [ARTICLE] } });
    }
    for (const locale of ['en', 'fr']) {
      const { results } = await api.get(`/content-manager/collection-types/${ARTICLE}?pageSize=100&locale=${locale}`);
      for (const entry of results) {
        if (EXTRA_TITLES.includes(entry.title)) {
          await api.del(`/content-manager/collection-types/${ARTICLE}/${entry.documentId}?locale=${locale}`);
        } else if (entry.strapi_assignee) {
          await api.put(`/review-workflows/content-manager/collection-types/${ARTICLE}/${entry.documentId}/assignee?locale=${locale}`, { data: { id: null } });
        }
      }
    }

    // Unassigning Article also drops the stage of every entry: they all start at "To do" again.
    const stages = DEFAULT_STAGES.map((stage) => ({
      ...stage,
      id: workflow.stages.find((existing) => existing.name === stage.name)?.id,
      fromPermissions: [],
      toPermissions: [],
    }));
    await api.put(`/review-workflows/workflows/${workflow.id}`, {
      data: { name: 'Default', stages, contentTypes: [], stageRequiredToPublishName: null },
    });

    const { data } = await api.get(`/content-manager/content-types/${ARTICLE}/configuration`);
    const { layouts, metadatas, settings } = data.contentType;
    // GET returns a computed `list.mainField` that PUT rejects.
    for (const field of Object.values(metadatas)) delete field.list?.mainField;
    await api.put(`/content-manager/content-types/${ARTICLE}/configuration`, {
      layouts: { ...layouts, list: ['id', 'title'] },
      metadatas,
      settings,
    });
  },

  intro: {
    text: 'Welcome to the guided tour of the Review Workflows feature!',
    button: "Let's go 🚀",
  },

  steps: [
    // Settings
    {
      explain: ['nav[aria-label="Settings"] h2', 'nav[aria-label="Settings"] a:has-text("Webhooks")'],
      text: 'The Review Workflows feature must first be configured via the **Settings section of the admin panel**.',
    },
    {
      explain: 'role=link[name="Create new workflow"]',
      text: 'In the Review Workflows section of Global settings, you can **create a new workflow**.',
    },
    {
      explain: 'main [role=grid]',
      text: 'Or you can **edit the default workflow** already available in your project. This is what we will do in this demo!',
    },
    {
      click: 'role=link[name="Edit Default"]',
      text: "Let's click on the *Edit* button!",
    },
    {
      before: [{ click: 'role=combobox[name="Associated to"]' }],
      click: 'role=option[name="Article"]',
      text: "Let's enable the review workflow for the Article content type.",
    },
    {
      chapter: true,
      text: "Make sure to select all the content type where the review workflow should be enabled, as they're not selected by default!",
    },
    {
      before: [
        { press: 'Escape' },
        { click: 'role=combobox[name="Required stage for publishing"]' },
        // Scrolls the last option into the list.
        { hover: 'role=option[name="Reviewed"]' },
      ],
      click: 'role=option[name="Reviewed"]',
      text: "Now let's define a required stage before an article can be published.",
    },
    {
      click: 'role=button[name="Ready to review"]',
      text: "Other configurations are also available per review stage. Let's discover them!",
    },
    {
      click: `role=region[name="Ready to review"] >> ${ROLES_FROM}`,
      text: 'Other than editing the stage name or colour, we can assign a specific role that can change the stage.',
    },
    {
      click: 'role=option[name="Author"]',
      after: [{ press: 'Escape' }],
      text: 'For instance, let\'s decide that only Authors can change the "Ready to review" stage.',
    },
    {
      before: [...stageRoles('In progress', 'Editor'), ...stageRoles('Reviewed', 'Editor')],
      chapter: true,
      text: 'Each review stage can be similarly configured.\n\nLet\'s do the same with the "In progress" and "Reviewed" stages!',
    },
    {
      before: [{ hover: 'role=button[name="Save"]' }],
      click: 'role=button[name="Save"]',
      text: "Now let's click *Save* to confirm all the changes.",
    },

    // Content Manager
    {
      before: [
        { goto: `/admin/content-manager/collection-types/${ARTICLE}` },
        { waitFor: 'role=gridcell[name="review stage"]' },
      ],
      explain: CM_NAV,
      text: 'Now that our review workflow is fully configured for our Article content type, we can use the feature in the **Content Manager**.',
    },
    {
      explain: ['role=gridcell[name="review stage"]', `role=row >> nth=-1 >> ${STAGE_CELL}`],
      text: 'You can see in the **list view** that there is now a "Review stage" column indicating the stage in which the articles currently are.',
    },
    {
      click: 'role=gridcell[name="This shrimp is awesome"]',
      text: "Let's go to the **edit view** of one of the articles to see how to change the review stage!",
    },
    {
      before: [
        { waitFor: 'role=heading[name="This shrimp is awesome"]' },
        { click: `${RW_PANEL} >> role=combobox[name="Review stage"]` },
      ],
      explain: [RW_PANEL, 'role=listbox'],
      text: 'Available actions related to the Review Workflows feature are displayed in this area.\n\nLet\'s **select another review stage**: for example, "In progress".',
    },
    { do: [{ click: 'role=option[name="In progress"]', wait: 1500 }] },
    {
      click: `${CM_NAV} a:has-text("Article")`,
      text: "There is no need to save.\n\nNow let's go back to the list view!",
    },
    {
      // The list refetches its entries when coming back from the edit view.
      before: [{ waitFor: 'role=row[name*="This shrimp is awesome"] >> text="In progress"' }],
      explain: `role=row[name*="This shrimp is awesome"] >> ${STAGE_CELL}`,
      text: "We can now see from the list view that our article's review is in progress!",
    },
    {
      click: 'role=gridcell[name="Beautiful picture"]',
      text: "Let's go to the edit view of another article!",
    },
    {
      before: [
        { waitFor: 'role=heading[name="Beautiful picture"]' },
        { click: `${RW_PANEL} >> role=combobox[name="Assignee"]` },
      ],
      explain: [RW_PANEL, 'role=listbox'],
      text: "This time, let's **assign a specific user** for the review of this article!",
    },
    { do: [{ click: 'role=option[name="Kai Doe"]', wait: 1500 }] },
    {
      click: `${CM_NAV} a:has-text("Article")`,
      text: "And let's go back again to the list view!",
    },
    {
      before: [{ waitFor: 'role=row[name*="Beautiful picture"] >> text="Kai Doe"' }],
      explain: ['role=gridcell[name="review stage"]', `role=row >> nth=-1 >> ${ASSIGNEE_CELL}`],
      text: 'You can now notice another new column in the list view, "Assignee", which now indicates that Kai Doe has been assigned to the review of the article.',
    },
    {
      chapter: true,
      text: "And that's it! We've learned to configure and use the Review Workflows feature! ✨",
    },
  ],

  outro: {
    text: 'Thank you for following this guided tour!',
    links: [
      { label: 'Review Workflows docs 📖', href: '/cms/features/review-workflows' },
      { label: '🚀 Quick Start Guide', href: '/cms/quick-start' },
    ],
  },
};
