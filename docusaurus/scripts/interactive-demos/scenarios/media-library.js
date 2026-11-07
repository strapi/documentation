// Media Library tour, step for step the Guideflow tour it replaces.
// Runs against the demo app from setup-demo-app.js, on the new Media Library UI
// (the default since Strapi 5.54, so `useLegacyMediaLibrary` must stay off).
//
// DEMO_STRAPI_DIR: path to the demo app. The tour uploads 2 of its seed images,
// taken from <DEMO_STRAPI_DIR>/data/uploads/. Defaults to ~/strapi-demo.

const os = require('os');
const path = require('path');

const APP_DIR = process.env.DEMO_STRAPI_DIR || path.join(os.homedir(), 'strapi-demo');
const UPLOADS = path.join(APP_DIR, 'data/uploads');
const FIRST_UPLOAD = path.join(UPLOADS, 'coffee-shadow.jpg');
const SECOND_UPLOAD = path.join(UPLOADS, 'we-love-pizza.jpg');

const FOLDERS = ['Brand assets', 'Documents', 'Events', 'Products'];
const NEW_FOLDER = 'PDF';
// Assets the demo app seeds, all in the root folder.
const SEED_ASSETS = [
  'daviddoe@strapi',
  'sarahbaker@strapi',
  'the-internet-s-own-boy',
  'coffee-art',
  'coffee-beans',
  'this-shrimp-is-awesome',
  'a-bug-is-becoming-a-meme-on-the-internet',
  'beautiful-picture',
  'what-s-inside-a-black-hole',
  'favicon',
  'default-image',
];

const FOLDERS_NAV = 'nav[aria-label="Media library folders"]';
const UPLOAD_DIALOG = 'role=dialog[name="Upload successful!"]';
const DETAILS = 'role=dialog[name="File details"]';
// An asset or folder card, found by its selection checkbox.
const card = (name) => `[role=listitem]:has([aria-label="Select ${name}"])`;
const moreActions = (name) => `${card(name)} >> role=button[name="More actions"]`;

