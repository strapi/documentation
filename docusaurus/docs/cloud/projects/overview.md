---
title: Projects overview
displayed_sidebar: cloudSidebar
description: View and manage your projects on Strapi Cloud.
canonicalUrl: https://docs.strapi.io/cloud/projects/overview.html
sidebar_position: 1
tags:
- project status
pagination_next: cloud/projects/settings
---

import ScreenshotNumberReference from '/src/components/ScreenshotNumberReference.jsx';

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
* the last successful deployment’s date of the Production environment
* the current status of the project:
    * *Disconnected*, if the project repository is not connected to Strapi Cloud
    * *Suspended*, if the project has been suspended (refer to [Project suspension](/cloud/getting-started/usage-billing#project-suspension) to reactivate the project)
    * *Incompatible version*, if the project is using a Strapi version that is not compatible with Strapi Cloud

Each project card also displays a <Icon name="dots-three-outline" /> menu icon to access the following options:
* **Visit App**: to be redirected to the application
* **Go to Deployments**: to be redirected to the [*Deployment*](/cloud/projects/deploys) page
* **Go to Settings**: to be redirected to the [*Settings*](/cloud/projects/settings) page

:::tip
Click on the *<Icon name="sparkle"/> Product updates* button in the navigation bar to check out the latest features and fixes released.
:::


## Accessing a project's dashboard

From the *Projects* page, click on any project card to access its dashboard. It displays the project and environment details and gives access to the deployment history and all available settings.

<ThemedImage
  alt="Project overview"
  sources={{
    light: '/img/assets/cloud/overview2.png',
    dark: '/img/assets/cloud/overview2_DARK.png',
  }}
/>

From the dashboard's header of a chosen project, you can:
- use the **Share** button to invite users to collaborate on the project (see [Collaboration](/cloud/projects/collaboration)) and see the icons of those who have already been invited <ScreenshotNumberReference number="1" />,
- use the <Icon name="gear-six" /> **Settings** button to access the settings of the project and its existing environments <ScreenshotNumberReference number="2" />,
- choose which environment to visualise for the project or add a new environment <ScreenshotNumberReference number="3" />,
- trigger a new deployment (see [Deployments management](/cloud/projects/deploys)) and visit your application <ScreenshotNumberReference number="4" />.

Your project's dashboard also displays:
- the *Deployments* and *Runtime logs* tabs, to see the deployments history (more details in [Deploy history and logs](/cloud/projects/deploys-history)) and the runtime logs of the project (see [dedicated documentation page](/cloud/projects/runtime-logs)) <ScreenshotNumberReference number="5" />
- the project and environment details in a box on the right of the interface <ScreenshotNumberReference number="6" />, including:
  - the number of API calls,
  - the current usage for asset bandwidth and storage,
  - the name of the branch and a **Manage** button to be redirect to the branch settings (see [Modifying git repository & branch](/cloud/projects/settings#modifying-git-repository--branch)),
  - the name of the base directory,
  - the Strapi version number,
  - the Strapi app's url.

