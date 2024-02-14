---
title: Project settings
displayed_sidebar: cloudSidebar
description: View and manage your projects on Strapi Cloud.
canonicalUrl: https://docs.strapi.io/cloud/projects/settings.html
sidebar_position: 2
---

# Project settings

From a chosen project's dashboard, the *Settings* tab, located in the header, will redirect you to the *Project Settings* page. It enables you to manage the configurations and settings for your Strapi Cloud project.

There are 5 tabs available: [*General*](#general), [*Domains*](#domains), [*Backups*](#backups), [*Variables*](#variables) and [*Billing*](#billing).

## General

The *General* tab enables you to check and update the following options for the project:

- *Details*: to see the name of your Strapi Cloud project, used to identify the project on the Cloud Dashboard, Strapi CLI, and deployment URLs. The project name is set at project creation (see [Project creation](/cloud/getting-started/deployment)) and cannot be modified afterwards.
- *Connected Git repository*: to change the branch of the GitHub repository used for your project (see [Modifying GitHub repository branch](#modifying-git-repository-branch)). Also allows to enable/disable the "deploy on push" option.
- *Selected region*: to see the hosting region of the project, meaning the geographical location of the servers where the project and its data and resources are stored. The hosting region is set at project creation (see [Project creation](/cloud/getting-started/deployment)) and cannot be modified afterwards.
- *Debug info*: to see the internal project name for the project. This is useful for support purposes.
- *Node version*: to change the Node version of the project (see [Modifying Node version](#modifying-node-version)).
- *Delete project*: to permanently delete your Strapi Cloud project (see [Deleting Strapi Cloud project](#deleting-strapi-cloud-project)).

<ThemedImage
  alt="Project settings page"
  sources={{
    light: '/img/assets/cloud/settings.png',
    dark: '/img/assets/cloud/settings_DARK.png',
  }}
/>

### Modifying git repository branch

The GitHub or Gitlab repository branch and base directory for a Strapi Cloud project are by default chosen at the creation of the project (see [Creating a project](/cloud/getting-started/deployment)). Both can afterwards be edited via the project's settings.

1. In the *Connected git repository* section of the *General* tab, click on the **Edit** button.
2. In the *Edit Git settings* dialog, edit the available options of your choice:

    | Setting name    | Instructions                                                             |
    | --------------- | ------------------------------------------------------------------------ |
    | Selected branch | Choose a branch from the drop-down list.                                 |
    | Base directory  | Write the path of the base directory in the textbox.                     |
    | Deploy the project on every commit pushed to this branch | Tick the box to automatically trigger a new deployment whenever a new commit is pushed to the selected branch. Untick it to disable the option. |

3. Click on the **Save** button.

### Modifying Node version

The project's Node version is first chosen at the creation of the project (see [Creating a project](/cloud/getting-started/deployment)), through the advanced settings. It is possible to switch to another Node version afterwards.

1. In the *Node version* section of the *General* tab, click on the **Edit** button.
2. Using the *Node version* drop-down in the dialog, click on the version of your choice.
3. Click on the **Save** button.
4. Click on the **Trigger deploy** button in the right corner of the project's header. If the deployment fails, it is because the Node version doesn't match the version of your Strapi project. You will have to switch to the other Node version and re-deploy your project again.

### Deleting Strapi Cloud project

You can delete any Strapi Cloud project, but it will be permanent and irreversible. Associated domains, deployments and data will be deleted as well and the subscription for the project will automatically be cancelled.

1. In the *Delete project* section of the *General* tab, click on the **Delete project** button.
2. In the dialog, select the reason why you are deleting your project. If selecting "Other" or "Missing feature", a textbox will appear to let you write additional information.
3. Confirm the deletion of your project by clicking on the **Delete project** button at the bottom of the dialog.

## Domains

The *Domains* tab enables you to manage domains and connect new ones.

<ThemedImage
  alt="Project domains"
  sources={{
    light: '/img/assets/cloud/settings_domains.png',
    dark: '/img/assets/cloud/settings_domains_DARK.png',
  }}
/>

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

## Backups <CloudProBadge /> <CloudTeamBadge />

The *Backups* tab informs you of the status and date of the latest backup of your Strapi Cloud projects. The databases associated with all existing Strapi Cloud projects are indeed automatically backed up weekly and those backups are retained for a one-month period.

:::note
The backup feature is not available for Strapi Cloud projects using the free trial. You will need to upgrade to either the Pro or Team plan to have your project automatically backed up.

Note also that only project owners can restore a backup. Maintainers have access to the *Backups* tab but the **Restore backup** button won't be displayed for them. Refer to [Collaboration](/cloud/projects/collaboration) for more information.
:::

:::tip
For projects created before the release of the Backup feature in October 2023, the first backup will automatically be triggered with the next deployment of the project.
:::

<ThemedImage
  alt="Backups"
  sources={{
    light: '/img/assets/cloud/settings_backups.png',
    dark: '/img/assets/cloud/settings_backups_DARK.png',
  }}
/>

### Restoring a backup

If you need to restore a backup of your project:

1. In the *Backups* section, click on the **Restore backup** button.
2. In the dialog, choose one of the available backups of your project in the *Choose backup* drop-down.
3. Click on the **Restore** button of the dialog. Once the restoration finished, your project will be back to the state it was at the time of the chosen backup.

## Variables

Environment variables (more information in the [Developer Documentation](../../dev-docs/configurations/environment)) are used to configure the environment of your Strapi application, such as the database connection.

<ThemedImage
  alt="Project variables"
  sources={{
    light: '/img/assets/cloud/settings_variables.png',
    dark: '/img/assets/cloud/settings_variables_DARK.png',
  }}
/>

In the *Variables* tab, you can:
- click the **Add variable** button to create a new variable
- edit any variable, each being composed of a *Name* and a *Value*
- click the ![Delete icon](/img/assets/icons/delete.svg) delete button associated with any variable to delete it
- click the **Save** button to save any change made on the page

## Billing

The *Billing* tab displays all information on the current subscription plan and included usage for the project. Through this tab, you can [manage the subscription of your project](#managing-projects-subscription) and have a detailed look at its usage.

:::tip
In the Usage section of the *Billing* tab, you can see the current monthly usage of your project compared to the maximum usage allowed by your project's subscription. Use the *Time range* filters to see the project's usage for any chosen month.
:::

<ThemedImage
  alt="Project billing"
  sources={{
    light: '/img/assets/cloud/settings_billing.png',
    dark: '/img/assets/cloud/settings_billing_DARK.png',
  }}
/>

### Managing project's subscription

Using the **Manage subscriptions** button, you can view and manage your project's subscription. Please refer to [Account management > Account billing details](/cloud/account/account-billing) for the full documentation of the subscription management modal.
 