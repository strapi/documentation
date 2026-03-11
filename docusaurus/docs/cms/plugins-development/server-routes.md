---
title: Server routes
displayed_sidebar: cmsSidebar
toc_max_heading_level: 4
pagination_prev: cms/plugins-development/server-content-types
pagination_next: cms/plugins-development/server-controllers-services
description: Expose plugin endpoints as Content API or admin routes, with full control over auth, policies, and route configuration.
tags:
  - plugin APIs
  - server API
  - routes
  - plugins development
  - backend customization
---

import Prerequisite from '/docs/snippets/plugins-development-create-plugin-prerequisite-server.md'

# Server API: Routes

<Tldr>
The Server API exports a `routes` value from the server entry file to expose plugin endpoints. Use the array format only for implicit admin routes, the named router format to separate admin and Content API routes, or the factory callback format for dynamic route configuration.
</Tldr>

Routes expose your plugin's HTTP endpoints and map incoming requests to controller actions. They are exported from the [server entry file](/cms/plugins-development/server-api#entry-file) as a `routes` value.

<Prerequisite />

## Route declaration formats

:::tip Which format should I use?

- **[Array format](#array-format):** Simple plugins that only need admin routes with default registration behavior
- **[Named router format](#named-router-format):** Plugins that expose both admin and Content API routes, or need explicit type control. **Recommended for most cases.**
- **[Factory callback format](#factory-callback-format):** Advanced cases where route config depends on the `strapi` instance (e.g., reading plugin configuration).
:::

### Array format

The array format is the most basic format: it exports an array of route objects directly. Strapi registers these objects as admin routes by default, with the plugin name as prefix.

:::tip
To expose Content API routes, use the [named router format](#named-router-format) with `type: 'content-api'`.
:::

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/routes/index.js"
'use strict';

module.exports = [
  {
    method: 'GET',
    path: '/articles',
    handler: 'article.find',
    config: {
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/articles',
    handler: 'article.create',
    config: {
      policies: [],
    },
  },
];
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/plugins/my-plugin/server/src/routes/index.ts"
export default [
  {
    method: 'GET',
    path: '/articles',
    handler: 'article.find',
    config: {
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/articles',
    handler: 'article.create',
    config: {
      policies: [],
    },
  },
];
```

</TabItem>
</Tabs>

### Named router format

With the named router format, use an object with named keys (`admin`, `content-api`, or any custom name) to declare separate router groups. Each group is a router object with a `type`, optional `prefix`, and a `routes` array. Use this format when your plugin exposes both admin and Content API routes.

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/routes/index.js"
'use strict';

const adminRoutes = require('./admin');
const contentApiRoutes = require('./content-api');

module.exports = {
  // highlight-start
  admin: adminRoutes,
  'content-api': contentApiRoutes,
  // highlight-end
};
```

```js title="/src/plugins/my-plugin/server/src/routes/admin/index.js"
'use strict';

module.exports = {
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/articles',
      handler: 'article.find',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
  ],
};
```

```js title="/src/plugins/my-plugin/server/src/routes/content-api/index.js"
'use strict';

module.exports = {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/articles',
      handler: 'article.find',
      config: {
        policies: [],
      },
    },
  ],
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/plugins/my-plugin/server/src/routes/index.ts"
import adminRoutes from './admin';
import contentApiRoutes from './content-api';

export default {
  // highlight-start
  admin: adminRoutes,
  'content-api': contentApiRoutes,
  // highlight-end
};
```

```ts title="/src/plugins/my-plugin/server/src/routes/admin/index.ts"
export default {
  type: 'admin' as const,
  routes: [
    {
      method: 'GET' as const,
      path: '/articles',
      handler: 'article.find',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
  ],
};
```

```ts title="/src/plugins/my-plugin/server/src/routes/content-api/index.ts"
export default {
  type: 'content-api' as const,
  routes: [
    {
      method: 'GET' as const,
      path: '/articles',
      handler: 'article.find',
      config: {
        policies: [],
      },
    },
  ],
};
```

</TabItem>
</Tabs>

### Factory callback format

For advanced cases where you need access to the `strapi` instance at route configuration time (for example, to build dynamic paths or conditionally include routes based on configuration), you can export a factory callback.

:::note
The factory callback must be attached to a named route entry (such as `admin` or `content-api`), not exported as the root of `routes/index`.

`module.exports = ({ strapi }) => ({ ... })` at the root level is not a valid format.
:::

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/routes/index.js"
'use strict';

module.exports = {
  'content-api': ({ strapi }) => ({
    type: 'content-api',
    routes: [
      {
        method: 'GET',
        path: '/articles',
        handler: 'article.find',
        config: {
          // highlight-next-line
          auth: strapi.plugin('my-plugin').config('publicRead') ? false : {},
        },
      },
    ],
  }),
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/plugins/my-plugin/server/src/routes/index.ts"
import type { Core } from '@strapi/strapi';

const routes: Record<
  string,
  Core.RouterConfig | ((args: { strapi: Core.Strapi }) => Core.RouterConfig)
> = {
  'content-api': ({ strapi }) => ({
    type: 'content-api',
    routes: [
      {
        method: 'GET',
        path: '/articles',
        handler: 'article.find',
        config: {
          // highlight-next-line
          auth: strapi.plugin('my-plugin').config('publicRead') ? false : {},
        },
      },
    ],
  }),
};

export default routes;
```

</TabItem>
</Tabs>

For details on what Strapi adds automatically at registration time, see [Defaults applied by Strapi](#defaults-applied-by-strapi).

## Defaults applied by Strapi

When Strapi registers plugin routes, it applies the following defaults automatically:

| Property | Default value | Notes |
| --- | --- | --- |
| `type` | `'admin'` | Applied when using the array format, or when `type` is omitted from a router object in the named format |
| `prefix` | `'/<plugin-name>'` | Applied when using the array format, or when `prefix` is omitted from a router object |
| `config.auth.scope` | `['plugin::<plugin-name>.<handler>']` | Auto-generated for string handlers only, using `defaultsDeep` so existing values are not overwritten |

The following 2 declarations are equivalent. Strapi applies the defaults from the table above automatically:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="Implicit (array format, defaults applied by Strapi)"
module.exports = [
  {
    method: 'GET',
    path: '/articles',
    handler: 'article.find',
  },
];
```

```js title="Equivalent explicit declaration (named router format)"
module.exports = {
  admin: {
    type: 'admin',
    prefix: '/my-plugin',
    routes: [
      {
        method: 'GET',
        path: '/articles',
        handler: 'article.find',
        config: {
          auth: {
            // highlight-next-line
            scope: ['plugin::my-plugin.article.find'], // auto-generated from handler string
          },
        },
      },
    ],
  },
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="Implicit (array format, defaults applied by Strapi)"
export default [
  {
    method: 'GET' as const,
    path: '/articles',
    handler: 'article.find',
  },
];
```

```ts title="Equivalent explicit declaration (named router format)"
export default {
  admin: {
    type: 'admin' as const,
    prefix: '/my-plugin',
    routes: [
      {
        method: 'GET' as const,
        path: '/articles',
        handler: 'article.find',
        config: {
          auth: {
            // highlight-next-line
            scope: ['plugin::my-plugin.article.find'], // auto-generated from handler string
          },
        },
      },
    ],
  },
};
```

</TabItem>
</Tabs>

## Route configuration reference

Each route accepts an optional `config` object with the following properties:

### `policies`

**Type:** `Array<string | PolicyHandler | { name: string; options?: object }>`

Policies to run before the controller action. Each item is either a policy name string, an inline function, or an object with required `name` and optional `options`.

The `options` object is passed as-is to the policy function's second argument (`config` in policy signatures). The shape of this object depends on the policy.

Plugin policies are referenced as `plugin::my-plugin.policy-name`.

### `middlewares`

**Type:** `Array<string | MiddlewareHandler | { name: string; options?: object }>`

Middlewares to apply to this route. Each item is a middleware name string, an inline function, or an object with:

- `name`: a registered middleware name,
- `options` (optional): middleware options.

:::note Route middlewares vs. global server middlewares
At route validation time, Strapi validates middleware/policy objects against `{ name: string; options?: object }` (see `services/server/routing.ts`).

The middleware resolver (`services/server/middleware.ts`) still contains runtime support for `{ resolve, config }` objects, but this shape is rejected by route validation before resolution for standard plugin route declarations.

Use `{ name, options }` in route configs for compatibility with validation.
:::

### `auth`

**Type:** `false | { scope: string[]; strategies?: string[] }`

Set to `false` to make the route public. Pass an object to define the auth scope and, optionally, custom auth strategies.

At runtime, `scope` must be present when `auth` is an object.

:::note
For **string handlers** (for example, `handler: 'article.find'`), Strapi auto-injects a default `config.auth.scope` value, so patterns such as `auth: {}` can still work.

For **non-string handlers** (inline functions), do not assume auto-scope injection. Define `config.auth.scope` explicitly when `auth` is an object.
:::

:::caution
Setting `auth: false` on an admin route is almost never intentional: it exposes the endpoint to unauthenticated requests.
:::

:::strapi General backend customization examples
For configuration examples including policies, public routes, dynamic URL parameters, and regular expressions in paths, see [Routes](/cms/backend-customization/routes).
:::

## Best practices

- **Use the named router format when exposing both admin and Content API endpoints.** It makes the intent of each route explicit and avoids relying on the `type` default, which can be surprising.

- **Keep `handler` as a string.** String handlers get automatic auth scope generation, function handlers do not. Authentication still runs for both string and function handlers unless you set `config.auth: false`, but only string handlers get automatic `config.auth.scope`. If you use a function handler and need route-level permission scoping, define `config.auth.scope` explicitly.

- **Scope policies to their namespace.** When referencing a plugin policy in a route, use the full `plugin::my-plugin.policy-name` form. This avoids ambiguity if a policy with the same short name exists elsewhere in the application.

- **Do not disable auth on admin routes.** Admin routes default to requiring admin authentication. Disabling auth on an admin route exposes it to unauthenticated requests, which is almost never intentional.

- **Group related routes in dedicated files.** As the plugin grows, a single route index file becomes hard to navigate. Split by resource (e.g., `routes/article.js`, `routes/comment.js`) and re-export from `routes/index.js`.

