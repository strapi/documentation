---
title: Backend customization - Controllers - Strapi Developer Docs
description:
sidebarDepth: 3
---

<!-- TODO: update SEO -->

# Controllers

Controllers are JavaScript files that contain a set of methods, called actions, reached by the client according to the requested [route](/developer-docs/latest/development/backend-customization/routes.md). Whenever a client requests the route, the action performs the business logic code and sends back the [response](/developer-docs/latest/development/backend-customization/requests-responses.md#responses). Controllers represent the C in the model-view-controller (MVC) pattern. Just like [all the other parts of the Strapi backend](/developer-docs/latest/development/backend-customization.md), controllers can be customized.

In most cases, the controllers will contain the bulk of a project's business logic. But as a controller's logic becomes more and more complicated, it's a good practice to use [services](/developer-docs/latest/development/backend-customization/services.md) to organize the code into re-usable parts.
<!-- TODO: remove this comment — the links above will work only when merged with PRs #450 and #446 -->

## Implementation

Controllers can be [generated or added manually](#adding-a-new-controller), and the [core controllers examples](#extending-core-controllers) can help you get started creating custom ones.

### Adding a new controller

A new controller can be implemented:

- with the [interactive CLI command `strapi generate`](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-generate)
<!-- TODO: update CLI documentation with the new interactive `strapi generate` -->
- or manually by creating a JavaScript file:
  - in `./src/api/[api-name]/controllers/` for API controllers (this location matters as controllers are auto-loaded by Strapi from there)
  - or in a folder like `./src/plugins/[plugin-name]/controllers/` for , though they can be created elsewhere as long as the plugin interface is properly exported in the `strapi-server.js` file (see [Server API for Plugins documentation](/developer-docs/latest/developer-resources/plugin-api-reference/server.md))

```js
// path: ./src/api/[api-name]/controllers/my-controller.js

module.exports = {
  async exampleAction(ctx, next) {
    try {
      ctx.body = 'ok';
    } catch (err) {
      ctx.body = err;
    }
  }
};
```

Each controller action can be an `async` or `sync` function.
Every action receives a context object (`ctx`) as the first parameter. `ctx` contains the [request context](/developer-docs/latest/development/backend-customization/requests-responses.md#requests) and the [response context](/developer-docs/latest/development/backend-customization/requests-responses.md#responses).
<!-- TODO: update these links once merged with the backend customization intro PR (#446) -->

::: details Example: GET /hello route calling a basic controller

A specific `GET /hello` [route](/developer-docs/latest/development/backend-customization/routes.md) is defined, which takes `hello.index` as a handler. Every time a `GET /hello` request is sent to the server, Strapi calls the `index` action in the `hello.js` controller, which returns `Hello World!`:
<!-- TODO: remove this comment — the link above will work only when merged with PR #450 -->

```js
// path: ./src/api/hello/routes/router.js

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/hello',
      handler: 'hello.index',
    }
  ]
}

// path: ./src/api/hello/controllers/hello.js

module.exports = {
  async index(ctx, next) { // called by GET /hello 
    ctx.body = 'Hello World!'; // we could also send a JSON
  },
};
```

:::

::: note
When a new [content-type](/developer-docs/latest/development/backend-customization/models.md#content-types) is created, Strapi builds a generic controller with placeholder code, ready to be customized.
:::

### Extending core controllers

Default controllers are created for each content-type. These default controllers are used to return responses to API requests (e.g. when the `GET /api/articles/3` is accessed, the `findOne` method of the default controller for the "Article" content-type is called). Default controllers can be customized to implement your own logic. The following code examples should help you get started.

:::caution
v4 controllers are currently being refactored. The code examples below will be updated soon to reflect these changes.
:::

<!-- TODO: add instructions if we keep code examples as-is, because they use `transformResponse` and `sanitize` methods that are defined elsewhere -->

::::: details Collection type examples

:::: tabs card

::: tab find()

```js
async find(ctx) {
  const { query } = ctx;

  const { results, pagination } = await service.find(query);

  return transformResponse(sanitize(results), { pagination });
}
```

:::

::: tab findOne()

```js
async findOne(ctx) {
  const { id } = ctx.params;
  const { query } = ctx;

  const entity = await service.findOne(id, query);

  return transformResponse(sanitize(entity));
}
```

:::

::: tab create()

```js
async create(ctx) {
  const { query } = ctx.request;

  const { data, files } = parseBody(ctx);

  const entity = await service.create({ ...query, data, files });

  return transformResponse(sanitize(entity));
}
```

:::

::: tab update()

```js
async update(ctx) {
  const { id } = ctx.params;
  const { query } = ctx.request;
  const { data, files } = parseBody(ctx);
  const entity = await service.update(id, { ...query, data, files });

  return transformResponse(sanitize(entity));
}
```

:::

::: tab delete()

```js
async delete(ctx) {
  const { id } = ctx.params;
  const { query } = ctx;
  const entity = await service.delete(id, query);
  return transformResponse(sanitize(entity));
}
```

:::
::::
:::::

::::: details Single type examples
:::: tabs card

::: tab find()

```js
async find(ctx) {
  const { query } = ctx;
  const entity = await service.find(query);
  return transformResponse(sanitize(entity));
}

```

:::

::: tab update()

```js
async update(ctx) {
  const { query } = ctx.request;
  const { data, files } = parseBody(ctx);
  const entity = await service.createOrUpdate({ ...query, data, files });

  return transformResponse(sanitize(entity));
}
```

:::

::: tab delete()

```js
async delete(ctx) {
  const { query } = ctx;
  const entity = await service.delete(query);

  return transformResponse(sanitize(entity));
}
```

:::
::::
:::::

## Usage

Controllers are declared and attached to a route. Controllers are automatically called when the route is called, so controllers usually do not need to be called explicitly. However, [services](/developer-docs/latest/development/backend-customization/services.md) can call controllers, and in this case the following syntax should be used:

```js
// access an API controller
strapi.controller('api::api-name.controller-name');
// access a plugin controller
strapi.controller('plugin::plugin-name.service-name');
```
