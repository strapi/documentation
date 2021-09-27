---
title: Configurations - Strapi Developer Documentation
description: Learn how you can manage and customize the configuration of your Strapi application.
sidebarDepth: auto
---

# Configurations

Your application configuration lives in the `config` folder. All the configuration files are loaded on startup and can be accessed through the configuration provider.

When you have a file `./config/server.js` with the following config:

```js
module.exports = {
  host: '0.0.0.0',
};
```

You can access it as

```js
strapi.config.get('server.host', 'defaultValueIfUndefined');
```

Nested keys are accessible with `dot-notation`.

:::note
Notice that the filename is used as a prefix to access the configurations.
:::

## Required configurations

### Database

This file lets you define database connections that will be used to store your application content.

:::note
You can find [supported database and versions](/developer-docs/latest/setup-deployment-guides/installation/cli.html#preparing-the-installation) in the local installation process.
:::

**Path —** `./config/database.js`.

:::: tabs card

::: tab Bookshelf

- `defaultConnection` (string): Connection by default for models which are not related to a specific `connection`. Default value: `default`.
- `connections` List of all available connections.
  - `default`
    - `connector` (string): Connector used by the current connection. Will be `bookshelf`.
    - `settings` Useful for external session stores such as Redis.
      - `client` (string): Database client to create the connection. `sqlite` or `postgres` or `mysql`.
      - `host` (string): Database host name. Default value: `localhost`.
      - `port` (integer): Database port.
      - `database` (string): Database name.
      - `username` (string): Username used to establish the connection.
      - `password` (string): Password used to establish the connection.
      - `timezone` (string): Set the default behavior for local time. Default value: `utc` [Timezone options](https://www.php.net/manual/en/timezones.php).
      - `schema` (string): Set the default database schema. **Used only for Postgres DB.**
      - `ssl` (boolean/object): For ssl database connection. Object is used to pass certificate files as strings.
    - `options` Options used for database connection.
      - `debug` (boolean): Show database exchanges and errors.
      - `autoMigration` (boolean): To disable auto tables/columns creation for SQL database.
      - `pool` Options used for database connection pooling. For default value and more information, look at [Knex's pool config documentation](https://knexjs.org/#Installation-pooling).
        - `min` (integer): Minimum number of connections to keep in the pool.
        - `max` (integer): Maximum number of connections to keep in the pool.
        - `acquireTimeoutMillis` (integer): Maximum time in milliseconds to wait for acquiring a connection from the pool.
        - `createTimeoutMillis` (integer): Maximum time in milliseconds to wait for creating a connection to be added to the pool.
        - `idleTimeoutMillis` (integer): Number of milliseconds to wait before destroying idle connections.
        - `reapIntervalMillis` (integer): How often to check for idle connections in milliseconds.
        - `createRetryIntervalMillis` (integer): How long to idle after a failed create before trying again in milliseconds.

:::

::: tab Mongoose

- `defaultConnection` (string): Connection by default for models which are not related to a specific `connection`. Default value: `default`.
- `connections` List of all available connections.
  - `default`
    - `connector` (string): Connector used by the current connection. Will be `mongoose`.
    - `settings` Useful for external session stores such as Redis.
      - `client` (string): Database client to create the connection. Will be `mongo`.
      - `host` (string): Database host name. Default value: `localhost`.
      - `port` (integer): Database port. Default value: `27017`.
      - `database` (string): Database name.
      - `username` (string): Username used to establish the connection.
      - `password` (string): Password used to establish the connection.
      - `uri` (string): This can overide all previous configurations - _optional_
    - `options` Options used for database connection.
      - `ssl` (boolean): For ssl database connection.
      - `sslCA` (string): Pass content (not filepath!) of server's root CA for ssl connection.
      - `debug` (boolean): Show database exchanges and errors.
      - `authenticationDatabase` (string): Connect with authentication.

:::

::::

::::: tabs card

:::: tab PostgreSQL

```js
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

:::caution
We are aware that there is an issue regarding **SSL support for the server**.
In order to fix it, you have to to set the `ssl:{}` object as a boolean in order to disable it. See below for example:

```js
module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'bookshelf',
      settings: {
        client: 'postgres',
          ...
        ssl: env('DATABASE_SSL', false)
      },
      options: {},
    },
  },
});
```

:::

Please note that if you need client side SSL CA verification you will need to use the `ssl:{}` object with the fs module to convert your CA certificate to a string. You can see an example below:

```js
module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'bookshelf',
      settings: {
        client: 'postgres',
          ...
        ssl: {
          ca: fs.readFileSync(`${__dirname}/path/to/your/ca-certificate.crt`).toString(),
        },
      },
      options: {},
    },
  },
});
```

::::

:::: tab MySQL/MariaDB

```js
module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'bookshelf',
      settings: {
        client: 'mysql',
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'strapi'),
        username: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
      },
      options: {},
    },
  },
});
```

::::

:::: tab SQLite

```js
module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'bookshelf',
      settings: {
        client: 'sqlite',
        filename: env('DATABASE_FILENAME', '.tmp/data.db'),
      },
      options: {
        useNullAsDefault: true,
      },
    },
  },
});
```

::::

:::: tab MongoDB

:::caution
!!!include(developer-docs/latest/snippets/mongodb-warning.md)!!!
:::

```js
module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'mongoose',
      settings: {
        client: 'mongo',
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 27017),
        database: env('DATABASE_NAME', 'strapi'),
        username: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
      },
      options: {
        authenticationDatabase: env('AUTHENTICATION_DATABASE'),
        ssl: env('DATABASE_SSL'),
      },
    },
  },
});
```

::::

:::::

::: tip
Take a look at the [database's guide](/developer-docs/latest/setup-deployment-guides/configurations.md#databases-installation-guides) for more details.
:::

#### Configuration in database

Configuration files are not multi server friendly. So we created a data store for config you will want to update in production.

##### Get settings

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

##### Set settings

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

#### Databases installation guides

Strapi gives you the option to choose the most appropriate database for your project. It currently supports **PostgreSQL**, **MongoDB**, **SQLite**, **MySQL** and
**MariaDB**. The following documentation covers how to install these databases locally (for development purposes) and on various hosted or cloud server solutions (for staging or production purposes).

::: tip
Deploying **Strapi** itself is covered in the [Deployment Guide](/developer-docs/latest/setup-deployment-guides/deployment.md).
:::

<DatabasesLinks>
</DatabasesLinks>

### Server

:::: tabs card

::: tab Minimal

#### Minimal Server Config

This is the default config created with any new project, all these keys are required at the very least, environmental configs do not need to contain all these values so long as they exist in the default `./config/server.js`.

**Path —** `./config/server.js`.

```js
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', 'someSecretKey'),
    },
  },
});
```

:::

::: tab Full

#### Full Server Config

This is an example of a full configuration, typically certain keys do not need to present in environmental configs, and not all of these keys are required. Please see the table below to see what each key does.

**Path —** `./config/server.js`.

```javascript
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  socket: '/tmp/nginx.socket', // only use if absolutely required
  emitErrors: false,
  url: env('PUBLIC_URL', 'https://api.example.com'),
  proxy: env.bool('IS_PROXIED', true),
  cron: {
    enabled: env.bool('CRON_ENABLED', false),
  },
  admin: {
    auth: {
      events: {
        onConnectionSuccess(e) {
          console.log(e.user, e.provider);
        },
        onConnectionError(e) {
          console.error(e.error, e.provider);
        },
      },
      secret: env('ADMIN_JWT_SECRET', 'someSecretKey'),
    },
    url: env('PUBLIC_ADMIN_URL', '/dashboard'),
    autoOpen: false,
    watchIgnoreFiles: [
      './my-custom-folder', // Folder
      './scripts/someScript.sh', // File
    ],
    host: 'localhost', // Only used for --watch-admin
    port: 8003, // Only used for --watch-admin
    serveAdminPanel: env.bool('SERVE_ADMIN', true),
    forgotPassword: {
      from: 'no-reply@example.com',
      replyTo: 'no-reply@example.com',
    },
  },
});
```

:::

::::

##### Available options

| Property                                | Description                                                                                                                                                                                                                                                                                                                                                                 | Type              | Default                                                                                                                          |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `host`                                  | Host name                                                                                                                                                                                                                                                                                                                                                                   | string            | `localhost`                                                                                                                      |
| `port`                                  | Port on which the server should be running.                                                                                                                                                                                                                                                                                                                                 | integer           | `1337`                                                                                                                           |
| `socket`                                | Listens on a socket. Host and port are cosmetic when this option is provided and likewise use `url` to generate proper urls when using this option. This option is useful for running a server without exposing a port and using proxy servers on the same machine (e.g [Heroku nginx buildpack](https://github.com/heroku/heroku-buildpack-nginx#requirements-proxy-mode)) | string \| integer | `/tmp/nginx.socket`                                                                                                              |
| `emitErrors`                            | Enable errors to be emitted to `koa` when they happen in order to attach custom logic or use error reporting services.                                                                                                                                                                                                                                                      | boolean           | `false`                                                                                                                          |
| `url`                                   | Public url of the server. Required for many different features (ex: reset password, third login providers etc.). Also enables proxy support such as Apache or Nginx, example: `https://mywebsite.com/api`. The url can be relative, if so, it is used with `http://${host}:${port}` as the base url. An absolute url is however **recommended**.                            | string            | `''`                                                                                                                             |
| `proxy`                                 | Set the koa variable `app.proxy`. When `true`, proxy header fields will be trusted.                                                                                                                                                                                                                                                                                         | boolean           | `false`                                                                                                                          |
| `cron`                                  | Cron configuration (powered by [`node-schedule`](https://github.com/node-schedule/node-schedule))                                                                                                                                                                                                                                                                           | Object            |                                                                                                                                  |
| `cron.enabled`                          | Enable or disable CRON tasks to schedule jobs at specific dates.                                                                                                                                                                                                                                                                                                            | boolean           | `false`                                                                                                                          |
| `admin`                                 | Admin panel configuration                                                                                                                                                                                                                                                                                                                                                   | Object            |                                                                                                                                  |
| `admin.auth`                            | Authentication configuration                                                                                                                                                                                                                                                                                                                                                | Object            |                                                                                                                                  |
| `admin.auth.secret`                     | Secret used to encode JWT tokens                                                                                                                                                                                                                                                                                                                                            | string            | `undefined`                                                                                                                      |
| `admin.auth.events`                     | Record of all the events subscribers registered for the authentication                                                                                                                                                                                                                                                                                                      | object            | `{}`                                                                                                                             |
| `admin.auth.events.onConnectionSuccess` | Function called when an admin user log in successfully to the administration panel                                                                                                                                                                                                                                                                                          | function          | `undefined`                                                                                                                      |
| `admin.auth.events.onConnectionError`   | Function called when an admin user fails to log in to the administration panel                                                                                                                                                                                                                                                                                              | function          | `undefined`                                                                                                                      |
| `admin.url`                             | Url of your admin panel. Default value: `/admin`. Note: If the url is relative, it will be concatenated with `url`.                                                                                                                                                                                                                                                         | string            | `/admin`                                                                                                                         |
| `admin.autoOpen`                        | Enable or disabled administration opening on start.                                                                                                                                                                                                                                                                                                                         | boolean           | `true`                                                                                                                           |
| `admin.watchIgnoreFiles`                | Add custom files that should not be watched during development. See more [here](https://github.com/paulmillr/chokidar#path-filtering) (property `ignored`).                                                                                                                                                                                                                 | Array(string)     | `[]`                                                                                                                             |
| `admin.host`                            | Use a different host for the admin panel. Only used along with `strapi develop --watch-admin`                                                                                                                                                                                                                                                                               | string            | `localhost`                                                                                                                      |
| `admin.port`                            | Use a different port for the admin panel. Only used along with `strapi develop --watch-admin`                                                                                                                                                                                                                                                                               | string            | `8000`                                                                                                                           |
| `admin.serveAdminPanel`                 | If false, the admin panel won't be served. Note: the `index.html` will still be served, see [defaultIndex option](/developer-docs/latest/setup-deployment-guides/configurations.md#global-middlewares)                                                                                                                                                                      | boolean           | `true`                                                                                                                           |
| `admin.forgotPassword`                  | Settings to customize the forgot password email (see more here: [Forgot Password Email](/developer-docs/latest/development/admin-customization.md#forgot-password-email))                                                                                                                                                                                                   | Object            | {}                                                                                                                               |
| `admin.forgotPassword.emailTemplate`    | Email template as defined in [email plugin](/developer-docs/latest/development/plugins/email.md#programmatic-usage)                                                                                                                                                                                                                                                         | Object            | [Default template](https://github.com/strapi/strapi/tree/master/packages/strapi-admin/config/email-templates/forgot-password.js) |
| `admin.forgotPassword.from`             | Sender mail address                                                                                                                                                                                                                                                                                                                                                         | string            | Default value defined in your [provider configuration](/developer-docs/latest/development/plugins/email.md#configure-the-plugin) |
| `admin.forgotPassword.replyTo`          | Default address or addresses the receiver is asked to reply to                                                                                                                                                                                                                                                                                                              | string            | Default value defined in your [provider configuration](/developer-docs/latest/development/plugins/email.md#configure-the-plugin) |

### Formats

You can either use `.js` or `.json` files to configure your application.

When using a `.js` you can either export an object:

```js
module.exports = {
  mySecret: 'someValue',
};
```

or a function returning a configuration object (recommended usage). The function will get access to the [`env` utility](#casting-environment-variables).

```js
module.exports = ({ env }) => {
  return {
    mySecret: 'someValue',
  };
};
```

## Optional configurations

Strapi also offers some optional configuration options for specific features, such as:

- [middlewares](/developer-docs/latest/setup-deployment-guides/configurations/optional/middlewares.md)
- [functions](/developer-docs/latest/setup-deployment-guides/configurations/optional/functions.md)
- [public-assets](/developer-docs/latest/setup-deployment-guides/configurations/optional/public-assets.md)
- [api](/developer-docs/latest/setup-deployment-guides/configurations/optional/api.md)
- [environment](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md)
- [Single Sign-On](/developer-docs/latest/setup-deployment-guides/configurations/optional/sso.md) <GoldBadge link="https://strapi.io/pricing-self-hosted/" withLinkIcon />
- [Role-Based Access Control](/developer-docs/latest/setup-deployment-guides/configurations/optional/rbac.md) <BronzeBadge link="https://strapi.io/pricing-self-hosted"/> <SilverBadge link="https://strapi.io/pricing-self-hosted"/> <GoldBadge link="https://strapi.io/pricing-self-hosted" withLinkIcon/>