module.exports = {
  title: 'Media Library Overview',
  viewport: { width: 1280, height: 800 },
  start: '/admin/plugins/upload',

  // Brings the app back to the same state before every capture: the 4 folders,
  // and the seed assets in the root folder.
  async setup({ api }) {
    const { results: files } = await api.get('/upload/files?pageSize=100');
    for (const file of files.filter((item) => !SEED_ASSETS.includes(item.name))) {
      await api.del(`/upload/files/${file.id}`);
    }
    // The tour moves an asset to a folder.
    const moved = files.filter((item) => SEED_ASSETS.includes(item.name) && item.folderPath !== '/');
    if (moved.length) {
      await api.post('/upload/actions/bulk-move', { destinationFolderId: null, fileIds: moved.map((item) => item.id), folderIds: [] });
    }

    const { data: folders } = await api.get('/upload/folders?pagination[pageSize]=100');
    // A top-level folder has a path like "/12".
    const isTopLevel = (folder) => folder.path.split('/').length === 2;
    const extraFolders = folders.filter((folder) => !FOLDERS.includes(folder.name) || !isTopLevel(folder));
    if (extraFolders.length) {
      await api.post('/upload/actions/bulk-delete', { fileIds: [], folderIds: extraFolders.map((folder) => folder.id) });
    }
    for (const name of FOLDERS.filter((item) => !folders.some((folder) => folder.name === item && isTopLevel(folder)))) {
      await api.post('/upload/folders', { name, parent: null });
    }
  },

  intro: {
    text: 'Welcome to the guided tour of the Media Library!',
    button: "Let's go 🚀",
  },

  steps: [
    // Overview
    {
      // The "Introducing the new Media Library" banner would cover the top of every screen.
      before: [{ click: 'role=button[name="Close the banner."]' }],
      explain: 'role=link[name="Media Library"]',
      text: 'The Media Library is accessible directly from the **navigation of the admin panel**.',
    },
    {
      explain: FOLDERS.map(card),
      text: 'The Media Library displays the **folders** that contain other folders and/or assets.',
    },
    {
      explain: [card('default-image'), card('this-shrimp-is-awesome')],
      text: 'It also displays the **assets** that are not in any of the folders shown above.',
    },
    {
      explain: FOLDERS_NAV,
      text: '**Folders** are also accessible as a tree view in the left sidebar.',
    },
    {
      chapter: true,
      text: "A variety of buttons and options are available in the Media Library to help you manage your folders & assets. Let's discover them!",
    },
    {
      explain: ['role=button[name="Filter"]', 'role=searchbox[name="Search for an asset"]'],
      text: 'From these buttons, you can **Filter** the folders and assets, or **Search** for a specific folder or asset.',
    },
    {
      explain: 'main >> role=button[name="New"]',
      text: 'The **New** button in the top right corner allows you to **create a new folder** or **add a new asset** to the Media Library.',
    },
    {
      explain: ['role=button[name="Sort: Most recent updates"]', 'role=group[name="View options"]'],
      text: 'And from these buttons, you can respectively:\n• **sort** the folder and assets.\n• **switch from grid to list view**',
    },
    {
      chapter: true,
      text: "Now that we've explored the interface, let's try managing assets and folders!",
    },

    // Move an asset
    {
      click: moreActions('default-image'),
      text: "Clicking the three dots button on an asset will automatically display other buttons. Let's try it!",
    },
    {
      explain: 'role=menu[name="More actions"]',
      text: 'We can now see that for the selected asset, many actions are available, including *Download media, Move to folder*, and *Delete.*',
    },
    {
      before: [{ press: 'Escape' }],
      click: moreActions('favicon'),
      text: "Let's select the other asset that's not in the right folder yet.",
    },
    {
      click: 'role=menuitem[name="Move to folder"]',
      text: "Let's click the *Move to folder* button.",
    },
    {
      click: 'role=combobox[name="Location"]',
      text: "In the dialog, let's click the dropdown to reveal the list of folders.",
    },
    {
      click: 'role=option[name="Brand assets"]',
      text: "Select 'Brand assets' from the list to move the elements to that location.",
    },
    {
      click: 'role=dialog[name="Move elements to"] >> role=button[name="Move"]',
      text: 'Confirm the action by clicking the *Move* button.',
    },
    {
      chapter: true,
      text: 'Our asset has been moved to the "Brand assets" folder!\n\nNow let\'s add a new asset!',
    },

    // Create a folder and upload assets
    {
      click: 'main >> role=button[name="New"]',
      text: "Before adding the new asset, let's create a new folder.",
    },
    {
      click: 'role=menuitem[name="New folder"]',
      text: "Click 'New folder' to create a new directory for your files.",
    },
    {
      fill: 'role=textbox[name="Folder name"]',
      value: NEW_FOLDER,
      text: 'We will name the new folder "PDF".',
    },
    {
      click: 'role=button[name="Create folder"]',
      text: 'Click the *Create folder* button.',
    },
    {
      click: card(NEW_FOLDER),
      text: 'Let\'s go in our new "PDF" folder.',
    },
    {
      click: 'role=button[name="Add assets"]',
      // The button opens the file picker, which a headless browser skips: the file goes straight to the input.
      after: [{ upload: 'main input[type=file]', files: FIRST_UPLOAD }, { waitFor: UPLOAD_DIALOG }],
      text: "Since the folder is empty, an *Add assets* button is displayed. Let's click it!\n\nYou'll have to select a file to upload from your computer.",
    },
    {
      explain: UPLOAD_DIALOG,
      text: 'We can follow the upload progress in a dialog in the bottom right corner of the user interface.',
    },
    {
      click: `${UPLOAD_DIALOG} >> role=button[name="Minimize"]`,
      text: 'Click the *Minimize* button to hide upload progress details…',
    },
    {
      click: `${UPLOAD_DIALOG} >> role=button[name="Maximize"]`,
      text: '… or click the *Maximize* icon to view again the full details.',
    },
    {
      explain: 'main article[role=listitem]',
      text: "Once you've uploaded a file from your computer, you can see it in the folder.",
    },
    {
      chapter: true,
      text: 'We can also add another file from your computer by dragging and dropping it.',
    },
    {
      click: 'main >> role=button[name="New"]',
      text: 'And finally you could also add another asset from the *New* dropdown…',
    },
    {
      click: 'role=menuitem[name="File upload"]',
      after: [{ upload: 'main input[type=file]', files: SECOND_UPLOAD }, { waitFor: UPLOAD_DIALOG }],
      text: '… by clicking on *File upload.*\n\nNote that you can also upload a file from a URL.',
    },

    // Asset details
    {
      before: [{ click: `${UPLOAD_DIALOG} >> role=button[name="Close"]` }, { click: `${FOLDERS_NAV} >> role=button[name="Home"]` }],
      click: 'role=button[name="default-image"]',
      after: [{ waitFor: `${DETAILS} >> role=textbox[name="File name"]` }],
      text: "Now let's learn how to manage individual assets!\n\nClick an asset…",
    },
    {
      explain: DETAILS,
      text: 'A details panel opens on the right side of the interface.',
    },
    {
      // The fields sit below the preview: scroll them into view.
      before: [{ hover: 'role=textbox[name="Alternative text"]' }],
      explain: ['role=textbox[name="File name"]', 'role=combobox[name="Location"]', 'role=textbox[name="Caption"]', 'role=textbox[name="Alternative text"]'],
      padding: 12,
      text: 'In the asset edition dialog, you can use the following options:\n• **File name** to rename the asset\n• **Location** to move the asset to another folder\n• **Caption** for the asset\n• **Alternative text** in case the asset isn\'t shown',
    },
    {
      explain: ['role=button[name="Delete this file"]', 'role=button[name="Replace this file"]'],
      text: 'Via the asset edition dialog, you can also use these buttons to, respectively:\n• **Delete** the asset\n• **Copy the link** to the asset\n• **Download** the asset\n• **Replace** the asset',
    },
    {
      before: [{ hover: `${DETAILS} >> role=button[name="Crop"]` }],
      explain: `${DETAILS} >> role=button[name="Crop"]`,
      text: 'Images can also be cropped by clicking the **Crop** button in the top right corner of their preview. Let\'s try it!',
    },
    {
      before: [{ click: `${DETAILS} >> role=button[name="Crop"]` }],
      chapter: true,
      text: 'We can drag and drop handles in the corners of the image, or use numeric values to crop the image.',
    },
    {
      explain: 'role=button[name="Lock aspect ratio"]',
      text: 'The link button helps you lock the aspect ratio.',
    },
    {
      explain: 'role=button[name="Focal point"]',
      text: 'We can also drag the circle to define the focal point. This keeps the most important part of an image visible when your front end crops or resizes it.',
    },
    {
      click: 'role=button[name="Cancel"]',
      text: "Let's click *Cancel* to close the cropping UI.",
    },
    {
      click: `${DETAILS} >> role=button[name="Close"]`,
      text: "Click the 'Close' button to hide the details panel.",
    },

    // Bulk actions
    {
      chapter: true,
      text: 'We can also select multiple assets to perform bulk actions on them.',
    },
    {
      click: 'role=checkbox[name="Select default-image"]',
      text: 'Check the box in the upper left corner to select a first file…',
    },
    {
      click: 'role=checkbox[name="Select what-s-inside-a-black-hole"]',
      text: '… then select a second one.',
    },
    {
      explain: 'section[aria-label="Bulk actions"]',
      text: 'When several assets are selected, a bulk actions bar is displayed.\n\nYou can use it to:\n• **Select all** assets and folders\n• Automatically **Create metadata** with AI (requires a Growth plan)\n• **Move** selected assets to another folder\n• **Delete** selected files and folders',
    },
    {
      explain: FOLDERS_NAV,
      text: 'Selected files can also moved by dragging and dropping them on any folder in the tree view.',
    },
    {
      click: 'role=button[name="Clear selection"]',
      text: 'Click the close icon to dismiss the bulk actions toolbar.',
    },
  ],

  outro: {
    text: "And that's it!\n\nWe've explored the Media Library and saw how to add and manage assets and folders ✨",
  },
};
