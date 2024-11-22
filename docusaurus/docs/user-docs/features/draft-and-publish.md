---
title: Draft & Publish
description: Learn how you can use the Draft & Publish feature of Strapi 5 to manage drafts for content.
displayed_sidebar: userDocsSidebar
toc_max_heading_level: 5
tags:
 - Content Manager
 - Content type Builder
 - Draft & Publish
 - publishing a draft
 - unpublishing content
---

# Draft & Publish

The Draft & Publish feature allows to manage drafts for your content.

<ThemedImage
  alt="Editing draft version"
  sources={{
    light: '/img/assets/content-manager/editing_draft_version3.png',
    dark: '/img/assets/content-manager/editing_draft_version3_DARK.png',
  }}
/>

<!-- Gif for each feature intro? Interactive demo showcase? -->

:::prerequisites Identity Card of the Feature
<Icon name="credit-card"/> **Plan:** Free feature. <br/>
<Icon name="user"/> **Role & permission:** None. <br/>
<Icon name="toggle-left"/> **Activation:** Available but disabled by default. <br/>
<Icon name="laptop"/> **Environment:** Available in both Development & Production environment.
:::

## Configuration

For your content types to be managed with Draft & Publish in the Content Manager, the feature must be enabled through the Content-type Builder. Draft & Publish can be configured for each content type.

To enable Draft & Publish:

1. Go to the ![CTB icon](/img/assets/icons/v5/Layout.svg) _Content-type Builder_ via the main navigation of the admin panel.
2. Either edit the already created content type of your choice, or create a new content type.
3. Go to the **Advanced settings** tab.
4. Tick the Draft & Publish option.

<ThemedImage
  alt="Content-type Builder's advanced settings"
  sources={{
    light: '/img/assets/content-type-builder/advanced-settings.png',
    dark: '/img/assets/content-type-builder/advanced-settings_DARK.png',
  }}
/>

## Usage

The Draft & Publish feature is visible and used from the ![Content icon](/img/assets/icons/v5/Feather.svg) *Content Manager*, accessible via the main navigation of the admin panel. Edit any content type of your choice (with Draft & Publish enabled) to see and follow the documentation below.

With Draft & Publish enabled, your content can have 3 statuses:

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
