---
title: Migrate from 4.0.5 to 4.0.6 - Strapi Developer Docs
description: Learn how you can migrate your Strapi application from 4.0.5 to 4.0.6.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/migration-guide-4.0.x-to4.0.6.html
---

# Migration guide from 4.0.5 to 4.0.6

**Make sure your server is not running until the end of the migration**

:::warning
If you are using **extensions** to create custom code or modifying existing code, you will need to update your code and compare your version to the new changes on the repository.
<br>
Not updating your **extensions** can break your app in unexpected ways that we cannot predict.
:::

## Migration

### 1. Update the application dependencies

First, update the application dependencies as usual by following the basic [version update guide](../../update-version.md).

### 2. Add session middleware

In order for the the Users & Permissions providers to function properly the session middleware is required. To enable this middleware you will need to add it to your `middlewares.js` config file:

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

### 3. Configure session middleware

The session middleware requires some keys to secure the cookies and encrypt data, for more information on how this works please see [koa-session](https://github.com/koajs/session/blob/master/Readme.md). In order to properly configure the middleware you will need to add these key settings to your `server.js` config file:

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

:::: warning
It is not recommended to statically set these keys while in a deployed environment, using either a `.env` file or environment variables is recommended.

::: details Example: Sessions keys in `.env` file

```js
APP_KEYS=[someSecret, anotherSecret, additionalSecrets]

or 

APP_KEYS=someSecret,anotherSecret,additionalSecrets
```

:::
::::


🎉 Congrats, your application has been migrated!
