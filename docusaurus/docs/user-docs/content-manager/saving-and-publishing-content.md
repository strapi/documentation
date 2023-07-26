---
title: Saving, publishing, and deleting content
description: Instructions to manage content throughout its whole lifecycle, from the draft version to the deletion of the obsolete content.

---

# Saving, publishing and deleting content

Strapi allows you to manage your content throughout its whole lifecycle, whether you are working on its draft version, about to finish it and share it with the world, or wanting to delete it when it's obsolete.

## Saving & publishing content

:::caution
The possibility to manage drafts for contents comes from the Draft & Publish feature. This feature is activated by default, but it can be deactivated for any content-type from the Content-type Builder. If you disabled the Draft & Publish feature, saving your content means saving and publishing at the same time.
:::

Your contents can have 2 statuses: draft or published. You can see the current status indicated on the right of the interface, above the Information box.

<ThemedImage
  alt="Editing draft version"
  sources={{
    light: '/img/assets/content-manager/editing_draft_version2.png',
    dark: '/img/assets/content-manager/editing_draft_version2_DARK.png',
  }}
/>

By default, each newly created content is a draft. Drafts can be modified and saved at will, using the **Save** button on the top right corner of the edit view, until they are ready to be published.

### Publishing a draft

To publish a draft, click on the **Publish** button in the top right corner of the content editor.

:::caution
Before publishing a draft, make sure it doesn't have relations with other non-published content, otherwise some of the content may not be available through the API.
:::

When a content is not a draft anymore, but has been published, it is indicated on the right of the interface, above the Information box.

<ThemedImage
  alt="Editing published version"
  sources={{
    light: '/img/assets/content-manager/editing_published_version2.png',
    dark: '/img/assets/content-manager/editing_published_version2_DARK.png',
  }}
/>

:::tip
To schedule publication, i.e. convert a draft to a published entry at a given date and time, you can follow [this technical guide](https://forum.strapi.io/t/schedule-publications/23184) which requires adding custom code to the Strapi application.
:::

### Unpublishing content

Published contents can be unpublished, switching back to being drafts again.

To unpublish content, click on the **Unpublish** button in the top right corner of the content editor.

### Bulk publish and unpublish

Selecting multiple entries from the Content Manager's list view will display additional buttons to publish or unpublish several entries simultaneously.

![Selecting entries for bulk publish/unpublish](/img/assets/content-manager/bulk-publish.png)

To publish or unpublish several entries:

1. From the list view of the Content Manager, select your entries to publish or unpublish by ticking the box on the left side of the entries' record.
2. Depending on what you want to achieve, click one of the **Publish** or **Unpublish** buttons located above the header of the table. When selecting only published entries, only the **Unpublish** button is shown, while when selecting only draft entries, only the **Publish** button is shown.
3. In the confirmation dialog box, confirm your choice by clicking on the **Publish** or **Unpublish** button.

:::caution
* If an error occurs, a red message overlay will appear with additional information, and none of your selected entries will be published or unpublished.
* If the [Internationalization plugin](/user-docs/plugins/strapi-plugins.md#-internationalization-plugin) is installed, the bulk publish/unpublish actions only apply to the currently selected locale.
:::

## Deleting content

You can delete content by deleting any entry of a collection type, or the default entry of a single type.

1. In the edit view of the entry, click on the **Delete this entry** button, located at the bottom of the right side of the interface.
2. In the window that pops up, click on the **Confirm** button to confirm the deletion.

:::tip
You can delete entries from the list view of a collection type, by clicking on the delete button ![Delete icon](/img/assets/icons/delete.svg) on the right side of the entry's record in the table. <br /> You also have the possibility to delete multiple entries at the same time. To do so, select your entries to delete by ticking the box on the left side of the entries' record. Then, click on the **Delete** button located above the header of the table.
:::

:::caution
If the [Internationalization plugin](/user-docs/plugins/strapi-plugins.md#-internationalization-plugin) is installed, entries can only be deleted one locale at the time.
:::
