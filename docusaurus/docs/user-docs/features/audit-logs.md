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
- Strapi Cloud
---

# Audit Logs <EnterpriseBadge withLinkIcon link="https://strapi.io/pricing-self-hosted" /> <CloudTeamBadge/>

The Audit Logs feature provides a searchable and filterable display of all activities performed by users of the Strapi application.

<ThemedImage
  alt="Audit Logs panel"
  sources={{
    light: '/img/assets/settings/settings_audit-logs.png',
    dark: '/img/assets/settings/settings_audit-logs_DARK.png',
  }}
/>

:::prerequisites Identity Card of the Feature
<Icon name="credit-card"/> **Plan:** Enterprise Edition or Cloud Team plan. <br/>
<Icon name="user"/> **Role & permission:** Super Admin role in the project's admin panel. <br/>
<Icon name="toggle-left"/> **Activation:** Available by default, if required plan. <br/>
<Icon name="laptop"/> **Environment:** Available in both Development & Production environment.
:::

## Usage

The Audit Logs feature is accessible from the **Settings > Audit Logs** section of the admin panel.

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

* Action: The type of action performed by the user. For example `create` or `update`.
* Date: The date and time of the action.
* User: The user who performed the action.
* Details: Displays a modal with more details about the action. For example the User IP address, the request body, or the response body.


### Filtering logs

The Audit Logs page displays all logs by default, in reverse chronological order. You can filter the logs by:

* Action: Select the type of action to filter by. For example `create` or `update`.
* User: Select the user to filter by.
* Date: Select a date (range) and time to filter by.

<ThemedImage
  alt="Audit Logs filters"
  sources={{
    light: '/img/assets/settings/settings_audit-logs-filters.png',
    dark: '/img/assets/settings/settings_audit-logs-filters_DARK.png',
  }}
/>

### Accessing log details

For any log item, click the ![Eye icon](/img/assets/icons/v5/Eye.svg) icon to display a modal with more details about that action.

<ThemedImage
  alt="Log details modal"
  sources={{
    light: '/img/assets/settings/settings_log-details.png',
    dark: '/img/assets/settings/settings_log-details_DARK.png',
  }}
/>

The *Payload* details are displayed in an interactive JSON component, enabling you to expand and collapse the JSON object.
