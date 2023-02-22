---
title: Writing Content
description: Instructions to write content by filling up fields that are meant to contain specific content (e.g. text, numbers, media etc.).
sidebar_position: 3
displayed_sidebar: userDocsSidebar

---

# Writing content

In Strapi, writing content consists in filling up fields, which are meant to contain specific content (e.g. text, numbers, media etc.). These fields were configured for the collection or single type beforehand, through the [Content-type Builder](/user-docs/content-type-builder).

![Edit view to write content](/img/assets/content-manager/edit-view2.png)

## Filling up fields

To write or edit content:

1. Access the edit view of your collection or single type.
2. Write your content, following the available field schema. You can refer to the table below for more information and instructions on how to fill up each field type.

| Field name  | Instructions                                                                                                                                                                                                                                                                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text        | Write your content in the textbox.                                                                                                                                                                                                                                                                                                                                        |
| Rich text   | Write your content in the textbox. Formatting options are available in the top bar of the textbox, as well as a **Preview mode/Markdown mode** button to switch between modes. <br /><br /> 💡 The box can be expanded by clicking on **Expand** in the bottom bar. It displays side by side, at the same time, the textbox that you can edit and the preview.                |
| Number      | Write your number in the textbox. Up and down arrows, displayed on the right of the box, allow to increase or decrease the current number indicated in the textbox.                                                                                                                                                                                                       |
| Date        | 1. Click the date and/or time box. <br /> 2. Choose a date using the calendar and/or a time among the list.                                                                                                                                                                                                                                                                 |
| Boolean     | Click on **OFF** or **ON**.                                                                                                                                                                                                                                                                                                                                               |
| Relation    | Choose an entry from the drop-down list. See [Managing relational fields](/user-docs/content-manager/managing-relational-fields.md) for more information.                                                                                                                                                                                                          |
| Email       | Write a complete and valid email address.                                                                                                                                                                                                                                                                                                                                 |
| Password    | Write a password. <br /><br /> 💡 Click the eye icon, displayed on the right of the box, to show the password.                                                                                                                                                                                                                                                                |
| Enumeration | 1. Click the drop-down list. <br /> 2. Choose an entry from the list.                                                                                                                                                                                                                                                                                                       |
| Media       | 1. Click the media area. <br /> 2. Choose an asset from the [Media Library](/user-docs/media-library) or from a [folder](/user-docs/media-library/organizing-assets-with-folders.md) if you created some, or click the **Add more assets** button to add a new file to the Media Library. <br /><br /> 💡 It is possible to drag and drop the chosen file in the media area.                                                                                                                                   |
| JSON        | Write your content, in JSON format, in the code textbox.                                                                                                                                                                                                                                                                                                                  |
| UID         | Write a unique identifier in the textbox. A "Regenerate" button, displayed on the right of the box, allows to automatically generate a UID based on the content-type name.                                                                                                                                                                                                |
:::note
Filling out a [custom field](/user-docs/content-type-builder/configuring-fields-content-type.md#custom-fields) depends on the type of content handled by the field. Please refer to the dedicated documentation for each custom field hosted on the [Marketplace](https://market.strapi.io).
:::

### Components

Components are a combination of several fields, which are grouped together in the edit view. Writing their content works exactly like for independent fields, but there are some specificities to components.

There are 2 types of components: non-repeatable and repeatable components.

#### Non-repeatable components

<img src="/img/assets/content-manager/edit-view_component3.png" alt="Writing content for a component" width="80%" />
<img src="/img/assets/content-manager/edit-view_component2.png" alt="Writing content for a component" width="80%" />

Non-repeatable components are a combination of fields which can be used only once.

By default, the combination of fields are not directly displayed in the edit view:

1. Click on the add button ![Add icon](/img/assets/icons/add_circle.svg) to add the component.
2. Fill in the fields of the component.

To delete the non-repeatable component, click on the delete button ![Delete icon](/img/assets/icons/delete.svg), located on the top right corner of the component area.

#### Repeatable components

<img src="/img/assets/content-manager/edit-view_component4.png" alt="Writing content for a component" width="80%" />

Repeatable components are also a combination of fields, but they allow to create multiple component entries, all following the same combination of fields.

To add a new entry and display its combination of fields:

1. Click on the add button ![Add icon](/img/assets/icons/add_circle.svg) to add the component.
2. Fill in the fields of the component.
3. (optional) Click on the **Add new entry** button and fill in the fields again.

The repeatable component entries can be reordered or deleted directly in the edit view, using buttons displayed on the right of the entry area.

- Use the drag & drop button ![Drag icon](/img/assets/icons/drag.svg) to reorder entries of your repeatable component.
- Use the delete button ![Delete icon](/img/assets/icons/delete.svg) to delete an entry from your repeatable component.

:::note
Unlike regular fields, the order of the entries of a repeatable component is important. It should correspond exactly to how end users will read/see the content.
:::

### Dynamic zones

Dynamic zones are a combination of components, which themselves are composed of several fields. Writing the content of a dynamic zone requires additional steps in order to access the fields.

<img src="/img/assets/content-manager/edit-view_dynamic-zone-1.png" alt="Writing content for a dynamic zone" width="80%" />
<img src="/img/assets/content-manager/edit-view_dynamic-zone-2.png" alt="Writing content for a dynamic zone" width="80%" />

1. Click on the ![Add icon](/img/assets/icons/add_circle.svg) **Add a component to [dynamic zone name]** button.
2. Choose a component available for the dynamic zone.
3. Fill in the fields of the component.

Dynamic zones' components can also be reordered or deleted directly in the edit view, using buttons displayed in the top right corner of the component area.

- Use the drag & drop button ![Drag icon](/img/assets/icons/drag.svg) to reorder components in your dynamic zone.
- Use the delete button ![Delete icon](/img/assets/icons/delete.svg) to delete a component from your dynamic zone.

:::tip
You can also use the keyboard to reorder components: focus the component using Tab, press Space on the drag & drop button ![Drag icon](/img/assets/icons/drag.svg) and use the arrow keys to then re-order, pressing Space again to drop the item.
:::

:::note
Unlike regular fields, the order of the fields and components inside a dynamic field is important. It should correspond exactly to how end users will read/see the content.
:::
