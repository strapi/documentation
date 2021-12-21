---
title: Admin panel configuration - Strapi Developer Docs
description: Strapi's admin panel offers a single entry point file for its configuration.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/required/admin-panel.html
---

# Admin panel configuration

The `./config/admin.js` is used to define admin panel configuration for the Strapi application.

## Available options

 The `./config/admin.js` file can include the following parameters:

| Parameter                                | Description                                                                                                                                                                                                                                                                                                                                                                 | Type              | Default                                                                                                                          |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `apiToken.salt` | Salt used to generate [API tokens](/developer-docs/latest/setup-deployment-guides/configurations/optional/api-tokens.md) | String | (A random string<br/>generated<br/>by Strapi) |
| `auth`                            | Authentication configuration                                                                                                                                                                                                                                                                                                                                                | Object            |       -                                                                                                                          |
| `auth.secret`                     | Secret used to encode JWT tokens                                                                                                                                                                                                                                                                                                                                            | string            | `undefined`                                                                                                                      |
| `auth.signOptions`                | Record of all the options that wil be used to sign the JWTs. Values can be found [here](https://www.npmjs.com/package/jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback)   | Object | `{ expiresIn: '30d' }`
| `auth.verifyOptions`                | Record of all the options that wil be used to verify the JWTs. Values can be found [here](https://www.npmjs.com/package/jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback)   | Object | `{}`
| `auth.events`                     | Record of all the events subscribers registered for the authentication                                                                                                                                                                                                                                                                                                      | object            | `{}`                                                                                                                             |
| `auth.events.onConnectionSuccess` | Function called when an admin user log in successfully to the administration panel                                                                                                                                                                                                                                                                                          | function          | `undefined`                                                                                                                      |
| `auth.events.onConnectionError`   | Function called when an admin user fails to log in to the administration panel                                                                                                                                                                                                                                                                                              | function          | `undefined`                                                                                                                      |
| `url`                             | Url of your admin panel. Default value: `/admin`. Note: If the url is relative, it will be concatenated with `url`.                                                                                                                                                                                                                                                         | string            | `/admin`                                                                                                                         |
| `autoOpen`                        | Enable or disabled administration opening on start.                                                                                                                                                                                                                                                                                                                         | boolean           | `true`                                                                                                                           |
| `watchIgnoreFiles`                | Add custom files that should not be watched during development. See more [here](https://github.com/paulmillr/chokidar#path-filtering) (property `ignored`).                                                                                                                                                                                                                 | Array(string)     | `[]`                                                                                                                             |
| `host`                            | Use a different host for the admin panel. Only used along with `strapi develop --watch-admin`                                                                                                                                                                                                                                                                               | string            | `localhost`                                                                                                                      |
| `port`                            | Use a different port for the admin panel. Only used along with `strapi develop --watch-admin`                                                                                                                                                                                                                                                                               | string            | `8000`                                                                                                                           |
| `serveAdminPanel`                 | If false, the admin panel won't be served. Note: the `index.html` will still be served, see [defaultIndex option](/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.md)                                                                                                                                                                      | boolean           | `true`                                                                                                                           |
| `forgotPassword`                  | Settings to customize the forgot password email (see more here: [Forgot Password Email](/developer-docs/latest/development/admin-customization.md#forgotten-password-email))                                                                                                                                                                                                   | Object            | {}                                                                                                                               |
| `forgotPassword.emailTemplate`    | Email template as defined in [email plugin](/developer-docs/latest/plugins/email.md#programmatic-usage)                                                                                                                                                                                                                                                         | Object            | [Default template](https://github.com/strapi/strapi/tree/master/packages/strapi-admin/config/email-templates/forgot-password.js) |
| `forgotPassword.from`             | Sender mail address                                                                                                                                                                                                                                                                                                                                                         | string            | Default value defined in your [provider configuration](/developer-docs/latest/plugins/email.md#configure-the-plugin) |
| `forgotPassword.replyTo`          | Default address or addresses the receiver is asked to reply to                                                                                                                                                                                                                                                                                                              | string            | Default value defined in your [provider configuration](/developer-docs/latest/plugins/email.md#configure-the-plugin) |

## Configurations

The `./config/admin.js` file should at least include a minimal configuration with required parameters for authentication and [API tokens](/developer-docs/latest/setup-deployment-guides/configurations/optional/api-tokens.md). Additional parameters can be included for a full configuration.

:::note
[Environmental configurations](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md) (i.e. using the `env()` helper) do not need to contain all the values so long as they exist in the default `./config/server.js`.
:::

:::: tabs card
::: tab Minimal configuration

The default configuration created with any new project should at least include the following:

```js
// path: ./config/admin.js

module.exports = ({ env }) => ({
  apiToken: {
    salt: env('API_TOKEN_SALT', 'someRandomLongString'),
  },
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'someSecretKey'),
  },
})

```

:::

::: tab Full configuration

```js
// path: ./config/admin.js

module.exports = ({ env }) => ({
  apiToken: {
    salt: env('API_TOKEN_SALT', 'someRandomLongString'),
  },
  auth: {
    events: {
      onConnectionSuccess(e) {
        console.log(e.user, e.provider);
      },
      onConnectionError(e) {
        console.error(e.error, e.provider);
      },
    },
    secret: env('ADMIN_JWT_SECRET', 'someSecretKey'),
  },
  url: env('PUBLIC_ADMIN_URL', '/dashboard'),
  autoOpen: false,
  watchIgnoreFiles: [
    './my-custom-folder', // Folder
    './scripts/someScript.sh', // File
  ],
  host: 'localhost', // Only used for --watch-admin
  port: 8003, // Only used for --watch-admin
  serveAdminPanel: env.bool('SERVE_ADMIN', true),
  forgotPassword: {
    from: 'no-reply@example.com',
    replyTo: 'no-reply@example.com',
  },
})

```

:::
::::

