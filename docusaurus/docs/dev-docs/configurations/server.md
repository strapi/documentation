---
title: Server configuration
sidebar_label: Server
description: Strapi offers a single entry point file for its server configuration.
displayed_sidebar: cmsSidebar
tags:
  - app keys
  - base configuration
  - configuration
  - cron job
  - host
  - port
---

import NotV5 from '/docs/snippets/\_not-updated-to-v5.md'

# Server configuration

<NotV5 />

The `./config/server.js` file is used to define the server configuration for a Strapi application.

:::caution
Changes to the `server.js` file require rebuilding the admin panel. After saving the modified file run either `yarn build` or `npm run build` in the terminal to implement the changes.
:::

## Available options

The `./config/server.js` file can include the following parameters:

<!-- TODO: add admin jwt config option -->
<!-- TODO: sort options alphabetically in the table below  -->

| Parameter                           | Description                                                                                                                                                                                                                                                                                                                                                                 | Type                                                                                              | Default             |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------- |
| `host`<br/><br/>❗️ _Mandatory_     | Host name                                                                                                                                                                                                                                                                                                                                                                   | string                                                                                            | `localhost`         |
| `port`<br/><br/>❗️ _Mandatory_     | Port on which the server should be running.                                                                                                                                                                                                                                                                                                                                 | integer                                                                                           | `1337`              |
| `app.keys`<br/><br/>❗️ _Mandatory_ | Declare session keys (based on [Koa session](https://github.com/koajs/session/blob/master/Readme.md)), which is used by the `session` middleware for the Users & Permissions plugin and the Documentation plugin.                                                                                                                                                           | array of strings                                                                                  | `undefined`         |
| `socket`                            | Listens on a socket. Host and port are cosmetic when this option is provided and likewise use `url` to generate proper urls when using this option. This option is useful for running a server without exposing a port and using proxy servers on the same machine (e.g [Heroku nginx buildpack](https://github.com/heroku/heroku-buildpack-nginx#requirements-proxy-mode)) | string \| integer                                                                                 | `/tmp/nginx.socket` |
| `emitErrors`                        | Enable errors to be emitted to `koa` when they happen in order to attach custom logic or use error reporting services.                                                                                                                                                                                                                                                      | boolean                                                                                           | `false`             |
| `url`                               | Public url of the server. Required for many different features (ex: reset password, third login providers etc.). Also enables proxy support such as Apache or Nginx, example: `https://mywebsite.com/api`. The url can be relative, if so, it is used with `http://${host}:${port}` as the base url. An absolute url is however recommended.                                | string                                                                                            | `''`                |
| `proxy`                             | Proxy configuration                                                                                                                                                                                                                                                                                                                                                         | object                                                                                            |                     |
| `proxy.global`                      | Defines the proxy agent for all external requests. To be used if the Strapi project is behind a forward proxy.                                                                                                                                                                                                                                                              | string                                                                                            |                     |
| `proxy.fetch`                       | The proxy for all requests made within `strapi.fetch` (used for licenses check, telemetry and webhooks)                                                                                                                                                                                                                                                                     | string \| [ProxyAgent.Options](https://github.com/nodejs/undici/blob/main/types/proxy-agent.d.ts) |                     |
| `proxy.http`                        | The proxy for all (non-fetch) http requests                                                                                                                                                                                                                                                                                                                                 | string                                                                                            |                     |
| `proxy.https`                       | The proxy for all (non-fetch) https requests                                                                                                                                                                                                                                                                                                                                | string                                                                                            |                     |
| `proxy.koa`                         | Set the koa variable `app.proxy`. When `true`, proxy header fields will be trusted.                                                                                                                                                                                                                                                                                         | boolean                                                                                           | `false`             |
| `cron`                              | Cron configuration (powered by [`node-schedule`](https://github.com/node-schedule/node-schedule))                                                                                                                                                                                                                                                                           | object                                                                                            |                     |
| `cron.enabled`                      | Enable or disable [CRON jobs](/dev-docs/configurations/cron.md) to schedule jobs at specific dates.                                                                                                                                                                                                                                                                         | boolean                                                                                           | `false`             |
| `cron.tasks`                        | Declare [CRON jobs](/dev-docs/configurations/cron.md) to be run at specific dates.                                                                                                                                                                                                                                                                                          | object                                                                                            |                     |
| `dirs`                              | Path configuration of different directories Strapi uses.                                                                                                                                                                                                                                                                                                                    | object                                                                                            |                     |
| `dirs.public`                       | Customize the path of the public folder.                                                                                                                                                                                                                                                                                                                                    | string                                                                                            | `./public`          |
| `http`                              | Configuration of the http server used by Strapi                                                                                                                                                                                                                                                                                                                             | object                                                                                            |                     |
| `http.serverOptions`                | Options passed to http `createServer`                                                                                                                                                                                                                                                                                                                                       | [http.serverOptions](https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener)    | {}                  |
| `transfer.remote.enabled`           | Toggle the ability to use the [transfer feature](/dev-docs/data-management/transfer)                                                                                                                                                                                                                                                                | boolean                                                                                           | `true`              |
| `logger.startup.enabled`            | Toggle the the startup message in the terminal                                                                                                                                                                                                                                                                                                                              | boolean                                                                                           | `true`              |
| `logger.updates.enabled`            | Toggle the notification message about updating strapi in the terminal                                                                                                                                                                                                                                                                                                       | boolean                                                                                           | `true`              |

## Configurations

The `./config/server.js` minimal configuration requires the `host` and `port` parameters for development. Additional parameters can be included for a full configuration.

:::note
[Environmental configurations](/dev-docs/configurations/environment.md) (i.e. using the `env()` helper) do not need to contain all the values so long as they exist in the default `./config/server.js`.
:::

The default configuration created with any new project should at least include the following:
<Tabs>
<TabItem value="minimal configuration" label="Minimal configuration">

<Tabs groupId="js-ts">
<TabItem value="javascript" label="JavaScript">

```js title="./config/server.js"
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/server.ts"
export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
});
```

</TabItem>
</Tabs>

</TabItem>

 <TabItem value="Full configuration" label="Full configuration">

The following is an example of a full configuration file. Not all of these keys are required (see [available options](#available-options)).

<Tabs groupId="js-ts">
<TabItem value="javascript" label="JavaScript">

```js title="./config/server.js"
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  socket: '/tmp/nginx.socket', // only use if absolutely required
  emitErrors: false,
  url: env('PUBLIC_URL', 'https://api.example.com'),
  proxy: env.bool('IS_PROXIED', true),
  cron: {
    enabled: env.bool('CRON_ENABLED', false),
  },
  transfer: {
    remote: {
      enabled: false,
    },
  },
  logger: {
    updates: {
      enabled: false,
    },
    startup: {
      enabled: false,
    },
  },
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```js title="./config/server.ts"
export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  socket: '/tmp/nginx.socket', // only use if absolutely required
  emitErrors: false,
  url: env('PUBLIC_URL', 'https://api.example.com'),
  proxy: env.bool('IS_PROXIED', true),
  cron: {
    enabled: env.bool('CRON_ENABLED', false),
  },
  transfer: {
    remote: {
      enabled: false,
    },
  },
  logger: {
    updates: {
      enabled: false,
    },
    startup: {
      enabled: false,
    },
  },
});
```

</TabItem>
</Tabs>

</TabItem>
</Tabs>
