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

The *General* tab enables you to check and update the following details for the project:

* **Project name**: The name of your Strapi app, used to identify the project on the Cloud Dashboard, Strapi CLI, and deployment URLs. Cannot be edited after creation.
* **Production branch**: The branch of the linked repository to use for production deployments. Cannot be edited after creation.
* **Base directory**: The directory where your Strapi app is located in the repository. This is useful if you have multiple Strapi apps in the same repository or if you have a monorepo. Cannot be edited after creation.
* **Connected GitHub repository**: The Git repository linked to the project. Cannot be edited after creation.
* **Delete project**: This will ***permanently and irreversibly*** delete the project and all its associated data.
* **Debug info**: Displays the internal project name for your application. This is useful for support purposes.

![Project settings](/img/assets/cloud/settings.png)

## Domains

The *Domains* tab enables you to manage domains and connect new ones.

![Domains](/img/assets/cloud/settings_domains.png)

All existing domains for your Strapi Cloud project are listed in the *Domains* tab. For each domain, you can:

- see its current status:
    - ![Edit icon](/img/assets/icons/CheckCircle.svg) Active: the domain is currently confirmed and active
    - ![Edit icon](/img/assets/icons/Clock.svg) Pending: the domain transfer is being processed, waiting for DNS changes to propagate
    - ![Edit icon](/img/assets/icons/CrossCircle.svg) Failed: the domain change request did not complete as an error occured
- click the ![Edit icon](/img/assets/icons/edit.svg) edit button to access the settings of the domain
- click the ![Delete icon](/img/assets/icons/delete.svg) delete button to delete the domain

### Connecting a custom domain

Default domain names are made of 3 randomly generated words. They can be replaced by any custom domain of your choice.

1. Click the **Connect new domain** button.
2. In the window that opens, fill in the following fields:

| Setting name              | Instructions                                                              |
| ------------------------- | ------------------------------------------------------------------------- |
| Domain name               | Type the new domain name (e.g. *custom-domain-name.com*)                  |
| Hostname                  | Type the hostname (i.e. address end-users enter in web browser, or call through APIs). |
| Target                    | Type the target (i.e. actual address where users are redirected when entering hostname). |
| Set as default domain     | Tick the box to make the new domain the default one.                      |

3. Click on the **Save** button.

## Variables

[Environment variables](../../dev-docs/configurations/environment) are used to configure the environment of your Strapi app, such as the database connection.

You can view default values, and create/edit/delete environment variables for your project in the **Variables** tab:

![Project variables](/img/assets/cloud/settings_variables.png)

## Billing

The *Billing* section displays the current subscription plan and included usage for the project.

Use the **Manage subscription** button to change the subscription plan.

![Project billing](/img/assets/cloud/settings_billing.png)
