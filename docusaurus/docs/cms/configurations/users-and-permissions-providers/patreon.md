---
title: Patreon provider setup for Users & Permissions
description: Learn how to setup the Patreon provider for the Users & Permissions feature.
displayed_sidebar: cmsSidebar
tags:
- users and permissions
- providers
- configuration
- customization
---

import ConfigDone from '/docs/snippets/u-and-p-provider-config-done.md'

# Patreon provider setup for Users & Permissions

The present page explains how to setup the Patreon provider for the [Users & Permissions feature](/cms/features/users-permissions).

:::prerequisites
You have read the [Users & Permissions providers documentation](/cms/configurations/users-and-permissions-providers).
:::

## Patreon configuration

:::note
Patreon does not accept `localhost` urls. <br/>
Use `ngrok` to serve the backend app.
```bash
ngrok http 1337
```
Don't forget to update the server url in the Strapi config file `./config/server.js` and the server URL in your frontend app (environment variable `REACT_APP_BACKEND_URL` if you use [react login example app](https://github.com/strapi/strapi-examples/tree/master/examples/login-react)) with the generated ngrok URL.
:::

1. You must be a Patreon Creator in order to register an Oauth client.
2. Go to the [Patreon developer portal](https://www.patreon.com/portal)
3. Click on [Clients & API Keys](https://www.patreon.com/portal/registration/register-clients)
4. Click on "Create Client"
5. Enter the details of your organization and website.
6. There is a drop-down for "App Category" but no explanation of what the different categories mean.
"Community" seems to work fine.
7. You can choose either version 1 or version 2 of the API - neither are actively developed.
Version 2 is probably the best choice. See their
[developer docs](https://docs.patreon.com/#introduction) for more detail.
8. Under "Redirect URI's" enter `https://your-site.com/api/connect/patreon/callback`
9. Save the client details and you will then see the Client ID and Client Secret.

## Strapi configuration

1. Visit the User & Permissions provider settings page at [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
2. Click on the **Patreon** provider
3. Fill the information:
   - Enable: `ON`
   - Client ID: `<Your Patreon Client ID>` - as above
   - Client Secret: `<Your Patreon Client Secret>` - as above

<ConfigDone />
