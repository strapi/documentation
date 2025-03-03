---
title: Instagram provider setup for Users & Permissions
description: Learn how to setup the Instagram provider for the Users & Permissions feature.
displayed_sidebar: cmsSidebar
tags:
- users and permissions
- providers
- configuration
- customization
---

import ConfigDone from '/docs/snippets/u-and-p-provider-config-done.md'

# Instagram provider setup for Users & Permissions

The present page explains how to setup the Instagram provider for the [Users & Permissions feature](/cms/features/users-permissions).

:::prerequisites
You have read the [Users & Permissions providers documentation](/cms/configurations/users-and-permissions-providers).
:::

## Instagram configuration

:::note
Facebook doesn't accept `localhost` urls. <br/>
Use `ngrok` to serve the backend app.
```
ngrok http 1337
```
Don't forget to update the server url in the backend config file `config/server.js` and the server url in your frontend app (environment variable `REACT_APP_BACKEND_URL` if you use <ExternalLink to="https://github.com/strapi/strapi-examples/tree/master/login-react" text="react login example app"/>) with the generated ngrok url.
:::

1. Visit the Developer Apps list page at <ExternalLink to="https://developers.facebook.com/apps/" text="https://developers.facebook.com/apps/"/>
2. Click on **Add a New App** button
3. Fill the **Display Name** in the modal and create the app
4. Setup an **Instagram** product
5. Click on the **PRODUCTS > Instagram > Basic Display** link in the left menu
6. Then click on the **Create new application** button (and valid the modal)
7. Fill the information (replace with your own ngrok url):
   - **Valid OAuth Redirect URIs**: `https://65e60559.ngrok.io/api/connect/instagram/callback`
   - **Deauthorize**: `https://65e60559.ngrok.io`
   - **Data Deletion Requests**: `https://65e60559.ngrok.io`
8. On the **App Review for Instagram Basic Display** click on **Add to submission** for **instagram_graph_user_profile**.
9. You should see your Application ID and secret, save them for later

## Strapi configuration

1. Visit the User & Permissions provider settings page at <ExternalLink to="http://localhost:1337/admin/settings/users-permissions/providers" text="http://localhost:1337/admin/settings/users-permissions/providers"/>
2. Click on the **Instagram** provider
3. Fill the information (replace with your own client ID and secret):
   - **Enable**: `ON`
   - **Client ID**: 563883201184965
   - **Client Secret**: f5ba10a7dd78c2410ab6b8a35ab28226
   - **The redirect URL to your front-end app**: `http://localhost:3000/connect/instagram/redirect`

<ConfigDone />
