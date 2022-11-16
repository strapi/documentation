---
title: Audit Logs - Strapi User Guide
description: Reviewing the audit logs in Strapi
canonicalUrl: https://docs.strapi.io/user-docs/latest/settings/audit-logs.html
---

# Audit Logs <GoldBadge withLinkIcon link="https://strapi.io/pricing-self-hosted" />

The **Audit Logs** section provides a searchable and filterable display of all activities performed by users of the Strapi application.

They are accessible from the **Administrator Panel** section of the [**Settings**](./managing-global-settings.md) panel.

<!--insert screenshot -->

For each log item the following information is displayed:

* **Action**: The type of action performed by the user. For example `create` or `update`.
* **Response Status**: The HTTP status code returned by the server for that action.
* **Path**: The path of the request.
* **Date**: The date and time of the action.
* **User**: The user who performed the action.
* **Details**: Displays a modal with more details about the action. For example the User IP address, the request body, or the response body.

## Filtering logs

The **Audit Logs** page displays all logs by default, in reverse chronological order. You can filter the logs by:

* **Action**: Select the type of action to filter by. For example `create` or `update`.
* **User**: Select the user to filter by.
* **Date**: Select a date (range) to filter by.
* **Time**: Select a time (range) to filter by.
* **+Add Filter**: Create a custom filter by selecting a field and a value.

<!--
### Creating a custom filter

WiP
-->

## Searching logs

Click the **Search** icon to search for a specific log. The search is performed on all log fields.

<!--insert screenshot -->

## Log details

For any log item, click the **Details** icon to display a modal with more details about that action.

<!--insert screenshot -->
