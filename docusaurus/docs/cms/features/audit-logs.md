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

<VersionBadge version="4.6.0" />

<Tldr>
Audit Logs captures every administrative action in a searchable, filterable history to aid troubleshooting and compliance. In this documentation, examples show viewing payloads and filtering by user or date.
</Tldr>

The Audit Logs feature provides a searchable and filterable display of all activities performed by users of the Strapi application.

<IdentityCard>
  <IdentityCardItem icon="credit-card" title="Plan">CMS Enterprise plan</IdentityCardItem>
  <IdentityCardItem icon="user" title="Role & permission">Super Admin role in the project's admin panel</IdentityCardItem>
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

The only configurable aspect is how long logs are kept before they are deleted.

Audit Logs are not a permanent archive. Logs older than the retention period are deleted automatically. The retention period defaults to 90 days.

:::caution
Logs deleted at the end of the retention period cannot be recovered from the Audit Logs interface.
:::

### Code-based configuration

The retention period is set with the [`auditLogs.retentionDays`](/cms/configurations/admin-panel#audit-logs) parameter of the `/config/admin` file.

For Strapi Cloud projects, the value stored in the license information applies, unless a _smaller_ value is defined in the configuration file.

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

## Usage

**Path to use the feature:** <Icon name="gear-six" /> Settings > Administration Panel - Audit Logs

The Audit Logs feature logs the following events:

| Event | Actions |
| --- | --- |
| Content Type | `create`, `update`, `delete` |
| Entry (draft/publish) | `create`, `update`, `delete`, `publish`, `unpublish` |
| Media | `create`, `update`, `delete` |
| Login / Logout | `success`, `fail` |
| Releases | `create`, `update`, `delete`, `trigger` |
| Release entries | `add`, `update`, `remove` |
| Release settings | `update` |
| Role / Permission | `create`, `update`, `delete` |
| User | `create`, `update`, `delete` |

For each log item, the following information is displayed:

- Action: type of action performed by the user (e.g.`create` or `update`).
- Date: date and time of the action.
- User: user who performed the action.
- Details: displays a modal with more details about the action (e.g. the User IP address, the request body, or the response body).

With Strapi <VersionBadge version="5.52.0+" noTooltip />  logged actions can come from the admin panel or from the [MCP server](/cms/features/strapi-mcp-server). Entry actions performed through the MCP server are logged like their admin panel equivalents. Actions that only read content are not logged.


### Filtering logs

By default, all logs are displayed in reverse chronological order. You can filter the logs by:

- Action: select the type of action to filter by (e.g `create` or `update`).
- User: select the user to filter by.
- Date: select a date (range) and time to filter by.

<ThemedImage
  alt="Audit Logs filters"
  sources={{
    light: '/img/assets/settings/settings_audit-logs-filters.png',
    dark: '/img/assets/settings/settings_audit-logs-filters_DARK.png',
  }}
/>

### Accessing log details {#log-details}

For any log item, click the <Icon name="eye" /> icon to access a modal with more details about that action. In the modal, the *Payload* section displays the details in an interactive JSON component, enabling you to expand and collapse the JSON object.

<ThemedImage
  alt="Log details modal"
  sources={{
    light: '/img/assets/settings/settings_log-details.png',
    dark: '/img/assets/settings/settings_log-details_DARK.png',
  }}
/>

With Strapi <VersionBadge version="5.52.0" noTooltip />, in the payload, the `origin` key indicates where the action came from: `mcp` for the [MCP server](/cms/features/strapi-mcp-server), or `admin` for the admin panel.

### Exporting audit logs

<VersionBadge version="5.53+" noTooltip />

Users with the `export` permission for Audit Logs can export the current filtered set of entries as a CSV file. To access this feature, the user's role must have both the **Read** and **Export** permissions under **Settings > Administration Panel > Roles > Audit Logs** (see [admin panel configuration](/cms/configurations/admin-panel#audit-logs)).

To export audit logs:

1. (Optional) Apply filters to select the entries to export.
2. Click **Export** to start pre-downloading the file. Keep the browser tab open until the pre-download completes.
3. Click **Download CSV** to save the exported file.

Every export is itself recorded as an `audit-log.export` event. This event is included in the exported CSV file.

By default, exports are limited to 1,000,000 rows. To change this limit, set the `auditLogs.exportMaxRows` parameter in the [admin panel configuration](/cms/configurations/admin-panel#audit-logs).
