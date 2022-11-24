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

The project details page displays the following tabs: **Overview, **Deploys**, **Activity**, and **Settings**.

### Overview

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

From this page you can also trigger a new deployment and access the application using the corresponding buttons.

### Activity
