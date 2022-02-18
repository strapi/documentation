---
title: Migrate from 4.0.5 to 4.0.6 - Strapi Developer Docs
description: Learn how you can migrate your Strapi application from 4.0.5 to 4.0.6.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/migration-guide-4.0.x-to4.0.6.html
---

# v4.0.x to v4.0.6 migration guide

The Strapi v4.0.x to v4.0.6 migration guide upgrades all prior versions of v4.0.x to v4.0.6. The migration adds the `session` middleware to the middleware array and configures the `session` middleware. The upgrade is required for the [Users & Permissions providers](/user-docs/latest/settings/configuring-users-permissions-plugin-settings.md) to function properly, secure cookies, and encrypt data. The migration guide consists of 3 sections: 
  - upgrading the application dependencies
  - migrating the breaking changes to the middleware
  - reinitializing the application


:::caution
 [Plugins extension](/developer-docs/latest/plugins/users-permissions.md) that create custom code or modify existing code, will need to be updated and compared to the changes in the repository. Not updating the plugin extensions could break the application.
:::


### Upgrading the application dependencies


!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/update-dependencies-snippet.md)!!!



### Migration steps to repair breaking changes

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


2. Configure the session middleware by adding the key settings to the `server.js` config file (see [koa-session](https://github.com/koajs/session/blob/master/Readme.md) for more information).
 

```jsx
// path: ./config/server.js

  // ...
  app: {
    keys: env.array("APP_KEYS", ["testKey1", "testKey2"]),
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
    keys: env.array("APP_KEYS", ["testKey1", "testKey2"]),
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


