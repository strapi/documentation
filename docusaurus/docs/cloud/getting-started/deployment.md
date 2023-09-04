---
title: Project Creation
displayed_sidebar: cloudSidebar
description: Learn how to deploy your Strapi application on Strapi Cloud.
canonicalUrl: https://docs.strapi.io/cloud/getting-started/deployment.html
sidebar_position: 2
---

# Project creation & deployment

This is a step-by-step guide for creating and deploying your first project on Strapi Cloud.

:::prerequisites
Before you can deploy your Strapi application on Strapi Cloud, you need to have the following prerequisites:

* Strapi version `4.8.2` or higher
* Project database must be compatible with PostgreSQL. Strapi does not support and does not recommend using any external databases, though it's possible to configure one (see [advanced database configuration](/cloud/advanced/database)).
* Project(s) source code hosted on [GitHub](https://github.com). The connected repository can contain multiple Strapi applications. Each Strapi app must be in a separate directory.
:::

## Logging in to Strapi Cloud

1. Navigate to the [Strapi Cloud](https://cloud.strapi.io) login page.

2. You are prompted to **Log in with GitHub**. This initial login will create your Strapi Cloud account. Once logged in, you will be redirected to the Strapi Cloud *Projects* page where you can create your first Strapi Cloud project.

    <ThemedImage
    alt="Strapi Cloud login page"
    sources={{
        light: '/img/assets/cloud/login.png',
        dark: '/img/assets/cloud/login_DARK.png',
    }}
    />

## Creating a project

1. From the *Projects* page, click the **Create project** button.

    <ThemedImage
    alt="Strapi Cloud Projects page"
    sources={{
        light: '/img/assets/cloud/projects-empty.png',
        dark: '/img/assets/cloud/projects-empty_DARK.png',
    }}
    />

2. You will be redirected to the first project creation interface. This interface contains 3 steps: choosing a plan, connecting a GitHub repository, and setting up the project.

    <ThemedImage
    alt="Strapi Cloud project creation, step 1"
    sources={{
        light: '/img/assets/cloud/project-creation-1.png',
        dark: '/img/assets/cloud/project-creation-1_DARK.png',
    }}
    />

3. Choose a plan for your Strapi Cloud project: either Pro, Team, or the 14-days free trial. Feel free to refer to [Pricing](https://strapi.io/pricing-cloud) for more information.

    :::note
    Strapi Cloud offers a free trial for only one project.
    If you have already used a free trial for a previous project, the option will no longer appear in the plan selection.
    :::

<!--
2. If you selected the free trial option, you are presented with additional information about the trial.

    ![Trial confirmation page](/img/assets/cloud/trial-confirmation.png)
-->

4. Connect a GitHub repository to your new Strapi Cloud project.

    4.a. Click on the **Connect GitHub repositories** button. You will be redirected to a GitHub modal to authorize Strapi Cloud to access your repository.

    :::tip
    Connect the GitHub account and/or organizations that own the repository or repositories you want to deploy. This can be different from the account that owns the Strapi Cloud account.
    :::

    4.b. Once Strapi Cloud is allowed permission to access the GitHub repositories, go back to the Strapi Cloud project creation interface to select an *Account* and *Repository*. 

    <ThemedImage
    alt="Selecting GitHub account and repository"
    sources={{
        light: '/img/assets/cloud/account-repo-selection.png',
        dark: '/img/assets/cloud/account-repo-selection_DARK.png',
    }}
    />

5. Set up your Strapi Cloud project.

    5.a. Fill in the following information:

    | Setting name | Instructions                                                                                            |
    |--------------|---------------------------------------------------------------------------------------------------------|
    | Display name | Write the name of your Strapi app, this is fetched from the repository name but can be edited. It is automatically converted to slug format (`my-strapi-app`). |
    | GitHub branch | Choose from the drop-down the default branch to use for this deployment. This uses the [default branch](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/changing-the-default-branch) of the repository. |
    | Deploy on push | Check the box to automatically deploy the latest changes from the selected branch. When disabled, you will need to manually deploy the latest changes. |
    | Region       | Choose the geographic location of the servers where your Strapi application is hosted. Selected region can either be USA in North America (default) or Amsterdam in Europe. |

    :::note
    The GitHub branch and "Deploy on push" settings can be modified afterwards through the project's setting, however the project name and hosting region setting can only be chosen during the creation of the project (see [Project Settings](/cloud/projects/settings)).
    :::

    5.b. (optional) Click on **Show advanced settings** to fill in the following options:

    <ThemedImage
    alt="Project creation advanced settings"
    sources={{
        light: '/img/assets/cloud/advanced-settings.png',
        dark: '/img/assets/cloud/advanced-settings_DARK.png',
    }}
    />

    | Setting name | Instructions                                                                                            |
    |--------------|---------------------------------------------------------------------------------------------------------|
    | Base directory | Write the name of the directory where your Strapi app is located in the repository. This is useful if you have multiple Strapi apps in the same repository or if you have a monorepo. |
    | Variables    | Click on **Add variable** to add environment variables used to configure your Strapi app (see [Environment variables](/dev-docs/configurations/environment/) for more information). You can also add environment variables to your Strapi application by adding a `.env` file to the root of your Strapi app directory. The environment variables defined in the `.env` file will be used by Strapi Cloud. |

    :::strapi Using Environment Variables
    You can use environment variable to connect your project to an external database rather than the default one used by Strapi Cloud (see [database configuration](/dev-docs/configurations/database#environment-variables-in-database-configurations) for more details). If you would like to revert and use Strapi's default database again, you have to remove your `DATABASE_` environment variables (no automatic migration implied).
    
    You can also set up here a custom email provider. Sendgrid is set as the default one for the Strapi applications hosted on Strapi Cloud (see [providers configuration](/dev-docs/providers#configuring-providers) for more details).
    :::

## Setting up billing details

1. Click on the **Continue to billing** button. If you chose the 14-days free trial, a dialog will open to recapitulate what this plan involves and how it works. Otherwise, you will directly be redirected to the second and final project creation interface. There you can review all your new project setup information, enter payment & billing details and receive your invoice.

    <ThemedImage
    alt="Payment & Billing"
    sources={{
        light: '/img/assets/cloud/project-creation-2.png',
        dark: '/img/assets/cloud/project-creation-2_DARK.png',
    }}
    />

2. Review your project: make sure the plan and setup information are correct. If needed, click the ![Edit icon](/img/assets/icons/edit.svg) **Edit** button to be redirected to the first interface of the project creation and fix any mistake.

3. In the Payment section, fill in at least all mandatory elements for *Payment method* and *Billing information*.

4. Check your invoice which informs you of what should be paid now and the following month. Optionally, you can enter a *Discount code* if you have one.

5. Click on the **Create project** button to finalize the creation of your new Strapi Cloud project. An initial deployment will automatically be triggered and you will be redirected to the *Projects* page.

:::caution
Create your Admin user after the initial deployment is complete. Do not share your application URL with anyone until you have created your Admin user.
:::
