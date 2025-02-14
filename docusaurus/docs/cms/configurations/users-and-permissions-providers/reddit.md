---
title: Reddit provider setup for Users & Permissions
# description: todo
displayed_sidebar: cmsSidebar
tags:
- users and permissions
- providers
- configuration
- customization
---

import ConfigDone from '/docs/snippets/u-and-p-provider-config-done.md'

# Reddit provider setup for Users & Permissions

The present page explains how to setup the Reddit provider for the [Users & Permissions feature](/cms/features/users-permissions).

:::prerequisites
You have read the [Users & Permissions providers documentation](/cms/configurations/users-and-permissions-providers).
:::

## Reddit configuration

:::note
Reddit accepts the `localhost` urls. <br/>
The use of `ngrok` is not needed.
:::

1. Visit the Reddit authorized applications preferences page at [https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
2. Click on the **create another app...** button near the bottom
3. Select **web app** for the type
4. Fill the **name** and **redirect uri** input in
5. Click the **create app** button
6. Note that the **Client ID** is located under the app type (web app)

## Strapi configuration

1. Visit the User & Permissions provider settings page at [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
2. Click on the **Reddit** provider
3. Fill the information (replace with your own client ID and secret):
   - **Enable**: `ON`
   - **Client ID**: hmxSBOit0SCjSQ
   - **Client Secret**: gwR9hCjK_PMYVYNGeDLS4WLB8g7xqg
   - **The redirect URL to your front-end app**: `http://localhost:3000/connect/reddit/redirect`

<ConfigDone />
