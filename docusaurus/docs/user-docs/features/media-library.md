---
title: Media Library
sidebar_position: 1
description: Learn to use the Media Library which allows to display and manage all assets uploaded in the application.
tags:
- admin panel
- Content-type Builder
- filters
- introduction
- media library
---

import ScreenshotNumberReference from '/src/components/ScreenshotNumberReference.jsx';

# Media Library

The Media Library is the Strapi feature that displays all assets uploaded in the Strapi application and allows users to manage them.

<ThemedImage
  alt="Media Library overview, annotated"
  sources={{
    light: '/img/assets/media-library/media-library_overview.png',
    dark: '/img/assets/media-library/media-library_overview_DARK.png',
  }}
/>

:::prerequisites Identity Card of the Feature
<Icon name="credit-card"/> **Plan:** Media Library is a free feature. <br/>
<Icon name="user"/> **Role & permission:** Minimum "Access the Media Library" permission in Roles > Plugins - Upload. <br/>
<Icon name="toggle-left"/> **Activation:** Available and activated by default. <br/>
<Icon name="laptop"/> **Environment:** Available in both Development & Production environment.
:::

## Configuration

The Media Library settings allow controlling the format, file size, and orientation of uploaded assets.

<ThemedImage
  alt="Media Library settings"
  sources={{
    light: '/img/assets/settings/settings_media-library.png',
    dark: '/img/assets/settings/settings_media-library_DARK.png',
  }}
/>

1. Go to ![Settings icon](/img/assets/icons/v5/Cog.svg) Settings > Global Settings > Media Library.
2. Define your chosen new settings:

    | Setting name   | Instructions   | Default value |
    | -------------------------- | ----------------------- |---------------|
    | Responsive friendly upload | Enabling this option will generate multiple formats (small, medium and large) of the uploaded asset. | True          |
    | Size optimization          | Enabling this option will reduce the image size and slightly reduce its quality.                     | True          |
    | Auto orientation           | Enabling this option will automatically rotate the image according to EXIF orientation tag.          | False         |

3. Click on the **Save** button.

## Usage

