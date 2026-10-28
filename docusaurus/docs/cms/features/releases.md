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
<GrowthBadge/> <EnterpriseBadge />

<Tldr>
Releases group entries into publishable batches to publish or unpublish them together across content types and locales. A release mode defines whether entries that are not ready block the release or are skipped. This documentation covers creating, scheduling, and publishing releases, reviewing their results, and republishing skipped entries.
</Tldr>

The Releases feature enables content managers to organize entries into containers that can perform publish and unpublish actions together. A release can contain entries from different content types and can mix locales. A release mode, chosen when the release is created, defines whether entries that are not ready block the whole release or are skipped.

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
2. In the side panel, give the release a name in the *Release name* field.
3. Define when the release is published:
   - To schedule the release, select the date, time, and timezone for publication.
   - To publish the release manually, check the *I don't have a release date yet* checkbox.
4. In the *Release mode* area, choose how the release handles entries that are not ready (see [Choosing a release mode](#choosing-a-release-mode)).
5. Click the **Create release** button.

:::tip
Your releases can be renamed, rescheduled, or switched to another release mode afterwards, by editing the release using the <Icon name="dots-three-outline" /> then <Icon name="pencil-simple" /> **Edit** buttons. A release can be edited until it has been published.
:::

<!-- TODO: Replace new-release.png and new-release_DARK.png: the creation modal is now a side panel with a Release mode area. -->
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

### Choosing a release mode

**Path:** <Icon name="paper-plane-tilt" /> Releases

The release mode defines what happens when a release is published while some of its entries are not ready. You choose the release mode when [creating a release](#creating-a-release), and can change it by editing the release until the release has been published.

An entry is ready when it can be published. Its fields must pass validation. If its [review workflow requires a stage for publishing](/cms/features/review-workflows#requiring-a-stage-for-publishing), the entry must be at that stage. Entries set to be unpublished are always ready.

<!-- source: packages/core/content-releases/admin/src/translations/en.json (release-condition.*, pages.Releases.release-condition.*), docs/docs/packages/core/content-releases/01-backend.md "Publishing a release" -->
| Release mode | Label in the releases list | What happens when the release is published |
| --- | --- | --- |
| Require every entry to be ready (default) | All required | Strapi publishes or unpublishes every entry, or none. If at least 1 entry is not ready, nothing is published: a manual publication is refused, and a scheduled release ends as `Failed`. If an error occurs while an entry is published or unpublished, all changes are canceled and the release ends as `Failed`. |
| Release all ready items | Allow partial | Strapi publishes or unpublishes the entries that are ready and skips the others. If an error occurs while an entry is published or unpublished, only that entry is skipped. |

:::tip
Use *Release all ready items* for scheduled releases that must go out on time, even if some entries are not finished. Skipped entries can be published later by [creating a release from skipped entries](#creating-a-release-from-skipped-entries).
:::

### Deleting a release

**Path:** <Icon name="paper-plane-tilt" /> Releases

Deleting a release will only delete the release itself, but not the content-type entries included in the release. A release that has already been published cannot be deleted.

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
- Adding content to a release requires the appropriate permissions for the Content-Releases plugin (see [configuring administrator roles](/cms/features/rbac#configuring-roles-permissions)).
:::

:::caution
A release stores a reference to an entry, not a copy of its content. If the draft is edited after being added to a release, the release will publish the latest saved version of the draft, not the version that existed when the entry was added. A release cannot be pinned to a specific version of an entry. To publish an earlier version, restore it as the draft using [Content History](/cms/features/content-history) before the release is published.
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
3. In the side panel, uncheck the *I don't have a release date yet* checkbox.
4. Select a date, time, and timezone for the release to be published.
5. Click **Save**.

:::caution
If the Strapi server is unavailable at the scheduled time, the release is not published. After 5 minutes, the release ends as `Failed` and all its entries are skipped (see [Reviewing release results](#reviewing-release-results)). A scheduled release that contains no entries ends as `Done`.
:::

<!-- TODO: Replace release-scheduling.png and release-scheduling_DARK.png: scheduling now happens in the edit side panel. -->

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

Publishing a release means that the action (publish or unpublish) defined for each entry included in the release is performed. The [release mode](#choosing-a-release-mode) decides what happens to entries that are not ready.

To publish a release, click the **Publish** button in the top right corner of the admin panel. Before, make sure to check the status of both the release and its entries.

  - A badge at the top of the interface indicates the status of your release:
    - `Empty`: no entry has been added to the release yet.
    - `Ready`: the release can be published. With the *Release all ready items* mode, a release is ready if at least 1 entry is ready. The entries that are not ready are skipped.
    - `Blocked`: publishing the release now would publish nothing. With the *Require every entry to be ready* mode, at least 1 entry is not ready. With the *Release all ready items* mode, no entry is ready.

  - The _Status_ column displays the status of each entry:
    - `Ready`: the entry will be published or unpublished with the release.
    - `Not ready`: the entry cannot be published because some fields are incorrectly filled, or it hasn't reached the required stage for publishing.

  - The *All*, *Ready*, and *Not ready* tabs filter the list of entries by status.

To fix an entry that is not ready:

1. Click **Not ready** in the _Status_ column of the entry. A side panel lists the reasons: each invalid field and what is wrong with it, or the review stage the entry has not reached yet.
2. Click **Go to entry**. The entry opens in the Content Manager with its validation errors displayed.
3. Fix the issues.
4. Save the entry.
5. Go back to the release page.
6. Click the **Refresh** button to update the statuses.

:::note
When you click **Publish**, Strapi checks every entry again. The release is published based on the current state of its entries, even if the displayed statuses are outdated. If publishing the release would publish nothing, Strapi displays the reason and the release is not published.
:::

:::caution
Once a release is published, it cannot be edited, deleted, or published again, and entries cannot be added to it or removed from it. To publish entries that were skipped, [create a release from skipped entries](#creating-a-release-from-skipped-entries).
:::

<!-- TODO: Replace publish-release.png and publish-release_DARK.png: entry statuses are now Ready / Not ready, with Ready and Not ready tabs. -->

<ThemedImage
  alt="Release publish"
  sources={{
    light: '/img/assets/releases/publish-release.png',
    dark: '/img/assets/releases/publish-release_DARK.png',
  }}
/>

### Reviewing release results

**Path:** <Icon name="paper-plane-tilt" /> Releases

Once a release has been published, manually or at its scheduled time, its badge displays the final status of the release:

- `Done`: every entry was published or unpublished.
- `Partial`: some entries were published or unpublished, and the others were skipped. Only releases using the *Release all ready items* mode can end as `Partial`.
- `Failed`: no entry was published or unpublished.

The header of the release page indicates how many entries were released (published or unpublished) and how many were skipped. The *All*, *Released*, and *Skipped* tabs filter the list of entries by result.

The _Status_ column displays `Done` for entries that were published or unpublished, and `Skipped` for the others, with the reason they were skipped:

<!-- source: packages/core/content-releases/admin/src/translations/en.json (pages.ReleaseDetails.outcome.*), packages/core/content-releases/shared/constants.ts (RELEASE_ACTION_OUTCOMES) -->
| Reason | Description |
| --- | --- |
| Validation error | Some fields of the entry were incorrectly filled when the release was published. This includes a unique value already used by another entry of the same release. |
| Not ready to publish | The entry had not reached the required stage for publishing. |
| Error | A server error prevented the entry from being published or unpublished. The error does not come from the content of the entry. |
| Waiting on other entries | The entry was ready, but the release requires every entry to be ready and some were not. |
| Server unavailable | The release could not be published at the scheduled time, for example because the server was unavailable. |

To see why an entry was skipped:

1. Click **Skipped** in the _Status_ column of the entry. A side panel displays the reasons captured when the release was published.
2. (_optional_) Click **Previous** or **Next** to browse the other skipped entries.
3. (_optional_) Click **Go to entry** to open the entry in the Content Manager.

:::note
A release that failed before your project was upgraded to a Strapi version supporting partial releases displays the `Unknown` status for its entries. Strapi did not record which entries were published before the failure.
:::
<!-- TODO: Add the Strapi version that introduces partial releases once strapi/strapi#28339 is released. -->

When a release is published, Strapi also sends the [`releases.publish` webhook](/cms/backend-customization/webhooks#releases-publish), which includes the release status and the number of published, unpublished, and skipped entries.

### Creating a release from skipped entries

**Path:** <Icon name="paper-plane-tilt" /> Releases

A release cannot be published twice. To publish the entries skipped by a `Partial` or `Failed` release, create a new release containing these entries.

:::prerequisites
- The status of the release is `Partial` or `Failed`.
- Your role has the permissions to create releases and to add entries to releases (see [configuring administrator roles](/cms/features/rbac#configuring-roles-permissions)).
:::

1. Open the `Partial` or `Failed` release.
2. Click the **Create release from skipped** button in the top right corner of the admin panel. A side panel lists the entries carried over to the new release, with their publish or unpublish action.
3. (_optional_) Click <Icon name="trash" /> next to an entry to leave it out of the new release. The last remaining entry cannot be removed.
4. (_optional_) Change the *Release name*. By default, the name is the name of the original release followed by "- skipped entries".
5. Define when the release is published:
   - To schedule the release, select the date, time, and timezone for publication.
   - To publish the release manually, check the *I don't have a release date yet* checkbox.
6. (_optional_) Change the release mode. By default, the new release uses *Release all ready items*, so entries that are still not ready do not block the others.
7. Click the **Create release** button.

The original release is not modified. The new release does not include entries deleted since the original release was published. It also does not include entries whose content-type was deleted or no longer uses [Draft & Publish](/cms/features/draft-and-publish).

### Filtering and sorting releases

**Path:** <Icon name="paper-plane-tilt" /> Releases

The Releases page lists all releases in a single table, with the name, status, schedule, number of entries, and release mode of each release. Click a release to open it.

To filter releases:

1. Click the **Filters** button above the table.
2. Select a field: *Status*, *Release mode*, *Scheduled for*, or *Released on*.
3. Select an operator.
4. Select a value. For *Scheduled for* and *Released on*, the value is a date and, optionally, a time.
5. Click **Add filter**.

Applied filters are displayed as tags above the table. To remove a filter, click the <Icon name="x" /> icon of its tag. To edit a filter, click the text of its tag. To remove all filters, click **Clear all**.

To sort releases, click the **Sort** menu and select an option:

- *Most recent updates* (default)
- *Oldest updates*
- *Most recently created*
- *Name (A to Z)*
- *Name (Z to A)*

<!-- TODO: Add a screenshot of the Releases page with filters. -->

### Audit logging of release actions

<EnterpriseBadge />

Release actions are automatically captured in [Audit Logs](/cms/features/audit-logs) for Enterprise plan users. Every significant change to a release, its entries, or its settings produces a log entry, regardless of whether the action came from the admin panel or a scheduled job.

The following actions are recorded:

| Action | What is logged |
| --- | --- |
| Create release | The new release name, whether it was scheduled, and its release mode. |
| Update release | The fields that changed (name, schedule date, timezone, release mode) and their previous and new values. No entry is created if nothing changed. |
| Delete release | The deleted release identifier. |
| Trigger release | The outcome: `success` (`Done` release), `partial` (`Partial` release), or `failure` (`Failed` release). For `success` and `partial`, the number of entries published, unpublished, and skipped. For `failure`, the error name only, no internal details. A scheduled release that could not be published because the server was unavailable is logged as a `failure`. |
| Add entry to release | One log entry per entry added, with the content type, document ID, locale, and action type (`publish` or `unpublish`). |
| Change entry on release | The previous and new action type (`publish` ↔ `unpublish`). No entry is created if nothing changed. |
| Remove entry from release | The entry that was explicitly removed from the release. |
| Update release settings | The previous and new default timezone value. No entry is created if nothing changed. |

Each log record includes the actor (user name, or `-` for scheduled triggers), the origin (`admin` for manual actions, `scheduler` for automatic ones), and the resource affected. To view release log entries, go to <Icon name="gear-six" /> **Settings > Audit Logs** and look for entries prefixed with *release*.

:::note
Deleting an entry or a locale that happens to be in a pending release does not create a "Remove entry from release" log. Only explicit removal is recorded. The delete action on the entry or locale itself is logged separately.
:::
