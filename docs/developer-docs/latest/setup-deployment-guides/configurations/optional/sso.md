---
title: Single Sign On (SSO) - Strapi Developer Documentation
description: 
sidebarDepth: 3
---

<!-- TODO: update SEO -->

# Single Sign On <GoldBadge link="https://strapi.io/pricing-self-hosted/" withLinkIcon />

Single-Sign-On on Strapi allows you to configure additional sign-in and sign-up methods for your administration panel.

::: prerequisites

- A Strapi application running on version 3.5.0 or higher is required.
- To configure SSO on your application, you will need an EE license with a [Gold plan](https://strapi.io/pricing-self-hosted).
- Make sure Strapi is part of the applications you can access with your provider. For example, with Microsoft (Azure) Active Directory, you must first ask someone with the right permissions to add Strapi to the list of allowed applications. Please refer to your provider(s) documentation to learn more about that.
  :::

:::caution
It is currently not possible to associate a unique SSO provider to an email address used for a Strapi account, meaning that the access to a Strapi account cannot be restricted to only one SSO provider. For more information and workarounds to solve this issue, [please refer to the dedicated GitHub issue](https://github.com/strapi/strapi/issues/9466#issuecomment-783587648).
:::

SSO configuration lives in the server configuration of the application, found at `/config/server.js`.

## Accessing the configuration

The providers' configuration should be written within the `admin.auth.providers` path of the server configuration.

`admin.auth.providers` is an array of [provider configuration](#provider-configuration).

```javascript
module.exports = ({ env }) => ({
  // ...
  admin: {
    // ...
    auth: {
      providers: [], // The providers' configuration lives there
    },
  },
});
```

## Setting up provider configuration

A provider's configuration is a JavaScript object built with the following properties:

| Name             | Required | Type     | Description                                                                                                            |
| ---------------- | -------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `uid`            | true     | string   | The UID of the strategy. It must match the strategy's name                                                             |
| `displayName`    | true     | string   | The name that will be used on the login page to reference the provider                                                 |
| `icon`           | false    | string   | An image URL. If specified, it will replace the displayName on the login page                                          |
| `createStrategy` | true     | function | A factory that will build and return a new passport strategy for your provider. Takes the strapi instance as parameter |

::: tip
The `uid` property is the unique identifier of each strategy and is generally found in the strategy's package. If you are not sure of what it refers to, please contact the maintainer of the strategy.
:::

### The `createStrategy` Factory

A passport strategy is usually built by instantiating it using 2 parameters: the configuration object, and the verify function.

<!-- Title below is supposed to be an h7, so one level deeper than "The `createStrategy` Factory. But h7 is not a thing, so using bold instead. 🤷 -->

**Configuration Object**

The configuration object depends on the strategy needs, but often asks for a callback URL to be redirected to once the connection has been made on the provider side.

A specific callback URL can be generated for your provider using the `getStrategyCallbackURL` method. This URL also needs to be written on the provider side in order to allow redirection from it.

The format of the callback URL is the following: `/admin/connect/<provider_uid>`.

::: tip
`strapi.admin.services.passport.getStrategyCallbackURL` is a Strapi helper you can use to get a callback URL for a specific provider. It takes a provider name as a parameter and returns a URL.
:::

If needed, this is also where you will put your client ID and secret key for your OAuth2 application.

**Verify Function**

The verify function is used here as a middleware allowing the user to transform and make extra processing on the data returned from the provider API.

This function always takes a `done` method as last parameter which is used to transfer needed data to the Strapi layer of SSO.

Its signature is the following: `void done(error: any, data: object);` and it follows the following rules:

- If `error` is not set to `null`, then the data sent is ignored, and the controller will throw an error.
- If the SSO's auto-registration feature is disabled, then the `data` object only need to be composed of an `email` property.
- If the SSO's auto-registration feature is enabled, then you will need to define (in addition to the `email`) either a `username` property or both `firstname` and `lastname` within the `data` oject.

### Adding a provider

Adding a new provider means adding a new way for your administrators to log-in.

To achieve a great flexibility and a large choice of provider, Strapi uses [Passport.js](http://www.passportjs.org/). Any valid passport strategy that doesn't need additional custom data should therefore work with Strapi.

:::caution
Strategies such as [ldapauth](https://github.com/vesse/passport-ldapauth) don't work out of the box since they require extra data to be sent from the admin panel.
If you want to add an LDAP provider to your application, you will need to write a [custom strategy](http://www.passportjs.org/packages/passport-custom/).
You can also use services such as Okta and Auth0 as bridge services.
:::

### Configuring the provider

To configure a provider, follow the procedure below:

1. Make sure to import your strategy in your server configuration file, either from an installed package or a local file.
2. You'll need to add a new item to the `admin.auth.providers` array in your server configuration that will match the [format given above](#provider-configuration)
3. Restart your application, the provider should appear on your admin login page.

### Configuration providers examples

#### Google

Using: [passport-google-oauth2](https://github.com/mstade/passport-google-oauth2)

<code-group>

<code-block title="NPM">
```sh
npm install --save passport-google-oauth2
```
</code-block>

<code-block title="YARN">
```sh
yarn add passport-google-oauth2
```
</code-block>

</code-group>

::: details Configuration example for Google:

```jsx
// path: ./config/server.js

'use strict';

const GoogleStrategy = require('passport-google-oauth2');

module.exports = ({ env }) => ({
  // ...
  admin: {
    // ...
    auth: {
      /// ...
      providers: [
        {
          uid: 'google',
          displayName: 'Google',
          icon: 'https://cdn2.iconfinder.com/data/icons/social-icons-33/128/Google-512.png',
          createStrategy: strapi =>
            new GoogleStrategy(
              {
                clientID: env('GOOGLE_CLIENT_ID'),
                clientSecret: env('GOOGLE_CLIENT_SECRET'),
                scope: [
                  'https://www.googleapis.com/auth/userinfo.email',
                  'https://www.googleapis.com/auth/userinfo.profile',
                ],
                callbackURL: strapi.admin.services.passport.getStrategyCallbackURL('google'),
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
  },
});
```

:::

#### Github


Using: [passport-github](https://github.com/cfsghost/passport-github)

<code-group>

<code-block title="NPM">
```sh
npm install --save passport-github2
```
</code-block>

<code-block title="YARN">
```sh
yarn add passport-github2
```
</code-block>

</code-group>

::: details Configuration example for Github:

```jsx
// path: ./config/server.js

'use strict';

const GithubStrategy = require('passport-github2');

module.exports = ({ env }) => ({
  // ...
  admin: {
    // ...
    auth: {
      // ...
      providers: [
        {
          uid: 'github',
          displayName: 'Github',
          icon: 'https://cdn1.iconfinder.com/data/icons/logotypes/32/github-512.png',
          createStrategy: strapi =>
            new GithubStrategy(
              {
                clientID: env('GITHUB_CLIENT_ID'),
                clientSecret: env('GITHUB_CLIENT_SECRET'),
                scope: ['user:email'],
                callbackURL: strapi.admin.services.passport.getStrategyCallbackURL('github'),
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
  },
});
```

:::

#### Discord

Using: [passport-discord](https://github.com/nicholastay/passport-discord#readme)

<code-group>

<code-block title="NPM">
```sh
npm install --save passport-discord
```
</code-block>

<code-block title="YARN">
```sh
yarn add passport-discord
```
</code-block>

</code-group>

::: details Configuration example for Discord:

```jsx
// path: ./config/server.js

'use strict';

const DiscordStrategy = require('passport-discord');

module.exports = ({ env }) => ({
  // ...
  admin: {
    // ...
    auth: {
      // ...
      providers: [
        {
          uid: 'discord',
          displayName: 'Discord',
          icon: 'https://cdn0.iconfinder.com/data/icons/free-social-media-set/24/discord-512.png',
          createStrategy: strapi =>
            new DiscordStrategy(
              {
                clientID: env('DISCORD_CLIENT_ID'),
                clientSecret: env('DISCORD_SECRET'),
                callbackURL: strapi.admin.services.passport.getStrategyCallbackURL('discord'),
                scope: ['identify', 'email'],
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
  },
});
```

:::

#### Microsoft

Using: [passport-azure-ad-oauth2](https://github.com/auth0/passport-azure-ad-oauth2#readme)

<code-group>

<code-block title="NPM">
```sh
npm install --save passport-azure-ad-oauth2 jsonwebtoken
```
</code-block>

<code-block title="YARN">
```sh
yarn add passport-azure-ad-oauth2 jsonwebtoken
```
</code-block>

</code-group>

::: details Configuration example for Microsoft:

```jsx
// path: ./config/server.js

'use strict';

const AzureAdOAuth2Strategy = require('passport-azure-ad-oauth2');
const jwt = require('jsonwebtoken');

module.exports = ({ env }) => ({
  // ...
  admin: {
    // ...
    auth: {
      // ...
      providers: [
        {
          uid: 'azure_ad_oauth2',
          displayName: 'Microsoft',
          icon:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/320px-Microsoft_logo_%282012%29.svg.png',
          createStrategy: strapi =>
            new AzureAdOAuth2Strategy(
              {
                clientID: env('MICROSOFT_CLIENT_ID', ''),
                clientSecret: env('MICROSOFT_CLIENT_SECRET', ''),
                scope: ['user:email'],
                tenant: env('MICROSOFT_TENANT_ID', ''),
                callbackURL: strapi.admin.services.passport.getStrategyCallbackURL(
                  'azure_ad_oauth2'
                ),
              },
              (accessToken, refreshToken, params, profile, done) => {
                var waadProfile = jwt.decode(params.id_token, '', true);
                done(null, {
                  email: waadProfile.upn,
                  username: waadProfile.upn,
                });
              }
            ),
        },
      ],
    },
  },
});
```

:::

#### Okta

Using: [passport-okta-oauth20](https://github.com/antoinejaussoin/passport-okta-oauth20/blob/main/README.md)

<code-group>

<code-block title="NPM">
```sh
npm install --save passport-okta-oauth20
```
</code-block>

<code-block title="YARN">
```sh
yarn add passport-okta-oauth20
```
</code-block>

</code-group>

::: details Configuration example for Okta:

```jsx
// path: ./config/server.js

'use strict';

const OktaOAuth2Strategy = require('passport-okta-oauth20').Strategy;

module.exports = ({ env }) => ({
  // ...
  admin: {
    // ...
    auth: {
      // ...
      providers: [
        {
          uid: 'okta',
          displayName: 'Okta',
          icon:
            'https://www.okta.com/sites/default/files/Okta_Logo_BrightBlue_Medium-thumbnail.png',
          createStrategy: strapi =>
            new OktaOAuth2Strategy(
              {
                clientID: env('OKTA_CLIENT_ID'),
                clientSecret: env('OKTA_CLIENT_SECRET'),
                audience: env('OKTA_DOMAIN'),
                scope: ['openid', 'email', 'profile'],
                callbackURL: strapi.admin.services.passport.getStrategyCallbackURL('okta'),
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
  },
});
```

:::

## Performing advanced customization

### Admin panel URL

If the administration panel lives on a host/port different from the Strapi server, the admin panel URL needs to be updated:
update the `admin.url` key in the `./config/server.js` configuration file (see [admin panel customization documentation](/developer-docs/latest/development/admin-customization.html#changing-the-access-url)).
<!-- TODO: remove this comment — the link above won't work until merged with the `dev/v4-plugins-api` branch -->

### Custom Logic

In some scenarios, you will want to write additional logic for your connection workflow such as:

- restricting connection and registration for a specific domain
- triggering actions on connection attempt
- adding analytics

The easiest way to do so is to plug into the verify function of your strategy and write some code.

For example, if you want to allow only people with an official strapi.io email address, you can instantiate your strategy like this:

```javascript
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

### Authentication Events

The SSO feature adds a new [authentication event](/developer-docs/latest/setup-deployment-guides/configurations.md#available-options): `onSSOAutoRegistration`.

This event is triggered whenever a user is created using the auto-register feature added by SSO.
It contains the created user (`event.user`), and the provider used to make the registration (`event.provider`).

Example:

`/config/server.js`

```javascript
module.exports = () => ({
  // ...
  admin: {
    // ...
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
  },
});
```
