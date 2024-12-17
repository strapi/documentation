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

# Facebook provider for Users & Permissions

<h4 id="facebook">Using ngrok</h4>

Facebook doesn't accept `localhost` urls. <br/>
Use `ngrok` to serve the backend app.

```
ngrok http 1337
```

Don't forget to update the server url in the backend config file `config/server.js` and the server url in your frontend app (environment variable `REACT_APP_BACKEND_URL` if you use [react login example app](https://github.com/strapi/strapi-examples/tree/master/examples/login-react)) with the generated ngrok url.

<h4 id="facebook-config">Facebook configuration</h4>

- Visit the Developer Apps list page <br/> [https://developers.facebook.com/apps/](https://developers.facebook.com/apps/)
- Click on **Add a New App** button
- Fill the **Display Name** in the modal and create the app
- Setup a **Facebook Login** product
- Click on the **PRODUCTS > Facebook login > Settings** link in the left menu
- Fill the information and save (replace with your own ngrok url):
  - **Valid OAuth Redirect URIs**: `https://65e60559.ngrok.io/api/connect/facebook/callback`
- Then, click on **Settings** in the left menu
- Then on **Basic** link
- You should see your Application ID and secret, save them for later

<h4 id="facebook-strapi-config">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
- Click on the **Facebook** provider
- Fill the information (replace with your own client ID and secret):
  - **Enable**: `ON`
  - **Client ID**: 2408954435875229
  - **Client Secret**: 4fe04b740b69f31ea410b9391ff3b5b0
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/facebook/redirect`
