---
title: Google SSO provider
description: Learn how to configure the SSO provider to sign in and sign up into your Strapi application through Google.
displayed_sidebar: cmsSidebar
tags: 
- SSO
- providers
- configuration
---

# Google provider SSO configuration

The present page explains how to setup the Google provider for the [Single Sign-On (SSO) feature](/user-docs/features/sso).

:::prerequisites
You have read the [How to configure SSO guide](/dev-docs/configurations/guides/configure-sso).
:::

## Installation

Install [passport-google-oauth2](https://github.com/mstade/passport-google-oauth2):

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```sh
yarn add passport-google-oauth2
```

</TabItem>

<TabItem value="npm" label="npm">

```sh
npm install --save passport-google-oauth2
```

</TabItem>

</Tabs>

## Configuration example

The Google SSO provider is configured in the `auth.providers` array of [the `config/admin` file](/dev-docs/configurations/admin-panel):

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/admin.js"

const GoogleStrategy = require("passport-google-oauth2");

module.exports = ({ env }) => ({
  auth: {
    // ...
    providers: [
      {
        uid: "google",
        displayName: "Google",
        icon: "https://cdn2.iconfinder.com/data/icons/social-icons-33/128/Google-512.png",
        createStrategy: (strapi) =>
          new GoogleStrategy(
            {
              clientID: env("GOOGLE_CLIENT_ID"),
              clientSecret: env("GOOGLE_CLIENT_SECRET"),
              scope: [
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/userinfo.profile",
              ],
              callbackURL:
                strapi.admin.services.passport.getStrategyCallbackURL("google"),
            },
            (request, accessToken, refreshToken, profile, done) => {
              done(null, {
                email: profile.email,
                firstname: profile.given_name,
                lastname: profile.family_name,
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

import {Strategy as GoogleStrategy } from "passport-google-oauth2";

export default ({ env }) => ({
  auth: {
    // ...
    providers: [
      {
        uid: "google",
        displayName: "Google",
        icon: "https://cdn2.iconfinder.com/data/icons/social-icons-33/128/Google-512.png",
        createStrategy: (strapi) =>
          new GoogleStrategy(
            {
              clientID: env("GOOGLE_CLIENT_ID"),
              clientSecret: env("GOOGLE_CLIENT_SECRET"),
              scope: [
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/userinfo.profile",
              ],
              callbackURL:
                strapi.admin.services.passport.getStrategyCallbackURL("google"),
            },
            (request, accessToken, refreshToken, profile, done) => {
              done(null, {
                email: profile.email,
                firstname: profile.given_name,
                lastname: profile.family_name,
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

