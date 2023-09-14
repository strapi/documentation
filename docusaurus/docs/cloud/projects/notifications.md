---
title: Notifications
displayed_sidebar: cloudSidebar
description: View your notifications on Strapi Cloud.
canonicalUrl: https://docs.strapi.io/cloud/projects/notifications
sidebar_position: 3
---

# Notifications

The **Notification center** can be opened by clicking the bell icon ![Notification icon](/img/assets/icons/notifications.svg) in the top navigation of the Cloud dashboard.

It displays a list of the latest notifications for all existing projects. Clicking on a notification card from the list will redirect you to the **Log details** of the corresponding deployment.

<ThemedImage
  alt="Notification center"
  sources={{
    light: '/img/assets/cloud/notification-center.png',
    dark: '/img/assets/cloud/notification-center_DARK.png',
  }}
/>

The following notifications can be listed in the Notifications center:

* **Deploy completed**: When a deployment is successfully done.
* **Build failed**: When deployment fails during the build stage.
* **Deploy failed** When deployment fails during the deployment stage.
* **Deploy triggered** When deployment is triggered by a new push to the connected repository. This notification is however not sent when the deployment is triggered manually.

:::note
All notifications older than 30 days are automatically removed from the **Notification center**.
:::
