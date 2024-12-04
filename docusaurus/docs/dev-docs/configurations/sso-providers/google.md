---
title: Google - Admin SSO Provider
description: Steps to configure Google as a Strapi Admin SSO Provider
sidebar_label: Google
displayed_sidebar: devDocsConfigSidebar
tags:
- google
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
- Create your Google OAuth2 app by following the steps in the [Google Console](https://developers.google.com/workspace/guides/create-credentials#oauth-client-id).
- Gather the required information to set as environment variables in your Strapi project:
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET

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

The Google OAuth2 provider requires the following scopes, however additional scopes can be added as needed depending on your use case and the data you need returned:

- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`

### Profile Data

Data returned from the provider is dependent on how your Google OAuth2 application is configured. The example below assumes that the Google OAuth2 application is configured to return the user's email, first name, and last name. Fields returned by the provider can change based on the scopes requested and the user's Google account settings.

If you aren't sure what data is being returned by the provider, you can log the `profile` object in the `createStrategy` function to see what data is available as seen in the following example.

<details>
  <summary>Configuration Example with Logging</summary>

```js
(request, accessToken, refreshToken, profile, done) => {
  // See what is returned by the provider
  console.log(profile);

  done(null, {
    // Map the data returned by the provider to the Strapi user object
    email: profile.email,
    firstname: profile.given_name,
    lastname: profile.family_name,
  });
}
```

</details>

### Redirect URL/URI

The redirect URL/URI will be dependent on your provider configuration however in most cases should combine your application's public URL and the provider's callback URL. The example below shows how to combine the public URL with the provider's callback URL.

```js
callbackURL:
  env('PUBLIC_URL', "https://api.example.com") +
  strapi.admin.services.passport.getStrategyCallbackURL("google"),
```

In this example the redirect URL/URI used by the provider will be `https://api.example.com/admin/connect/google`.

This is broken down as follows:

- `https://api.example.com` is the public URL of your Strapi application
- `/admin/connect` is the general path for SSO callbacks in Strapi
- `/google` is the specific provider UID for Google

## Strapi Configuration

Using: [passport-google-oauth2](https://github.com/mstade/passport-google-oauth2)

### Install the Provider Package

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

### Adding the Provider to Strapi

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/admin.js"

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
                env('PUBLIC_URL') +
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

```ts title="./config/admin.ts"

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
                env('PUBLIC_URL') +
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
