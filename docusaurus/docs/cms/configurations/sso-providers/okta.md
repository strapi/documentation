---
title: Okta SSO provider
description: Learn how to configure the SSO provider to sign in and sign up into your Strapi application through Okta.
displayed_sidebar: cmsSidebar
tags: 
- SSO
- providers
- configuration
---

# Okta provider SSO configuration

The present page explains how to setup the Okta provider for the [Single Sign-On (SSO) feature](/cms/features/sso).

:::prerequisites
You have read the [How to configure SSO guide](/cms/configurations/guides/configure-sso).
:::

## Installation

Install [passport-okta-oauth20](https://github.com/antoinejaussoin/passport-okta-oauth20/#readme):

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

## Configuration example

The Okta SSO provider is configured in the `auth.providers` array of [the `config/admin` file](/cms/configurations/admin-panel):

:::caution
When setting the `OKTA_DOMAIN` environment variable, make sure to include the protocol (e.g., `https://example.okta.com`). If you do not, you will end up in a redirect loop.
:::

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/admin.js"

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

```ts title="/config/admin.ts"

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
