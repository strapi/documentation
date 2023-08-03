---
title: Project Settings
displayed_sidebar: cloudSidebar
description: View and manage your projects on Strapi Cloud.
canonicalUrl: https://docs.strapi.io/cloud/projects/settings.html
sidebar_position: 2
---

# Project Settings

The *Project Settings* page enables you to manage the configuration and settings for of Strapi Cloud project. There are 4 tabs available: *General*, *Domains*, *Variables* and *Billing*.

## General

The *General* tab enables you to check and update the following options for the project:

- Details: to modify the name of your Strapi Cloud project, used to identify the project on the Cloud Dashboard, Strapi CLI, and deployment URLs. The project name cannot be edited after creation.
- Connected Git repository: to change the branch of the GitHub repository used for your project (see [Modifying GitHub repository branch](#modifying-github-repository-branch)).
- Selected region: to see the hosting region of the project.
- Debug info: to see the internal project name for the project. This is useful for support purposes.
- Delete project: to permanently delete your Strapi Cloud project (see [Deleting Strapi Cloud project](#deleting-strapi-cloud-project)).

![Project settings](/img/assets/cloud/settings.png)

### Modifying GitHub repository branch

The GitHub repository branch and base directory for a Strapi Cloud project are by default chosen at the creation of the project (see [Creating a project](/cloud/getting-started/deployment)). Both can afterwards be edited via the account settings.

1. In the *Connected Git repository* section of the *General* tab, click on the **Edit** button.
2. In the *Edit Git settings* dialog, edit the available options of your choice:

    | Setting name    | Instructions                                                             |
    | --------------- | ------------------------------------------------------------------------ |
    | Selected branch | Choose a branch from the drop-down list.                                 |
    | Base directory  | Write the path of the base directory in the textbox.                     |
    | Deploy the project on every commit pushed to this branch | Check the box to automatically trigger a new deployment whenever a new commit is pushed to the selected branch. |

3. Click on the **Save** button.

### Deleting Strapi Cloud project

You can delete any Strapi Cloud project, but it will be permanent and irreversible. Associated domains, deployments and data will be deleted as well and the subscription for the project will automatically be cancelled.

1. In the *Delete project* section of the *General* tab, click on the **Delete project** button.
2. In the dialog, type `DELETE` in the textbox.
3. Confirm the deletion of your project by clicking on the **Delete** button.

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

Default domain names are made of 2 randomly generated words followed by a hash. They can be replaced by any custom domain of your choice.

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
