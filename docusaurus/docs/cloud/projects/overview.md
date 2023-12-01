---
title: Projects overview
displayed_sidebar: cloudSidebar
description: View and manage your projects on Strapi Cloud.
canonicalUrl: https://docs.strapi.io/cloud/projects/overview.html
sidebar_position: 1
---

# Projects overview

The Projects page displays a list of all your Strapi Cloud projects. From here you can manage your projects and access the corresponding applications.

<ThemedImage
  alt="Projects page - List"
  sources={{
    light: '/img/assets/cloud/project_list.png',
    dark: '/img/assets/cloud/project_list_DARK.png',
  }}
/>

Each project card displays the following information:

* **Project name**
* **Status**: Displays the current status of the project. One of the following:
    * **Disconnected** if the project repository is not connected to Strapi Cloud.
    * **Suspended** if the project has been suspended. Contact Strapi support to reactivate the project.
    * **Incompatible version** if the project is using a Strapi version that is not compatible with Strapi Cloud.
* **Last deployment date**: Timestamp of the last deployment.
* **Options** menu: Open the menu to select from the available options:
    * **Visit App**: Go to the application.
    * **Go to Deploys**: Go to the [**Deploys**](#deploys) page.
    * **Go to Settings**: Go to the [**Settings**](./settings/) page.

## Accessing a project's details

From the Projects page, click on any project card to access the Overview page of your project. It displays all details such as usage and status information and gives access to deployment history and available settings.

<ThemedImage
  alt="Project overview"
  sources={{
    light: '/img/assets/cloud/overview.png',
    dark: '/img/assets/cloud/overview_DARK.png',
  }}
/>

From the Overview tab, you can:

* Access the project's deploys history and logs, via the Deploys and Runtime logs tabs (see ...)
* Access the project's settings, via the Settings tab (see [Project settings](settings.md))
* Trigger a new deployment by clicking on the **Trigger deploy** button
* Access your application by clicking on the **Visit app** button
* View your project's usage (see [**Usage**](/cloud/getting-started/usage-billing) for more information)
* View your project's latest deploys (see [**Deploys**](#deploys) for more information)
