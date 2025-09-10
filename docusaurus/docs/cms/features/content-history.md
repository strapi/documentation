---
title: Content History
description: Learn how you can use the Content History feature of Strapi 5 to browse and restore previous versions of documents from the Content Manager.
displayed_sidebar: cmsSidebar
toc_max_heading_level: 5
tags:
 - content manager
 - content history
 - features
---

# Content History
<GrowthBadge /> <EnterpriseBadge/> <VersionBadge version="5.0.0" />

> Content History stores previous document versions so editors can compare and restore earlier states from the Content Manager. This documentation explains how to browse and restore workflows for quick rollback of mistakes.
<br/>

The Content History feature, in the <Icon name="feather" /> Content Manager, gives you the ability to browse and restore previous versions of documents created with the [Content Manager](/cms/features/content-manager).

<IdentityCard>
  <IdentityCardItem icon="credit-card" title="Plan">CMS Growth or Enterprise plan</IdentityCardItem>
  <IdentityCardItem icon="user" title="Role & permission">None</IdentityCardItem>
  <IdentityCardItem icon="toggle-right" title="Activation">Available by default, if required plan</IdentityCardItem>
  <IdentityCardItem icon="desktop" title="Environment">Available in both Development & Production environment</IdentityCardItem>
</IdentityCard>

<Guideflow lightId="9r2m2y1sok" darkId="er566mli6p"/>

## Usage

**Path to use the feature:** <Icon name="feather" /> Content Manager <br/> From the edit view of a content type: click <Icon name="dots-three-outline" /> (top right corner) then <Icon name="clock-counter-clockwise" /> **Content History**.

### Browsing Content History

With Content History, you can browse your content through:

- The main view on the left, which lists the fields and their content for the version selected in the sidebar on the right.
- The sidebar on the right, which lists the total number of versions available, and for each version:
  - the date and time when the version was created,
  - the user who created it,
  - and whether its status is Draft, Modified, or Published (see [Draft & Publish](/cms/features/draft-and-publish) for more information about document statuses).


<ThemedImage
alt="Accessing the Content History of a document"
sources={{
  light:'/img/assets/content-manager/browsing-content-history.png',
  dark:'/img/assets/content-manager/browsing-content-history_DARK.png',
}}
/>

:::note
The main view of Content History clearly states whether a field was inexistent, deleted, or renamed in other versions of the content-type. Fields that are unknown for the selected version will be displayed under an _Unknown fields_ heading below the other fields.
:::

### Restoring a previous version

You can choose to restore a previous version of a document. When restoring a version, the content of this version will override the content of the current draft version. The document switches to the Modified status and you will then be able to publish the content whenever you want (see [Publishing a draft](/cms/features/draft-and-publish#publishing-a-draft)).

1. Browse the Content History and select a version via the sidebar on the right.
2. Click the **Restore** button.
3. In the _Confirmation_ window, click **Restore**.  

:::note
If the [Internationalization (i18n)](/cms/features/internationalization) feature is enabled for the content-type, restoring a version with a unique field (i.e. a field whose content is the same for all locales) will restore the content of this field for all locales.
:::

<ThemedImage
alt="Restoring version with Content History"
sources={{
  light:'/img/assets/content-manager/restoring-content-history.png',
  dark:'/img/assets/content-manager/restoring-content-history_DARK.png',
}}
/>
