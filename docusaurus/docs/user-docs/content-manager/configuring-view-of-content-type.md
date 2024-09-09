---
title: Configuring views of a content-type
description: Instructions to configure the edit view and list view of a content-type in a Strapi application.
sidebar_position: 2
tags:
- Content Manager
- Content-type 
- Content-type views
- Content-type list view
- Content-type edit view
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# Configuring the views of a content-type

<NotV5/>

Depending on their type, content-types can be divided into 2 interfaces: the list view and the edit view. Both interfaces can be configured.

## Configuring the list view

On the right side of the list view interface, right above the table, a settings button ![Cog icon](/img/assets/icons/v5/Cog.svg) is displayed. It allows to access the configurations that can be set for the list view of your collection type, and to choose which fields to display in the table.

:::note
The configurations only apply to the list view of the collection type from which the settings are accessed (i.e. disabling the filters or search options for a collection type will not automatically also disable these same options for all other collection types).
<br />

Note also that the explanations below explain how to permanently configure which fields are displayed in the table of the list view of your collection type. It is also possible to configure the displayed fields temporarily (see [Introduction to Content Manager](/user-docs/content-manager)).
:::

<ThemedImage
  alt="Settings of a list view in the Content Manager"
  sources={{
    light: '/img/assets/content-manager/content-manager_settings-list-view.png',
    dark: '/img/assets/content-manager/content-manager_settings-list-view_DARK.png',
  }}
/>

### List view settings

1. In the list view of your collection type, click on the settings button ![Cog icon](/img/assets/icons/v5/Cog.svg) then ![List + icon](/img/assets/icons/v5/ListPlus.svg) **Configure the view** to be redirected to the list view configuration interface.
2. In the Settings area, define your chosen new settings:

| Setting name           | Instructions                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| Enable search          | Click on **TRUE** or **FALSE** to able or disable the search.                                          |
| Enable filters         | Click on **TRUE** or **FALSE** to able or disable filters.                                             |
| Enable bulk actions    | Click on **TRUE** or **FALSE** to able or disable the multiple selection boxes in the list view table. |
| Entries per page       | Choose among the drop-down list the number of entries per page.                                    |
| Default sort attribute | Choose the sorting field that will be used by default.                                             |
| Default sort order     | Choose the sorting type that will be applied by default.                                           |

3. Click on the **Save** button.

### List view display

1. In the list view of your collection type, click on the settings button ![Cog icon](/img/assets/icons/v5/Cog.svg) then ![List + icon](/img/assets/icons/v5/ListPlus.svg) **Configure the view** to be redirected to the list view configuration interface.
2. In the View area, define what fields to display in the list view table, and in what order:
   - Click the add button ![Add icon](/img/assets/icons/v5/Plus.svg) to add a new field.
   - Click the delete button ![Clear icon](/img/assets/icons/v5/Cross.svg) to remove a field.
   - Click the reorder button ![Drag icon](/img/assets/icons/v5/Drag.svg) and drag and drop it to the place you want it to be displayed among the other fields.
3. Click the edit button ![Edit icon](/img/assets/icons/v5/Pencil.svg) to access its available own settings:

| Setting name              | Instructions                                                              |
| ------------------------- | ------------------------------------------------------------------------- |
| Label                     | Write the label to be used for the field in the list view table.          |
| Enable sort on this field | Click on **TRUE** or **FALSE** to able or disable the sort on the field.  |

4. Click on the **Save** button.

:::note
Relational fields can also be displayed in the list view. There are however some specificities to keep in mind:

- Only one field can be displayed per relational field.
- Only first-level fields can be displayed (i.e. fields from the relation of a relation can't be displayed).
- If the displayed field contains more than one value, not all its values will be displayed, but a counter indicating the number of values. You can hover this counter to see a tooltip indicating the first 10 values of the relational field.

Note also that relational fields have a couple limitations when it comes to sorting options:

- Sorting cannot be enabled for relational fields which display several fields.
- Relational fields cannot be set as default sort.
:::

## Configuring the edit view

In the edit view of a content-type, a ![More icon](/img/assets/icons/v5/More.svg) button is displayed, which leads to the ![List + icon](/img/assets/icons/v5/ListPlus.svg) **Configure the view** button. It allows to access the configurations that can be set for the edit view of the content-type, such as the entry title, and the display of the fields of the content-type, including the relational ones.

<ThemedImage
  alt="Configuring the edit view of the Content Manager"
  sources={{
    light: '/img/assets/content-manager/edit-view-config2.png',
    dark: '/img/assets/content-manager/edit-view-config2_DARK.png',
  }}
/>

### Edit view settings

1. In the edit view of your content-type, click on the ![More icon](/img/assets/icons/v5/More.svg) button then ![List + icon](/img/assets/icons/v5/ListPlus.svg) **Configure the view**.
2. In the Settings area, define your chosen new settings:

| Setting name    | Instructions                                                                          |
| --------------- | ------------------------------------------------------------------------------------- |
| Entry title     | Choose among the drop-down list the field that should be used as title for the entry. |

3. Click on the **Save** button.

### Edit view display

1. In the edit view of your content-type, click on the ![More icon](/img/assets/icons/v5/More.svg) button then ![List + icon](/img/assets/icons/v5/ListPlus.svg) **Configure the view**.
2. In the View area, define what fields (including relational fields) to display in the list view table, in what order and what size:
   - Click the ![Add icon](/img/assets/icons/v5/Plus.svg) **Insert another field** button to add a new field.
   - Click the delete button ![Clear icon](/img/assets/icons/v5/Cross.svg) to remove a field.
   - Click the reorder button ![Drag icon](/img/assets/icons/v5/Drag.svg) and drag and drop it to the place you want it to be displayed among the other fields.
3. Click the edit button ![Edit icon](/img/assets/icons/v5/Pencil.svg) of a field to access its available settings:

| Setting name    | Instructions                                                                              |
| --------------- | ----------------------------------------------------------------------------------------- |
| Label           | Write the label that should be used for the field.                                        |
| Description     | Write a description for the field, to help other administrators fill it properly.         |
| Placeholder     | Write the placeholder that should be displayed by default in the field.                   |
| Editable field  | Click on **TRUE** or **FALSE** to able or disable the edition of the field by administrators. |
| Size            | Select the size in which the field should be displayed in the Content Manager. Note that this setting is neither available for JSON and Rich Text fields, nor dynamic zones and components. |
| Entry title     | *(relational fields only)* Write the entry title that should be used for the relational field. It is recommended to choose well the entry title of relational fields as the more comprehensive it is, the easier it will be for administrators to manage the content of relational fields from the edit view. |

4. Click on the **Save** button.

:::caution
The settings and display of a component's fields cannot be managed and reordered through the entry's edit view configuration page. Click on the **Set the component's layout** button of a component to access the component's own configuration page. You will find the exact same settings and display options as for the entry, but that will specifically apply to your component.

Note also that the settings are defined for the component itself, which means that the settings will automatically be applied for every other content-type where the component is used.
:::
