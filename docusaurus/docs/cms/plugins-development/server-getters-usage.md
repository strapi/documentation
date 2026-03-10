---
title: Server getters & usage
displayed_sidebar: cmsSidebar
toc_max_heading_level: 4
pagination_prev: cms/plugins-development/server-policies-middlewares
pagination_next: cms/plugins-development/guides/pass-data-from-server-to-admin
description: Access and reuse plugin controllers, services, policies, and other server resources using top-level and global getters.
tags:
  - plugin APIs
  - plugins development
  - backend customization
---

import Prerequisite from '/docs/snippets/plugins-development-create-plugin-prerequisite-server.md'

# Server API: Getters & usage

<Tldr>
Access plugin resources through top-level getters (`strapi.plugin('my-plugin').service('name')`) or global getters (`strapi.service('plugin::my-plugin.name')`). Both return the same object. Use top-level getters inside your own plugin, and global getters from application code or other plugins. Routes have no global getter equivalent. Configuration uses dedicated config APIs.
</Tldr>

Plugin server resources — controllers, services, policies, middlewares, content-types, configuration, and routes — are accessible from any server-side location through the `strapi` instance: other plugins, lifecycle hooks, application controllers, or custom scripts.

<Prerequisite />

## Getter styles

Strapi exposes two styles for accessing plugin resources. Both return the same underlying object — the difference is purely syntactic.

**Top-level getters** chain through the plugin name:

```js
strapi.plugin('plugin-name').service('service-name')
strapi.plugin('plugin-name').controller('controller-name')
```

**Global getters** use the full UID directly on the `strapi` instance:

```js
strapi.service('plugin::plugin-name.service-name')
strapi.controller('plugin::plugin-name.controller-name')
```

The choice is a matter of context and readability:

- Inside your own plugin, top-level getters are more concise and make the plugin boundary explicit.
- From application code or another plugin, global getters read more naturally alongside `api::` UIDs.

2 resources are exceptions:
- routes (`strapi.plugin('plugin-name').routes`) have no global getter equivalent,
- and configuration uses dedicated config APIs (`strapi.plugin('plugin-name').config()` and `strapi.config.get(...)`) rather than resource getters.

## Full getter reference

The following table lists all available getters for a plugin named `todo` with a resource named `task`:

| Resource | Top-level getter | Global getter | Both return | Typical use case |
| --- | --- | --- | --- | --- |
| Service | `strapi.plugin('todo').service('task')` | `strapi.service('plugin::todo.task')` | The same object | Business logic from controllers, hooks, or other services |
| Controller | `strapi.plugin('todo').controller('task')` | `strapi.controller('plugin::todo.task')` | The same object | Invoke a controller action programmatically (rare outside tests) |
| Content-type | `strapi.plugin('todo').contentType('task')` | `strapi.contentType('plugin::todo.task')` | The same object | Access the content-type schema, e.g. to pass to `strapi.contentAPI.sanitize` |
| Policy | `strapi.plugin('todo').policy('is-owner')` | `strapi.policy('plugin::todo.is-owner')` | The same object | Share an authorization check across routes or reference it in another plugin's route config |
| Middleware | `strapi.plugin('todo').middleware('audit-log')` | `strapi.middleware('plugin::todo.audit-log')` | The same object | Reference a registered middleware in a route config or apply it with `strapi.server.use()` |
| Routes | `strapi.plugin('todo').routes` | — | — | Inspect registered route definitions (no global getter equivalent) |
| Configuration | `strapi.plugin('todo').config('featureFlag')` | `strapi.config.get('plugin::todo.featureFlag')` | The same value | Read a specific plugin config key at runtime (different APIs, same result) |

:::tip
Run `yarn strapi console` or `npm run strapi console` to inspect the `strapi` object in a live console and explore available plugins and their resources interactively.
:::

## Usage examples

### Calling a plugin service from a controller

The most common pattern: a controller delegates to its own plugin's service.

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/plugins/todo/server/src/controllers/task.js"
'use strict';

module.exports = ({ strapi }) => ({
  async find(ctx) {
    // highlight-next-line
    const tasks = await strapi.plugin('todo').service('task').findAll(); // top-level getter: preferred inside your own plugin
    ctx.body = tasks;
  },

  async create(ctx) {
    const task = await strapi
      .plugin('todo')
      .service('task')
      .create(ctx.request.body);
    ctx.status = 201;
    ctx.body = task;
  },
});
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/plugins/todo/server/src/controllers/task.ts"
import type { Context } from 'koa';
import type { Core } from '@strapi/strapi';

