---
title: Introduction to the Content Manager
sidebar_position: 1
displayed_sidebar: userDocsSidebar
slug: /user-docs/content-manager
description: Introduction to the Content Manager which allows to write content for collection types and single types.
pagination_next: user-docs/content-manager/configuring-view-of-content-type
tags:
- Content Manager
- Content-type Builder
- collection type
- single type
- introduction
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'
import ScreenshotNumberReference from '/src/components/ScreenshotNumberReference.jsx';

# Introduction to the Content Manager

<NotV5 />

The Content Manager is a core feature of Strapi. It is always enabled by default and cannot be disabled. It is accessible both when the application is in a development and production environment.

The Content Manager is accessible from ![Content icon](/img/assets/icons/v5/Feather.svg) *Content Manager* in the main navigation, which opens a sub navigation displaying 2 categories: _Collection types_ and _Single types_. Each category contains the available collection and single content-types which were created beforehand using the [Content-type Builder](/user-docs/content-type-builder/introduction-to-content-types-builder.md). From these 2 categories, administrators can create, manage, and publish content.

:::tip
Click the search icon ![Search icon](/img/assets/icons/v5/Search.svg) in the sub navigation to use a text search and find one of your content-types more quickly!
:::

## Collection types

The _Collection types_ category of the Content Manager displays the list of available collection types which are accessible from the ![Content icon](/img/assets/icons/v5/Feather.svg) Content Manager sub navigation.

For each available collection type multiple entries can be created which is why each collection type is divided into 2 interfaces: the list view and the edit view (see [Writing content](writing-content.md)).

The list view of a collection type displays all entries created for that collection type.

<ThemedImage
  alt="List view of a collection type in the Content Manager"
  sources={{
    light: '/img/assets/content-manager/content-manager_list-view.png',
    dark: '/img/assets/content-manager/content-manager_list-view_DARK.png',
  }}
/>

From the list view, it is possible to:

- create a new entry <ScreenshotNumberReference number="1" />,
- make a textual search <ScreenshotNumberReference number="2" /> or set filters <ScreenshotNumberReference number="3" /> to find specific entries,
- if [Internationalization (i18n)](/user-docs/plugins/strapi-plugins#-internationalization-plugin) is enabled, filter by locale to display only the entries [translated](/user-docs/content-manager/translating-content) in a chosen locale <ScreenshotNumberReference number="4" />,
- configure the fields displayed in the table of the list view <ScreenshotNumberReference number="5" />,
- if [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content) is enabled, see the status of each entry <ScreenshotNumberReference number="6" />,
- perform actions on a specific entry by clicking on ![More icon](/img/assets/icons/v5/More.svg) <ScreenshotNumberReference number="7" /> at the end of the line:
  - edit ![Edit icon](/img/assets/icons/v5/Pencil.svg) (see [Writing content](/user-docs/content-manager/writing-content.md)), duplicate ![Duplicate icon](/img/assets/icons/v5/Duplicate.svg), or delete ![Delete icon](/img/assets/icons/v5/Trash.svg) (see [Deleting content](/user-docs/content-manager/saving-and-publishing-content.md#deleting-content)) the entry,
  - if [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content) is enabled, ![Unpublish icon](/img/assets/icons/v5/CrossCircle.svg) unpublish the entry, ![Unpublish icon](/img/assets/icons/v5/CrossCircle.svg) or discard its changes,
  - if [Internationalization (i18n)](/user-docs/plugins/strapi-plugins#-internationalization-plugin) is enabled, ![Delete locale icon](/img/assets/icons/delete-locale.svg) delete a given locale,
- select multiple entries to simultaneously [publish, unpublish](/user-docs/content-manager/saving-and-publishing-content#bulk-publish-and-unpublish-), or [delete](/user-docs/content-manager/saving-and-publishing-content.md#deleting-content).

:::tip
Sorting can be enabled for most fields displayed in the list view table (see [Configuring the views of a content-type](../content-manager/configuring-view-of-content-type.md)). Click on a field name, in the header of the table, to sort on that field.
:::

### Filtering entries

Right above the list view table, on the left side of the interface, a **Filters** button is displayed. It allows to set one or more condition-based filters, which add to one another (i.e. if you set several conditions, only the entries that match all the conditions will be displayed).

<ThemedImage
  alt="Filters in the Content Manager"
  sources={{
    light: '/img/assets/content-manager/content-manager_filters2.png',
    dark: '/img/assets/content-manager/content-manager_filters2_DARK.png',
  }}
/>

To set a new filter:

1. Click on the **Filters** button.
2. Click on the 1st drop-down list to choose the field on which the condition will be applied.
3. Click on the 2nd drop-down list to choose the type of condition to apply.
4. Enter the value(s) of the condition in the remaining textbox.
5. Click on the **Add filter** button.

:::note
When active, filters are displayed next to the **Filters** button. They can be removed by clicking on the delete icon ![Clear icon](/img/assets/icons/clear.svg).
:::

### Creating a new entry

On the top right side of the list view interface, an **Add new entry** button is displayed. It allows to create a new entry for your collection type.

Clicking on the new entry button will redirect you to the edit view, where you will be able to write the content of the new entry (see [Writing content](writing-content.md)).

:::note
New entries are only considered created once some of their content has been written and saved once. Only then will the new entry be listed in the list view.
:::

### Configuring the table fields

Above the list view table, on the right, a settings button ![Cog icon](/img/assets/icons/v5/Cog.svg) is displayed. It allows to temporarily choose which fields to display in the table or to access permanent view settings.

:::note
Configuring the displayed field of the table in the way detailed below is only temporary: the configurations will be reset as soon as the page is refreshed or when navigating outside the Content Manager. For permanent configurations, go to the list view configuration interface by clicking on the settings button ![Cog icon](/img/assets/icons/v5/Cog.svg) and clicking on the **Configure the view** button (see [Configuring the views of a content-type](../content-manager/configuring-view-of-content-type.md)).
:::

<ThemedImage
  alt="Displayed fields in the settings of a list view in the Content Manager"
  sources={{
    light: '/img/assets/content-manager/content-manager_displayed-fields.png',
    dark: '/img/assets/content-manager/content-manager_displayed-fields_DARK.png',
  }}
/>

To temporarily configure the fields displayed in the table:

1. Click on the settings button ![Cog icon](/img/assets/icons/v5/Cog.svg).
2. Tick the boxes associated with the field you want to be displayed in the table.
3. Untick the boxes associated with the fields you do not want to be displayed in the table.

:::tip
Relational fields can also be displayed in the list view. Please refer to [Configuring the views of a content-type](../content-manager/configuring-view-of-content-type.md) for more information on their specificities.
:::

## Single types

The _Single types_ category of the Content Manager displays the list of available single types, which are accessible from the ![Content icon](/img/assets/icons/v5/Feather.svg) Content Manager sub navigation.

Unlike collection types which have multiple entries, single types are not created for multiple uses. In other words, there can only be one default entry per available single type. There is therefore no list view in the Single types category.

Clicking on a single type will directly redirect you to the edit view, where you will be able to write the content of your single type (see [Writing content](writing-content.md)).

<ThemedImage
  alt="Single type in the Content Manager"
  sources={{
    light: '/img/assets/content-manager/content-manager_single-type.png',
    dark: '/img/assets/content-manager/content-manager_single-type_DARK.png',
  }}
/>
