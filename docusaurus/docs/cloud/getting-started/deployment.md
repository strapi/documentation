---
title: Deployment
displayed_sidebar: cloudSidebar
description: Learn how to deploy your Strapi application on Strapi Cloud.
canonicalUrl: https://docs.strapi.io/cloud/getting-started/deployment.html
sidebar_position: 2
---

# Strapi Cloud

This is a step-by-step guide for deploying your Strapi application on Strapi Cloud.

:::strapi
During the soft launch of Strapi Cloud, a progressively increasing number of users will be able to access the service. Access will be granted to a mix of users currently on the waitlist as well as new users that can sign up each day.
:::

## Prerequisites

Before you can deploy your Strapi application on Strapi Cloud, you need to have the following prerequisites:

* Strapi version `4.7.x` or higher
* Database: Project must be compatible with PostgreSQL. Use of any external database is not supported.
* Project(s) source code hosted on [GitHub](https://github.com)
    * The connected repository can contain multiple Strapi applications. Each Strapi app must be in a separate directory.

## Getting started

1. Navigate to the [Strapi Cloud](https://cloud.strapi.io) login page.

    ![Strapi Cloud login page](/img/assets/cloud/login.png)

2. You are prompted to **Log In with GitHub**. Your Strapi Cloud account is created during this initial login.

3. Once logged in, you will be redirected to the Strapi Cloud **Projects** page. From here you can create your first Strapi Cloud project.

    ![Strapi Cloud Projects page](/img/assets/cloud/projects_empty.png)

### Create a project

The first time logging into Strapi Cloud, a welcome page is displayed providing a link to the terms of service and prompting you to **Start free trial** to continue.

![Strapi Cloud welcome page](/img/assets/cloud/welcome-screen.png)

1. From the **Projects** page, click the **Create Project** button. You are prompted to **Connect with GitHub**.

    :::tip
    Connect the GitHub account and/or Organizations that own the repository or repositories you want to deploy. This can be different from the account that owns the Strapi Cloud account.

    You will be redirected to GitHub to authorize Strapi Cloud to access your repository.
    :::

2. After granting the required access from GitHub, from the **Projects** page select your desired repository to install Strapi Cloud.

    ![Project Import - Select Repository](/img/assets/cloud/import.png)

3. Click **Next** to proceed to the Project Set up page and enter the following information:
    * **Project name**: The name of your Strapi app, this is fetched from the repository name but can be edited. It is automatically converted to slug format (`my-strapi-app`).
    * **GitHub branch**: The default branch to use for this deployment. This uses the [default branch](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/changing-the-default-branch) of the repository but can be changed via the drop-down.
    * **Deploy on push**: When enabled, this will automatically deploy the latest changes from the selected branch. When disabled, you will need to manually deploy the latest changes.

    ![Project Setup](/img/assets/cloud/setup.png)

4. (**Optional**) Select **Show Advanced Settings** to configure the following options:
    * **Base directory**: The directory where your Strapi app is located in the repository. This is useful if you have multiple Strapi apps in the same repository or if you have a monorepo.
    * [**Environment variables**](/dev-docs/configurations/environment/): Environment variables are used to configure your Strapi app. You can add environment variables to your Strapi Cloud project by clicking **Add Environment Variable**. You can also add environment variables to your Strapi app by adding a `.env` file to the root of your Strapi app directory. The environment variables defined in the `.env` file will be used by Strapi Cloud.

    ![Advanced Setup](/img/assets/cloud/advanced.png)

5. Click **Next** to proceed to the **Payment and billing** page. Enter the corresponding billing details.

    ![Payment and billing](/img/assets/cloud/billing-info.png)

6. Click **Create** to finalize the project creation. An initial deployment is triggered and you are redirected to the **Projects** page.

:::warning
Create your Admin user after the initial deployment is complete. Do not share your application URL with anyone until you have created your Admin user.
:::
