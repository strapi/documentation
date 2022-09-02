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

## Managing projects

The **Projects** page displays a list of all your Strapi Cloud projects. From here you can manage your projects and access the corresponding applications.

// screenshot

Each project card displays the following information:

* Project name
* Status: 
    * **Running**: The project is running and your application is accessible from the project menu.
    * **Not running**: The deployment failed and project is not running. Trigger a new deployment or go to the project's page for additional details.
    * **Deploying**: During deployment you cannot access your application or trigger new deployments. Deployment can be cancelled from the `...` menu.
* Last deployment date: Timestamp of the last deployment.
* Options menu (`...`): The available options vary depending on the project's status.
    * For **Running** projects, you can:
        * **Visit App**: Access the project application.
        * **Go to Deploys**: Access the [Deploys](#deploys) tab of the project page.
        * **Go to Settings**: Access the [Settings](#settings) tab of the project page.
    * For **Not running** projects, you can:
        * **Go to Deploys**: Access the [Deploys](#deploys) tab of the project page.
        * **Go to Settings**: Access the [Settings](#settings) tab of the project page.
    * For **Deploying** projects, you can:
        * **Cancel deploy**: Cancel the pending deployment.

## Project details

From the **Projects** page, click on any project card to access that project's details page.

// screenshot

The project details page displays the following tabs: **Deploys** and **Settings**.

### Deploys

The **Deploys** tab displays a chronological list of cards with the details of all historical deployments for the project.

Each card displays the following information:

// screenshot

* Commit SHA
* Commit message
* Deployment status
* Production branch
* Last deployment date

From this page you can also trigger a new deployment and access the application using the corresponding buttons.

## Settings

The **Settings** enables you to edit the following details for the project:

// screenshot

* Project name
* Production branch
* Connected GitHub repository


