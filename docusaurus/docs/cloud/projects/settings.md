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

<Tldr>
Settings area spans project-level controls (general, billing, plans, invoices) and per-environment configuration.
</Tldr>

From a chosen project's dashboard, the <Icon name="gear-six" /> **Settings** button, located in the header, enables you to manage the configurations and settings for your Strapi Cloud project and its environments.

The settings' menu on the left side of the interface is separated into 2 categories: the settings for the entire project and the settings specific to any configured environment for the project.

## Project-level settings

There are 5 tabs available for the project settings:
- <Icon name="faders" /> [*General*](#general),
- <Icon name="stack" /> [*Environments*](#environments),
- <Icon name="credit-card" /> [*Billing & Usage*](#billing--usage),
- <Icon name="map-trifold" /> [Plans](#plans),
- and <Icon name="invoice" /> [Invoices](#invoices).

### General

The <Icon name="faders" /> *General* tab for the project-level settings enables you to check and update the following options for the project:

- *Basic information*, to see:
  - the name of your Strapi Cloud project — used to identify the project on the Cloud Dashboard, Strapi CLI, and deployment URLs — and change it (see [Renaming project](#renaming-project)).
  - the chosen hosting region for your Strapi Cloud project, meaning the geographical location of the servers where the project and its data and resources are stored. The hosting region is set at project creation (see [Project creation](/cloud/getting-started/deployment)) and cannot be modified afterwards.
  - the project's metadata, including the Production app internal name and the Subscription ID, which can be useful for debugging & support purposes.
- *Strapi CMS license key*: to enable and use some CMS features directly on your Cloud project (see [Pricing page](https://strapi.io/pricing-self-hosted) to purchase a license).

- *Connected Git repository*: to change the repository and branch used for your project (see [Modifying git repository & branch](#modifying-git-repository--branch)). Also allows to enable/disable the "deploy on push" option.
- *Danger zone*, with:
  - *Transfer ownership*: for the project owner to transfer the ownership of the Cloud project to an already existing maintainer (see [Transferring project ownership](#transferring-project-ownership)).
  - *Delete project*: to permanently delete your Strapi Cloud project (see [Deleting Strapi Cloud project](#deleting-a-strapi-cloud-project)).

<ThemedImage
  alt="Project settings page"
  sources={{
    light: '/img/assets/cloud/settings.png',
    dark: '/img/assets/cloud/settings_DARK.png',
  }}
/>

#### Renaming project

The project name is set at project creation (see [Project creation](/cloud/getting-started/deployment)) and can be modified afterwards via the project settings.

1. In the *Basic information* section of the <Icon name="faders" /> *General* tab, click on the edit <Icon name="pencil-simple" /> button.
2. In the dialog, write the new project name of your choice in the *Project name* textbox.
3. Click on the **Rename** button to confirm the project name modification.

#### Adding a CMS license key {#adding-cms-license-key}

A CMS license key can be added and connected to a Strapi Cloud project to unlock additional Strapi CMS features across all of the project’s environments. The CMS features that will be accessible via the license key depend on the type of license that was purchased: please refer to the <ExternalLink text="Strapi Pricing page" to="https://strapi.io/pricing-self-hosted"/> for more information and/or to purchase a license.

:::note
If you don't see the *Strapi CMS license key* section, it probably means that your subscription is a legacy one and does not support custom CMS licenses. It means that you already have one that is automatically included on your project.
:::

1. In the *Strapi CMS license key* section, click on the **Add license** button.
2. In the dialog, paste your license key in the field.
3. Click on the **Save & deploy** button for the changes to take effect.

To remove the Strapi CMS license from your Strapi Cloud project, you can click on the **Unlink license** button. This will also remove access and usage to the CMS features included in the previously added license.

:::note
The license key is applied to all the environments in the project.
:::

#### Modifying git repository & branch

The GitHub or GitLab repository, branch and base directory for a Strapi Cloud project are by default chosen at the creation of the project (see [Creating a project](/cloud/getting-started/deployment)). After the project's creation, via the project settings, it is possible to update the project repository or switch to another git provider.

:::caution
Updating the git repository could result in the loss of the project and its data, for instance if the wrong repository is selected or if the data schema between the old and new repository doesn't match.
:::

1. In the *Connected git repository* section of the <Icon name="faders" /> *General* tab, click on the **Update repository** button. You will be redirected to another interface.
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

5. Click on the **Save & deploy** button for the changes to take effect.


#### Transferring project ownership <BetaBadge /> {#transferring-project-ownership}

The ownership of the Strapi Cloud project can be transferred to another user, as long as they're a maintainer of the project. It can either be at the initiative of the current project owner, or can be requested by a project maintainer. Once the ownership is transferred, it is permanent until the new owner decides to transfer the ownership again to another maintainer.

:::prerequisites
For the ownership of a project to be transferred, the following requirements must be met:
- The project must be on a paid plan, with no currently expired card and/or unpaid bills.
- The maintainer must have filled their billing information.
- No already existing ownership transfer must be pending for the project.

Note that ownership transfers might fail when done the same day of subscription renewal (i.e. 1st of every month). If the transfer fails that day, but all prerequisites are met, you should wait a few hours and try again.
:::

1. In the *Danger zone* section of the <Icon name="faders" /> *General* tab, click on the **Transfer ownership** button.
2. In the dialog:
   - If you are the project owner: choose the maintainer who should be transferred the ownership by clicking on **...** > **Transfer ownership** associated with their name.
   - If you are a maintainer: find yourself in the list and click on **...** > **Transfer ownership** associated with your name.
3. Confirm the transfer/request in the new dialog by clicking on the **Transfer ownership** button.

An email will be sent to both users. The person who needs to transfer the ownership or inherit it will have to click on the **Confirm transfer** button in the email. Once done, the previous owner will receive a confirmation email that the transfer has successfully been done.

:::tip
As long as the ownership transfer or request hasn't been confirmed, there is the option to cancel in the same dialog that the maintainer was chosen.
:::

:::note
Once the ownership transfer is done, the project will be disconnected from Strapi Cloud. As new owner, make sure to go to the <Icon name="faders" /> *General* tab of project settings to reconnect the project.
:::

#### Deleting a Strapi Cloud project

You can delete any Strapi Cloud project, but it will be permanent and irreversible. Associated domains, deployments and data will be deleted as well and the subscription for the project will automatically be canceled.

1. In the *Danger zone* section of the <Icon name="faders" /> *General* tab, click on the **Delete project** button.
2. In the dialog, select the reason why you are deleting your project. If selecting "Other" or "Missing feature", a textbox will appear to let you write additional information.
3. Confirm the deletion of your project by clicking on the **Delete project** button at the bottom of the dialog.

### Environments {#environments}
<CloudProBadge /> <CloudScaleBadge />

The <Icon name="stack" /> *Environments* tab allows to see all configured environments for the Strapi Cloud project, as well as to create new ones. Production is the default environment, which cannot be deleted. Other environments can be created (depending on the subscription plan for your project) to work more safely on isolated instances of your Strapi Cloud project (e.g. a staging environment where tests can be made before being available on production).

<ThemedImage
  alt="Project overview"
  sources={{
    light: '/img/assets/cloud/environments.png',
    dark: '/img/assets/cloud/environments_DARK.png',
  }}
/>

:::note
The billing cycle of additional environments you purchase will match the billing cycle of your plan.
:::

To create a new environment:


1. Click on the **Add a new environment** button.
2. In the dialog that opens, you can see the price for the new environment and the date of the next invoice.
3. Fill in the available settings:

    | Setting name     | Instructions                                                             |
    | ---------------- | ------------------------------------------------------------------------ |
    | Environment name | (mandatory) Write a name for your project's new environment.             |
    | Git branch       | (mandatory) Select the right branch for your new environment.            |
    | Base directory   | Write the name of the base directory of your new environment.            |
    | Import variables | Tick the box to import variable names from an existing environment. Values will not be imported, and all variables will remain blank. |
    | Deploy on push      | Tick this box to automatically trigger a deployment when changes are pushed to your selected branch. When disabled, you will need to manually deploy the latest changes. |

4. Click on the **Add environment** button to create your project's new environment. You will then be redirected to your *Project dashboard* where you will be able to follow your new environment's creation and first deployment.

:::note
If an error occurs during the environment creation, the progress indicator will stop and display an error message. You will see a **Retry** button next to the failed step, allowing you to restart the creation process.
:::

### Billing & Usage

The <Icon name="credit-card" /> *Billing & Usage* tab displays your next estimated payment, all information on the current subscription plan and a detailed summary of the project's usage. It also allows you to add new environments (please [refer to the documentation in the Environments section](#environments)) for your project.

Through this tab, you also have the possibility to:
- click the **Change** button to be redirected to the <Icon name="map-trifold" /> *Plans* tab, where you can change you subscription plan or billing cycle ([see related documentation](#plans)),
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

### Plans

The <Icon name="map-trifold" /> *Plans* tab displays an overview of the available Strapi Cloud plans and allows you to change your current plan, or your billing cycle.

:::info
If your current plan is labeled as *legacy*, you will be able to sidegrade to a new plan (see [downgrade section](#downgrading-to-another-plan)). Once you sidegrade, you will no longer have access to your previous plan.
:::

<ThemedImage
  alt="Project plans"
  sources={{
    light: '/img/assets/cloud/settings_plans.png',
    dark: '/img/assets/cloud/settings_plans_DARK.png',
  }}
/>

#### Upgrading to another plan

Plan upgrades are immediate and can be managed, for each project, via the project settings.

To upgrade your current plan to a higher one:

1. In the <Icon name="map-trifold" /> *Plans* tab of your project settings, choose between monthly and yearly billing frequency, and click on the **Upgrade** button of the plan you want to upgrade to.
2. In the window that opens, review the payment details and terms of the upgrade.

   a. (optional) Click the **Edit** button to select another payment method.

   b. (optional) Click **I have a discount code**, enter your discount code in the field, and click on the **Apply** button.

3. Click on the **Upgrade to [plan name]** button to confirm the upgrade. The project will automatically be re-deployed.

#### Downgrading to another plan

Plan downgrades can be managed, for each project, via the project settings. Downgrades are, however, not immediately effective: the current plan will remain active until the end of the current billing period.

:::caution
Make sure to check the usage of your Strapi Cloud project before downgrading: if your current usage exceeds the limits of the lower plan, you are taking the risk of getting charged for overages. You may also lose access to some features: for example, downgrading to the Essential plan would result in the loss of all your project's backups. Please refer to [Information on billing & usage](/cloud/getting-started/usage-billing) for more information.

Note also that you cannot downgrade if you have additional paid environments. You will first need to delete all additional environments that were not included in the base price of you plan (see [Resetting & Deleting environment](#resetting--deleting-environment)) before you can schedule a downgrade. When downgrading from Pro to Scale, the additional included environment will automatically be deleted when the downgrade takes effect.
:::

To downgrade your current plan to a lower one:

1. In the <Icon name="map-trifold" /> *Plans* tab of your project settings, choose between monthly and yearly billing frequency and click on the **Downgrade** button of the plan you want to downgrade to.
2. In the window that opens, review the terms of the downgrade.
3. Click on the **Downgrade** button to confirm the downgrade. The project will automatically be re-deployed.

:::tip
Downgrades are effective at the end of the current billing period. Whilst the change is pending, you can cancel the scheduled downgrade and stay on your current plan.
:::

#### Changing billing cycle

You can switch your project's billing cycle between monthly and yearly billing at any time. While project plans and addons can either be billed monthly or yearly depending on your billing cycle, overages are always billed monthly.

To change your billing cycle:

1. In the <Icon name="map-trifold" /> *Plans* tab of your project settings, use the toggle at the top of the plans section to switch between monthly and yearly billing.
3. Click the **Switch to [monthly/yearly] billing** button of your current plan.
4. In the window that opens, review the terms of the billing cycle change.
5. Click **Confirm switch** to confirm the change.

:::note
When switching from yearly to monthly billing, your plan will remain on its yearly cycle until your next renewal date. Whilst the change is pending, you can cancel the scheduled change and stay on your current billing cycle. When switching from monthly to yearly, however, the change is immediate.
:::

### Invoices

The <Icon name="invoice" /> *Invoices* tab displays the full list of invoices for your Strapi Cloud project as well as their status. No invoice is issued for the Free plan.


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

- <Icon name="faders" /> [*Configuration*](#configuration),
- <Icon name="arrow-clockwise" /> [*Backups*](#backups), which are only available for the production environment,
- <Icon name="browsers" /> [*Domains*](#domains),
- and <Icon name="code" classes="ph-bold" /> [*Variables*](#variables).

### Configuration

The <Icon name="faders" /> *Configuration* tab for the environment-level settings enables you to check and update the following options for the project:

- *Basic information*, to see:
  - the name of your Strapi Cloud project's environment. The environment name is set when it is created and cannot be modified afterwards.
  - the Node version of the environment: to change the Node version of the project (see [Modifying Node version](#modifying-node-version)).
  - the app's internal name for the environment, which can be useful for debug & support purposes.
- *Connected branch*: to change the branch of the GitHub repository used for your environment (see [Editing Git branch](#editing-git-branch)). Also allows to enable/disable the "deploy on push" option.
- *Environment data*: to transfer data from another environment within the same project (see [Transferring data between environments](#transferring-data-between-environments)).
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

1. In the *Basic information* section of the <Icon name="faders" /> *Configuration* tab, click on the *Node version*'s edit <Icon name="pencil-simple" /> button.
2. Using the *Node version* drop-down in the dialog, click on the version of your choice.
3. Click on **Save**, or **Save & deploy** if you want the changes to take effect immediately. 

:::tip
Ensure the Node version configured in your Strapi project matches the Node version shown in your project’s dashboard before deploying.
:::

#### Editing Git branch


2. In the *Edit branch* dialog, edit the available settings. Note that the branch can be edited for all environments at the same time via the project settings, see [General](#general).

    | Setting name    | Instructions                                                             |
    | --------------- | ------------------------------------------------------------------------ |
    | Selected branch | (mandatory) Choose a branch from the drop-down list.                     |
    | Base directory  | Write the path of the base directory in the textbox.                     |
    | Deploy the project on every commit pushed to this branch | Tick the box to automatically trigger a new deployment whenever a new commit is pushed to the selected branch. Untick it to disable the option. |

3. Click on the **Save & deploy** button for the changes to take effect.

#### Transferring data between environments {#transferring-data-between-environments}
<CloudProBadge /> <CloudScaleBadge />

The data transfer feature allows you to transfer the entire CMS content (database and assets) from one environment to another within the same Strapi Cloud project. This is useful for testing changes in a secondary environment with up-to-date production data, or for preparing and staging content in a secondary environment before taking it to production.

Transferring data between environments currently comes with the following limitations:

- You can only transfer toward a secondary environment (not the production environment).
- Only project owners can initiate and manage ongoing transfers.
- Transfers cannot be initiated on projects that are suspended.

:::caution Data transfers are destructive
Transferring data to an environment will permanently overwrite all existing data and assets in the target environment. The source environment's data remains unaffected, and its CMS can be accessed during the transfer. Environment settings (such as variables and domains) are not affected by the transfer.
:::

To transfer data to a secondary environment:

1. Create and deploy both the source and target [environments](#environments).
1. In the *Environment data* section of the <Icon name="faders" /> *Configuration* tab, click on the **Import data** button.
2. In the modal that opens, select the source environment from the dropdown list. Only fully created and deployed environments are available as sources.
3. Click on **Import data** to proceed, and follow the steps to confirm the transfer.
4. Once initiated, you will be redirected to the environment's dashboard where you can monitor the transfer's progress. Once the transfer is completed, the dashboard will refresh, showing both the ongoing and historic deployments.

:::note
The CMS of the target environment will be inaccessible whilst the transfer is ongoing. You can cancel an ongoing transfer, but this will leave the target environment empty. If an error occurs during the transfer, you will have the option to retry or cancel.
:::

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
    | Import variables | Tick the box to import variable names from an existing environment. Values will not be imported, and all variables will remain blank. |
    | Auto-deploy     | Deploy the project on every commit pushed to this branch | Tick the box to automatically trigger a new deployment whenever a new commit is pushed to the selected branch. Untick it to disable the option. |

4. Click on the **Reset** button.

##### Deleting an environment

1. In the *Danger zone* section of the <Icon name="faders" /> *Configuration* tab, click on the **Delete environment** button.
2. Write in the textbox your *Environment name*.
3. Click on the **Delete environment** button to confirm the deletion.

### Backups {#backups}
<CloudProBadge /> <CloudScaleBadge />

The <Icon name="arrow-clockwise" /> *Backups* tab informs you of the status and date of the latest backup of your Strapi Cloud projects. The databases associated with all existing Strapi Cloud projects are indeed automatically backed up (weekly for Pro plans and daily for Scale plans). Backups are retained for a 28-day period. Additionally, you can create a single manual backup.

:::note Notes

- The backup feature is not available for Strapi Cloud projects on the Free or Essential plans. You will need to upgrade to the Pro or Scale plan to enable automatic backups and access the manual backup option.

- Backups include only the database of your default Production environment. Assets uploaded to your project and databases from any secondary environments are not included.

- The manual backup option becomes available shortly after the project’s first successful deployment.



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

The manual backup should start immediately, and restoration or creation of other backups will be disabled until the backup is complete.

:::caution
When creating a new manual backup, any existing manual backup will be deleted. You can only have one manual backup at a time.
:::

#### Restoring a backup

If you need to restore a backup of your project:

1. In the <Icon name="arrow-clockwise" /> *Backups* section, click on the **Restore backup** button.
2. In the dialog, choose one of the available backups (automatic or manual) of your project in the *Choose backup* drop-down.
3. Click on the **Restore** button of the dialog. Once the restoration is finished, your project will be back to the state it was at the time of the chosen backup. You will be able to see the restoration timestamp and the backup restored in the <Icon name="arrow-clockwise"/> *Backups* tab.
4. The timestamp of the last completed restoration will be displayed to help you track when the project was last restored.

#### Downloading a backup

If you need to download a backup of your project:

1. In the <Icon name="arrow-clockwise" /> *Backups* section, click on the **Download backup** button.
2. In the dialog, choose one of the available backups (automatic or manual) of your project in the *Choose backup* drop-down.
3. Click on the **Download** button of the dialog to download the chosen backup's archive file in `.sql` format.

:::note
The backup file will include only the database of your default Production environment. It will not include assets or any other environment databases.
:::

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
    - <Icon name="clock" color="rgb(204,123,49)" /> Pending: the domain transfer is being processed, waiting for DNS changes to propagate
    - <Icon name="x-circle" color="rgb(190,51,33)" /> Failed: the domain change request did not complete as an error occured
- click the <Icon name="pencil-simple" /> edit button to access the settings of the domain
- click the <Icon name="trash-simple" /> delete button to delete the domain

#### Connecting a custom domain

Default domain names are made of 2 randomly generated words followed by a hash. They can be replaced by any custom domain of your choice.

:::note
Custom domains are not available on the Free plan. Downgrading to the Free plan will result in the application domain's being restored to the default one.
:::

1. Click the **Connect new domain** button.
2. In the window that opens, fill in the following fields:

| Setting name              | Instructions                                                              |
| ------------------------- | ------------------------------------------------------------------------- |
| Domain name               | Type the new domain name (e.g. *custom-domain-name.com*)                  |
| Hostname                  | Type the hostname (i.e. address end-users enter in web browser, or call through APIs). |
| Target                    | Type the target (i.e. actual address where users are redirected when entering hostname). |
| Set as default domain     | Tick the box to make the new domain the default one.                      |

3. Click on **Save & deploy** for the changes to take effect.

:::tip
To finish setting up your custom domain, in the settings of your domain registar or hosting platform, please add the Target value (e.g., `proud-unicorn-123456af.strapiapp.com`) as a CNAME alias to the DNS records of your domain.
:::

:::info Custom domains and assets
When using custom domains, these domains do not apply to the URLs of uploaded assets. Uploaded assets keep the Strapi Cloud project-based URL.

This means that, if your custom domain is hosted at `https://my-custom-domain.com` and your Strapi Cloud project name is `my-strapi-cloud-instance`, API calls will still return URLs such as `https://my-strapi-cloud-instance.media.strapiapp.com/example.png`.

Media library queries over REST or GraphQL always return the project media domain on Strapi Cloud. If you move from a self-hosted project, where media URLs can match your own domain or CDN, plan to keep using the absolute URLs from the API or adjust your frontend to allow the Strapi Cloud media domain (see [Cloud Fundamentals](/cloud/cloud-fundamentals) for more details).
:::

### Variables

Environment variables (more information in the [CMS Documentation](/cms/configurations/environment)) are used to configure the environment of your Strapi application, such as the database connection.

<ThemedImage
  alt="Project variables"
  sources={{
    light: '/img/assets/cloud/settings-variables2.png',
    dark: '/img/assets/cloud/settings-variables2_DARK.png',
  }}
/>

In the <Icon name="code" classes="ph-bold" /> *Variables* tab are listed both the default and custom environment variables for your Strapi Cloud project. Each variable is composed of a *Name* and a *Value*.

#### Managing environment variables

Hovering on an environment variable, either default or custom, displays the following available options:

- <Icon name="eye" /> **Show value** to replace the `*` characters with the actual value of a variable.
- <Icon name="copy" /> **Copy to clipboard** to copy the value of a variable.
- <Icon name="dots-three" /> **Actions** to access the <Icon name="pencil-simple" /> Edit and <Icon name="trash-simple" /> Delete buttons.
  - When editing a default variable, the *Name* cannot be modified and the *Value* can only be automatically generated using the <Icon name="magic-wand" /> Generate value button. Don't forget to **Save**, or **Save & deploy** if you want the changes to take effect immediately.
  - When editing a custom variable, both the *Name* and *Value* can be modified by writing something new or by using the <Icon name="magic-wand" /> Generate value button. Don't forget to **Save**, or **Save & deploy** if you want the changes to take effect immediately.
  - When deleting a variable, you will be asked to confirm by selecting **Save**, or **Save & deploy** if you want the changes to take effect immediately.

:::tip
Use the search bar to find more quickly an environment variable in the list!
:::

#### Creating custom environment variables

Custom environment variables can be created for the Strapi Cloud project. Make sure to redeploy your project after creating or editing an environment variable.

<!-- Future iteration
:::note
Instead of creating a new custom environment variable from scratch, you can also import one by clicking on the **Import variables (.env)** button.
:::
-->

1. In the *Custom environment variables* section, click on the **Add variable** button.
2. Write the *Name* and *Value* of the new environment variable in the same-named fields. Alternatively, you can click on the <Icon name="magic-wand" /> icon to generate automatically the name and value.
3. (optional) Click on **Add another** to directly create one or more other custom environment variables.
4. Click on the **Save** button to confirm the creation of the custom environment variables. To apply your changes immediately, click on **Save & deploy**.
