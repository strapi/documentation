---
title: Deploy history & logs
displayed_sidebar: cloudSidebar
description: View projects' deploy history and logs.
canonicalUrl: https://docs.strapi.io/cloud/deploys-history.html
sidebar_position: 1
---

# Deploy history and logs

From the overview of a Strapi Cloud project, you can access its deploy history and the runtime logs of the latest deployment.

## Viewing deploy history

The *Deploys* tab of a Strapi Cloud project gives access to the list of all deployments for the project, as well as related deployment logs and details.

<ThemedImage
  alt="Project deploys"
  sources={{
    light: '/img/assets/cloud/deploys.png',
    dark: '/img/assets/cloud/deploys_DARK.png',
  }}
/>

In the *Deploys* tab is displayed a chronological list of cards with the details of all historical deployments for your project.

Each card displays the following information:
* Commit SHA <Annotation>💡 The commit SHA (or hash) is the unique ID of your commit, which refers to a specific change that was made at a specific time.</Annotation>, with a direct link to your git provider, and commit message
* Deployment status:
    * *Deploying*
    * *Done*
    * *Cancelled*
    * *Build failed*
    * *Deploy failed*
* Last deployment time (when the deployment was triggered and the duration)
* Production branch

The cards also display a See logs button to access the deployment details (see [Triggering and managing deployments](#triggering-and-managing-deployments)).


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