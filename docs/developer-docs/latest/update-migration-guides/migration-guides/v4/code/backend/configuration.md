---
title: Code migration - Configuration - Strapi Developer Docs
description: Migrate your configuration from Strapi v3.6.x to v4.0.x with step-by-step instructions
canonicalUrl: https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/configuration.html
next: ./dependencies.md
sidebarDepth: 3
---

# v4 code migration: Updating configuration

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/code-migration-intro.md)!!!

Strapi v4 introduces several types of changes to configurations, which includes new files, moved or restructured files, and removed features. The following table gives a high-level overview of the changes, and you can click on a specific topic to read more information:

| Configuration topic                       | Type of change in Strapi v4 vs. v3                                      | File name in Strapi v4 |
| ------------------------------------------| ----------------------------------------------------------------------- | ---------------------- |
| [Database](#database-configuration)       | Changes to an existing Strapi v3 file                                   | `database.js`          |
| [Server](#server-configuration)           | Changes to an existing Strapi v3 file                                   | `server.js`            |
| [Admin panel](#admin-panel-configuration) | New file in Strapi v4                                                   | `admin.js`             |
| [Middlewares](#middlewares-configuration) | Changes to an existing Strapi v3 file                                   | `middlewares.js`       |
| [CRON tasks](#cron-tasks)                 | New file in Strapi v4                                                   | `cron-tasks.js`        |
| [API](#api-configuration)                 | Changes to an existing Strapi v3 file                                   | `api.js`               |
| [Plugins](#plugins-configuration)         | Changes to an existing Strapi v3 file                                   | `plugins.js`           |
| [Bootstrap function](#bootstrap-function) | Now defined in the global `src/index.js` file                         | -                      |
| [Custom functions folder](#custom-functions-folder) | Feature removed from Strapi v4                                | -                      |
| [Custom responses](#custom-responses)     | Feature removed from Strapi v4                                          | -                      |

::: note
This part of the code migration guide is not an exhaustive resource for Strapi v4 configurations, which are described in the [configurations documentation](/developer-docs/latest/setup-deployment-guides/configurations.md).
:::

## Database configuration

::: caution
MongoDB databases are no longer supported in Strapi v4. You need to migrate to [a compatible SQL database](/developer-docs/latest/setup-deployment-guides/installation/cli.md#preparing-the-installation) to use Strapi v4.
<!-- TODO: add link to MongoDB migration instructions here -->
:::

Due to the complete rewrite of the database and query layers in Strapi v4, the entire structure of the `database.js` file has changed (see [database configuration](/developer-docs/latest/setup-deployment-guides/configurations/required/databases.md#configuration-structure) documentation). Multi-database support has been dropped, so there is no more `defaultConnection` key. Instead, in Strapi v4, the 2 main database configuration objects are:

- `connection`, passed to the database connection manager package (i.e. [Knex.js](https://github.com/knex/knex)),
- and `settings` for Strapi-specific settings.

::: note
Strapi v4 does not abstract Knex.js key names so some key names are different in Strapi v3 and v4 (e.g. `username` in Strapi v3 is now `user` in Strapi v4) (see [database configuration](/developer-docs/latest/setup-deployment-guides/configurations/required/databases.md) documentation).
:::

::: details Example of a Strapi v3 database configuration for PostgreSQL:

```js
// path: ./config/database.js

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

::: details Example of a Strapi v4 database configuration for PostgreSQL:

```jsx
// path: ./config/database.js

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

## Server configuration

The [server configuration](/developer-docs/latest/setup-deployment-guides/configurations/required/server.md) in Strapi v4 is similar to Strapi v3, with the following exceptions:

- All admin panel-related settings (i.e. `admin.*` keys) are in the [`admin.js` file](#admin-panel-configuration).
- CRON tasks (configured with `cron.*` keys) can be directly referenced in the `./config/server.js` or imported from any other custom files (see [`cron-tasks.js` file](#cron-tasks)).
- `app.keys` is a new configuration option for the refactored [session middleware](/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.md#session) and is used to create secure session keys.

::: details Example of a Strapi v3 server configuration:

```jsx
// path: ./config/server.js

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  admin: {
    // ...
  },
});
```

:::

::: details Example of a Strapi v4 server configuration:

```jsx
// path: ./config/server.js

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
});
```

:::

## Admin panel configuration

In Strapi v3, admin panel configuration is defined inside an `admin` object within the `server.js` configuration file.

In Strapi v4, the admin panel configuration is defined in `./config/admin.js` (see [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md)).

By default, in Strapi v4, only 2 keys are required in `admin.js`:

- `apiToken.salt` is used as the salt key for the new [API tokens feature](/developer-docs/latest/setup-deployment-guides/configurations/optional/api-tokens.md),
- `auth.secret` (previously located in the `server.js` file in Strapi v3) is used to encrypt JWTs for the admin panel.

The admin panel configuration documentation lists all the other [available options](/developer-docs/latest/setup-deployment-guides/configurations/required/admin-panel.md#available-options).

::: details Example of a Strapi v3 server.js admin configuration section:

```jsx
// path: ./config/server.js

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

::: details Example of a Strapi v4 admin.js configuration file:

```jsx
// path: ./config/admin.js

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

## Middlewares configuration

[Middlewares](/developer-docs/latest/development/backend-customization/middlewares.md) in Strapi v4 have been entirely overhauled and the Strapi v3 configuration format (e.g. `load order`, `before`, and `after` keys) is replaced with a single array representing the loading order.

[Middlewares configuration](/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.md#optional-configuration) in Strapi v4 is defined in the `./config/middlewares.js` file (plural file name, instead of `middleware.js` in Strapi v3).

::: details Example of Strapi v3 middlewares configuration:

```jsx
// path: ./config/middleware.js

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

:::: details Example of Strapi v4 middlewares configuration:

**Important**: Various middlewares in this list are required. During configuration, replace the string with the object format (see [middlewares configuration](/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.md#optional-configuration)).

```jsx
// path: ./config/middlewares.js

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

::: note
In Strapi v4, security middlewares from Strapi v3 have been removed and replaced with [koa-helmet](https://www.npmjs.com/package/koa-helmet), which is a Koa.js wrapper for [helmet](https://github.com/helmetjs/helmet). This package replaces all security middlewares except for `cors` (see [internal middlewares configuration reference](/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.md#internal-middlewares-configuration-reference)).
:::

## CRON tasks

In Strapi v3, CRON tasks could be defined in a `./config/functions/cron.js` file. 

In Strapi v4, the `config/functions` folder [does not exist anymore](#custom-functions-folder), and [CRON tasks](/developer-docs/latest/setup-deployment-guides/configurations/optional/cronjobs.md) can be defined:

- in a separate file (e.g. `./config/cron-tasks.js`)
- or in the `server.js` file:
  - either by directly declaring them here
  - or by creating a custom file and requiring it in the `server.js` file.

## API configuration

The [API configuration](/developer-docs/latest/setup-deployment-guides/configurations/optional/api.md) options are similar in Strapi v3 and v4, with the exception of the following keys:

- `rest.defaultLimit` is `25` by default (instead of `100` in Strapi v3)
- `rest.maxLimit` is `100` by default (instead of `null` in Strapi v3)
- `rest.prefix` is a new API configuration option. Its default value is `/api` and can be changed to anything but `/`.

The API configuration is optional.

::: details Example of a Strapi v3 API configuration:

```jsx
// path: ./config/api.js

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

:::

::: details Example of a Strapi v4 API configuration:

```js
// path: ./config/api.js

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

:::

## Plugins configuration

::: caution
Strapi v3 plugins may not work with Strapi v4. If you are a plugin developer wanting to upgrade your plugin to Strapi v4, please refer to the [plugin migration guide](/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin-migration.md).
:::

[Plugins configuration](/developer-docs/latest/setup-deployment-guides/configurations/optional/plugins.md) in Strapi v4 include the ability to:

- enable or disable a plugin,
- and have custom resolve locations in addition to custom configuration options.

To migrate to Strapi v4, use the new `enabled` and `resolve` keys and move existing Strapi v3 custom configuration keys into a nested `config` object:

::: details Example of a Strapi v3 plugins configuration:

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

::: details Example of a Strapi v4 plugins configuration:

```jsx
// path: ./config/plugins.js

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

::: note
For specific plugin configurations, please refer to the dedicated plugin's documentation.
:::

## Custom functions folder

The `config/functions` folder and all of its content no longer exist in Strapi v4. [The `bootstrap.js` file](#bootstrap-function) and [CRON tasks](#cron-tasks) have their own dedicated configuration options but global functions are no longer automatically added to the Strapi internal API.

When creating universal utility functions in Strapi v4, it's recommended to:

- either create a [plugin](/developer-docs/latest/development/plugins-development.md) dedicated to holding those utility functions,
- or build [services](/developer-docs/latest/development/backend-customization/services.md) that can be called from anywhere in the Strapi backend.

## Bootstrap function

The dedicated `bootstrap.js` file no longer exists in Strapi v4 and is now a global function combined with the new `register` function. `bootstrap()` and `register()` can be found in `./src/index.js` (see [functions documentation](/developer-docs/latest/setup-deployment-guides/configurations/optional/functions.md)).

## Custom responses

Due to the standardization of the response and error handling structures in Strapi v4, it's no longer possible to customize the response structure or add custom response structures.

For custom error messages, please refer to the [error handling](/developer-docs/latest/developer-resources/error-handling.md) documentation or the [requests & responses](/developer-docs/latest/development/backend-customization/requests-responses.md) documentation.


::: strapi Next steps
[Migrating the back end code](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend.md) of Strapi to v4 also requires to at least migrate the core features of the Strapi server, such as the [dependencies](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/dependencies.md), [routes](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/routes.md), [controllers](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/controllers.md), [services](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/services.md), and [content-type schema](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/content-type-schema.md).
:::
