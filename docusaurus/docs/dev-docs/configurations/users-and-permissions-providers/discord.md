---
title: Discord provider for Users & Permissions
# description: todo
displayed_sidebar: cmsSidebar
tags:
- users and permissions
- providers
- configuration
- customization
---

# Discord provider for Users & Permissions

<h4 id="discord">Using ngrok</h4>

Discord accepts the `localhost` urls. <br/>
The use of `ngrok` is not needed.

<h4 id="discord-configuration">Discord configuration</h4>

- Visit the Apps list page on the developer portal <br/> [https://discordapp.com/developers/applications/](https://discordapp.com/developers/applications/)
- Click on **New application** button
- Fill the **name** and create
- Click on **OAuth2** in the left menu
- And click on **Add redirect** button
- Fill the **Redirect** input with `http://localhost:1337/api/connect/discord/callback` URL and save
- Click on **General information** in the left menu
- You should see your Application ID and secret, save them for later

<h4 id="discord-strapi-configuration">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
- Click on the **Discord** provider
- Fill the information (replace with your own client ID and secret):
  - **Enable**: `ON`
  - **Client ID**: 665118465148846081
  - **Client Secret**: iJbr7mkyqyut-J2hGvvSDch_5Dw5U77J
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/discord/redirect`
