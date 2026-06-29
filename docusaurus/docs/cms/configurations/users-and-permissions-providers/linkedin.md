---
title: LinkedIn provider setup for Users & Permissions
description: Learn how to setup the LinkedIn provider for the Users & Permissions feature.
displayed_sidebar: cmsSidebar
tags:
- users & permissions
- providers
- configuration
- customization
---

import ConfigDone from '/docs/snippets/u-and-p-provider-config-done.md'

# LinkedIn provider setup for Users & Permissions

<Tldr>

Configure LinkedIn as a provider for Strapi's Users & Permissions feature by creating a LinkedIn app, registering the redirect URL, and entering your credentials in the Strapi admin panel.

</Tldr>


The present page explains how to setup the LinkedIn provider for the [Users & Permissions feature](/cms/features/users-permissions).

:::prerequisites
You have read the [Users & Permissions providers documentation](/cms/configurations/users-and-permissions-providers).
:::

:::caution Deprecated scopes
LinkedIn has migrated to "Sign In with LinkedIn using OpenID Connect," deprecating the `r_liteprofile` and `r_emailaddress` scopes. Strapi's built-in LinkedIn provider still uses these deprecated scopes and the legacy Profile API. The provider **may stop working** when LinkedIn fully removes legacy support. The setup steps below reflect the current Strapi implementation but the LinkedIn developer portal steps (product selection, scopes) should follow LinkedIn's [OpenID Connect documentation](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2).
:::

## LinkedIn configuration

:::note
LinkedIn accepts the `localhost` urls. <br/>
The use of `ngrok` is not needed.
:::

1. Visit the Apps list page at <ExternalLink to="https://www.linkedin.com/developers/apps" text="https://www.linkedin.com/developers/apps"/>
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
8. Select `Sign In with LinkedIn using OpenID Connect` from the product list to enable it.

## Strapi configuration

1. Visit the User & Permissions provider settings page at <ExternalLink to="http://localhost:1337/admin/settings/users-permissions/providers" text="http://localhost:1337/admin/settings/users-permissions/providers"/>
2. Click on the **LinkedIn** provider
3. Fill the information:
   - **Enable**: `ON`
   - **Client ID**: 84witsxk641rlv
   - **Client Secret**: HdXO7a7mkrU5a6WN
   - **The redirect URL to your front-end app**: `http://localhost:3000/connect/linkedin/redirect`

<ConfigDone />
