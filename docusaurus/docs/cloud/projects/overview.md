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

* the project name
* the current status of the project:
    * *Disconnected*, if the project repository is not connected to Strapi Cloud
    * *Suspended*, if the project has been suspended (refer to [Project suspension](/cloud/getting-started/usage-billing#project-suspension) to reactivate the project)
    * *Incompatible version*, if the project is using a Strapi version that is not compatible with Strapi Cloud
* the last deployment date


Each project card also displays a menu icon to access the following options:
* **Visit App**: to go to the application.
* **Go to Deploys**: to go to the [*Deploys*](/cloud/projects/deploys) page.
* **Go to Settings**: to go to the [*Settings*](/cloud/projects/settings) page.

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
* view your project's usage (see [Usage](/cloud/getting-started/usage-billing) for more information)
* view your project's latest deploys (see [Deploys](/cloud/projects/deploys) for more information)
* invite a new maintainer to collaborate on your project by clicking on the **Share** button (see [Collaboration](/cloud/projects/collaboration) for more information)
* trigger a new deployment by clicking on the **Trigger deploy** button
* access your application by clicking on the **Visit app** button

You can also navigate to the following other tabs:
* *Deploys* and *Runtime logs*, to access the project's deploys history and logs (see [Deploys & Runtime logs](/cloud/projects/deploys))
* *Settings*, to access the project's settings (see [Project settings](/cloud/projects/settings))

