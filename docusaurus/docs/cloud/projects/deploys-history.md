---
title: Deployment history & logs
displayed_sidebar: cloudSidebar
description: View projects' deployment history and logs.
canonicalUrl: https://docs.strapi.io/cloud/deploys-history.html
sidebar_position: 1
tags:
- deployment
- project settings
- deploy, history and logs
- Strapi Cloud
- Strapi Cloud project
---

# Deployment history and logs {#deploy-history-and-logs}

> Deployments tab lists every build with status and allows deep inspection of build and runtime logs.
<br/>

For each Strapi Cloud project, you can access the history of all deployments that occurred and their details including build and deployment logs. This information is available in the *Deployments* tab.

## Viewing the deployment history {#viewing-deploy-history}

In the *Deployments* tab is displayed a chronological list of cards with the details of all historical deployments for your project.

<ThemedImage
  alt="Project deploys"
  sources={{
    light: '/img/assets/cloud/overview.png',
    dark: '/img/assets/cloud/overview_DARK.png',
  }}
/>

Each card displays the following information:
- Commit SHA <Annotation>💡 The commit SHA (or hash) is the unique ID of your commit, which refers to a specific change that was made at a specific time.</Annotation>, with a direct link to your git provider, and commit message
- Deployment status:
    - *Deploying*
    - *Done*
    - *Canceled*
    - *Build failed*
    - *Deployment failed*
- Last deployment time (when the deployment was triggered and the duration)
- Branch

## Accessing deployment details & logs

From the *Deployments* tab, you can hover a deployment card to make the ![See logs button](/img/assets/icons/Eye.svg) **Show details** button appear. Clicking on this button will redirect you to the *Deployment details* page which contains the deployment's detailed logs.

<ThemedImage
  alt="Deployment details"
  sources={{
    light: '/img/assets/cloud/deploy_logs.png',
    dark: '/img/assets/cloud/deploy_logs_DARK.png',
  }}
/>

In the *Build logs* and *Deployment logs* sections of the page you can click on the arrow buttons ![Down arrow](/img/assets/icons/ONHOLDCarretDown.svg) ![Up arrow](/img/assets/icons/ONHOLDCarretUp.svg) to show or hide the build and deployment logs of the deployment.

:::tip
Click the ![Copy button](/img/assets/icons/duplicate.svg) **Copy to clipboard** button to copy the log contents.
:::

In the right side of the *Deployment details* page is also displayed the following information:
- *Commit*: the commit SHA <Annotation>💡 The commit SHA (or hash) is the unique ID of your commit, which refers to a specific change that was made at a specific time.</Annotation>, with a direct link to your git provider, and commit message used for this deployment
- *Status*, which can be *Building*, *Deploying*, *Done*, *Canceled*, *Build failed*, or *Deployment failed*
- *Source*: the branch and commit message for this deployment
- *Duration*: the amount of time the deployment took and when it occurred
