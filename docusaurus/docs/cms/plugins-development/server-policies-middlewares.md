---
title: Server policies & middlewares
displayed_sidebar: cmsSidebar
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

## Policies {#policies}

A policy is a function that runs before the controller action for a given route. It receives the request context, evaluates a condition, and returns `true` to allow the request or `false` (or throws) to block it with a 403 response.

### Declaration

Policies are exported as plain functions (not factory functions). Each policy receives three arguments: `policyContext`, `config`, and `{ strapi }`.

- `policyContext` is a wrapper around the Koa context object. Use it to access `policyContext.state.user`, `policyContext.request`, etc.
- `config` contains the per-route configuration passed when attaching the policy (e.g., `{ name: 'my-policy', config: { role: 'admin' } }`).
- `{ strapi }` gives access to the Strapi instance.

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/policies/index.js"
'use strict';

const isActive = require('./is-active');
const hasRole = require('./has-role');

module.exports = {
  isActive,
  hasRole,
};
```

```js title="/src/plugins/my-plugin/server/src/policies/is-active.js"
'use strict';

// Allow the request only if the authenticated user has isActive: true
module.exports = (policyContext, config, { strapi }) => {
  const { user } = policyContext.state;

  if (user && user.isActive) {
    return true;
  }

  return false;
};
```

```js title="/src/plugins/my-plugin/server/src/policies/has-role.js"
'use strict';

