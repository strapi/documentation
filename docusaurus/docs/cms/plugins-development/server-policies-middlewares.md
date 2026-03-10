---
title: Server policies & middlewares
sidebar_label: Server policies & middlewares
displayed_sidebar: cmsSidebar
pagination_prev: cms/plugins-development/server-controllers-services
pagination_next: cms/plugins-development/server-getters-usage
toc_max_heading_level: 4
description: Guard plugin routes with policies and intercept requests with middlewares in the Strapi plugin Server API.
tags:
  - plugin APIs
  - policies
  - middlewares
  - plugins development
  - backend customization
---

import Prerequisite from '/docs/snippets/plugins-development-create-plugin-prerequisite-server.md'

# Server API: Policies & middlewares

<Tldr>
Policies run before a controller action and return `true` or `false` to allow or block the request. Middlewares run in sequence around the full request/response cycle and call `next()` to continue. Declare policies and middlewares as objects of factory functions and reference them by their plugin-namespaced name in routes.
</Tldr>

Policies and middlewares are the two mechanisms for intercepting requests in a plugin server. Policies decide whether a request should proceed. Middlewares shape how it is processed.

<Prerequisite />

## Decision guide

Use this table to pick the right mechanism before writing any code:

| Need | Mechanism |
| --- | --- |
| Block a request based on user role or state | Policy |
| Block a request based on request content (body, headers) | Policy or inline policy in route config |
| Add headers to every response for your plugin's routes | [Route-level middleware](#route-level-middlewares) |
| Log or trace every request across the entire server | [Server-level middleware](#server-level-middlewares) (`strapi.server.use()`) |
| Modify `ctx.query` before it reaches the controller | [Route-level middleware](#route-level-middlewares) |
| Share logic between multiple routes | Named [route-level middleware](#route-level-middlewares) (registered and referenced by name) |

## Policies

A policy is a function that runs before the controller action for a given route. It receives the request context, evaluates a condition, and returns `true` to allow the request or `false` (or throws) to block it with a 403 response.

### Declaration

Policies are exported as plain functions (not factory functions). Each policy receives three arguments: `policyContext`, `config`, and `{ strapi }`.

- `policyContext` is a wrapper around the Koa context object. Use it to access `policyContext.state.user`, `policyContext.request`, etc.
- `config` contains the per-route configuration passed when attaching the policy (e.g., `{ name: 'plugin::my-plugin.hasRole', config: { role: 'editor' } }`, where `config` is the per-policy options object).
- `{ strapi }` gives access to the Strapi instance.

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/policies/index.js"
'use strict';

const hasRole = require('./has-role');

module.exports = {
  hasRole,
};
```

```js title="/src/plugins/my-plugin/server/src/policies/has-role.js"
'use strict';

// Allow the request only if the user has the role specified in the route config
// Usage in route: { name: 'plugin::my-plugin.hasRole', config: { role: 'editor' } }
module.exports = (policyContext, config, { strapi }) => {
  // highlight-start
  const { user } = policyContext.state;
  const requiredRole = config.role;
  // highlight-end

  if (!user || !requiredRole) {
    return false;
  }

  return user.roles?.some((role) => role.code === requiredRole) ?? false;
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/plugins/my-plugin/server/src/policies/index.ts"
import hasRole from './has-role';

export default {
  hasRole,
};
```

```ts title="/src/plugins/my-plugin/server/src/policies/has-role.ts"
import type { Core } from '@strapi/strapi';

// Allow the request only if the user has the role specified in the route config
// Usage in route: { name: 'plugin::my-plugin.hasRole', config: { role: 'editor' } }
export default (
  policyContext: Core.PolicyContext,
  config: { role?: string },
  { strapi }: { strapi: Core.Strapi }
) => {
  // highlight-start
  const { user } = policyContext.state;
  const requiredRole = config?.role;
  // highlight-end

  if (!user || !requiredRole) {
    return false;
  }

  return (user as any).roles?.some((role: any) => role.code === requiredRole) ?? false;
};
```

</TabItem>
</Tabs>

### Usage in routes

Once declared, reference a plugin policy from a route using the `plugin::my-plugin.policy-name` namespace:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/routes/index.js"
'use strict';

module.exports = [
  {
    method: 'GET',
    path: '/dashboard',
    handler: 'dashboard.find',
    config: {
      // highlight-next-line
      policies: ['plugin::my-plugin.isActive'], // simple reference by namespaced name
    },
  },
  {
    method: 'DELETE',
    path: '/articles/:id',
    handler: 'article.delete',
    config: {
      // highlight-next-line
      policies: [{ name: 'plugin::my-plugin.hasRole', config: { role: 'editor' } }], // with per-route config
    },
  },
  {
    method: 'GET',
    path: '/public',
    handler: 'article.findAll',
    config: {
      // highlight-next-line
      policies: [(policyContext, config, { strapi }) => true], // inline policy, no registration needed
    },
  },
];
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/plugins/my-plugin/server/src/routes/index.ts"
import type { Core } from '@strapi/strapi';

export default [
  {
    method: 'GET' as const,
    path: '/dashboard',
    handler: 'dashboard.find',
    config: {
      // highlight-next-line
      policies: ['plugin::my-plugin.isActive'], // simple reference by namespaced name
    },
  },
  {
    method: 'DELETE' as const,
    path: '/articles/:id',
    handler: 'article.delete',
    config: {
      // highlight-next-line
      policies: [{ name: 'plugin::my-plugin.hasRole', config: { role: 'editor' } }], // with per-route config
    },
  },
  {
    method: 'GET' as const,
    path: '/public',
    handler: 'article.findAll',
    config: {
      // highlight-next-line
      policies: [(policyContext: Core.PolicyContext, config: unknown, { strapi }: { strapi: Core.Strapi }) => true], // inline policy, no registration needed
    },
  },
];
```

</TabItem>
</Tabs>

:::caution Policy return values
Returning `false` causes Strapi to send a `403 Forbidden` response. Returning nothing (`undefined`) is also treated as `false` and blocks the request. Always return explicitly. Throwing an error causes Strapi to send a `500` response unless you throw a Strapi HTTP error (e.g., `throw new ApplicationError('Not allowed', { status: 401 })`).
:::

:::strapi Backend customization
For the full policy reference including GraphQL support and the `policyContext` API, see [Policies](/cms/backend-customization/policies).
:::

## Middlewares

A middleware is a Koa-style function that wraps the request/response cycle. Unlike policies (which are pass/fail guards), middlewares can read and modify the request before it reaches the controller, and modify the response after the controller has executed.

Plugins can export middlewares in two ways:

- as a **route-level middleware**, declared in the `middlewares` export of the server entry file and referenced in route `config.middlewares`
- as a **server-level middleware**, registered directly on the Strapi HTTP server via `strapi.server.use()` in `register()`

### Route-level middlewares

Route-level middlewares are scoped to a specific route and are declared like policies: as an object of named factory functions, then referenced in the route config.

Note the two-level signature: the outer function receives `(config, { strapi })` and returns the actual Koa middleware `async (ctx, next) => {}`. This allows Strapi to pass per-route configuration to the function.

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/middlewares/index.js"
'use strict';

const logRequest = require('./log-request');

module.exports = {
  logRequest,
};
```

```js title="/src/plugins/my-plugin/server/src/middlewares/log-request.js"
'use strict';

module.exports = (config, { strapi }) => async (ctx, next) => {
  // highlight-start
  strapi.log.info(`[my-plugin] ${ctx.method} ${ctx.url}`);
  await next();
  strapi.log.info(`[my-plugin] → ${ctx.status}`);
  // highlight-end
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/plugins/my-plugin/server/src/middlewares/index.ts"
import logRequest from './log-request';

export default {
  logRequest,
};
```

```ts title="/src/plugins/my-plugin/server/src/middlewares/log-request.ts"
import type { Core } from '@strapi/strapi';

export default (config: unknown, { strapi }: { strapi: Core.Strapi }) =>
  async (ctx: any, next: () => Promise<void>) => {
    // highlight-start
    strapi.log.info(`[my-plugin] ${ctx.method} ${ctx.url}`);
    await next();
    strapi.log.info(`[my-plugin] → ${ctx.status}`);
    // highlight-end
  };
```

</TabItem>
</Tabs>

Reference a route-level middleware in a route using the same `plugin::my-plugin.middleware-name` namespace as policies:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/routes/index.js"
'use strict';

module.exports = [
  {
    method: 'POST',
    path: '/articles',
    handler: 'article.create',
    config: {
      // highlight-next-line
      middlewares: ['plugin::my-plugin.logRequest'],
    },
  },
  {
    method: 'GET',
    path: '/articles',
    handler: 'article.find',
    config: {
      middlewares: [
        // highlight-next-line
        async (ctx, next) => { // inline middleware, no registration needed
          ctx.query.pageSize = ctx.query.pageSize || '10';
          await next();
        },
      ],
    },
  },
];
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/plugins/my-plugin/server/src/routes/index.ts"
export default [
  {
    method: 'POST' as const,
    path: '/articles',
    handler: 'article.create',
    config: {
      // highlight-next-line
      middlewares: ['plugin::my-plugin.logRequest'],
    },
  },
  {
    method: 'GET' as const,
    path: '/articles',
    handler: 'article.find',
    config: {
      middlewares: [
        // highlight-next-line
        async (ctx: any, next: () => Promise<void>) => { // inline middleware, no registration needed
          ctx.query.pageSize = ctx.query.pageSize || '10';
          await next();
        },
      ],
    },
  },
];
```

</TabItem>
</Tabs>

### Server-level middlewares

A server-level middleware is registered on the Strapi HTTP server directly and runs for every request, not just plugin routes. Register it in `register()` using `strapi.server.use()`:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/register.js"
'use strict';

module.exports = ({ strapi }) => {
  // highlight-start
  // Applied to ALL incoming requests on the Strapi server
  strapi.server.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
  });
  // highlight-end
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/plugins/my-plugin/server/src/register.ts"
import type { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => {
  // highlight-start
  // Applied to ALL incoming requests on the Strapi server
  strapi.server.use(async (ctx: any, next: () => Promise<void>) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
  });
  // highlight-end
};
```

</TabItem>
</Tabs>

:::caution
Server-level middlewares affect all routes across all plugins and the application itself, not just your plugin's routes. A server-level middleware that throws or never calls `next()` will break every request on the server, not just your plugin's endpoints. Use route-level middlewares when the concern is specific to your plugin's endpoints.
:::

:::strapi Backend customization
For the full middleware reference, see [Middlewares](/cms/backend-customization/middlewares).
:::

## Best practices

- **Use `policyContext`, not `ctx`, in policies.** The first argument to a policy is `policyContext`, a wrapper around the Koa context. Using it correctly ensures the policy works for both REST and GraphQL resolvers.

- **Return explicitly from policies.** A policy that returns `undefined` is treated as `false` and blocks the request. Always return `true` to allow or `false` to deny. Never return nothing implicitly.

- **Prefer route-level middlewares over server-level.** Server-level middlewares run on every request in the entire Strapi server. Scope middleware to plugin routes unless the behavior genuinely applies to all traffic.

- **Always call `await next()` in middlewares.** Forgetting `next()` means the request chain is interrupted and the controller never executes, resulting in a hanging request with no response.

- **Use `config` for reusable policies.** When the same policy logic needs different parameters per route (e.g., a required role name), receive those parameters via the `config` argument and pass them from the route's `{ name, config }` object. This avoids duplicating similar policies.