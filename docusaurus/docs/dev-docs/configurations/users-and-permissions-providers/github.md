---
title: GitHub provider setup for Users & Permissions
# description: todo
displayed_sidebar: cmsSidebar
tags:
- users and permissions
- providers
- configuration
- customization
---

import ConfigDone from '/docs/snippets/u-and-p-provider-config-done.md'

# GitHub provider setup for Users & Permissions

The present page explains how to setup the GitHub provider for the [Users & Permissions feature](/user-docs/features/users-permissions).

:::prerequisites
You have the [Users & Permissions providers documentation](/dev-docs/configurations/users-and-permissions-providers).
:::

## GitHub configuration

:::note
Github doesn't accept `localhost` urls. <br/>
Use `ngrok` to serve the backend app.
```
ngrok http 1337
```
Don't forget to update the server url in the backend config file `config/server.js` and the server url in your frontend app (environment variable `REACT_APP_BACKEND_URL` if you use [react login example app](https://github.com/strapi/strapi-examples/tree/master/examples/login-react)) with the generated ngrok url.
:::

1. Visit the OAuth Apps list page [https://github.com/settings/developers](https://github.com/settings/developers)
2. Click on **New OAuth App** button
3. Fill the information (replace with your own ngrok url):
   - **Application name**: Strapi GitHub auth
   - **Homepage URL**: `https://65e60559.ngrok.io`
   - **Application description**: Strapi provider auth description
   - **Authorization callback URL**: `https://65e60559.ngrok.io/api/connect/github/callback`

## Strapi configuration

1. Visit the User & Permissions provider settings page at [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
2. Click on the **GitHub** provider
3. Fill the information (replace with your own client ID and secret):
   - **Enable**: `ON`
   - **Client ID**: 53de5258f8472c140917
   - **Client Secret**: fb9d0fe1d345d9ac7f83d7a1e646b37c554dae8b
   - **The redirect URL to your front-end app**: `http://localhost:3000/connect/github/redirect`

<ConfigDone />
