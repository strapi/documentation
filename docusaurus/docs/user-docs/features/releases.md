---
title: Releases
description: Learn how to use the Releases feature that enables content managers to organize entries to publish/unpublish simultaneously
toc_max_heading_level: 5
tags:
- admin panel
- Enterprise feature
- Releases feature
- Strapi Cloud
pagination_next: user-docs/releases/creating-a-release
---

# Releases
<GrowthBadge/> <EnterpriseBadge /> <CloudTeamBadge/>

The Releases feature enables content managers to organize entries into containers that can perform publish and unpublish actions simultaneously. A release can contain entries from different content types and can mix locales.

:::prerequisites Identity Card of the Feature
<Icon name="credit-card"/> **Plan:** Enterprise Edition or Cloud Team plan. <br/>
<Icon name="user"/> **Role & permission:** Administrator role in the project's admin panel. <br/>
<Icon name="toggle-left"/> **Activation:** Available by default, if required plan. <br/>
<Icon name="laptop"/> **Environment:** Available in both Development & Production environment.
:::

<ThemedImage
  alt="List of Releases"
  sources={{
    light: '/img/assets/releases/releases-overview2.png',
    dark: '/img/assets/releases/releases-overview2_DARK.png',
  }}
/>

## Configuration

To be able to include your content in releases, and to schedule and publish those releases, you must first create them. You can also delete releases that are obsolete or irrelevant. You can also modify the releases' default timezone to use when scheduling a publication.

### Choosing default timezone

**Path to configure the feature:** ![Settings icon](/img/assets/icons/v5/Cog.svg) Settings

1. Click on the _Default timezone_ dropdown list and choose the default timezone to use.
2. Click **Save**.

<ThemedImage
  alt="Release settings"
  sources={{
    light: '/img/assets/releases/release-settings.png',
    dark: '/img/assets/releases/release-settings_DARK.png',
  }}
/>

### Creating a release

**Path to configure the feature:** ![Releases icon](/img/assets/icons/v5/PaperPlane.svg) Releases

