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
  - openapi
  - port
---

# Server configuration

<Tldr>
`/config/server` manages host, port, URL, proxy, cron, and more; changes require rebuilding the admin panel.
</Tldr>

The `/config/server.js` file is used to define the server configuration for a Strapi application.

:::caution
Changes to the `server.js` file require rebuilding the admin panel. After saving the modified file run either `yarn build` or `npm run build` in the terminal to implement the changes.
:::

## Available options

The `/config/server.js` file can include the following parameters:

<!-- TODO: add admin jwt config option -->
<!-- TODO: sort options alphabetically in the table below  -->

| Parameter                           | Description                                                                                                                                                                                                                                                                                                                                                                 | Type                                                                                              | Default             |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------- |
| `host`<br/><br/>❗️ _Mandatory_     | Host name                                                                                                                                                                                                                                                                                                                                                                   | string                                                                                            | `localhost`         |
| `port`<br/><br/>❗️ _Mandatory_     | Port on which the server should be running.                                                                                                                                                                                                                                                                                                                                 | integer                                                                                           | `1337`              |
| `app.keys`<br/><br/>❗️ _Mandatory_ | Declare session keys (based on <ExternalLink to="https://github.com/koajs/session/blob/master/Readme.md" text="Koa session"/>), which is used by the `session` middleware for the Users & Permissions plugin and the Documentation plugin.                                                                                                                                                           | array of strings                                                                                  | `undefined`         |
| `socket`                            | Listens on a socket. Host and port are cosmetic when this option is provided and likewise use `url` to generate proper urls when using this option. This option is useful for running a server without exposing a port and using proxy servers on the same machine (e.g <ExternalLink to="https://github.com/heroku/heroku-buildpack-nginx#requirements-proxy-mode" text="Heroku nginx buildpack"/>) | string \| integer                                                                                 | `/tmp/nginx.socket` |
| `emitErrors`                        | Enable errors to be emitted to `koa` when they happen in order to attach custom logic or use error reporting services.                                                                                                                                                                                                                                                      | boolean                                                                                           | `false`             |
| `url`                               | Public url of the server. Required for many different features (ex: reset password, third login providers etc.). Also enables proxy support such as Apache or Nginx, example: `https://mywebsite.com/api`. The url can be relative, if so, it is used with `http://${host}:${port}` as the base url. An absolute url is however recommended.                                | string                                                                                            | `''`                |
| `proxy`                             | Proxy configuration                                                                                                                                                                                                                                                                                                                                                         | object                                                                                            |                     |
| `proxy.global`                      | Defines the proxy agent for all external requests. To be used if the Strapi project is behind a forward proxy.                                                                                                                                                                                                                                                              | string                                                                                            |                     |
| `proxy.fetch`                       | The proxy for all requests made within `strapi.fetch` (used for licenses check, telemetry and webhooks)                                                                                                                                                                                                                                                                     | string \| <ExternalLink to="https://github.com/nodejs/undici/blob/main/types/proxy-agent.d.ts" text="ProxyAgent.Options"/> |                     |
| `proxy.http`                        | The proxy for all (non-fetch) http requests                                                                                                                                                                                                                                                                                                                                 | string                                                                                            |                     |
| `proxy.https`                       | The proxy for all (non-fetch) https requests                                                                                                                                                                                                                                                                                                                                | string                                                                                            |                     |
| `proxy.koa`                         | Set the koa variable `app.proxy`. When `true`, proxy header fields will be trusted.                                                                                                                                                                                                                                                                                         | boolean                                                                                           | `false`             |
| `cron`                              | Cron configuration (powered by <ExternalLink to="https://github.com/node-schedule/node-schedule" text="`node-schedule`"/>)                                                                                                                                                                                                                                                                           | object                                                                                            |                     |
| `cron.enabled`                      | Enable or disable [CRON jobs](/cms/configurations/cron.md) to schedule jobs at specific dates.                                                                                                                                                                                                                                                                         | boolean                                                                                           | `false`             |
| `cron.tasks`                        | Declare [CRON jobs](/cms/configurations/cron.md) to be run at specific dates.                                                                                                                                                                                                                                                                                          | object                                                                                            |                     |
| `dirs`                              | Path configuration of different directories Strapi uses.                                                                                                                                                                                                                                                                                                                    | object                                                                                            |                     |
| `dirs.public`                       | Customize the path of the public folder.                                                                                                                                                                                                                                                                                                                                    | string                                                                                            | `./public`          |
| `http`                              | Configuration of the http server used by Strapi                                                                                                                                                                                                                                                                                                                             | object                                                                                            |                     |
| `http.serverOptions`                | Options passed to http `createServer`                                                                                                                                                                                                                                                                                                                                       | <ExternalLink to="https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener" text="http.serverOptions"/>    | {}                  |
| `transfer.remote.enabled`           | Toggle the ability to use the [transfer feature](/cms/data-management/transfer)                                                                                                                                                                                                                                                                | boolean                                                                                           | `true`              |
| `transfer.remote.assetIdleTimeoutMs` | Timeout in milliseconds without incoming data before an asset stream is considered stalled when using `strapi transfer --from` to pull from a remote instance. Increase this value when transferring large files or when working on slow connections. | integer | <!-- TODO: confirm default value from strapi/strapi codebase --> |
| `webhooks.populateRelations`        | When `true`, relation fields are included in webhook event payloads. Set to `false` to keep payloads lightweight and avoid exposing relational data in outgoing webhook requests. | boolean | `true` |                                                                                                                                                                                                                                                                                                                            | boolean                                                                                           | `true`              |
| `logger.startup.enabled`            | Toggle the startup message in the terminal                                                                                                                                                                                                                                                                                                                              | boolean                                                                                           | `true`              |
| `logger.updates.enabled`            | Toggle the notification message about updating strapi in the terminal                                                                                                                                                                                                                                                                                                       | boolean                                                                                           | `true`              |
| `openapi`                            | [OpenAPI](/cms/api/openapi) endpoint configuration. Both endpoints use `access: 'disabled'` by default and are not registered.                                                                                                                                                                                                                                                                                 | object                                                                                            |                     |
| `openapi['content-api'].access`      | Access mode: `disabled` (not registered) or `public` (no authentication).                                                                                                                                                                                                                                                                                                                                    | string                                                                                            | `disabled`          |
| `openapi['content-api'].route.path`  | Subpath for the Content API endpoint, resolved under the [REST API prefix](/cms/configurations/api).                                                                                                                                                                                                                                                                        | string                                                                                            | `/openapi.json`     |
| `openapi['content-api'].cache.enabled` | Enable file-based caching of the generated specification.                                                                                                                                                                                                                                                                                                                  | boolean                                                                                           | `true`              |
| `openapi['content-api'].cache.maxAgeMs` | Cache validity in milliseconds.                                                                                                                                                                                                                                                                                                                                           | integer                                                                                           | `60000`             |
| `openapi['content-api'].cache.filePath` | File path for the cached specification. Relative paths resolve from the application root.                                                                                                                                                                                                                                                                                  | string                                                                                            | `.strapi/openapi/content-api.json` |
| `openapi.admin.access`             | Access mode: `disabled` (not registered) or `authenticated` (requires admin session).                                                                                                                                                                                                                                                                                                                                      | string                                                                                            | `disabled`             |
| `openapi.admin.route.path`          | Subpath for the Admin endpoint, resolved under the [admin path](/cms/configurations/admin-panel).                                                                                                                                                                                                                                                                           | string                                                                                            | `/openapi.json`     |
| `openapi.admin.cache.enabled`       | Enable file-based caching of the generated specification.                                                                                                                                                                                                                                                                                                                   | boolean                                                                                           | `true`              |
| `openapi.admin.cache.maxAgeMs`      | Cache validity in milliseconds.                                                                                                                                                                                                                                                                                                                                             | integer                                                                                           | `60000`             |
| `openapi.admin.cache.filePath`      | File path for the cached specification. Relative paths resolve from the application root.                                                                                                                                                                                                                                                                                   | string                                                                                            | `.strapi/openapi/admin.json` |

