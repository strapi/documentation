---
title: SSO configuration
sidebar_label: Single Sign-On (SSO)
displayed_sidebar: devDocsConfigSidebar
description: Strapi's SSO allows you to configure additional sign-in and sign-up methods for your administration panel. It requires an Enterprise Edition with a Gold plan.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/optional/sso.html
tags:
- additional configuration
- admin panel
- configuration
- Enterprise feature
- SSO 
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# Single Sign-On <EnterpriseBadge/>

<NotV5 />

Single Sign-On on Strapi allows you to configure additional sign-in and sign-up methods for your administration panel.

:::prerequisites

- A Strapi application running on version 3.5.0 or higher is required.
- To configure SSO on your application, you will need an EE license with a [Gold plan](https://strapi.io/pricing-self-hosted).
- Make sure the SSO feature is [enabled in the admin panel](/user-docs/settings/single-sign-on).
- Make sure Strapi is part of the applications you can access with your provider. For example, with Microsoft (Azure) Active Directory, you must first ask someone with the right permissions to add Strapi to the list of allowed applications. Please refer to your provider(s) documentation to learn more about that.
:::

:::caution
It is currently not possible to associate a unique SSO provider to an email address used for a Strapi account, meaning that the access to a Strapi account cannot be restricted to only one SSO provider. For more information and workarounds to solve this issue, [please refer to the dedicated GitHub issue](https://github.com/strapi/strapi/issues/9466#issuecomment-783587648).
:::

SSO configuration lives in the server configuration of the application, found at `./config/admin.js`.

## Accessing the configuration

The providers' configuration should be written within the `auth.providers` path of the admin panel configuration.

`auth.providers` is an array of [provider configuration](#setting-up-provider-configuration).

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/admin.js"

module.exports = ({ env }) => ({
  // ...
  auth: {
    providers: [], // The providers' configuration lives there
  },
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/admin.ts"

export default ({ env }) => ({
  // ...
  auth: {
    providers: [], // The providers' configuration lives there
  },
});
```

</TabItem>

</Tabs>

## Setting up provider configuration

A provider's configuration is a JavaScript object built with the following properties:

| Name             | Required | Type     | Description                                                                                                            |
|------------------|----------|----------|------------------------------------------------------------------------------------------------------------------------|
| `uid`            | true     | string   | The UID of the strategy. It must match the strategy's name                                                             |
| `displayName`    | true     | string   | The name that will be used on the login page to reference the provider                                                 |
| `icon`           | false    | string   | An image URL. If specified, it will replace the displayName on the login page                                          |
| `createStrategy` | true     | function | A factory that will build and return a new passport strategy for your provider. Takes the strapi instance as parameter |

:::tip
The `uid` property is the unique identifier of each strategy and is generally found in the strategy's package. If you are not sure of what it refers to, please contact the maintainer of the strategy.
:::

:::note
By default, Strapi security policy does not allow loading images from external URLs, so provider logos will not show up on the [login screen](/user-docs/intro#accessing-the-admin-panel) of the admin panel unless [a security exception is added](/dev-docs/configurations/middlewares#security).
:::

<details>
  <summary>Example: Security exception for provider logos</summary>

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="./config/middlewares.js"
module.exports = [
  // ...
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'dl.airtable.com',
            'www.okta.com', // Base URL of the provider's logo
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'dl.airtable.com',
            'www.okta.com', // Base URL of the provider's logo
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  // ...
]
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="./config/middlewares.ts"
export default [
  // ...
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'dl.airtable.com',
            'www.okta.com', // Base URL of the provider's logo
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'dl.airtable.com',
            'www.okta.com', // Base URL of the provider's logo
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  // ...
]
```

  </TabItem>
</Tabs>

</details>

:::note
When deploying the admin panel to a different location or on a different subdomain, an additional configuration is required to set the common domain for the cookies. This is required to ensure the cookies are shared across the domains.
:::

:::caution
Deploying the admin and backend on entirely different unrelated domains is not possible at this time when using SSO.
:::

<details>
  <summary>Example: Setting custom cookie domain</summary>

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="./config/admin.js"
module.exports = ({ env }) => ({
  auth: {
    domain: env("ADMIN_SSO_DOMAIN", ".test.example.com"),
    providers: [
      // ...
    ],
  },
  url: env("ADMIN_URL", "http://admin.test.example.com"),
  // ...
});
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="./config/admin.ts"
export default ({ env }) => ({
  auth: {
    domain: env("ADMIN_SSO_DOMAIN", ".test.example.com"),
    providers: [
      // ...
    ],
  },
  url: env("ADMIN_URL", "http://admin.test.example.com"),
  // ...
});
```

</TabItem>
</Tabs>

</details>

### The `createStrategy` Factory

A passport strategy is usually built by instantiating it using 2 parameters: the configuration object, and the verify function.

#### Configuration Object

The configuration object depends on the strategy needs, but often asks for a callback URL to be redirected to once the connection has been made on the provider side.

A specific callback URL can be generated for your provider using the `getStrategyCallbackURL` method. This URL also needs to be written on the provider side in order to allow redirection from it.

The format of the callback URL is the following: `/admin/connect/<provider_uid>`.

:::tip
`strapi.admin.services.passport.getStrategyCallbackURL` is a Strapi helper you can use to get a callback URL for a specific provider. It takes a provider name as a parameter and returns a URL.
:::

If needed, this is also where you will put your client ID and secret key for your OAuth2 application.

**Verify Function**

The verify function is used here as a middleware allowing the user to transform and make extra processing on the data returned from the provider API.

This function always takes a `done` method as last parameter which is used to transfer needed data to the Strapi layer of SSO.

Its signature is the following: `void done(error: any, data: object);` and it follows the following rules:

- If `error` is not set to `null`, then the data sent is ignored, and the controller will throw an error.
- If the SSO's auto-registration feature is disabled, then the `data` object only need to be composed of an `email` property.
- If the SSO's auto-registration feature is enabled, then you will need to define (in addition to the `email`) either a `username` property or both `firstname` and `lastname` within the `data` object.

### Adding a provider

Adding a new provider means adding a new way for your administrators to log-in.

Strapi uses [Passport.js](http://www.passportjs.org/), which enables a large selection of providers. Any valid passport strategy that doesn't need additional custom data should therefore work with Strapi.

:::caution
Strategies such as [ldapauth](https://github.com/vesse/passport-ldapauth) don't work out of the box since they require extra data to be sent from the admin panel.
If you want to add an LDAP provider to your application, you will need to write a [custom strategy](http://www.passportjs.org/packages/passport-custom/).
You can also use services such as Okta and Auth0 as bridge services.
:::

### Configuring the provider

To configure a provider, follow the procedure below:

1. Make sure to import your strategy in your admin configuration file, either from an installed package or a local file.
2. You'll need to add a new item to the `auth.providers` array in your admin panel configuration that will match the [format given above](#setting-up-provider-configuration)
3. Restart your application, the provider should appear on your admin login page.
<!-- step 3 requires the build command? -->

### Provider configuration examples

#### Google

Using: [passport-google-oauth2](https://github.com/mstade/passport-google-oauth2)

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

<details>
  <summary>Configuration example for Google:</summary>
  <div>
    <div>
    <br/>
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

 </div>
<br/>
 </div>
</details>

#### Github

Using: [passport-github](https://github.com/cfsghost/passport-github)

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

<details>
  <summary>Configuration example for Github:</summary>
  <div>
    <div>
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
    </div>
    <br/>
  </div>
</details>

#### Discord

Using: [passport-discord](https://github.com/nicholastay/passport-discord#readme)

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

<details>
  <summary>Configuration example for Discord:</summary>
  <div>
    <div>
    <Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```jsx title="./config/admin.js"

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

```ts title="./config/admin.ts"

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
    </div>
    <br/>
  </div>
</details>

#### Microsoft

Using: [passport-azure-ad-oauth2](https://github.com/auth0/passport-azure-ad-oauth2#readme)

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

<details>
  <summary>Configuration example for Microsoft:</summary>
  <div>
    <div>
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
    </div>
    <br/>
  </div>
</details>

#### Keycloak (OpenID Connect)

Using: [passport-keycloak-oauth2-oidc](https://www.npmjs.com/package/passport-keycloak-oauth2-oidc)

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



<details>
  <summary>Configuration example for Keycloak (OpenID Connect):</summary>
  <div>
    <div>
    <Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/admin.js"

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

```ts title="./config/admin.ts"

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
    </div>
    <br/>
  </div>
</details>

#### Okta

Using: [passport-okta-oauth20](https://github.com/antoinejaussoin/passport-okta-oauth20/#readme)

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

:::caution
When setting the `OKTA_DOMAIN` environment variable, make sure to include the protocol (e.g. `https://example.okta.com`). If you do not, you will end up in a redirect loop.
:::

<details>
  <summary>Configuration example for Okta:</summary>
  <div>
    <div>
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
    </div>
    <br/>
  </div>
</details>

## Performing advanced customization

### Admin panel URL

If the administration panel lives on a host/port different from the Strapi server, the admin panel URL needs to be updated:
update the `url` key in the `./config/admin.js` configuration file (see [admin panel customization documentation](/dev-docs/admin-panel-customization#access-url)).

### Custom Logic

In some scenarios, you will want to write additional logic for your connection workflow such as:

- restricting connection and registration for a specific domain
- triggering actions on connection attempt
- adding analytics

The easiest way to do so is to plug into the verify function of your strategy and write some code.

For example, if you want to allow only people with an official strapi.io email address, you can instantiate your strategy like this:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/admin.js"

const strategyInstance = new Strategy(configuration, ({ email, username }, done) => {
  // If the email ends with @strapi.io
  if (email.endsWith('@strapi.io')) {
    // then we continue with the data given by the provider
    return done(null, { email, username });
  }

  // Otherwise, we continue by sending an error to the done function
  done(new Error('Forbidden email address'));
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/admin.ts"

const strategyInstance = new Strategy(configuration, ({ email, username }, done) => {
  // If the email ends with @strapi.io
  if (email.endsWith('@strapi.io')) {
    // then we continue with the data given by the provider
    return done(null, { email, username });
  }

  // Otherwise, we continue by sending an error to the done function
  done(new Error('Forbidden email address'));
});
```

</TabItem>

</Tabs>

### Authentication Events

The SSO feature adds a new [authentication event](/dev-docs/configurations/admin-panel#available-options): `onSSOAutoRegistration`.

This event is triggered whenever a user is created using the auto-register feature added by SSO.
It contains the created user (`event.user`), and the provider used to make the registration (`event.provider`).

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/admin.js"

module.exports = () => ({
    auth: {
      // ...
      events: {
        onConnectionSuccess(e) {},
        onConnectionError(e) {},
        // ...
        onSSOAutoRegistration(e) {
          const { user, provider } = e;

          console.log(
            `A new user (${user.id}) has been automatically registered using ${provider}`
          );
        },
      },
    },
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/admin.ts"

export default () => ({
    auth: {
      // ...
      events: {
        onConnectionSuccess(e) {},
        onConnectionError(e) {},
        // ...
        onSSOAutoRegistration(e) {
          const { user, provider } = e;

          console.log(
            `A new user (${user.id}) has been automatically registered using ${provider}`
          );
        },
      },
    },
});
```

</TabItem>

</Tabs>
