---
title: Server controllers & services
displayed_sidebar: cmsSidebar
pagination_prev: cms/plugins-development/server-routes
pagination_next: cms/plugins-development/server-policies-middlewares
toc_max_heading_level: 4
description: Handle HTTP requests in plugin controllers and organize reusable business logic in plugin services.
tags:
  - plugin APIs
  - server API
  - controllers
  - services
  - plugins development
  - backend customization
---

import Prerequisite from '/docs/snippets/plugins-development-create-plugin-prerequisite-server.md'

# Server API: Controllers & services

<Tldr>
Just like the Strapi core, plugins can have controllers and services. Plugin controllers handle the HTTP layer: they receive `ctx`, call services, and return responses. Plugin services hold reusable business logic and interact with content-types through the Document Service API. Keep controllers thin and put domain logic in services.
</Tldr>

Controllers and services are the 2 building blocks that handle request processing and business logic in a plugin server. They work together in a clear separation of concerns: controllers own the HTTP layer, services own the domain layer:

| Goal | Use |
| --- | --- |
| Receive `ctx`, read the request, set the response | [Controller](#controllers) |
| Query the database or apply business rules | [Service](#services) |
| Reuse logic across multiple controllers or lifecycle hooks | [Service](#services) |
| Call an external API as part of a request | [Service](#services) |

<Prerequisite />

## Controllers

A controller is an object of action methods, each corresponding to a route handler. Controllers receive a Koa context object (`ctx`) containing the request and response, call the appropriate service, and set `ctx.body` or `ctx.status` for the response.

### Declaration

Controllers can be exported either as a factory function receiving `{ strapi }` or as a plain object. The factory function pattern is the recommended approach for dependency injection and consistency with most documentation examples.

At runtime, Strapi supports both exports and resolves function exports by calling them with `{ strapi }`.

The export key used in `controllers/index.js|ts` must match the handler name used in route definitions.

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
    const { documentId } = ctx.params;
    const article = await strapi
      .plugin('my-plugin')
      .service('article')
      .findOne(documentId);

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

interface ArticleService {
  findAll(): Promise<unknown[]>;
  findOne(id: string): Promise<unknown>;
  create(data: unknown): Promise<unknown>;
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async find(ctx: any) {
    // Limitation: in @strapi/types, plugin services are currently typed as unknown.
    const articleService = strapi.plugin('my-plugin').service('article') as ArticleService;

    ctx.body = await articleService.findAll();
  },

  async findOne(ctx: any) {
    const { documentId } = ctx.params;
    const article = await (strapi.plugin('my-plugin').service('article') as ArticleService).findOne(documentId);

    if (!article) {
      return ctx.notFound('Article not found');
    }

    ctx.body = article;
  },

  async create(ctx: any) {
    const articleService = strapi.plugin('my-plugin').service('article') as ArticleService;

    ctx.status = 201;
    ctx.body = await articleService.create(ctx.request.body);
  },
});
```

</TabItem>
</Tabs>

### Sanitization

When your plugin exposes Content API routes, sanitize query parameters and output data before returning them. This prevents leaking private fields or bypassing access rules.

Plugin controllers are plain factory functions and do not extend `createCoreController` like in the Strapi core (see [backend customization](/cms/backend-customization/controllers) for details). This means the `this.sanitizeQuery` and `this.sanitizeOutput` shorthands are not available. Use `strapi.contentAPI.sanitize` directly instead, passing the content-type schema explicitly:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript" default>

```js title="/src/plugins/my-plugin/server/src/controllers/article.js"
module.exports = ({ strapi }) => ({
  async find(ctx) {
    // highlight-start
    const schema = strapi.contentType('plugin::my-plugin.article');

    const sanitizedQuery = await strapi.contentAPI.sanitize.query(
      ctx.query, schema, { auth: ctx.state.auth }
    );
    // highlight-end
    const articles = await strapi.plugin('my-plugin').service('article').findAll(sanitizedQuery);
    // highlight-next-line
    ctx.body = await strapi.contentAPI.sanitize.output(articles, schema, { auth: ctx.state.auth });
  },
});
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/plugins/my-plugin/server/src/controllers/article.ts"
import type { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async find(ctx: any) {
    // highlight-start
    const schema = strapi.contentType('plugin::my-plugin.article');

    const sanitizedQuery = await strapi.contentAPI.sanitize.query(
      ctx.query, schema, { auth: ctx.state.auth }
    );
    // highlight-end
    const articles = await (strapi.plugin('my-plugin').service('article') as any).findAll(sanitizedQuery);
    // highlight-next-line
    ctx.body = await strapi.contentAPI.sanitize.output(articles, schema, { auth: ctx.state.auth });
  },
});
```

</TabItem>
</Tabs>

:::strapi Backend customization
For the full sanitization and validation reference, including `sanitizeInput`, `validateQuery`, and `validateInput`, see [Controllers](/cms/backend-customization/controllers#sanitize-validate-custom-controllers).
:::

## Services

A service is a factory function that receives `{ strapi }` and returns an object of named methods, or a plain object; like [controllers](#declaration), Strapi resolves both at runtime. Services hold business logic called from controllers, lifecycle hooks, or other services.

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
    // highlight-next-line
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
    // highlight-next-line
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

:::caution TypeScript service typing
`services` is typed as `unknown` in the current `ServerObject` TypeScript interface (`@strapi/types`). This means `strapi.plugin('my-plugin').service('article')` returns `unknown` and requires a cast to call methods with type safety. For fully typed service calls, define and export the service type explicitly and cast at the call site.
:::

:::strapi Document Service API
Services interact with content-types through the [Document Service API](/cms/api/document-service), which documents the full list of available methods and parameters.
:::

## End-to-end example

The following example shows the complete request flow across routes, a controller, and a service for a simple article resource.

<ExpandableContent maxHeight="400px">

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
        // highlight-next-line
        handler: 'article.find', // maps to controllers/article.js → find()
        config: { auth: false },
      },
      {
        method: 'POST',
        path: '/articles',
        // highlight-next-line
        handler: 'article.create', // maps to controllers/article.js → create()
        config: { auth: false },
      },
    ],
  },
};
```

```js title="/src/plugins/my-plugin/server/src/controllers/article.js"
'use strict';

module.exports = ({ strapi }) => ({
  // highlight-next-line
  async find(ctx) {
    ctx.body = await strapi.plugin('my-plugin').service('article').findAll();
    // Note: sanitize query and output in production — see the Sanitization section above
  },

  // highlight-next-line
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
        // highlight-next-line
        handler: 'article.find', // maps to controllers/article.ts → find()
        config: { auth: false },
      },
      {
        method: 'POST' as const,
        path: '/articles',
        // highlight-next-line
        handler: 'article.create', // maps to controllers/article.ts → create()
        config: { auth: false },
      },
    ],
  },
};
```

```ts title="/src/plugins/my-plugin/server/src/controllers/article.ts"
import type { Core } from '@strapi/strapi';

interface ArticleService {
  findAll(): Promise<unknown[]>;
  create(data: unknown): Promise<unknown>;
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  // highlight-next-line
  async find(ctx: any) {
    ctx.body = await (strapi.plugin('my-plugin').service('article') as ArticleService).findAll();
    // Note: sanitize query and output in production — see the Sanitization section above
  },

  // highlight-next-line
  async create(ctx: any) {
    const article = await (strapi.plugin('my-plugin').service('article') as ArticleService)
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
    // highlight-next-line
    return strapi.documents('plugin::my-plugin.article').findMany();
  },

  create(data: Record<string, unknown>) {
    return strapi.documents('plugin::my-plugin.article').create({ data });
  },
});
```

</TabItem>
</Tabs>

</ExpandableContent>

## Best practices

- **Keep controllers thin.** A controller action should do 3 things: receive `ctx`, delegate to a service, and set the response. Business logic, database calls, and conditional branching all belong in services.

- **One service per resource.** Organize services by the resource they manage (e.g., `article`, `comment`, `settings`) rather than by action type. This keeps each file focused and easy to test.

- **Use the Document Service API in services, not in controllers.** Calling `strapi.documents(...)` directly in a controller bypasses the service layer and makes logic harder to reuse. Put all Document Service calls in services.

- **Sanitize Content API responses.** When exposing Content API routes, use `strapi.contentAPI.sanitize.output()` before returning data. Skipping sanitization can leak private fields to end users. Admin routes are not subject to the same content-type field visibility rules, but sanitizing them as well is harmless.

- **Cast service types explicitly in TypeScript.** Until `services` is strongly typed in `@strapi/types`, cast the return value of `strapi.plugin('my-plugin').service('my-service')` to the service interface at each call site. Avoid using `any` throughout the codebase.