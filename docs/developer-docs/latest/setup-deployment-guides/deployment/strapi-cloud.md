---
title: Strapi Cloud Deployment - Strapi Developer Docs
description: Learn how to deploy your Strapi application on Strapi Cloud.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment/strapi-cloud.html
---

# Strapi Cloud

::: warning
Strapi Cloud is currently in Closed Beta release. Features and functionality may change prior to General Availability.
:::

This is a step-by-step guide for deploying your Strapi application on Strapi Cloud.

## Prerequisites

Before you can deploy your Strapi application on Strapi Cloud, you need to have the following prerequisites:

* A [GitHub](https://github.com) account
* GitHub repository for each Strapi application to be deployed

::: tip
Each Strapi app must be in a separate repository. Your Strapi Cloud account can link to multiple repositories to deploy multiple apps, if needed.
:::

## Getting started

1. Navigate to the [Strapi Cloud](https://cloud.strapi.io) login page.

// screenshot

2. You are prompted to **Log In with GitHub**. Your Strapi Cloud account is created during this initial login.

3. Once logged in, you will be redirected to the Strapi Cloud **Projects** page. From here you can create your first Strapi Cloud project.

### Create a project

1. From the **Projects** page, click the **Create Project** button. You are prompted to **Connect with GitHub**.

::: tip
Connect the GitHub account that owns the repository you want to deploy. This can be different from the account that owns the Strapi Cloud account.

You will be redirected to GitHub to authorize Strapi Cloud to access your repository.
:::

2. After granting the required access form GitHub, from the **Projects** page select whether to install Strapi Cloud on **All repositories** or **Only select repositories**.

// screenshot

3. Click **Install** to install Strapi Cloud on the selected repositories. Once complete, you are prompted to **Import** the repository with your desired Strapi app.

// screenshot

4. Use the drop-down to select the repository you want to import, then click **Next**.

// screenshot

5. Enter the following details:
    * **Project name**: The name of your Strapi app, this is fetched from the repository name but can be edited. It is automatically converted to slug format (`my-strapi-app`).
    * **Default branch**: The default branch to use for this deployment. This uses the [default branch](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/changing-the-default-branch) of the repository and cannot be edited from Strapi Cloud.

6. Click **Create** to finalize the project creation. An initial deployment is triggered and you are redirected to the **Projects** page.