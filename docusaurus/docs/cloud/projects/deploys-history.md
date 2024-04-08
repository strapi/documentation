---
title: Deploy history & logs
displayed_sidebar: cloudSidebar
description: View projects' deploy history and logs.
canonicalUrl: https://docs.strapi.io/cloud/deploys-history.html
sidebar_position: 1
tags:
- deployment
- project settings
- deploy, history and logs
- Strapi Cloud
- Strapi Cloud project
---

# Deploy history and logs

For each Strapi Cloud project, you can access the history of all deployments that occured and their details including build and deploy logs. This information is available in the *Deploys* tab, located in the header of any chosen project.

## Viewing deploy history

In the *Deploys* tab is displayed a chronological list of cards with the details of all historical deployments for your project.

<ThemedImage
  alt="Project deploys"
  sources={{
    light: '/img/assets/cloud/deploys.png',
    dark: '/img/assets/cloud/deploys_DARK.png',
  }}
/>

Each card displays the following information:
- Commit SHA <Annotation>💡 The commit SHA (or hash) is the unique ID of your commit, which refers to a specific change that was made at a specific time.</Annotation>, with a direct link to your git provider, and commit message
- Deployment status:
    - *Deploying*
    - *Done*
    - *Cancelled*
    - *Build failed*
    - *Deploy failed*
- Last deployment time (when the deployment was triggered and the duration)
- Production branch

## Accessing deployment details & logs

From the *Deploys* tab, you can click on the ![See logs button](/img/assets/icons/Eye.svg) **See logs** button of any chosen deployment card to be redirected to the *Log details*. It contains the deployment's details logs.

<ThemedImage
  alt="Deployment details"
  sources={{
    light: '/img/assets/cloud/deploy-logs.png',
    dark: '/img/assets/cloud/deploy-logs_DARK.png',
  }}
/>

In the *Deploy details* section of the *Log details* page is displayed the following information:
- *Status*, which can be *Building*, *Deploying*, *Done*, *Cancelled*, *Build failed*, or *Deploy failed*
- *Maintenance*: when the deployment occured
- *Deployed in*: the amount of time the deployment took
- *Commit*: the commit SHA <Annotation>💡 The commit SHA (or hash) is the unique ID of your commit, which refers to a specific change that was made at a specific time.</Annotation>, with a direct link to your git provider, and commit message used for this deployment
- *Branch*: the branch used for this deployment

In the *Logs* section of the *Log details* page you can click on the arrow buttons ![Down arrow](/img/assets/icons/ONHOLDCarretDown.svg) ![Up arrow](/img/assets/icons/ONHOLDCarretUp.svg) to show or hide the build and deploy logs of the deployment.

:::tip
Click the ![Copy button](/img/assets/icons/duplicate.svg) **Copy to clipboard** button to copy the log contents.
:::
