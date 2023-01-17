---
title: Project Settings
displayed_sidebar: cloudSidebar
description: View and manage your projects on Strapi Cloud.
canonicalUrl: https://docs.strapi.io/cloud/projects/settings.html
---

# Project Settings

The **Project Settings** page enables you to manage the configuration and settings for this project. It has the following tabs:

## General

The **General** tab enables you to edit the following details for the project:

* **Project name**: The name of your Strapi app, used to identify the project on the Cloud Dashboard, Strapi CLI, and deployment URLs.
* **Production branch**: The branch of the linked repository to use for production deployments.
* **Base directory**: The directory where your Strapi app is located in the repository. This is useful if you have multiple Strapi apps in the same repository or if you have a monorepo.
* **Connected GitHub repository**: The Git repository linked to the project.
* **Environment variables**: Environment variables are used to configure the environment of your Strapi app.
* **Delete project**: This will ***permanently and irreversibly*** delete the project and all its associated data.

![Project settings](/img/assets/cloud/settings.png)

## Billing

The **Billing** section displays the current subscription plan and included usage for the project.

Use the **Manage subscription** button to change the subscription plan.

![Project billing](/img/assets/cloud/settings_billing.png)
