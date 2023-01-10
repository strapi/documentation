---
title: Admin panel configuration - Strapi Developer Docs
description: Strapi's admin panel offers a single entry point file for its configuration.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/required/admin-panel.html
---

# Admin panel configuration

The `./config/admin.js` is used to define admin panel configuration for the Strapi application.

## Available options

The `./config/admin.js` file can include the following parameters:

| Parameter                         | Description                                                                                                                                                                                              | Type          | Default                                                                                                                             |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|-------------------------------------------------------------------------------------------------------------------------------------|
| `apiToken.salt`                   | Salt used to generate [API tokens](/developer-docs/latest/setup-deployment-guides/configurations/optional/api-tokens.md)                                                                                 | string        | Random string                                                                                                                       |
| `auth`                            | Authentication configuration                                                                                                                                                                             | object        | -                                                                                                                                   |
| `auth.secret`                     | Secret used to encode JWT tokens                                                                                                                                                                         | string        | `undefined`                                                                                                                         |
| `auth.options`                    | Options object passed to [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)                                                                                                                      | object        | -                                                                                                                                   |
| `auth.options.expiresIn`          | JWT expire time used in [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)                                                                                                                       | object        | `30d`                                                                                                                               |
| `auth.events`                     | Record of all the events subscribers registered for the authentication                                                                                                                                   | object        | `{}`                                                                                                                                |
| `auth.events.onConnectionSuccess` | Function called when an admin user log in successfully to the administration panel                                                                                                                       | function      | `undefined`                                                                                                                         |
| `auth.events.onConnectionError`   | Function called when an admin user fails to log in to the administration panel                                                                                                                           | function      | `undefined`                                                                                                                         |
| `url`                             | Url of your admin panel. Default value: `/admin`. Note: If the url is relative, it will be concatenated with `url`.                                                                                      | string        | `/admin`                                                                                                                            |
| `autoOpen`                        | Enable or disabled administration opening on start.                                                                                                                                                      | boolean       | `true`                                                                                                                              |
| `watchIgnoreFiles`                | Add custom files that should not be watched during development. See more [here](https://github.com/paulmillr/chokidar#path-filtering) (property `ignored`).                                              | array(string) | `[]`                                                                                                                                |
| `host`                            | Use a different host for the admin panel. Only used along with `strapi develop --watch-admin`                                                                                                            | string        | `localhost`                                                                                                                         |
| `port`                            | Use a different port for the admin panel. Only used along with `strapi develop --watch-admin`                                                                                                            | string        | `8000`                                                                                                                              |
| `serveAdminPanel`                 | If false, the admin panel won't be served. Note: the `index.html` will still be served, see [defaultIndex option](/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.md) | boolean       | `true`                                                                                                                              |
| `forgotPassword`                  | Settings to customize the forgot password email (see [Forgot Password Email](/developer-docs/latest/development/admin-customization.md#forgotten-password-email))                                        | object        | {}                                                                                                                                  |
| `forgotPassword.emailTemplate`    | Email template as defined in [email plugin](/developer-docs/latest/plugins/email.md#using-the-sendtemplatedemail-function)                                                                               | object        | [Default template](https://github.com/strapi/strapi/blob/main/packages/core/admin/server/config/email-templates/forgot-password.js) |
| `forgotPassword.from`             | Sender mail address                                                                                                                                                                                      | string        | Default value defined in your [provider configuration](/developer-docs/latest/development/providers.md#configuring-providers)       |
| `forgotPassword.replyTo`          | Default address or addresses the receiver is asked to reply to                                                                                                                                           | string        | Default value defined in your [provider configuration](/developer-docs/latest/development/providers.md#configuring-providers)       |
| `rateLimit`                       | Settings to customize the rate limiting of the admin panel's authentication endpoints, additional configuration options come from [`koa2-ratelimit`](https://www.npmjs.com/package/koa2-ratelimit)       | object        | {}                                                                                                                                  |
| `rateLimit.enabled`               | Enable or disable the rate limiter                                                                                                                                                                       | boolean       | `true`                                                                                                                              |
| `rateLimit.interval`              | Time window for requests to be considered as part of the same rate limiting bucket                                                                                                                       | object        | `{ min: 5 }`                                                                                                                        |
| `rateLimit.max`                   | Maximum number of requests allowed in the time window                                                                                                                                                    | integer       | `5`                                                                                                                                 |
| `rateLimit.delayAfter`            | Number of requests allowed before delaying responses                                                                                                                                                     | integer       | `1`                                                                                                                                 |
| `rateLimit.timeWait`              | Time to wait before responding to a request (in milliseconds)                                                                                                                                            | integer       | `3000`                                                                                                                              |
| `rateLimit.prefixKey`             | Prefix for the rate limiting key                                                                                                                                                                         | string        | `${userEmail}:${ctx.request.path}:${ctx.request.ip}`                                                                                |
| `rateLimit.whitelist`             | Array of IP addresses to whitelist from rate limiting                                                                                                                                                    | array(string) | `[]`                                                                                                                                |
| `rateLimit.store`                | Rate limiting storage location (Memory, Sequelize,  or Redis) and for more information please see the [`koa2-ratelimit documentation`](https://www.npmjs.com/package/koa2-ratelimit)                                                                                                                                                                                     | object        | `MemoryStore`

## Configurations

The `./config/admin.js` file should at least include a minimal configuration with required parameters for authentication and [API tokens](/developer-docs/latest/setup-deployment-guides/configurations/optional/api-tokens.md). Additional parameters can be included for a full configuration.

:::note
[Environmental configurations](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md) (i.e. using the `env()` helper) do not need to contain all the values so long as they exist in the default `./config/server.js`.
:::

:::: tabs card

::: tab Minimal configuration

The default configuration created with any new project should at least include the following:

<code-group>

<code-block title="JAVASCRIPT">

```js
// path: ./config/admin.js

module.exports = ({ env }) => ({
  apiToken: {
    salt: env('API_TOKEN_SALT', 'someRandomLongString'),
  },
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'someSecretKey'),
  },
});

```

</code-block>

<code-block title="TYPESCRIPT">

```js
// path: ./config/admin.ts

module.exports = ({ env }) => ({
  apiToken: {
    salt: env('API_TOKEN_SALT', 'someRandomLongString'),
  },
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'someSecretKey'),
  },
});
```

</code-block>

</code-group>

:::

::: tab Full configuration

<code-group>

<code-block title="JAVASCRIPT">

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
    options: {
      expiresIn: '7d',
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
  rateLimit: {
    interval: { hour: 1, min: 30 },
    timeWait: 3*1000,
    max: 10,
  },
});

```

</code-block>

<code-block title="TYPESCRIPT">

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
    options: {
      expiresIn: '7d',
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
});
```

</code-block>

</code-group>
