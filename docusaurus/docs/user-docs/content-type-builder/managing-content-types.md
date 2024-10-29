---
title: Managing content-types
description: Learn how to manager your content-types in Strapi 5
tags:
- collection type
- components
- Content-type
- Content-type Builder
- single type
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'
import ScreenshotNumberReference from '/src/components/ScreenshotNumberReference.jsx';

# Managing content-types

:::note development-only
The Content-type Builder is only accessible to create and update content-types when your Strapi application is in a development environment, else it will be in a read-only mode in other environments.
:::

The Content-type Builder allows to manage any existing content-type or component, even if it is already being used in the Content Manager. They can only be managed one at a time.

To manage a content-type or a component, click on its name in the Collection types, Single types or Components category.

## Editing content-types

Managing a content-type or component can include editing the general settings and the fields, but also deleting the whole content-type or component. For any chosen content-type or component, the right side of the Content-type Builder interface displays all available editing options.

<ThemedImage
  alt="Content-type Builder's edition interface"
  sources={{
    light: '/img/assets/content-type-builder/content-types-builder_edition.png',
    dark: '/img/assets/content-type-builder/content-types-builder_edition_DARK.png',
  }}
/>

- Next to the name and optional description of the content-type or component, an <Icon name="pencil-simple" /> **Edit** button <ScreenshotNumberReference number="1" /> allows to access the [basic settings](#editing-content-type-or-component-settings) of the content-type or component.
- In the top right corner:
  - the **Add new/another field** and **Save** buttons <ScreenshotNumberReference number="2" /> allow to respectively add another field to the content-type or component (see [Configuring fields for content-types](/user-docs/content-type-builder/configuring-fields-content-type)), or save any ongoing modification.
  - the **Configure the view** button allows to access the view configuration interface (see [Configuring the edit view](/user-docs/content-manager/configuring-view-of-content-type#configuring-the-edit-view))
- Below the previous editing options, a table <ScreenshotNumberReference number="3" /> lists all the fields created and configured for the content-type or component. From the fields table, it is possible to:
  - Click on the edit button <Icon name="pencil-simple" /> to edit a field
  - Click on the delete button <Icon name="trash"/> to delete a field

:::caution
Editing a field allows renaming it. However, keep in mind that regarding the database, renaming a field means creating a whole new field and deleting the former one. Although nothing is deleted from the database, the data that was associated with the former field name will not be accessible from the admin panel of your application anymore.
:::

### Editing content-type or component settings

The settings of a content-type or component can be edited through the Content-type Builder. There are two tabs available: **Basic Settings** and **Advanced Settings**.

#### Basic settings

The **Basic Settings** tab allows to edit the following properties of the content-type or component:

<ThemedImage
  alt="Content-type Builder's basic settings"
  sources={{
    light: '/img/assets/content-type-builder/basic-settings.png',
    dark: '/img/assets/content-type-builder/basic-settings_DARK.png',
  }}
/>

* **Display name**: Name of the content-type or component as it will be displayed in the admin panel.
* **API ID (singular)**: Name of the content-type or component as it will be used in the API. It is automatically generated from the display name, but can be edited.
* **API ID (plural)**: Plural name of the content-type or component as it will be used in the API. It is automatically generated from the display name, but can be edited.
* **Type**: Type of the content-type or component. It can be either a **Collection type** or a **Single type**.

#### Advanced settings

The **Advanced Settings** tab allows to edit the following properties of the content-type or component:

<ThemedImage
  alt="Content-type Builder's advanced settings"
  sources={{
    light: '/img/assets/content-type-builder/advanced-settings.png',
    dark: '/img/assets/content-type-builder/advanced-settings_DARK.png',
  }}
/>

* **Draft & Publish**: Enable the [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content) feature for the content-type or component. It is disabled by default.
* **Internationalization**: Enable the [Internationalization](/user-docs/content-manager/translating-content) feature for the content-type or component. It is disabled by default.

<!--
* **Review workflows**: Enable the [Review Workflows](/user-docs/settings/review-workflows) <EnterpriseBadge /> feature for the content-type. It is disabled by default.
-->

## Deleting content-types

Content types and components can be deleted through the Content-type Builder. Deleting a content-type automatically deletes all entries from the Content Manager that were based on that content-type. The same goes for the deletion of a component, which is automatically deleted from every content-type or entry where it was used.

To delete a content-type or component:

1. In the Content-type Builder sub navigation, click on the name of the content-type or component to delete.
2. In the edition interface of the chosen content-type or component, click on the <Icon name="pencil-simple" /> **Edit** button on the right side of the content-type's or component's name.
3. In the edition window, click on the **Delete** button.
4. In the confirmation window, confirm the deletion.

:::caution
Deleting a content-type only deletes what was created and available from the Content-type Builder, and by extent from the admin panel of your Strapi application. All the data that was created based on that content-type is however kept in the database. For more information, please refer to the related [GitHub issue](https://github.com/strapi/strapi/issues/1114).
:::