type TaskService = {
  findAll(): Promise<unknown[]>;
  create(data: unknown): Promise<unknown>;
};

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async find(ctx: Context) {
    // Narrow cast: plugin services require app-level type augmentation for full typing.
    const tasks = await (strapi.plugin('todo').service('task') as TaskService).findAll();
    ctx.body = tasks;
  },

  async create(ctx: Context) {
    const task = await (strapi.plugin('todo').service('task') as TaskService).create(
      (ctx.request as any).body
    );
    (ctx as any).status = 201;
    ctx.body = task;
  },
});
```

</TabItem>
</Tabs>

### Calling a plugin service from bootstrap

Services called in `bootstrap()` have access to the full `strapi` instance, including other plugins' services.

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/plugins/todo/server/src/bootstrap.js"
'use strict';

module.exports = async ({ strapi }) => {
  // Call own plugin service to seed initial data
  const count = await strapi.plugin('todo').service('task').count();

  if (count === 0) {
    await strapi.plugin('todo').service('task').create({
      title: 'Welcome task',
      done: false,
    });
  }
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/plugins/todo/server/src/bootstrap.ts"
import type { Core } from '@strapi/strapi';

type TaskService = {
  count(): Promise<number>;
  create(data: unknown): Promise<unknown>;
};

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  // Narrow cast: plugin services are resolved dynamically unless your project augments Strapi service typings.
  const taskService = strapi.plugin('todo').service('task') as TaskService;
  // highlight-next-line
  const count = await taskService.count();

  if (count === 0) {
    await taskService.create({ title: 'Welcome task', done: false });
  }
};
```

</TabItem>
</Tabs>

### Calling across plugins or from application code

From application-level controllers or services (outside the plugin), or when calling from another plugin, global getters using the full UID are often clearer:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/api/project/controllers/project.js"
'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::project.project', ({ strapi }) => ({
  async create(ctx) {
    const { data, meta } = await super.create(ctx);

    // highlight-next-line
    await strapi.service('plugin::todo.task').create({ // global getter: preferred in application code
      title: `Review project: ${data.attributes.name}`,
      done: false,
    });

    return { data, meta };
  },
}));
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/api/project/controllers/project.ts"
import { factories } from '@strapi/strapi';

type TaskService = {
  create(data: unknown): Promise<unknown>;
};

export default factories.createCoreController(
  'api::project.project',
  ({ strapi }) => ({
    async create(ctx: any) {
      const { data, meta } = await super.create(ctx);

      // highlight-next-line
      // Narrow cast: this generic documentation cannot infer your app-specific service signatures.
      await (strapi.service('plugin::todo.task') as TaskService).create({
        title: `Review project: ${data.attributes.name}`,
        done: false,
      });

      return { data, meta };
    },
  })
);
```

</TabItem>
</Tabs>

### Reading plugin configuration at runtime

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js
// highlight-start
const maxItems = strapi.plugin('todo').config('maxItems');       // read a single key
const todoConfig = strapi.config.get('plugin::todo');            // read the full config object
const endpoint = strapi.config.get('plugin::todo.endpoint');     // read a nested key
// highlight-end
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
const maxItems = strapi.plugin('todo').config('maxItems') as number;
const todoConfig = strapi.config.get('plugin::todo') as Record<string, unknown>;
const endpoint = strapi.config.get('plugin::todo.endpoint') as string;
```

</TabItem>
</Tabs>

:::note
`strapi.plugin('my-plugin').config('key')` reads the merged configuration (user overrides applied on top of plugin defaults). It is the recommended way to read config inside plugin code. See [Server configuration](/cms/plugins-development/server-configuration) for how plugin configuration is declared and merged.
:::

### Accessing a content-type schema

Use the content-type getter when you need the schema object, for example to pass it to the sanitization API:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js
// highlight-next-line
const schema = strapi.contentType('plugin::todo.task'); // access the content-type schema

const sanitizedOutput = await strapi.contentAPI.sanitize.output(
  data,
  schema,
  { auth: ctx.state.auth }
);
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
// highlight-next-line
const schema = strapi.contentType('plugin::todo.task'); // access the content-type schema

const sanitizedOutput = await strapi.contentAPI.sanitize.output(
  data,
  schema,
  { auth: ctx.state.auth }
);
```

</TabItem>
</Tabs>

## Common pitfalls

- **Naming mismatch between route handler and controller key.** If your route declares `handler: 'task.find'`, your controllers index must export a key called `task` and that controller must have a method called `find`. A mismatch throws a runtime error when the route is matched.

- **Misusing the policy context argument.** The first argument to a policy function is a policy context object, not a raw Koa `ctx`. It wraps the request context but exposes a different interface. Naming it `ctx` in your code won't cause an error, but treating it as a Koa context (for example, calling `ctx.body` or `ctx.status`) will not work as expected. Use `policyContext.state` to access auth state, and call `return false` or throw a `PolicyError` to block the request.

- **Calling a service at module load time.** The `strapi` object is not initialized when modules are first loaded. Always call getters inside a function body. Never call them at the top level of a module file.

- **Using an incomplete UID in global getters.** `strapi.service('todo.task')` is not a valid plugin UID. Use the full `plugin::todo.task` form. Without the proper namespace, the service call fails or returns `undefined` at runtime.

| Scope | Example UID |
| --- | --- |
| Plugin service | `plugin::todo.task` |
| API service | `api::project.project` |

## Best practices

- **Prefer top-level getters inside your own plugin.** `strapi.plugin('my-plugin').service('task')` is more readable than the global form when both are inside the same plugin.

- **Use global getters in application code and cross-plugin calls.** When calling from `src/api/` or from another plugin, the full UID `plugin::todo.task` makes the dependency explicit and is easier to search for.

- **Access services in services, not at declaration time.** Avoid capturing service references in closures at module initialization. Always resolve them at call time using the getter, to ensure Strapi is fully loaded.