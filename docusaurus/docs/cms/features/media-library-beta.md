---
title: Media Library beta
displayed_sidebar: cmsSidebar
description: Use the reworked Media Library available behind the betaMediaLibrary future flag.
unlisted: true
toc_max_heading_level: 5
tags:
- admin panel
- features
- media library
---

import ScreenshotNumberReference from '/src/components/ScreenshotNumberReference.jsx';
import StrapiAiCredits from '/docs/snippets/strapi-ai-credits.md'

# Media Library beta

Strapi has completely reworked the <Icon name="images" /> Media Library UI. This page describes the reworked UI, which is available as a beta feature <VersionBadge version="5.52.2+" noTooltip /> behind the `betaMediaLibrary` future flag, before it becomes the default UI.

Read the [Media Library](/cms/features/media-library) page for how to enable the flag, and for every configuration option, which the flag does not change.

## Usage <FeatureFlagBadge feature="betaMediaLibrary" /> {#usage}

**Path to use the feature:** <Icon name="images" /> Media Library

The Media Library displays all assets uploaded in the application, either via the <Icon name="images" /> Media Library itself or via the <Icon name="feather" /> Content Manager when managing a media field.

Assets uploaded to the Media Library can be inserted into content-types using the [Content Manager](/cms/features/content-manager#creating--writing-content).

:::note
The Media Library hides what your role cannot do instead of displaying a disabled control. With the _Access the Media Library_ permission alone, the library is read-only: there is no **New** button, no selection checkbox and no bulk action, and the fields of the asset details panel cannot be edited. See [Users & Permissions](/cms/features/users-permissions) to grant the _Create_, _Update_, _Download_ and _Copy link_ permissions of the Upload plugin.
:::

### Interface overview

<ThemedImage
  alt="Media Library interface, with its 5 areas numbered"
  sources={{
    light: '/img/assets/media-library/media-library_ui-overview.png',
    dark: '/img/assets/media-library/media-library_ui-overview_DARK.png',
  }}
/>

The Media Library is organized in the following areas:

- The folder tree <ScreenshotNumberReference number="1" /> on the left lists _Home_ and the full folder hierarchy (see [navigating folders](#navigating-folders)).
- The page title <ScreenshotNumberReference number="2" /> names the location you are currently browsing, either _Home_ or a folder name, followed by the number of files it holds directly, displayed as, for instance, 11 items. Subfolders and their content are not counted, and the number does not change when filters are active.
- The **New** button <ScreenshotNumberReference number="3" /> creates a folder or uploads assets (see [adding assets](#adding-assets) and [adding folders](#adding-folders)).
- The toolbar <ScreenshotNumberReference number="4" /> spans the row above the list. Use it to filter, search and sort the list (see [finding assets](#finding-assets)), and to switch between the grid view and the table view (see [switching views](#switching-views)).
- The list <ScreenshotNumberReference number="5" /> displays the folders and assets of the current location. More assets load as you scroll.

A _Beta_ notice sits above the list and reminds you that some features are still in progress. Click **Close** to dismiss it: it stays dismissed in that browser.

Each folder and asset in the list has a checkbox to select it (see [selecting items](#selecting-items)) and a <Icon name="dots-three" classes="ph-bold" /> button (see [using the item actions menu](#item-actions)). The Media Library calls a folder or an asset an _item_, and several controls use that word.

<details>
<summary>What changed from the previous Media Library</summary>

| In the previous UI | In the Media Library beta |
| --- | --- |
| **Add new assets** and **Add new folder** buttons | A single **New** button that does both (see [adding assets](#adding-assets)) |
| Breadcrumbs above the list | A folder tree on the left (see [navigating folders](#navigating-folders)) |
| Folder cards displaying how many items they hold | Folder names only. To know how many assets a folder holds directly, open it and read the page title |
| Pagination, with an _Entries per page_ setting | No pagination: more assets load as you scroll |
| A <Icon name="gear-six" /> button to configure the view | No view configuration (see [configuring the view](/cms/features/media-library#configuring-the-view)) |
| A <Icon name="magnifying-glass" classes="ph-bold" /> button opening a search field | A search field always displayed in the toolbar (see [searching assets](#searching-assets)) |
| A _Details_ window that covers the library | A details panel that leaves the list usable (see [managing individual assets](#managing-assets)) |
| A crop mode and a focal point mode, opened separately | A single _Crop & Focus area_ editor (see [cropping images and setting a focus area](#cropping-images)) |

</details>

:::note
The Media Library stores what you are looking at in the page URL: the current folder, the search term, the filters, the sort order, where folders are displayed, and the open asset. Copying the URL and sharing it with another user of the same Strapi project gives them the same list. The grid or table choice is not part of the URL, and a filter set to a relative date is resolved again when the URL is opened.
:::

#### Switching views

The list displays either as a grid of cards or as a table. Click <Icon name="squares-four" classes="ph-bold" /> **Grid view** or <Icon name="list" classes="ph-bold" /> **Table view** in the toolbar to switch. Your choice is remembered in your browser for the next visit.

The table view displays a _Name_, _Creation date_, _Last modified_ and _Size_ column for each item, along with a **Select all** checkbox in the header row. Assets missing a caption or an alternative text are flagged with a warning icon.

<ThemedImage
  alt="Media Library displaying folders and assets as a table"
  sources={{
    light: '/img/assets/media-library/media-library_table-view.png',
    dark: '/img/assets/media-library/media-library_table-view_DARK.png',
  }}
/>

:::note
Column headers in the table view are labels, not sort controls. Use the toolbar's _Sort_ menu to change the order (see [sorting assets](#sorting-assets)).
:::

#### Navigating folders {#navigating-folders}

The folder tree on the left side of the interface lists the whole folder hierarchy. There is no breadcrumb: the tree and the page title tell you where you are.

<ThemedImage
  alt="Media Library displaying the content of a folder, with the folder tree expanded"
  sources={{
    light: '/img/assets/media-library/media-library_folder-navigation.png',
    dark: '/img/assets/media-library/media-library_folder-navigation_DARK.png',
  }}
/>

- Click a folder name, in the tree or in the list, to display its content.
- Click the <Icon name="caret-right" classes="ph-bold" /> button next to a folder name to expand or collapse its subfolders.
- Click <Icon name="house" /> **Home** to go back to the root of the library.

Strapi does not enforce a maximum folder depth. The folder tree expands automatically to reveal the folder you are browsing.

#### Using the item actions menu {#item-actions}

The <Icon name="dots-three" classes="ph-bold" /> button of an asset or a folder opens a menu that acts on that item only, whatever else is selected in the list.

On an asset, the menu offers:

- <Icon name="arrows-counter-clockwise" classes="ph-bold" /> **Replace media**
- <Icon name="link" classes="ph-bold" /> **Copy link to media**
- <Icon name="download-simple" /> **Download media**
- <Icon name="arrow-right" classes="ph-bold" /> **Move to folder**
- <Icon name="trash" /> **Delete**

<ThemedImage
  alt="Actions menu of an asset, opened from the grid view"
  sources={{
    light: '/img/assets/media-library/media-library_item-actions.png',
    dark: '/img/assets/media-library/media-library_item-actions_DARK.png',
  }}
/>

On a folder, it offers:

- <Icon name="link" classes="ph-bold" /> **Copy link to folder**
- <Icon name="pencil-simple" /> **Rename folder**
- <Icon name="arrow-right" classes="ph-bold" /> **Move to folder**
- <Icon name="trash" /> **Delete folder**

#### Using the right-click menu {#right-click-menu}

Right-clicking the empty parts of the Media Library opens a menu with the same creation actions as the **New** button. They act on the folder you are currently browsing:

- <Icon name="folder" /> **New folder**
- <Icon name="files" /> **File upload**
- <Icon name="link" classes="ph-bold" /> **File upload from URL**

The menu opens anywhere in the scrolling column: the list, the empty space below the last row, the page header band beside the title, and the padding around them. It behaves the same in the grid view and in the table view, and is dismissed with `Escape` or a click elsewhere.

Anything you can interact with keeps your browser's own menu instead, so copying and pasting still works in the search field. This covers the **New** button, search, filters, sorting, the view toggle and the filter badges, as well as asset cards, folder cards, table rows and the column header row of the table view.

:::note
The menu requires the _Create_ permission of the Upload plugin. Without it, right-clicking the library falls through to your browser's menu with nothing offered. See [Users & Permissions](/cms/features/users-permissions).
:::

### Adding assets

<details>
<summary>Media types the Media Library previews</summary>

| Media type | Extensions |
| ---------- | --------------------------------------------------------------- |
| Image      | - JPEG<br />- PNG<br />- GIF<br />- SVG<br />- TIFF<br />- ICO<br />- DVU   |
| Video      | - MPEG<br />- MP4<br />- MOV (Quicktime)<br />- WMV<br />- AVI<br />- FLV |
| Audio      | - MP3<br />- WAV<br />- OGG                                         |
| File       | - CSV<br />- ZIP<br />- PDF<br />- XLS, XLSX<br />- JSON                |
<br/>

The Media Library itself does not restrict file types. Which files are accepted is decided by the `security.allowedTypes` and `security.deniedTypes` options (see [security](/cms/features/media-library#security)) and by the maximum file size (see [max file size](/cms/features/media-library#max-file-size)). SVG files are denied by default in projects generated with Strapi <VersionBadge version="5.52.2+" noTooltip /> and later (see [SVG uploads](/cms/features/media-library#svg-uploads)).

</details>

Assets are always uploaded to the location you are currently browsing. Navigate to the target folder before uploading, or move the assets afterwards (see [moving assets and folders](#moving-assets)).

In an empty folder, and in a new project, the list is replaced by a _No assets yet_ message with an **Add assets** button that opens the same file browser as **New** > **File upload**.

There are 3 ways to add assets.

#### Uploading files from your computer

<ThemedImage
  alt="New button menu, offering to create a folder or upload files"
  sources={{
    light: '/img/assets/media-library/media-library_new-menu.png',
    dark: '/img/assets/media-library/media-library_new-menu_DARK.png',
  }}
/>

1. Click the **New** button in the upper right corner of the Media Library.
2. Click <Icon name="files" /> **File upload**.
3. Select one or several files in your system's file browser and confirm.

The upload starts immediately and its progress is reported in the upload dialog (see [following upload progress](#upload-progress)).

#### Uploading files by drag and drop

1. Drag one or several files from your computer onto the Media Library.
2. Check the destination folder named in the _Drop here to upload to_ overlay.
3. Release the files.

<ThemedImage
  alt="Media Library highlighted while files are dragged over it, naming the destination folder"
  sources={{
    light: '/img/assets/media-library/media-library_drag-drop-upload.png',
    dark: '/img/assets/media-library/media-library_drag-drop-upload_DARK.png',
  }}
/>

:::caution
Files dropped from your computer always land in the folder you are currently browsing, whatever they are dropped on. Dropping a file on a folder card does not upload it into that folder: navigate into the folder first. Dragging an item that is already in the library onto a folder does move it (see [moving assets and folders](#moving-assets)).
:::

#### Uploading files from a URL

1. Click the **New** button in the upper right corner of the Media Library.
2. Click <Icon name="link" classes="ph-bold" /> **File upload from URL**.
3. In the _URL(s)_ field of the _Import from URL_ dialog, type or paste up to 20 URLs, one per line.
4. Click **Upload**.

Strapi downloads each file server-side and adds it to the current folder. The server reports no incremental byte count for this flow, so the upload dialog displays a moving progress bar without a percentage.

:::caution
URLs must use the `http` or `https` protocol, and must resolve to a publicly reachable address. URLs that resolve to a private or internal address, such as `localhost` or an address on your own network, are rejected to prevent server-side request forgery.
:::

#### Following upload progress {#upload-progress}

Uploads are reported in a dialog that lists every file of the batch with its own status, such as Queued, Uploading... or Uploaded. The dialog is available throughout the admin panel, not only in the Media Library, so you can navigate to another part of Strapi while a batch uploads.

<ThemedImage
  alt="Upload dialog listing the files of a batch with their status"
  sources={{
    light: '/img/assets/media-library/media-library_upload-progress.png',
    dark: '/img/assets/media-library/media-library_upload-progress_DARK.png',
  }}
/>

The dialog can be minimized to a summary line and maximized again. It offers a **Cancel all** button that stops the batch while keeping the files already uploaded, a **Retry** button that restarts the files you cancelled, and a **Close** button once the batch is finished. Dropping more files while a batch is running adds them to that batch.

:::caution
**Retry** is only displayed after a cancellation, and it only restarts cancelled files. A file that failed on its own cannot be retried from the dialog: read the reason on its row, fix the cause, and upload it again.
:::

By default, files are uploaded one at a time. Increase [`concurrentUploadRequests`](/cms/features/media-library#concurrent-file-uploads) to upload several files in parallel.

#### Automatically generating metadata with Strapi AI {#ai-powered-metadata-generation}
<GrowthBadge />

[When enabled](/cms/configurations/admin-panel#strapi-ai), Strapi AI automatically generates an alternative text and a caption for images uploaded to the Media Library, helping you improve content accessibility and SEO. The upload dialog reports the outcome for each file, such as _Uploaded • Metadata generated_ or _Upload complete • Metadata generation skipped_.

AI metadata generation only works with PNG, JPEG, WebP, HEIC and HEIF images. Every other file, including GIF, SVG and TIFF images, is reported as skipped. The feature is enabled by default, but can be disabled in the [Media Library settings](/cms/features/media-library#configuring-settings) if needed.

Metadata can also be generated for images that already exist in the library, either from the [Media Library settings](/cms/features/media-library#configuring-settings) for every image that lacks one, or with the **Create metadata** bulk action for a specific selection (see [generating metadata in bulk](#bulk-metadata)).

<ThemedImage
  alt="Media Library settings offering to generate metadata for existing images"
  sources={{
    light: '/img/assets/media-library/media-library_ai-metadata-retroactive.png',
    dark: '/img/assets/media-library/media-library_ai-metadata-retroactive_DARK.png',
  }}
/>

:::note Strapi AI credits
<StrapiAiCredits />
:::

### Finding assets

The toolbar offers a <Icon name="funnel-simple" classes="ph-bold" /> **Filter** button, a _Search_ field and a **Sort** button, in that order. Search looks across the whole library, while filters and sorting apply to the location you are browsing.

#### Searching assets

Type in the toolbar's _Search_ field to find assets and folders by name.

<ThemedImage
  alt="Media Library displaying the results of a search, with the number of folders and assets found"
  sources={{
    light: '/img/assets/media-library/media-library_search-results.png',
    dark: '/img/assets/media-library/media-library_search-results_DARK.png',
  }}
/>

The search covers the whole library, not only the folder you are browsing, and it returns both folders and assets. The page title becomes _Search results for "your term"_ followed by the number of folders and assets found.

To leave the search, click the <Icon name="x" classes="ph-bold" /> **Clear** button inside the search field, or navigate to a folder in the folder tree.

When a search returns nothing, the list is replaced by a _No results found_ message with a <Icon name="x" classes="ph-bold" /> **Clear search** button.

#### Filtering assets

3 filter fields are available to narrow the list:

| Filter field | Values | Conditions |
| --- | --- | --- |
| _Type_ | Folder, Picture, Audio, Video, Document | is, is not |
| _Creation date_ | A relative preset, from 1 day ago to 1 year ago | is exactly, within the last, not within the last |
| _Creation date_ | A custom date range | is, is not |
| _Last modified_ | A relative preset, from 1 day ago to 1 year ago | is exactly, within the last, not within the last |

<ThemedImage
  alt="Filter menu of the Media Library, with a filter already applied below the toolbar"
  sources={{
    light: '/img/assets/media-library/media-library_filter-menu.png',
    dark: '/img/assets/media-library/media-library_filter-menu_DARK.png',
  }}
/>

To filter the list:

1. Click the <Icon name="funnel-simple" classes="ph-bold" /> **Filter** button in the toolbar.
2. Click a filter field.
3. Click one or several values. The _Type_ list stays open so that you can check several types, and the badge lists them all, for instance _Type is Picture, Video_.
4. (optional) Repeat for another field.

Filters combine, so only the items matching every filter are displayed. Each applied filter is added below the toolbar as a badge. Click the condition or the value segment of a badge to change it, and the <Icon name="x" classes="ph-bold" /> button to remove that filter.

:::note
Filters apply to the location you are browsing, not to the whole library. Use the [search](#searching-assets) to look across all folders.

A _Type_ badge also decides whether folders are displayed: folders are hidden unless Folder is one of its values, and assets are hidden when Folder is its only value.
:::

When the active filters match nothing, the list is replaced by a _No items matched current filters_ message with a <Icon name="x" classes="ph-bold" /> **Clear filters** button that removes all of them. There is no clear-all control in the toolbar: as long as the filters match something, remove the badges one by one.

#### Sorting assets

Click the **Sort** button in the toolbar to change the order of the list. The button label always names the active rule, for instance _Sort: Most recent updates_.

<ThemedImage
  alt="Sort menu of the Media Library, with a Sort section and a Folders section"
  sources={{
    light: '/img/assets/media-library/media-library_sort-menu.png',
    dark: '/img/assets/media-library/media-library_sort-menu_DARK.png',
  }}
/>

The _Sort_ section offers 6 mutually exclusive rules: Oldest uploads, Most recent updates (the default), A to Z, Z to A, File size ascending, and File size descending.

In the table view, an additional _Folders_ section decides whether folders are grouped On top, which is the default, or Mixed with files, in which case they follow the active sort rule. The grid view always groups folders on top, so it does not display that section.

:::note
Folders follow the active sort rule when it can apply to them: Oldest uploads orders them by their own creation date, and A to Z and Z to A by name. They stay in alphabetical order for the default Most recent updates rule, and for the 2 file size rules because folders have no size.
:::

### Managing individual assets {#managing-assets}

Click an asset in the list to open its details panel on the right side of the interface. The list stays visible and usable behind the panel.

<ThemedImage
  alt="Details panel of an asset, displaying its preview, its file information and its editable fields"
  sources={{
    light: '/img/assets/media-library/media-library_asset-drawer.png',
    dark: '/img/assets/media-library/media-library_asset-drawer_DARK.png',
  }}
/>

The panel is organized as follows:

- A preview of the asset. Images are displayed, videos and audio files can be played with the browser's own controls, and PDFs are rendered inline. Any other file type displays its icon and _No preview available_. Images also get a <Icon name="crop" classes="ph-bold" /> **Crop** button (see [cropping images and setting a focus area](#cropping-images)).
- A read-only _File info_ section listing the _Creation date_, _Last updated_, _Created by_, _Size_, _Dimensions_ (images only), _Extension_ and _Asset ID_ of the asset.
- The editable _File name_, _Location_, _Caption_ and _Alternative text_ fields. A caption and an alternative text can be set on any file type, not only images, and a warning is displayed next to each of the 2 fields when it is empty.
- A row of icon-only buttons at the bottom: <Icon name="trash" /> **Delete this file**, <Icon name="link" classes="ph-bold" /> **Copy link**, <Icon name="download-simple" /> **Download** and <Icon name="arrows-counter-clockwise" classes="ph-bold" /> **Replace this file**, next to the **Save changes** button.

#### Editing an asset name, caption and alternative text {#editing-assets}

To rename an asset, or to add or change its caption and alternative text:

1. Click the asset in the list.
2. Update the _File name_, _Caption_ or _Alternative text_ fields.
3. Click **Save changes**.

:::note
**Save changes** stays disabled until you change something, and an empty _File name_ prevents saving. If you close the panel with unsaved changes, Strapi asks you to confirm before discarding them.
:::

:::tip
The _Location_ field of the same panel moves a single asset to another folder. See [moving assets and folders](#moving-assets) for the other options.
:::

#### Cropping images and setting a focus area {#cropping-images}

One editor handles both cropping and the focus area. The focus area, also called focal point, keeps the most important part of an image visible when your front end crops or resizes it.

<ThemedImage
  alt="Crop and Focus area editor, with a crop rectangle and a circular focus handle on the image"
  sources={{
    light: '/img/assets/media-library/media-library_crop-focus.png',
    dark: '/img/assets/media-library/media-library_crop-focus_DARK.png',
  }}
/>

1. Click an image in the list to open its details panel.
2. Click the <Icon name="crop" classes="ph-bold" /> **Crop** button on the preview. The _Crop & Focus area_ editor opens.
3. Define the crop area by dragging the handles in the corners of the rectangle, or by typing exact values in the width and height fields of the editor panel.
4. (optional) Click the <Icon name="link" classes="ph-bold" /> **Lock aspect ratio** button to resize both dimensions together.
5. Define the focus area by dragging the circle inside the crop rectangle, or by typing exact values in the _X_ and _Y_ fields.
6. Save your changes:
    - Click **Apply** to crop the original asset. The asset keeps its ID, so content already using it is updated.
    - Click **Save as copy** to keep the original untouched and create a new asset in the same folder. The copy inherits the caption and the alternative text of the original.

To leave the editor without changing anything, click **Cancel**.

:::note
The focus area is stored on the asset and returned by the API as a `focalPoint` value, so your front end can use it when it crops or resizes the image.
:::

:::note
The numeric fields are hidden on small screens. Set the crop and focus areas by dragging the rectangle and the circle directly on the image instead.
:::

#### Replacing an asset file

Replacing swaps the file behind an asset while keeping the asset itself, so every content entry already pointing at it keeps working.

1. Click the asset in the list to open its details panel.
2. Click the <Icon name="arrows-counter-clockwise" classes="ph-bold" /> **Replace this file** button.
3. Click **Continue** in the confirmation dialog.
4. Select the new file in your system's file browser and confirm. The file browser only offers files whose type matches the current asset.

:::warning
The previous file is permanently replaced and cannot be recovered. If [AI metadata generation](#ai-powered-metadata-generation) is enabled, Strapi also generates a new caption and alternative text for the replacement file, overwriting the existing ones. The confirmation dialog says so before you continue.
:::

#### Downloading assets and copying links

1. Click the asset in the list to open its details panel.
2. Click the <Icon name="download-simple" /> **Download** button to save the file to your computer, or the <Icon name="link" classes="ph-bold" /> **Copy link** button to copy its URL to the clipboard.

Both actions are also available from the asset's <Icon name="dots-three" classes="ph-bold" /> actions menu, as **Download media** and **Copy link to media**.

:::note
**Copy link to media** copies the asset's own URL, the one your front end uses to serve the file. **Copy link to folder**, in a folder's <Icon name="dots-three" classes="ph-bold" /> actions menu, copies a link to that folder in the admin panel, which only works for someone logged into Strapi.
:::

#### Deleting assets

1. Click the asset in the list to open its details panel.
2. Click the <Icon name="trash" /> **Delete this file** button.
3. Click **Confirm**.

:::warning
Deleted files cannot be recovered. If a file is currently in use, the linked content breaks and image containers are left empty.
:::

Assets can also be deleted in bulk, together with folders (see [deleting items in bulk](#bulk-delete)).

### Using bulk actions

Bulk actions apply to a selection of assets and folders. Select the items first, then pick an action in the bulk actions bar.

#### Selecting items {#selecting-items}

Click the checkbox of a folder or an asset to select it. Assets and folders can be selected together.

The following shortcuts speed up selection:

| Shortcut | Description |
| --- | --- |
| `Cmd`/`Ctrl` + click | Adds an item to the selection or removes it. |
| `Shift` + click | Selects every item between the last selected item and the clicked one. |
| `Space` | With a card or a row focused, adds it to the selection or removes it. |
| `Enter` | With a card or a row focused, opens the asset details panel, or enters the folder. |

Both modifier shortcuts work on the card or the row itself. Clicking the file name always opens the details panel, whatever modifier you hold.

In the table view, a **Select all** checkbox in the header row selects every item currently displayed, and empties the selection when everything is already selected.

Selecting an item displays the bulk actions bar at the bottom of the interface. The bar reports how many items are selected and offers the bulk actions. Click <Icon name="x" classes="ph-bold" /> **Clear selection** to empty the selection.

In the grid view as well as the table view, the bar also offers a **Select all** button <VersionBadge version="5.52.3+" noTooltip /> that selects every folder and asset currently displayed. Only the items already loaded are selected: scroll further down the list, then click **Select all** again to add the newly loaded items. Unlike the checkbox of the table view header, the button does not empty the selection when everything is already selected.

<ThemedImage
  alt="Bulk actions bar at the bottom of the Media Library, with several items selected"
  sources={{
    light: '/img/assets/media-library/media-library_bulk-actions.png',
    dark: '/img/assets/media-library/media-library_bulk-actions_DARK.png',
  }}
/>

:::note
The selection survives switching between the grid and the table view, but it is emptied when you navigate to another folder or change the search, the filters or the sort order.

Opening an asset details panel hides the bar while the panel is open. The selection is kept and the bar comes back when you close the panel.
:::

#### Moving items in bulk {#bulk-move}

1. Select the assets and folders to move.
2. Click the <Icon name="arrow-right" classes="ph-bold" /> **Move** button in the bulk actions bar.
3. In the _Move elements to_ dialog, select the destination in the _Location_ list. The root of the library is listed there as _Media Library_, and folders carry their full path, for instance _Brand assets / Logos_. The folder the items already sit in, and any folder they cannot be moved into, are not listed.
4. Click **Move**.

Items can also be moved by drag and drop (see [moving assets and folders](#moving-assets)).

#### Deleting items in bulk {#bulk-delete}

1. Select the assets and folders to delete.
2. Click the <Icon name="trash" /> **Delete** button in the bulk actions bar.
3. Click **Confirm** in the dialog.

:::warning
Deleting a folder also deletes everything it contains, including its subfolders and their assets. None of it can be recovered.
:::

#### Generating metadata in bulk {#bulk-metadata}
<GrowthBadge />

When [Strapi AI](/cms/configurations/admin-panel#strapi-ai) is enabled, a <Icon name="sparkle" /> **Create metadata** button in the bulk actions bar generates a caption and an alternative text for the selected images.

1. Select the images to describe.
2. Click the <Icon name="sparkle" /> **Create metadata** button in the bulk actions bar.

Metadata can be generated for up to 40 assets at a time. Only PNG, JPEG, WebP, HEIC and HEIF images are supported: selected folders are ignored, and selected files of any other type are reported as skipped.

### Organizing assets with folders

Folders in the Media Library help you organize uploaded assets. From the Media Library, it is possible to create new folders, move assets and folders, rename a folder, and delete folders. To browse them, see [navigating folders](#navigating-folders).

:::note
Folders follow the permission system of assets (see [Users & Permissions feature](/cms/features/users-permissions)). It is not yet possible to define specific permissions for a folder. Creating a folder requires the _Create_ permission on assets, and renaming, moving or deleting one requires the _Update_ permission.
:::

:::caution
In this beta, **Rename folder**, **Move to folder** and **Delete folder** are displayed to every user who can see the folder, including users without the _Update_ permission on assets. The action is then refused by the server.
:::

#### Adding folders

1. Navigate to the location where the folder must be created.
2. Click the **New** button in the upper right corner of the Media Library.
3. Click <Icon name="folder" /> **New folder**.
4. Type a name in the _Folder name_ field.
5. Click **Create folder**.

:::note
The dialog title names the parent folder, for instance _New folder in Home_. To create the folder somewhere else, cancel, navigate to the intended parent, and start again.
:::

#### Moving assets and folders {#moving-assets}

Assets and folders can be moved in 3 ways:

- By drag and drop, for a few items at a time. Drag an asset or a folder onto a folder in the list, or onto a folder of the folder tree, including <Icon name="house" /> **Home**. Hovering a folder of the tree for a moment expands it, so that you can drop items into a subfolder in one gesture. Dragging one item of a selection moves the whole selection.
- With the _Move elements to_ dialog, for many items at once (see [moving items in bulk](#bulk-move)). It is also available for a single item, as **Move to folder** in its <Icon name="dots-three" classes="ph-bold" /> actions menu.
- From the details panel of an asset, by changing its _Location_ field (see [managing individual assets](#managing-assets)).

:::note
A folder cannot be moved into itself or into one of its own subfolders. Invalid destinations are refused while you drag.
:::

:::tip
Drag and drop uses the pointer. To move items with the keyboard, use the **Move to folder** action of the <Icon name="dots-three" classes="ph-bold" /> actions menu instead.
:::

#### Renaming folders

1. Click the <Icon name="dots-three" classes="ph-bold" /> button of the folder.
2. Click <Icon name="pencil-simple" /> **Rename folder**.
3. Type the new name in the _Folder name_ field.
4. Click **Save**.

:::note
A folder name must be unique among the folders sharing the same parent.
:::

#### Deleting folders

1. Click the <Icon name="dots-three" classes="ph-bold" /> button of the folder.
2. Click <Icon name="trash" /> **Delete folder**.
3. Click **Confirm**.

:::warning
Deleting a folder also deletes everything it contains, including its subfolders and their assets. None of it can be recovered, and the confirmation dialog does not say so.
:::

Folders can also be deleted in bulk, together with assets (see [deleting items in bulk](#bulk-delete)).

### Usage with the REST API

The Media Library feature has some endpoints that can accessed through Strapi's REST API:

<CustomDocCardsWrapper>
<CustomDocCard icon="cube" title="Upload with the REST API" description="Learn how to use the Strapi's REST API to upload files through your code." link="/cms/api/rest/upload"/>
</CustomDocCardsWrapper>

### Usage with the MCP server

AI clients connected to the [Strapi MCP server](/cms/features/strapi-mcp-server) can browse the Media Library through 3 read-only tools that list assets, return a single asset, and return the folder tree (see [Media Library tools](/cms/features/strapi-mcp-server#media-library-tools)).

### Use public assets in your code {#public-assets}

Public assets are static files (e.g., images, video, CSS files, etc.) that you want to make accessible to the outside world.

Because an API may need to serve static assets, every new Strapi project includes by default a folder named `/public`. Any file located in this directory is accessible if the request's path doesn't match any other defined route and if it matches a public file name (e.g. an image named `company-logo.png` in `/public/` is accessible through `/company-logo.png` URL).

:::tip
`index.html` files are served if the request corresponds to a folder name (`/pictures` url will try to serve `public/pictures/index.html` file).
:::

:::caution
The dotfiles are not exposed. It means that every file name that starts with `.`, such as `.htaccess` or `.gitignore`, are not served.
:::
