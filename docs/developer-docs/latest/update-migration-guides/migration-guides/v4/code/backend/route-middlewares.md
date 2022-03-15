---
title: v4 code migration - Route Middlewares - Strapi Developer Docs
description: Migrate route middlewares of a Strapi application from v3.6.x to v4.0.x
canonicalUrl:  http://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/routes.html
---

# v4 code migration: Updating route middlewares

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/code-migration-intro.md)!!!

::: strapi v3/v4 comparison
In Strapi v3, policies are also used as route middlewares to make changes to the request or response payload or to wrap a controller with extra logic.

In Strapi v4, there is a clear distinction between [policies](/developer-docs/latest/development/backend-customization/policies.md#implementation), which are used for authorization and validation, and [middlewares](/developer-docs/latest/development/backend-customization/middlewares.md), which are used for extra logic, wrapping, and customization.

:::

A Strapi v3 policy acting as a middleware should be converted to a [route middleware](/developer-docs/latest/development/backend-customization/routes.md#middlewares) in Strapi v4 by creating a new middleware. Strapi v3 policies not acting as route middlewares should be migrated to v4 using the [policies migration documentation](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/policies.md).

The [`strapi generate` interactive CLI](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-generate) is the recommended way to create a new middleware:

1. Run `yarn strapi generate` in a terminal.
2. Using the interactive CLI, choose where the middleware should apply and give it a name.
3. Add customizations to the generated file.

::: details Example of a Strapi v3 policy converted to a Strapi v4 middleware

The following Strapi v3 policy acts as a middleware:

```js
// path: ./api/api-name/config/policies/my-policy.js

module.exports = async (ctx, next) => {
  const start = Date.now();

  await next();

  const delta = Math.ceil(Date.now() - start);
  ctx.set('X-Response-Time', delta + 'ms');
};
```

It should be converted to a Strapi v4 middleware using the following code:

```jsx

// path: ./src/api/api-name/middlewares/my-middleware.js

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const start = Date.now();

    await next();

    const delta = Math.ceil(Date.now() - start);
    ctx.set('X-Response-Time', delta + 'ms');
  };
};
```

:::
