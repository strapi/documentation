---
title: GitHub - Admin SSO Provider
description: Steps to configure GitHub as a Strapi Admin SSO Provider
sidebar_label: GitHub
displayed_sidebar: devDocsConfigSSOSidebar
tags:
- github
- additional configuration
- admin panel
- configuration
- Enterprise feature
- SSO 
---

## Requirements

You will need to gather or complete the following requirements before you can configure GitHub as a Strapi Admin SSO Provider:

- [Properly configure Strapi for SSO](/dev-docs/configurations/sso.md#required-configuration-before-setting-up-sso) including adding the `url` configuration key to your `./config/server.js` file.
- Create your GitHub OAuth2 application by following the steps in the [GitHub Developer Settings](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app).
- Gather the required information to set as environment variables in your Strapi project:
  - `GITHUB_CLIENT_ID`
  - `GITHUB_CLIENT_SECRET`

## Provider Specific Notes

The GitHub OAuth2 provider requires the following scopes, however additional scopes can be added as needed depending on your use case and the data you need returned:

- `user:email`

Data returned from the provider is dependent on how your GitHub OAuth2 application is configured. The example below assumes that the GitHub OAuth2 application is configured to return the user's email and username. Fields returned by the provider can change based on the scopes requested and the user's GitHub account settings.

If you aren't sure what data is being returned by the provider, you can log the `profile` object in the `createStrategy` function to see what data is available as seen in the following example.

<details>
  <summary>Configuration Example with Logging</summary>

```js
(request, accessToken, refreshToken, profile, done) => {
  // See what is returned by the provider
  console.log(profile);

  done(null, {
    // Map the data returned by the provider to the Strapi user object
    email: profile.emails[0].value,
    username: profile.username,
  });
}
```

</details>

## Strapi Configuration

Using: [passport-github](https://github.com/cfsghost/passport-github)

### Install the Provider Package

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

### Adding the Provider to Strapi

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/admin.js"

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
                env('PUBLIC_URL') +
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

```ts title="./config/admin.ts"

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
                env('PUBLIC_URL') +
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