The Media Library displays all assets uploaded in the application, either via the Media Library itself or via the Content Manager when managing a media field. Assets uploaded to the Media Library can be inserted into content-types using the [Content Manager](/user-docs/content-manager/writing-content#filling-up-fields).

<ThemedImage
  alt="Media Library overview, annotated"
  sources={{
    light: '/img/assets/media-library/media-library_overview.png',
    dark: '/img/assets/media-library/media-library_overview_DARK.png',
  }}
/>

From the Media Library, it is possible to:

- upload a new asset (see [adding assets](/user-docs/media-library/adding-assets)) or create a new folder (see [organizing assets with folders](/user-docs/media-library/organizing-assets-with-folders)) <ScreenshotNumberReference number="1" />,
- sort the assets and folders or set filters <ScreenshotNumberReference number="2" /> to find assets and folders more easily,
- toggle between the list view ![List icon](/img/assets/icons/v5/List.svg) and the grid view ![Grid icon](/img/assets/icons/v5/GridFour.svg) to display assets, access settings ![Settings icon](/img/assets/icons/v5/Cog.svg) to [configure the view](#configuring-the-view), and make a textual search ![Search icon](/img/assets/icons/v5/Search.svg) <ScreenshotNumberReference number="3" /> to find a specific asset or folder,
- and view, navigate through, and manage folders <ScreenshotNumberReference number="4" />.

:::tip
Click the search icon ![Search icon](/img/assets/icons/v5/Search.svg) on the right side of the user interface to use a text search and find one of your assets or folders more quickly!
:::

### Filtering assets

Right above the list of folders and assets, on the left side of the interface, a ![Filter icon](/img/assets/icons/v5/Filter.svg) **Filters** button is displayed. It allows setting one or more condition-based filters, which add to one another (i.e. if you set several conditions, only the assets that match all the conditions will be displayed).

<ThemedImage
  alt="Filters"
  sources={{
    light: '/img/assets/media-library/media-library_filters.png',
    dark: '/img/assets/media-library/media-library_filters_DARK.png',
  }}
/>

To set a new filter:

1. Click on the ![Filter icon](/img/assets/icons/v5/Filter.svg) **Filters** button.
2. Click on the 1st drop-down list to choose the field on which the condition will be applied.
3. Click on the 2nd drop-down list to choose the type of condition to apply.
4. For conditions based on the type of asset to filter, click on the 3rd drop-down list and choose a file type to include or exclude. For conditions based on date and time (i.e. _createdAt_ or _updatedAt_ fields), click on the left field to select a date and click on the right field to select a time.
5. Click on the **Add filter** button.

:::note
When active, filters are displayed next to the ![Filter icon](/img/assets/icons/v5/Filter.svg) **Filters** button. They can be removed by clicking on the delete icon ![Clear icon](/img/assets/icons/v5/Cross.svg).
:::

### Sorting assets

<ThemedImage
  alt="Sort"
  sources={{
    light: '/img/assets/media-library/media-library_sort.png',
    dark: '/img/assets/media-library/media-library_sort_DARK.png',
  }}
/>

Just above the list of folders and assets and next to the ![Filter icon](/img/assets/icons/v5/Filter.svg) **Filters** button, on the left side of the interface, a drop-down button is displayed. It allows to sort the assets by upload date, alphabetical order or date of update. Click on the drop-down button and select an option in the list to automatically display the sorted assets.

### Configuring the view

Just above the list of folders and assets, on the right side of the interface, there is a group of 3 buttons. Click on ![Settings icon](/img/assets/icons/v5/Cog.svg) to configure the default view for the Media library.

<ThemedImage
  alt="Configure the view"
  sources={{
    light: '/img/assets/media-library/media-library_configure-the-view.png',
    dark: '/img/assets/media-library/media-library_configure-the-view_DARK.png',
  }}
/>

From there you can:

- Use the **Entries per page** dropdown to define the number of assets displayed by default
- Use the **Default sort order** dropdown the define the default order in which assets are displayed. This can be overriden when you [sort assets](#sorting-assets) in the Media Library.

Both settings are used as the defaults in the Media Library and in the [Content Manager media upload modal](/user-docs/content-manager/writing-content#filling-up-fields). The settings saved here are global across the entire Strapi project for all users.


### Adding assets

The Media Library displays all assets uploaded in the application, either via the [Media Library](/user-docs/media-library) or the [Content Manager](/user-docs/content-manager/writing-content.md#filling-up-fields) when managing a media field.

<ThemedImage
  alt="Add new assets window"
  sources={{
    light: '/img/assets/media-library/media-library_add-new-assets.png',
    dark: '/img/assets/media-library/media-library_add-new-assets_DARK.png',
  }}
/>

To add new assets to the media library:

1. Click the **Add new assets** button in the upper right corner of the Media Library.
2. Choose whether you want to upload the new asset from your computer or from an URL:
    - from the computer, either drag & drop the asset directly or browse files on your system,
    - from an URL, type or copy and paste an URL(s) in the _URL_ field, making sure multiple URLs are separated by carriage returns, then click **Next**.
3. (optional) Click the edit button ![Edit icon](/img/assets/icons/v5/Pencil.svg) to view asset metadata and define a _File name_, _Alternative text_ and a _Caption_ for the asset (see [editing and deleting assets](/user-docs/media-library/managing-assets.md)).
4. (optional) Add more assets by clicking **Add new assets** and going back to step 2.
5. Click on **Upload assets to the library**.

A variety of media types and extensions are supported by the Media Library:

| Media type | Supported extensions                                            |
| ---------- | --------------------------------------------------------------- |
| Image      | - JPEG<br />- PNG<br />- GIF<br />- SVG<br />- TIFF<br />- ICO<br />- DVU   |
| Video      | - MPEG<br />- MP4<br />- MOV (Quicktime)<br />- WMV<br />- AVI<br />- FLV |
| Audio      | - MP3<br />- WAV<br />- OGG                                         |
| File       | - CSV<br />- ZIP<br />- PDF<br />- XLS, XLSX<br />- JSON                |

### Managing individual assets

The Media Library allows managing assets, which includes modifying assets' file details and location, downloading and copying the link of the assets file, and deleting assets. Image files can also be cropped. To manage an asset, click on its Edit ![Edit icon](/img/assets/icons/v5/Pencil.svg) button.

#### Editing assets

Clicking on the edit ![Edit icon](/img/assets/icons/v5/Pencil.svg) button of an asset opens up a "Details" window, with all the available options.

<ThemedImage
  alt="Annotated asset details window screenshot"
  sources={{
    light: '/img/assets/media-library/media-library_asset-details.png',
    dark: '/img/assets/media-library/media-library_asset-details_DARK.png',
  }}
/>

- On the left, above the preview of the asset, control buttons <ScreenshotNumberReference number="1" /> allow performing various actions:
  - click on the delete button ![Delete icon](/img/assets/icons/v5/Trash.svg) to delete the asset,
  - click on the download button ![Download icon](/img/assets/icons/v5/Download.svg) to download the asset,
  - click on the copy link button ![Copy link icon](/img/assets/icons/v5/Link.svg) to copy the asset's link to the clipboard,
  - optionally, click on the crop button ![Copy link icon](/img/assets/icons/v5/Crop.svg) to enter cropping mode for the image (see [cropping images](#cropping-images)).
- On the right, meta data for the asset is displayed at the top of the window <ScreenshotNumberReference number="2" /> and the fields below can be used to update the _File name_, _Alternative text_, _Caption_ and _Location_ (see [organizing assets with folders](/user-docs/media-library/organizing-assets-with-folders.md)) for the asset <ScreenshotNumberReference number="3" />.
- At the bottom, the **Replace Media** button <ScreenshotNumberReference number="4" /> can be used to replace the asset file but keep the existing content of the other editable fields, and the **Finish** button is used to confirm any updates to the fields.

#### Moving assets

An individual asset can be moved to a folder when editing its details.

To move an asset:

1. Click on the edit ![Edit icon](/img/assets/icons/v5/Pencil.svg) button for the asset to be moved.
2. In the window that pops up, click the _Location_ field and choose a different folder from the drop-down list.
3. Click **Save** to confirm.

:::note
Assets can also be moved to other folders from the main view of the Media Library (see [organizing assets with folders](/user-docs/media-library/organizing-assets-with-folders.md#moving-assets-to-a-folder)). This includes the ability to move several assets simultaneously.
:::

#### Cropping images

Images can be cropped when editing the asset's details.

To crop an image:

1. Click on the edit ![Edit icon](/img/assets/icons/v5/Pencil.svg) button for the asset to be cropped.
2. In the window that pops up, click the crop button ![Crop icon](/img/assets/icons/v5/Crop.svg) to enter cropping mode.
3. Crop the image using handles in the corners to resize the frame. The frame can also be moved by drag & drop.
4. Click the crop ![Done icon](/img/assets/icons/v5/Check.svg) button to validate the new dimensions, and choose either to **crop the original asset** or to **duplicate & crop the asset** (i.e. to create a copy with the new dimensions while keeping the original asset untouched). Alternatively, click the stop cropping ![Cancel icon](/img/assets/icons/v5/Cross.svg) button to cancel and quit cropping mode.
<!-- TODO: ask devs because there seems to be a bug/unintuitive behavior:  choosing crop the original asset does not quit cropping mode 😅  -->
5. Click **Finish** to save changes to the file.

#### Deleting assets

An individual asset can be deleted when editing its details.

To delete an asset:

1. Click on the edit ![Edit icon](/img/assets/icons/v5/Pencil.svg) button for the asset to be deleted.
2. In the window that pops up, click the delete button ![Delete icon](/img/assets/icons/v5/Trash.svg) in the control buttons bar above the asset's preview.
3. Click **Confirm**.

:::tip
Assets can also be deleted individually or in bulk from the main view of the Media Library. Select assets by clicking on their checkbox in the top left corner, then click the Delete icon ![Delete icon](/img/assets/icons/v5/Trash.svg) at the top of the window, below the filters and sorting options.
:::

### Organizing assets with folders

Folders in the Media Library help you organize uploaded assets. Folders sit at the top of the Media Library view or are accessible from the Media field popup when using the [Content Manager](/user-docs/content-manager/writing-content).

From the Media Library, it is possible to view the list of folders and browse a folder's content, create new folders, edit an existing folder, move assets to a folder, and delete a folder.

:::note
Folders follow the permission system of assets (see [Users, Roles & Permissions](/user-docs/users-roles-permissions)). It is not yet possible to define specific permissions for a folder.
:::

#### Browsing folders

By default, the Media Library displays folders and assets created at the root level. Clicking a folder navigates to this folder, and displays the following elements:

- the folder title and breadcrumbs to navigate to a parent folder <ScreenshotNumberReference number="1" />
- the subfolders <ScreenshotNumberReference number="2" /> the current folder contains
- all assets <ScreenshotNumberReference number="3" /> from this folder

<ThemedImage
  alt="Media library one folder deep, with back button and updated folder title"
  sources={{
    light: '/img/assets/media-library/media-library_folder-content.png',
    dark: '/img/assets/media-library/media-library_folder-content_DARK.png',
  }}
/>

From this dedicated folder view, folders and assets can be managed, filtered, sorted and searched just like from the main Media Library (see [introduction to Media Library](/user-docs/media-library)).

To navigate back to the parent folder, one level up, use the **Back** button at the top of the interface.

:::tip
The breadcrumb navigation can also be used to go back to a parent folder: click on a folder name to directly jump to it or click on the 3 dots `/img.` and select a parent folder from the drop-down list.
:::

#### Adding folders

To create a new folder in the Media Library:

1. Click on **Add new folder** in the upper right of the Media Library interface.
2. In the window that pops up, type a name for the new folder in the _Name_ field.
3. (optional) In the _Location_ drop-down list, choose a location for the new folder. The default location is the active folder.
4. Click **Create**.

:::note
There is no limit to how deep your folders hierarchy can go, but bear in mind it might take some effort to reach a deeply nested subfolder, as the Media Library currently has no visual hierarchy indication. Searching for files using the ![Search icon](/img/assets/icons/v5/Search.svg) on the right side of the user interface might be a faster alternative to finding the asset you are looking for.
:::

#### Moving assets to a folder

Assets and folders can be moved to another folder from the root view of the Media Library or from any view for a dedicated folder.

<ThemedImage
  alt="'Move elements to' popup"
  sources={{
    light: '/img/assets/media-library/media-library_move-assets.png',
    dark: '/img/assets/media-library/media-library_move-assets_DARK.png',
  }}
/>

To bulk move assets and folders to another folder:

1. Select assets and folder to be moved, by clicking the checkbox on the left of the folder name or clicking the asset itself.
2. Click the ![Move icon](/img/assets/icons/v5/Folder.svg) **Move** button at the top of the interface.
3. In the _Move elements to_ pop-up window, select the new folder from the _Location_ drop-down list.
4. Click **Move**.

:::note
An individual asset can also be moved to a folder when [editing the asset](/user-docs/media-library/managing-assets.md).
:::

#### Editing folders

Once created, a folder can be renamed, moved or deleted. To manage a single folder:

1. In the Folders part of the Media library, hover the folder to be edited and click its edit button ![Edit icon](/img/assets/icons/v5/Pencil.svg).
2. In the window that pops up, update the name and location with the _Name_ field and _Location_ drop-down list, respectively.
3. Click **Save**.

#### Deleting folders

Deleting a folder can be done either from the list of folders of the Media Library, or when editing a single folder.

To delete a folder, from the Media Library:

1. Click the checkbox on the left of the folder name. Multiple folders can be selected.
2. Click the ![Delete icon](/img/assets/icons/v5/Trash.svg) **Delete** button above the Folders list.
3. In the _Confirmation_ dialog, click **Confirm**.

:::note
A single folder can also be deleted when editing it: hover the folder, click on its edit icon ![Edit icon](/img/assets/icons/v5/Pencil.svg), and in the window that pops up, click the **Delete folder** button and confirm the deletion.
:::
