---
title: Projects
displayed_sidebar: cloudSidebar
description: View and manage your projects on Strapi Cloud.
canonicalUrl: https://docs.strapi.io/cloud/projects/overview.html
sidebar_position: 1
---

# Projects

The **Projects** page displays a list of all your Strapi Cloud projects. From here you can manage your projects and access the corresponding applications.

![Projects page - List](/img/assets/cloud/project_list.png)

Each project card displays the following information:

* **Project name**
* **Status**: Displays a **Disconnected** warning if the project repository is not connected to Strapi Cloud.
* **Last deployment date**: Timestamp of the last deployment.

## Project details

From the **Projects** page, click on any project card to access that project's details page.

The project details page displays the following tabs: **Overview**, **Deploys**, **Activity**, and [**Settings**](./settings/).

### Overview

The **Overview** tab displays a high detail view of the project, including its configuration, usage, and deployment history.

![Project overview](/img/assets/cloud/overview.png)

From this tab you can:

* **Trigger deploy**: Click the **Trigger deploy** button to trigger a new deployment
* **Visit App**: Click the **Visit App** button to access the application
* Quickly view project [**Usage**](./setting#usage)
* Quickly view project [**Deploys**](#deploys)

### Deploys

The **Deploys** tab displays a chronological list of cards with the details of all historical deployments for the project.

![Project deploys](/img/assets/cloud/deploys.png)

Each card displays the following information:

* **Commit SHA**
* **Commit message**
* **Deployment status**: Whether the project is 
    * **Deploying**
    * **Done**
    * **Cancelled**
    * **Build failed**
    * **Deploy failed**
* **Last deployment time**: When the deployment was triggered and the duration.
* **Production branch**
* **Options** menu (`...`): The available options vary depending on the deployment status.
    * For **Done** status: No further options.
    * For **Deploying** status, you can:
        * **Cancel deploy**
    * For **Build failed** status, you can:
        * **Download error logs**
    * For **Deploy failed** status, you can:
        * **Download error logs**

From this page you can also trigger a new deployment, cancel a pending deployment, and click on any deployment to view additional details.

#### Deployment details

From the **Deploys** tab, click on any deployment card to view additional details.

![Deployment details](/img/assets/cloud/deploy_logs.png)

The deployment details page displays the following information:

* **Status**: Whether the project is **Building**, **Deploying**, **Done**, **Cancelled**, **Build failed**, or **Deploy failed**.
* **Triggered**: When the deployment was triggered and the duration.
* **Deployed In**: The time it took to deploy the project.
* **Commit**: The commit used for this deployment. Click the commit SHA to view the commit on GitHub.
* **Branch**: The branch used for this deployment.
* **Logs**: The Build, Deploy, and Runtime logs of the deployment. Click the **copy logs** button to copy the log contents.

### Activity

The **Activity** tab provides a searchable and filterable display of all activities performed by users of the Strapi application.

<!--insert screenshot -->

For each log item the following information is displayed:

* **Action**: The type of action performed by the user. For example `create` or `update`.
* **Response Status**: The HTTP status code returned by the server for that action.
* **Path**: The path of the request.
* **Date**: The date and time of the action.
* **User**: The user who performed the action.
* **Details**: Displays a modal with more details about the action. For example the User IP address, the request body, or the response body.

#### Filtering logs

All logs are displayed by default, in reverse chronological order. You can filter the logs by:

* **Action**: Select the type of action to filter by. For example `create` or `update`.
* **User**: Select the user to filter by.
* **Date**: Select a date (range) to filter by.
* **Time**: Select a time (range) to filter by.
* **+Add Filter**: Create a custom filter by selecting a field and a value.

<!--
### Creating a custom filter
WiP
-->

#### Searching logs

Click the **Search** icon to search for a specific log. The search is performed on all log fields.

<!--insert screenshot -->

#### Log details

For any log item, click the **Details** icon to display a modal with more details about that action.

<!--insert screenshot -->
