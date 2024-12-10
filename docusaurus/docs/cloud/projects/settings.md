---
title: Project settings
displayed_sidebar: cloudSidebar
description: View and manage your projects settings on Strapi Cloud.
canonicalUrl: https://docs.strapi.io/cloud/projects/settings.html
sidebar_position: 2
toc_max_heading_level: 4
tags:
- project settings
- project  subscription
- Strapi Cloud
- Strapi Cloud project
---

import InvoiceStatus from '/docs/snippets/invoices-statuses.md'

# Project settings

From a chosen project's dashboard, the <Icon name="gear-six" /> **Settings** button, located in the header, enables you to manage the configurations and settings for your Strapi Cloud project and its environments.

The settings' menu on the left side of the interface is separated into 2 categories: the settings for the entire project and the settings specific to any configured environment for the project.

## Project-level settings

There are 5 tabs available for the project's settings:
- <Icon name="faders" /> [*General (project)*](#general),
- <Icon name="stack" /> [*Environments*](#environments),
- <Icon name="credit-card" /> [*Billing & Usage*](#billing--usage),
- <Icon name="map-trifold" /> [Plans](#plans),
- and <Icon name="invoice" /> [Invoices](#invoices).

### General (project) {#general}

The <Icon name="faders" /> *General* tab for the project-level settings enables you to check and update the following options for the project:

- *Basic information*, to see:
  - the name of your Strapi Cloud project — used to identify the project on the Cloud Dashboard, Strapi CLI, and deployment URLs — and change it (see [Renaming project](#renaming-project)).
  - the chosen hosting region for your Strapi Cloud project, meaning the geographical location of the servers where the project and its data and resources are stored. The hosting region is set at project creation (see [Project creation](/cloud/getting-started/deployment)) and cannot be modified afterwards.
  - the app's internal name for the project, which can be useful for debug & support purposes.
- *Connected Git repository*: to change the repository and branch used for your project (see [Modifying git repository & branch](#modifying-git-repository--branch)). Also allows to enable/disable the "deploy on push" option.
- *Delete project*: to permanently delete your Strapi Cloud project (see [Deleting Strapi Cloud project](#deleting-strapi-cloud-project)).

<ThemedImage
  alt="Project settings page"
  sources={{
    light: '/img/assets/cloud/settings.png',
    dark: '/img/assets/cloud/settings_DARK.png',
  }}
/>

#### Renaming project

The project name is set at project creation (see [Project creation](/cloud/getting-started/deployment)) and can be modified afterwards via the project's settings.

1. In the *Basic information* section of the [General icon](/img/assets/icons/Faders.svg) *General* tab, click on the edit ![Edit icon](/img/assets/icons/edit.svg) button.
2. In the dialog, write the new project name of your choice in the *Project name* textbox.
3. Click on the **Rename** button to confirm the project name modification.

#### Modifying git repository & branch

The GitHub or GitLab repository, branch and base directory for a Strapi Cloud project are by default chosen at the creation of the project (see [Creating a project](/cloud/getting-started/deployment)). After the project's creation, via the project's settings, it is possible to update the project's repository or switch to another git provider.

:::caution
Updating the git repository could result in the loss of the project and its data, for instance if the wrong repository is selected or if the data schema between the old and new repository doesn't match.
:::

1. In the *Connected git repository* section of the ![General icon](/img/assets/icons/Faders.svg) *General* tab, click on the **Update repository** button. You will be redirected to another interface.
2. (optional) If you wish to not only update the repository but switch to another git provider, click on the **Switch Git provider** button at the top right corner of the interface. You will be redirected to the chosen git provider's authorization settings before getting back to the *Update repository* interface.
3. In the *Update repository* section, fill in the 2 available settings:

    | Setting name    | Instructions                                                             |
    | --------------- | ------------------------------------------------------------------------ |
    | Account         | Choose an account from the drop-down list.                               |
    | Repository      | Choose a repository from the drop-down list.                             |

4. In the *Select Git branches* section, fill in the available settings for any of your environments. Note that the branch can be edited per environment via its own settings, see [General (environment)](#environments).

    | Setting name    | Instructions                                                             |
    | --------------- | ------------------------------------------------------------------------ |
    | Branch          | Choose a branch from the drop-down list.                                 |
    | Base directory  | Write the path of the base directory in the textbox.                     |
    | Auto-deploy     | Tick the box to automatically trigger a new deployment whenever a new commit is pushed to the selected branch. Untick it to disable the option. |

5. Click on the **Update repository** button at the bottom of the *Update repository* interface.
6. In the *Update repository* dialog, confirm your changes by clicking on the **Confirm** button.

#### Deleting Strapi Cloud project

You can delete any Strapi Cloud project, but it will be permanent and irreversible. Associated domains, deployments and data will be deleted as well and the subscription for the project will automatically be cancelled.

1. In the *Delete project* section of the ![General icon](/img/assets/icons/Faders.svg) *General* tab, click on the **Delete project** button.
2. In the dialog, select the reason why you are deleting your project. If selecting "Other" or "Missing feature", a textbox will appear to let you write additional information.
3. Confirm the deletion of your project by clicking on the **Delete project** button at the bottom of the dialog.

### Environments <CloudProBadge /> <CloudTeamBadge /> {#environments}

The ![Environments icon](/img/assets/icons/v5/Stack.svg) *Environments* tab allows to see all configured environments for the Strapi Cloud project, as well as to create new ones. Production is the default environment, which cannot be deleted. Other environments can be created (depending on the subscription plan for your project) to work more safely on isolated instances of your Strapi Cloud project (e.g. a staging environment where tests can be made before being available on production).

:::tip
Clicking on the **Manage** button for any environment will redirect you to the environment's own general settings, where it is possible to change the Node version, edit the git branches and delete or reset the environment. Please [refer to the dedicated documentation](#environments) for more information.
:::

<ThemedImage
  alt="Project overview"
  sources={{
    light: '/img/assets/cloud/environments.png',
    dark: '/img/assets/cloud/environments_DARK.png',
  }}
/>

To create a new environment:

1. Click on the **Add a new environment** button.
2. In the dialog that opens, you can see the price for the new environment and the date of the next invoice.
3. Fill in the available settings:

    | Setting name     | Instructions                                                             |
    | ---------------- | ------------------------------------------------------------------------ |
    | Environment name | (mandatory) Write a name for your project's new environment.             |
    | Git branch       | (mandatory) Select the right branch for your new environment.            |
    | Base directory   | Write the name of the base directory of your new environment.            |
    | Auto-deploy      | Tick the box to automatically trigger a new deployment whenever a new commit is pushed to the selected branch. Untick it to disable the option. |

4. Click on the **Add environment** button to create your project's new environment. A new deployment will automatically be triggered.

:::caution
If the creation of a new environment fails but you are still charged, try creating the environment again. This time, the environment creation should be successful and you will not be charged a second time. This behaviour is an known issue that should be fixed in the upcoming weeks.
:::

### Billing & Usage

The <Icon name="credit-card" /> *Billing & Usage* displays your next estimated payment, all information on the current subscription plan and a detailed summary of the project's and its environments' usage. It also allows you to directly [manage the number of seats](#managing-projects-number-of-seats) and add new environments (please [refer to the documentation in the Environments section](#environments)) for your project.

Through this tab, you also have the possibility to:
- click the **Change** button to be redirected to the <Icon name="map-trifold" /> *Plans* tab, where you can change you subscription plan ([see related documentation](#plans)),
- click the **Edit** button in order to set a new payment method (see [related documentation](/cloud/account/account-billing)).

:::note
You can attach a dedicated card to your project by choosing the payment method directly from this page. In that way, you can manage your subscriptions with different cards.
:::

:::tip
In the Usage section of the <Icon name="credit-card" /> *Billing & Usage* tab, you can see the current monthly usage of your project compared to the maximum usage allowed by your project's subscription. Use the arrows in the top right corner to see the project's usage for any chosen month.

Note also that if your usage indicates that another subscription plan would fit better for your project, a message will be displayed in the <Icon name="credit-card" /> *Billing & Usage* tab to advise which plan you could switch to.
:::

<ThemedImage
  alt="Project billing"
  sources={{
    light: '/img/assets/cloud/settings_billing.png',
    dark: '/img/assets/cloud/settings_billing_DARK.png',
  }}
/>

#### Managing project's number of seats

You can manually add more seats or lower the number of seats for your project without necessarily upgrading or downgrading to another plan (see [full documentation on seats management](/cloud/getting-started/usage-billing#seats-management)).

##### Adding more seats for the project

1. In the <Icon name="credit-card" /> *Billing & Usage* tab of your project's settings, click on the **Manage** button next to the displayed number of seats.
2. In the window that opens, select with the drop-down the number of Additional seats of your choice. The cost of the additional seats is automatically calculated and displayed in the window.
3. (optional) Click **I have a discount code**, enter your discount code in the field, and click on the **Apply** button.
4. Click the **Save** button to confirm. You will automatically be billed with the payment method defined in your profile.

##### Removing seats from the project

1. In the <Icon name="credit-card" /> *Billing & Usage* tab of your project's settings, click on the **Manage** button next to the displayed number of seats.
2. In the window that opens, select with the drop-down the number of *Billed seats* you want to keep.
3. Click the **Save button** to confirm. The new, lower number of seats will not be effective until the next month.

### Plans

The <Icon name="map-trifold" /> *Plans* tab displays an overview of the available Strapi Cloud plans and allows you to upgrade or downgrade from your current plan to another.

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

#### Upgrading to another plan

Strapi Cloud plan upgrades to another, higher plan are immediate and can be managed for each project via the project settings.

:::note
When using the free trial, the buttons to upgrade to another plan are greyed out and unusable until you have filled in your billing information. Please refer to [Account billing details](/cloud/account/account-billing) for more information.
:::

To upgrade your current plan to a higher one:

1. In the <Icon name="map-trifold" /> *Plans* tab of your project's settings, click on the **Upgrade** button of the plan you want to upgrade to.
2. In the window that opens, check the payment details that indicate how much you will have to pay immediately after confirming the upgrade, and the available options.

   a. (optional) Click the **Edit** button to select another payment method.
   b. (optional) Click **I have a discount code**, enter your discount code in the field, and click on the **Apply** button.

3. Click on the **Upgrade to [plan name]** button to confirm the upgrade of your Strapi project to another plan.

#### Downgrading to another plan

Strapi Cloud plan downgrades can be managed for each project via the project settings. Downgrades are however not immediately effective: the higher plan will still remain active until the end of the current month (e.g. if you downgrade from the Team plan to the Pro plan on June 18th, your project will remain on the Team plan until the end of the month: on July 1st, the Pro plan will be effective for the project).

:::caution
Make sure to check the usage of your Strapi Cloud project before downgrading: if your current usage exceeds the limits of the lower plan, you are taking the risk of getting charged for the overages. You may also lose access to some features: for example, downgrading to the Developer plan which doesn't include the Backups feature, would make you lose all your project's backups. Please refer to [Information on billing & usage](/cloud/getting-started/usage-billing) for more information.

Note also that you cannot downgrade if you have additional environments (i.e. extra environments that have been purchased, not the default or included environments). For instance, if you wish to downgrade from the Pro plan to the Developer plan, you first need to delete all additional environments that have been configured (see [Resetting & Deleting environment](#resetting--deleting-environment)), for the **Downgrade** button to be displayed and available again.
:::

To downgrade your current plan to a lower one:

1. In the <Icon name="map-trifold" /> *Plans* tab of your project's settings, click on the **Downgrade** button of the plan you want to downgrade to.
2. In the window that opens, check the information related to downgrading.
3. Click on the **Downgrade** button to confirm the downgrade of your Strapi project's plan. 

:::tip
Downgrades are effective from the 1st of the following month. Before that date, you can click on the **Cancel downgrade** button to remain on the current plan.
:::

### Invoices

The <Icon name="invoice" /> *Invoices* tab displays the full list of invoices for your Strapi Cloud project as well as their status.

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


## Environment-level settings

In the project's environments' settings, you first need to select the environment whose settings you would like to configure, using the dropdown. Depending on the chosen environment, there are 3 to 4 tabs available:

- <Icon name="faders" /> [*General (environment)*](#general),
- <Icon name="arrow-clockwise" /> [*Backups*](#backups), which are only available for the production environment,
- <Icon name="browsers" /> [*Domains*](#domains),
- and <Icon name="code" classes="ph-bold" /> [*Variables*](#variables).

### Configuration

The <Icon name="faders" /> *General* tab for the environment-level settings enables you to check and update the following options for the project:

- *Basic information*, to see:
  - the name of your Strapi Cloud project's environment. The environment name is set when it is created and cannot be modified afterwards.
  - the Node version of the environment: to change the Node version of the project (see [Modifying Node version](#modifying-node-version)).
  - the app's internal name for the environment, which can be useful for debug & support purposes.
- *Connected branch*: to change the branch of the GitHub repository used for your environment (see [Editing Git branch](#editing-git-branch)). Also allows to enable/disable the "deploy on push" option.
- *Danger zone*: to reset or permanently delete your Strapi Cloud project's environment (see [Resetting & Deleting environment](#resetting--deleting-environment)).

<ThemedImage
  alt="Project invoices"
  sources={{
    light: '/img/assets/cloud/settings_env.png',
    dark: '/img/assets/cloud/settings_env_DARK.png',
  }}
/>

#### Modifying Node version

The environment's Node version is based on the one chosen at the creation of the project (see [Creating a project](/cloud/getting-started/deployment)), through the advanced settings. It is possible to switch to another Node version afterwards, for any environment.

1. In the *Basic information* section of the <Icon name="faders" /> *General* tab, click on the *Node version*'s edit <Icon name="pencil-simple" /> button.
2. Using the *Node version* drop-down in the dialog, click on the version of your choice.
3. Click on the **Save** button.
4. Trigger a new deployment in the environment for which you changed the Node version. If the deployment fails, it is because the Node version doesn't match the version of your Strapi project. You will have to switch to the other Node version and re-deploy your project again.

#### Editing Git branch

1. In the *Connected git repository* section of the <Icon name="faders" /> *General* *Configuration* tab, click on the **Edit branch** button.
2. In the *Edit branch* dialog, edit the available settings. Note that the branch can be edited for all environments at the same time via the project's settings, see [General](#general).

    | Setting name    | Instructions                                                             |
    | --------------- | ------------------------------------------------------------------------ |
    | Selected branch | (mandatory) Choose a branch from the drop-down list.                     |
    | Base directory  | Write the path of the base directory in the textbox.                     |
    | Deploy the project on every commit pushed to this branch | Tick the box to automatically trigger a new deployment whenever a new commit is pushed to the selected branch. Untick it to disable the option. |

3. Click on the **Save** button.

#### Resetting & Deleting environment

You can reset or delete any additional environment of your Strapi Cloud project, but it will be permanent and irreversible. The default, production environment, can however not be neither reset nor deleted.

##### Resetting an environment

Resetting an environment deletes all environments data and resets the variables to their default. To do so:

1. In the *Danger zone* section of the <Icon name="faders" /> *Configuration* tab, click on the **Reset environment** button.
2. In the dialog that opens, click on the **Continue** button to confirm the environment reset.
3. Fill in the available fields to reset the environment:

    | Setting name    | Instructions                                                             |
    | --------------- | ------------------------------------------------------------------------ |
    | Environment name | (mandatory) Write a name for your project's new environment.            |
    | Git branch      | (mandatory) Choose a branch from the drop-down list.                     |
    | Base directory  | Write the path of the base directory in the textbox.                     |
    | Deploy the project on every commit pushed to this branch | Tick the box to automatically trigger a new deployment whenever a new commit is pushed to the selected branch. Untick it to disable the option. |

4. Click on the **Reset** button.

##### Deleting an environment

1. In the *Danger zone* section of the <Icon name="faders" /> *General* tab, click on the **Delete environment** button.
2. Write in the textbox your *Environment name*.
3. Click on the **Delete environment** button to confirm the deletion.

### Backups {#backups}
<GrowthBadge /> <CloudProBadge /> <CloudTeamBadge /> <UpdatedBadge />

The <Icon name="arrow-clockwise" /> *Backups* tab informs you of the status and date of the latest backup of your Strapi Cloud projects. The databases associated with all existing Strapi Cloud projects are indeed automatically backed up (weekly for Pro plans and daily for Team plans). Backups are retained for a 28-day period. Additionally, you can create a single manual backup.

:::note Notes

- The backup feature is not available for Strapi Cloud projects using the free trial or the Developer plan. You will need to upgrade to either the Pro or Team plan to have your project automatically backed up and to have access to manual backups.

<!-- - Only project owners can restore a backup. Maintainers have access to the <Icon name="arrow-clockwise" /> *Backups* tab but the **Restore backup** button won't be displayed for them. Refer to [Collaboration](/cloud/projects/collaboration) for more information. -->

- The manual backup option should become available shortly after project's first succesful deployment.

- The backup feature is only available for the default, production environment. Other additional environment's settings will not show the <Icon name="arrow-clockwise" /> *Backups* tab.
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

#### Creating a manual backup

To create a manual backup, in the <Icon name="arrow-clockwise" /> *Backups* section, click on the **Create backup** button.

The manual backup should start immediately, and restoration or creation of other backups will be disabled until backup is complete.

:::caution
When creating a new manual backup, any existing manual backup will be deleted. You can only have one manual backup at a time.
:::

#### Restoring a backup

If you need to restore a backup of your project:

1. In the <Icon name="arrow-clockwise" /> *Backups* section, click on the **Restore backup** button.
2. In the dialog, choose one of the available backups (automatic or manual) of your project in the *Choose backup* drop-down.
3. Click on the **Restore** button of the dialog. Once the restoration finished, your project will be back to the state it was at the time of the chosen backup.
4. The timestamp of the last completed restoration will be displayed to help you track when the project was last restored.

### Domains

The <Icon name="browsers" /> *Domains* tab enables you to manage domains and connect new ones.

<ThemedImage
  alt="Project domains"
  sources={{
    light: '/img/assets/cloud/settings_domains.png',
    dark: '/img/assets/cloud/settings_domains_DARK.png',
  }}
/>

All existing domains for your Strapi Cloud project are listed in the <Icon name="browsers" /> *Domains* tab. For each domain, you can:

- see its current status:
    - <Icon name="check-circle" color="rgb(58,115,66)"/> Active: the domain is currently confirmed and active
    - ![Clock icon](/img/assets/icons/Clock.svg) Pending: the domain transfer is being processed, waiting for DNS changes to propagate
    - <Icon name="x-circle" color="rgb(190,51,33)" /> Failed: the domain change request did not complete as an error occured
- click the <Icon name="pencil-simple" /> edit button to access the settings of the domain
- click the <Icon name="trash-simple" /> delete button to delete the domain

#### Connecting a custom domain

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

### Variables

Environment variables (more information in the [Developer Documentation](../../dev-docs/configurations/environment)) are used to configure the environment of your Strapi application, such as the database connection.

<ThemedImage
  alt="Project variables"
  sources={{
    light: '/img/assets/cloud/settings_variables.png',
    dark: '/img/assets/cloud/settings_variables_DARK.png',
  }}
/>

In the <Icon name="code" classes="ph-bold" /> *Variables* tab, you can:
- click the **Add variable** button to create a new variable
- edit any variable, each being composed of a *Name* and a *Value*
- click the <Icon name="trash-simple" /> delete button associated with any non-default variable to delete it
- click the **Save** button to save any change made on the page
