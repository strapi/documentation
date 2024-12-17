---
title: Reddit provider for Users & Permissions
# description: todo
displayed_sidebar: cmsSidebar
tags:
- users and permissions
- providers
- configuration
- customization
---

# Reddit provider for Users & Permissions

<h4 id="reddit">Using ngrok</h4>

Reddit accepts the `localhost` urls. <br/>
The use of `ngrok` is not needed.

<h4 id="reddit-config">Reddit configuration</h4>

- Visit the Reddit authorized applications preferences page <br/> [https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
- Click on the **create another app...** button near the bottom
- Select **web app** for the type
- Fill the **name** and **redirect uri** input in
- Click the **create app** button
- Note that the **Client ID** is located under the app type (web app)

<h4 id="reddit-strapi-config">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
- Click on the **Reddit** provider
- Fill the information (replace with your own client ID and secret):
  - **Enable**: `ON`
  - **Client ID**: hmxSBOit0SCjSQ
  - **Client Secret**: gwR9hCjK_PMYVYNGeDLS4WLB8g7xqg
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/reddit/redirect`
