---
title: VK provider for Users & Permissions
# description: todo
displayed_sidebar: cmsSidebar
tags:
- users and permissions
- providers
- configuration
- customization
---

# VK provider for Users & Permissions

<h4 id="vk">Using ngrok</h4>

VK accepts the `localhost` urls. <br/>
The use of `ngrok` is not needed.

<h4 id="vk-config">VK configuration</h4>

- Visit the Apps list page <br/> [https://vk.com/apps?act=manage](https://vk.com/apps?act=manage)
- Click on **Create app** button
- Fill the information:
  - **Title**: Strapi auth
  - **Platform**: Choose **Website** option
  - **Website address**: `http://localhost:1337`
  - **Base domain**: `localhost`
- Click on the **Settings** link in the left menu
- Click on the **Open API** link to enable this option
- Fill the information:
  - **Authorized redirect URL**: `http://localhost:1337/api/connect/vk/callback`

<h4 id="vk-strapi-config">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
- Click on the **VK** provider
- Fill the information:
  - **Enable**: `ON`
  - **Client ID**: 7276416
  - **Client Secret**: cFBUSghLXGuxqnCyw1N3
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/vk/redirect`
