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
* **Base directory**: Enables you to set the base directory of your Strapi app. This is useful if your Strapi app is not in the root directory of your repository.
* **Connected GitHub repository**: The Git repository linked to the project.
* **Delete project**: This will ***permanently and irreversibly*** delete the project and all its associated data.

![Project settings](/img/assets/cloud/settings.png)

## Variables

The **Variables** tab enables you to set and manage [environment variables](/dev-docs/configurations/environment/) for the project. These variables are available to your Strapi app at runtime.

![Project variables](/img/assets/cloud/settings_variables.png)

## Plans & Billing

The **Plans & Billing** tab enables you to manage your project's billing and subscription plan. You can view the details of your current plan, along with current and previous invoices, and upgrade or downgrade your plan.

![Project plans & billing](/img/assets/cloud/settings_billing.png)

## Usage

The **Usage** tab displays the current usage of the project, based on the limits of the current billing plan. 

This includes the number of **Database Entries**, amount of **Database Storage**, and **API Bandwidth** used. If you have exceeded, or are approaching, the limits of your current plan, you will see a warning message.

You can filter the usage according to a desired time period.

![Project usage](/img/assets/cloud/settings_usage.png)
