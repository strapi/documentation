---
title: Server lifecycle
displayed_sidebar: cmsSidebar
toc_max_heading_level: 4
pagination_prev: cms/plugins-development/server-api
pagination_next: cms/plugins-development/server-configuration
description: Control when plugin server logic runs with register, bootstrap, and destroy lifecycle hooks.
tags:
  - plugin APIs
  - lifecycle function
  - register function
  - bootstrap function
  - destroy function
  - plugins development
---

import Prerequisite from '/docs/snippets/plugins-development-create-plugin-prerequisite-server.md'

# Server API: Lifecycle

<Tldr>
Use `register()` to declare capabilities before the server initializes, `bootstrap()` to run logic once the server is ready, and `destroy()` to clean up resources on shutdown. Each function receives `{ strapi }` as its argument.
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
| 2. Register | `strapi` object, but no DB, no routes, no permissions yet |
| 4. Bootstrap | Full `strapi` object: services, content-types, Document Service API, other plugins |
| 6. Shutdown | Full `strapi` object, but requests are no longer being served |

:::note Runtime behavior
`register()` runs before the database, routes, and permissions systems are initialized. The `strapi` object is available, but you cannot query content-types or call services that depend on the database at this stage. Use `bootstrap()` for anything that needs the server to be fully set up.
:::

## register() {#register}

**Type:** `Function`

`register()` is called during phase 2, before the application is bootstrapped. It runs before the database connection is established and before routes and permissions are registered.

Use `register()` to:
- Register [permissions](/cms/features/users-permissions) for your plugin
- Register the server side of [custom fields](/cms/features/custom-fields#registering-a-custom-field-on-the-server)
- Register database migrations
- Register server middlewares on the Strapi HTTP server (e.g. `strapi.server.use(...)`)
- Extend another plugin's content-types or interface before bootstrap

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/register.js"
'use strict';

module.exports = ({ strapi }) => {
  // Register a custom permission action for this plugin
  strapi.contentAPI.permissions.registerDefaultActions('plugin::my-plugin', [
    'find',
    'findOne',
    'create',
  ]);
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/plugins/my-plugin/server/src/register.ts"
import type { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => {
  // Register a custom permission action for this plugin
  strapi.contentAPI.permissions.registerDefaultActions('plugin::my-plugin', [
    'find',
    'findOne',
    'create',
  ]);
};
```

</TabItem>
</Tabs>

## bootstrap() {#bootstrap}

**Type:** `Function`

`bootstrap()` is called during phase 4, after all plugins have registered and after the database, routing, and permissions systems are initialized. The full `strapi` object is available, including services, content-types, and the Document Service API.

Use `bootstrap()` to:
- Seed the database with initial data
- Register cron jobs
- Subscribe to database lifecycle events
- Call services from your plugin or other plugins
- Set up cross-plugin integrations that require other plugins to be registered first

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/bootstrap.js"
'use strict';

module.exports = async ({ strapi }) => {
  // Seed a default configuration entry if none exists
  const existing = await strapi
    .documents('plugin::my-plugin.config')
    .findFirst();

  if (!existing) {
    await strapi.documents('plugin::my-plugin.config').create({
      data: { enabled: true, maxItems: 10 },
    });
  }
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/plugins/my-plugin/server/src/bootstrap.ts"
import type { Core } from '@strapi/strapi';

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  // Seed a default configuration entry if none exists
  const existing = await strapi
    .documents('plugin::my-plugin.config')
    .findFirst();

  if (!existing) {
    await strapi.documents('plugin::my-plugin.config').create({
      data: { enabled: true, maxItems: 10 },
    });
  }
};
```

</TabItem>
</Tabs>

## destroy() {#destroy}

**Type:** `Function`

`destroy()` is called during phase 6, when the Strapi instance is shutting down. It is optional — only implement it when your plugin holds resources that need explicit cleanup.

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

:::caution Once-only guard
Each lifecycle function is guarded by Strapi's module system and can only be called once per plugin instance. Calling it a second time throws an explicit error (e.g. `Register for plugin::my-plugin has already been called`). You will not encounter this under normal operation, but it can appear in tests or custom bootstrapping scripts that instantiate Strapi more than once.
:::

## Best practices

- **Keep `register()` synchronous when possible.** The registration phase runs across all modules in sequence. Slow async work in `register()` delays the entire startup. Move async initialization to `bootstrap()`.

- **Use `bootstrap()` for anything that reads or writes data.** The database is not available in `register()`. Any call to `strapi.documents()` or a service that queries the DB belongs in `bootstrap()`.

- **Always pair resource creation with `destroy()`.** If your plugin opens a connection, registers a global interval, or attaches a process listener in `bootstrap()`, implement `destroy()` to tear it down. This prevents resource leaks during testing and graceful restarts.

- **Avoid hard dependencies between plugins in `register()`.** At registration time, the order in which other plugins have registered is not guaranteed. Cross-plugin calls that rely on another plugin being initialized belong in `bootstrap()`.

- **Prefer services over inline logic.** Move non-trivial bootstrap logic into a dedicated service method (e.g. `strapi.plugin('my-plugin').service('setup').initialize()`). This keeps lifecycle files readable and the logic testable.