---
title: Migrate from 4.0.5 to 4.0.6 - Strapi Developer Docs
description: Learn how you can migrate your Strapi application from 4.0.5 to 4.0.6.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/migration-guide-4.0.x-to4.0.6.html
---

# v4.0.x to v4.0.6 migration guide
<!---
Add 2-3 sentences summarizing the purpose of the migration
--->
The Strapi v4.0.x to v4.0.6 migration guide upgrades all prior versions of v4.0.x to v4.0.6. The migration adds and configures the `session` middleware, which is required for the [Users & Permissions providers](https://docs.strapi.io/user-docs/latest/settings/configuring-users-permissions-plugin-settings.html) to function properly, secure cookies, and encrypt data. The migration guide consists of 3 sections: 
  - upgrading the application dependencies
  - migrating the breaking changes to the middleware
  - reinitializing the application

<!-- 
General plugin extension callout
 -->


:::caution
 [Plugins extension](https://docs.strapi.io/developer-docs/latest/plugins/users-permissions.html) that create custom code or modify existing code, will need to be updated and compared to the changes in the repository. Not updating the plugin extensions could break the app.
:::


### Upgrading the application dependencies

<!---
The "update-dependencies-snippet" is used to make the migration follow a single document. Reuse the snippit in new migration guides for consistency and to save time. 
-->

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/update-dependencies-snippet.md)!!!

<!-- 
end of snippet 
-->
<!--
Version-specific migration steps go here
-->
### Migration steps to repair breaking changes

Add the middleware `strapi::session` to the array in the config file `path: ./config/middlewares.js`. 

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


Configure the session middleware by adding the key settings to the `server.js` config file. <br>
For more information about session middleware and key settings please see [koa-session](https://github.com/koajs/session/blob/master/Readme.md).
 <!--requires keys to secure the cookies and encrypt data, for more information please see [koa-session](https://github.com/koajs/session/blob/master/Readme.md). In order to properly configure the middleware add the key settings to the `server.js` config file:-->

```jsx
// path: ./config/server.js
  // ...
  app: {
    keys: env.array("APP_KEYS", ["testKey1", "testKey2"]),
  },
// ...
```
::: details Example of the updated file:
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
<!-- end of version-specific migration steps
-->

<!--
Rebuild-and-start snippit here 
-->

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/Rebuild-and-start-snippet.md)!!!


<!-- End of migration guide -->