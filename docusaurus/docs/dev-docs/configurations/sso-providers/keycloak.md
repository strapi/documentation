---
title: Keycloak SSO provider
description: Learn how to configure the SSO provider to sign in and sign up into your Strapi application through Keycloak.
displayed_sidebar: cmsSidebar
tags: 
- SSO
- providers
- configuration
---

# Keycloak (OpenID Connect) provider SSO configuration

The present page explains how to setup the Keycloak provider for the [Single Sign-On (SSO) feature](/user-docs/features/sso).

:::prerequisites
You have read the [How to configure SSO guide](/dev-docs/configurations/guides/configure-sso).
:::

## Installation

Install [passport-keycloak-oauth2-oidc](https://www.npmjs.com/package/passport-keycloak-oauth2-oidc):

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```sh
yarn add passport-keycloak-oauth2-oidc
```

</TabItem>

<TabItem value="npm" label="npm">

```sh
npm install --save passport-keycloak-oauth2-oidc
```

</TabItem>

</Tabs>

## Configuration example

The Keycloak SSO provider is configured in the `auth.providers` array of [the `config/admin` file](/dev-docs/configurations/admin-panel):

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/admin.js"

const KeyCloakStrategy = require("passport-keycloak-oauth2-oidc");

module.exports = ({ env }) => ({
  auth: {
    // ...
    providers: [
      {
        uid: "keycloak",
        displayName: "Keycloak",
        icon: "https://raw.githubusercontent.com/keycloak/keycloak-admin-ui/main/themes/keycloak/logo.svg",
        createStrategy: (strapi) =>
          new KeyCloakStrategy(
            {
              clientID: env("KEYCLOAK_CLIENT_ID", ""),
              realm: env("KEYCLOAK_REALM", ""),
              publicClient: env.bool("KEYCLOAK_PUBLIC_CLIENT", false),
              clientSecret: env("KEYCLOAK_CLIENT_SECRET", ""),
              sslRequired: env("KEYCLOAK_SSL_REQUIRED", "external"),
              authServerURL: env("KEYCLOAK_AUTH_SERVER_URL", ""),
              callbackURL:
                strapi.admin.services.passport.getStrategyCallbackURL(
                  "keycloak"
                ),
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

import { Strategy as KeyCloakStrategy } from "passport-keycloak-oauth2-oidc";

export default ({ env }) => ({
  auth: {
    // ...
    providers: [
      {
        uid: "keycloak",
        displayName: "Keycloak",
        icon: "https://raw.githubusercontent.com/keycloak/keycloak-admin-ui/main/themes/keycloak/logo.svg",
        createStrategy: (strapi) =>
          new KeyCloakStrategy(
            {
              clientID: env("KEYCLOAK_CLIENT_ID", ""),
              realm: env("KEYCLOAK_REALM", ""),
              publicClient: env.bool("KEYCLOAK_PUBLIC_CLIENT", false),
              clientSecret: env("KEYCLOAK_CLIENT_SECRET", ""),
              sslRequired: env("KEYCLOAK_SSL_REQUIRED", "external"),
              authServerURL: env("KEYCLOAK_AUTH_SERVER_URL", ""),
              callbackURL:
                strapi.admin.services.passport.getStrategyCallbackURL(
                  "keycloak"
                ),
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