// Allow the request only if the user has the role specified in the route config
module.exports = (policyContext, config, { strapi }) => {
  const { user } = policyContext.state;
  const requiredRole = config.role;

  if (!user || !requiredRole) {
    return false;
  }

  return user.roles?.some((role) => role.code === requiredRole) ?? false;
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/plugins/my-plugin/server/src/policies/index.ts"
import isActive from './is-active';
import hasRole from './has-role';

export default {
  isActive,
  hasRole,
};
```

```ts title="/src/plugins/my-plugin/server/src/policies/is-active.ts"
// Allow the request only if the authenticated user has isActive: true
export default (policyContext: any, config: any, { strapi }: any) => {
  const { user } = policyContext.state;

  if (user && user.isActive) {
    return true;
  }

  return false;
};
```

```ts title="/src/plugins/my-plugin/server/src/policies/has-role.ts"
// Allow the request only if the user has the role specified in the route config
export default (policyContext: any, config: any, { strapi }: any) => {
  const { user } = policyContext.state;
  const requiredRole = config?.role;

  if (!user || !requiredRole) {
    return false;
  }

  return user.roles?.some((role: any) => role.code === requiredRole) ?? false;
};
```

</TabItem>
</Tabs>

### Referencing policies in routes

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
      // Simple reference by namespaced name
      policies: ['plugin::my-plugin.isActive'],
    },
  },
  {
    method: 'DELETE',
    path: '/articles/:id',
    handler: 'article.delete',
    config: {
      // Reference with per-route config object
      policies: [{ name: 'plugin::my-plugin.hasRole', config: { role: 'editor' } }],
    },
  },
  {
    method: 'GET',
    path: '/public',
    handler: 'article.findAll',
    config: {
      // Inline policy (no registration needed)
      policies: [
        (policyContext, config, { strapi }) => {
          return true;
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
    method: 'GET' as const,
    path: '/dashboard',
    handler: 'dashboard.find',
    config: {
      policies: ['plugin::my-plugin.isActive'],
    },
  },
  {
    method: 'DELETE' as const,
    path: '/articles/:id',
    handler: 'article.delete',
    config: {
      policies: [{ name: 'plugin::my-plugin.hasRole', config: { role: 'editor' } }],
    },
  },
];
```

</TabItem>
</Tabs>

:::note Policy return values
Returning `false` causes Strapi to send a `403 Forbidden` response. Returning nothing (`undefined`) is treated as `false`. Throwing an error causes Strapi to send a `500` response unless you throw a Strapi HTTP error (e.g., `throw new ApplicationError('Not allowed', { status: 401 })`).
:::

:::strapi Backend customization
For the full policy reference including GraphQL support and the `policyContext` API, see [Policies](/cms/backend-customization/policies).
:::

## Middlewares {#middlewares}

A middleware is a Koa-style function that wraps the request/response cycle. Unlike policies (which are pass/fail guards), middlewares can read and modify the request before it reaches the controller, and modify the response after the controller has executed.

Plugins can export middlewares in two ways:

- as a **route-level middleware**, declared in the `middlewares` export of the server entry file and referenced in route `config.middlewares`
- as a **server-level middleware**, registered directly on the Strapi HTTP server via `strapi.server.use()` in `register()`

### Route-level middlewares

Route-level middlewares are scoped to a specific route and are declared like policies: as an object of named factory functions, then referenced in the route config.

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/middlewares/index.js"
'use strict';

const logRequest = require('./log-request');
const setCorrelationId = require('./set-correlation-id');

module.exports = {
  logRequest,
  setCorrelationId,
};
```

```js title="/src/plugins/my-plugin/server/src/middlewares/log-request.js"
'use strict';

module.exports = (config, { strapi }) => async (ctx, next) => {
  strapi.log.info(`[my-plugin] ${ctx.method} ${ctx.url}`);
  await next();
  strapi.log.info(`[my-plugin] → ${ctx.status}`);
};
```

```js title="/src/plugins/my-plugin/server/src/middlewares/set-correlation-id.js"
'use strict';

const { randomUUID } = require('crypto');

module.exports = (config, { strapi }) => async (ctx, next) => {
  ctx.state.correlationId = ctx.headers['x-correlation-id'] || randomUUID();
  ctx.set('X-Correlation-Id', ctx.state.correlationId);
  await next();
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/plugins/my-plugin/server/src/middlewares/index.ts"
import logRequest from './log-request';
import setCorrelationId from './set-correlation-id';

export default {
  logRequest,
  setCorrelationId,
};
```

```ts title="/src/plugins/my-plugin/server/src/middlewares/log-request.ts"
import type { Core } from '@strapi/strapi';

export default (config: unknown, { strapi }: { strapi: Core.Strapi }) =>
  async (ctx: any, next: () => Promise<void>) => {
    strapi.log.info(`[my-plugin] ${ctx.method} ${ctx.url}`);
    await next();
    strapi.log.info(`[my-plugin] → ${ctx.status}`);
  };
```

```ts title="/src/plugins/my-plugin/server/src/middlewares/set-correlation-id.ts"
import { randomUUID } from 'crypto';
import type { Core } from '@strapi/strapi';

export default (config: unknown, { strapi }: { strapi: Core.Strapi }) =>
  async (ctx: any, next: () => Promise<void>) => {
    ctx.state.correlationId = ctx.headers['x-correlation-id'] || randomUUID();
    ctx.set('X-Correlation-Id', ctx.state.correlationId);
    await next();
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
      middlewares: ['plugin::my-plugin.logRequest'],
    },
  },
  {
    method: 'GET',
    path: '/articles',
    handler: 'article.find',
    config: {
      // Inline middleware (no registration needed)
      middlewares: [
        async (ctx, next) => {
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
      middlewares: ['plugin::my-plugin.logRequest'],
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
  // Applied to all incoming requests on the Strapi server
  strapi.server.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
  });
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/plugins/my-plugin/server/src/register.ts"
import type { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => {
  // Applied to all incoming requests on the Strapi server
  strapi.server.use(async (ctx: any, next: () => Promise<void>) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
  });
};
```

</TabItem>
</Tabs>

:::caution
Server-level middlewares affect all routes across all plugins and the application itself, not just your plugin's routes. Use route-level middlewares when the concern is specific to your plugin's endpoints.
:::

:::strapi Backend customization
For the full middleware reference, see [Middlewares](/cms/backend-customization/middlewares).
:::

## Decision guide

| Need | Mechanism |
| --- | --- |
| Block a request based on user role or state | Policy |
| Block a request based on request content (body, headers) | Policy or inline policy in route config |
| Add headers to every response for your plugin's routes | Route-level middleware |
| Log or trace every request across the entire server | Server-level middleware (`strapi.server.use()`) |
| Modify `ctx.query` before it reaches the controller | Route-level middleware |
| Share logic between multiple routes | Named route-level middleware (registered and referenced by name) |

## Best practices

- **Use `policyContext`, not `ctx`, in policies.** The first argument to a policy is `policyContext`, a wrapper around the Koa context. Using it correctly ensures your policy works for both REST and GraphQL resolvers.

- **Return explicitly from policies.** A policy that returns `undefined` is treated as `false` and blocks the request. Always return `true` to allow or `false` to deny. Never return nothing implicitly.

- **Prefer route-level middlewares over server-level.** Server-level middlewares run on every request in the entire Strapi server. Scope middleware to your routes unless the behavior genuinely applies to all traffic.

- **Always call `await next()` in middlewares.** Forgetting `next()` means the request chain is interrupted and the controller never executes, resulting in a hanging request with no response.

- **Use `config` for reusable policies.** When the same policy logic needs different parameters per route (e.g., a required role name), receive those parameters via the `config` argument and pass them from the route's `{ name, config }` object. This avoids duplicating similar policies.