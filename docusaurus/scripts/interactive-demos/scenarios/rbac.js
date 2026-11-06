// Role-Based Access Control (RBAC) tour, step for step the Guideflow tour it replaces.
// Runs against the demo app from setup-demo-app.js (Community Edition: no SSO toggle
// in the invite form, see step 27).

const ARTICLE = 'api::article.article';
const AUTHOR = 'api::author.author';
const EXPLORER = 'plugin::content-manager.explorer';
const PANEL = '[role=tabpanel][data-state=active]';
const DIALOG = '[role=dialog]';
const USER = { firstname: 'Camille', lastname: 'Doe', email: 'camille.doe@example.com' };

// Fields of the example app content types, as the role permissions list them.
const FIELDS = {
  [ARTICLE]: ['title', 'description', 'slug', 'cover', 'author', 'category', 'blocks'],
  [AUTHOR]: ['name', 'avatar', 'email', 'articles'],
};

module.exports = {
  title: 'Role-Based Access Control (RBAC)',
  viewport: { width: 1280, height: 800 },
  start: '/admin/settings/roles',

  // Brings the app back to the same state before every capture.
  async setup({ api }) {
    // The user invited by a previous capture.
    const { data: users } = await api.get('/admin/users?pageSize=100');
    const invited = users.results.filter((user) => user.email === USER.email).map((user) => user.id);
    if (invited.length) await api.post('/admin/users/batch-delete', { ids: invited });

    // The Editor role gets full access to Article (all fields and locales) and Author again,
    // as the tour removes some of it and saves.
    const { data: roles } = await api.get('/admin/roles');
    const editor = roles.find((role) => role.code === 'strapi-editor');
    const { data: current } = await api.get(`/admin/roles/${editor.id}/permissions`);
    const locales = (await api.get('/i18n/locales')).map((locale) => locale.code);
    const kept = current
      .filter((permission) => !(permission.action.startsWith(`${EXPLORER}.`) && FIELDS[permission.subject]))
      .map(({ action, subject, properties, conditions }) => ({ action, subject, properties, conditions }));
    const restored = [];
    for (const subject of [ARTICLE, AUTHOR]) {
      const localized = subject === ARTICLE;
      for (const verb of ['create', 'read', 'update', 'delete', 'publish']) {
        const properties = {};
        if (['create', 'read', 'update'].includes(verb)) properties.fields = FIELDS[subject];
        if (localized) properties.locales = locales;
        restored.push({ action: `${EXPLORER}.${verb}`, subject, properties, conditions: [] });
      }
    }
    await api.put(`/admin/roles/${editor.id}/permissions`, { permissions: [...kept, ...restored] });
  },

  intro: {
    text: 'Welcome to the guided tour of the Role-Based Access Control (RBAC) feature!',
    button: "Let's go 🚀",
  },

  steps: [
    // Roles
    {
      explain: ['a[href="/admin/settings/roles"]', 'a[href^="/admin/settings/users?"]'],
      text: 'The RBAC feature is managed from the **Roles and Users sections of Settings**, accessible from the navigation of the admin panel.',
    },
    {
      explain: 'main [role=grid]',
      text: 'Roles is where are listed the various roles that the users of the admin panel can have.\n\nThere are **3 default roles**: Author, Editor and Super Admin.',
    },
    {
      explain: 'main >> role=button[name="Add new role"]',
      text: 'You can also **create your own new role**.',
    },
    {
      explain: [
        'role=row[name=/^Editor/] >> role=button[name="Duplicate"]',
        'role=row[name=/^Editor/] >> role=button[name="Delete"]',
      ],
      text: 'For each role, you can use these buttons to:\n• **Duplicate** the role\n• ✏️ **Edit** the role\n• 🗑️ **Delete** the role',
    },
    {
      click: 'role=row[name=/^Editor/] >> role=button[name="Edit"]',
      text: "Let's edit the Editor role!",
    },

    // Edit a role
    {
      explain: ['main >> role=textbox[name="Name"]', 'main >> role=textbox[name="Description"]', 'main >> role=button[name=/users with this role/]'],
      padding: 24,
      text: 'In this area, you can **edit the name and description** of the role.\n\n✏️ Note that you can also see how many users have been assigned this role.',
    },
    {
      explain: ['role=tablist[name="Tabs Permissions"]', PANEL],
      text: 'And in this area, you can **select in detail what the users with this role can do**.\n\nDetailed access can be set for the content types but also for the plugins and settings of the project!',
    },
    {
      explain: ['role=tablist[name="Tabs Permissions"]', PANEL],
      text: "In this demo, we will focus on the Editor role's accesses with collection types.",
    },
    {
      click: 'role=checkbox[name="Select all Author permissions"]',
      text: "Let's untick the Author collection type!",
    },
    {
      explain: ['role=checkbox[name="Select all Author permissions"]', 'role=checkbox[name="Select Publish author permission"]'],
      text: 'All other boxes have been unticked: Editors cannot access the Author content type at all.',
    },
    {
      click: `${PANEL} >> role=button[name="Article"]`,
      text: "Now let's click on the arrow next to the Article content type to see more detailed options.",
    },
    {
      // Centers the expanded Article block in the view.
      before: [{ hover: 'role=checkbox[name="Select cover Read permission"]' }],
      explain: [
        'role=checkbox[name="Select all Article permissions"]',
        `${PANEL} button:has-text("Settings")`,
        'role=checkbox[name="Select blocks Update permission"]',
      ],
      text: 'Accesses can be set for each specific field: we can decide whether Editors can create, read or update them.',
    },
    {
      click: 'role=checkbox[name="Select Delete article permission"]',
      text: "Let's decide that Editors cannot delete articles.",
    },
    {
      click: 'role=checkbox[name="Select all slug permissions"]',
      text: 'And that they cannot access the "slug" field at all.',
    },
    {
      click: `${PANEL} button:has-text("Settings")`,
      text: 'More RBAC settings are also available by clicking on this button.',
    },
    {
      // Can Update When
      click: `${DIALOG} >> role=combobox >> nth=2`,
      text: 'For each content type, you can **decide specific conditions under which the Editor can act**.',
    },
    {
      before: [{ press: 'Escape' }],
      click: `${DIALOG} >> role=button[name="Close modal"]`,
      text: "Let's go back to the basic RBAC settings!",
    },
    {
      click: 'main >> role=button[name="Save"]',
      text: 'Make sure to click *Save* for the settings to be confirmed.',
    },

    // Users
    {
      click: 'a[href^="/admin/settings/users?"]',
      text: "Now let's explore the Users sections!",
    },
    {
      chapter: true,
      text: 'Users is where are listed the users of the admin panel.',
    },
    {
      explain: 'role=row[name=/Kai Doe/] >> role=link[name="Edit Kai Doe"]',
      padding: 12,
      text: 'For every user listed, it is possible to:\n• ✏️ **Edit** the user\n• 🗑️ **Delete** the user (except yourself)',
    },
    {
      explain: 'main >> role=button[name="Invite new user"]',
      text: 'The *Invite new user* button is to manually **add new users to the admin panel**.',
    },
    {
      click: 'main >> role=button[name="Invite new user"]',
      text: "Let's click on the button!",
    },
    {
      fill: 'input[name=firstname]',
      value: USER.firstname,
      after: [{ fill: 'input[name=lastname]', value: USER.lastname }],
      text: "Let's write the details of the new user: first name and last name.",
    },
    {
      fill: 'input[name=email]',
      value: USER.email,
      text: "And let's write their email address.",
    },
    {
      before: [{ click: `${DIALOG} >> role=combobox[name="User's roles"]` }],
      click: 'role=option[name="Editor"]',
      after: [{ press: 'Escape' }],
      text: 'We can already **assign a role to the new user**: for instance, Editor.',
    },
    {
      // The Connect with SSO toggle only exists with the SSO feature: highlight where it sits.
      explain: [`${DIALOG} >> role=heading[name="Roles"]`, `${DIALOG} >> role=combobox[name="User's roles"]`],
      padding: 16,
      text: 'And, with SSO enabled, we can also decide whether or not the user will be able to connect with SSO.',
    },
    {
      click: `${DIALOG} >> role=button[name="Invite user"]`,
      text: "Let's **invite** our new user!",
    },
    {
      // The card that holds the invitation link.
      explain: `${DIALOG} div:has(> div > :text("Copy and share this link"))`,
      text: 'A link is available here to share with the user to directly invite them to the admin panel.',
    },
    {
      click: `${DIALOG} >> role=button[name="Finish"]`,
      text: 'Once the link has been copied to be shared to the user, click on *Finish*.',
    },
    {
      explain: `role=row[name=/${USER.email}/]`,
      text: 'Our new user is now listed in the table.\n\n✏️ Note that for now, their account is inactive but is can be manually activated.',
    },
    {
      chapter: true,
      text: "And that's it! We've learned to use the RBAC feature via the roles & users settings! ✨",
    },
  ],

  outro: {
    text: 'Thank you for following this guided tour!',
    links: [
      { label: 'RBAC documentation 📖', href: '/cms/features/rbac' },
      { label: '🚀 Quick Start Guide', href: '/cms/quick-start' },
    ],
  },
};
