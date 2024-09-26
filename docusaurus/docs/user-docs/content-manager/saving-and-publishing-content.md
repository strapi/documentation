---
title: Saving, publishing, and deleting content
description: Instructions to manage content throughout its whole lifecycle, from the draft version to the deletion of the obsolete content.
toc_max_heading_level: 4
tags:
- Content-type Builder
- deleting content
- Draft & Publish
- publishing a draft
- unpublishing content
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# Saving, publishing and deleting content

Strapi allows you to manage your content throughout its whole lifecycle, whether you are working on its draft version, about to finish it and share it with the world, or wanting to delete it when it's obsolete.

## Saving & publishing content

:::caution
The possibility to manage drafts for contents comes from the Draft & Publish feature. This feature is activated by default, but it can be deactivated for any content-type from the Content-type Builder (see [advanced settings for content-types](/user-docs/content-type-builder/managing-content-types#advanced-settings)). If you disabled the Draft & Publish feature, saving your content means saving and publishing at the same time.
:::

Your content can have 3 statuses:

| Status name | Description |
|------------|--------------|
| <span style={{color:"#5cb176"}}>Published</span> | The content was previously published.<br/>There are no pending draft changes saved. |
| <span style={{color:"#ac73e6"}}>Modified</span> | The content was previously published.<br/>You made some changes to the draft version and saved these changes, but the changes have not been published yet. |
| <span style={{color:"#7b79ff"}}>Draft</span> | The content has never been published yet. |
  
In the Content Manager edit view (the view you see when editing an entry), the current status of an entry is indicated at the top of the interface, just below the entry title.

<ThemedImage
  alt="Editing draft version"
  sources={{
    light: '/img/assets/content-manager/editing_draft_version3.png',
    dark: '/img/assets/content-manager/editing_draft_version3_DARK.png',
  }}
/>

### Working with drafts

While editing a document, you can see 2 tabs:

- The _Draft_ tab is where you can edit your content.
- The _Published_ tab is a read-only tab where edition of all fields is disabled. The _Published_ tab only exists to show what is the content of fields in the published version.

By default, each newly created content is a draft. Drafts can be modified and saved at will, using the **Save** button in the _Entry_ box on the right side of the interface, until they are ready to be published.

Once you made changes to a draft, you have 3 possible options, all available in the _Entry_ box on the right side of the interface:
- **Publish** your document (see [publishing a draft](#publishing-a-draft)),
- **Save** your draft for later retrieval,
- or discard changes, by clicking on ![More icon](/img/assets/icons/v5/More.svg) and choosing ![Discard changes icon](/img/assets/icons/v5/CrossCircle.svg) **Discard changes**.

### Publishing and unpublishing

While editing a document, you can decide to publish a draft or unpublish previously published content.

#### Publishing a draft

To publish a draft, click on the **Publish** button in the _Entry_ box on the right side of the interface.

After a draft is published:

- The content of the _Draft_ and _Published_ tabs should be exactly the same (but the _Published_ tab remains read-only).
- The status, below the document's title, will switch to "Published".

:::caution
Before publishing a draft, make sure it doesn't have relations with other non-published content, otherwise some of the content may not be available through the API.
:::

When a document has both a draft and a published version available, the published version can be found in the _Published_ tab. If the document has only a draft version, you can not click on the _Published_ tab.

<ThemedImage
  alt="Editing published version"
  sources={{
    light: '/img/assets/content-manager/editing_published_version3.png',
    dark: '/img/assets/content-manager/editing_published_version3_DARK.png',
  }}
/>

:::tip
To schedule publication, i.e., convert a draft to a published entry at a given date and time, you can [include it in a release](/user-docs/content-manager/adding-content-to-releases) and [schedule the publication](/user-docs/releases/creating-a-release) of the release.
:::

#### Unpublishing content

Previously published content can be unpublished.

To unpublish content,  from the _Draft_ tab, click on ![More icon](/img/assets/icons/v5/More.svg) in the _Entry_ box on the right side of the interface and choose the **Unpublish** button.

If the draft version of the document contains content different from the published version, you can decide what to do with both content when unpublishing:

1. From the _Draft_ tab, click on ![More icon](/img/assets/icons/v5/More.svg) in the _Entry_ box on the right side of the interface and choose the **Unpublish** button.
2. In the Confirmation dialog that opens, you can choose to:
    - **Unpublish and keep last draft**, so that all the content you currently have in the _Draft_ tab is preserved, but the all the content from the _Published_ tab is definitely gone
    - **Unpublish and replace last draft** to discard any existing content in the _Draft_ tab and replace it with the content of all fields from the _Published_ tab
3. Click **Confirm**. The desired changes will be applied to both the _Draft_ and _Published_ tabs and the new status of the entry will also be reflected below the entry title.

<ThemedImage
  alt="Unpublish a document"
  sources={{
    light: '/img/assets/content-manager/content-manager_unpublish.png',
    dark: '/img/assets/content-manager/content-manager_unpublish_DARK.png',
  }}
/>

### Bulk publishing and unpublishing

Selecting multiple entries from the Content Manager's list view will display additional buttons to publish or unpublish several entries simultaneously. This is what is called "bulk publishing/unpublishing".

:::caution
If the [Internationalization plugin](/user-docs/plugins/strapi-plugins#i18n) is installed, the bulk publish/unpublish actions only apply to the currently selected locale.
:::

<ThemedImage
  alt="Unpublish a document"
  sources={{
    light: '/img/assets/content-manager/bulk-publish.png',
    dark: '/img/assets/content-manager/bulk-publish_DARK.png',
  }}
/>

#### Bulk publishing drafts

To publish several entries at the same time:

1. From the list view of the Content Manager, select your entries to publish by ticking the box on the left side of the entries' record.
2. Click on the **Publish** button located above the header of the table.
3. In the _Publish entries_ dialog, check the list of selected entries and their status:

   - ![Success icon](/img/assets/icons/v5/CheckCircle.svg) Ready to publish: the entry can be published
   - ![Fail icon](/img/assets/icons/v5/CrossCircle2.svg) "[field name] is required", "[field name] is too short" or "[field name] is too long": the entry cannot be published because of the issue stated in the red warning message.

4. (optional) If some of your entries have a ![Edit icon](/img/assets/icons/v5/CrossCircle2.svg) status, click the ![Edit icon](/img/assets/icons/v5/Pencil.svg) edit buttons to fix the issues until all entries have the ![Success icon](/img/assets/icons/v5/CheckCircle.svg) Ready to publish status. Note that you will have to click on the **Refresh** button to update the _Publish entries_ dialog as you fix the various entries issues.
5. Click the **Publish** button.
6. In the confirmation dialog box, confirm your choice by clicking again on the **Publish** button.

#### Bulk unpublishing content

To unpublish several entries at the same time:

1. From the list view of the Content Manager, select your entries to unpublish by ticking the box on the left side of the entries' record.
2. Click on the **Unpublish** button located above the header of the table.
3. In the confirmation dialog box, confirm your choice by clicking again on the **Unpublish** button.

## Deleting content

You can delete content by deleting any entry of a collection type, or the default entry of a single type.

1. In the edit view of the entry, click on ![More icon](/img/assets/icons/v5/More.svg) at the top right of the interface, and click the **Delete document** button.<br/>If Internationalization is enabled for the content-type, you can also choose to delete only the currently selected locale by clicking on the **Delete locale** button.
2. In the window that pops up, click on the **Confirm** button to confirm the deletion.

:::tip
You can delete entries from the list view of a collection type, by clicking on ![More icon](/img/assets/icons/v5/More.svg)  on the right side of the entry's record in the table, then choosing the ![Delete icon](/img/assets/icons/v5/Trash.svg) **Delete document** button.<br/>If Internationalization is enabled for the content-type, **Delete document** deletes all locales while **Delete locale** only deletes the currently listed locale.
<!-- TODO: Commented out since it's not currently testable and only planned for stable release -->
<!-- You also have the possibility to delete multiple entries at the same time. To do so, select your entries to delete by ticking the box on the left side of the entries' record. Then, click on the **Delete** button located above the header of the table. If [Internationalization (i18n)](/user-docs/plugins/strapi-plugins#i18n) is enabled for the content-type, the confirmation dialog box asks whether you want to delete only the current locales for the document, or the whole documents including all their locales. -->
:::

<!-- :::caution
If the [Internationalization plugin](/user-docs/plugins/strapi-plugins.md#-internationalization-plugin) is installed, entries can only be deleted one locale at the time.
::: -->
