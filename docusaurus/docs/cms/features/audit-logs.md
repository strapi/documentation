---
title: Audit Logs
description: Learn how you can use the Audit Logs feature of Strapi 5.
displayed_sidebar: cmsSidebar
sidebar_position: 2
toc_max_heading_level: 5
tags:
- audit logs
- admin panel
- Enterprise feature
- MCP
- payload
- features
---

# Audit Logs
<EnterpriseBadge />

<Tldr>
Audit Logs captures every administrative action in a searchable, filterable history to aid troubleshooting and compliance. In this documentation, examples show viewing payloads and filtering by user or date.
</Tldr>

The Audit Logs feature provides a searchable and filterable display of all activities performed by users of the Strapi application.

<IdentityCard>
  <IdentityCardItem icon="credit-card" title="Plan">CMS Enterprise plan</IdentityCardItem>
  <IdentityCardItem icon="user" title="Role & permission">Minimum "Read" permission in Roles > Settings - Audit Logs</IdentityCardItem>
  <IdentityCardItem icon="toggle-right" title="Activation">Available by default, if required plan</IdentityCardItem>
  <IdentityCardItem icon="desktop" title="Environment">Available in both Development & Production environment</IdentityCardItem>
</IdentityCard>

<ThemedImage
  alt="Audit Logs panel"
  sources={{
    light: '/img/assets/settings/settings_audit-logs.png',
    dark: '/img/assets/settings/settings_audit-logs_DARK.png',
  }}
/>

## Configuration

Audit Logs are not a permanent archive. Logs older than the retention period are deleted automatically. The retention period defaults to 90 days.

:::caution
Logs deleted at the end of the retention period cannot be recovered from the Audit Logs interface.
:::

### Code-based configuration

