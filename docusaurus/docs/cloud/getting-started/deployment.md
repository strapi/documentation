---
title: Deployment
displayed_sidebar: cloudSidebar
description: Learn how to deploy your Strapi application on Strapi Cloud.
canonicalUrl: https://docs.strapi.io/cloud/getting-started/deployment.html
sidebar_position: 2
---

# Strapi Cloud

This is a step-by-step guide for deploying your Strapi application on Strapi Cloud.

## Prerequisites

Before you can deploy your Strapi application on Strapi Cloud, you need to have the following prerequisites:

* Strapi version `4.8.2` or higher
*  Database: Project must be compatible with PostgreSQL. Strapi does not support and does not recommend using any external databases, though it's possible to configure one (see [advanced database configuration](/cloud/advanced/database)).
* Project(s) source code hosted on [GitHub](https://github.com)
    * The connected repository can contain multiple Strapi applications. Each Strapi app must be in a separate directory.

## Getting started

1. Navigate to the [Strapi Cloud](https://cloud.strapi.io) login page.

    ![Strapi Cloud login page](/img/assets/cloud/login.png)

2. You are prompted to **Log In with GitHub**. Your Strapi Cloud account is created during this initial login.

3. Once logged in, you will be redirected to the Strapi Cloud **Projects** page. From here you can create your first Strapi Cloud project.

    ![Strapi Cloud Projects page](/img/assets/cloud/projects_empty.png)

## Creating a project

1. From the **Projects** page, click the **Create Project** button.
    You will be shown a **plan selection** dialog.
    This will allow you to select the most relevant plan for your project. Refer to [Pricing](https://strapi.io/pricing-cloud) for more information.

    <ThemedImage
    alt="Plan selection page"
    sources={{
        light: '/img/assets/cloud/plan-selection.png',
        dark: '/img/assets/cloud/plan-selection_DARK.png',
    }}
    />

    :::note
    Strapi Cloud offers a free trial for only one project.
    If you have already used a free trial for a previous project, the option will no longer appear in the plan selection.
    :::

2. If you selected the free trial option, you are presented with additional information about the trial.

    ![Trial confirmation page](/img/assets/cloud/trial-confirmation.png)

3. You are prompted to **Connect with GitHub**.

    ![Connect with Github page](/img/assets/cloud/connect-with-github.png)

    :::tip
    Connect the GitHub account and/or Organizations that own the repository or repositories you want to deploy. This can be different from the account that owns the Strapi Cloud account.

    You will be redirected to GitHub to authorize Strapi Cloud to access your repository.
    :::

4. After granting the required access from GitHub, select the desired repository to install Strapi Cloud.

    ![Project Import - Select Repository](/img/assets/cloud/import.png)

5. Click **Next** to proceed to the Project Set up page and enter the following information:
    * **Project name**: The name of your Strapi app, this is fetched from the repository name but can be edited. It is automatically converted to slug format (`my-strapi-app`).
    * **GitHub branch**: The default branch to use for this deployment. This uses the [default branch](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/changing-the-default-branch) of the repository but can be changed via the drop-down.
    * **Deploy on push**: When enabled, this will automatically deploy the latest changes from the selected branch. When disabled, you will need to manually deploy the latest changes.
    * **Region**: The geographic location of the servers where your Strapi application is hosted. Selected region can either be USA in North America (default) or Amsterdam in Europe.

    :::note
    The GitHub branch and "Deploy on push" settings can be modified afterwards through the project's setting, however the project name and hosting region setting can only be chosen during the creation of the project (see [Project Settings](/cloud/projects/settings)).
    :::

    <ThemedImage
    alt="Project Setup"
    sources={{
        light: '/img/assets/cloud/setup.png',
        dark: '/img/assets/cloud/setup_DARK.png',
    }}
    />

6. (**Optional**) Select **Show Advanced Settings** to configure the following options:
    * **Base directory**: The directory where your Strapi app is located in the repository. This is useful if you have multiple Strapi apps in the same repository or if you have a monorepo.
    * [**Environment variables**](/dev-docs/configurations/environment/): Environment variables are used to configure your Strapi app. You can add environment variables to your Strapi Cloud project by clicking **Add Environment Variable**. You can also add environment variables to your Strapi app by adding a `.env` file to the root of your Strapi app directory. The environment variables defined in the `.env` file will be used by Strapi Cloud.

    ![Advanced Setup](/img/assets/cloud/advanced.png)

    :::strapi Using Environment Variables
    You can use environment variable to connect your project to an external database rather than the default one used by Strapi Cloud. See the [Database Configuration documentation](/dev-docs/configurations/database#environment-variables-in-database-configurations) for details. If you'd like to revert and use our default database again, you have to remove your `DATABASE_` environment variables (no automatic migration implied).
    
    You can also set up here a custom email provider (Sendgrid is set as the default one for the Strapi apps hosted on Cloud). See the [Providers Configuration](/dev-docs/providers#configuring-providers) for details.
    :::

7. Click **Next** to proceed to the **Payment and billing** page. Enter the corresponding billing details.

    ![Payment and billing](/img/assets/cloud/billing-info.png)

8. Click **Create** to finalize the project creation. An initial deployment is triggered and you are redirected to the **Projects** page.

:::warning
Create your Admin user after the initial deployment is complete. Do not share your application URL with anyone until you have created your Admin user.
:::
