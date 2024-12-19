---
title: Google provider setup for Users & Permissions
# description: todo
displayed_sidebar: cmsSidebar
tags:
- users and permissions
- providers
- configuration
- customization
---

import ConfigDone from '/docs/snippets/u-and-p-provider-config-done.md'

# Google provider setup for Users & Permissions

The present page explains how to setup the Google provider for the [Users & Permissions feature](/user-docs/features/users-permissions).

:::prerequisites
You have the [Users & Permissions providers documentation](/dev-docs/configurations/users-and-permissions-providers).
:::

## Google configuration

:::note
Google accepts the `localhost` urls. <br/>
The use of `ngrok` is not needed.
:::

1. Visit the Google Developer Console at [https://console.developers.google.com/](https://console.developers.google.com/)
2. Click on the **Select a project** dropdown in the top menu
3. Then click **NEW PROJECT** button
4. Fill the **Project name** input and create

Wait a few seconds while the application is created.

5. On the project dropdown, select your new project
6. Click on **Go to APIs overview** under the **APIs** card
7. Then click on the **Credentials** link in the left menu
8. Click on **OAuth consent screen** button
9. Choose **External** and click on **create**
10. Fill the **Application name** and save
11. Then click on **Create credentials** button
12. Choose **OAuth client ID** option
13. Fill the information:
    - **Name**: `Strapi Auth`
    - **Authorized redirect URIs**: `http://localhost:1337/api/connect/google/callback`
14. Click on **OAuth 2.0 Client IDs** name of the client you just created
15. You should see your Application ID and secret, save them for later

## Strapi configuration

1. Visit the User & Permissions provider settings page at [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
2. Click on the **Google** provider
3. Fill the information (replace with your own client ID and secret):
   - **Enable**: `ON`
   - **Client ID**: 226437944084-o2mojv5i4lfnng9q8kq3jkf5v03avemk.apps.googleusercontent.com
   - **Client Secret**: aiTbMoiuJQflSBy6uQrfgsni
   - **The redirect URL to your front-end app**: `http://localhost:3000/connect/google/redirect`

<ConfigDone />
