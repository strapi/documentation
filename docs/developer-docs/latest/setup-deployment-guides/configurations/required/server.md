---
title: Server configuration - Strapi Developer Documentation
description: 
---

<!-- TODO: update SEO -->

# Server configuration

The `./config/server.js` is used to define server configuration for the Strapi application.

:::: tabs card

::: tab Minimal

## Minimal Server Config

This is the default config created with any new project, all these keys are required at the very least, environmental configs do not need to contain all these values so long as they exist in the default `./config/server.js`.

**Path —** `./config/server.js`.

```js
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', 'someSecretKey'),
    },
  },
});
```

:::

::: tab Full

## Full Server Config

This is an example of a full configuration, typically certain keys do not need to present in environmental configs, and not all of these keys are required. Please see the table below to see what each key does.

**Path —** `./config/server.js`.

```javascript
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  socket: '/tmp/nginx.socket', // only use if absolutely required
  emitErrors: false,
  url: env('PUBLIC_URL', 'https://api.example.com'),
  proxy: env.bool('IS_PROXIED', true),
  cron: {
    enabled: env.bool('CRON_ENABLED', false),
  },
  admin: {
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
  },
});
```

:::

::::

### Available options

| Property                                | Description                                                                                                                                                                                                                                                                                                                                                                 | Type              | Default                                                                                                                          |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `host`                                  | Host name                                                                                                                                                                                                                                                                                                                                                                   | string            | `localhost`                                                                                                                      |
| `port`                                  | Port on which the server should be running.                                                                                                                                                                                                                                                                                                                                 | integer           | `1337`                                                                                                                           |
| `socket`                                | Listens on a socket. Host and port are cosmetic when this option is provided and likewise use `url` to generate proper urls when using this option. This option is useful for running a server without exposing a port and using proxy servers on the same machine (e.g [Heroku nginx buildpack](https://github.com/heroku/heroku-buildpack-nginx#requirements-proxy-mode)) | string \| integer | `/tmp/nginx.socket`                                                                                                              |
| `emitErrors`                            | Enable errors to be emitted to `koa` when they happen in order to attach custom logic or use error reporting services.                                                                                                                                                                                                                                                      | boolean           | `false`                                                                                                                          |
| `url`                                   | Public url of the server. Required for many different features (ex: reset password, third login providers etc.). Also enables proxy support such as Apache or Nginx, example: `https://mywebsite.com/api`. The url can be relative, if so, it is used with `http://${host}:${port}` as the base url. An absolute url is however **recommended**.                            | string            | `''`                                                                                                                             |
| `proxy`                                 | Set the koa variable `app.proxy`. When `true`, proxy header fields will be trusted.                                                                                                                                                                                                                                                                                         | boolean           | `false`                                                                                                                          |
| `cron`                                  | Cron configuration (powered by [`node-schedule`](https://github.com/node-schedule/node-schedule))                                                                                                                                                                                                                                                                           | Object            |                                                                                                                                  |
| `cron.enabled`                          | Enable or disable CRON tasks to schedule jobs at specific dates.                                                                                                                                                                                                                                                                                                            | boolean           | `false`                                                                                                                          |
| `admin`                                 | Admin panel configuration                                                                                                                                                                                                                                                                                                                                                   | Object            |                                                                                                                                  |
| `admin.auth`                            | Authentication configuration                                                                                                                                                                                                                                                                                                                                                | Object            |                                                                                                                                  |
| `admin.auth.secret`                     | Secret used to encode JWT tokens                                                                                                                                                                                                                                                                                                                                            | string            | `undefined`                                                                                                                      |
| `admin.auth.events`                     | Record of all the events subscribers registered for the authentication                                                                                                                                                                                                                                                                                                      | object            | `{}`                                                                                                                             |
| `admin.auth.events.onConnectionSuccess` | Function called when an admin user log in successfully to the administration panel                                                                                                                                                                                                                                                                                          | function          | `undefined`                                                                                                                      |
| `admin.auth.events.onConnectionError`   | Function called when an admin user fails to log in to the administration panel                                                                                                                                                                                                                                                                                              | function          | `undefined`                                                                                                                      |
| `admin.url`                             | Url of your admin panel. Default value: `/admin`. Note: If the url is relative, it will be concatenated with `url`.                                                                                                                                                                                                                                                         | string            | `/admin`                                                                                                                         |
| `admin.autoOpen`                        | Enable or disabled administration opening on start.                                                                                                                                                                                                                                                                                                                         | boolean           | `true`                                                                                                                           |
| `admin.watchIgnoreFiles`                | Add custom files that should not be watched during development. See more [here](https://github.com/paulmillr/chokidar#path-filtering) (property `ignored`).                                                                                                                                                                                                                 | Array(string)     | `[]`                                                                                                                             |
| `admin.host`                            | Use a different host for the admin panel. Only used along with `strapi develop --watch-admin`                                                                                                                                                                                                                                                                               | string            | `localhost`                                                                                                                      |
| `admin.port`                            | Use a different port for the admin panel. Only used along with `strapi develop --watch-admin`                                                                                                                                                                                                                                                                               | string            | `8000`                                                                                                                           |
| `admin.serveAdminPanel`                 | If false, the admin panel won't be served. Note: the `index.html` will still be served, see [defaultIndex option](/developer-docs/latest/setup-deployment-guides/configurations/optional/middlewares.md#global-middlewares)                                                                                                                                                                      | boolean           | `true`                                                                                                                           |
| `admin.forgotPassword`                  | Settings to customize the forgot password email (see more here: [Forgot Password Email](/developer-docs/latest/development/admin-customization.md#customizing-the-forgotten-password-email))                                                                                                                                                                                                   | Object            | {}                                                                                                                               |
| `admin.forgotPassword.emailTemplate`    | Email template as defined in [email plugin](/developer-docs/latest/plugins/email.md#programmatic-usage)                                                                                                                                                                                                                                                         | Object            | [Default template](https://github.com/strapi/strapi/tree/master/packages/strapi-admin/config/email-templates/forgot-password.js) |
| `admin.forgotPassword.from`             | Sender mail address                                                                                                                                                                                                                                                                                                                                                         | string            | Default value defined in your [provider configuration](/developer-docs/latest/plugins/email.md#configure-the-plugin) |
| `admin.forgotPassword.replyTo`          | Default address or addresses the receiver is asked to reply to                                                                                                                                                                                                                                                                                                              | string            | Default value defined in your [provider configuration](/developer-docs/latest/plugins/email.md#configure-the-plugin) |
