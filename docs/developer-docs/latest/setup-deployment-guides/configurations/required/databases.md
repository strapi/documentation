---
title: Database configuration - Strapi Developer Docs
description: Strapi offers a single entry point file to configure its databases.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/required/databases.html
---

# Database configuration

The `./config/database.js` file is used to define database connections that will be used to store the application content.

:::strapi Supported databases
The CLI installation guide details [supported database and versions](/developer-docs/latest/setup-deployment-guides/installation/cli.md#preparing-the-installation).
:::

## Configuration Structure

**Path —** `./config/database.js`.

- `connection` (object): Database configuration options passed to [Knex.js](https://github.com/knex/knex)
  - `client` (string): Database client to create the connection. `sqlite` or `postgres` or `mysql`.
  - `connection` (object): Database connection information
    - `host` (string): Database host name. Default value: `localhost`.
    - `port` (integer): Database port.
    - `database` (string): Database name.
    - `username` (string): Username used to establish the connection.
    - `password` (string): Password used to establish the connection.
    - `timezone` (string): Set the default behavior for local time. Default value: `utc` [Timezone options](https://www.php.net/manual/en/timezones.php).
    - `schema` (string): Set the default database schema. **Used only for Postgres DB.**
    - `ssl` (boolean/object): For ssl database connection. Object is used to pass certificate files as strings.
  - `useNullAsDefault` (boolean): Will use `NULL` as a default value **Used only for SQLite**
  - `debug` (boolean): Show database exchanges and errors.
    <!-- - `autoMigration` (boolean): To disable auto tables/columns creation for SQL database. -->
  - `pool` (object _optional_): [Tarn.js](https://github.com/vincit/tarn.js) database pooling options
    - `min` (integer): Minimum number of database connections to keepalive Default value: `0`
    - `max` (integer): Maximum number of database connections to keepalive Default value: `10`
    - `acquireTimeoutMillis` (integer): Time in ms before timing out a database connection attempt
    - `createTimeoutMillis` (integer): Time in ms before timing out a create query attempt
    - `destroyTimeoutMillis` (integer): Time in ms before timing out a destroy query attempt
    - `idleTimeoutMillis` (integer): Time in ms before free database connections are destroyed
    - `reapIntervalMillis` (integer): Time in ms to check for idle database connections to destroy
    - `createRetryIntervalMillis` (integer): Time in ms to idle before retrying failed create actions
    - `afterCreate` (function): Callback function to execute custom logic when the pool acquires a new connection. See the [Knex.js documentation](https://knexjs.org/#Installation-pooling) for more information
- `settings` (object): Strapi specific database settings
  - `forceMigration` (boolean): Enable or disable the forced database migration. Default value: `true`.

<!-- TODO: Open and track a feature request for autoMigration as it doesn't exist in v4 -->

### Configuration Examples

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
    },
    debug: false,
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
    },
    debug: false,
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
    debug: false,
  },
});
```

::::

:::::

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

Strapi gives you the option to choose the most appropriate database for your project. It currently supports **PostgreSQL**, **SQLite**, **MySQL** and **MariaDB**.

The following documentation covers how to install SQLite locally (for development purposes):

<DatabasesLinks>
</DatabasesLinks>

:::caution
Installation guides for other databases (MySQL, MariaDB) are being reworked. [Contributions](https://github.com/strapi/documentation/blob/main/CONTRIBUTING.md) are most welcome.
:::
