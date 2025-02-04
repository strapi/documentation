---
title: Okta - Admin SSO Provider
description: Steps to configure Okta as a Strapi Admin SSO Provider
displayed_sidebar: cmsSidebar
tags: 
- okta
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
- Create your Okta OAuth2 app by following the steps in the [Okta portal](https://developer.okta.com/docs/guides/implement-oauth-for-okta/main/).
- Gather the required information to set as environment variables in your Strapi project:
  - OKTA_CLIENT_ID
  - OKTA_CLIENT_SECRET
  - OKTA_DOMAIN

:::

:::warning
When setting the `OKTA_DOMAIN` environment variable, make sure to include the protocol (e.g. `https://example.okta.com`). If you do not, you will end up in a redirect loop.
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

The Okta OAuth2 provider requires the following scopes, however additional scopes can be added as needed depending on your use case and the data you need returned:

- [`openid`](https://developer.okta.com/docs/api/oauth2/)
- [`profile`](https://developer.okta.com/docs/api/oauth2/)
- [`email`](https://developer.okta.com/docs/api/oauth2/)

### Profile Data

Data returned from the provider is dependent on how your Okta OAuth2 application is configured. The example below assumes that the Okta OAuth2 application is configured to return the user's email, first name, and last name. Fields returned by the provider can change based on the scopes requested and the user's Okta account settings.

If you aren't sure what data is being returned by the provider, you can log the `profile` object in the `createStrategy` function to see what data is available as seen in the following example.

<details>
  <summary>Configuration Example with Logging</summary>

```js
(accessToken, refreshToken, profile, done) => {
  // See what is returned by the provider
  console.log(profile);

  done(null, {
    email: profile.email,
    username: profile.username,
  });
}
```

</details>

### Redirect URL/URI

The redirect URL/URI will be dependent on your provider configuration however in most cases should combine your application's public URL and the provider's callback URL. The example below shows how to combine the public URL with the provider's callback URL.

```js
callbackURL:
  env('PUBLIC_URL', "https://api.example.com") +
  strapi.admin.services.passport.getStrategyCallbackURL("okta"),
```

In this example the redirect URL/URI used by the provider will be `https://api.example.com/admin/connect/okta`.

This is broken down as follows:

- `https://api.example.com` is the public URL of your Strapi application
- `/admin/connect` is the general path for SSO callbacks in Strapi
- `/okta` is the specific provider UID for Okta

## Strapi Configuration

Using: [passport-okta-oauth20](https://github.com/antoinejaussoin/passport-okta-oauth20/#readme)

### Install the Provider Package

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```sh
yarn add passport-okta-oauth20
```

</TabItem>

<TabItem value="npm" label="npm">

```sh
npm install --save passport-okta-oauth20
```

</TabItem>

</Tabs>

### Adding the Provider to Strapi

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/admin.js"
const OktaOAuth2Strategy = require("passport-okta-oauth20").Strategy;

module.exports = ({ env }) => ({
  auth: {
    // ...
    providers: [
      {
        uid: "okta",
        displayName: "Okta",
        icon: "https://www.okta.com/sites/default/files/Okta_Logo_BrightBlue_Medium-thumbnail.png",
        createStrategy: (strapi) =>
          new OktaOAuth2Strategy(
            {
              clientID: env("OKTA_CLIENT_ID"),
              clientSecret: env("OKTA_CLIENT_SECRET"),
              audience: env("OKTA_DOMAIN"),
              scope: ["openid", "email", "profile"],
              callbackURL:
                env('PUBLIC_URL') +
                strapi.admin.services.passport.getStrategyCallbackURL("okta"),
            },
            (accessToken, refreshToken, profile, done) => {
              done(null, {
                email: profile.email,
                username: profile.username,
              });
            }
          ),
      },
    ],
  },
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/admin.ts"
import { Strategy as OktaOAuth2Strategy } from "passport-okta-oauth20";

export default ({ env }) => ({
  auth: {
    // ...
    providers: [
      {
        uid: "okta",
        displayName: "Okta",
        icon: "https://www.okta.com/sites/default/files/Okta_Logo_BrightBlue_Medium-thumbnail.png",
        createStrategy: (strapi) =>
          new OktaOAuth2Strategy(
            {
              clientID: env("OKTA_CLIENT_ID"),
              clientSecret: env("OKTA_CLIENT_SECRET"),
              audience: env("OKTA_DOMAIN"),
              scope: ["openid", "email", "profile"],
              callbackURL:
                env('PUBLIC_URL') +
                strapi.admin.services.passport.getStrategyCallbackURL("okta"),
            },
            (accessToken, refreshToken, profile, done) => {
              done(null, {
                email: profile.email,
                username: profile.username,
              });
            }
          ),
      },
    ],
  },
});
```

</TabItem>

</Tabs>
