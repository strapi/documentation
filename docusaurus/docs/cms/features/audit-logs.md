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
- payload
- features
---

# Audit Logs
<EnterpriseBadge />

The Audit Logs feature provides a searchable and filterable display of all activities performed by users of the Strapi application.

<IdentityCard>
  <IdentityCardItem icon="credit-card" title="Plan">Enterprise plan.</IdentityCardItem>
  <IdentityCardItem icon="user" title="Role & permission">Super Admin role in the project's admin panel.</IdentityCardItem>
  <IdentityCardItem icon="toggle-left" title="Activation">Available by default, if required plan.</IdentityCardItem>
  <IdentityCardItem icon="laptop" title="Environment">Available in both Development & Production environment.</IdentityCardItem>
</IdentityCard>

<ThemedImage
  alt="Audit Logs panel"
  sources={{
    light: '/img/assets/settings/settings_audit-logs.png',
    dark: '/img/assets/settings/settings_audit-logs_DARK.png',
  }}
/>

## Usage

**Path to use the feature:** <Icon name="gear-six" /> Settings > Administration Panel - Audit Logs

The Audit Logs feature logs the following events:

| Event | Actions |
| --- | --- |
| Content Type | `create`, `update`, `delete` |
| Entry (draft/publish) | `create`, `update`, `delete`, `publish`, `unpublish` |
| Media | `create`, `update`, `delete` |
| Login / Logout | `success`, `fail` |
| Role / Permission | `create`, `update`, `delete` |
| User | `create`, `update`, `delete` |

For each log item, the following information is displayed:

- Action: type of action performed by the user (e.g.`create` or `update`).
- Date: date and time of the action.
- User: user who performed the action.
- Details: displays a modal with more details about the action (e.g. the User IP address, the request body, or the response body).


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
