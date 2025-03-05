---
title: Including content in a release
description: Instructions to include content in a release
displayed_sidebar: userDocsSidebar
tags:
- admin panel
- Growth feature
- Enterprise feature
- releases feature
---

# Including content in a release {#add-to-release}
<GrowthBadge /> <EnterpriseBadge />

Using the [Releases](/user-docs/releases/introduction) feature, you can group several entries to publish them altogether. Adding entries to a release is done from the Content Manager. You can also remove an entry from a release while updating the entry.

:::prerequisites
- Before entries can be added to a release, you must create a release from the [Releases](/user-docs/releases/creating-a-release) page.
- Adding content to a release requires the appropriate permissions for the Content-Releases plugin (see [configuring administrator roles](/user-docs/users-roles-permissions/configuring-administrator-roles#plugins-and-settings)).
:::

## Adding multiple entries to a release

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

## Adding an entry to a release

An entry can be added to a [release](/user-docs/releases/introduction) while editing it from the edit view of the Content Manager.

To add an entry to a release:

1. Click on <Icon name="dots-three-outline" /> in the _Entry_ area on the right side of the interface.
2. In the list, click on the <Icon name="paper-plane-tilt" /> **Add to release** button.
2. Select which release to add this entry to.
3. Click on the **Publish** or **Unpublish** button depending on whether you want the entry to be published or unpublished when the release itself is published, then click **Continue**.

The *Releases* box on the right should show which release(s) the entry is included in.

:::info
If [Releases scheduling](/user-docs/releases/managing-a-release#scheduling-a-release) is enabled and the entry is added to a scheduled release, the release date and time will also be displayed.
:::

## Removing an entry from a release

An entry can be removed from a [release](/user-docs/releases/introduction) while editing it from the edit view of the Content Manager.

To remove an entry from a release:

1. In the *Releases* box in the right sidebar, click on <Icon name="dots-three-outline" /> below the name of the release.
2. Click the **Remove from release** button.

<!-- TODO: re-add when implemented -->
<!-- :::tip
You can also remove multiple entries from a release directly from the release page (see [Managing a release](/user-docs/releases/managing-a-release)).
::: -->

<!-- TODO: add screenshot -->
