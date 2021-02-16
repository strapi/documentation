---
sidebarDepth: 2
---

# Configuration

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

:::tip NOTE
Notice that the filename is used as a prefix to access the configurations.
:::

## Formats

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

## Environment variables

### List of Strapi's environment variables

Some settings can only be modified through environment variables. Here is a list of those settings are associated environment variable names:

| name                                 | description                                                                                                           | type    | default         |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ------- | --------------- |
| `STRAPI_DISABLE_UPDATE_NOTIFICATION` | Don't show the notification message about updating strapi in the terminal                                             | boolean | `false`         |
| `STRAPI_HIDE_STARTUP_MESSAGE`        | Don't show the startup message in the terminal                                                                        | boolean | `false`         |
| `STRAPI_TELEMETRY_DISABLED`          | Don't send telemetry usage data to Strapi                                                                             | boolean | `false`         |
| `STRAPI_LOG_TIMESTAMP`               | Add the timestamp info in logs                                                                                        | boolean | `false`         |
| `STRAPI_LOG_LEVEL`                   | Select the level of logs among `fatal`, `error`, `warn`, `info`, `debug`, `trace`                                     | string  | `'info'`        |
| `STRAPI_LOG_FORCE_COLOR`             | Force colors to be displayed even in environments that are not supposed to have colors enabled (ex: outside of a TTY) | boolean | `true`          |
| `STRAPI_LOG_PRETTY_PRINT`            | Log lines are displayed as text instead of as object                                                                  | boolean | `true`          |
| `STRAPI_LICENSE`                     | The license key to activate the Enterprise Edition                                                                    | string  | `undefined`     |
| `NODE_ENV`                           | Type of environment where the app is running                                                                          | string  | `'development'` |
| `BROWSER`                            | Open the admin panel in the browser after startup                                                                     | boolean | `true`          |
| `ENV_PATH`                           | Path to the file that contains your environment variables                                                             | string  | `'./.env'`      |

### Configuration using environment variables

In most use cases you will have different configurations between your environments. For example: your database credentials.

Instead of writing those credentials into your configuration files, you can define those variables in a `.env` file at the root of your application.

**Example**

**Path —** `.env`

```
DATABASE_PASSWORD=acme
```

If you want to customize the path of the `.env` file to load you can set an environment variable called `ENV_PATH` before starting your application:

```sh
$ ENV_PATH=/absolute/path/to/.env npm run start
```

Now you can access those variables in your configuration files and application. You can use `process.env.{varName}` to access those variables anywhere.

In your configuration files you will have access to a `env` utility that allows defining defaults and casting values.

**Path —** `./config/database.js`

```js
module.exports = ({ env }) => ({
  connections: {
    default: {
      settings: {
        password: env('DATABASE_PASSWORD'),
      },
    },
  },
});
```

#### Casting environment variables

```js
// Returns the env if defined without casting it
env('VAR', 'default');

// Cast to int (using parseInt)
env.int('VAR', 0);

// Cast to float (using parseFloat)
env.float('VAR', 3.14);

// Cast to boolean (check if the value is equal to 'true')
env.bool('VAR', true);

// Cast to js object (using JSON.parse)
env.json('VAR', { key: 'value' });

// Cast to an array (syntax: ENV_VAR=[value1, value2, value3] | ENV_VAR=["value1", "value2", "value3"])
env.array('VAR', [1, 2, 3]);

// Case to date (using new Date(value))
env.date('VAR', new Date());
```

## Environments

What if you need specific static configurations for specific environments and using environment variables becomes tedious?

Strapi configurations can also be created per environment in `./config/env/{env}/{filename}`. These configurations will be merged into the base configurations defined in the `./config` folder.
The environment is based on the `NODE_ENV` environment variable (defaults to `development`).

When starting Strapi with `NODE_ENV=production` it will load the configuration from `./config/*` and `./config/env/production/*`. Everything defined in the production config will override the default config.

In combination with environment variables this pattern becomes really powerful:

**Example**

`./config/server.js`

```js
module.exports = {
  host: '127.0.0.1',
};
```

`./config/env/production/server.js`

```js
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
});
```

When you start your application

```bash
yarn start
# uses host 127.0.0.1
```

