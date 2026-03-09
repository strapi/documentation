---
title: Server controllers & services
displayed_sidebar: cmsSidebar
pagination_prev: cms/plugins-development/server-routes
pagination_next: cms/plugins-development/server-policies-middlewares
toc_max_heading_level: 4
description: Handle HTTP requests in plugin controllers and organize reusable business logic in plugin services.
tags:
  - plugin APIs
  - controllers
  - services
  - plugins development
  - backend customization
---

import Prerequisite from '/docs/snippets/plugins-development-create-plugin-prerequisite-server.md'

# Server API: Controllers & services

<Tldr>
Controllers handle the HTTP layer: they receive `ctx`, call services, and return responses. Services hold reusable business logic and interact with content-types through the Document Service API. Keep controllers thin and put domain logic in services.
</Tldr>

Controllers and services are the two building blocks that handle request processing and business logic in a plugin server. They work together in a clear separation of concerns: controllers own the HTTP layer, services own the domain layer.

<Prerequisite />

## Controllers {#controllers}

A controller is an object of action methods, each corresponding to a route handler. Controllers receive a Koa context object (`ctx`) containing the request and response, call the appropriate service, and set `ctx.body` or `ctx.status` for the response.

### Declaration

Controllers are exported as a factory function that receives `{ strapi }` and returns an object of named actions. The export key used in `controllers/index.js|ts` must match the handler name used in route definitions.

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/controllers/index.js"
'use strict';

const article = require('./article');

module.exports = {
  article,
};
```

```js title="/src/plugins/my-plugin/server/src/controllers/article.js"
'use strict';

module.exports = ({ strapi }) => ({
  async find(ctx) {
    const articles = await strapi
      .plugin('my-plugin')
      .service('article')
      .findAll();

    ctx.body = articles;
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const article = await strapi
      .plugin('my-plugin')
      .service('article')
      .findOne(id);

    if (!article) {
      return ctx.notFound('Article not found');
    }

    ctx.body = article;
  },

  async create(ctx) {
    const article = await strapi
      .plugin('my-plugin')
      .service('article')
      .create(ctx.request.body);

    ctx.status = 201;
    ctx.body = article;
  },
});
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/plugins/my-plugin/server/src/controllers/index.ts"
import article from './article';

export default {
  article,
};
```

```ts title="/src/plugins/my-plugin/server/src/controllers/article.ts"
import type { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async find(ctx: any) {
    const articles = await strapi
      .plugin('my-plugin')
      .service('article')
      .findAll();

    ctx.body = articles;
  },

  async findOne(ctx: any) {
    const { id } = ctx.params;
    const article = await strapi
      .plugin('my-plugin')
      .service('article')
      .findOne(id);

    if (!article) {
      return ctx.notFound('Article not found');
    }

    ctx.body = article;
  },

  async create(ctx: any) {
    const article = await strapi
      .plugin('my-plugin')
      .service('article')
      .create(ctx.request.body);

    ctx.status = 201;
    ctx.body = article;
  },
});
```

</TabItem>
</Tabs>

### Sanitization

When your plugin exposes Content API routes, sanitize query parameters and output data before returning them. This prevents leaking private fields or bypassing access rules.

Plugin controllers do not use `createCoreController`, so the `this.sanitizeQuery` / `this.sanitizeOutput` shorthand is not available. Use `strapi.contentAPI.sanitize` directly instead, passing the content-type schema explicitly:

```js title="/src/plugins/my-plugin/server/src/controllers/article.js"
module.exports = ({ strapi }) => ({
  async find(ctx) {
    const schema = strapi.contentType('plugin::my-plugin.article');

    const sanitizedQuery = await strapi.contentAPI.sanitize.query(
      ctx.query, schema, { auth: ctx.state.auth }
    );
    const articles = await strapi.plugin('my-plugin').service('article').findAll(sanitizedQuery);
    ctx.body = await strapi.contentAPI.sanitize.output(articles, schema, { auth: ctx.state.auth });
  },
});
```

:::strapi Backend customization
For the full sanitization and validation reference — including `sanitizeInput`, `validateQuery`, and `validateInput` — see [Controllers](/cms/backend-customization/controllers#sanitize-validate-custom-controllers).
:::

## Services {#services}

A service is a factory function that receives `{ strapi }` and returns an object of named methods. Services hold business logic that can be called from controllers, lifecycle hooks, or other services.

### Declaration

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/services/index.js"
'use strict';

const article = require('./article');

module.exports = {
  article,
};
```

```js title="/src/plugins/my-plugin/server/src/services/article.js"
'use strict';

module.exports = ({ strapi }) => ({
  async findAll(params = {}) {
    return strapi.documents('plugin::my-plugin.article').findMany(params);
  },

  async findOne(documentId) {
    return strapi.documents('plugin::my-plugin.article').findOne({
      documentId,
    });
  },

  async create(data) {
    return strapi.documents('plugin::my-plugin.article').create({ data });
  },

  async update(documentId, data) {
    return strapi.documents('plugin::my-plugin.article').update({
      documentId,
      data,
    });
  },

  async delete(documentId) {
    return strapi.documents('plugin::my-plugin.article').delete({
      documentId,
    });
  },
});
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/plugins/my-plugin/server/src/services/index.ts"
import article from './article';

export default {
  article,
};
```

