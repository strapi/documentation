---
title: Code migration - Configuration - Strapi Developer Docs
description: Migrate your configuration from Strapi v3.6.x to v4.1.x with step-by-step instructions
canonicalUrl:  
---

# v4 code migration: Updating configuration  <!-- omit in toc -->

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/code-migration-intro.md)!!!

- [New and existing files and folders](#new-and-existing-files-and-folders)
  - [New File: `admin.js`](#new-file-adminjs)
  - [Existing File: `api.js`](#existing-file-apijs)
  - [New File: `cron-tasks.js`](#new-file-cron-tasksjs)
  - [Existing File: `database.js`](#existing-file-databasejs)
  - [Existing File: `middlewares.js`](#existing-file-middlewaresjs)
  - [Existing File: `plugins.js`](#existing-file-pluginsjs)
  - [Existing File: `server.js`](#existing-file-serverjs)
- [Moved and removed files and folders](#moved-and-removed-files-and-folders)
  - [Custom functions folder](#custom-functions-folder)
  - [Bootstrap](#bootstrap)
  - [Cron](#cron)
  - [Responses](#responses)

## New and existing files and folders

Several of the Strapi v3 config files still exist in Strapi v4, however many have had their structure modified to provide more options or better clarity. Not all cases may be covered under this migration guide and it's recommended you also review the complete [configuration documentation](/developer-docs/latest/setup-deployment-guides/configurations.md).

### New File: `admin.js`

The `admin.js` config file is a replacement for the v3 `admin: {}` object in the `server.js` file. You can find more information [below](#existing-file-server-js) about what remains in the `server.js` file.

By default there are only 2 required keys that need to be present in the `admin.js` file:

- `apiToken.salt`: Used as the salt key for the new [API Tokens feature](/developer-docs/latest/setup-deployment-guides/configurations/optional/api-tokens.md)
- `auth.secret`: Previously located in the `server.js` file for v3, used to encrypt JWTs for the admin panel

For more information on available keys in this file please see the [Admin Panel options](/developer-docs/latest/setup-deployment-guides/configurations/required/admin-panel.md#available-options).

::: details v3 server.js admin config section example

```jsx
module.exports = ({ env }) => ({
  // ...
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', '77b2c87dbab4e1697bec244226fbd1b3'),
    },
  },
});
```

:::

::: details v4 admin.js example

```jsx
module.exports = ({ env }) => ({
  apiToken: {
    salt: env('API_TOKEN_SALT', 'd9b0df66ff97a666027e665707b4e3e7'),
  },
  auth: {
    secret: env('ADMIN_JWT_SECRET', '77b2c87dbab4e1697bec244226fbd1b3'),
  },
});
```

:::

### Existing File: `api.js`

Functionally nothing major has changed for the `api.js` configuration file except the following:

- `rest.defaultLimit`: Default is now `25` instead of `100`
- `rest.maxLimit`: Default is now `100` instead of `null`
- `rest.prefix`: A new feature of Strapi v4, default is `/api` and can be changed to anything but `/`

For more information please see the [API configuration](/developer-docs/latest/setup-deployment-guides/configurations/optional/api.md) section.

:::: details v3 api.js example

::: tip
This config is entirely optional and does not need to be migrated
:::

```jsx
module.exports = ({ env }) => ({
  responses: {
    privateAttributes: ['created_at'],
  },
  rest: {
    defaultLimit: 100,
    maxLimit: 250,
  },
});
```

::::

:::: details v4 api.js example

::: tip
This config is entirely optional and does not need to be migrated
:::

```jsx
module.exports = ({ env }) => ({
  responses: {
    privateAttributes: ['createdAt'],
  },
  rest: {
    prefix: '/v1',
    defaultLimit: 100,
    maxLimit: 250,
  },
});
```

::::

### New File: `cron-tasks.js`

The `cron-tasks.js` is an entirely optional file and does not even need to be named `cron-tasks.js`. This file name is only used as an example since cronjobs in Strapi can now be directly declared in the `server.js` file or put in a custom file and required in the `server.js` file.

For more information please see the [cron jobs](/developer-docs/latest/setup-deployment-guides/configurations/optional/cronjobs.md) section.

### Existing File: `database.js`

::: warning MongoDB compatibility
With Strapi v4, MongoDB databases are no longer supported and you will be required to migrate to a compatible SQL database to use Strapi v4!
:::

Due to the complete rewrite of the database and query layers within Strapi v4 the entire structure of the `database.js` file has changed. Multi-database support has been dropped and thus there is no more `defaultConnection`. Instead the two primary objects are `connection` which is passed to the database connection manager package [Knex.js](https://github.com/knex/knex) and `settings` which is for Strapi specific settings.

::: note
Pay careful attention to the fact that certain key names have changed such as `username` is now `user`.<br>
We no longer abstract these names and use the native Knex.js key names.
:::

::: details v3 database.js example - PostgreSQL

```jsx
module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'bookshelf',
      settings: {
        client: 'postgres',
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'strapi'),
        username: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        schema: env('DATABASE_SCHEMA', 'public'), // Not Required
        ssl: {
          rejectUnauthorized: env.bool('DATABASE_SSL_SELF', false), // For self-signed certificates
        },
      },
      options: {},
    },
  },
});
```

:::

::: details v4 database.js example - PostgreSQL

```jsx
module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', '127.0.0.1'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'strapi'),
      user: env('DATABASE_USERNAME', 'strapi'),
      password: env('DATABASE_PASSWORD', 'strapi'),
      schema: env('DATABASE_SCHEMA', 'public'), // Not Required
      ssl: {
        rejectUnauthorized: env.bool('DATABASE_SSL_SELF', false), // For self-signed certificates
      },
    },
    debug: false,
  },
});
```

:::

For more information or other database configurations, please see the [database configuration](/developer-docs/latest/setup-deployment-guides/configurations/required/databases.md#configuration-structure) section.

### Existing File: `middlewares.js`

Middlewares in Strapi v4 have been entirely overhauled and the older format of load order, before, and after has been replaced with a simple array to simplify managing load order. Likewise the configuration structure has been simplified allowing for easier ways to handle custom configurations.

::: note Security Middlewares
Various security middlewares from Strapi v3 have been removed and replaced with [koa-helmet](https://www.npmjs.com/package/koa-helmet) which is a Koa.js wrapper for [helmet](https://github.com/helmetjs/helmet). This one package now replaces all security middlewares except for `cors`.
:::

::: details v3 middlewares.js example

```jsx
module.exports = {
  //...
  settings: {
    cors: {
      origin: ['http://localhost', 'https://mysite.com', 'https://www.mysite.com'],
    },
  },
  // ...
};
```

:::

:::: details v4 middlewares.js example

::: caution
Various middlewares in this list are **required** and during configuration you need to replace the string with the object format. For more information refer to the [middlewares configuration](/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.md#optional-configuration) section.
:::

```jsx
module.exports = [
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost', 'https://mysite.com', 'https://www.mysite.com'],
    }
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

::::

For more information please see the [middlewares configuration](/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.md#optional-configuration) section.

### Existing File: `plugins.js`

Plugins in Strapi v4 can now be enabled/disabled and have custom resolve locations in addition to custom configuration options. You will need to migrate the below file structure and move custom configurations into a nested `config` object. For specific plugin configurations you should review the plugin's `readme.md` or documentation.

::: note
Strapi v3 plugins **may not work** with Strapi v4, if you are a plugin developer wanting to upgrade your plugin to work properly with Strapi v4 we invite you to check the [plugins development](/developer-docs/latest/development/plugins-development.md) section or the [Strapi codemods](https://github.com/strapi/codemods) repo to help you upgrade.
:::

::: details v3 plugins.js example

```jsx
module.exports = ({ env }) => ({
  // ...
  sentry: {
    dsn: env('SENTRY_DSN'),
    sendMetadata: true,
  },
  // ...
});

```

:::

::: details v4 plugins.js example

```jsx
module.exports = ({ env }) => ({
  sentry: {
    enabled: true,
    resolve: './src/plugins/my-sentry-fork',
    config: {
      dsn: env('SENTRY_DSN'),
      sendMetadata: true,
      myCustomSetting: false,
    },
  },
  graphql: {
    enabled: true,
    config: {
      defaultLimit: 10,
      maxLimit: 20,
    },
  },
});

```

:::

For more information please see the [plugin configuration](/developer-docs/latest/setup-deployment-guides/configurations/optional/plugins.md) section.

### Existing File: `server.js`

Functionally nothing major has changed for the `server.js` configuration file except the following:

- `admin.*`: All admin related settings have been moved to the [`admin.js` file](#new-file-admin-js)
- `cron.*`: Cron based tasks now can be directly referenced in this file or imported from any other custom files. See more information in the [`cron-tasks.js` file](#new-file-cron-tasks-js)
- `app.keys`: New configuration for the refactored [Session Middleware](), used to create secure session keys

<!-- TODO: Need to add session middleware documentation -->

::: details v3 server.js example

```jsx
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  admin: {
    // ...
  },
});
```

:::

::: details v4 server.js example

```jsx
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
});
```

:::

For more information please see the [server configuration](/developer-docs/latest/setup-deployment-guides/configurations/required/server.md) section.

## Moved and removed files and folders

Certain files and folders have been depreciated or moved elsewhere in the code-base, those changes are listed below and how best to migrate their usage.

### Custom functions folder

The functions folder and all of it's contents no longer exist in Strapi v4, certain cases like Bootstrap and Cron have been moved to their own dedicated sections but global functions are no longer automatically added to the Strapi internal API.

When creating universal utility functions in Strapi v4 it's recommended that you either create a plugin dedicated to holding those utility functions or build [services](/developer-docs/latest/development/backend-customization/services.md) that can be called from anywhere in the Strapi backend.

### Bootstrap

The dedicated `bootstrap.js` no longer exists and is now a global function combined with the new `register` function. You can find the `bootstrap` and `register` functions in `./src/index.js`.

For more information on these functions please see the [functions](/developer-docs/latest/setup-deployment-guides/configurations/optional/functions.md) section.

### Cron

The dedicated `cron.js` file has been removed as crontab based tasks can now be directly declared in the `server.js` file or any number of custom task files such as the [`cron-tasks.js` file](#new-file-cron-tasks-js) and imported into the [`server.js` file](#existing-file-server-js).

For more information on configuring crontab tasks please see the [cron jobs](/developer-docs/latest/setup-deployment-guides/configurations/optional/cronjobs.md) section.

### Responses

Due to the standardization of the response and error handling structure in Strapi v4, it's no longer possible to customize the response structure or add custom response structures.

For custom error messages please see the [error handling](/developer-docs/latest/developer-resources/error-handling.md) section or the [requests & responses](/developer-docs/latest/development/backend-customization/requests-responses.md) section.
