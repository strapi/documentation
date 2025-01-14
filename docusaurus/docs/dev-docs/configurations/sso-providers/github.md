---
title: GitHub SSO provider
description: Learn how to configure the SSO provider to sign in and sign up into your Strapi application through GitHub.
displayed_sidebar: cmsSidebar
tags: 
- SSO
- providers
- configuration
---

# GitHub provider SSO configuration

The present page explains how to setup the GitHub provider for the [Single Sign-On (SSO) feature](/user-docs/features/sso).

:::prerequisites
You have read the [How to configure SSO guide](/dev-docs/configurations/guides/configure-sso).
:::

## Installation

Install [passport-github](https://github.com/cfsghost/passport-github):

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```sh
yarn add passport-github2
```

</TabItem>

<TabItem value="npm" label="npm">

```sh
npm install --save passport-github2
```

</TabItem>

</Tabs>

## Configuration example

The GitHub SSO provider is configured in the `auth.providers` array of [the `config/admin` file](/dev-docs/configurations/admin-panel):

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/admin.js"

const GithubStrategy = require("passport-github2");

module.exports = ({ env }) => ({
  auth: {
    // ...
    providers: [
      {
        uid: "github",
        displayName: "Github",
        icon: "https://cdn1.iconfinder.com/data/icons/logotypes/32/github-512.png",
        createStrategy: (strapi) =>
          new GithubStrategy(
            {
              clientID: env("GITHUB_CLIENT_ID"),
              clientSecret: env("GITHUB_CLIENT_SECRET"),
              scope: ["user:email"],
              callbackURL:
                strapi.admin.services.passport.getStrategyCallbackURL("github"),
            },
            (accessToken, refreshToken, profile, done) => {
              done(null, {
                email: profile.emails[0].value,
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

import { Strategy as GithubStrategy } from "passport-github2";

export default ({ env }) => ({
  auth: {
    // ...
    providers: [
      {
        uid: "github",
        displayName: "Github",
        icon: "https://cdn1.iconfinder.com/data/icons/logotypes/32/github-512.png",
        createStrategy: (strapi) =>
          new GithubStrategy(
            {
              clientID: env("GITHUB_CLIENT_ID"),
              clientSecret: env("GITHUB_CLIENT_SECRET"),
              scope: ["user:email"],
              callbackURL:
                strapi.admin.services.passport.getStrategyCallbackURL("github"),
            },
            (accessToken, refreshToken, profile, done) => {
              done(null, {
                email: profile.emails[0].value,
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

