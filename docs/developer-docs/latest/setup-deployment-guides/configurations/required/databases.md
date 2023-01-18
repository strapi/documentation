---
title: Database configuration - Strapi Developer Docs
description: Strapi offers a single entry point file to configure its databases.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/required/databases.html
---

# Database configuration

The `./config/database.js` file (or the `./config/database.ts` file for TypeScript) is used to define database connections that will be used to store the application content. 

:::warning
 Strapi applications are not meant to be connected to a pre-existing database, not created by a Strapi application, nor connected to a Strapi v3 database. The Strapi team will not support such attempts. Attempting to connect to an unsupported database may, and most likely will, result in lost data.
:::

:::strapi Supported databases
The CLI installation guide details [supported database and versions](/developer-docs/latest/setup-deployment-guides/installation/cli.md#preparing-the-installation).
:::

## Configuration structure

The `./config/database.js` (or `./config/database.ts` for TypeScript) accepts 2 main configuration objects:

- [`connection`](#connection-configuration-object) for database configuration options passed to [Knex.js](https://github.com/knex/knex)
- [`settings`](#settings-configuration-object) for Strapi-specific database settings

### `connection` configuration object

| Parameter                                                | Description                                                                                           | Type      | Default |
|----------------------------------------------------------|-------------------------------------------------------------------------------------------------------|-----------|---------|
| `client`                                                 | Database client to create the connection. `sqlite` or `postgres` or `mysql`.                          | `String`  | -       |
| `connection`                                             | Database [connection information](#connection-parameters)                                             | `Object`  | -       |
| `debug`                                                  | Show database exchanges and errors.                                                                   | `Boolean` | `false` |
| `useNullAsDefault`<br/><br />_Optional, only for SQLite_ | Use `NULL` as a default value                                                                         | `Boolean` | `true`  |
| `pool`<br /><br />_Optional_                             | [Database pooling options](#database-pooling-options)                                                 | `Object`  | -       |
| `acquireConnectionTimeout`<br /><br />_Optional_         | How long knex will wait before throwing a timeout error when acquiring a connection (in milliseconds) | `Integer` | `60000` |

#### Connection parameters

The `connection.connection` object found in `./config/database.js` (or `./config/database.ts` for TypeScript) is used to pass database connection information and accepts the following parameters:

| Parameter  | Description                                                                                                                   | Type                  |
|------------|-------------------------------------------------------------------------------------------------------------------------------|-----------------------|
| `connectionString`| Database connection string. When set, it overrides the other `connection.connection` properties. To disable use an empty string: `''`.                    | `String`                  |
| `host`     | Database host name. Default value: `localhost`.                                                                               | `String`              |
| `port`     | Database port                                                                                                                 | `Integer`             |
| `database` | Database name.                                                                                                                | `String`              |
| `user`     | Username used to establish the connection                                                                                     | `String`              |
| `password` | Password used to establish the connection                                                                                     | `String`              |
| `timezone` | Set the default behavior for local time. Default value: `utc` [Timezone options](https://www.php.net/manual/en/timezones.php) | `String`              |
| `schema`   | Set the default database schema. **Used only for Postgres DB.**                                                               | `String`              |
| `ssl`      | For SSL database connection.<br/> Use an object to pass certificate files as strings.                                         | `Boolean` or `Object` |

:::note
Depending on the database client used, more parameters can be set (e.g., `charset` and `collation` for [mysql](https://github.com/mysqljs/mysql#connection-options)). Check the database client documentation to know what parameters are available, for instance the [pg](https://node-postgres.com/apis/client#new-client), [mysql](https://github.com/mysqljs/mysql#connection-options), and [better-sqlite3](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md#new-databasepath-options) documentations.
:::
  
#### Database pooling options

The `connection.pool` object optionally found in `./config/database.js` (or `./config/database.ts` for TypeScript) is used to pass [Tarn.js](https://github.com/vincit/tarn.js) database pooling options and accepts the following parameters:

::: caution
When using Docker, change the pool `min` value to `0` as Docker will kill any idle connections, making it impossible to keep any open connections to the database (see [Tarn.js's pool](https://knexjs.org/guide/#pool) settings used by Knex.js for more information).
:::

| Parameter                   | Description                                                                                                                                                                                | Type       | Default |
|-----------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|---------|
| `min`                       | Minimum number of database connections to keepalive                                                                                                                                        | `Integer`  | `2`     |
| `max`                       | Maximum number of database connections to keepalive                                                                                                                                        | `Integer`  | `10`    |
| `acquireTimeoutMillis`      | Time in milliseconds before timing out a database connection attempt                                                                                                                       | `Integer`  | `60000` |
| `createTimeoutMillis`       | Time in milliseconds before timing out a create query attempt                                                                                                                              | `Integer`  | `30000` |
| `destroyTimeoutMillis`      | Time in milliseconds before timing out a destroy query attempt                                                                                                                             | `Integer`  | `5000`  |
| `idleTimeoutMillis`         | Time in milliseconds before free database connections are destroyed                                                                                                                        | `Integer`  | `30000` |
| `reapIntervalMillis`        | Time in milliseconds to check for idle database connections to destroy                                                                                                                     | `Integer`  | `1000`  |
| `createRetryIntervalMillis` | Time in milliseconds to idle before retrying failed create actions                                                                                                                         | `Integer`  | `200`   |
| `afterCreate`               | Callback function to execute custom logic when the pool acquires a new connection.<br/><br/>See the [Knex.js documentation](https://knexjs.org/#Installation-pooling) for more information | `Function` | -       |

### `settings` configuration object

The `settings` object found in `./config/database.js` (or `./config/database.ts` for TypeScript) is used to configure Strapi-specific database settings and accepts the following parameters:

| Parameter        | Description                                                     | Type      | Default |
| ---------------- | --------------------------------------------------------------- | --------- | ------- |
| `forceMigration` | Enable or disable the forced database migration.                | `Boolean` | `true`  |
| `runMigrations`  | Enable or disable database migrations from running on start up. | `Boolean` | `true`  |

<!-- TODO: Open and track a feature request for autoMigration as it doesn't exist in v4 -->

### Configuration examples

::::: tabs card

:::: tab PostgreSQL

```js
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
Strapi is aware that there is an issue regarding **SSL support for the server**.
In order to fix it, you have to set the `ssl:{}` object as a boolean in order to disable it. See below for example:

```js
module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
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
    client: 'postgres',
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
// path: ./config/database.js

module.exports = ({ env }) => ({
  connection: {
    client: 'mysql',
    connection: {
      host: env('DATABASE_HOST', '127.0.0.1'),
      port: env.int('DATABASE_PORT', 3306),
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
<code-group>

<code-block title="JAVASCRIPT">

```js
// path: ./config/database.js

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

</code-block>

<code-block title="TYPESCRIPT">

```js
// path: ./config/database.ts

import path from 'path';

export default ({ env }) => ({
  connection: {
    client: 'sqlite',
    connection: {
      filename: path.join(
        __dirname,
        '..',
        '..',
        env('DATABASE_FILENAME', path.join('.tmp', 'data.db'))
      ),
    },
    useNullAsDefault: true,
  },
});
```

</code-block>

</code-group>

::::

:::::

## Configuration in database

Configuration files are not multi-server friendly. To update configurations in production you can use a data store to get and set settings.

### Get settings

- `environment` (string): Sets the environment you want to store the data in. By default it's current environment (can be an empty string if your configuration is environment agnostic).
- `type` (string): Sets if your configuration is for an `api`, `plugin` or `core`. By default it's `core`.
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

:::note
When connecting Strapi to a PostgreSQL database, the database user requires SCHEMA permissions. While the database admin has this permission by default, a new database user explicitly created for the Strapi application will not. This would result in a 500 error when trying to load the admin console.

To create a new PostgreSQL user with the SCHEMA permission, use the following steps.

```shell
# Create a new database user with a secure password
$ CREATE USER my_strapi_db_user WITH PASSWORD 'password';

# Connect to the database as the PostgreSQL admin
$ \c my_strapi_db_name admin_user

# Grant schema privileges to the user
$ GRANT ALL ON SCHEMA public TO my_strapi_db_user;
```
:::
