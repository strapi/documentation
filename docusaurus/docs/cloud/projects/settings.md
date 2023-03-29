---
title: Project Settings
displayed_sidebar: cloudSidebar
description: View and manage your projects on Strapi Cloud.
canonicalUrl: https://docs.strapi.io/cloud/projects/settings.html
sidebar_position: 2
---

# Project Settings

The **Project Settings** page enables you to manage the configuration and settings for this project. It has the following tabs:

## General

The **General** tab enables you to check and update the following details for the project:

* **Project name**: The name of your Strapi app, used to identify the project on the Cloud Dashboard, Strapi CLI, and deployment URLs. Cannot be edited after creation.
* **Production branch**: The branch of the linked repository to use for production deployments. Cannot be edited after creation.
* **Base directory**: The directory where your Strapi app is located in the repository. This is useful if you have multiple Strapi apps in the same repository or if you have a monorepo. Cannot be edited after creation.
* **Connected GitHub repository**: The Git repository linked to the project. Cannot be edited after creation.
* **Delete project**: This will ***permanently and irreversibly*** delete the project and all its associated data.
* **Debug info**: Displays the internal project name for your application. This is useful for support purposes.

![Project settings](/img/assets/cloud/settings.png)

## Variables

[Environment variables](../../dev-docs/configurations/environment) are used to configure the environment of your Strapi app, such as the database connection.

You can view default values, and create/edit/delete environment variables for your project in the **Variables** tab:

![Project variables](/img/assets/cloud/settings_variables.png)

## Billing

The **Billing** section displays the current subscription plan and included usage for the project.

Use the **Manage subscription** button to change the subscription plan.

![Project billing](/img/assets/cloud/settings_billing.png)
