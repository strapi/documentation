---
title: Configuration
displayed_sidebar: devDocsSidebar
description: Migrate your configuration from Strapi v3.6.x to v4.0.x with step-by-step instructions

pagination_next: dev-docs/migration/v3-to-v4/code/dependencies
sidebarDepth: 3
---

# v4 code migration: Updating configuration

This guide is part of the [v4 code migration guide](/dev-docs/migration/v3-to-v4/code-migration) designed to help you migrate the code of a Strapi application from v3.6.x to v4.0.x

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

:::note
This part of the code migration guide is not an exhaustive resource for Strapi v4 configurations, which are described in the [configurations documentation](/dev-docs/configurations).
:::

## Database configuration

:::caution
MongoDB databases are no longer supported in Strapi v4. You need to migrate to [a compatible SQL database](/dev-docs/installation/cli#preparing-the-installation) to use Strapi v4.
<!-- TODO: add link to MongoDB migration instructions here -->
:::

Due to the complete rewrite of the database and query layers in Strapi v4, the entire structure of the `database.js` file has changed (see [database configuration](/dev-docs/configurations/database#configuration-structure) documentation). Multi-database support has been dropped, so there is no more `defaultConnection` key. Instead, in Strapi v4, the 2 main database configuration objects are:

- `connection`, passed to the database connection manager package (i.e. [Knex.js](https://github.com/knex/knex)),
- and `settings` for Strapi-specific settings.

:::note
Strapi v4 does not abstract Knex.js key names so some key names are different in Strapi v3 and v4 (e.g. `username` in Strapi v3 is now `user` in Strapi v4) (see [database configuration](/dev-docs/configurations/database) documentation).
:::

<details>
<summary> Example of a Strapi v3 database configuration for PostgreSQL:</summary>

```js title="./config/database.js"

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

</details>

<details>
<summary> Example of a Strapi v4 database configuration for PostgreSQL:</summary>

```jsx title="./config/database.js"

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

</details>

## Server configuration

The [server configuration](/dev-docs/configurations/server) in Strapi v4 is similar to Strapi v3, with the following exceptions:

- All admin panel-related settings (i.e. `admin.*` keys) are in the [`admin.js` file](#admin-panel-configuration).
- CRON tasks (configured with `cron.*` keys) can be directly referenced in the `./config/server.js` or imported from any other custom files (see [`cron-tasks.js` file](#cron-tasks)).
- `app.keys` is a new configuration option for the refactored [session middleware](/dev-docs/configurations/middlewares#session) and is used to create secure session keys.

<details>
<summary> Example of a Strapi v3 server configuration:</summary>

```jsx title="./config/server.js"

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  admin: {
    // ...
  },
});
```

</details>

<details>
<summary> Example of a Strapi v4 server configuration:</summary>

```jsx title="./config/server.js"

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
});
```

</details>

## Admin panel configuration

In Strapi v3, admin panel configuration is defined inside an `admin` object within the `server.js` configuration file.

In Strapi v4, the admin panel configuration is defined in `./config/admin.js` (see [project structure](/dev-docs/project-structure)).

By default, in Strapi v4, only 2 keys are required in `admin.js`:

- `apiToken.salt` is used as the salt key for the new [API tokens feature](/dev-docs/configurations/api-tokens),
- `auth.secret` (previously located in the `server.js` file in Strapi v3) is used to encrypt JWTs for the admin panel.

The admin panel configuration documentation lists all the other [available options](/dev-docs/configurations/admin-panel#available-options).

<details>
<summary> Example of a Strapi v3 server.js admin configuration section:</summary>

```jsx title="./config/server.js"

module.exports = ({ env }) => ({
  // ...
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', '77b2c87dbab4e1697bec244226fbd1b3'),
    },
  },
});
```

</details>

<details>
<summary> Example of a Strapi v4 admin.js configuration file:</summary>

```jsx title="./config/admin.js"

module.exports = ({ env }) => ({
  apiToken: {
    salt: env('API_TOKEN_SALT', 'd9b0df66ff97a666027e665707b4e3e7'),
  },
  auth: {
    secret: env('ADMIN_JWT_SECRET', '77b2c87dbab4e1697bec244226fbd1b3'),
  },
});
```

</details>

## Middlewares configuration

[Middlewares](/dev-docs/backend-customization/middlewares) in Strapi v4 have been entirely overhauled and the Strapi v3 configuration format (e.g. `load order`, `before`, and `after` keys) is replaced with a single array representing the loading order.

[Middlewares configuration](/dev-docs/configurations/middlewares#optional-configuration) in Strapi v4 is defined in the `./config/middlewares.js` file (plural file name, instead of `middleware.js` in Strapi v3).

<details>
<summary> Example of Strapi v3 middlewares configuration:</summary>

```jsx title="./config/middleware.js"

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

</details>

<details>
<summary> Example of Strapi v4 middlewares configuration:</summary>

**Important**: Various middlewares in this list are required. During configuration, replace the string with the object format (see [middlewares configuration](/dev-docs/configurations/middlewares#optional-configuration)).

```jsx title="./config/middlewares.js"

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

</details>

:::note
In Strapi v4, security middlewares from Strapi v3 have been removed and replaced with [koa-helmet](https://www.npmjs.com/package/koa-helmet), which is a Koa.js wrapper for [helmet](https://github.com/helmetjs/helmet). This package replaces all security middlewares except for `cors` (see [internal middlewares configuration reference](/dev-docs/configurations/middlewares#internal-middlewares-configuration-reference)).
:::

## CRON tasks

In Strapi v3, CRON tasks could be defined in a `./config/functions/cron.js` file.

In Strapi v4, the `config/functions` folder [does not exist anymore](#custom-functions-folder), and [CRON tasks](/dev-docs/configurations/cron) can be defined:

- in a separate file (e.g. `./config/cron-tasks.js`)
- or in the `server.js` file:
  - either by directly declaring them here
  - or by creating a custom file and requiring it in the `server.js` file.

## API configuration

The [API configuration](/dev-docs/configurations/api) options are similar in Strapi v3 and v4, with the exception of the following keys:

- `rest.defaultLimit` is `25` by default (instead of `100` in Strapi v3)
- `rest.maxLimit` is `100` by default (instead of `null` in Strapi v3)
- `rest.prefix` is a new API configuration option. Its default value is `/api` and can be changed to anything but `/`.

The API configuration is optional.

<details>
<summary> Example of a Strapi v3 API configuration:</summary>

```jsx title="./config/api.js"

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

</details>

<details>
<summary> Example of a Strapi v4 API configuration:</summary>

```js title="./config/api.js"

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

</details>

## Plugins configuration

:::caution
Strapi v3 plugins may not work with Strapi v4. If you are a plugin developer wanting to upgrade your plugin to Strapi v4, please refer to the [plugin migration guide](/dev-docs/migration/v3-to-v4/plugin-migration).
:::

[Plugins configuration](/dev-docs/configurations/plugins) in Strapi v4 include the ability to:

- enable or disable a plugin,
- and have custom resolve locations in addition to custom configuration options.

To migrate to Strapi v4, use the new `enabled` and `resolve` keys and move existing Strapi v3 custom configuration keys into a nested `config` object:

<details>
<summary> Example of a Strapi v3 plugins configuration:</summary>

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

</details>

<details>
<summary> Example of a Strapi v4 plugins configuration:</summary>

```jsx title="./config/plugins.js"

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

</details>

:::note
For specific plugin configurations, please refer to the dedicated plugin's documentation.
:::

## Custom functions folder

The `config/functions` folder and all of its content no longer exist in Strapi v4. [The `bootstrap.js` file](#bootstrap-function) and [CRON tasks](#cron-tasks) have their own dedicated configuration options but global functions are no longer automatically added to the Strapi internal API.

When creating universal utility functions in Strapi v4, it's recommended to:

- either create a [plugin](/dev-docs/plugins-development) dedicated to holding those utility functions,
- or build [services](/dev-docs/backend-customization/services) that can be called from anywhere in the Strapi backend.

## Bootstrap function

The dedicated `bootstrap.js` file no longer exists in Strapi v4 and is now a global function combined with the new `register` function. `bootstrap()` and `register()` can be found in `./src/index.js` (see [functions documentation](/dev-docs/configurations/functions)).

## Custom responses

Due to the standardization of the response and error handling structures in Strapi v4, it's no longer possible to customize the response structure or add custom response structures.

For custom error messages, please refer to the [error handling](/dev-docs/error-handling) documentation or the [requests & responses](/dev-docs/backend-customization/requests-responses) documentation.


:::strapi Next steps
[Migrating the backend code](/dev-docs/migration/v3-to-v4/code/backend) of Strapi to v4 also requires to at least migrate the core features of the Strapi server, such as the [dependencies](/dev-docs/migration/v3-to-v4/code/dependencies), [routes](/dev-docs/migration/v3-to-v4/code/routes), [controllers](/dev-docs/migration/v3-to-v4/code/controllers), [services](/dev-docs/migration/v3-to-v4/code/services), and [content-type schema](/dev-docs/migration/v3-to-v4/code/content-type-schema).
:::
