---
title: Content Manager
description: Learn to use the Content Manager.
toc_max_heading_level: 4
tags:
- admin panel
- content manager
- list view
- edit view
- component
- dynamic zone
- relational field
---

import ScreenshotNumberReference from '/src/components/ScreenshotNumberReference.jsx';

# Content Manager

From the <Icon name="feather" /> Content Manager, accessible via the main navigation of the admin panel, users can write and manage their content.

:::prerequisites Identity Card of the Content Manager
<Icon name="user"/> **Role & permission:** Minimum "Configure view" permissions in Roles > Plugins - Content Manager. <br/>
<Icon name="laptop"/> **Environment:** Available in both Development & Production environment.
:::

## Overview

<!--
<ThemedImage
alt="Content Manager"
sources={{
    light: '/img/assets/content-manager-guideflow2.gif',
    dark: '/img/assets/content-manager-guideflow2.gif',
  }}
/>
-->

<!-- TODO: create dark mode version and replace the darkId value -->
<Guideflow lightId="zpen5g4t8p" darkId="9r22q12szr" />

The <Icon name="feather" /> Content Manager contains the available collection and single content-types which were created beforehand using the [Content-type Builder](/cms/features/content-type-builder).

Content can be created, managed and published from the 2 categories displayed in the sub navigation of the <Icon name="feather" /> Content Manager:

- *Collection types*, which lists available content-types managing several entries. For each available collection type, multiple entries can be created, which is why each collection type is divided into 2 interfaces:
  - the list view, which displays a table with all entries created for that collection type.
  - the edit view, which focuses on a chosen entry of your collection type, and from where you can actually manage the content.

- *Single types*, which lists available content-types with only one entry. Unlike collection types, which have multiple entries, single types are not created for multiple uses. In other words, there can only be one default entry per available single type. There is therefore no list view in the Single types category.

:::tip
Click the search icons <Icon name="magnifying-glass" classes="ph-bold" /> to use a text search and find one of your content-types and/or entries more quickly!

Specifically for your collection types' entries, you can also use the <Icon name="funnel-simple" classes="ph-bold" /> **Filters** button to set condition-based filters, which add to one another (i.e., if you set several conditions, only the entries that match all the conditions will be displayed).
:::

<!-- TO INTEGRATE IN THE PAGE? USE A GUIDEFLOW?

From the list view, it is possible to:

