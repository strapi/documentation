---
title: Adding assets to the Media Library - Strapi User Guide
description:
canonicalUrl:
---

<!-- TODO: update SEO -->

# Organizing assets with folders

Folders in the [Media Library](/user-docs/latest/media-library/introduction-to-media-library.md) help you organize uploaded assets. Folders sit at the top of the Media Library view or are accessible from the Media field popup when using the Content Manager.

![🏞 screenshot - Media library with folders highlighted]()

From the Media Library, it is possible to:

- view the list of folders and [browse](#browsing-folders) a folder's content
- [create new folders](#adding-folders)
- [edit an existing folder](#editing-folders)
- [move assets to a folder](#moving-assets-to-a-folder)
- [delete a folder](#deleting-folders)

## Browsing folders

By default, the Media Library displays folders and assets created at the root level. Double-clicking a folder navigates to this folder. The interface is refreshed with the folder's content and displays:

- the folder title (1)
- the number of subfolders and assets contained (2)
- the subfolders (3) the current folder contains
- all assets (4) from this folder

![🏞 screenshot - Media library one folder deep, with back button and updated folder title]()

From this dedicated folder view, folders and assets can be managed, filtered, sorted and searched just like from the main Media Library (see [introduction to Media Library](/user-docs/latest/media-library/introduction-to-media-library.md)).

To navigate back to the parent folder, one level up, use the **Back** button at the top of the interface.
<!-- ? how does it work when you go deeper into the folder hierarchy? do you go back up one-level or back to the ML root? -->

## Adding folders

![🏞 screenshot - Add new folder popup]()

To create a new folder in the Media Library:

1. Click on **Add new folder** in the upper right of the Media Library interface.
<!-- ? how should I write the name of the popup? should I use the word 'popup'? -->
2. In the "Add new folder" popup, type a name for the new folder in the _Folder name_ field.
3. (optional) In the _Folder location_ drop-down list, choose a location for the new folder. The default location is the root of the Media library.
4. Click **Save**.

::: note
There is no limit to how deep your folders hierarchy can go, but bear in mind it might take some effort to reach a deeply nested folder, as the Media Library currently has no visual hierarchy indication. Searching for files using the ![Search icon](../assets/icons/search.svg) on the right side of the user interface might be a faster alternative to finding the asset you are looking for.
:::

## Moving assets to a folder

Assets and folders can be moved to another folder from the root view of the Media Library or from any view for a dedicated folder.

![🏞 screenshot - "Move elements to" popup]()

To move assets and folders to another folder:

1. Select assets and folder to be moved, by clicking the checkbox on the left of the folder name or clicking the asset itself.
2. Click the blue **Move** button at the top of the interface.
<!-- ? how should I write the name of the popup? should I use the word 'popup'? -->
3. In the "Move elements to" popup, select the _Folder location_ where to move items to.
4. Click **Confirm**.

## Editing folders

Once created, a folder can be renamed, moved or [deleted](#deleting-folders). To manage a single folder:

1. Click the folder name in the Folders view of the Media library.
2. In the "Edit folder" popup, update the name and location with the _Folder name_ field and _Folder location_ drop-down list, respectively.
3. Click **Save** to save the changes and see them reflected in the Media Library interface.

::: tip
From the "Edit folder" popup, you can also delete a single folder by clicking the **Delete folder** button.
:::

## Deleting folders

Deleting a folder can be done either from the list of folders of the Media Library, or when editing a single folder.

To delete a folder, from the Media Library:

1. Click the checkbox on the left of the folder name. Multiple folders can be selected.
2. Click the **Delete** button above the Folders list.
<!-- ? when should I use the 'dialog' or 'popup' wording? -->
3. In the _Confirmation_ dialog, click **Confirm**.

A single folder can also be deleted from the "Edit folder" popup: click on a folder name to open the "Edit folder" popup, then click the **Delete folder** button, and confirm the deletion.
