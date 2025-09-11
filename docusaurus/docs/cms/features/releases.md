---
title: Releases
description: Learn how to use the Releases feature that enables content managers to organize entries to publish/unpublish simultaneously
toc_max_heading_level: 5
tags:
- admin panel
- features
- Enterprise feature
- Growth feature
- releases
---

# Releases
<GrowthBadge/>

> Releases group entries into publishable batches to trigger simultaneous publish or unpublish actions across content types and locales. Instructions in this documentation detail creating releases, adding entries, and understanding plan limitations.
<br/>

The Releases feature enables content managers to organize entries into containers that can perform publish and unpublish actions simultaneously. A release can contain entries from different content types and can mix locales.

<IdentityCard>
  <IdentityCardItem icon="credit-card" title="Plan">CMS Growth and Enterprise plans</IdentityCardItem>
  <IdentityCardItem icon="user" title="Role & permission">Administrator role in the project's admin panel</IdentityCardItem>
  <IdentityCardItem icon="toggle-right" title="Activation">Available by default, if required plan</IdentityCardItem>
  <IdentityCardItem icon="desktop" title="Environment">Available in both Development & Production environment</IdentityCardItem>
</IdentityCard>

<Guideflow lightId="3r3wvy5tnk" darkId="xrgw472swp"/>

## Configuration

To be able to include your content in releases, and to schedule and publish those releases, you must first create them. You can also modify the releases' default timezone to use when scheduling a publication, as well as deleting releases that are obsolete or irrelevant.

### Choosing default timezone

**Path to configure the feature:** <Icon name="gear-six" /> Settings

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

**Path to configure the feature:** <Icon name="paper-plane-tilt" /> Releases

1. Click the <Icon name="plus" classes="ph-bold" /> **New Release** button in the upper right corner.  
2. Give the release a name.
3. (_optional_) If you want to schedule the release publication instead of publishing the release manually, check the **Schedule release** checkbox and define the date, time, and timezone for publication.
4. Click the **Continue** button.

:::tip
Your releases can be renamed afterwards, by editing the release using the <Icon name="dots-three-outline" /> then <Icon name="pencil-simple" /> **Edit** buttons.
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

1. Click on the <Icon name="dots-three-outline" /> button in the top right corner of the admin panel.
2. Select <Icon name="pencil-simple" /> **Edit**.
3. In the modal, change the name of the release in the _Name_ field.
4. Click **Continue** to save the change.-->

### Deleting a release

**Path:** <Icon name="paper-plane-tilt" /> Releases

Deleting a release will only delete the release itself, but not the content-type entries included in the release.

1. Click on the <Icon name="dots-three-outline" /> button in the top right corner of the admin panel.
2. Select <Icon name="trash" /> **Delete**.
3. In the confirmation dialog, click <Icon name="trash" /> **Confirm**.

## Usage

**Path to use the feature:** <Icon name="paper-plane-tilt" /> Releases and <Icon name="feather" /> Content Manager

:::caution
Since publishing an entry with a release means turning a draft entry into a published entry, Releases will not work if [Draft & Publish](/cms/features/draft-and-publish) is disabled for the content-type.
:::

### Including content in a release

:::prerequisites
- Before entries can be added to a release, you must create a release from the <Icon name="paper-plane-tilt" /> Releases page.
- Adding content to a release requires the appropriate permissions for the Content-Releases plugin (see [configuring administrator roles](/cms/features/users-permissions)).
:::

#### One entry at a time

**Path:** Edit view of the <Icon name="feather" /> Content Manager

1. Click on <Icon name="dots-three-outline" /> in the _Entry_ area on the right side of the interface.
2. In the list, click on the <Icon name="paper-plane-tilt" /> **Add to release** button.
2. Select which release to add this entry to.
3. Click on the **Publish** or **Unpublish** button depending on whether you want the entry to be published or unpublished when the release itself is published, then click **Continue**.

The *Releases* box on the right should show which release(s) the entry is included in.

:::info
If [Releases scheduling](/cms/features/releases#scheduling-a-release) is enabled and the entry is added to a scheduled release, the release date and time will also be displayed.
:::

#### Multiple entries at a time

**Path:** List view of the <Icon name="feather" /> Content Manager

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

### Removing content from a release {#removing-an-entry-from-a-release}

**Path:** Edit view of the <Icon name="feather" /> Content Manager

1. In the *Releases* box in the right sidebar, click on <Icon name="dots-three-outline" /> below the name of the release.
2. Click the **Remove from release** button.

### Scheduling a release

**Path:** <Icon name="paper-plane-tilt" /> Releases

Releases can be [published manually](#publishing-a-release) or scheduled to be automatically published at a given date and time, with the timezone of your choice.

You can schedule a release:
- when [creating the release](#creating-a-release),
- or once the release is already created, by editing it.

To schedule an existing release, while on a release page:
1. Click on the <Icon name="dots-three-outline" /> button in the top right corner of the admin panel.
2. Select <Icon name="pencil-simple" /> **Edit**.
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

**Path:** <Icon name="paper-plane-tilt" /> Releases

Publishing a release means that all the actions (publish or unpublish) defined for each entry included in the release will be performed simultaneously.

To publish a release, click the **Publish** button in the top right corner of the admin panel. Before, make sure to check the status of both the release and its entries.

  - A badge at the top of the interface indicates the status of your release:
    - `Empty`: no entry has been added to the release yet
    - `Blocked`: content has been added to the release but at least one issue in an entry prevents the release from being published
    - `Ready`: content has been added to the release, all checks have been passed and the release can be published
    - `Done`: the release has been released and is now done

  - The _Status_ column displays the status of each entry:
    - <Icon name="check-circle" color="rgb(58,115,66)"/> Already published: the entry is already published and publishing the release will not affect this entry 
    - <Icon name="check-circle" color="rgb(58,115,66)"/> Already unpublished: the entry is already unpublished, and publishing the release will not affect this entry.
    - <Icon name="check-circle" color="rgb(58,115,66)"/> Ready to publish: the entry is ready to  be published with the release
    - <Icon name="check-circle" color="rgb(58,115,66)"/> Ready to unpublish: the entry is ready to  be unpublished with the release
    - <Icon name="x-circle" color="rgb(190,51,33)" /> Not ready to publish: the entry cannot be published because some fields are incorrectly filled, or it hasn't reached the required stage for publishing. In this case, the release will be indicated as *Blocked* until all issues have been fixed.

If your release is `Blocked` because some of your entries have a <Icon name="x-circle" color="rgb(190,51,33)" /> status, click the <Icon name="dots-three-outline" /> button, then **Edit the entry** to fix the issues until all entries have the <Icon name="check-circle" color="rgb(58,115,66)"/> status.

:::note
You will have to click on the **Refresh** button to update the release page as you fix the various entries issues.
:::

:::caution
Once a release is published, the release itself cannot be updated. You can not re-release that specific release with the same group of entries with some modifications; you must create another release.
:::

<ThemedImage
  alt="Release publish"
  sources={{
    light: '/img/assets/releases/publish-release.png',
    dark: '/img/assets/releases/publish-release_DARK.png',
  }}
/>
