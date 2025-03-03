---
title: VK provider setup for Users & Permissions
description: Learn how to setup the VK provider for the Users & Permissions feature.
displayed_sidebar: cmsSidebar
tags:
- users and permissions
- providers
- configuration
- customization
---

import ConfigDone from '/docs/snippets/u-and-p-provider-config-done.md'

# VK provider setup for Users & Permissions

The present page explains how to setup the VK provider for the [Users & Permissions feature](/cms/features/users-permissions).

:::prerequisites
You have read the [Users & Permissions providers documentation](/cms/configurations/users-and-permissions-providers).
:::

## VK configuration 

:::note
VK accepts the `localhost` urls. <br/>
The use of `ngrok` is not needed.
:::

1. Visit the Apps list page at <ExternalLink to="https://vk.com/apps?act=manage" text="https://vk.com/apps?act=manage"/>
2. Click on **Create app** button
3. Fill the information:
   - **Title**: Strapi auth
   - **Platform**: Choose **Website** option
   - **Website address**: `http://localhost:1337`
   - **Base domain**: `localhost`
4. Click on the **Settings** link in the left menu
5. Click on the **Open API** link to enable this option
6. Fill the information:
   - **Authorized redirect URL**: `http://localhost:1337/api/connect/vk/callback`

## Strapi configuration

1. Visit the User & Permissions provider settings page at <ExternalLink to="http://localhost:1337/admin/settings/users-permissions/providers" text="http://localhost:1337/admin/settings/users-permissions/providers"/>
2. Click on the **VK** provider
3. Fill the information:
   - **Enable**: `ON`
   - **Client ID**: 7276416
   - **Client Secret**: cFBUSghLXGuxqnCyw1N3
   - **The redirect URL to your front-end app**: `http://localhost:3000/connect/vk/redirect`

<ConfigDone />
