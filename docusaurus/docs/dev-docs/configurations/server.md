---
title: Server configuration
sidebar_label: Server
description: Strapi offers a single entry point file for its server configuration.
displayed_sidebar: devDocsConfigSidebar
tags:
- app keys
- base configuration
- configuration
- cron job
- host
- port
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

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

| `proxy`                             | Proxy configuration                                                                                                                                                                                                                                                                                                                                                         | object                                                                                            |                     |
| `proxy.global`                      | Defines the proxy agent for all external requests. To be used if the Strapi project is behind a forward proxy.                                                                                                                                                                                                                                                              | string                                                                                            |                     |
| `proxy.fetch`                       | The proxy for all requests made within `strapi.fetch` (used for licenses check, telemetry and webhooks)                                                                                                                                                                                                                                                                     | string \| [ProxyAgent.Options](https://github.com/nodejs/undici/blob/main/types/proxy-agent.d.ts) |                     |
| `proxy.http`                        | The proxy for all (non-fetch) http requests                                                                                                                                                                                                                                                                                                                                 | string                                                                                            |                     |
| `proxy.https`                       | The proxy for all (non-fetch) https requests                                                                                                                                                                                                                                                                                                                                | string                                                                                            |                     |
| `proxy.koa`                         | Set the koa variable `app.proxy`. When `true`, proxy header fields will be trusted.                                                                                                                                                                                                                                                                                         | boolean                                                                                           | `false`             |

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
