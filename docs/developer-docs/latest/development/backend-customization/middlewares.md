---
title: Backend customization - Middlewares - Strapi Developer Documentation
description : …
---

<!-- TODO: update SEO -->

# Middlewares customization

In Strapi, 2 middleware concepts coexist:

- **Strapi middlewares** are [configured and enabled](/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.md) for the entire Strapi server application. These middlewares can be applied at the application level or at the API level. Plugins can also add Strapi middlewares (see [Server API documentation](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#middlewares)).<br/>The present documentation describes how new application-level or API-level middlewares can be implemented and used.
- **Route middlewares** have a more limited scope and are configured and used as middlewares at the route level. They are described in the [routes documentation](/developer-docs/latest/development/backend-customization/routing.md#middlewares).

## Implementation

<!-- ? do we plan to add middleware creation to the strapi generate interactive CLI? -->
A new application-level or API-level middleware can be implemented manually by creating a JavaScript file in the appropriate folder (see [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md)):

- `./src/middlewares/` for application-level middlewares
- `./src/api/[api-name]/middlewares/` for API-level middlewares

Middlewares working with the REST API are functions like the following:

```js
// path: ./src/middlewares/my-middleware.js or ./src/api/[api-name]/middlewares/my-middleware.js
module.exports = (config) => {
  return (ctx, next) => {};
};
```

The GraphQL plugin also allows [implementing custom middlewares](), with a different syntax.
<!-- TODO: add link once this GraphQL customization topic is documented in the GraphQL plugin section -->

<!-- TODO: update the example below, was copied & pasted from v3 but won't probably work as-is -->
::: details Example of a custom timer middleware

```js
module.exports = strapi => {
  return {
    initialize() {
      strapi.app.use(async (ctx, next) => {
        const start = Date.now();

        await next();

        const delta = Math.ceil(Date.now() - start);

        ctx.set('X-Response-Time', delta + 'ms');
      });
    },
  };
};
```

:::

## Usage

Middlewares are called different ways depending on their scope:

- use `global::middleware-name` for application-level middlewares
- use `api::api-name.middleware-name` for API-level middlewares

::: tip
To list all the registered middlewares, run `yarn strapi middlewares:list`.
<!-- TODO: add this to CLI reference -->
:::