- create a new entry <ScreenshotNumberReference number="1" />,
- make a textual search <ScreenshotNumberReference number="2" /> or set filters <ScreenshotNumberReference number="3" /> to find specific entries,
- if [Internationalization (i18n)](/cms/plugins/strapi-plugins#i18n) is enabled, filter by locale to display only the entries [translated](/cms/features/internationalization) in a chosen locale <ScreenshotNumberReference number="4" />,
- configure the fields displayed in the table of the list view <ScreenshotNumberReference number="5" />,
- if [Draft & Publish](/cms/features/draft-and-publish) is enabled, see the status of each entry <ScreenshotNumberReference number="6" />,
- perform actions on a specific entry by clicking on <Icon name="dots-three-outline" /> <ScreenshotNumberReference number="7" /> at the end of the row:
  - edit ![Edit icon](/img/assets/icons/v5/Pencil.svg) (see [Writing content](/cms/features/content-manager/writing-content.md)), duplicate ![Duplicate icon](/img/assets/icons/v5/Duplicate.svg), or delete <Icon name="trash"/> (see [Deleting content](/cms/features/draft-and-publish#deleting-content)) the entry,
  - if [Draft & Publish](/cms/features/draft-and-publish) is enabled, ![Unpublish icon](/img/assets/icons/v5/CrossCircle.svg) unpublish the entry, ![Unpublish icon](/img/assets/icons/v5/CrossCircle.svg) or discard its changes,
  - if [Internationalization (i18n)](/cms/plugins/strapi-plugins#i18n) is enabled, ![Delete locale icon](/img/assets/icons/v5/delete-locale.svg) delete a given locale,
- select multiple entries to simultaneously [publish, unpublish](/cms/features/draft-and-publish#bulk-publishing-and-unpublishing), or [delete](/cms/features/draft-and-publish#deleting-content).

:::tip
Sorting can be enabled for most fields displayed in the list view table (see [Configuring the views of a content-type](../content-manager/configuring-view-of-content-type.md)). Click on a field name, in the header of the table, to sort on that field.
:::
-->

<!-- WON'T BE INTEGRATED - TO BE VALIDATED

#### Filtering entries {#filtering-entries}

Right above the list view table, on the left side of the interface, a <Icon name="funnel-simple" classes="ph-bold" /> **Filters** button is displayed. It allows to set one or more condition-based filters, which add to one another (i.e. if you set several conditions, only the entries that match all the conditions will be displayed).

<ThemedImage
  alt="Filters in the Content Manager"
  sources={{
    light: '/img/assets/content-manager/content-manager_filters2.png',
    dark: '/img/assets/content-manager/content-manager_filters2_DARK.png',
  }}
/>

To set a new filter:

1. Click on the <Icon name="funnel-simple" classes="ph-bold" /> **Filters** button.
2. Click on the 1st drop-down list to choose the field on which the condition will be applied.
3. Click on the 2nd drop-down list to choose the type of condition to apply.
4. Enter the value(s) of the condition in the remaining textbox.
5. Click on the **Add filter** button.

:::note
When active, filters are displayed next to the <Icon name="funnel-simple" classes="ph-bold" /> **Filters** button. They can be removed by clicking on the delete icon <Icon name="x" />.
:::
-->

## Configuration

Both the list view and the edit view can be configured, and the former can either be configured temporarily or permanently.

### Configuring the list view

<br/>

#### Temporary configuration

By configuring temporarily the list view, the configurations will be reset as soon as the page is refreshed or when navigating outside the Content Manager. This configuration allows to temporarily choose which fields to display in the list view's table.

1. Click on the settings button <Icon name="gear-six" />.
2. Tick the boxes associated with the field you want to be displayed in the table.
3. Untick the boxes associated with the fields you do not want to be displayed in the table.

<!-- MAY BE REMOVED - NOT SURE ABOUT RELEVANCE

:::tip
Relational fields can also be displayed in the list view. Please refer to [Configuring the views of a content-type](../content-manager/configuring-view-of-content-type.md) for more information on their specificities.
:::
-->

<ThemedImage
  alt="Displayed fields in the settings of a list view in the Content Manager"
  sources={{
    light: '/img/assets/content-manager/content-manager_displayed-fields.png',
    dark: '/img/assets/content-manager/content-manager_displayed-fields_DARK.png',
  }}
/>

#### Permanent & advanced configuration

By configuring permanently the list view, you not only ensure that they are not reset at every page refresh or navigation, but you also have access to more options (e.g., enablement/disablement of search, filters and bulk actions, reordering of the list view table's fields etc.).

:::note
The configurations only apply to the list view of the collection type from which the settings are accessed (i.e., disabling the filters or search options for a collection type will not automatically also disable these same options for all other collection types).
:::

<ThemedImage
  alt="Settings of a list view in the Content Manager"
  sources={{
    light: '/img/assets/content-manager/content-manager_settings-list-view.png',
    dark: '/img/assets/content-manager/content-manager_settings-list-view_DARK.png',
  }}
/>

<Tabs groupId="ListViewConfig">

<TabItem value="ListViewSettings" label="Settings">

1. In the list view of your collection type, click on the settings button <Icon name="gear-six" /> then <Icon name="list-plus" classes="ph-bold" /> **Configure the view** to be redirected to the list view configuration interface.
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

</TabItem>

<TabItem value="ListViewDisplay" label="View">

1. In the list view of your collection type, click on the settings button <Icon name="gear-six" /> then <Icon name="list-plus" classes="ph-bold" /> **Configure the view** to be redirected to the list view configuration interface.
2. In the View area, define what fields to display in the list view table, and in what order:
   - Click the add button ![Add icon](/img/assets/icons/v5/Plus.svg) to add a new field.
   - Click the delete button <Icon name="x" /> to remove a field.
   - Click the reorder button <Icon name="dots-six-vertical" classes="ph-bold" /> and drag and drop it to the place you want it to be displayed among the other fields.
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

</TabItem>

</Tabs>

### Configuring the edit view

<ThemedImage
  alt="Configuring the edit view of the Content Manager"
  sources={{
    light: '/img/assets/content-manager/edit-view-config2.png',
    dark: '/img/assets/content-manager/edit-view-config2_DARK.png',
  }}
/>

<Tabs groupId="EditViewConfig">

<TabItem value="EditViewSettings" label="Settings">

1. In the edit view of your content-type, click on the <Icon name="dots-three-outline" /> button then <Icon name="list-plus" classes="ph-bold" /> **Configure the view**.
2. In the Settings area, define your chosen new settings:

| Setting name    | Instructions                                                                          |
| --------------- | ------------------------------------------------------------------------------------- |
| Entry title     | Choose among the drop-down list the field that should be used as title for the entry. |

3. Click on the **Save** button.

</TabItem>

<TabItem value="EditViewDisplay" label="View">

1. In the edit view of your content-type, click on the <Icon name="dots-three-outline" /> button then <Icon name="list-plus" classes="ph-bold" /> **Configure the view**.
2. In the View area, define what fields (including relational fields) to display in the list view table, in what order and what size:
   - Click the ![Add icon](/img/assets/icons/v5/Plus.svg) **Insert another field** button to add a new field.
   - Click the delete button <Icon name="x" /> to remove a field.
   - Click the reorder button <Icon name="dots-six-vertical" classes="ph-bold" /> and drag and drop it to the place you want it to be displayed among the other fields.
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

</TabItem>

</Tabs>

## Usage

<br/>

### Creating & Writing content

In Strapi, writing content consists in filling up fields, which are meant to contain specific content (e.g. text, numbers, media, etc.). These fields were configured for the collection or single type beforehand, through the [Content-type Builder](/cms/features/content-type-builder).

<ThemedImage
  alt="Edit view to write content"
  sources={{
    light: '/img/assets/content-manager/edit-view3.png',
    dark: '/img/assets/content-manager/edit-view3_DARK.png',
  }}
/>

To write or edit content:

1. In the <Icon name="feather" /> Content Manager:
    - Either click on the **Create new entry** button in the top right corner of the collection type of your choice to create a new entry,
    - Or access the edit view of your already created collection type's entry or single type.
2. Write your content, following the available field schema. You can refer to the table below for more information and instructions on how to fill up each field type.

:::note
New entries are only considered created once some of their content has been written and saved once. Only then will the new entry be listed in the list view.
:::

<!-- MAY BE REMOVED - NOT SURE ABOUT RELEVANCE

:::info
If Draft & Publish is enabled for your content-type (it's enabled by default), the fields work the same way whether you are editing the draft or published version.
:::
-->

| Field name  | Instructions                                                                                                                                                                                                                                                                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text        | Write your content in the textbox.                                                                                                                                                                                                                                                                                                                                        |
| Rich text (Markdown) | Write your textual content in the editor, in Markdown. Some basic formatting options (titles, bold, italics, underline) are available in the top bar of the editor to apply to selected text. A **Preview mode/Markdown mode** button to switch between modes is also available. <br /><br /> 💡 The box can be expanded by clicking on **Expand** in the bottom bar. It displays side by side, at the same time, the textbox that you can edit and the preview. |
| Rich text (Blocks) | Write and manage your content in the editor, which automatically renders live all additions/updates. In the Blocks editor, paragraphs behave as blocks of text: hovering on a paragraph will display an icon <Icon name="dots-six-vertical" classes="ph-bold"/> on which to click to reorder the content. Options to format or enrich the content are also accessible from the top bar of the editor (basic formatting options, code, links, image etc.). <!-- <br /><br /> 💡 Type `/` in the editor to have access to the list of all available options and select one. --> <br /><br /> 💡 You can use text formatting keyboard shortcuts in the Blocks editor (e.g. bold, italics, underline, and pasting link). |
| Number      | Write your number in the textbox. Up and down arrows, displayed on the right of the box, allow to increase or decrease the current number indicated in the textbox.                                                                                                                                                                                                       |
| Date        | 1. Click the date and/or time box. <br /> 2. Type the date and time or choose a date using the calendar and/or a time from the list. The calendar view fully supports keyboard-based navigation. |
| Media       | 1. Click the media area. <br /> 2. Choose an asset from the [Media Library](/cms/features/media-library) or from a [folder](/cms/features/media-library#organizing-assets-with-folders) if you created some, or click the **Add more assets** button to add a new file to the Media Library. <br /><br /> 💡 It is possible to drag and drop the chosen file in the media area.                                                                                                                                   |
| Relation    | Choose an entry from the drop-down list. See [relational fields](#relational-fields) for more information.                                                                                                                                                                                                          |
| Boolean     | Click on **TRUE** or **FALSE**.                                                                                                                                                                                                                                                                                                                                               |
| JSON        | Write your content, in JSON format, in the code textbox.                                                                                                                                                                                                                                                                                                                  |
| Email       | Write a complete and valid email address.                                                                                                                                                                                                                                                                                                                                 |
| Password    | Write a password. <br /><br /> 💡 Click the <Icon name="eye" /> icon, displayed on the right of the box, to show the password.                                                                                                                                                                                                                                                                |
| Enumeration | 1. Click the drop-down list. <br /> 2. Choose an entry from the list.                                                                                                                                                                                                                                                                                                       |
| UID         | Write a unique identifier in the textbox. A "Regenerate" button, displayed on the right of the box, allows automatically generating a UID based on the content type name.                                                                                                                                                                                                |

:::note
Filling out a [custom field](/cms/features/content-type-builder#custom-fields) depends on the type of content handled by the field. Please refer to the dedicated documentation for each custom field hosted on the [Marketplace](https://market.strapi.io).
:::

#### Components

Components are a combination of several fields, which are grouped together in the edit view. Writing their content works exactly like for independent fields, but there are some specificities to components.

There are 2 types of components: non-repeatable and repeatable components.

<Tabs groupId="Components">

<TabItem value="NonRepeatable" label="Non-repeatable components">

<ThemedImage
  alt="Non-repeatable component - No entry yet"
  width="80%"
  sources={{
    light: '/img/assets/content-manager/edit-view_component3.png',
    dark: '/img/assets/content-manager/edit-view_component3_DARK.png',
  }}
/>
<ThemedImage
  alt="Non-repeatable component - With entries"
  width="80%"
  sources={{
    light: '/img/assets/content-manager/edit-view_component2.png',
    dark: '/img/assets/content-manager/edit-view_component2_DARK.png',
  }}
/>

Non-repeatable components are a combination of fields that can be used only once.

By default, the combination of fields is not directly displayed in the edit view:

1. Click on the add button <Icon name="plus-circle" /> to add the component.
2. Fill in the fields of the component.

To delete the non-repeatable component, click on the delete button <Icon name="trash"/>, located in the top right corner of the component area.

</TabItem>

<TabItem value="Repeatable" label="Repeatable components">

<ThemedImage
  alt="Repeatable component"
  width="80%"
  sources={{
    light: '/img/assets/content-manager/edit-view_component4.png',
    dark: '/img/assets/content-manager/edit-view_component4_DARK.png',
  }}
/>

Repeatable components are also a combination of fields, but they allow the creation of multiple component entries, all following the same combination of fields.

To add a new entry and display its combination of fields:

1. Click on the add button <Icon name="plus-circle" /> to add the component.
2. Fill in the fields of the component.
3. (optional) Click on the **Add an entry** button and fill in the fields again.

The repeatable component entries can be reordered or deleted directly in the edit view, using buttons displayed on the right of the entry area.

- Use the drag & drop button <Icon name="dots-six-vertical" classes="ph-bold" /> to reorder entries of your repeatable component.
- Use the delete button <Icon name="trash"/> to delete an entry from your repeatable component.

:::note
Unlike regular fields, the order of the entries of a repeatable component is important. It should correspond exactly to how end users will read/see the content.
:::

</TabItem>

</Tabs>

#### Dynamic zones

Dynamic zones are a combination of components, which themselves are composed of several fields. Writing the content of a dynamic zone requires additional steps in order to access the fields.

<ThemedImage
  alt="Writing content for a dynamic zone"
  sources={{
    light: '/img/assets/content-manager/edit-view_dynamic-zone-1.png',
    dark: '/img/assets/content-manager/edit-view_dynamic-zone-1_DARK.png',
  }}
/>

<ThemedImage
  alt="Writing content for a dynamic zone"
  sources={{
    light: '/img/assets/content-manager/edit-view_dynamic-zone-2.png',
    dark: '/img/assets/content-manager/edit-view_dynamic-zone-2_DARK.png',
  }}
/>

1. Click on the <Icon name="plus-circle" /> **Add a component to [dynamic zone name]** button.
2. Choose a component available for the dynamic zone.
3. Fill in the fields of the component.

Dynamic zones' components can also be reordered or deleted directly in the edit view, using buttons displayed in the top right corner of the component area.

- Use the drag & drop button <Icon name="dots-six-vertical" classes="ph-bold" /> to reorder components in your dynamic zone.
- Use the delete button <Icon name="trash"/> to delete a component from your dynamic zone.

:::tip
You can also use the keyboard to reorder components: focus the component using Tab, press Space on the drag & drop button <Icon name="dots-six-vertical" classes="ph-bold" /> and use the arrow keys to then re-order, pressing Space again to drop the item.
:::

:::note
Unlike regular fields, the order of the fields and components inside a dynamic field is important. It should correspond exactly to how end users will read/see the content.
:::

#### Relational fields

Relation-type fields added to a content-type allow establishing a relation with another collection type. These fields are called "relational fields". 

The content of relational fields is written from the edit view of the content-type they belong to. However, relational fields can point to one or several entries of the other collection type, this is why in the Content Manager it is possible to manage a content-type's relational fields to choose which entries are relevant.

<details>
<summary>Example of relational fields</summary>

In my Strapi admin panel I have created 2 collection types:

- Restaurant, where each entry is a restaurant
- Category, where each entry is a type of restaurant

I want to assign a category to each of my restaurants, therefore I have established a relation between my 2 collection types: restaurants can have one category.

In the Content Manager, from the edit view of my Restaurant entries, I can manage the Category relational field, and choose which entry of Category is relevant for my restaurant.
<br/>

</details>

<!-- MAY BE REMOVED - FEELS LIKE REPETITION

The relational fields of a content-type are displayed among regular fields. For each relational field is displayed a drop-down list containing all available entry titles. It allows to choose which entry the relational fields should point to. You can either choose one or several entries depending on the type of relation that was established.-->

<ThemedImage
  alt="Relational fields in the edit view"
  sources={{
    light: '/img/assets/content-manager/edit-view_relational-fields2.png',
    dark: '/img/assets/content-manager/edit-view_relational-fields2_DARK.png',
  }}
/>

<Tabs groupId="RelationalFields">

<TabItem value="OneChoice" label="One-choice relational fields">

Many-to-one, one-to-one, and one-way types of relation only allow to choose one entry per relational field.

<ThemedImage
  alt="One-choice relational fields"
  width="40%"
  sources={{
    light: '/img/assets/content-manager/RF_one-choice2.png',
    dark: '/img/assets/content-manager/RF_one-choice2_DARK.png',
  }}
/>

To select the only relevant relational field's entry:

1. In the content-type's edit view, click on the drop-down list of the relational field.
2. Among the list of entries, choose one.

To remove the entry selected in the drop-down list, click on the delete button <Icon name="x" />.

</TabItem>

<TabItem value="MultipleChoice" label="Multiple-choice relational fields">

Many-to-many, one-to-many, and many-ways types of relation allow to choose several entries per relational field.

<ThemedImage
  alt="Multiple choices relational fields"
  width="40%"
  sources={{
    light: '/img/assets/content-manager/RF_multiple-choices2.png',
    dark: '/img/assets/content-manager/RF_multiple-choices2_DARK.png',
  }}
/>

To select the relevant relational field's entries:

1. In the content-type's edit view, click on the drop-down list of the relational field.
2. Among the list of entries, choose one.
3. Repeat step 2 until all relevant entries have been chosen.

To remove an entry, click on the cross button ![Cross icon](/img/assets/icons/v5/Cross.svg) in the selected entries list.

Entries from multiple-choice relational fields can be reordered, indicated by a drag button <Icon name="dots-six-vertical" classes="ph-bold" />. To move an entry, click and hold it, drag it to the desired position, then release it.

</TabItem>

</Tabs>

:::tip
- Not all entries are listed by default: more can be displayed by clicking on the **Load more** button. Also, instead of choosing an entry by scrolling the list, you can click any relational field drop-down list and type to search a specific entry.

- Click on the name of an entry to be redirected to the edit view of the relational field's content-type. Make sure you save your page first, to avoid losing your last modifications.
:::

:::note
- If the [Draft & Publish feature](/cms/features/draft-and-publish) is activated for the content-type the relational field belongs to, you will notice blue or green dots next to the entries names in the drop-down list. They indicate the status of the entry, respectively draft or published content.
- If the [Internationalization (i18n) feature](/cms/features/internationalization) is enabled for the content-type, the list of entries may be limited or differ from one locale to another. Only relevant entries that can possibly be chosen for a relational field will be listed.
:::

<!-- Add a section "Managing entries" here with the explanations of the list view interface? Or before "Creating & Writing content"? Or maybe have 1. "Creating & managing entries" 2. "Writing content"? Or just use a Guideflow? -->

### Deleting content

You can delete content by deleting any entry of a collection type, or the default entry of a single type.

1. In the edit view of the entry, click on <Icon name="dots-three-outline" /> at the top right of the interface, and click the **Delete document** button.<br/>If Internationalization is enabled for the content-type, you can also choose to delete only the currently selected locale by clicking on the **Delete locale** button.
2. In the window that pops up, click on the **Confirm** button to confirm the deletion.

<ThemedImage
  alt="Deleting entries"
  sources={{
    light: '/img/assets/content-manager/deleting-entries.png',
    dark: '/img/assets/content-manager/deleting-entries_DARK.png',
  }}
/>

:::tip
You can delete entries from the list view of a collection type, by clicking on <Icon name="dots-three-outline" />  on the right side of the entry's record in the table, then choosing the <Icon name="trash"/> **Delete document** button.<br/>If [Internationalization](/cms/features/internationalization) is enabled for the content-type, **Delete document** deletes all locales while **Delete locale** only deletes the currently listed locale.
