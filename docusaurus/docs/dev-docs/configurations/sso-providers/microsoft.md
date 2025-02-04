---
title: Microsoft Entra ID - Admin SSO Provider
description: Steps to configure Microsoft Entra ID as a Strapi Admin SSO Provider
displayed_sidebar: cmsSidebar
tags: 
- microsoft
- entra id
- azure active directory
- active directory
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
- Create your EntraID OAuth2 app by following the steps in the [EntraID/Azure Portal](https://learn.microsoft.com/en-us/entra/architecture/auth-oauth2).
  - It's important to review the [OAuth application types](https://learn.microsoft.com/en-us/entra/identity-platform/v2-app-types#web-apps) as Strapi only supports "web" applications.
- Gather the required information to set as environment variables in your Strapi project:
  - MICROSOFT_CLIENT_ID
  - MICROSOFT_CLIENT_SECRET
  - MICROSOFT_TENANT_ID

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

The EntraID OAuth2 provider requires the following scopes, however additional scopes can be added as needed depending on your use case and the data you need returned:

- [`user:email`](https://learn.microsoft.com/en-us/entra/identity-platform/scopes-oidc#the-email-scope)

### Profile Data

:::warning
It is extremely likely that the below example will not work directly for you as the fields returned by the EntraID instance are extremely subjective to each individual setup. For example some instances will have a `upn` field, others will not and the value type of the `upn` may be different for each instance or even between different users in the same instance.
:::

Data returned from the provider is dependent on how your EntraID OAuth2 application is configured. The example below assumes that the EntraID OAuth2 application is configured to return the user's email, first name, and last name. Fields returned by the provider can change based on the scopes requested and the user's EntraID account settings.

If you aren't sure what data is being returned by the provider, you can log the `waadProfile` object in the `createStrategy` function to see what data is available as seen in the following example.

<details>
  <summary>Configuration Example with Logging</summary>

```js
(accessToken, refreshToken, params, profile, done) => {
  let waadProfile = jwt.decode(params.id_token, "", true);

  // See what is returned by the provider
  console.log(waadProfile);

  done(null, {
    email: waadProfile.email,
    username: waadProfile.email,
    firstname: waadProfile.given_name, // optional if email and username exist
    lastname: waadProfile.family_name, // optional if email and username exist
  });
}
```

</details>

### Redirect URL/URI

The redirect URL/URI will be dependent on your provider configuration however in most cases should combine your application's public URL and the provider's callback URL. The example below shows how to combine the public URL with the provider's callback URL.

```js
callbackURL:
  env('PUBLIC_URL', "https://api.example.com") +
  strapi.admin.services.passport.getStrategyCallbackURL("azure_ad_oauth2"),
```

In this example the redirect URL/URI used by the provider will be `https://api.example.com/admin/connect/azure_ad_oauth2`.

This is broken down as follows:

- `https://api.example.com` is the public URL of your Strapi application
- `/admin/connect` is the general path for SSO callbacks in Strapi
- `/azure_ad_oauth2` is the specific provider UID for Mircosoft Entra ID / Azure Active Directory

## Strapi Configuration

Using: [passport-azure-ad-oauth2](https://github.com/auth0/passport-azure-ad-oauth2#readme)

### Install the Provider Package

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```sh
yarn add passport-azure-ad-oauth2 jsonwebtoken
```

</TabItem>

<TabItem value="npm" label="npm">

```sh
npm install --save passport-azure-ad-oauth2 jsonwebtoken
```

</TabItem>

</Tabs>

### Adding the Provider to Strapi

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/admin.js"

const AzureAdOAuth2Strategy = require("passport-azure-ad-oauth2");
const jwt = require("jsonwebtoken");

module.exports = ({ env }) => ({
  auth: {
    // ...
    providers: [
      {
        uid: "azure_ad_oauth2",
        displayName: "Microsoft",
        icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/320px-Microsoft_logo_%282012%29.svg.png",
        createStrategy: (strapi) =>
          new AzureAdOAuth2Strategy(
            {
              clientID: env("MICROSOFT_CLIENT_ID", ""),
              clientSecret: env("MICROSOFT_CLIENT_SECRET", ""),
              scope: ["user:email"],
              tenant: env("MICROSOFT_TENANT_ID", ""),
              callbackURL:
                env('PUBLIC_URL') +
                strapi.admin.services.passport.getStrategyCallbackURL(
                  "azure_ad_oauth2"
                ),
            },
            (accessToken, refreshToken, params, profile, done) => {
              let waadProfile = jwt.decode(params.id_token, "", true);
              done(null, {
                email: waadProfile.email,
                username: waadProfile.email,
                firstname: waadProfile.given_name, // optional if email and username exist
                lastname: waadProfile.family_name, // optional if email and username exist
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

import { Strategy as AzureAdOAuth2Strategy} from "passport-azure-ad-oauth2";
import jwt from "jsonwebtoken";

export default ({ env }) => ({
  auth: {
    // ...
    providers: [
      {
        uid: "azure_ad_oauth2",
        displayName: "Microsoft",
        icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/320px-Microsoft_logo_%282012%29.svg.png",
        createStrategy: (strapi) =>
          new AzureAdOAuth2Strategy(
            {
              clientID: env("MICROSOFT_CLIENT_ID", ""),
              clientSecret: env("MICROSOFT_CLIENT_SECRET", ""),
              scope: ["user:email"],
              tenant: env("MICROSOFT_TENANT_ID", ""),
              callbackURL:
                env('PUBLIC_URL') +
                strapi.admin.services.passport.getStrategyCallbackURL(
                  "azure_ad_oauth2"
                ),
            },
            (accessToken, refreshToken, params, profile, done) => {
              let waadProfile = jwt.decode(params.id_token, "", true);
              done(null, {
                email: waadProfile.email,
                username: waadProfile.email,
                firstname: waadProfile.given_name, // optional if email and username exist
                lastname: waadProfile.family_name, // optional if email and username exist
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
