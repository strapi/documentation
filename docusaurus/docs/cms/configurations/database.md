---
title: Database configuration
displayed_sidebar: cmsSidebar
description: Strapi offers a single entry point file to configure its databases.
tags:
- base configuration
- configuration
- database
- database connection
- database settings
- databases installation guides
- MySQL

---

import SupportedDatabases from '/docs/snippets/supported-databases.md'

# Database configuration

The `/config/database.js|ts` file is used to define database connections that will be used to store the application content.

:::strapi Supported databases
The following databases are supported by Strapi:
<SupportedDatabases components={props.components} />
:::

:::warning
 Strapi applications are not meant to be connected to a pre-existing database, not created by a Strapi application, nor connected to a Strapi v3 database. The Strapi team will not support such attempts. Attempting to connect to an unsupported database may, and most likely will, result in lost data.
:::

## Configuration structure

The `/config/database.js|ts` file accepts 2 main configuration objects:

- [`connection`](#connection-configuration-object) for database configuration options passed to <ExternalLink to="https://github.com/knex/knex" text="Knex.js"/>
- [`settings`](#settings-configuration-object) for Strapi-specific database settings

### `connection` configuration object

| Parameter                                                | Description                                                                                           | Type      | Default |
|----------------------------------------------------------|-------------------------------------------------------------------------------------------------------|-----------|---------|
| `client`                                                 | Database client to create the connection.<br/>Accepts the following values:<ul><li>`sqlite` for SQLite databases</li><li>`postgres` for PostgreSQL databases</li><li>`mysql` for MySQL databases</li></ul> | `String`  | -       |
| `connection`                                             | Database [connection information](#connection-parameters)                                             | `Object`  | -       |
| `debug`                                                  | Show database exchanges and errors.                                                                   | `Boolean` | `false` |
| `useNullAsDefault`<br/><br />_Optional, only for SQLite_ | Use `NULL` as a default value                                                                         | `Boolean` | `true`  |
| `pool`<br /><br />_Optional_                             | [Database pooling options](#database-pooling-options)                                                 | `Object`  | -       |
| `acquireConnectionTimeout`<br /><br />_Optional_         | How long knex will wait before throwing a timeout error when acquiring a connection (in milliseconds) | `Integer` | `60000` |

:::note
Strapi only supports the following client values, and will automatically rewrite the `client` value to the following options before passing the configuration to Knex:

| `client` value | Actual package used                                             |
|----------------|-----------------------------------------------------------------|
| sqlite         | <ExternalLink to="https://www.npmjs.com/package/better-sqlite3" text="better-sqlite3"/>  |
| mysql          | <ExternalLink to="https://www.npmjs.com/package/mysql2" text="mysql2"/>                  |
| postgres       | <ExternalLink to="https://www.npmjs.com/package/pg" text="pg"/>                          |
:::

#### Connection parameters

The `connection.connection` object found in `./config/database.js` (or `./config/database.ts` for TypeScript) is used to pass database connection information and accepts the following parameters:

| Parameter  | Description                                                                                                                   | Type                  |
|------------|-------------------------------------------------------------------------------------------------------------------------------|-----------------------|
| `connectionString`| Database connection string. When set, it overrides the other `connection.connection` properties. To disable use an empty string: `''`. <br/> **Available in `v4.6.2`+**           | `String`                  |
| `host`     | Database host name. Default value: `localhost`.                                                                               | `String`              |
| `port`     | Database port                                                                                                                 | `Integer`             |
| `database` | Database name.                                                                                                                | `String`              |
| `user`     | Username used to establish the connection                                                                                     | `String`              |
| `password` | Password used to establish the connection                                                                                     | `String`              |
| `timezone` | Set the default behavior for local time. Default value: `utc` <ExternalLink to="https://www.php.net/manual/en/timezones.php" text="Timezone options"/> | `String`              |
| `schema`   | Set the default database schema. **Used only for Postgres DB.**                                                               | `String`              |
| `ssl`      | For SSL database connection.<br/> Use an object to pass certificate files as strings.                                         | `Boolean` or `Object` |

:::note
Depending on the database client used, more parameters can be set (e.g., `charset` and `collation` for <ExternalLink to="https://github.com/mysqljs/mysql#connection-options" text="mysql"/>). Check the database client documentation to know what parameters are available, for instance the <ExternalLink to="https://node-postgres.com/apis/client#new-client" text="pg"/>, <ExternalLink to="https://github.com/mysqljs/mysql#connection-options" text="mysql"/>, and <ExternalLink to="https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md#new-databasepath-options" text="better-sqlite3"/> documentations.
:::

#### Database pooling options

The `connection.pool` object optionally found in `./config/database.js` (or `./config/database.ts` for TypeScript) is used to pass <ExternalLink to="https://github.com/vincit/tarn.js" text="Tarn.js"/> database pooling options and accepts the following parameters:

:::caution
When using Docker, change the pool `min` value to `0` as Docker will kill any idle connections, making it impossible to keep any open connections to the database (see the <ExternalLink to="https://knexjs.org/guide/#pool" text="Tarn.js pool"/> settings used by Knex.js for more information).
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
| `afterCreate`               | Callback function to execute custom logic when the pool acquires a new connection.<br/><br/>See the <ExternalLink to="https://knexjs.org/#Installation-pooling" text="Knex.js documentation"/> for more information | `Function` | -       |

### `settings` configuration object

The `settings` object found in `./config/database.js` (or `./config/database.ts` for TypeScript) is used to configure Strapi-specific database settings and accepts the following parameters:

| Parameter        | Description                                                     | Type      | Default |
| ---------------- | --------------------------------------------------------------- | --------- | ------- |
| `forceMigration` | Enable or disable the forced database migration.                | `Boolean` | `true`  |
| `runMigrations`  | Enable or disable database migrations from running on start up. | `Boolean` | `true`  |

<!-- TODO: Open and track a feature request for autoMigration as it doesn't exist in v4 -->

### Configuration examples

<Tabs>

<TabItem value="PostgreSQL" label="PostgreSQL">

```js title="./config/database.js"
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

</TabItem>

 <TabItem value="MySQL/MariaDB" label="MySQL/MariaDB">

```js title="./config/database.js"
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

</TabItem>

<TabItem value="SQLite" label="SQLite">

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/database.js"
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

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/database.ts"
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

</TabItem>
</Tabs>

</TabItem>
</Tabs>

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

## Environment variables in database configurations

Strapi version `v4.6.2` and higher includes the database configuration options in the `./config/database.js` or `./config/database.ts` file. When a new project is created the environment variable `DATABASE_CLIENT` with the value `mysql`, `postgres`, or `sqlite` is automatically added to the `.env` file depending on which database you choose during project creation. Additionally, all of the environment variables necessary to connect to your local development database are also added to the `.env` file.  The following is an example of the generated configuration file:

<Tabs groupId="js-ts">
<TabItem value="javascript" label="JavaScript">

```js
const path = require('path');

module.exports = ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');

  const connections = {
    mysql: {
      connection: {
        connectionString: env('DATABASE_URL'),
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', false) && {
          key: env('DATABASE_SSL_KEY', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          ca: env('DATABASE_SSL_CA', undefined),
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
          rejectUnauthorized: env.bool(
            'DATABASE_SSL_REJECT_UNAUTHORIZED',
            true
          ),
        },
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    postgres: {
      connection: {
        connectionString: env('DATABASE_URL'),
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', false) && {
          key: env('DATABASE_SSL_KEY', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          ca: env('DATABASE_SSL_CA', undefined),
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
          rejectUnauthorized: env.bool(
            'DATABASE_SSL_REJECT_UNAUTHORIZED',
            true
          ),
        },
        schema: env('DATABASE_SCHEMA', 'public'),
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    sqlite: {
      connection: {
        filename: path.join(
          __dirname,
          '..',
          env('DATABASE_FILENAME', 'data.db')
        ),
      },
      useNullAsDefault: true,
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts
import path from 'path';

export default = ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');

  const connections = {
    mysql: {
      connection: {
        connectionString: env('DATABASE_URL'),
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', false) && {
          key: env('DATABASE_SSL_KEY', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          ca: env('DATABASE_SSL_CA', undefined),
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
          rejectUnauthorized: env.bool(
            'DATABASE_SSL_REJECT_UNAUTHORIZED',
            true
          ),
        },
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    postgres: {
      connection: {
        connectionString: env('DATABASE_URL'),
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', false) && {
          key: env('DATABASE_SSL_KEY', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          ca: env('DATABASE_SSL_CA', undefined),
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
          rejectUnauthorized: env.bool(
            'DATABASE_SSL_REJECT_UNAUTHORIZED',
            true
          ),
        },
        schema: env('DATABASE_SCHEMA', 'public'),
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    sqlite: {
      connection: {
        filename: path.join(
          __dirname,
          '..',
          env('DATABASE_FILENAME', 'data.db')
        ),
      },
      useNullAsDefault: true,
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};
```

</TabItem>
</Tabs>

The following are examples of the corresponding `.env` file database-related keys for each of the possible databases:

<Tabs>
<TabItem value="mysql"label="MySQL or MariaDB">

```bash

# Database
DATABASE_CLIENT=mysql
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strap1
DATABASE_SSL=false
```

</TabItem>

<TabItem value="postgres" label="PostgreSQL">

```bash

# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi
DATABASE_SSL=false
```

</TabItem>

<TabItem value="sqlite" label="SQLite">

```bash

# Database
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
```

</TabItem>
</Tabs>

### Environment variables for Strapi applications before `v4.6.2`

If you started your project with a version prior to `v4.6.2` you can convert your `database.js|database.ts` configuration file following this procedure:

1. Update your application to `v4.6.2` or a later version. See the [upgrades](/cms/upgrades) documentation.
2. Replace the contents of your `./config/database.js` or `./config/database.ts` file with the preceding JavaScript or TypeScript code.
3. Add the environment variables from the preceding code example to your `.env` file.
4. (_optional_) Add additional environment variables such as `DATABASE_URL` and the properties of the `ssl` object.
5. Save the changes and restart your application.
:::caution
Do not overwrite the environment variables: `HOST`, `PORT`, `APP_KEYS`, `API_TOKEN_SALT`, and `ADMIN_JWT_SECRET`.
:::

### Database connections using `connectionString`

Many managed database solutions use the property `connectionString` to connect a database to an application. Strapi `v4.6.2` and later versions include the `connectionString` property. The `connectionString` is a concatenation of all the database properties in the `connection.connection` object. The `connectionString`:

- overrides the other `connection.connection` properties such as `host` and `port`,
- can be disabled by setting the property to an empty string: `''`.

### Database management by environment

Development of a Strapi application commonly includes customization in the local development environment with a local development database, such as `SQLite`. When the application is ready for another environment such as production or staging the application is deployed with a different database instance, usually `MySQL`, `MariaDB`, or `PostgreSQL`. Database environment variables allow you to switch the attached database. To switch the database connection:

* set a minimum of the `DATABASE_CLIENT` and `DATABASE_URL` for `MySQL`, `MariaDB`, and `PostgreSQL`,
* or set a minimum of `DATABASE_CLIENT` and `DATABASE_FILENAME` for `SQLite`.

For deployed versions of your application the database environment variables should be stored wherever your other secrets are stored. The following table gives examples of where the database environment variables should be stored:

| Hosting option                                        | environment variable storage    |
|-------------------------------------------------------|---------------------------------|
| Virtual private server/virtual machine (e.g. AWS EC2) | `ecosystem.config.js` or `.env` |
| DigitalOcean App Platform                             | `Environment Variables` table   |
| Heroku                                                | `Config vars` table                   |

## Databases installation

Strapi gives you the option to choose the most appropriate database for your project. Strapi supports PostgreSQL, SQLite, or MySQL.

### SQLite

SQLite is the default (see [Quick Start Guide](/cms/quick-start)) and recommended database to quickly create an application locally.

#### Install SQLite during application creation

Use one of the following commands:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn create strapi-app my-project --quickstart
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npx create-strapi-app@latest my-project --quickstart
```

</TabItem>

</Tabs>

This will create a new project and launch it in the browser.

#### Install SQLite manually

In a terminal, run the following command:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn add better-sqlite3
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm install better-sqlite3
```

</TabItem>

</Tabs>

Add the following code to your `/config/database.ts|js` file:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/database.js"
module.exports = ({ env }) => ({
  connection: {
    client: 'sqlite',
    connection: {
      filename: path.join(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')),
    },
    useNullAsDefault: true,
  },
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/database.ts"
import path from 'path';

export default ({ env }) => ({
  connection: {
    client: 'sqlite',
    connection: {
      filename: path.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')),
    },
    useNullAsDefault: true,
  },
});
```

</TabItem>

</Tabs>

### PostgreSQL

When connecting Strapi to a PostgreSQL database, the database user requires SCHEMA permissions. While the database admin has this permission by default, a new database user explicitly created for the Strapi application will not. This would result in a 500 error when trying to load the admin console.

To create a new PostgreSQL user with the SCHEMA permission, use the following steps:

```shell
# Create a new database user with a secure password
$ CREATE USER my_strapi_db_user WITH PASSWORD 'password';
# Connect to the database as the PostgreSQL admin
$ \c my_strapi_db_name admin_user
# Grant schema privileges to the user
$ GRANT ALL ON SCHEMA public TO my_strapi_db_user;
```
