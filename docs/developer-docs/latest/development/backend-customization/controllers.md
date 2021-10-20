---
title: Backend customization - Controllers - Strapi Developer Docs
description:
sidebarDepth: 3
---

<!-- TODO: update SEO -->

# Controllers

Controllers are JavaScript files that contain a set of methods, called actions, reached by the client according to the requested [route](/developer-docs/latest/development/backend-customization/routes.md). Whenever a client requests the route, the action performs the business logic code and sends back the [response](/developer-docs/latest/development/backend-customization#responses). Controllers represent the C in the model-view-controller (MVC) pattern. Just like [all the other parts of the Strapi backend](/developer-docs/latest/development/backend-customization.md), controllers can be customized.

In most cases, the controllers will contain the bulk of a project's business logic. But as a controller's logic becomes more and more complicated, it's a good practice to use [services](/developer-docs/latest/development/backend-customization/services.md) to organize the code into re-usable parts.
<!-- TODO: remove this comment — the links above will work only when merged with PRs #450 and #446 -->

## Implementation

A new controller can be implemented:

- with the [interactive CLI command `strapi generate`]()
<!-- TODO: update CLI documentation with the new interactive `strapi generate` -->
- or manually by creating a JavaScript file in the appropriate folder (see [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md)):
  - `./src/api/[api-name]/controllers/` for API controllers
  - or `./src/plugins/[plugin-name]/controllers/` for [plugin controllers](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#controllers).

```js
// path: ./src/api/[api-name]/controllers/my-controller.js

module.exports = {
  exampleAction: async (ctx, next) => {
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
  index: async (ctx, next) => { // called by GET /hello 
    ctx.body = 'Hello World!'; // we could also send a JSON
  },
};
```

:::

When a new [content-type](/developer-docs/latest/development/backend-customization/models.md#content-types) is created, Strapi builds a generic controller for it and allows overriding and extending it in the generated files.

::: tip
Use the code for the default controller actions of [collection types](https://github.com/strapi/strapi/blob/releases/v4/packages/core/strapi/lib/core-api/controller/collection-type.js) and [single types](https://github.com/strapi/strapi/blob/releases/v4/packages/core/strapi/lib/core-api/controller/single-type.js) in Strapi's Github repository to create custom controllers or extend the existing ones.
<!-- TODO: update links once v4 is out as they currently point to the releases/v4 branch -->
:::

## Usage

Controllers are called different ways depending on their scope:

- for API controllers, use:
  - `strapi.api('api-name').controller('controller-name')`
  - or `strapi.controller('api::api-name.controller-name')`
- for plugin controllers, use:
  - `strapi.plugin('plugin-name').controller('controller-name')`
  - or `strapi.controller('plugin::plugin-name.controller-name')`
