---
title: Deploys & Runtime logs
displayed_sidebar: cloudSidebar
description: View and manage your projects's deploys and runtime logs.
canonicalUrl: https://docs.strapi.io/cloud/projects/overview.html
sidebar_position: 1
---

# Project deploys

From the overview of a Strapi Cloud project, you can access its deploy history and the runtime logs of the latest deployment.

## Viewing deploy history

The Deploy tab displays a chronological list of cards with the details of all historical deployments for the project.

<ThemedImage
  alt="Project deploys"
  sources={{
    light: '/img/assets/cloud/deploys.png',
    dark: '/img/assets/cloud/deploys_DARK.png',
  }}
/>

Each card displays the following information:

* **Commit SHA**
* **Commit message**
* **Deployment status**: Whether the project is:
    * **Deploying**
    * **Done**
    * **Cancelled**
    * **Build failed**
    * **Deploy failed**
* **Last deployment time**: When the deployment was triggered and the duration.
* **Production branch**
* **Options** menu (`...`): Use to access the [**Deployment details**](#deployment-details) page. For in-progress deployments, you can also cancel the deployment.

From this page you can also trigger a new deployment, cancel a pending deployment, and click on any deployment to view additional details.

### Deployment details

From the **Deploys** tab, view the deployment history for this project. Use the **Options** menu (`...`) to access the **Deployment details** page for any deployment.

<ThemedImage
  alt="Deployment details"
  sources={{
    light: '/img/assets/cloud/deploy_logs.png',
    dark: '/img/assets/cloud/deploy_logs_DARK.png',
  }}
/>

The deployment details page displays the following information:

* **Status**: Whether the project is **Building**, **Deploying**, **Done**, **Cancelled**, **Build failed**, or **Deploy failed**.
* **Triggered**: When the deployment was triggered.
* **Deployed In**: The time it took to deploy the project.
* **Commit**: The commit used for this deployment. Click the commit SHA to view the commit on GitHub.
* **Branch**: The branch used for this deployment.
* **Logs**: The Build, Deploy, and Runtime logs of the deployment. Click the **copy logs** button to copy the log contents.

<!-- WiP
### Activity

The **Activity** tab provides a searchable and filterable display of all activities performed by users of the Strapi application.

--insert screenshot

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


### Creating a custom filter
WiP


#### Searching logs

Click the **Search** icon to search for a specific log. The search is performed on all log fields.



#### Log details

For any log item, click the **Details** icon to display a modal with more details about that action.

-->

## Viewing runtime logs

WIP