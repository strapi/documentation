// Content-type Builder tour, step for step the Guideflow tour it replaces.
// Runs against the demo app from setup-demo-app.js, started with `npm run develop`:
// saving in the Content-type Builder restarts the server, so the steps after a save
// wait for the admin to come back.

const CTB_NAV = 'nav[aria-label="Content-Type Builder"]';
const NEW_UID = 'api::simple-article.simple-article';
const NEW_NAV_ITEM = `div:has(> a[href$="${NEW_UID}"])`;
// Matches once the "Waiting for restart" overlay is gone and nothing is left to save.
const RESTARTED = 'body:not(:has-text("Waiting for restart")) >> role=button[name="Save"][disabled]';

// The admin can reload once more right after the restart, so wait, then check again.
const AFTER_RESTART = [{ waitFor: RESTARTED }, { wait: 2500 }, { waitFor: RESTARTED }];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  title: 'Content-type Builder Overview',
  viewport: { width: 1280, height: 800 },
  start: '/admin/plugins/content-type-builder/content-types/api::category.category',

  // Brings the app back to the same state before every capture: deletes the content-type
  // the tour creates, then waits for the server to restart.
  async setup({ api }) {
    const { data } = await api.get('/content-type-builder/content-types');
    if (!data.some((contentType) => contentType.uid === NEW_UID)) return;
    await api.del(`/content-type-builder/content-types/${NEW_UID}`);
    for (let attempt = 0; attempt < 60; attempt += 1) {
      await sleep(2000);
      try {
        const { data: status } = await api.get('/content-type-builder/update-schema-status');
        const { data: types } = await api.get('/content-type-builder/content-types');
        if (!status.isUpdating && !types.some((contentType) => contentType.uid === NEW_UID)) return;
      } catch (error) {
        // The server is still restarting.
      }
    }
    throw new Error(`${NEW_UID} still exists after deletion`);
  },

  intro: {
    text: 'Welcome to the guided tour of the Content-type Builder!',
    button: "Let's start 🚀",
  },

  steps: [
    // Navigation
    {
      explain: CTB_NAV,
      text: 'This is the **navigation of the Content-type Builder**. It gives access to already created content-type and allows to create more.\n\nIt is organised in **3 categories**: *Collection types*, *Single types* and *Components*.\n\n✏️ When creating a new content-type, the first thing you have to decide is which type of content you want to create.',
    },
    {
      explain: ['role=button[name="Save"]', 'role=button[name="More actions"]', 'role=searchbox[name="Search"]'],
      zoom: true,
      text: 'The navigation also displays **centralised buttons and a search** which apply to all content-types and components, which allow you to work on several at the same time.\n• The *Save* button saves all changes made to all content-types and components.\n• The *...* button gives access to *Undo*, *Redo* and *Discard changes* buttons.',
    },

    // Edition interface
    {
      explain: ['h1', 'role=button[name="Add another field"]', 'role=button[name="Add another field to this collection type"]'],
      padding: 24,
      text: "Let's now take a look at the **content-type edition interface**! 🚀",
    },
    {
      explain: 'role=button[name="Configure the view"]',
      text: 'This is the button to **configure the edit view** of the content-type when in the Content Manager.',
    },
    {
      explain: 'role=button[name="Edit"]',
      text: "The *Edit* button leads to the content-type's **settings** which allow you to rename the content-type or even change its type.\n\nFrom the content-type's **advanced settings** you can also enable or disable features such as **Draft & Publish** and **Internationalisation**.",
    },
    {
      explain: 'role=button[name="Add another field"]',
      text: 'This is the button to **add another field** to the content-type.',
    },
    {
      explain: ['role=button[name="name"]', 'role=button[name="Add another field to this collection type"]'],
      text: 'And this is the **list of fields** that have been added to the content-type.',
    },
    {
      explain: ['role=button[name="Edit slug"]', 'role=button[name="Delete slug"]'],
      text: "For each field, you can click on:\n• the ✏️ **edit** button to access the field's basic and advanced settings\n• the 🗑️ **delete** button to delete the field from the content-type",
    },
    {
      chapter: true,
      text: "Let's create a simple content-type together! 🚀",
    },

    // New collection type
    {
      before: [{ click: 'role=button[name="New Collection-Type"]' }],
      click: 'role=menuitem[name="New Collection-Type"]',
      text: 'Click on "*New Collection-Type*".',
    },
    {
      fill: 'role=textbox[name="Display name"]',
      value: 'Simple article',
      text: "Let's create a content type for simple articles.",
    },
    {
      click: 'role=tab[name="Advanced settings"]',
      text: "Let's take a look at the **Advanced settings**.",
    },
    {
      click: 'role=checkbox[name="Internationalization"]',
      text: 'Tick the "*Internationalization*" box to enable this feature for our new content-type.',
    },
    {
      click: 'role=button[name="Continue"]',
      text: 'Click the *Continue* button.',
    },
    {
      explain: NEW_NAV_ITEM,
      text: 'Our newly created collection type is now listed among the collection types!\n\n✏️ The **"N" status** **indicates that the content type is new**. Other statuses can be displayed in the navigation:\n• **"M"** for **modified**\n• **"D"** for **deleted**\n\nAll statuses are erased after clicking the *Save* button.',
    },
    {
      click: 'role=button[name="Save"]',
      text: "Let's save our new collection type!",
    },

    // Fields
    {
      before: AFTER_RESTART,
      click: 'role=button[name="Add new field"] >> nth=-1',
      text: "It's now time to **select fields for our content-type**!",
    },
    {
      click: 'role=button[name=/^Text Small/]',
      text: "Let's start with a **Text field**.",
    },
    {
      fill: 'input[name=name]',
      value: 'title',
      text: "Let's make our Text field the title for our simple article.",
    },
    {
      click: 'role=tab[name="Advanced settings"]',
      text: "Let's see what options are available in our field's Advanced settings!",
    },
    {
      click: 'role=checkbox[name="Required field"]',
      text: 'Tick the *Required field* box to make sure this field is always filled in by content managers.',
    },
    {
      click: 'role=dialog >> role=button[name="Add another field"]',
      text: "Let's **add another field** to our simple article!",
    },
    {
      click: 'role=button[name=/^Rich text \\(Blocks\\)/]',
      text: 'A **Rich text** field could be quite useful to write the content of the article.',
    },
    {
      fill: 'input[name=name]',
      value: 'body',
      text: "Let's name our new field.",
    },
    {
      click: 'role=dialog >> role=button[name="Add another field"]',
      text: "And let's add one more field!",
    },
    {
      click: 'role=button[name=/^Media Files/]',
      text: 'A **Media field** would be great to add a cover to our article!',
    },
    {
      fill: 'input[name=name]',
      value: 'cover',
      text: "Let's name our new media field.",
    },
    {
      click: 'label:has(input[name=multiple][value=false])',
      text: 'Select the **Single media** option since we do not want content managers to be able to upload more than one photo.',
    },
    {
      click: 'role=button[name="Finish"]',
      text: 'Click on *Finish* to stop adding new fields for now.',
    },
    {
      explain: ['role=button[name="title"] >> text="New"', 'role=button[name="cover"] >> text="New"'],
      padding: 10,
      text: '✏️ Just like in the navigation, **statuses are displayed in the list of fields** to indicate whether the fields are new, modified or deleted.',
    },
    {
      click: 'role=button[name="Save"]',
      text: "Let's not forget to click on the *Save* button for all the modifications to be validated.",
    },

    // Statuses and undo
    {
      before: AFTER_RESTART,
      click: 'role=button[name="Edit cover"]',
      text: "Let's edit one of our fields to see another status!",
    },
    {
      click: 'label:has(input[name=multiple][value=true])',
      text: "Let's switch from Single to Multiple media.",
    },
    {
      click: 'role=button[name="Finish"]',
      text: 'And click on *Finish*.',
    },
    {
      // Lets the badge transition end, so steps 35 to 37 share one screen.
      before: [{ wait: 800 }],
      explain: 'role=button[name="cover"] >> text="Modified"',
      padding: 10,
      text: 'You can see the "Modified" status here in the list of fields...',
    },
    {
      explain: NEW_NAV_ITEM,
      text: '... and an "M" here in the navigation!',
    },
    {
      click: 'role=button[name="More actions"]',
      text: "One last thing to try in the Content-type Builder: let's click on the *...* button.",
    },
    {
      click: 'role=menuitem[name="Undo last change"]',
      text: 'Instead of clicking the edit button changing the settings again, you can click the *Undo last change* button!',
    },
    {
      chapter: true,
      text: 'And that\'s it, we have created the new "*Simple article*" collection type and tried various options available in the Content-type Builder!',
    },
  ],

  outro: {
    text: 'Thank you for following this guided tour!',
    links: [
      { label: 'Content-type Builder docs 📖', href: '/cms/features/content-type-builder' },
      { label: '🚀 Quick Start Guide', href: '/cms/quick-start' },
    ],
  },
};
