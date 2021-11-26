---
title: Server configuration - Strapi Developer Docs
description: Strapi offers a single entry point file for its server configuration.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/required/server.html
---

# Server configuration

The `./config/server.js` is used to define server configuration for the Strapi application.

## Available options

The `./config/server.js` file can include the following parameters:

<!-- TODO: add admin jwt config option -->

| Parameter                                | Description                                                                                                                                                                                                                                                                                                                                                                 | Type              | Default                                                                                                                          |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `host`<br/><br/>❗️ _Mandatory_                                 | Host name                                                                                                                                                                                                                                                                                                                                                                   | string            | `localhost`                                                                                                                      |
| `port`<br/><br/>❗️ _Mandatory_                                  | Port on which the server should be running.                                                                                                                                                                                                                                                                                                                                 | integer           | `1337`                                                                                                                           |
| `socket`                                | Listens on a socket. Host and port are cosmetic when this option is provided and likewise use `url` to generate proper urls when using this option. This option is useful for running a server without exposing a port and using proxy servers on the same machine (e.g [Heroku nginx buildpack](https://github.com/heroku/heroku-buildpack-nginx#requirements-proxy-mode)) | string \| integer | `/tmp/nginx.socket`                                                                                                              |
| `emitErrors`                            | Enable errors to be emitted to `koa` when they happen in order to attach custom logic or use error reporting services.                                                                                                                                                                                                                                                      | boolean           | `false`                                                                                                                          |
| `url`                                   | Public url of the server. Required for many different features (ex: reset password, third login providers etc.). Also enables proxy support such as Apache or Nginx, example: `https://mywebsite.com/api`. The url can be relative, if so, it is used with `http://${host}:${port}` as the base url. An absolute url is however recommended.                            | string            | `''`                                                                                                                             |
| `proxy`                                 | Set the koa variable `app.proxy`. When `true`, proxy header fields will be trusted.                                                                                                                                                                                                                                                                                         | boolean           | `false`                                                                                                                          |
| `cron`                                  | Cron configuration (powered by [`node-schedule`](https://github.com/node-schedule/node-schedule))                                                                                                                                                                                                                                                                           | Object            |                                                                                                                                  |
| `cron.enabled`                          | Enable or disable [CRON jobs](/developer-docs/latest/setup-deployment-guides/configurations/optional/cronjobs.md) to schedule jobs at specific dates.                                                                                                                                                                                                                                                                                                            | boolean           | `false`                                                                                                                          |
| `cron.tasks`                          | Declare [CRON jobs](/developer-docs/latest/setup-deployment-guides/configurations/optional/cronjobs.md) to be run at specific dates.                                                                                                                                                                                                                                                                                                            | boolean           | `false`                                                                                                                          |

## Configurations

The `./config/server.js` file should at least include a minimal configuration with the `host` and `port` parameters. Additional parameters can be included for a full configuration.

:::note
[Environmental configurations](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md) (i.e. using the `env()` helper) do not need to contain all the values so long as they exist in the default `./config/server.js`.
:::

::::: tabs card

:::: tab Minimal configuration

The default configuration created with any new project should at least include the following:

```js
// path: ./config/server.js

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
});
```

::::

:::: tab Full configuration

The following is an example of a full configuration file. Not all of these keys are required (see [available options](#available-options)).

```js
// path: ./config/server.js

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
});
```

::::

:::::
