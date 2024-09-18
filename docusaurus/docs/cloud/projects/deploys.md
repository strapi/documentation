---
title: Deployments management
displayed_sidebar: cloudSidebar
description: Manage your projects's deploys.
canonicalUrl: https://docs.strapi.io/cloud/projects/deploys.html
sidebar_position: 1
tags:
- deployment
- project settings
- deploy, history and logs
- Strapi Cloud
- Strapi Cloud project
---

# Deployments management

The creation of a new Strapi Cloud project automatically trigger the deployment of that project. After that, deployments can be:

- manually triggered whenever needed, [from the Cloud dashboard](#triggering-a-new-deployment) or [from the CLI](/cloud/cli/cloud-cli#strapi-deploy),
- or automatically triggered everytime a new commit is pushed to the branch, if the Strapi Cloud project is connected to a git repository and the "deploy on push" option is enabled (see [Project settings](/cloud/projects/settings#modifying-git-repository--branch)).

Ongoing deployments can also be [manually cancelled](#cancelling-a-deployment) if needed.

## Triggering a new deployment

To manually trigger a new deployment for your project, click on the **Trigger deployment** button always displayed in the right corner of a project dashboard's header. This action will add a new card in the *Deployments* tab, where you can monitor the status and view the deployment logs live (see [Deploy history and logs](/cloud/projects/deploys-history)).

<!-- Update screenshot -->
<ThemedImage
  alt="Triggering new deploy"
  sources={{
    light: '/img/assets/cloud/trigger-deploy.png',
    dark: '/img/assets/cloud/trigger-deploy_DARK.png',
  }}
/>

## Cancelling a deployment

If for any reason you want to cancel an ongoing and unfinished deployment:

1. Go to the *Deployment details* page of the latest triggered deployment (see [Accessing log details](/cloud/projects/deploys-history#accessing-deployment-details--logs)).
2. Click on the **Cancel deployment** button in the top right corner. The status of the deployment will automatically change to *Cancelled*.

:::tip
You can also cancel a deployment from the *Deployments* tab which lists the deployments history. The card of ongoing deployment with the *Building* status will display a ![Cancel button](/img/assets/icons/clear.svg) button for cancelling the deployment.
:::

<!-- Update screenshot -->
<ThemedImage
  alt="Cancelling deploy"
  sources={{
    light: '/img/assets/cloud/cancel-deploy.png',
    dark: '/img/assets/cloud/cancel-deploy_DARK.png',
  }}
/>
