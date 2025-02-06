---
title: Discord SSO provider
description: Learn how to configure the SSO provider to sign in and sign up into your Strapi application through Discord.
displayed_sidebar: cmsSidebar
tags: 
- SSO
- providers
- configuration
---

# Discord provider SSO configuration

The present page explains how to setup the Discord provider for the [Single Sign-On (SSO) feature](/cms/features/sso).

:::prerequisites
You have read the [How to configure SSO guide](/cms/configurations/guides/configure-sso).
:::

## Installation

Install [passport-discord](https://github.com/nicholastay/passport-discord#readme):

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```sh
yarn add passport-discord
```

</TabItem>

<TabItem value="npm" label="npm">

```sh
npm install --save passport-discord
```

</TabItem>

</Tabs>

## Configuration example

The Discord SSO provider is configured in the `auth.providers` array of [the `config/admin` file](/cms/configurations/admin-panel):

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```jsx title="/config/admin.js"

const DiscordStrategy = require("passport-discord");

module.exports = ({ env }) => ({
  auth: {
    // ...
    providers: [
      {
        uid: "discord",
        displayName: "Discord",
        icon: "https://cdn0.iconfinder.com/data/icons/free-social-media-set/24/discord-512.png",
        createStrategy: (strapi) =>
          new DiscordStrategy(
            {
              clientID: env("DISCORD_CLIENT_ID"),
              clientSecret: env("DISCORD_SECRET"),
              callbackURL:
                strapi.admin.services.passport.getStrategyCallbackURL(
                  "discord"
                ),
              scope: ["identify", "email"],
            },
            (accessToken, refreshToken, profile, done) => {
              done(null, {
                email: profile.email,
                username: `${profile.username}#${profile.discriminator}`,
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

import { Strategy as DiscordStrategy } from "passport-discord";


export default ({ env }) => ({
  auth: {
    // ...
    providers: [
      {
        uid: "discord",
        displayName: "Discord",
        icon: "https://cdn0.iconfinder.com/data/icons/free-social-media-set/24/discord-512.png",
        createStrategy: (strapi) =>
          new DiscordStrategy(
            {
              clientID: env("DISCORD_CLIENT_ID"),
              clientSecret: env("DISCORD_SECRET"),
              callbackURL:
                strapi.admin.services.passport.getStrategyCallbackURL(
                  "discord"
                ),
              scope: ["identify", "email"],
            },
            (accessToken, refreshToken, profile, done) => {
              done(null, {
                email: profile.email,
                username: `${profile.username}#${profile.discriminator}`,
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


