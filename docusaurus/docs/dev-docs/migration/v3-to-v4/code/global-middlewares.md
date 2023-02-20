---
title: Global middlewares
displayed_sidebar: devDocsSidebar
description: Migrate your global middlewares from Strapi v3.6.x to v4.0.x with step-by-step instructions

---

# v4 code migration: Updating global middlewares

This guide is part of the [v4 code migration guide](/dev-docs/migration/v3-to-v4/code-migration.md) designed to help you migrate the code of a Strapi application from v3.6.x to v4.0.x


:::strapi v3/v4 comparison
Strapi v4 only introduces small modifications to the structure of a global middleware, allowing for additional configuration parameters to be passed without the need to manually pull in the configuration via the Strapi API.

The configuration of middlewares has changed (see [configuration migration](/dev-docs/migration/v3-to-v4/code/configuration#middlewares-configuration)).
:::

The [`strapi generate` interactive CLI](/dev-docs/cli#strapi-generate) is the recommended way to create a new middleware:

1. Run `yarn strapi generate` in a terminal.
2. Using the interactive CLI, choose where the middleware should apply and give it a name.
3. Add customizations to the generated file.

<details> 
<summary>Example of a Strapi v3 middleware converted to v4:</summary>

```js title="path: ./my-custom-packages/my-custom-middleware/lib/index.js"

module.exports = async (ctx, next) => {
  const start = Date.now();

  await next();

  const delta = Math.ceil(Date.now() - start);
  ctx.set('X-Response-Time', delta + 'ms');
};
```

The Strapi v3 global middleware example above should be converted to a Strapi v4 middleware using the following code:

```jsx title="path: ./src/middlewares/my-custom-middleware.js"

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

</details>
