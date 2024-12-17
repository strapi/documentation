---
title: GitHub provider for Users & Permissions
# description: todo
displayed_sidebar: cmsSidebar
tags:
- users and permissions
- providers
- configuration
- customization
---

# Google provider for Users & Permissions

<h4 id="google">Using ngrok</h4>

Google accepts the `localhost` urls. <br/>
The use of `ngrok` is not needed.

<h4 id="google-config">Google configuration</h4>

- Visit the Google Developer Console <br/> [https://console.developers.google.com/](https://console.developers.google.com/)
- Click on the **Select a project** dropdown in the top menu
- Then click **NEW PROJECT** button
- Fill the **Project name** input and create

Wait a few seconds while the application is created.

- On the project dropdown, select your new project
- Click on **Go to APIs overview** under the **APIs** card
- Then click on the **Credentials** link in the left menu
- Click on **OAuth consent screen** button
- Choose **External** and click on **create**
- Fill the **Application name** and save
- Then click on **Create credentials** button
- Choose **OAuth client ID** option
- Fill the information:
  - **Name**: `Strapi Auth`
  - **Authorized redirect URIs**: `http://localhost:1337/api/connect/google/callback`
- Click on **OAuth 2.0 Client IDs** name of the client you just created
- You should see your Application ID and secret, save them for later

<h4 id="google-strapi-config">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
- Click on the **Google** provider
- Fill the information (replace with your own client ID and secret):
  - **Enable**: `ON`
  - **Client ID**: 226437944084-o2mojv5i4lfnng9q8kq3jkf5v03avemk.apps.googleusercontent.com
  - **Client Secret**: aiTbMoiuJQflSBy6uQrfgsni
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/google/redirect`
