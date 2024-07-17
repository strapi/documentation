---
title: Organizing assets with folders
displayed_sidebar: userDocsSidebar
description: Instructions on how to use folders in the Media Library, including adding, editing, and deleting folders, and browsing their content.

---
import ScreenshotNumberReference from '/src/components/ScreenshotNumberReference.jsx';

# Organizing assets with folders

Folders in the Media Library help you organize uploaded assets. Folders sit at the top of the Media Library view or are accessible from the Media field popup when using the [Content Manager](/user-docs/content-manager/writing-content).

From the Media Library, it is possible to view the list of folders and browse a folder's content, create new folders, edit an existing folder, move assets to a folder, and delete a folder.

:::note
Folders follow the permission system of assets (see [Users, Roles & Permissions](/user-docs/users-roles-permissions)). It is not yet possible to define specific permissions for a folder.
:::

## Browsing folders

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

## Adding folders

To create a new folder in the Media Library:

1. Click on **Add new folder** in the upper right of the Media Library interface.
2. In the window that pops up, type a name for the new folder in the _Name_ field.
3. (optional) In the _Location_ drop-down list, choose a location for the new folder. The default location is the active folder.
4. Click **Create**.

:::note
There is no limit to how deep your folders hierarchy can go, but bear in mind it might take some effort to reach a deeply nested subfolder, as the Media Library currently has no visual hierarchy indication. Searching for files using the ![Search icon](/img/assets/icons/search.svg) on the right side of the user interface might be a faster alternative to finding the asset you are looking for.
:::

## Moving assets to a folder

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
2. Click the ![Move icon](/img/assets/icons/move.svg) **Move** button at the top of the interface.
3. In the _Move elements to_ pop-up window, select the new folder from the _Location_ drop-down list.
4. Click **Move**.

:::note
An individual asset can also be moved to a folder when [editing the asset](/user-docs/media-library/managing-assets.md).
:::

## Editing folders

Once created, a folder can be renamed, moved or deleted. To manage a single folder:

1. In the Folders part of the Media library, hover the folder to be edited and click its edit button ![Edit icon](/img/assets/icons/edit.svg).
2. In the window that pops up, update the name and location with the _Name_ field and _Location_ drop-down list, respectively.
3. Click **Save**.

## Deleting folders

Deleting a folder can be done either from the list of folders of the Media Library, or when editing a single folder.

To delete a folder, from the Media Library:

1. Click the checkbox on the left of the folder name. Multiple folders can be selected.
2. Click the ![Delete icon](/img/assets/icons/delete.svg) **Delete** button above the Folders list.
3. In the _Confirmation_ dialog, click **Confirm**.

:::note
A single folder can also be deleted when editing it: hover the folder, click on its edit icon ![Edit icon](/img/assets/icons/edit.svg), and in the window that pops up, click the **Delete folder** button and confirm the deletion.
:::
