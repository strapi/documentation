---
title: Project settings
displayed_sidebar: cloudSidebar
description: View and manage your projects on Strapi Cloud.
canonicalUrl: https://docs.strapi.io/cloud/projects/settings.html
sidebar_position: 2
---

import InvoiceStatus from '/docs/snippets/invoices-statuses.md'

# Project settings

From a chosen project's dashboard, the *Settings* tab, located in the header, enables you to manage the configurations and settings for your Strapi Cloud project.

There are 7 tabs available:

- ![General icon](/img/assets/icons/Faders.svg) [*General*](#general),
- ![Backups icon](/img/assets/icons/ArrowClockwise.svg) [*Backups*](#backups),
- ![Domains icon](/img/assets/icons/Browsers.svg) [*Domains*](#domains),
- ![Variables icon](/img/assets/icons/code2.svg) [*Variables*](#variables),
- ![Billing & Usage icon](/img/assets/icons/CreditCard.svg) [*Billing & Usage*](#billing--usage),
- ![Plans icon](/img/assets/icons/MapTrifold.svg) [Plans](#plans),
- and ![Invoices icon](/img/assets/icons/Invoice.svg) [Invoices](#invoices).

## General

The ![General icon](/img/assets/icons/Faders.svg) *General* tab enables you to check and update the following options for the project:

- *Details*: to see the name of your Strapi Cloud project, used to identify the project on the Cloud Dashboard, Strapi CLI, and deployment URLs. The project name is set at project creation (see [Project creation](/cloud/getting-started/deployment)) and cannot be modified afterwards.
- *Connected Git repository*: to change the branch of the GitHub repository used for your project (see [Modifying GitHub repository branch](#modifying-git-repository--branch)). Also allows to enable/disable the "deploy on push" option.
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

### Modifying git repository & branch

The GitHub or Gitlab repository, branch and base directory for a Strapi Cloud project are by default chosen at the creation of the project (see [Creating a project](/cloud/getting-started/deployment)). After the project's creation, via the project's settings, it is possible to:

- update the project's repository or switch to another git provider (see [Updating repository](#updating-repository)),
- edit the project's branch, base directory and deploy on push setting (see [Editing branch](#editing-branch)).

:::caution
Updating the git repository could result in the loss of the project and its data, for instance if the wrong repository is selected or if the data schema between the old and new repository doesn't match.
:::

#### Updating repository

1. In the *Connected git repository* section of the ![General icon](/img/assets/icons/Faders.svg) *General* tab, click on the **Update repository** button.
2. (optional) If you wish to not only update the repository but switch to another git provider, click on the **Switch to GitHub/GitLab** button at the bottom of the *Update repository* dialog. You will be redirected to the chosen git provider's authorization settings before getting back to the *Update repository dialog*.
3. In the *Update repository* dialog, fill in the 3 available settings:

    | Setting name    | Instructions                                                             |
    | --------------- | ------------------------------------------------------------------------ |
    | Account         | Choose an account from the drop-down list.                               |
    | Repository      | Choose a repository from the drop-down list.                             |
    | Git branch      | Choose a branch from the drop-down list.                                 |
    | Deploy the project on every commit pushed to this branch | Tick the box to automatically trigger a new deployment whenever a new commit is pushed to the selected branch. Untick it to disable the option. |

4. Click on the **Save** button.
5. In the confirmation dialog, confirm your changes by clicking on the **Relink repository** button.

#### Editing branch

1. In the *Connected git repository* section of the ![General icon](/img/assets/icons/Faders.svg) *General* tab, click on the **Edit branch** button.
2. In the *Edit branch* dialog, edit the settings below:

    | Setting name    | Instructions                                                             |
    | --------------- | ------------------------------------------------------------------------ |
    | Git branch      | Choose a branch from the drop-down list.                                 |
    | Base directory  | Write the path of the base directory in the textbox.                     |
    | Deploy the project on every commit pushed to this branch | Tick the box to automatically trigger a new deployment whenever a new commit is pushed to the selected branch. Untick it to disable the option. |

3. Click on the **Save** button.

### Modifying Node version

The project's Node version is first chosen at the creation of the project (see [Creating a project](/cloud/getting-started/deployment)), through the advanced settings. It is possible to switch to another Node version afterwards.

1. In the *Node version* section of the ![General icon](/img/assets/icons/Faders.svg) *General* tab, click on the **Edit** button.
2. Using the *Node version* drop-down in the dialog, click on the version of your choice.
3. Click on the **Save** button.
4. Click on the **Trigger deploy** button in the right corner of the project's header. If the deployment fails, it is because the Node version doesn't match the version of your Strapi project. You will have to switch to the other Node version and re-deploy your project again.

### Deleting Strapi Cloud project

You can delete any Strapi Cloud project, but it will be permanent and irreversible. Associated domains, deployments and data will be deleted as well and the subscription for the project will automatically be cancelled.

1. In the *Delete project* section of the ![General icon](/img/assets/icons/Faders.svg) *General* tab, click on the **Delete project** button.
2. In the dialog, select the reason why you are deleting your project. If selecting "Other" or "Missing feature", a textbox will appear to let you write additional information.
3. Confirm the deletion of your project by clicking on the **Delete project** button at the bottom of the dialog.

## Backups <CloudProBadge /> <CloudTeamBadge /> <UpdatedBadge /> {#backups}

The ![Backups icon](/img/assets/icons/ArrowClockwise.svg) *Backups* tab informs you of the status and date of the latest backup of your Strapi Cloud projects. The databases associated with all existing Strapi Cloud projects are indeed automatically backed up (weekly for Developer and Pro plans, and daily for Team plans). Backups are retained for a 28-day period. Additionally, you can create a single manual backup.

:::note Notes

- The backup feature is not available for Strapi Cloud projects using the free trial or the Developer plan. You will need to upgrade to either the Pro or Team plan to have your project automatically backed up and to have access to manual backups.

- Only project owners can restore a backup. Maintainers have access to the ![Backups icon](/img/assets/icons/ArrowClockwise.svg) *Backups* tab but the **Restore backup** button won't be displayed for them. Refer to [Collaboration](/cloud/projects/collaboration) for more information.

- The manual backup option should become available shortly after project's first succesful deployment.

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

### Creating a manual backup

To create a manual backup, in the ![Backups icon](/img/assets/icons/ArrowClockwise.svg) *Backups* section, click on the **Create backup** button.

The manual backup should start immediately, and restoration or creation of other backups will be disabled until backup is complete.

:::caution
When creating a new manual backup, any existing manual backup will be deleted. You can only have one manual backup at a time.
:::

### Restoring a backup

If you need to restore a backup of your project:

1. In the ![Backups icon](/img/assets/icons/ArrowClockwise.svg) *Backups* section, click on the **Restore backup** button.
2. In the dialog, choose one of the available backups (automatic or manual) of your project in the *Choose backup* drop-down.
3. Click on the **Restore** button of the dialog. Once the restoration finished, your project will be back to the state it was at the time of the chosen backup.

## Domains

The ![Domains icon](/img/assets/icons/Browsers.svg) *Domains* tab enables you to manage domains and connect new ones.

<ThemedImage
  alt="Project domains"
  sources={{
    light: '/img/assets/cloud/settings_domains.png',
    dark: '/img/assets/cloud/settings_domains_DARK.png',
  }}
/>

All existing domains for your Strapi Cloud project are listed in the ![Domains icon](/img/assets/icons/Browsers.svg) *Domains* tab. For each domain, you can:

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

Environment variables (more information in the [Developer Documentation](../../dev-docs/configurations/environment)) are used to configure the environment of your Strapi application, such as the database connection.

<ThemedImage
  alt="Project variables"
  sources={{
    light: '/img/assets/cloud/settings_variables.png',
    dark: '/img/assets/cloud/settings_variables_DARK.png',
  }}
/>

In the ![Variables icon](/img/assets/icons/code2.svg) *Variables* tab, you can:
- click the **Add variable** button to create a new variable
- edit any variable, each being composed of a *Name* and a *Value*
- click the ![Delete icon](/img/assets/icons/delete.svg) delete button associated with any variable to delete it
- click the **Save** button to save any change made on the page

## Billing & Usage

The ![Billing & Usage icon](/img/assets/icons/CreditCard.svg) *Billing & Usage* tab displays your next estimated payment, all information on the current subscription plan and a detailed summary of the project's usage. It also allows you to directly [manage the number of seats](#managing-projects-number-of-seats) for your project.

Through this tab, you also have the possibility to:
- click the **Change** button to be redirected to the ![Plans icon](/img/assets/icons/MapTrifold.svg) *Plans* tab, where you can change you subscription plan ([see related documentation](#plans)),
- click the **Edit** button to be redirected to the ![Billing icon](/img/assets/icons/CreditCard.svg) *Billing* tab of your profile page, where you can edit the payment method ([see related documentation](/cloud/account/account-billing)).

:::tip
In the *Usage summary* section of the ![Billing & Usage icon](/img/assets/icons/CreditCard.svg) *Billing & Usage* tab, you can see the current monthly usage of your project compared to the maximum usage allowed by your project's subscription. Use the arrows in the top right corner to see the project's usage for any chosen month.

Note also that if your usage indicates that another subscription plan would fit better for your project, a message will be displayed in the ![Billing & Usage icon](/img/assets/icons/CreditCard.svg) *Billing & Usage* tab to advise which plan you could switch to.
:::

<ThemedImage
  alt="Project billing"
  sources={{
    light: '/img/assets/cloud/settings_billing.png',
    dark: '/img/assets/cloud/settings_billing_DARK.png',
  }}
/>

### Managing project's number of seats

You can manually add more seats or lower the number of seats for your project without necessarily upgrading or downgrading to another plan (see [more information on seats management](/cloud/getting-started/usage-billing#seats-management)).

#### Adding more seats for the project

1. In the ![Billing & Usage icon](/img/assets/icons/CreditCard.svg) *Billing & Usage* tab of your project's settings, click on the **Manage** button next to the displayed number of seats.
2. In the window that opens, select with the drop-down the number of *Additional seats* of your choice. The cost of the additional seats is automatically calculated and displayed in the window.
3. (optional) Click **I have a discount code**, enter your discount code in the field, and click on the **Apply** button.
4. Click the **Save** button to confirm. You will automatically be billed with the payment method defined in your profile.

#### Removing seats from the project

1. In the ![Billing & Usage icon](/img/assets/icons/CreditCard.svg) *Billing & Usage* tab of your project's settings, click on the **Manage** button next to the displayed number of seats.
2. In the window that opens, select with the drop-down the number of *Billed seats* you want to keep.
3. Click the **Save button** to confirm. The new, lower number of seats will not be effective until the next month.

## Plans

The ![Plans icon](/img/assets/icons/MapTrifold.svg) *Plans* tab displays an overview of the available Strapi Cloud plans and allows you to upgrade or downgrade from your current plan to another.

:::note
If you are using the free trial, the *Plan* tab shows a countdown of how many days you have left, as well as indications of the next steps. For more information about the free trial and project suspension, please refer to [Information on billing & usage](/cloud/getting-started/usage-billing).
:::

<ThemedImage
  alt="Project plans"
  sources={{
    light: '/img/assets/cloud/settings_plans.png',
    dark: '/img/assets/cloud/settings_plans_DARK.png',
  }}
/>

### Upgrading to another plan

Strapi Cloud plan upgrades to another, higher plan are immediate and can be managed for each project via the project settings.

:::note
When using the free trial, the buttons to upgrade to another plan are greyed out and unusable until you have filled in your billing information. Please refer to [Account billing details](/cloud/account/account-billing) for more information.
:::

To upgrade your current plan to a higher one:

1. In the ![Plans icon](/img/assets/icons/MapTrifold.svg) *Plans* tab of your project's settings, click on the **Upgrade** button of the plan you want to upgrade to.
2. In the window that opens, check the payment details that indicate how much you will have to pay immediately after confirming the upgrade, and the available options.

   a. (optional) Click the **Edit** button to select another payment method.
   b. (optional) Click **I have a discount code**, enter your discount code in the field, and click on the **Apply** button.

3. Click on the **Upgrade to [plan name]** button to confirm the upgrade of your Strapi project to another plan.

### Downgrading to another plan

Strapi Cloud plan downgrades can be managed for each project via the project settings. Downgrades are however not immediately effective: the higher plan will still remain active until the end of the current month (e.g. if you downgrade from the Team plan to the Pro plan on June 18th, your project will remain on the Team plan until the end of the month: on July 1st, the Pro plan will be effective for the project).

:::caution
Make sure to check the usage of your Strapi Cloud project before downgrading: if your current usage exceeds the limits of the lower plan, you are taking the risk of getting charged for the overages. Note also that you may lose access to some features: for example, downgrading to the Developer plan which doesn't include the Backups feature, would make you lose all your project's backups. Please refer to [Information on billing & usage](/cloud/getting-started/usage-billing) for more information.
:::

To downgrade your current plan to a lower one:

1. In the ![Plans icon](/img/assets/icons/MapTrifold.svg) *Plans* tab of your project's settings, click on the **Downgrade** button of the plan you want to downgrade to.
2. In the window that opens, check the information related to downgrading.
3. Click on the **Downgrade** button to confirm the downgrade of your Strapi project's plan.

## Invoices

The ![Invoices icon](/img/assets/icons/Invoice.svg) *Invoices* tab displays the full list of invoices for your Strapi Cloud project as well as their status.

<ThemedImage
  alt="Project invoices"
  sources={{
    light: '/img/assets/cloud/settings_invoices.png',
    dark: '/img/assets/cloud/settings_invoices_DARK.png',
  }}
/>

<InvoiceStatus components={props.components} />

:::strapi Invoices are also available in your profile settings.
In the *Profile > Invoices* tab, you will find the complete list of invoices for all your projects. Feel free to check the [dedicated documentation](/cloud/account/account-billing#account-invoices).
:::
