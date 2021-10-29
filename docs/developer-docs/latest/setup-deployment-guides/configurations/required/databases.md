---
title: Database configuration - Strapi Developer Documentation
description:
---

<!-- TODO: update SEO -->

# Database configuration

The `./config/database.js` file is used to define database connections that will be used to store the application content.

:::strapi Supported databases
The CLI installation guide details [supported database and versions](http://localhost:8080/documentation/developer-docs/latest/setup-deployment-guides/installation/cli.md#preparing-the-installation).
:::

**Path —** `./config/database.js`.

:::: tabs card

::: tab SQL

- `connection`
  - `client` (string): Database client to create the connection. `sqlite` or `postgres` or `mysql`.
  - `connection`
    - `host` (string): Database host name. Default value: `localhost`.
    - `port` (integer): Database port.
    - `database` (string): Database name.
    - `username` (string): Username used to establish the connection.
    - `password` (string): Password used to establish the connection.
    - `timezone` (string): Set the default behavior for local time. Default value: `utc` [Timezone options](https://www.php.net/manual/en/timezones.php).
    - `schema` (string): Set the default database schema. **Used only for Postgres DB.**
    - `ssl` (boolean/object): For ssl database connection. Object is used to pass certificate files as strings.
  - `debug` (boolean): Show database exchanges and errors.
  - `autoMigration` (boolean): To disable auto tables/columns creation for SQL database.

<!-- TODO: Confirm on Pool settings for Knex -->

:::

::::

::::: tabs card

:::: tab PostgreSQL

```js
module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', '127.0.0.1'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'strapi'),
      user: env('DATABASE_USERNAME', 'strapi'),
      password: env('DATABASE_PASSWORD', 'strapi'),
      schema: env('DATABASE_SCHEMA', 'public'), // Not required
      ssl: {
        rejectUnauthorized: env.bool('DATABASE_SSL_SELF', false), // For self-signed certificates
      },
      debug: false,
    },
  },
});
```

:::caution
We are aware that there is an issue regarding **SSL support for the server**.
In order to fix it, you have to to set the `ssl:{}` object as a boolean in order to disable it. See below for example:

```js
module.exports = ({ env }) => ({
  connection: {
    client: "postgres",
    connection: {
      ...
      ssl: env('DATABASE_SSL', false)
    },
  },
});
```

:::

Please note that if you need client side SSL CA verification you will need to use the `ssl:{}` object with the fs module to convert your CA certificate to a string. You can see an example below:

```js
const fs = require('fs');

module.exports = ({ env }) => ({
  connection: {
    client: "postgres",
    connection: {
      ...
      ssl: {
        ca: fs.readFileSync(`${__dirname}/path/to/your/ca-certificate.crt`).toString(),
      },
    },
  },
});
```

::::

:::: tab MySQL/MariaDB

```js
module.exports = ({ env }) => ({
  connection: {
    client: 'mysql',
    connection: {
      host: env('DATABASE_HOST', '127.0.0.1'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'strapi'),
      user: env('DATABASE_USERNAME', 'strapi'),
      password: env('DATABASE_PASSWORD', 'strapi'),
      ssl: {
        rejectUnauthorized: env.bool('DATABASE_SSL_SELF', false), // For self-signed certificates
      },
      debug: false,
    },
  },
});
```

::::

:::: tab SQLite

```js
module.exports = ({ env }) => ({
  connection: {
    client: 'sqlite',
    connection: {
      filename: env('DATABASE_FILENAME', '.tmp/data.db'),
    },
    useNullAsDefault: true,
  },
});
```

::::

:::::

::: tip
Take a look at the [database's guide](#databases-installation-guides) for more details.
:::

## Configuration in database

Configuration files are not multi server friendly. So we created a data store for config you will want to update in production.

### Get settings

- `environment` (string): Sets the environment you want to store the data in. By default it's current environment (can be an empty string if your config is environment agnostic).
- `type` (string): Sets if your config is for an `api`, `plugin` or `core`. By default it's `core`.
- `name` (string): You have to set the plugin or api name if `type` is `api` or `plugin`.
- `key` (string, required): The name of the key you want to store.

```js
// strapi.store(object).get(object);

// create reusable plugin store variable
const pluginStore = strapi.store({
  environment: strapi.config.environment,
  type: 'plugin',
  name: 'users-permissions',
});

await pluginStore.get({ key: 'grant' });
```

### Set settings

- `value` (any, required): The value you want to store.

```js
// strapi.store(object).set(object);

// create reusable plugin store variable
const pluginStore = strapi.store({
  environment: strapi.config.environment,
  type: 'plugin',
  name: 'users-permissions'
});

await pluginStore.set({
  key: 'grant',
  value: {
    ...
  }
});
```

## Databases installation guides

Strapi gives you the option to choose the most appropriate database for your project. It currently supports **PostgreSQL**, **SQLite**, **MySQL** and
**MariaDB**. The following documentation covers how to install these databases locally (for development purposes) and on various hosted or cloud server solutions (for staging or production purposes).

<DatabasesLinks>
</DatabasesLinks>

::: strapi Strapi deployment
Deploying Strapi itself is covered in the [deployment guide](/developer-docs/latest/setup-deployment-guides/deployment.md).
:::
