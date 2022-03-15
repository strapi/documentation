---
title: Code migration - Global Middlewares - Strapi Developer Docs
description: Migrate your global middlewares from Strapi v3.6.x to v4.0.x with step-by-step instructions
canonicalUrl: https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/global-middlewares.html
---

# v4 code migration: Updating global middlewares

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/code-migration-intro.md)!!!

::: strapi v3/v4 comparison
Strapi v4 only introduces small modifications to the structure of a global middleware, allowing for additional configuration parameters to be passed without the need to manually pull in the configuration via the Strapi API.

The configuration of middlewares has changed (see [configuration migration](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/configuration.md#middlewares-configuration)).
:::

The [`strapi generate` interactive CLI](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-generate) is the recommended way to create a new middleware:

1. Run `yarn strapi generate` in a terminal.
2. Using the interactive CLI, choose where the middleware should apply and give it a name.
3. Add customizations to the generated file.

::: details Example of a Strapi v3 middleware converted to v4:

```js
// path: ./my-custom-packages/my-custom-middleware/lib/index.js

module.exports = async (ctx, next) => {
  const start = Date.now();

  await next();

  const delta = Math.ceil(Date.now() - start);
  ctx.set('X-Response-Time', delta + 'ms');
};
```

The Strapi v3 global middleware example above should be converted to a Strapi v4 middleware using the following code:

```jsx

// path: ./src/middlewares/my-custom-middleware.js

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const start = Date.now();

    await next();

    const delta = Math.ceil(Date.now() - start);

    let headerName = config.headerName || 'X-Response-Time';
    ctx.set(headerName, delta + 'ms');
  };
};
```

:::
