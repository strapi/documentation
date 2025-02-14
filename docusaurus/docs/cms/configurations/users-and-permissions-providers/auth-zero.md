---
title: Auth0 provider setup for Users & Permissions
# description: todo
displayed_sidebar: cmsSidebar
tags:
- users and permissions
- providers
- configuration
- customization
---

import ConfigDone from '/docs/snippets/u-and-p-provider-config-done.md'

# Auth0 provider setup for Users & Permissions

The present page explains how to setup the Auth0 provider for the [Users & Permissions feature](/cms/features/users-permissions).

:::prerequisites
You have read the [Users & Permissions providers documentation](/cms/configurations/users-and-permissions-providers).
:::

## Auth0 configuration

:::note
AWS Cognito accepts the `localhost` urls. <br/>
The use of `ngrok` is not needed.
:::

1. Visit your Auth0 tenant dashboard
2. In API section, create a new API
3. In application, create a `machine-to-machine` application and select the API that you have just created
4. In settings of this app set these values:
   - **Allowed Callback URLs**: `http://localhost:1337/api/connect/auth0/callback`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`
5. At the bottom of settings, show "Advanced Settings" and go to the "Grant Types". Ensure that these grants are checked/enabled:
   - Implicit
   - Authorization Code
   - Refresh Token
   - Client Credentials

## Strapi configuration

1. Visit the User & Permissions provider settings page at [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
2. Click on the **Auth0** provider
3. Fill the information:
   - Enable: `ON`
   - Client ID: `<Your Auth0 Client ID>`
   - Client Secret: `<Your Auth0 Client Secret>`
   - Subdomain: `<Your Auth0 tenant url>`, example it is the part in bold in the following url: https://**my-tenant.eu**.auth0.com/
   - The redirect URL to your front-end app: `http://localhost:3000/connect/auth0`

<ConfigDone />
