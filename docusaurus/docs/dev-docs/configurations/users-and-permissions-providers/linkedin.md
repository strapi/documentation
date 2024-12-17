---
title: LinkedIn provider for Users & Permissions
# description: todo
displayed_sidebar: cmsSidebar
tags:
- users and permissions
- providers
- configuration
- customization
---

# LinkedIn provider for Users & Permissions

<h4 id="linkedin">Using ngrok</h4>

LinkedIn accepts the `localhost` urls. <br/>
The use of `ngrok` is not needed.

<h4 id="linkedin-config">LinkedIn configuration</h4>

- Visit the Apps list page <br/> [https://www.linkedin.com/developers/apps](https://www.linkedin.com/developers/apps)
- Click on **Create app** button
- Fill the information:
  - **App name**: Strapi auth
  - **LinkedIn Page**: Enter a LinkedIn page name to associate with the app or click **Create a new LinkedIn Page** to create a new one
  - **App Logo**: Upload a square image that is at least 100x100 pixels.
- Click on the **Create app** to create the app
- On the app page click on **Auth** tab
- Fill the information:
  - **Authorized redirect URL**: `http://localhost:1337/api/connect/linkedin/callback`
- On the app page click on **Products** tab.
- Select `Sign In with LinkedIn` from the product list to enable it.

<h4 id="linkedin-strapi-config">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
- Click on the **LinkedIn** provider
- Fill the information:
  - **Enable**: `ON`
  - **Client ID**: 84witsxk641rlv
  - **Client Secret**: HdXO7a7mkrU5a6WN
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/linkedin/redirect`
