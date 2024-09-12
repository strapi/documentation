---
title: Projects overview
displayed_sidebar: cloudSidebar
description: View and manage your projects on Strapi Cloud.
canonicalUrl: https://docs.strapi.io/cloud/projects/overview.html
sidebar_position: 1
tags:
- project status
- Strapi Cloud
---

# Projects overview

The *Projects* page displays a list of all your Strapi Cloud projects. From here you can manage your projects and access the corresponding applications.

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

Each project card also displays a ![Menu icon](/img/assets/icons/more.svg) menu icon to access the following options:
* **Visit App**: to be redirected to the application
* **Go to Deploys**: to be redirected to the [*Deploys*](/cloud/projects/deploys) page
* **Go to Settings**: to be redirected to the [*Settings*](/cloud/projects/settings) page

## Accessing a project's overview

From the *Projects* page, click on any project card to access the *Overview* of your project. It displays all details such as usage and status information and gives access to deployment history and available settings.

:::strapi Navigating Strapi Cloud projects dashboards
Once you click on a project page, you access the dedicated dashboard for your chosen project. It is by default that you land on the *Overview* tab, however the header of the project's dashboard doesn't change and always offers the following options:

- links to the other available tabs for the project: *Overview*, [*Deploys*](/cloud/projects/deploys), [*Runtime Logs*](/cloud/projects/runtime-logs) and [*Settings*](/cloud/projects/settings)
- the **Share** button to invite a new maintainer to collaborate on your project — and if the project is already shared: avatars of the maintainers (see [Collaboration](/cloud/projects/collaboration))
- the **Trigger deploy** button to trigger a new deployment of your project
- the **Visit app** button to access your application
:::

<ThemedImage
  alt="Project overview"
  sources={{
    light: '/img/assets/cloud/overview.png',
    dark: '/img/assets/cloud/overview_DARK.png',
  }}
/>

From the *Overview* tab, you can:
- view a recap of the main settings of your project, such as:
  - the link to the source repository
  - the name of the branch
  - the name of the base directory
  - the URL and link to the application
- view your project's usage (see [Usage](/cloud/getting-started/usage-billing) for more information)
- view your project's latest deploys (see [Deploys](/cloud/projects/deploys) for more information)
