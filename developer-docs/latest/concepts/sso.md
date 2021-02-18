# Single Sign On [<Badge text="Gold" type="warning" vertical="middle"/>](https://strapi.io/pricing)

Single-Sign-On on Strapi allows you to configure additional sign-in and sign-up methods for your administration panel.

## Prerequisites

- A Strapi application running on version 3.5.0 or higher is required.
- To configure SSO on your application, you will need an EE license with a Gold plan.
- Make sure Strapi is part of the applications you can access with your provider. For example, with Microsoft (Azure) Active Directory, you must first ask someone with the right permissions to add Strapi to the list of allowed applications. Please refer to your provider(s) documentation to learn more about that.

## Usage

SSO configuration lives in the server configuration of your application found within `/config/server.js`.

### Accessing the configuration

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

### Provider Configuration

A provider's configuration is a Javascript object built with the following properties:

| Name             | Required | Type     | Description                                                                    |
|----------------- |----------|----------|--------------------------------------------------------------------------------|
| `uid`            | true     | string   | The UID of the strategy. It must match the strategy's name                     |
| `displayName`    | true     | string   | The name that will be used on the login page to reference the provider        |
| `icon`           | false    | string   | An image URL. If specified, it will replace the displayName on the login page  |
| `createStrategy` | true     | function | A factory that will build and return a new passport strategy for your provider. Takes the strapi instance as parameter |

::: tip
The `uid` property is the unique identifier of each strategy and is generally found in the strategy's package. If you are not sure of what it refers to, please contact the maintainer of the strategy.
:::

#### The `createStrategy` Factory

A passport strategy is usually built by instantiating it using 2 parameters: the configuration object, and the verify function.

##### Configuration Object

The configuration object depends on the strategy needs, but often asks for a callback URL to be redirected to once the connection has been made on the provider side.

You can generate a specific callback URL for your provider using the `getStrategyCallbackURL` method. This URL also needs to be written on the provider side in order to allow redirection from it.

The format of the callback URL is the following: `/admin/connect/<provider_uid>`.

::: tip
`strapi.admin.services.passport.getStrategyCallbackURL` is a Strapi helper you can use to get a callback URL for a specific provider. It takes a provider name as a parameter and returns a URL.
:::

If needed, this is also where you will put your client ID and secret key for your OAuth2 application.

##### Verify Function

The verify function is used here as a middleware allowing the user to transform and make extra processing on the data returned from the provider API.

This function always takes a `done` method as last parameter which is used to transfer needed data to the Strapi layer of SSO.

Its signature is the following: `void done(error: any, data: object);` and it follows the following rules:

- If `error` is not set to `null`, then the data sent is ignored, and the controller will throw an error.
- If the SSO's auto-registration feature is disabled, then the `data` object only need to be composed of an `email` property.
- If the SSO's auto-registration feature is enabled, then you will need to define (in addition to the `email`) either a `username` property or both `firstname` and `lastname` within the `data` oject.

### Adding a provider

Adding a new provider means adding a new way for your administrators to log-in.

To achieve a great flexibility and a large choice of provider, Strapi uses [Passport.js](http://www.passportjs.org/). Any valid passport strategy that doesn't need additional custom data should therefore work with Strapi.

::: warning
Strategies such as [ldapauth](https://github.com/vesse/passport-ldapauth) don't work out of the box since they require extra data to be sent from the admin panel.
If you want to add an LDAP provider to your application, you will need to write a [custom strategy](http://www.passportjs.org/packages/passport-custom/).
You can also use services such as Okta and Auth0 as bridge services.
:::

### Configuring the provider

To configure a provider, follow the procedure below:

1. Make sure to import your strategy in your server configuration file, either from an installed package or a local file.
2. You'll need to add a new item to the `admin.auth.providers` array in your server configuration that will match the [format given above](#provider-configuration)
3. Restart your application, the provider should appear on your admin login page.

## Examples

:::::: tabs

::::: tab Google

Using: [passport-google-oauth2](https://github.com/mstade/passport-google-oauth2)

:::: tabs

::: tab yarn

```bash
yarn add passport-google-oauth2
```

:::

::: tab npm

```bash
npm install --save passport-google-oauth2
```

::::

`/config/server.js`

```jsx
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
          icon: 'https://cdn2.iconfinder.com/data/icons/social-icons-33/128/Google-512.png' ,
          createStrategy: strapi => new GoogleStrategy({
              clientID: env('GOOGLE_CLIENT_ID'),
              clientSecret: env('GOOGLE_CLIENT_SECRET'),
              scope: [
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile'
              ],
              callbackURL: strapi.admin.services.passport.getStrategyCallbackURL('google')
            }, (request, accessToken, refreshToken, profile, done) => {
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

:::::

::::: tab Github

Using: [passport-github](https://github.com/cfsghost/passport-github)

:::: tabs

::: tab yarn

```bash
yarn add passport-github2
```

:::

::: tab npm

```bash
npm install --save passport-github2
```

:::

::::

`/config/server.js`

```jsx
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
          createStrategy: strapi => new GithubStrategy({
            clientID: env('GITHUB_CLIENT_ID'),
            clientSecret: env('GITHUB_CLIENT_SECRET'),
            scope: ['user:email'],
            callbackURL: strapi.admin.services.passport.getStrategyCallbackURL('github'),
          }, (accessToken, refreshToken, profile, done) => {
            done(null, {
              email: profile.emails[0].value,
              username: profile.username,
            });
          }),
        },
      ],
    },
  },
});
```
:::::

::::: tab Discord

Using: [passport-discord](https://github.com/nicholastay/passport-discord#readme)

:::: tabs

::: tab yarn

```bash
yarn add passport-discord
```

:::

::: tab npm

```bash
npm install --save passport-discord
```

:::

::::

`/config/server.js`

```jsx
"use strict";

const DiscordStrategy = require("passport-discord");

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
                callbackURL: strapi.admin.services.passport.getStrategyCallbackURL(
                  'discord'
                ),
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
:::::
::::::

## Advanced Customization

### Admin Panel URL

If your administration panel lives on a different host/port than your Strapi server, you will need to modify the admin URL.
To do so, head to your `/config/server.js` configuration file and tweak the `admin.url` field.

For example, if your admin application has been started on `https://api.example.com`, your configuration will look like the following:

`/config/server.js`

```javascript
module.exports = () => ({
  // ...
  admin: {
    // ...
    url: 'https://api.example.com/admin',
  },
});
```

### Custom Logic

In some scenarios, you will want to write additional logic for your connection workflow such as:
- Restricting connection and registration for a specific domain
- Triggering actions on connection attempt
- Analytics

The easiest way to do so is to plug into the verify function of your strategy and write some code.

For example, if you want to allow only people with an official strapi.io email address, you can instantiate your strategy like this:

```javascript
const strategyInstance = new Strategy(
  configuration,
  ({ email, username }, done) => {
    // If the email ends with @strapi.io
    if (email.endsWith('@strapi.io')) {
      // Then we continue with the data given by the provider
      return done(null, { email, username });
    }
    
    // Otherwise, we continue by sending an error to the done function
    done(new Error('Forbidden email address'));
  },
);
```

### Authentication Events

The SSO feature adds a new [authentication event](configurations.html#available-options): `onSSOAutoRegistration`.

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
