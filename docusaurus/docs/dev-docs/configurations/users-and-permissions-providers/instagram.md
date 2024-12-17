---
title: Instagram provider for Users & Permissions
# description: todo
displayed_sidebar: cmsSidebar
tags:
- users and permissions
- providers
- configuration
- customization
---

# Instagram provider for Users & Permissions

<h4 id="instagram">Using ngrok</h4>

Facebook doesn't accept `localhost` urls. <br/>
Use `ngrok` to serve the backend app.

```
ngrok http 1337
```

Don't forget to update the server url in the backend config file `config/server.js` and the server url in your frontend app (environment variable `REACT_APP_BACKEND_URL` if you use [react login example app](https://github.com/strapi/strapi-examples/tree/master/login-react)) with the generated ngrok url.

<h4 id="instagram-config">Instagram configuration</h4>

- Visit the Developer Apps list page <br/> [https://developers.facebook.com/apps/](https://developers.facebook.com/apps/)
- Click on **Add a New App** button
- Fill the **Display Name** in the modal and create the app
- Setup an **Instagram** product
- Click on the **PRODUCTS > Instagram > Basic Display** link in the left menu
- Then click on the **Create new application** button (and valid the modal)
- Fill the information (replace with your own ngrok url):
  - **Valid OAuth Redirect URIs**: `https://65e60559.ngrok.io/api/connect/instagram/callback`
  - **Deauthorize**: `https://65e60559.ngrok.io`
  - **Data Deletion Requests**: `https://65e60559.ngrok.io`
- On the **App Review for Instagram Basic Display** click on **Add to submission** for **instagram_graph_user_profile**.
- You should see your Application ID and secret, save them for later

<h4 id="instagram-strapi-config">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
- Click on the **Instagram** provider
- Fill the information (replace with your own client ID and secret):
  - **Enable**: `ON`
  - **Client ID**: 563883201184965
  - **Client Secret**: f5ba10a7dd78c2410ab6b8a35ab28226
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/instagram/redirect`
