---
title: Twitch provider for Users & Permissions
# description: todo
displayed_sidebar: cmsSidebar
tags:
- users and permissions
- providers
- configuration
- customization
---

# Twitch provider for Users & Permissions

<h4 id="twitch">Using ngrok</h4>

Twitch accepts the `localhost` urls. <br/>
The use of `ngrok` is not needed.

<h4 id="twitch-config">Twitch configuration</h4>

- Visit the Apps list page on the developer console <br/> [https://dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps)
- Click on **Register Your Application** button
- Fill the information:
  - **Name**: Strapi auth
  - **OAuth Redirect URLs**: `http://localhost:1337/api/connect/twitch/callback`
  - **Category**: Choose a category
- Click on **Manage** button of your new app
- Generate a new **Client Secret** with the **New Secret** button
- You should see your Application ID and secret, save them for later

<h4 id="twitch-strapi-config">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
- Click on the **Twitch** provider
- Fill the information (replace with your own client ID and secret):
  - **Enable**: `ON`
  - **Client ID**: amuy279g8wt68qlht3u4gek4oykh5j
  - **Client Secret**: dapssh10uo97gg2l25qufr8wen3yr6
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/twitch/redirect`
