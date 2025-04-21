---
title: Notifications
displayed_sidebar: cloudSidebar
description: View your notifications on Strapi Cloud.
canonicalUrl: https://docs.strapi.io/cloud/projects/notifications
sidebar_position: 3
tags:
- notifications
- Strapi Cloud
- Strapi Cloud project
---

# Notifications

The Notification center can be opened by clicking the bell icon <Icon name="bell" /> in the top navigation of the Cloud dashboard.

It displays a list of the latest notifications for all your existing projects. Clicking on a notification card from the list will redirect you to the *Log details* page of the corresponding deployment (more information in [Deploy history & logs](/cloud/projects/deploys-history#accessing-deployment-details--logs)).

<ThemedImage
  alt="Notification center"
  sources={{
    light: '/img/assets/cloud/notification-center.png',
    dark: '/img/assets/cloud/notification-center_DARK.png',
  }}
/>

The following notifications can be listed in the Notifications center:

- *deployment completed*: when a deployment is successfully done.
- *Build failed*: when a deployment fails during the build stage.
- *deployment failed*: when a deployment fails during the deployment stage.
- *deployment triggered*: when a deployment is triggered by a new push to the connected repository. This notification is however not sent when the deployment is triggered manually.

:::note
All notifications older than 30 days are automatically removed from the Notification center.
:::
