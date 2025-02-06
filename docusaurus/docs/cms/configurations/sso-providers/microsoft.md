---
title: Microsoft SSO provider
description: Learn how to configure the SSO provider to sign in and sign up into your Strapi application through Microsoft.
displayed_sidebar: cmsSidebar
tags: 
- SSO
- providers
- configuration
---

# Microsoft provider SSO configuration

The present page explains how to setup the Microsoft provider for the [Single Sign-On (SSO) feature](/cms/features/sso).

:::prerequisites
You have read the [How to configure SSO guide](/cms/configurations/guides/configure-sso).
:::

## Installation

Install [passport-azure-ad-oauth2](https://github.com/auth0/passport-azure-ad-oauth2#readme):

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

## Configuration example

The Microsoft SSO provider is configured in the `auth.providers` array of [the `config/admin` file](/cms/configurations/admin-panel):

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/admin.js"

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

```ts title="/config/admin.ts"

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
