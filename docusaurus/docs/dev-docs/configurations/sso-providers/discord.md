---
title: Discord - Admin SSO Provider
description: Steps to configure Discord as a Strapi Admin SSO Provider
sidebar_label: Discord
displayed_sidebar: devDocsConfigSidebar
tags:
- discord
- additional configuration
- admin panel
- configuration
- Enterprise feature
- SSO 
---

import SSOServerConfig from '/docs/snippets/configuration-sso-server.md'
import SSOAdminConfig from '/docs/snippets/configuration-sso-admin.md'
import SSOMiddlewaresConfig from '/docs/snippets/configuration-sso-middlewares.md'

:::prerequisites

- [Properly configure Strapi for SSO](#required-configuration-before-setting-up-sso)
- Create your REPLACEME OAuth2 app by following the steps in the [TODO](https://TODO).
- Gather the required information to set as environment variables in your Strapi project:
  - // TODO

:::

## Required configuration before setting up SSO

### Server Configuration

<SSOServerConfig />

### Admin Configuration

<SSOAdminConfig />

### Middlewares Configuration

<SSOMiddlewaresConfig />

## Provider Specific Notes

### Scopes

The TODO OAuth2 provider requires the following scopes, however additional scopes can be added as needed depending on your use case and the data you need returned:

- TODO

### Profile Data

Data returned from the provider is dependent on how your TODO OAuth2 application is configured. The example below assumes that the TODO OAuth2 application is configured to return the user's email, first name, and last name. Fields returned by the provider can change based on the scopes requested and the user's TODO account settings.

If you aren't sure what data is being returned by the provider, you can log the `profile` object in the `createStrategy` function to see what data is available as seen in the following example.

<details>
  <summary>Configuration Example with Logging</summary>

```js
// TODO
```

</details>

### Redirect URL/URI

The redirect URL/URI will be dependent on your provider configuration however in most cases should combine your application's public URL and the provider's callback URL. The example below shows how to combine the public URL with the provider's callback URL.

```js
callbackURL:
  env('PUBLIC_URL', "https://api.example.com") +
  strapi.admin.services.passport.getStrategyCallbackURL("TODO"),
```

In this example the redirect URL/URI used by the provider will be `https://api.example.com/admin/connect/TODO`.

This is broken down as follows:

- `https://api.example.com` is the public URL of your Strapi application
- `/admin/connect` is the general path for SSO callbacks in Strapi
- `/TODO` is the specific provider UID for TODO

## Strapi Configuration

Using: // TODO

### Install the Provider Package

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```sh
// TODO
```

</TabItem>

<TabItem value="npm" label="npm">

```sh
// TODO
```

</TabItem>

</Tabs>

### Adding the Provider to Strapi

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/admin.js"

// TODO
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/admin.ts"

// TODO
```

</TabItem>

</Tabs>
