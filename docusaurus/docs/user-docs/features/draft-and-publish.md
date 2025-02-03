---
title: Draft & Publish
description: Learn how you can use the Draft & Publish feature of Strapi 5 to manage drafts for content.
displayed_sidebar: cmsSidebar
toc_max_heading_level: 5
tags:
 - content manager
 - content type builder
 - draft & publish
 - publishing a draft
 - unpublishing content
 - features
---

# Draft & Publish

The Draft & Publish feature allows to manage drafts for your content.

:::prerequisites Identity Card of the Feature
<Icon name="credit-card"/> **Plan:** Free feature. <br/>
<Icon name="user"/> **Role & permission:** None. <br/>
<Icon name="toggle-left"/> **Activation:** Available but disabled by default. <br/>
<Icon name="laptop"/> **Environment:** Available in both Development & Production environment.
:::

<ThemedImage
  alt="Editing draft version"
  sources={{
    light: '/img/assets/content-manager/editing_draft_version3.png',
    dark: '/img/assets/content-manager/editing_draft_version3_DARK.png',
  }}
/>

## Configuration

**Path to configure the feature:** ![CTB icon](/img/assets/icons/v5/Layout.svg) Content Type Builder

For your content types to be managed with Draft & Publish in the Content Manager, the feature must be enabled through the Content-type Builder. Draft & Publish can be configured for each content type.

1. Either edit an already created content type of your choice, or create a new content type (see [Content Type Builder](/user-docs/features/content-type-builder) documentation for more information).
2. Go to the **Advanced settings** tab.
3. Tick the Draft & Publish option.
4. Click the **Finish** button.

<ThemedImage
  alt="Content-type Builder's advanced settings"
  sources={{
    light: '/img/assets/content-type-builder/advanced-settings.png',
    dark: '/img/assets/content-type-builder/advanced-settings_DARK.png',
  }}
/>

## Usage

With Draft & Publish enabled, the [Content Manager's edit view](/user-docs/features/content-manager#overview) indicates the current status of your content type's entry at the top of the interface. Your content can have 3 statuses:

- <span style={{color:"#5cb176"}}>Published</span>: The content was previously published. There are no pending draft changes saved.
- <span style={{color:"#ac73e6"}}>Modified</span>: The content was previously published. You made some changes to the draft version and saved these changes, but the changes have not been published yet.
- <span style={{color:"#7b79ff"}}>Draft</span>: The content has never been published yet.

### Working with drafts

**Path:** <Icon name="feather" /> Content Manager, edit view of your content type

While editing a document, you can see 2 tabs:

- The _Draft_ tab is where you can edit your content.
- The _Published_ tab is a read-only tab where edition of all fields is disabled. The _Published_ tab only exists to show what is the content of fields in the published version.

<ThemedImage
  alt="Editing draft version"
  sources={{
    light: '/img/assets/content-manager/editing_draft_version3.png',
    dark: '/img/assets/content-manager/editing_draft_version3_DARK.png',
  }}
/>

By default, each newly created content is a draft. Drafts can be modified and saved at will, using the **Save** button in the _Entry_ box on the right side of the interface, until they are ready to be published.

Once you made changes to a draft, you have 3 possible options, all available in the _Entry_ box on the right side of the interface:
- **Publish** your document (see [Publishing a draft](#publishing-a-draft)),
- **Save** your draft for later retrieval,
- or discard changes, by clicking on ![More icon](/img/assets/icons/v5/More.svg) and choosing ![Discard changes icon](/img/assets/icons/v5/CrossCircle.svg) **Discard changes**.

### Publishing a draft

**Path:** <Icon name="feather" /> Content Manager, edit view of your content type

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
To schedule publication (i.e. convert a draft to a published entry at a given date and time) you can include it in a release and schedule the publication of that release. Please refer to the [Releases feature](/user-docs/features/releases) documentation for more information.
:::

### Unpublishing content

**Path:** ![Content icon](/img/assets/icons/v5/Feather.svg) Content Manager, edit view of your content type

To unpublish a previously published content: from the _Draft_ tab, click on ![More icon](/img/assets/icons/v5/More.svg) in the _Entry_ box on the right side of the interface and choose the **Unpublish** button.

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

### Bulk actions

**Path:** ![Content icon](/img/assets/icons/v5/Feather.svg) Content Manager, list view of your content type

Selecting multiple entries from the [Content Manager's list view](/user-docs/features/content-manager#overview) will display additional buttons to publish or unpublish several entries simultaneously. This is what is called "bulk publishing/unpublishing".

:::caution
If the [Internationalization feature](/user-docs/features/internationalization) is installed, the bulk publish/unpublish actions only apply to the currently selected locale.
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

### Usage with APIs

Draft or published content can be requested, created, updated, and deleted using the `status` parameter through the various front-end APIs accessible from [Strapi's Content API](/dev-docs/api/content-api):

<CustomDocCardsWrapper>
<CustomDocCard icon="cube" title="REST API" description="Learn how to use the status parameter with the REST API." link="/dev-docs/api/rest/status"/>
<CustomDocCard icon="cube" title="GraphQL API" description="Learn how to use the status parameter with GraphQL API." link="/dev-docs/api/graphql#status"/>
</CustomDocCardsWrapper>

On the back-end server of Strapi, the Document Service API can also be used to interact with localized content:

<CustomDocCardsWrapper>
<CustomDocCard icon="cube" title="Document Service API" description="Learn how to use the status parameter with the Document Service API." link="/dev-docs/api/document-service/status"/>
</CustomDocCardsWrapper>

