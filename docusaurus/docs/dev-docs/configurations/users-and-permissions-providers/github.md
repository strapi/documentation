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

# GitHub provider for Users & Permissions

<h4 id="github">Using ngrok</h4>

Github doesn't accept `localhost` urls. <br/>
Use `ngrok` to serve the backend app.

```
ngrok http 1337
```

Don't forget to update the server url in the backend config file `config/server.js` and the server url in your frontend app (environment variable `REACT_APP_BACKEND_URL` if you use [react login example app](https://github.com/strapi/strapi-examples/tree/master/examples/login-react)) with the generated ngrok url.

<h4 id="github-config">Github configuration</h4>

- Visit the OAuth Apps list page [https://github.com/settings/developers](https://github.com/settings/developers)
- Click on **New OAuth App** button
- Fill the information (replace with your own ngrok url):
  - **Application name**: Strapi GitHub auth
  - **Homepage URL**: `https://65e60559.ngrok.io`
  - **Application description**: Strapi provider auth description
  - **Authorization callback URL**: `https://65e60559.ngrok.io/api/connect/github/callback`

<h4 id="github-strapi-config">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
- Click on the **GitHub** provider
- Fill the information (replace with your own client ID and secret):
  - **Enable**: `ON`
  - **Client ID**: 53de5258f8472c140917
  - **Client Secret**: fb9d0fe1d345d9ac7f83d7a1e646b37c554dae8b
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/github/redirect`
