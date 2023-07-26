---
title: Introduction to the Media Library
slug: /user-docs/media-library
sidebar_position: 1
description: Introduction to the Media Library which allows to display and manage all assets uploaded in the application.

---

# Introduction to the Media Library

The Media Library is a Strapi plugin that is always activated by default and cannot be deactivated. It is accessible both when the application is in a development and production environment.

Administrators can access the Media Library from ![ML icon](/img/assets/icons/media_library.svg) _Media Library_ in the main navigation of the admin panel.

<ThemedImage
  alt="Media Library overview, annotated"
  sources={{
    light: '/img/assets/media-library/media-library_overview.png',
    dark: '/img/assets/media-library/media-library_overview_DARK.png',
  }}
/>

The Media Library displays all assets uploaded in the application, either via the Media Library itself or via the Content Manager when managing a media field. Assets uploaded to the Media Library can be inserted into content-types using the [Content Manager](/user-docs/content-manager/writing-content#filling-up-fields).

From the Media Library, it is possible to:

- upload a new asset (see [adding assets](/user-docs/media-library/adding-assets)) or create a new folder (see [organizing assets with folders](/user-docs/media-library/organizing-assets-with-folders)) (1),
- sort the assets and folders or set filters (2) to find assets and folders more easily,
- toggle between the list view ![List icon](/img/assets/icons/list_view.svg) and the grid view ![Grid icon](/img/assets/icons/grid_view.svg) to display assets, access settings ![Settings icon](/img/assets/icons/settings.svg) to [configure the view](#configuring-the-view), and make a textual search ![Search icon](/img/assets/icons/search.svg) (3) to find a specific asset or folder,
- and view, navigate through, and manage folders (4).

:::tip
Click the search icon ![Search icon](/img/assets/icons/search.svg) on the right side of the user interface to use a text search and find one of your assets or folders more quickly!
:::

## Filtering assets

Right above the list of folders and assets, on the left side of the interface, a **Filters** button is displayed. It allows setting one or more condition-based filters, which add to one another (i.e. if you set several conditions, only the assets that match all the conditions will be displayed).

<ThemedImage
  alt="Filters"
  sources={{
    light: '/img/assets/media-library/media-library_filters.png',
    dark: '/img/assets/media-library/media-library_filters_DARK.png',
  }}
/>

To set a new filter:

1. Click on the **Filters** button.
2. Click on the 1st drop-down list to choose the field on which the condition will be applied.
3. Click on the 2nd drop-down list to choose the type of condition to apply.
4. For conditions based on the type of asset to filter, click on the 3rd drop-down list and choose a file type to include or exclude. For conditions based on date and time (i.e. _createdAt_ or _updatedAt_ fields), click on the left field to select a date and click on the right field to select a time.
5. Click on the **Add filter** button.

:::note
When active, filters are displayed next to the **Filters** button. They can be removed by clicking on the delete icon ![Clear icon](/img/assets/icons/clear.svg).
:::

## Sorting assets

<ThemedImage
  alt="Sort"
  sources={{
    light: '/img/assets/media-library/media-library_sort.png',
    dark: '/img/assets/media-library/media-library_sort_DARK.png',
  }}
/>

Just above the list of folders and assets, on the left side of the interface, a **Sort by** button is displayed. It allows to display assets by upload date, alphabetical order or date of update. Click on the button and select an option in the list to automatically display the sorted assets.

## Configuring the view

Just above the list of folders and assets, on the right side of the interface, there is a group of 3 buttons. Click on the middle one ![Settings icon](/img/assets/icons/settings.svg) to configure the default view for the Media library.

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
