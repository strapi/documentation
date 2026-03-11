---
title: Server lifecycle
displayed_sidebar: cmsSidebar
toc_max_heading_level: 4
pagination_prev: cms/plugins-development/server-api
pagination_next: cms/plugins-development/server-configuration
description: Control when plugin server logic runs with register, bootstrap, and destroy lifecycle hooks.
tags:
  - plugin APIs
  - server API
  - lifecycle function
  - register function
  - bootstrap function
  - destroy function
  - plugins development
---

import Prerequisite from '/docs/snippets/plugins-development-create-plugin-prerequisite-server.md'

# Server API: Lifecycle

<Tldr>
Use `register()` to declare capabilities before the app is fully initialized, `bootstrap()` to run logic once Strapi is initialized, and `destroy()` to clean up resources on shutdown. Each function receives `{ strapi }` as its argument.
</Tldr>

Lifecycle functions control when your plugin's server-side logic runs during the Strapi application startup and shutdown sequence. They are exported from the [server entry file](/cms/plugins-development/server-api#entry-file) alongside routes, controllers, services, and other server blocks.

<Prerequisite />

## Startup sequence

Understanding when each lifecycle runs helps you put the right code in the right place:

<MermaidWithFallback
    chartFile="/diagrams/plugins-server-api-lifecycle.mmd"
    fallbackImage="/img/assets/diagrams/plugins-server-api-lifecycle.png"
    fallbackImageDark="/img/assets/diagrams/plugins-server-api-lifecycle_DARK.png"
    alt="Server API lifecycle diagram"
/>

<br/>

| Phase | What is available in your plugin |
| --- | --- |
| 2. Register | `strapi` object is available, but the database is not initialized yet and routing is not initialized yet |
| 4. Bootstrap | Full runtime: database initialized, routes initialized, services and content-types loaded, other plugins available |
| 5. Shutdown | Shutdown is in progress; use this hook to release resources before Strapi finishes stopping |

:::note
Each lifecycle function is called once per plugin instance. If a lifecycle is called a second time on the same plugin instance (for example in custom tests), Strapi throws an error. This does not occur under normal operation.
:::

## register() {#register}

**Type:** `Function`

`register()` runs early in startup, before database initialization and before route initialization.

Use `register()` to:
- Register the server side of [custom fields](/cms/features/custom-fields#registering-a-custom-field-on-the-server)
- Register database migrations
- Register server middlewares on the Strapi HTTP server (e.g. `strapi.server.use(...)`)
- Extend another plugin's content-types or interface before bootstrap

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/register.js"
'use strict';

module.exports = ({ strapi }) => {
  // Register a server-level middleware early in startup
  strapi.server.use(async (ctx, next) => {
    ctx.set('X-Plugin-Version', '1.0.0');
    await next();
  });
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/plugins/my-plugin/server/src/register.ts"
import type { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => {
  // Register a server-level middleware early in startup
  strapi.server.use(async (ctx: any, next: () => Promise<void>) => {
    ctx.set('X-Plugin-Version', '1.0.0');
    await next();
  });
};
```

</TabItem>
</Tabs>

## bootstrap()

**Type:** `Function`

`bootstrap()` runs after plugins registration, database initialization, route initialization, and Content API action registration.

Use `bootstrap()` to:
- Seed the database with initial data
- Register admin RBAC actions using `strapi.service('admin::permission').actionProvider.registerMany(...)`
- Register cron jobs
- Subscribe to database lifecycle events
- Call services from your plugin or other plugins
- Set up cross-plugin integrations that require other plugins to be registered first

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/bootstrap.js"
'use strict';

module.exports = async ({ strapi }) => {
  // Register admin RBAC actions for this plugin
  await strapi.service('admin::permission').actionProvider.registerMany([
    {
      section: 'plugins',
      displayName: 'Read',
      uid: 'read',
      pluginName: 'my-plugin',
    },
    {
      section: 'plugins',
      displayName: 'Settings',
      uid: 'settings',
      pluginName: 'my-plugin',
    },
  ]);
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/plugins/my-plugin/server/src/bootstrap.ts"
import type { Core } from '@strapi/strapi';

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  // Register admin RBAC actions for this plugin
  await strapi.service('admin::permission').actionProvider.registerMany([
    {
      section: 'plugins',
      displayName: 'Read',
      uid: 'read',
      pluginName: 'my-plugin',
    },
    {
      section: 'plugins',
      displayName: 'Settings',
      uid: 'settings',
      pluginName: 'my-plugin',
    },
  ]);
};
```

</TabItem>
</Tabs>

## destroy()

**Type:** `Function`

`destroy()` is called when the Strapi instance is shutting down. It is optional. Only implement it when your plugin holds resources that need explicit cleanup.

Use `destroy()` to:
- Close external connections (databases, message queues, WebSocket servers)
- Clear intervals or timeouts set in `bootstrap()`
- Remove event listeners registered during the plugin's lifetime

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/destroy.js"
'use strict';

module.exports = ({ strapi }) => {
  // Close an external connection opened in bootstrap()
  strapi.plugin('my-plugin').service('queue').disconnect();
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/plugins/my-plugin/server/src/destroy.ts"
import type { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => {
  // Close an external connection opened in bootstrap()
  strapi.plugin('my-plugin').service('queue').disconnect();
};
```

</TabItem>
</Tabs>

## Best practices

- **Keep `register()` lightweight.** It runs before full initialization.

- **Use `bootstrap()` for database reads/writes.** The database is initialized during the bootstrap phase, not during register. Any call to `strapi.documents()` or a service that queries the database belongs in `bootstrap()`.

- **Register admin RBAC actions in `bootstrap()`.** Use `strapi.service('admin::permission').actionProvider.registerMany(...)` in `bootstrap()`. This is when the permission service is available. Content API actions are registered automatically by Strapi during the same phase.

- **Always pair resource creation with `destroy()`.** If your plugin opens a connection, registers a global interval, or attaches a process listener in `bootstrap()`, implement `destroy()` to clean up those resources. This prevents resource leaks during testing and graceful restarts.

- **Avoid hard dependencies between plugins in `register()`.** At registration time, the order in which other plugins have registered is not guaranteed. Cross-plugin calls that rely on another plugin being initialized belong in `bootstrap()`.

- **Prefer services over inline logic.** Move non-trivial bootstrap logic into a dedicated service method (e.g. `strapi.plugin('my-plugin').service('setup').initialize()`). This keeps lifecycle files readable and the logic testable.