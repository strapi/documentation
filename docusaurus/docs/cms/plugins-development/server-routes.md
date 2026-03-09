---
title: Server routes
displayed_sidebar: cmsSidebar
toc_max_heading_level: 4
pagination_prev: cms/plugins-development/server-configuration
pagination_next: cms/plugins-development/server-controllers-services
description: Expose plugin endpoints as Content API or admin routes, with full control over auth, policies, and route configuration.
tags:
  - plugin APIs
  - routes
  - plugins development
  - backend customization
---

import Prerequisite from '/docs/snippets/plugins-development-create-plugin-prerequisite-server.md'

# Server API: Routes

<Tldr>
Export a `routes` value from the server entry file to expose plugin endpoints. Use the array format for simple cases, the named router format to separate admin and Content API routes, or the factory callback format for dynamic route configuration. Strapi applies defaults at registration time: `type` defaults to `admin`, `prefix` to `/<plugin-name>`, and auth scope is auto-generated for string handlers.
</Tldr>

Routes expose your plugin's HTTP endpoints and map incoming requests to controller actions. They are exported from the [server entry file](/cms/plugins-development/server-api#entry-file) as a `routes` value.

<Prerequisite />

## Route declaration formats

Plugin routes accept three different formats. Choose the one that fits your use case.

### Array format

The simplest format: export an array of route objects directly. Strapi registers these as admin routes with the plugin name as prefix.

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

Use an object with named keys (`admin`, `content-api`, or any custom name) to declare separate router groups. Each group is a router object with a `type`, optional `prefix`, and a `routes` array. This is the recommended format when your plugin exposes both admin and Content API endpoints with different policies.

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/routes/index.js"
'use strict';

const adminRoutes = require('./admin');
const contentApiRoutes = require('./content-api');

module.exports = {
  admin: adminRoutes,
  'content-api': contentApiRoutes,
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
  admin: adminRoutes,
  'content-api': contentApiRoutes,
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

For advanced cases where you need access to the `strapi` instance at route configuration time (for example, to build dynamic paths or conditionally include routes based on config), export a function that receives `{ strapi }` and returns a router object.

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/routes/index.js"
'use strict';

module.exports = ({ strapi }) => ({
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/articles',
      handler: 'article.find',
      config: {
        auth: strapi.plugin('my-plugin').config('publicRead') ? false : {},
      },
    },
  ],
});
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/plugins/my-plugin/server/src/routes/index.ts"
import type { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  type: 'content-api' as const,
  routes: [
    {
      method: 'GET' as const,
      path: '/articles',
      handler: 'article.find',
      config: {
        auth: strapi.plugin('my-plugin').config('publicRead') ? false : {},
      },
    },
  ],
});
```

</TabItem>
</Tabs>

## Defaults applied by Strapi {#defaults}

When Strapi registers plugin routes, it applies the following defaults automatically (source: `packages/core/core/src/services/server/register-routes.ts`):

| Property | Default value | Notes |
| --- | --- | --- |
| `type` | `'admin'` | Applied when using the array format or when `type` is omitted from a router object |
| `prefix` | `'/<plugin-name>'` | Applied when `prefix` is omitted from a router object |
| `config.auth.scope` | `['plugin::<plugin-name>.<handler>']` | Auto-generated for string handlers only, using `defaultsDeep` so existing values are not overwritten |

**Implicit vs. explicit declaration example:**

The following two route declarations are equivalent:

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

```js title="Equivalent explicit declaration"
module.exports = {
  type: 'admin',
  prefix: '/my-plugin',
  routes: [
    {
      method: 'GET',
      path: '/articles',
      handler: 'article.find',
      config: {
        auth: {
          scope: ['plugin::my-plugin.article.find'],
        },
      },
    },
  ],
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

```ts title="Equivalent explicit declaration"
export default {
  type: 'admin' as const,
  prefix: '/my-plugin',
  routes: [
    {
      method: 'GET' as const,
      path: '/articles',
      handler: 'article.find',
      config: {
        auth: {
          scope: ['plugin::my-plugin.article.find'],
        },
      },
    },
  ],
};
```

</TabItem>
</Tabs>

## Route configuration reference {#route-config}

Each route accepts an optional `config` object with the following properties:

| Property | Type | Description |
| --- | --- | --- |
| `policies` | `Array<string \| { name: string; config: unknown }>` | Policies to run before the controller action. Each item is either a policy name string or an object with `name` and `config`. |
| `middlewares` | `Array<string \| MiddlewareHandler>` | Middlewares to apply to this route specifically. Each item is a middleware name string or an inline function. |
| `auth` | `false \| { scope?: string[]; strategies?: string[] }` | Set to `false` to make the route public. Pass an object to override the auto-generated scope or specify custom auth strategies. |

### Policies

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js
config: {
  // Reference a registered policy by name
  policies: ['my-policy'],

  // Reference a policy with custom configuration
  policies: [{ name: 'my-policy', config: { maxAge: 3600 } }],

  // Mix both forms
  policies: ['my-policy', { name: 'my-other-policy', config: {} }],
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
config: {
  policies: ['my-policy'],
  // or with config:
  policies: [{ name: 'my-policy', config: { maxAge: 3600 } }],
}
```

</TabItem>
</Tabs>

:::tip
Policies declared in a plugin are referenced with their plugin namespace: `plugin::my-plugin.my-policy`. Policies from the application (in `src/policies/`) are referenced by name directly.
:::

### Auth

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js
// Public route (no authentication required)
config: {
  auth: false,
}

// Override the auto-generated scope
config: {
  auth: {
    scope: ['plugin::my-plugin.article.find'],
  },
}

// Specify custom auth strategies
config: {
  auth: {
    strategies: ['api-token'],
  },
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
// Public route
config: {
  auth: false,
}

// Override scope
config: {
  auth: {
    scope: ['plugin::my-plugin.article.find'],
  },
}
```

</TabItem>
</Tabs>

:::caution
Setting `auth: false` makes the route fully public. Any user, authenticated or not, can reach it. Use this only when the endpoint intentionally serves public data, and apply rate limiting or other protections as needed.

Be equally careful when overriding `config.auth.scope` with a broader value than the auto-generated one, as this can grant unintended access through the Users & Permissions system.
:::

:::strapi Backend customization
For the full route configuration reference, including dynamic parameters, regular expressions in paths, and public routes, see [Routes](/cms/backend-customization/routes).
:::

## Best practices

- **Use the named router format when exposing both admin and Content API endpoints.** It makes the intent of each route explicit and avoids relying on the `type` default, which can be surprising.

- **Keep `handler` as a string.** String handlers get automatic auth scope generation. Function handlers do not, which means auth is bypassed unless you configure it explicitly.

- **Scope policies to their namespace.** When referencing a plugin policy in a route, use the full `plugin::my-plugin.policy-name` form. This avoids ambiguity if a policy with the same short name exists elsewhere in the application.

- **Do not disable auth on admin routes.** Admin routes default to requiring admin authentication. Disabling auth on an admin route exposes it to unauthenticated requests, which is almost never intentional.

- **Group related routes in dedicated files.** As your plugin grows, a single route index file becomes hard to navigate. Split by resource (e.g., `routes/article.js`, `routes/comment.js`) and re-export from `routes/index.js`.