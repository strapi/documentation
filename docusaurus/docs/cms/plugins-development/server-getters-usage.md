---
title: Server getters & usage
displayed_sidebar: cmsSidebar
toc_max_heading_level: 4
description: Access and reuse plugin controllers, services, policies, and other server resources using top-level and global getters.
tags:
  - plugin APIs
  - plugins development
  - backend customization
---

import Prerequisite from '/docs/snippets/plugins-development-create-plugin-prerequisite-server.md'

# Server API: Getters & usage

<Tldr>
Once your plugin is loaded, access its resources through two getter styles: top-level getters (`strapi.plugin('my-plugin').service('name')`) for explicit plugin-scoped access, or global getters (`strapi.service('plugin::my-plugin.name')`) for direct access by UID. Both return the same resource. Use top-level getters inside your own plugin, and global getters when calling across plugins or from application code.
</Tldr>

Once a plugin is declared and loaded by Strapi, all of its server resources become accessible through the `strapi` instance. You can retrieve controllers, services, policies, middlewares, content-types, configuration, and routes from any location in the server code: other plugins, lifecycle hooks, application controllers, or custom scripts.

<Prerequisite />

## Getter styles

Strapi exposes two equivalent styles for accessing plugin resources.

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

Both return the same object. The choice is a matter of context and readability:

- Inside your own plugin, top-level getters are more concise and make the plugin boundary explicit.
- From application code or another plugin, global getters read more naturally alongside `api::` UIDs.

## Full getter reference

The following table lists all available getters for a plugin named `todo` with a resource named `task`:

| Resource | Top-level getter | Global getter | Typical use case |
| --- | --- | --- | --- |
| Service | `strapi.plugin('todo').service('task')` | `strapi.service('plugin::todo.task')` | Call reusable business logic from a controller, lifecycle hook, or another service |
| Controller | `strapi.plugin('todo').controller('task')` | `strapi.controller('plugin::todo.task')` | Invoke a controller action programmatically (rare outside tests) |
| Content-type | `strapi.plugin('todo').contentType('task')` | `strapi.contentType('plugin::todo.task')` | Access the content-type schema, for example to read field definitions or pass to `strapi.contentAPI.sanitize` |
| Policy | `strapi.plugin('todo').policy('is-owner')` | `strapi.policy('plugin::todo.is-owner')` | Share an authorization check across routes or reference it in another plugin's route config |
| Middleware | `strapi.plugin('todo').middleware('audit-log')` | `strapi.middleware('plugin::todo.audit-log')` | Reference a registered middleware in a route config or apply it with `strapi.server.use()` |
| Configuration | `strapi.plugin('todo').config('featureFlag')` | `strapi.config.get('plugin::todo.featureFlag')` | Read a specific plugin config key at runtime |
| Routes | `strapi.plugin('todo').routes` | — | Inspect registered route definitions (no global getter equivalent) |

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
    // Top-level getter — preferred inside your own plugin
    const tasks = await strapi.plugin('todo').service('task').findAll();
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
import type { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async find(ctx: any) {
    const tasks = await (strapi.plugin('todo').service('task') as any).findAll();
    ctx.body = tasks;
  },

  async create(ctx: any) {
    const task = await (strapi.plugin('todo').service('task') as any).create(
      ctx.request.body
    );
    ctx.status = 201;
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

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  const taskService = strapi.plugin('todo').service('task') as any;
  const count = await taskService.count();

  if (count === 0) {
    await taskService.create({ title: 'Welcome task', done: false });
  }
};
```

</TabItem>
</Tabs>

### Calling a plugin service from application code

From application-level controllers or services (outside the plugin), global getters using the full UID are often clearer:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/api/project/controllers/project.js"
'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::project.project', ({ strapi }) => ({
  async create(ctx) {
    // Create the project
    const { data, meta } = await super.create(ctx);

    // Call the todo plugin service using a global getter
    await strapi.service('plugin::todo.task').create({
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

export default factories.createCoreController(
  'api::project.project',
  ({ strapi }) => ({
    async create(ctx: any) {
      const { data, meta } = await super.create(ctx);

      await (strapi.service('plugin::todo.task') as any).create({
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
// Read a single config key via top-level getter
const maxItems = strapi.plugin('todo').config('maxItems');

// Read the full plugin config object via global getter
const todoConfig = strapi.config.get('plugin::todo');

// Read a nested config key
const endpoint = strapi.config.get('plugin::todo.endpoint');
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
const maxItems = strapi.plugin('todo').config('maxItems') as number;
const todoConfig = strapi.config.get('plugin::todo') as Record<string, unknown>;
```

</TabItem>
</Tabs>

:::note
`strapi.plugin('my-plugin').config('key')` reads the merged configuration (user overrides applied on top of plugin defaults). It is the recommended way to read config inside plugin code. See [Server configuration](/cms/plugins-development/server-configuration) for how plugin configuration is declared and merged.
:::

### Accessing a content-type schema

Use the content-type getter when you need the schema object, for example to pass it to the sanitization API:

```js
const schema = strapi.contentType('plugin::todo.task');

// Pass to contentAPI sanitization
const sanitizedOutput = await strapi.contentAPI.sanitize.output(
  data,
  schema,
  { auth: ctx.state.auth }
);
```

## Common pitfalls

- **Naming mismatch between route handler and controller key.** If your route declares `handler: 'task.find'`, then your controllers index must export a key called `task` and that controller must have a method called `find`. A mismatch throws a runtime error when the route is matched.

- **Using `ctx` instead of `policyContext` in policies.** The first argument to a policy function is `policyContext`, not `ctx`. Using the wrong variable name leads to `undefined` errors when accessing `ctx.state`.

- **Calling a service at module load time.** Do not call `strapi.plugin(...).service(...)` at the top level of a module file. The `strapi` object is not yet initialized when modules are first loaded. Always call getters inside a function body that executes at runtime.

- **Mixing `module.exports` and `export default` in the same plugin.** Each file in a plugin server must be consistently CommonJS or ESM. Mixing the two causes import resolution errors that are hard to debug.

- **Forgetting the `plugin::` prefix in global getters.** `strapi.service('todo.task')` is not the same as `strapi.service('plugin::todo.task')`. The former looks for an API service, the latter for a plugin service. Missing the prefix results in `undefined` or a "not found" error at runtime.

## Best practices

- **Prefer top-level getters inside your own plugin.** `strapi.plugin('my-plugin').service('task')` is more readable than the global form when both are inside the same plugin.

- **Use global getters in application code and cross-plugin calls.** When calling from `src/api/` or from another plugin, the full UID `plugin::todo.task` makes the dependency explicit and is easier to search for.

- **Access services in services, not at declaration time.** Avoid capturing service references in closures at module initialization. Always resolve them at call time using the getter, to ensure Strapi is fully loaded.