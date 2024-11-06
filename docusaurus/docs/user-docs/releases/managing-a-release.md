---
title: Managing a release
description: Instructions on how to manage a Release from the admin panel
tags:
- admin panel
- Enterprise feature
- Releases feature
- Strapi Cloud
---

# Managing a release <EnterpriseBadge /> <CloudTeamBadge />

Adding entries to a [release](/user-docs/releases/introduction) allow viewing them altogether on a single page.

<ThemedImage
  alt="Release details"
  sources={{
    light: '/img/assets/releases/release-details.png',
    dark: '/img/assets/releases/release-details_DARK.png',
  }}
/>

<br /><br />

From a release page, you can:

- edit the release, to update its name or schedule it, or delete the release,
- decide whether an entry will be published or unpublished with the release,
- and publish the release.

<!-- - [adjust the view](#choose-how-entries-are-grouped) to display entries grouped either by locale or by content-type, -->
<!-- - edit a specific entry or [remove](#remove-entries-from-a-release) it from the release, -->

:::caution
Since publishing an entry with a release means turning a draft entry into a published entry, Releases will not work if [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content) is disabled for the content-type.
:::

## Editing a release

You can rename a release. To do so, while on a release page:

1. Click on the ![More icon](/img/assets/icons/v5/More.svg) button in the top right corner of the admin panel.
2. Select ![Edit icon](/img/assets/icons/v5/Pencil.svg) **Edit**.
3. In the modal, change the name of the release in the _Name_ field.
4. Click **Continue** to save the change.

## Scheduling a release

Releases can be [published manually](#publishing-a-release) or scheduled to be automatically published at a given date and time, with the timezone of your choice.

You can schedule a release:
- when [creating the release](/user-docs/releases/creating-a-release),
- or once the release is already created, by editing it.

To schedule an existing release, while on a release page:
1. Click on the ![More icon](/img/assets/icons/v5/More.svg) button in the top right corner of the admin panel.
2. Select ![Edit icon](/img/assets/icons/v5/Pencil.svg) **Edit**.
3. In the modal, check the **Schedule release** checkbox.
4. Select a date, time, and timezone for the release to be published.
5. Click **Save**.

<ThemedImage
  alt="Release scheduling"
  sources={{
    light: '/img/assets/releases/release-scheduling.png',
    dark: '/img/assets/releases/release-scheduling_DARK.png',
  }}
/>

## Choosing how entries are grouped

A release page can display entries either grouped by locale, content-type, or action (publish or unpublish). To change how entries are grouped, click the **Group by …** dropdown and select an option from the list.

## Publishing or unpublishing entries

A release includes multiple entries. You can set the state of each entry with the **Publish** and **Unpublish** action buttons. When the release itself is “published” then the desired actions will be simultaneously performed on each entry.

## Removing entries from a release

Entries can be removed from a release. To do so, click the ![More icon](/img/assets/icons/v5/More.svg) at the end of the row of an entry and select the **Remove from release** button.

## Publishing a release

Publishing a release means that all the actions (publish or unpublish) defined for each entry included in the release will be performed simultaneously. To publish a release, click the **Publish** button in the top right corner of the admin panel.

The _Status_ column displays the status of each entry:

   - ![Success icon](/img/assets/icons/v5/CheckCircle.svg) Already published: the entry is already published and publishing the release will not affect this entry 
   - ![Success icon](/img/assets/icons/v5/CheckCircle.svg) Already unpublished: the entry is already unpublished, and publishing the release will not affect this entry.
   - ![Success icon](/img/assets/icons/v5/CheckCircle.svg) Ready to publish: the entry is ready to  be published with the release
   - ![Success icon](/img/assets/icons/v5/CheckCircle.svg) Ready to unpublish: the entry is ready to  be unpublished with the release
   - ![Fail icon](/img/assets/icons/v5/CrossCircle2.svg) Not ready to publish: the entry cannot be published because some fields are incorrectly filled, or it hasn't reached the required stage for publishing. In this case, the release will be indicated as *Blocked* until all issues have been fixed.
   
If some of your entries have a ![Fail icon](/img/assets/icons/v5/CrossCircle2.svg) status, click the ![More icon](/img/assets/icons/v5/More.svg) and the **Edit the entry** button to fix the issues until all entries have the ![Success icon](/img/assets/icons/v5/CheckCircle.svg) status. Note that you will have to click on the **Refresh** button to update the release page as you fix the various entries issues.

:::caution
Once a release is published, the release itself cannot be updated. You can not re-release that specific release with the same group of entries with some modifications; you must create another release.
:::

## Deleting a release

You can delete a release. Deleting a release will only delete the release itself, but not the content-type entries included in the release. To delete a release, while on the release page:

1. Click on the ![More icon](/img/assets/icons/v5/More.svg) button in the top right corner of the admin panel.
2. Select ![Delete icon](/img/assets/icons/v5/Trash.svg) **Delete**.
3. In the confirmation dialog, click ![Delete icon](/img/assets/icons/v5/Trash.svg) **Confirm**.
