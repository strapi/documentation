---
title: Twitch provider setup for Users & Permissions
# description: todo
displayed_sidebar: cmsSidebar
tags:
- users and permissions
- providers
- configuration
- customization
---

import ConfigDone from '/docs/snippets/u-and-p-provider-config-done.md'

# Twitch provider setup for Users & Permissions

The present page explains how to setup the Twitch provider for the [Users & Permissions feature](/user-docs/features/users-permissions).

:::prerequisites
You have the [Users & Permissions providers documentation](/dev-docs/configurations/users-and-permissions-providers).
:::

## Twitch configuration

:::note
Twitch accepts the `localhost` urls. <br/>
The use of `ngrok` is not needed.
:::

1. Visit the Apps list page on the developer console at [https://dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps)
2. Click on **Register Your Application** button
3. Fill the information:
   - **Name**: Strapi auth
   - **OAuth Redirect URLs**: `http://localhost:1337/api/connect/twitch/callback`
   - **Category**: Choose a category
4. Click on **Manage** button of your new app
5. Generate a new **Client Secret** with the **New Secret** button
6. You should see your Application ID and secret, save them for later

## Strapi configuration

1. Visit the User & Permissions provider settings page at [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
2. Click on the **Twitch** provider
3. Fill the information (replace with your own client ID and secret):
   - **Enable**: `ON`
   - **Client ID**: amuy279g8wt68qlht3u4gek4oykh5j
   - **Client Secret**: dapssh10uo97gg2l25qufr8wen3yr6
   - **The redirect URL to your front-end app**: `http://localhost:3000/connect/twitch/redirect`

<ConfigDone />
