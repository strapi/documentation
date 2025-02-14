---
title: LinkedIn provider setup for Users & Permissions
# description: todo
displayed_sidebar: cmsSidebar
tags:
- users and permissions
- providers
- configuration
- customization
---

import ConfigDone from '/docs/snippets/u-and-p-provider-config-done.md'

# LinkedIn provider setup for Users & Permissions

The present page explains how to setup the LinkedIn provider for the [Users & Permissions feature](/cms/features/users-permissions).

:::prerequisites
You have read the [Users & Permissions providers documentation](/cms/configurations/users-and-permissions-providers).
:::

## LinkedIn configuration

:::note
LinkedIn accepts the `localhost` urls. <br/>
The use of `ngrok` is not needed.
:::

1. Visit the Apps list page at [https://www.linkedin.com/developers/apps](https://www.linkedin.com/developers/apps)
2. Click on **Create app** button
3. Fill the information:
   - **App name**: Strapi auth
   - **LinkedIn Page**: Enter a LinkedIn page name to associate with the app or click **Create a new LinkedIn Page** to create a new one
   - **App Logo**: Upload a square image that is at least 100x100 pixels.
4. Click on the **Create app** to create the app
5. On the app page click on **Auth** tab
6. Fill the information:
   - **Authorized redirect URL**: `http://localhost:1337/api/connect/linkedin/callback`
7. On the app page click on **Products** tab.
8. Select `Sign In with LinkedIn` from the product list to enable it.

## Strapi configuration

1. Visit the User & Permissions provider settings page at [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
2. Click on the **LinkedIn** provider
3. Fill the information:
   - **Enable**: `ON`
   - **Client ID**: 84witsxk641rlv
   - **Client Secret**: HdXO7a7mkrU5a6WN
   - **The redirect URL to your front-end app**: `http://localhost:3000/connect/linkedin/redirect`

<ConfigDone />