:::note
There is no Strapi-specific keep alive configuration option, because Strapi uses Node's default one for incoming HTTP requests, keeping connections alive by default. 

For outgoing HTTP calls, you can pass a keep-alive agent to your HTTP client.
Example with [`agentkeepalive`](https://github.com/node-modules/agentkeepalive) and Axios:

```js
const { HttpsAgent } = require('agentkeepalive');
const axios = require('axios');

const agent = new HttpsAgent();
axios.get('https://example.com', { httpsAgent: agent });
```
:::

:::tip
Strapi exposes a dedicated health check route for uptime probes. Any request to `/_health` returns an empty response with a `204` status and a `strapi: You are so French!` response header, which is suitable for load balancers or monitoring tools that only need a simple liveness indicator.
:::

## Configurations

The `/config/server.js` minimal configuration requires the `host` and `port` parameters for development. Additional parameters can be included for a full configuration.

:::note
[Environmental configurations](/cms/configurations/environment.md) (i.e. using the `env()` helper) do not need to contain all the values so long as they exist in the default `./config/server.js`.
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
  proxy: { koa: env.bool('IS_PROXIED', true) },
  cron: {
    enabled: env.bool('CRON_ENABLED', false),
  },
  transfer: {
    remote: {
      enabled: false,
    },
  },
  webhooks: {
    populateRelations: false,
  },
  logger: {
    updates: {
      enabled: false,
    },
    startup: {
      enabled: false,
    },
  },
  // highlight-start
  openapi: {
    'content-api': {
      access: 'public',
    },
  },
  // highlight-end
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
  proxy: { koa: env.bool('IS_PROXIED', true) },
  cron: {
    enabled: env.bool('CRON_ENABLED', false),
  },
  transfer: {
    remote: {
      enabled: false,
    },
  },
  webhooks: {
    populateRelations: false,
  },
  logger: {
    updates: {
      enabled: false,
    },
    startup: {
      enabled: false,
    },
  },
  // highlight-start
  openapi: {
    'content-api': {
      access: 'public',
    },
  },
  // highlight-end
});
```

</TabItem>
</Tabs>

</TabItem>
</Tabs>
