---
title: Discord provider setup for Users & Permissions
description: Learn how to setup the Discord provider for the Users & Permissions feature.
displayed_sidebar: cmsSidebar
tags:
- users and permissions
- providers
- configuration
- customization
---

import ConfigDone from '/docs/snippets/u-and-p-provider-config-done.md'

# Discord provider setup for Users & Permissions

The present page explains how to setup the Discord provider for the [Users & Permissions feature](/cms/features/users-permissions).

:::prerequisites
You have read the [Users & Permissions providers documentation](/cms/configurations/users-and-permissions-providers).
:::

## Discord configuration

:::note
Discord accepts the `localhost` urls. <br/>
The use of `ngrok` is not needed.
:::

1. Visit the Apps list page on the developer portal at <ExternalLink to="https://discordapp.com/developers/applications/" text="https://discordapp.com/developers/applications/"/>
2. Click on **New application** button
3. Fill the **name** and create
4. Click on **OAuth2** in the left menu
5. And click on **Add redirect** button
6. Fill the **Redirect** input with `http://localhost:1337/api/connect/discord/callback` URL and save
7. Click on **General information** in the left menu
8. You should see your Application ID and secret, save them for later

## Strapi configuration

1. Visit the User & Permissions provider settings page at <ExternalLink to="http://localhost:1337/admin/settings/users-permissions/providers" text="http://localhost:1337/admin/settings/users-permissions/providers"/>
2. Click on the **Discord** provider
3. Fill the information (replace with your own client ID and secret):
   - **Enable**: `ON`
   - **Client ID**: 665118465148846081
   - **Client Secret**: iJbr7mkyqyut-J2hGvvSDch_5Dw5U77J
   - **The redirect URL to your front-end app**: `http://localhost:3000/connect/discord/redirect`

<ConfigDone />