The retention period is set with the [`auditLogs.retentionDays`](/cms/configurations/admin-panel#audit-logs) parameter of the `/config/admin` file.

If the license defines a retention period, the license value applies, unless a _smaller_ value is defined in the configuration file.

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/config/admin.js"
module.exports = ({ env }) => ({
  // … other configuration properties
  auditLogs: {
    retentionDays: 30,
  },
});
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/config/admin.ts"
export default ({ env }) => ({
  // … other configuration properties
  auditLogs: {
    retentionDays: 30,
  },
});
```

</TabItem>
</Tabs>

There is no equivalent setting in the admin panel: the retention period can only be configured from the `/config/admin` file.

The `/config/admin` file also accepts `auditLogs.enabled`, which turns off Audit Logs when set to `false`, and `auditLogs.exportMaxRows`, which limits [exports](#exporting-audit-logs). See the [admin panel configuration](/cms/configurations/admin-panel#audit-logs) for all available parameters.

:::note Audit Logs permissions and configuration
When `auditLogs.enabled` is set to `false`, the Audit Logs feature is disabled and the routes are not available. However, audit log permissions that were granted to roles and admin tokens are preserved. This means when you turn `auditLogs.enabled` back to `true`, the previously granted permissions work again without needing to be re-granted.
:::

## Usage

**Path to use the feature:** <Icon name="gear-six" /> Settings > Administration Panel - Audit Logs

The Audit Logs feature logs the following events:

| Event | Actions |
| --- | --- |
| Admin Login / Logout | `success`, `error`, `autoRegistration` |
| Audit log <VersionBadge version="5.53.0+" noTooltip /> | `export` |
| Component | `create`, `update`, `delete` |
| Content Type | `create`, `update`, `delete` |
| Entry (draft/publish) | `create`, `update`, `delete`, `publish`, `unpublish`, `draft-discard` <VersionBadge version="5.61.0+" noTooltip />, `history.restore` <VersionBadge version="5.61.0+" noTooltip /> |
| Entry assignee <VersionBadge version="5.56.1+" noTooltip /> | `update` |
| Entry review stage <VersionBadge version="5.56.1+" noTooltip /> | `updateEntryStage` |
| Locale <VersionBadge version="5.54.0+" noTooltip /> | `create`, `update`, `delete`, `default.update` |
| Media | `create`, `update`, `delete`, `move` <VersionBadge version="5.61.0+" noTooltip /> (files, and folders with Strapi 5.61.0 or later, see [media events](#media-events)) |
| Media folder | `create`, `update`, `delete` (Strapi 5.60.x and earlier) |
| Media Library settings <VersionBadge version="5.61.0+" noTooltip /> | `update` |
| Project settings <VersionBadge version="5.61.0+" noTooltip /> | `update` |
| Releases | `create`, `update`, `delete`, `trigger` |
| Release entries | `add`, `update`, `remove` |
| Release settings | `update` |
| Role / Permission | `create`, `update`, `delete` |
| SSO settings <VersionBadge version="5.59.0+" noTooltip /> | `update` |
| User <VersionBadge version="5.56.0+" noTooltip /> | `create`, `update`, `delete`, `password.update`, `password-reset.create`, `password-reset.confirm`, `invite.accept` |
| Token <VersionBadge version="5.54.0+" noTooltip /> | `create`, `update`, `delete`, `regenerate` |
| Webhook | `create`, `update`, `delete` |
| Workflow <VersionBadge version="5.56.1+" noTooltip /> | `create`, `update`, `delete` |

For each log item, the following information is displayed:

- Action: type of action performed by the user (e.g.`create` or `update`).
- Date: date and time of the action.
- User: user who performed the action.
- Details: displays a modal with more details about the action (e.g. the User IP address, the request body, or the response body).

:::note Actions logged by the MCP server
<VersionBadge version="5.52.0"/>
With Strapi 5.52.0 or later, logged actions can come from the admin panel or from the [MCP server](/cms/features/strapi-mcp-server). Entry actions performed through the MCP server are logged like their admin panel equivalents. Actions that only read content are not logged.
:::

### Understanding log details

Each type of log return different details, as explained in the following sections.

#### User events
<VersionBadge version="5.56.0"/>

User events cover admin accounts, recorded as `admin-user.*`. An update records only the fields that changed, among first name, last name, email, username, preferred language, active status, and roles. No row is written when nothing changed.

#### Admin log events

Admin login events record:

- successful logins (`admin.auth.success`),
- failed login attempts (`admin.auth.error`), which captures the reason for failure (e.g., `invalid_credentials`, `account_inactive`, `sso_connection_error`) and the authentication provider used
- and new accounts created via SSO auto-registration (`admin.auth.autoRegistration`), which records when an SSO login creates a new admin account.

Both failed login and auto-registration events are recorded with an unknown actor to protect privacy.

#### Password events

Password events cover:

- a password set from the profile or by an admin on another account (`password.update`),
- a password reset requested and confirmed from the public login page (`password-reset.create` and `password-reset.confirm`),
- and an invitation accepted (`invite.accept`).

The password, its hash, and reset or registration tokens are never recorded. These password reset and invitation actions happen with no admin session, so their User column shows `-`.

#### Token events
<VersionBadge version="5.54.0" />

Token events cover:

- [API tokens](/cms/features/api-tokens),
- [admin tokens](/cms/features/admin-tokens)
- and transfer tokens.

Each log identifies which kind it was, and an update records the fields that changed, among the token name, its description, its type and its permissions. Access keys are never recorded, including on `regenerate`.

#### Webhook events

Webhook events record configuration changes for webhooks, including the URL, headers, events, and enabled status. To protect sensitive information, webhook URLs are recorded as scheme and host only (for example, `https://hooks.example.com` instead of the full URL with path or query parameters), and header values are never recorded, only header names. An `update` event records which fields changed and how; unchanged fields are not included.

#### SSO settings events
<VersionBadge version="5.59.0"/>

SSO settings events come from the [SSO](/cms/features/sso) configuration. An update records only the fields that changed, among auto-registration, the default role, and the locked roles; saving with no change to any of them writes no row.

Locked roles are compared as a set, so reordering them alone is not recorded as a change. Role ids are always recorded as numbers, whether the form sent them as numbers or strings.

#### Locale events
<VersionBadge version="5.54.0"/>

Locale events come from [Internationalization](/cms/features/internationalization) settings. Setting a locale as the default records a separate `locale.default.update` event, in addition to the `locale.create` or `locale.update` event.

#### Media events
<VersionBadge version="5.61.0"/>

Media events come from the [Media Library](/cms/features/media-library). Files and folders share the `media.create`, `media.update`, `media.delete`, and `media.move` actions. The `resource.type` of each log tells them apart: `media` for a file, `media-folder` for a folder.

Each action records the following details:

- `media.create`: a file uploaded or a folder created. A file log records its MIME type and size.
- `media.update`: only the fields that changed. For a file, these are among the name, alternative text, caption, focus area, folder, and replaced file. For a folder, they are among the name and the parent folder. An update that changes nothing writes no row.
- `media.delete`: a file or folder deleted. Deleting a folder writes one row for that folder and one row for each file it contained, including files in its subfolders. Subfolders get no row.
- `media.move`: one row per file or folder selected in a bulk move, with the folder it moved `from` and `to` (`null` for the root). Files and folders inside a moved folder get no row, and neither does an item already in the destination folder. Changing the folder of a single file from its details records a `media.update` with the `folder` field instead.

Folder logs recorded before Strapi 5.61.0 keep their `media-folder.*` actions until they are removed by the [retention period](#configuration). The Action filter still finds them (see [filtering logs](#filtering-logs)).

#### Content History and draft events
<VersionBadge version="5.61.0"/>

Restoring a version from [Content History](/cms/features/content-history#restoring-a-previous-version) records an `entry.history.restore` event with the locale and the restored version (its `id` and `createdAt`). The restore also records the usual `entry.update` event.

[Discarding changes](/cms/features/draft-and-publish#discarding-changes) made to a draft records an `entry.draft-discard` event with the locale. The log identifies the entry, not the discarded draft content.

#### Project and Media Library settings events
<VersionBadge version="5.61.0"/>

These events record changes made to the following settings pages:

- Project settings (<Icon name="gear-six" /> *Settings > Global settings > Overview*): an update records changes to the [*Menu logo* and *Auth logo*](/cms/features/admin-panel#customizing-the-logo), with file names only. Uploading a new logo with the same file name is still recorded.
- Media Library settings (<Icon name="gear-six" /> *Settings > Global settings > Media Library*): an update records the [options](/cms/features/media-library#admin-panel-configuration) that changed, among `sizeOptimization`, `responsiveDimensions`, `autoOrientation`, and `aiMetadata`.

Saving either settings page with no change writes no row.

#### Review workflows events
<VersionBadge version="5.56.1"/>

Workflow, entry review stage and entry assignee events come from [Review Workflows](/cms/features/review-workflows). Workflow events record changes to a workflow configuration. Entry review stage and entry assignee events record changes made to a single entry. See [audit logging of review workflow actions](/cms/features/review-workflows#audit-logging-of-review-workflow-actions) for what each one records.

### Accessing log details {#log-details}

For any log item, click the <Icon name="eye" /> icon to access a modal with more details about that action. In the modal, the *Payload* section displays the details in an interactive JSON component, enabling you to expand and collapse the JSON object.

<ThemedImage
  alt="Log details modal"
  sources={{
    light: '/img/assets/settings/settings_log-details.png',
    dark: '/img/assets/settings/settings_log-details_DARK.png',
  }}
/>

With Strapi <VersionBadge version="5.52.0+" noTooltip />, in the payload, the `origin` key indicates where the action came from:

- `admin-panel` for the admin panel,
- `mcp` for the [MCP server](/cms/features/strapi-mcp-server),
- `scheduler` <VersionBadge version="5.53.0+" noTooltip /> for actions run automatically by Strapi, such as publishing a [scheduled release](/cms/features/releases#scheduling-a-release).

Actions with the `scheduler` origin have no user, so their User column shows `-`. The audit log entry recorded when the release was scheduled identifies who scheduled it.

### Filtering logs

By default, all logs are displayed in reverse chronological order. You can filter the logs by:

- Action: select the type of action to filter by (e.g `create` or `update`).
- User: select the user to filter by.
- Date: select a date and, optionally, a time to filter by. A date alone matches the entire day; adding a time narrows the match to that specific minute.

<ThemedImage
  alt="Audit Logs filters"
  sources={{
    light: '/img/assets/settings/settings_audit-logs-filters.png',
    dark: '/img/assets/settings/settings_audit-logs-filters_DARK.png',
  }}
/>

:::info
The Action filter also matches the legacy `user.create`, `user.update` and `user.delete` values recorded before the `admin-user.*` format, so old and new rows appear together. Similarly, filtering on a Media action, such as _Update media_, also finds the `media-folder.*` logs recorded before Strapi 5.61.0 (see [media events](#media-events)).
:::

### Exporting audit logs

<VersionBadge version="5.53.0" />

Users with the `export` permission for Audit Logs can export the current filtered set of entries as a CSV file. To access this feature, the user's role must have both the **Read** and **Export** permissions under **Settings > Administration Panel > Roles > Audit Logs** (see [admin panel configuration](/cms/configurations/admin-panel#audit-logs)).

To export audit logs:

1. (Optional) Apply filters to select the entries to export.
2. Click **Export as CSV** to start pre-downloading the file. Keep the browser tab open until the pre-download completes.
3. Click **Download CSV** to save the exported file.

:::note Date filter and exports
The Date filter matches an entire day, or a specific minute when a time is picked (see [filtering logs](#filtering-logs)). The export uses the same day or minute bounds as the filtered list, so the CSV file contains the same entries.
:::

Every export is itself recorded as an `audit-log.export` event. This event is included in the exported CSV file.

By default, exports are limited to 1,000,000 rows. To change this limit, set the `auditLogs.exportMaxRows` parameter in the [admin panel configuration](/cms/configurations/admin-panel#audit-logs).
