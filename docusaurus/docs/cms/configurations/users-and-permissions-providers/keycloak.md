---
title: Keycloak provider setup for Users & Permissions
# description: todo
displayed_sidebar: cmsSidebar
tags:
- users and permissions
- providers
- configuration
- customization
---

import ConfigDone from '/docs/snippets/u-and-p-provider-config-done.md'

# Keycloak provider setup for Users & Permissions

The present page explains how to setup the Keycloak provider for the [Users & Permissions feature](/cms/features/users-permissions).

:::prerequisites
You have read the [Users & Permissions providers documentation](/cms/configurations/users-and-permissions-providers).
:::

## Keycloak configuration

:::note
Keycloak accepts the `localhost` urls. <br/>
The use of `ngrok` is not needed.
:::

1. Visit your Keycloak admin dashboard
2. If you don't already have a realm, you'll want to create one
3. In the Clients section of your realm, create a new client
4. Under the capability config, ensure you set `Client Authentication` to on to ensure you can create a private key
5. Under the access settings, ensure you set the following values:
   - **Valid redirect URIs**: `http://localhost:1337/api/connect/keycloak/callback` and `http://localhost:1337/api/connect/keycloak`
   - **Allowed Web Origins**: `http://localhost:3000` and `http://localhost:1337`
6. In the Client Scopes section, ensure you have the `email` and `profile` scopes set to default
7. In the Client Scopes section, ensure you have the `openid` scope set to default, if you don't have this you will need to manually create it in the global Client Scopes

## Strapi configuration

1. Visit the User & Permissions provider settings page at [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
2. Click on the **Keycloak** provider
3. Fill the information:
   - Enable: `ON`
   - Client ID: `<Your Keycloak Client ID>`
   - Client Secret: `<Your Keycloak Client Secret>`
   - Subdomain: `<Your Keycloak realm url>`, example is either `keycloak.example.com/realms/strapitest` or `keycloak.example.com/auth/realms/strapitest` **without the protocol before it**
   - The redirect URL to your front-end app: `http://localhost:3000/connect/keycloak/redirect`
   - (Optional) Set the JWKS URL if you have a custom JWKS URL, example is like `https://keycloak.example.com/auth/realms/strapitest/protocol/openid-connect/certs`

<ConfigDone />
