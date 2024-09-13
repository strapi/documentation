---
title: Browsing Content History
description: Learn how you can use the Content History feature of Strapi 5 to browse and restore previous versions of documents from the Content Manager.
displayed_sidebar: userDocsSidebar
tags:
 - Content Manager
 - Content History
---

# Content History <BetaBadge/> <EnterpriseBadge/> <CloudProBadge/> <CloudTeamBadge/>

The Content History feature of the Content Manager gives you the ability to browse and restore previous versions of documents created with the Content Manager.

<ThemedImage
alt="Accessing the Content History of a document"
sources={{
  light:'/img/assets/content-manager/accessing-content-history.png',
  dark:'/img/assets/content-manager/accessing-content-history_DARK.png',
}}
/>

## Browsing Content History

Content History is accessible from the Edit View of any document created with the Content Manager.

To browse Content History, while editing a document in the Content Manager, click on ![More icon](/img/assets/icons/v5/More.svg) at the top right of the interface, and click the ![ClockCounterClockwise icon](/img/assets/icons/v5/ClockCounterClockwise.svg) **Content History** button. You will be presented with the Content History view:

- The sidebar on the right lists the total number of versions available, and for each version, the date and time when the version was created, the user who created it, and whether its status is Draft, Modified, or Published (see [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content#saving--publishing-content) for more information about document statuses).
- The main view on the left lists the fields and their content for the version selected in the sidebar on the right.

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

## Restoring a previous version

You can choose to restore a previous version of a document. When restoring a version, the content of this version will override the content of the current draft version. The document switches to the Modified status and you will then be able to [publish](/user-docs/content-manager/saving-and-publishing-content#publishing-and-unpublishing) the content whenever you want.

To restore a version:

1. While editing a document in the Content Manager, click on ![More icon](/img/assets/icons/v5/More.svg) at the top right of the interface, and click the ![ClockCounterClockwise icon](/img/assets/icons/v5/ClockCounterClockwise.svg) **Content History** button.
2. Browse the Content History and select a version in the sidebar on the right.
3. Click the **Restore** button.
4. In the _Confirmation_ window, click **Restore**.  

:::note
If the [Internationalization (i18n)](/user-docs/content-manager/translating-content) feature is enabled for the content-type, restoring a version with a unique field (i.e. a field whose content is the same for all locales) will restore the content of this field for all locales.
:::
