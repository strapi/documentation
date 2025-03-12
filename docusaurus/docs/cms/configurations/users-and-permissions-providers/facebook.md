---
title: Facebook provider setup for Users & Permissions
description: Learn how to setup the Facebook provider for the Users & Permissions feature.
displayed_sidebar: cmsSidebar
tags:
- users and permissions
- providers
- configuration
- customization
---

import ConfigDone from '/docs/snippets/u-and-p-provider-config-done.md'

# Facebook provider setup for Users & Permissions

The present page explains how to setup the Facebook provider for the [Users & Permissions feature](/cms/features/users-permissions).

:::prerequisites
You have read the [Users & Permissions providers documentation](/cms/configurations/users-and-permissions-providers).
:::

## Facebook configuration

Facebook doesn't accept `localhost` urls. <br/>
Use <ExternalLink to="https://ngrok.com/docs" text="ngrok"/> to serve the backend app (`ngrok http 1337`) that will make a proxy tunnel from a url it created to your localhost url (e.g., `url: env('', 'https://5299e8514242.ngrok.io'),`).

```
ngrok http 1337
```

Don't forget to update the server url in the backend config file `config/server.js` and the server url in your frontend app (environment variable `REACT_APP_BACKEND_URL` if you use <ExternalLink to="https://github.com/strapi/strapi-examples/tree/master/examples/login-react" text="react login example app"/>) with the generated ngrok url.

1. Visit the Developer Apps list page at <ExternalLink to="https://developers.facebook.com/apps/" text="https://developers.facebook.com/apps/"/>
2. Click on **Add a New App** button
3. Fill the **Display Name** in the modal and create the app
4. Setup a **Facebook Login** product
5. Click on the **PRODUCTS > Facebook login > Settings** link in the left menu
6. Fill the information and save (replace with your own ngrok url):
   - **Valid OAuth Redirect URIs**: `https://65e60559.ngrok.io/api/connect/facebook/callback`
7. Then, click on **Settings** in the left menu
8. Then on **Basic** link
9. You should see your Application ID and secret, save them for later

## Strapi configuration

1. Visit the User & Permissions provider settings page at <ExternalLink to="http://localhost:1337/admin/settings/users-permissions/providers" text="http://localhost:1337/admin/settings/users-permissions/providers"/>
2. Click on the **Facebook** provider
3. Fill the information (replace with your own client ID and secret):
   - **Enable**: `ON`
   - **Client ID**: 2408954435875229
   - **Client Secret**: 4fe04b740b69f31ea410b9391ff3b5b0
   - **The redirect URL to your front-end app**: `http://localhost:3000/connect/facebook/redirect`

<ConfigDone />
