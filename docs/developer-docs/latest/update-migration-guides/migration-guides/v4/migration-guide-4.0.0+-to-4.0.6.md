---
title: Migrate from 4.0.0+ to 4.0.6 - Strapi Developer Docs
description: Learn how you can migrate your Strapi application from 4.0.0+ to 4.0.6.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/migration-guide-4.0.x-to4.0.6.html
---

# v4.0.0+ to v4.0.6 migration guide

The Strapi v4.0.0+ to v4.0.6 migration guide upgrades versions of v4.0.0 and above to v4.0.6. The migration adds the `session` middleware to the middleware array and configures the `session` middleware. The `session` middleware is based on [koa-session](/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.md#session) and is necessary to fix the login provider feature of the [Users & Permissions plugin](/developer-docs/latest/plugins/users-permissions.md). Additionally, password protection in the [Documentation plugin](/developer-docs/latest/plugins/documentation.md) uses the `session` middleware. The migration guide consists of 3 sections:

- upgrading the application dependencies
- migrating the breaking changes to the middleware
- reinitializing the application

:::caution
 [Plugins extension](/developer-docs/latest/plugins/users-permissions.md) that create custom code or modify existing code, will need to be updated and compared to the changes in the repository. Not updating the plugin extensions could break the application.
:::

## Upgrading the application dependencies

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/update-dependencies-snippet.md)!!!

## Fixing the breaking changes

1. Add the `strapi::session` middleware to the array in the middleware configuration file `./config/middlewares.js`:

```jsx
// path: ./config/middlewares.js

module.exports = [
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

2. Configure the session middleware by adding the key settings to the `server.js` configuration file (see [session middleware](/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.md#session) for more information). The secrets are typically stored in `.env` during development. In most use cases the keys will be different for each environment. For example, a different set of keys should be used for the production and the development environments. Storing default keys in the configuration file is not recommended.

```jsx
// path: ./config/server.js

  // ...
  app: {
    keys: env.array("APP_KEYS"),
  },
// ...
```

::: details Example of the updated file

```jsx
// path: ./config/server.js

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array("APP_KEYS"),
  },
  // ...
});

```

:::

:::: warning
It is a security risk to expose static session middleware keys in a deployed environment. An `.env` file or environment variables should be used instead.

::: details Example: sessions keys in .env file

```js
APP_KEYS=[someSecret, anotherSecret, additionalSecrets]

or

APP_KEYS=someSecret,anotherSecret,additionalSecrets
```

:::
::::

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/Rebuild-and-start-snippet.md)!!!