```bash
NODE_ENV=production yarn start
# uses host 0.0.0.0
```

```bash
HOST=10.0.0.1 NODE_ENV=production yarn start
# uses host 10.0.0.1
```

## Server

### Examples

:::: tabs

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

```js
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
      secret: env('ADMIN_JWT_SECRET', 'someSecretKey'),
    },
    url: env('PUBLIC_ADMIN_URL', '/dashboard'),
    autoOpen: false,
    watchIgnoreFiles: [
      './my-custom-folder', // Folder
      './scripts/someScript.sh' // File
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

### Available options

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| `host` | Host name | string | `localhost` |
| `port` | Port on which the server should be running. | integer | `1337` |
| `socket` | Listens on a socket. Host and port are cosmetic when this option is provided and likewise use `url` to generate proper urls when using this option. This option is useful for running a server without exposing a port and using proxy servers on the same machine (e.g [Heroku nginx buildpack](https://github.com/heroku/heroku-buildpack-nginx#requirements-proxy-mode)) | string \| integer | `/tmp/nginx.socket` |
| `emitErrors` | Enable errors to be emitted to `koa` when they happen in order to attach custom logic or use error reporting services. | boolean | `false` |
| `url` | Public url of the server. Required for many different features (ex: reset password, third login providers etc.). Also enables proxy support such as Apache or Nginx, example: `https://mywebsite.com/api`. The url can be relative, if so, it is used with `http://${host}:${port}` as the base url. An absolute url is however **recommended**.| string | `''` |
|`proxy`| Set the koa variable `app.proxy`. When `true`, proxy header fields will be trusted. |boolean|`false`|
| `cron` | Cron configuration (powered by [`node-schedule`](https://github.com/node-schedule/node-schedule)) | Object | |
| `cron.enabled` | Enable or disable CRON tasks to schedule jobs at specific dates. | boolean | `false` |
| `admin` | Admin panel configuration | Object | |
| `admin.auth` | Authentication configuration | Object | |
| `admin.auth.secret`| Secret used to encode JWT tokens | string| `undefined` |
| `admin.url` | Url of your admin panel. Default value: `/admin`. Note: If the url is relative, it will be concatenated with `url`. | string | `/admin` |
| `admin.autoOpen` | Enable or disabled administration opening on start. | boolean | `true` |
| `admin.watchIgnoreFiles` | Add custom files that should not be watched during development. See more [here](https://github.com/paulmillr/chokidar#path-filtering) (property `ignored`). | Array(string) | `[]` |
| `admin.host` | Use a different host for the admin panel. Only used along with `strapi develop --watch-admin` | string | `localhost` |
| `admin.port` | Use a different port for the admin panel. Only used along with `strapi develop --watch-admin` | string | `8000` |
| `admin.serveAdminPanel` | If false, the admin panel won't be served. Note: the `index.html` will still be served, see [defaultIndex option](./middlewares.md#global-middlewares) | boolean | `true` |
| `admin.forgotPassword` | Settings to customize the forgot password email (see more here: [Forgot Password Email](../admin-panel/forgot-password.md)) | Object | {} |
| `admin.forgotPassword.emailTemplate` | Email template as defined in [email plugin](../plugins/email.md#programmatic-usage) | Object | [Default template](https://github.com/strapi/strapi/tree/master/packages/strapi-admin/config/email-templates/forgot-password.js) |
| `admin.forgotPassword.from` | Sender mail address | string | Default value defined in your [provider configuration](../plugins/email.md#configure-the-plugin) |
| `admin.forgotPassword.replyTo` | Default address or addresses the receiver is asked to reply to | string | Default value defined in your [provider configuration](../plugins/email.md#configure-the-plugin) |

## API

**Path —** `./config/api.js`.

```js
module.exports = ({ env }) => ({
  responses: {
    privateAttributes: ['_v', 'id', 'created_at'],
  },
  rest: {
    defaultLimit: 100,
    maxLimit: 250,
  },
});
```

**Available options**

| Property                      | Description                                                                                                                                                       | Type         | Default |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------- |
| `responses`                   | Global API response configuration                                                                                                                                 | Object       |         |
| `responses.privateAttributes` | Set of globally defined attributes to be treated as private. E.g. `_v` when using MongoDb or timestamps like `created_at`, `updated_at` can be treated as private | String array | `[]`    |
| `rest`                        | REST API configuration                                                                                                                                            | Object       |         |
| `rest.defaultLimit`           | Specifies default `_limit` parameter used in API calls                                                                                                            | Integer      | `100`   |
| `rest.maxLimit`               | Specifies max allowed number that can be requested as `_limit`. Default to `null` which fetches all results                                                         | Integer      | `null`    |

## Functions

The `./config/functions/` folder contains a set of JavaScript files in order to add dynamic and logic based configurations.

All functions that are exposed in this folder are accessible via `strapi.config.functions['fileName']();`

### Bootstrap

**Path —** `./config/functions/bootstrap.js`.

The `bootstrap` function is called at every server start. You can use it to add a specific logic at this moment of your server's lifecycle.

Here are some use cases:

- Create an admin user if there isn't one.
- Fill the database with some necessary data.
- Load some environment variables.

The bootstrap function can be synchronous or asynchronous.

**Synchronous**

```js
module.exports = () => {
  // some sync code
};
```

**Return a promise**

```js
module.exports = () => {
  return new Promise(/* some code */);
};
```

**Asynchronous**

```js
module.exports = async () => {
  await someSetup();
};
```

### CRON tasks

CRON tasks allow you to schedule jobs (arbitrary functions) for execution at specific dates, with optional recurrence rules. It only uses a single timer at any given time (rather than reevaluating upcoming jobs every second/minute).

This feature is powered by [`node-schedule`](https://www.npmjs.com/package/node-schedule) node modules. Check it for more information.

::: warning
Make sure the `enabled` cron config is set to `true` in `./config/server.js` file.
:::

The cron format consists of:

```
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)
```

To define a CRON job, add your logic like below:

**Path —** `./config/functions/cron.js`.

```js
module.exports = {
  /**
   * Simple example.
   * Every monday at 1am.
   */

  '0 0 1 * * 1': () => {
    // Add your own logic here (e.g. send a queue of email, create a database backup, etc.).
  },
};
```

If your CRON task is required to run based on a specific timezone then you can configure the task like below:

```js
module.exports = {
  /**
   * CRON task with timezone example.
   * Every monday at 1am for Asia/Dhaka timezone.
   * List of valid timezones: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List
   */

  '0 0 1 * * 1': {
    task: () => {
      // Add your own logic here (e.g. send a queue of email, create a database backup, etc.).
    },
    options: {
      tz: 'Asia/Dhaka',
    },
  },
};
```

### Database ORM customization

When present, they are loaded to let you customize your database connection instance, for example for adding some plugin, customizing parameters, etc.

You will need to install the plugin using the normal `npm install the-plugin-name` or any of the other supported package tools such as yarn then follow the below examples to load them.

:::: tabs

::: tab Mongoose

As an example, for using the `mongoose-simple-random` plugin for MongoDB, you can register it like this:

**Path —** `./config/functions/mongoose.js`.

```js
'use strict';

const random = require('mongoose-simple-random');

module.exports = (mongoose, connection) => {
  mongoose.plugin(random);
};
```

:::

::: tab Bookshelf

Another example would be using the `bookshelf-uuid` plugin for MySQL, you can register it like this:

**Path —** `./config/functions/bookshelf.js`.

```js
'use strict';

module.exports = (bookshelf, connection) => {
  bookshelf.plugin('bookshelf-uuid');
};
```

:::

::::

## Database

This file lets you define database connections that will be used to store your application content.

You can find [supported database and versions](../installation/cli.md#databases) in the local installation process.

**Path —** `./config/database.js`.

:::: tabs

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

#### Example

**Path —** `./config/database.js`.

:::: tabs

::: tab PostgreSQL

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
      options: {
        ssl: env.bool('DATABASE_SSL', false),
      },
    },
  },
});
```

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
      options: {
        ssl: true
      },
    },
  },
});
```

:::

::: tab MySQL/MariaDB

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

:::

::: tab SQLite

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

:::

::: tab MongoDB

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

:::

::::

::: tip
Take a look at the [database's guide](../guides/databases.md) for more details.
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