```ts title="/src/plugins/my-plugin/server/src/services/article.ts"
import type { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async findAll(params: Record<string, unknown> = {}) {
    return strapi.documents('plugin::my-plugin.article').findMany(params);
  },

  async findOne(documentId: string) {
    return strapi.documents('plugin::my-plugin.article').findOne({
      documentId,
    });
  },

  async create(data: Record<string, unknown>) {
    return strapi.documents('plugin::my-plugin.article').create({ data });
  },

  async update(documentId: string, data: Record<string, unknown>) {
    return strapi.documents('plugin::my-plugin.article').update({
      documentId,
      data,
    });
  },

  async delete(documentId: string) {
    return strapi.documents('plugin::my-plugin.article').delete({
      documentId,
    });
  },
});
```

</TabItem>
</Tabs>

:::note Runtime behavior
`services` is typed as `unknown` in the current `ServerObject` TypeScript interface (`@strapi/types`). This means `strapi.plugin('my-plugin').service('article')` returns `unknown` and you will need to cast it to call methods with type safety. This is a known limitation. For fully typed service calls, you can define and export the service type explicitly and cast at the call site.
:::

:::strapi Document Service API
Services interact with content-types through the [Document Service API](/cms/api/document-service). Refer to that documentation for the full list of available methods and parameters.
:::

## End-to-end example

The following example shows a complete request flow from route declaration through controller to service and back.

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/routes/index.js"
'use strict';

module.exports = {
  'content-api': {
    type: 'content-api',
    routes: [
      {
        method: 'GET',
        path: '/articles',
        handler: 'article.find',
        config: { auth: false },
      },
      {
        method: 'POST',
        path: '/articles',
        handler: 'article.create',
        config: { auth: false },
      },
    ],
  },
};
```

```js title="/src/plugins/my-plugin/server/src/controllers/article.js"
'use strict';

module.exports = ({ strapi }) => ({
  async find(ctx) {
    ctx.body = await strapi.plugin('my-plugin').service('article').findAll();
  },

  async create(ctx) {
    const article = await strapi
      .plugin('my-plugin')
      .service('article')
      .create(ctx.request.body);
    ctx.status = 201;
    ctx.body = article;
  },
});
```

```js title="/src/plugins/my-plugin/server/src/services/article.js"
'use strict';

module.exports = ({ strapi }) => ({
  findAll() {
    return strapi.documents('plugin::my-plugin.article').findMany();
  },

  create(data) {
    return strapi.documents('plugin::my-plugin.article').create({ data });
  },
});
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/plugins/my-plugin/server/src/routes/index.ts"
export default {
  'content-api': {
    type: 'content-api' as const,
    routes: [
      {
        method: 'GET' as const,
        path: '/articles',
        handler: 'article.find',
        config: { auth: false },
      },
      {
        method: 'POST' as const,
        path: '/articles',
        handler: 'article.create',
        config: { auth: false },
      },
    ],
  },
};
```

```ts title="/src/plugins/my-plugin/server/src/controllers/article.ts"
import type { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async find(ctx: any) {
    ctx.body = await strapi.plugin('my-plugin').service('article').findAll();
  },

  async create(ctx: any) {
    const article = await (strapi.plugin('my-plugin').service('article') as any)
      .create(ctx.request.body);
    ctx.status = 201;
    ctx.body = article;
  },
});
```

```ts title="/src/plugins/my-plugin/server/src/services/article.ts"
import type { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  findAll() {
    return strapi.documents('plugin::my-plugin.article').findMany();
  },

  create(data: Record<string, unknown>) {
    return strapi.documents('plugin::my-plugin.article').create({ data });
  },
});
```

</TabItem>
</Tabs>

## Best practices

- **Keep controllers thin.** A controller action should do three things: receive `ctx`, delegate to a service, and set the response. Business logic, database calls, and conditional branching all belong in services.

- **One service per resource.** Organize services by the resource they manage (e.g., `article`, `comment`, `settings`) rather than by action type. This keeps each file focused and easy to test.

- **Use the Document Service API in services, not in controllers.** Calling `strapi.documents(...)` directly in a controller bypasses the service layer and makes logic harder to reuse. Put all Document Service calls in services.

- **Always sanitize Content API responses.** When exposing Content API routes, use `strapi.contentAPI.sanitize.output()` before returning data. Skipping sanitization can leak private fields to end users.

- **Cast service types explicitly in TypeScript.** Until `services` is strongly typed in `@strapi/types`, cast the return value of `strapi.plugin('my-plugin').service('my-service')` to your service interface at the call site rather than using `any` throughout your codebase.