1. Click the ![Plus icon](/img/assets/icons/v5/Plus.svg) **New Release** button in the upper right corner.  
2. Give the release a name.
3. (_optional_) If you want to schedule the release publication instead of publishing the release manually, check the **Schedule release** checkbox and define the date, time, and timezone for publication. Scheduling is currently a <FeatureFlagBadge /> feature (see [scheduling a release](/user-docs/releases/managing-a-release#scheduling-a-release) for details).
4. Click the **Continue** button.

:::tip
Your releases can be renamed afterwards, by editing the release using the ![More icon](/img/assets/icons/v5/More.svg) then ![Edit icon](/img/assets/icons/v5/Pencil.svg) **Edit** buttons.
:::

<ThemedImage
  alt="Adding a new release"
  sources={{
    light: '/img/assets/releases/new-release.png',
    dark: '/img/assets/releases/new-release_DARK.png',
  }}
/>

<!-- TO INTEGRATE IF THE CALLOUT ISN'T ENOUGH

### Renaming a release

You can rename a release. To do so, while on a release page:

1. Click on the ![More icon](/img/assets/icons/v5/More.svg) button in the top right corner of the admin panel.
2. Select ![Edit icon](/img/assets/icons/v5/Pencil.svg) **Edit**.
3. In the modal, change the name of the release in the _Name_ field.
4. Click **Continue** to save the change.-->

### Deleting a release

**Path to configure the feature:** ![Releases icon](/img/assets/icons/v5/PaperPlane.svg) Releases

Deleting a release will only delete the release itself, but not the content-type entries included in the release.

1. Click on the ![More icon](/img/assets/icons/v5/More.svg) button in the top right corner of the admin panel.
2. Select ![Delete icon](/img/assets/icons/v5/Trash.svg) **Delete**.
3. In the confirmation dialog, click ![Delete icon](/img/assets/icons/v5/Trash.svg) **Confirm**.

## Usage

**Path to use the feature:** ![Releases icon](/img/assets/icons/v5/PaperPlane.svg) Releases and ![Content icon](/img/assets/icons/v5/Feather.svg) Content Manager

:::caution
Since publishing an entry with a release means turning a draft entry into a published entry, Releases will not work if [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content) is disabled for the content-type.
:::

### Including content in a release

:::prerequisites
- Before entries can be added to a release, you must create a release from the ![Releases icon](/img/assets/icons/v5/PaperPlane.svg) Releases page.
- Adding content to a release requires the appropriate permissions for the Content-Releases plugin (see [configuring administrator roles](/user-docs/users-roles-permissions/configuring-administrator-roles#plugins-and-settings)).
:::

#### One entry at a time

**Path:** Edit view of the ![Content icon](/img/assets/icons/v5/Feather.svg) Content Manager

1. Click on ![More icon](/img/assets/icons/v5/More.svg) in the _Entry_ area on the right side of the interface.
2. In the list, click on the ![Releases icon](/img/assets/icons/v5/PaperPlane.svg) **Add to release** button.
2. Select which release to add this entry to.
3. Click on the **Publish** or **Unpublish** button depending on whether you want the entry to be published or unpublished when the release itself is published, then click **Continue**.

The *Releases* box on the right should show which release(s) the entry is included in.

:::info
If [Releases scheduling](/user-docs/releases/managing-a-release#scheduling-a-release) is enabled and the entry is added to a scheduled release, the release date and time will also be displayed.
:::

#### Multiple entries at a time

**Path:** List view of the ![Content icon](/img/assets/icons/v5/Feather.svg) Content Manager

1. Select which entries you want to add by ticking the box on the left side of the entries' record.
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

### Removing content from a release

**Path:** Edit view of the ![Content icon](/img/assets/icons/v5/Feather.svg) Content Manager

1. In the *Releases* box in the right sidebar, click on ![More icon](/img/assets/icons/v5/More.svg) below the name of the release.
2. Click the **Remove from release** button.

### Scheduling a release

**Path:** ![Releases icon](/img/assets/icons/v5/PaperPlane.svg) Releases

Releases can be [published manually](#publishing-a-release) or scheduled to be automatically published at a given date and time, with the timezone of your choice.

You can schedule a release:
- when [creating the release](#creating-a-release),
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

<!--
:::tip
A release page can display entries either grouped by locale, content-type, or action (publish or unpublish). To change how entries are grouped, click the **Group by …** dropdown and select an option from the list.
:::
-->

### Publishing a release

**Path:** ![Releases icon](/img/assets/icons/v5/PaperPlane.svg) Releases

Publishing a release means that all the actions (publish or unpublish) defined for each entry included in the release will be performed simultaneously. To publish a release, click the **Publish** button in the top right corner of the admin panel.

The _Status_ column displays the status of each entry:

   - ![Success icon](/img/assets/icons/v5/CheckCircle.svg) Already published: the entry is already published and publishing the release will not affect this entry 
   - ![Success icon](/img/assets/icons/v5/CheckCircle.svg) Ready to publish: the entry is ready to  be published with the release
   - ![Fail icon](/img/assets/icons/v5/CrossCircle2.svg) "[field name] is required", "[field name] is too short" or "[field name] is too long": the entry cannot be published because of the issue stated in the red warning message. In this case, the release will be indicated as *Blocked* until all issues have been fixed.
   
If some of your entries have a ![Fail icon](/img/assets/icons/v5/CrossCircle2.svg) status, click the ![More icon](/img/assets/icons/v5/More.svg) and the **Edit the entry** button to fix the issues until all entries have the ![Success icon](/img/assets/icons/v5/CheckCircle.svg) status. Note that you will have to click on the **Refresh** button to update the release page as you fix the various entries issues.

:::caution
Once a release is published, the release itself cannot be updated. You can not re-release that specific release with the same group of entries with some modifications; you must create another release.
:::
