---
title: Introduction to the Media Library - Strapi User Guide
description:
canonicalUrl:
---

<!-- TODO: update SEO -->

# Introduction to the Media Library

The Media Library is a Strapi plugin that is always activated by default and cannot be deactivated. It is accessible both when the application is in a development and production environment.

Administrators can access the Media Library from ![ML icon](../assets/icons/media_library.svg) _Media Library_ in the main navigation of the admin panel.

![🏞 screenshot - Media Library overview, annotated]()

The Media Library displays all assets uploaded in the application, either via the Media Library itself or via the Content Manager when managing a media field. Assets uploaded to the Media Library can be inserted into content-types using the [Content Manager](/user-docs/latest/content-manager/writing-content.md#filling-up-fields).

From the Media Library, it is possible to:

- upload a new asset (1) (see [adding assets](/user-docs/latest/media-library/adding-assets.md)),
- create a new folder (2) (see [organizing assets with folders](/user-docs/latest/media-library/organizing-assets-with-folders.md)),
- [sort the assets](#sorting-assets) and folders (3) or [set filters](#filtering-assets) (4) to find assets more easily,
- make a textual search (5) to find a specific asset or folder,
- view, navigate through, and manage [folders](/user-docs/latest/media-library/organizing-assets-with-folders.md) (6),
- view the list of available assets (7),
- select how many assets to display per page (8), and browse other pages of assets (9).

<!-- TODO: use in details block or re-move to intro -->
::: details Supported file types for Media Library assets
A variety of media types and extensions are supported by the Media Library:

<!-- ? is this list complete & up-to-date ? -->

| Media type | Supported extensions                                          |
|------------|---------------------------------------------------------------|
| Image      | - JPEG<br>- PNG<br>- GIF<br>- SVG<br>- TIFF<br>- ICO<br>- DVU |
| Video      | - MPEG<br>- MP4<br>- MOV (Quicktime)<br>- WMV<br>- AVI<br>- FLV     |
| Audio      | - MP3<br>- WAV<br>- OGG                                       |
| File       | - CSV<br>- ZIP<br>- PDF<br>- XLS, XLSX<br>- JSON                  |
:::

::: tip
Click the search icon ![Search icon](../assets/icons/search.svg) on the right side of the user interface to use a text search and find one of your assets more quickly!
:::

## Sorting assets

Right above the list of folders and assets, on the left side of the interface, a **Sort by** drop-down list is diplayed. It allows to display assets by upload date, alphabetical order or date of update. Click on the drop-down list and select an option in the list to automatically display the sorted assets.

## Filtering assets

Right above the list of folders and assets, on the left side of the interface, a **Filters** button is displayed. It allows to set one or more condition-based filters, which add to one another (i.e. if you set several conditions, only the assets that match all the conditions will be displayed).

<!-- TODO: improve/replace screenshot -->
![Filters in the Media Library](../assets/media-library/media-library_filters.png)

To set a new filter:

1. Click on the **Filters** button.
2. Click on the 1st drop-down list to choose the field on which the condition will be applied.
3. Click on the 2nd drop-down list to choose the type of condition to apply.
4. For conditions based on the type of asset to filter, click on the 3rd drop-down list and choose a file type to include or exclude. For conditions based on date and time (i.e. _createdAt_ or _updatedAt_ fields), click on the left field to select a date and click on the right field to select a time.
5. Click on the **Add filter** button.

::: note
When active, filters are displayed next to the **Filters** button. They can be removed by clicking on the delete icon ![Clear icon](../assets/icons/clear.svg).
:::
