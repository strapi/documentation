---
title: Managing a release
description: Instructions on how to manage a Release from the admin panel
---

# Managing a release <EnterpriseBadge /> <CloudTeamBadge /> <FutureBadge />  <AlphaBadge />

Adding entries to a [release](/user-docs/releases/introduction) allow viewing them altogether on a single page.

<!-- TODO: add actual screenshots for both light and dark modes -->
<ThemedImage
  alt="Release details"
  sources={{
    light: '/img/assets/releases/release-details.png',
    dark: '/img/assets/releases/release-details_DARK.png',
  }}
/>

<br /><br />

From a release page, you can:

- edit the name of the release, or delete the release,
<!-- - [adjust the view](#choose-how-entries-are-grouped) to display entries grouped either by locale or by content-type, -->
- decide whether an entry will be published or unpublished with the release,
<!-- - edit a specific entry or [remove](#remove-entries-from-a-release) it from the release, -->
- and publish the release.

## Editing a release

You can rename a release. To do so, while on a release page:

1. Click on the ![More icon](/img/assets/icons/more.svg) button in the top right corner of the admin panel.
2. Select ![Edit icon](/img/assets/icons/edit.svg) **Edit**.
3. In the modal, change the name of the release in the _Name_ field.
4. Click **Continue** to save the change.

<!-- TODO: re-add when implemented -->
<!-- ## Choose how entries are grouped

A release page can display entries either grouped by locales or by content-type. To change how entries are grouped, click the **Group by …** dropdown and select an option from the list. -->

<!-- TODO: add screenshot? -->

## Publish or unpublish entries

A release includes multiple entries. You can set the state of each entry with the **Publish** and **Unpublish** action buttons. When the release itself is “published” then the desired actions will be simultaneously performed on each entry.

<!-- TODO: re-add when implemented -->
<!-- ## Remove entries from a release

Entries can be removed from a release. To do so, click the three dots **…** at the end of the line of an entry and select the **Remove from release** button. -->

## Publishing a release

Publishing a release means that all the actions (publish or unpublish) defined for each entry included in the release will be performed simultaneously. To publish a release, click the **Publish** button in the top right corner of the admin panel.

:::caution
Once a release is published, the release itself cannot be updated. You can not re-release that specific release with the same group of entries with some modifications; you must create another release.
:::

## Deleting a release

You can delete a release. Deleting a release will only delete the release itself, but not the content-type entries included in the release. To delete a release, while on the release page:

1. Click on the ![More icon](/img/assets/icons/more.svg) button in the top right corner of the admin panel.
2. Select ![Delete icon](/img/assets/icons/delete.svg) **Delete**.
3. In the confirmation dialog, click ![Delete icon](/img/assets/icons/delete.svg) **Confirm**.
