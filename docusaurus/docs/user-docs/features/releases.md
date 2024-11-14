---
title: Releases
description: Learn how to use the Releases feature that enables content managers to organize entries to publish/unpublish simultaneously
tags:
- admin panel
- Enterprise feature
- Releases feature
- Strapi Cloud
pagination_next: user-docs/releases/creating-a-release
---

# Releases <EnterpriseBadge /> <CloudTeamBadge/>

The Releases feature enables content managers to organize entries into containers that can perform publish and unpublish actions simultaneously. A release can contain entries from different content types and can mix locales.

<ThemedImage
  alt="List of Releases"
  sources={{
    light: '/img/assets/releases/releases-overview2.png',
    dark: '/img/assets/releases/releases-overview2_DARK.png',
  }}
/>

## Activation

The Releases feature is available by default but only for:

- Strapi CMS projects in Enterprise Edition,
- Strapi Cloud projects in Team plan.

You need to be an Administrator of your project's admin panel to have see and have access to the Releases feature.

## Configuration

No additional configuration is required for Content History to function, and it isn't customizable.

## Usage

The Releases feature is used from ![Releases icon](/img/assets/icons/v5/PaperPlane.svg) _Releases_, accessible via the main navigation of the admin panel.

<!--
From there, it is possible to:

- [create a new release](/user-docs/releases/creating-a-release),
- view pending and done releases,
- view which releases are [scheduled](/user-docs/releases/managing-a-release#scheduling-a-release), and when they will be published (in the Pending tab) or have been published (in the Done tab),
- and click on a release to [manage its content](/user-docs/releases/managing-a-release).
-->

### Creating a release

1. Click the ![Plus icon](/img/assets/icons/v5/Plus.svg) **New Release** button in the upper right corner of the Releases page.  
2. Give the release a name.
3. (_optional_) If you want to schedule the release publication instead of publishing the release manually, check the **Schedule release** checkbox and define the date, time, and timezone for publication. Scheduling is currently a <FeatureFlagBadge /> feature (see [scheduling a release](/user-docs/releases/managing-a-release#scheduling-a-release) for details).
4. Click the **Continue** button.

<ThemedImage
  alt="Adding a new release"
  sources={{
    light: '/img/assets/releases/new-release.png',
    dark: '/img/assets/releases/new-release_DARK.png',
  }}
/>

Adding entries to a release must be done from the Content Manager. You can add a single entry to a release while creating or editing the entry [in the edit view](/user-docs/content-manager/adding-content-to-releases).

### Managing a release

Adding entries to a [release](/user-docs/releases/introduction) allow viewing them altogether on a single page.

<ThemedImage
  alt="Release details"
  sources={{
    light: '/img/assets/releases/release-details.png',
    dark: '/img/assets/releases/release-details_DARK.png',
  }}
/>

From a release page, you can:

- edit the release, to update its name or schedule it, or delete the release,
- decide whether an entry will be published or unpublished with the release,
- and publish the release.

<!-- - [adjust the view](#choose-how-entries-are-grouped) to display entries grouped either by locale or by content-type, -->
<!-- - edit a specific entry or [remove](#remove-entries-from-a-release) it from the release, -->

:::caution
Since publishing an entry with a release means turning a draft entry into a published entry, Releases will not work if [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content) is disabled for the content-type.
:::

#### Editing a release

You can rename a release. To do so, while on a release page:

1. Click on the ![More icon](/img/assets/icons/v5/More.svg) button in the top right corner of the admin panel.
2. Select ![Edit icon](/img/assets/icons/v5/Pencil.svg) **Edit**.
3. In the modal, change the name of the release in the _Name_ field.
4. Click **Continue** to save the change.

#### Scheduling a release

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

#### Choosing how entries are grouped

A release page can display entries either grouped by locale, content-type, or action (publish or unpublish). To change how entries are grouped, click the **Group by …** dropdown and select an option from the list.

#### Publishing or unpublishing entries

A release includes multiple entries. You can set the state of each entry with the **Publish** and **Unpublish** action buttons. When the release itself is “published” then the desired actions will be simultaneously performed on each entry.

#### Removing entries from a release

Entries can be removed from a release. To do so, click the ![More icon](/img/assets/icons/v5/More.svg) at the end of the row of an entry and select the **Remove from release** button.

#### Publishing a release

Publishing a release means that all the actions (publish or unpublish) defined for each entry included in the release will be performed simultaneously. To publish a release, click the **Publish** button in the top right corner of the admin panel.

The _Status_ column displays the status of each entry:

   - ![Success icon](/img/assets/icons/v5/CheckCircle.svg) Already published: the entry is already published and publishing the release will not affect this entry 
   - ![Success icon](/img/assets/icons/v5/CheckCircle.svg) Ready to publish: the entry is ready to  be published with the release
   - ![Fail icon](/img/assets/icons/v5/CrossCircle2.svg) "[field name] is required", "[field name] is too short" or "[field name] is too long": the entry cannot be published because of the issue stated in the red warning message. In this case, the release will be indicated as *Blocked* until all issues have been fixed.
   
If some of your entries have a ![Fail icon](/img/assets/icons/v5/CrossCircle2.svg) status, click the ![More icon](/img/assets/icons/v5/More.svg) and the **Edit the entry** button to fix the issues until all entries have the ![Success icon](/img/assets/icons/v5/CheckCircle.svg) status. Note that you will have to click on the **Refresh** button to update the release page as you fix the various entries issues.

:::caution
Once a release is published, the release itself cannot be updated. You can not re-release that specific release with the same group of entries with some modifications; you must create another release.
:::

#### Deleting a release

You can delete a release. Deleting a release will only delete the release itself, but not the content-type entries included in the release. To delete a release, while on the release page:

1. Click on the ![More icon](/img/assets/icons/v5/More.svg) button in the top right corner of the admin panel.
2. Select ![Delete icon](/img/assets/icons/v5/Trash.svg) **Delete**.
3. In the confirmation dialog, click ![Delete icon](/img/assets/icons/v5/Trash.svg) **Confirm**.

### Including content in a release

Using the [Releases](/user-docs/releases/introduction) feature, you can group several entries to publish them altogether. Adding entries to a release is done from the Content Manager. You can also remove an entry from a release while updating the entry.

:::prerequisites
- Before entries can be added to a release, you must create a release from the [Releases](/user-docs/releases/creating-a-release) page.
- Adding content to a release requires the appropriate permissions for the Content-Releases plugin (see [configuring administrator roles](/user-docs/users-roles-permissions/configuring-administrator-roles#plugins-and-settings)).
:::

#### Adding multiple entries to a release

Multiple entries can be added to a [release](/user-docs/releases/introduction) from the list view of the Content Manager.

To add entries to a release:

1. From the list view of the Content Manager, select which entries you want to add by ticking the box on the left side of the entries' record.
2. Click on the **Add to release** button located above the header of the table.
3. In the modal, select which release to add these entries to.
4. Click on the **Publish** or **Unpublish** button to decide whether these entries will be published or unpublished when the release is published, then click **Continue**.

<ThemedImage
  alt="Including content in a release"
  sources={{
    light: '/img/assets/releases/releases-cm-list-view.png',
    dark: '/img/assets/releases/releases-cm-list-view_DARK.png',
  }}
/>

#### Adding an entry to a release

An entry can be added to a [release](/user-docs/releases/introduction) while editing it from the edit view of the Content Manager.

To add an entry to a release:

1. Click on ![More icon](/img/assets/icons/v5/More.svg) in the _Entry_ area on the right side of the interface.
2. In the list, click on the ![Releases icon](/img/assets/icons/v5/PaperPlane.svg) **Add to release** button.
2. Select which release to add this entry to.
3. Click on the **Publish** or **Unpublish** button depending on whether you want the entry to be published or unpublished when the release itself is published, then click **Continue**.

The *Releases* box on the right should show which release(s) the entry is included in.

:::info
If [Releases scheduling](/user-docs/releases/managing-a-release#scheduling-a-release) is enabled and the entry is added to a scheduled release, the release date and time will also be displayed.
:::

#### Removing an entry from a release

An entry can be removed from a [release](/user-docs/releases/introduction) while editing it from the edit view of the Content Manager.

To remove an entry from a release:

1. In the *Releases* box in the right sidebar, click on ![More icon](/img/assets/icons/v5/More.svg) below the name of the release.
2. Click the **Remove from release** button.