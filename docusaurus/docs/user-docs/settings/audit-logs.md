---
title: Viewing Audit Logs 
description: Reviewing the audit logs in Strapi.
sidebar_position: 2
tags:
- audit logs
- admin panel
- Enterprise feature
- payload
- Strapi Cloud
---

# Audit Logs <EnterpriseBadge withLinkIcon link="https://strapi.io/pricing-self-hosted" /> <CloudTeamBadge/>
<EnterpriseBadge /> <CloudTeamBadge/>

The **Audit Logs** section provides a searchable and filterable display of all activities performed by users of the Strapi application.

Audit logs are only accessible to users with the **Super Admin** role by default. They are available in the **Administration Panel** section of the **Settings** panel.

<ThemedImage
  alt="Audit Logs panel"
  sources={{
    light: '/img/assets/settings/settings_audit-logs.png',
    dark: '/img/assets/settings/settings_audit-logs_DARK.png',
  }}
/>

## Events logged

The following events are logged:

| Event | Actions |
| --- | --- |
| Content Type | `create`, `update`, `delete` |
| Entry (draft/publish) | `create`, `update`, `delete`, `publish`, `unpublish` |
| Media | `create`, `update`, `delete` |
| Login / Logout | `success`, `fail` |
| Role / Permission | `create`, `update`, `delete` |
| User | `create`, `update`, `delete` |


For each log item the following information is displayed:

* **Action**: The type of action performed by the user. For example `create` or `update`.
* **Date**: The date and time of the action.
* **User**: The user who performed the action.
* **Details**: Displays a modal with more details about the action. For example the User IP address, the request body, or the response body.


## Filtering logs

The **Audit Logs** page displays all logs by default, in reverse chronological order. You can filter the logs by:

* **Action**: Select the type of action to filter by. For example `create` or `update`.
* **User**: Select the user to filter by.
* **Date**: Select a date (range) and time to filter by.

<ThemedImage
  alt="Audit Logs filters"
  sources={{
    light: '/img/assets/settings/settings_audit-logs-filters.png',
    dark: '/img/assets/settings/settings_audit-logs-filters_DARK.png',
  }}
/>

<!--
### Creating a custom filter

WiP


## Searching logs

Click the **Search** icon to search for a specific log. The search is performed on all log fields.
-->

## Log details

For any log item, click the <Icon name="eye" /> icon to display a modal with more details about that action.

<ThemedImage
  alt="Log details modal"
  sources={{
    light: '/img/assets/settings/settings_log-details.png',
    dark: '/img/assets/settings/settings_log-details_DARK.png',
  }}
/>

The **Payload** details are displayed in an interactive JSON component, enabling you to expand and collapse the JSON object.
