---
sidebarDepth: 3
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

:::tip NOTE
Notice that the filename is used as a prefix to access the configurations.
:::

## Required configurations

### Database

This file lets you define database connections that will be used to store your application content.

::: tip NOTE
You can find [supported database and versions](/developer-docs/latest/setup-deployment-guides/installation/cli.md#databases) in the local installation process.
:::

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

### Environment

In case you need specific static configurations for specific environments, and using environment variables becomes tedious, Strapi configurations can be created per environment in `./config/env/{env}/{filename}`.

These configurations will be merged into the base configurations defined in the `./config` folder.
The environment is based on the `NODE_ENV` environment variable (defaults to `development`).

When starting Strapi with `NODE_ENV=production` it will load the configuration from `./config/*` and `./config/env/production/*`. Everything defined in the production config will override the default config.

In combination with environment variables this pattern becomes really powerful.

Examples:

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

When starting your application:

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

### Environment variables

#### List of Strapi's environment variables

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

#### Configuration using environment variables

In most use cases you will have different configurations between your environments. For example: your database credentials.

Instead of writing those credentials into your configuration files, you can define those variables in a `.env` file at the root of your application.

**Example:**

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

### API

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

#### Available options

| Property                      | Description                                                                                                                                                       | Type         | Default |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------- |
| `responses`                   | Global API response configuration                                                                                                                                 | Object       |         |
| `responses.privateAttributes` | Set of globally defined attributes to be treated as private. E.g. `_v` when using MongoDb or timestamps like `created_at`, `updated_at` can be treated as private | String array | `[]`    |
| `rest`                        | REST API configuration                                                                                                                                            | Object       |         |
| `rest.defaultLimit`           | Specifies default `_limit` parameter used in API calls                                                                                                            | Integer      | `100`   |
| `rest.maxLimit`               | Specifies max allowed number that can be requested as `_limit`. Default to `null` which fetches all results                                                       | Integer      | `null`  |

### Plugins

A plugin is like a small independent sub-application. It has its own business logic with dedicated models, controllers, services, middlewares or hooks. It can also have its own UI integrated in the admin panel.

::: tip
Please refer to the [plugins documentation](/developer-docs/latest/development/local-plugins-customization.md) for more information.
:::

### Hooks

The hooks are modules that add functionality to the core. They are loaded during the server boot.

#### Structure

##### File structure

```js
module.exports = strapi => {
  const hook = {
    /**
     * Default options
     */

    defaults: {
      // config object
    },

    /**
     * Initialize the hook
     */

    async initialize() {
      // await someAsyncCode()
      // const settings = {...this.defaults, ...strapi.config.hook.settings.**};
    },
  };

  return hook;
};
```

- `defaults` (object): Contains the default configurations.
- `initialize` (function): Called during the server boot.

The [configurations](#configuration-and-activation) of the hook are accessible through `strapi.config.hook.settings.**`.

The hooks are accessible through the `strapi.hook` variable.

##### Node modules

Every folder that follows this name pattern `strapi-hook-*` in your `./node_modules` folder will be loaded as a hook.

A hook needs to follow the structure below:

```
/strapi-hook-[...]
└─── lib
     - index.js
- LICENSE.md
- package.json
- README.md
```

The `index.js` is the entry point to your hook. It should look like the example above.

##### Custom local hooks

The framework allows loading hooks from the project directly without having to install them from npm. It's a great way to take advantage of the features of the hooks system for code that doesn't need to be shared between apps. To achieve this, you have to create a `./hooks` folder at the root of your project and put the hooks into it.

```
/project
└─── admin
└─── api
└─── config
│    - hook.js
└─── hooks
│   └─── strapi-documentation
│        - index.js
│   └─── strapi-server-side-rendering
│        - index.js
└─── public
- favicon.ico
- package.json
- server.js
```

#### Configuration and activation

To activate and configure hooks with custom options, you need to add/edit your `./config/hook.js` file in your Strapi app. A hook specific timeout value will overwrite the global timeout value, the default `timeout` value is 1000 milliseconds.

```js
module.exports = {
  timeout: 2000,
  settings: {
    'hook-name': {
      enabled: true,
      timeout: 3000,
    },
  },
};
```

### Middlewares

The middlewares are functions which are composed and executed in a stack-like manner upon request. If you are not familiar with the middleware stack in Koa, we highly recommend you to read the [Koa's documentation introduction](http://koajs.com/#introduction).

#### Structure

##### File structure

```js
module.exports = strapi => {
  return {
    // can also be async
    initialize() {
      strapi.app.use(async (ctx, next) => {
        // await someAsyncCode()

        await next();

        // await someAsyncCode()
      });
    },
  };
};
```

- `initialize` (function): Called during the server boot.

The middlewares are accessible through the `strapi.middleware` variable.

##### Node modules

Every folder that follows this name pattern `strapi-middleware-*` in your `./node_modules` folder will be loaded as a middleware.

A middleware needs to follow the structure below:

```
/middleware
└─── lib
     - index.js
- LICENSE.md
- package.json
- README.md
```

The `index.js` is the entry point to your middleware. It should look like the example above.

##### Custom middlewares

The framework allows the application to override the default middlewares and add new ones. You have to create a `./middlewares` folder at the root of your project and put the middlewares into it.

```
/project
└─── api
└─── config
└─── middlewares
│   └─── responseTime // It will override the core default responseTime middleware.
│        - index.js
│   └─── views // It will be added into the stack of middleware.
│        - index.js
└─── public
- favicon.ico
- package.json
- server.js
```

Every middleware will be injected into the Koa stack. To manage the load order, please refer to the [Middleware order section](#load-order).

#### Configuration and activation

To configure the middlewares of your application, you need to create or edit the `./config/middleware.js` file in your Strapi app.

By default this file doesn't exist, you will have to create it.

**Available options**

- `timeout` (integer): Defines the maximum allowed milliseconds to load a middleware.
- `load` (Object): Configuration middleware loading. See details [here](#load-order)
- `settings` (Object): Configuration of each middleware
  - `{middlewareName}` (Object): Configuration of one middleware
    - `enabled` (boolean): Tells Strapi to run the middleware or not

##### Settings

**Example**:

**Path —** `./config/middleware.js`.

```js
module.exports = {
  //...
  settings: {
    cors: {
      origin: ['http://localhost', 'https://mysite.com', 'https://www.mysite.com'],
    },
  },
};
```

##### Load order

The middlewares are injected into the Koa stack asynchronously. Sometimes it happens that some of these middlewares need to be loaded in a specific order. To define a load order, create or edit the file `./config/middleware.js`.

**Path —** `./config/middleware.js`.

```js
module.exports = {
  load: {
    before: ['responseTime', 'logger', 'cors', 'responses'],
    order: [
      "Define the middlewares' load order by putting their name in this array in the right order",
    ],
    after: ['parser', 'router'],
  },
};
```

- `load`:
  - `before`: Array of middlewares that need to be loaded in the first place. The order of this array matters.
  - `order`: Array of middlewares that need to be loaded in a specific order.
  - `after`: Array of middlewares that need to be loaded at the end of the stack. The order of this array matters.

#### Core middleware configurations

The core of Strapi embraces a small list of middlewares for performances, security and great error handling.

- boom
- cors
- cron
- csp
- favicon
- gzip
- hsts
- ip
- language
- logger
- p3p
- parser
- public
- responses
- responseTime
- router
- session
- xframe
- xss

::: tip
The following middlewares cannot be disabled: responses, router, logger and boom.
:::

##### Global middlewares

- `favicon`
  - `path` (string): Path to the favicon file. Default value: `favicon.ico`.
  - `maxAge` (integer): Cache-control max-age directive in ms. Default value: `86400000`.
- `public`
  - `path` (string): Path to the public folder. Default value: `./public`.
  - `maxAge` (integer): Cache-control max-age directive in ms. Default value: `60000`.
  - `defaultIndex` (boolean): Display default index page at `/` and `/index.html`. Default value: `true`.

##### Request middlewares

- `session`
  - `enabled` (boolean): Enable or disable sessions. Default value: `false`.
- `logger`
  - `level` (string): Default log level. Default value: `debug`.
  - `exposeInContext` (boolean): Expose logger in context so it can be used through `strapi.log.info(‘my log’)`. Default value: `true`.
  - `requests` (boolean): Enable or disable requests logs. Default value: `false`.
- `parser` (See [koa-body](https://github.com/dlau/koa-body#options) for more information)
  - `enabled`(boolean): Enable or disable parser. Default value: `true`.
  - `multipart` (boolean): Enable or disable multipart bodies parsing. Default value: `true`.
  - `jsonLimit` (string|integer): The byte (if integer) limit of the JSON body. Default value: `1mb`.
  - `formLimit` (string|integer): The byte (if integer) limit of the form body. Default value: `56k`.
  - `queryStringParser` (see [qs](https://github.com/ljharb/qs) for a full list of options).
    - `arrayLimit` (integer): the maximum length of an array in the query string. Any array members with an index of greater than the limit will instead be converted to an object with the index as the key. Default value: `100`.
    - `depth` (integer): maximum parsing depth of nested query string objects. Default value: `20`.

::: tip
The session doesn't work with `mongo` as a client. The package that we should use is broken for now.
:::

##### Response middlewares

- [`gzip`](https://en.wikipedia.org/wiki/Gzip)
  - `enabled` (boolean): Enable or not GZIP response compression.
  - `options` (Object): Allow passing of options from [koa-compress](https://github.com/koajs/compress#options).
- `responseTime`
  - `enabled` (boolean): Enable or not `X-Response-Time header` to response. Default value: `false`.
- `poweredBy`
  - `enabled` (boolean): Enable or not `X-Powered-By` header to response. Default value: `true`.
  - `value` (string): The value of the header. Default value: `Strapi <strapi.io>`

::: tip
`gzip` compression via `koa-compress` uses [Brotli](https://en.wikipedia.org/wiki/Brotli) by default, but is not configured with sensible defaults for most cases. If you experience slow response times with `gzip` enabled, consider disabling Brotli by passing `{br: false}` as an option. You may also pass more sensible params with `{br: { params: { // YOUR PARAMS HERE } }}`
:::

##### Security middlewares

- [`csp`](https://en.wikipedia.org/wiki/Content_Security_Policy)
  - `enabled` (boolean): Enable or disable CSP to avoid Cross Site Scripting (XSS) and data injection attacks.
  - `policy` (string): Configures the `Content-Security-Policy` header. If not specified uses default value. Default value: `undefined`.
- [`p3p`](https://en.wikipedia.org/wiki/P3P)
  - `enabled` (boolean): Enable or disable p3p.
- [`hsts`](https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security)
  - `enabled` (boolean): Enable or disable HSTS.
  - `maxAge` (integer): Number of seconds HSTS is in effect. Default value: `31536000`.
  - `includeSubDomains` (boolean): Applies HSTS to all subdomains of the host. Default value: `true`.
- [`xframe`](https://en.wikipedia.org/wiki/Clickjacking)
  - `enabled` (boolean): Enable or disable `X-FRAME-OPTIONS` headers in response.
  - `value` (string): The value for the header, e.g. DENY, SAMEORIGIN or ALLOW-FROM uri. Default value: `SAMEORIGIN`.
- [`xss`](https://en.wikipedia.org/wiki/Cross-site_scripting)
  - `enabled` (boolean): Enable or disable XSS to prevent Cross Site Scripting (XSS) attacks in older IE browsers (IE8).
- [`cors`](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
  - `enabled` (boolean): Enable or disable CORS to prevent your server to be requested from another domain.
  - `origin` (string or array): Allowed URLs (`http://example1.com, http://example2.com`, `['http://www.example1.com', 'http://example1.com']` or allows everyone `*`). Default value: `*`.
  - `expose` (array): Configures the `Access-Control-Expose-Headers` CORS header. If not specified, no custom headers are exposed. Default value: `["WWW-Authenticate", "Server-Authorization"]`.
  - `maxAge` (integer): Configures the `Access-Control-Max-Age` CORS header. Default value: `31536000`.
  - `credentials` (boolean): Configures the `Access-Control-Allow-Credentials` CORS header. Default value: `true`.
  - `methods` (array)|String - Configures the `Access-Control-Allow-Methods` CORS header. Default value: `["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"]`.
  - `headers` (array): Configures the `Access-Control-Allow-Headers` CORS header. If not specified, defaults to reflecting the headers specified in the request's Access-Control-Request-Headers header. Default value: `["Content-Type", "Authorization", "X-Frame-Options"]`.
- `ip`
  - `enabled` (boolean): Enable or disable IP blocker. Default value: `false`.
  - `whiteList` (array): Whitelisted IPs. Default value: `[]`.
  - `blackList` (array): Blacklisted IPs. Default value: `[]`.

#### Example

Create your custom middleware.

**Path —** `./middlewares/timer/index.js`

```js
module.exports = strapi => {
  return {
    initialize() {
      strapi.app.use(async (ctx, next) => {
        const start = Date.now();

        await next();

        const delta = Math.ceil(Date.now() - start);

        ctx.set('X-Response-Time', delta + 'ms');
      });
    },
  };
};
```

Enable the middleware in environments settings.

Load a middleware at the very first place

**Path —** `./config/middleware.js`

```js
module.exports = {
  load: {
    before: ['timer', 'responseTime', 'logger', 'cors', 'responses', 'gzip'],
    order: [
      "Define the middlewares' load order by putting their name in this array is the right order",
    ],
    after: ['parser', 'router'],
  },
  settings: {
    timer: {
      enabled: true,
    },
  },
};
```

### Functions

The `./config/functions/` folder contains a set of JavaScript files in order to add dynamic and logic based configurations.

All functions that are exposed in this folder are accessible via `strapi.config.functions['fileName']();`

<!-- The text above will be identified as a broken link by the check-links VuePress plugin, because its syntax looks like an empty link. You can safely ignore the error. -->

#### Bootstrap

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

#### CRON tasks

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

#### Database ORM customization

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

### Public assets

Public assets are static files such as images, video, css, etc. that you want to make accessible to the outside world.

Because an API may need to serve static assets, every new Strapi project includes by default, a folder named `/public`. Any file located in this directory is accessible if the request's path doesn't match any other defined route and if it matches a public file name.

Example:

An image named `company-logo.png` in `./public/` is accessible through `/company-logo.png` URL.

::: tip
`index.html` files are served if the request corresponds to a folder name (`/pictures` url will try to serve `public/pictures/index.html` file).
:::

::: warning
The dotfiles are not exposed. It means that every file name that starts with `.`, such as `.htaccess` or `.gitignore`, are not served.
:::

### Single Sign On <GoldBadge link="https://strapi.io/pricing/" withLinkIcon />

***

Single-Sign-On on Strapi allows you to configure additional sign-in and sign-up methods for your administration panel.

::: warning CAUTION
It is currently not possible to associate a unique SSO provider to an email address used for a Strapi account, meaning that the access to a Strapi account cannot be restricted to only one SSO provider. For more information and workarounds to solve this issue, [please refer to the dedicated GitHub issue](https://github.com/strapi/strapi/issues/9466#issuecomment-783587648).
:::

#### Prerequisites

- A Strapi application running on version 3.5.0 or higher is required.
- To configure SSO on your application, you will need an EE license with a Gold plan.
- Make sure Strapi is part of the applications you can access with your provider. For example, with Microsoft (Azure) Active Directory, you must first ask someone with the right permissions to add Strapi to the list of allowed applications. Please refer to your provider(s) documentation to learn more about that.

#### Usage

SSO configuration lives in the server configuration of your application found within `/config/server.js`.

##### Accessing the configuration

The providers' configuration should be written within the `admin.auth.providers` path of the server configuration.

`admin.auth.providers` is an array of [provider configuration](#provider-configuration).

```javascript
module.exports = ({ env }) => ({
  // ...
  admin: {
    // ...
    auth: {
      providers: [], // The providers' configuration lives there
    },
  },
});
```

##### Provider Configuration

A provider's configuration is a Javascript object built with the following properties:

| Name             | Required | Type     | Description                                                                                                            |
| ---------------- | -------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `uid`            | true     | string   | The UID of the strategy. It must match the strategy's name                                                             |
| `displayName`    | true     | string   | The name that will be used on the login page to reference the provider                                                 |
| `icon`           | false    | string   | An image URL. If specified, it will replace the displayName on the login page                                          |
| `createStrategy` | true     | function | A factory that will build and return a new passport strategy for your provider. Takes the strapi instance as parameter |

::: tip
The `uid` property is the unique identifier of each strategy and is generally found in the strategy's package. If you are not sure of what it refers to, please contact the maintainer of the strategy.
:::

###### The `createStrategy` Factory

A passport strategy is usually built by instantiating it using 2 parameters: the configuration object, and the verify function.

<!-- Title below is supposed to be an h7, so one level deeper than "The `createStrategy` Factory. But h7 is not a thing, so using bold instead. 🤷 -->
**Configuration Object**

The configuration object depends on the strategy needs, but often asks for a callback URL to be redirected to once the connection has been made on the provider side.

You can generate a specific callback URL for your provider using the `getStrategyCallbackURL` method. This URL also needs to be written on the provider side in order to allow redirection from it.

The format of the callback URL is the following: `/admin/connect/<provider_uid>`.

::: tip
`strapi.admin.services.passport.getStrategyCallbackURL` is a Strapi helper you can use to get a callback URL for a specific provider. It takes a provider name as a parameter and returns a URL.
:::

If needed, this is also where you will put your client ID and secret key for your OAuth2 application.

**Verify Function**

The verify function is used here as a middleware allowing the user to transform and make extra processing on the data returned from the provider API.

This function always takes a `done` method as last parameter which is used to transfer needed data to the Strapi layer of SSO.

Its signature is the following: `void done(error: any, data: object);` and it follows the following rules:

- If `error` is not set to `null`, then the data sent is ignored, and the controller will throw an error.
- If the SSO's auto-registration feature is disabled, then the `data` object only need to be composed of an `email` property.
- If the SSO's auto-registration feature is enabled, then you will need to define (in addition to the `email`) either a `username` property or both `firstname` and `lastname` within the `data` oject.

###### Adding a provider

Adding a new provider means adding a new way for your administrators to log-in.

To achieve a great flexibility and a large choice of provider, Strapi uses [Passport.js](http://www.passportjs.org/). Any valid passport strategy that doesn't need additional custom data should therefore work with Strapi.

::: warning
Strategies such as [ldapauth](https://github.com/vesse/passport-ldapauth) don't work out of the box since they require extra data to be sent from the admin panel.
If you want to add an LDAP provider to your application, you will need to write a [custom strategy](http://www.passportjs.org/packages/passport-custom/).
You can also use services such as Okta and Auth0 as bridge services.
:::

###### Configuring the provider

To configure a provider, follow the procedure below:

1. Make sure to import your strategy in your server configuration file, either from an installed package or a local file.
2. You'll need to add a new item to the `admin.auth.providers` array in your server configuration that will match the [format given above](#provider-configuration)
3. Restart your application, the provider should appear on your admin login page.

##### Examples

:::::: tabs

::::: tab Google

Using: [passport-google-oauth2](https://github.com/mstade/passport-google-oauth2)

:::: tabs

::: tab yarn

```bash
yarn add passport-google-oauth2
```

:::

::: tab npm

```bash
npm install --save passport-google-oauth2
```

::::

`/config/server.js`

```jsx
'use strict';

const GoogleStrategy = require('passport-google-oauth2');

module.exports = ({ env }) => ({
  // ...
  admin: {
    // ...
    auth: {
      /// ...
      providers: [
        {
          uid: 'google',
          displayName: 'Google',
          icon: 'https://cdn2.iconfinder.com/data/icons/social-icons-33/128/Google-512.png',
          createStrategy: strapi =>
            new GoogleStrategy(
              {
                clientID: env('GOOGLE_CLIENT_ID'),
                clientSecret: env('GOOGLE_CLIENT_SECRET'),
                scope: [
                  'https://www.googleapis.com/auth/userinfo.email',
                  'https://www.googleapis.com/auth/userinfo.profile',
                ],
                callbackURL: strapi.admin.services.passport.getStrategyCallbackURL('google'),
              },
              (request, accessToken, refreshToken, profile, done) => {
                done(null, {
                  email: profile.email,
                  firstname: profile.given_name,
                  lastname: profile.family_name,
                });
              }
            ),
        },
      ],
    },
  },
});
```

:::::

::::: tab Github

Using: [passport-github](https://github.com/cfsghost/passport-github)

:::: tabs

::: tab yarn

```bash
yarn add passport-github2
```

:::

::: tab npm

```bash
npm install --save passport-github2
```

:::

::::

`/config/server.js`

```jsx
'use strict';

const GithubStrategy = require('passport-github2');

module.exports = ({ env }) => ({
  // ...
  admin: {
    // ...
    auth: {
      // ...
      providers: [
        {
          uid: 'github',
          displayName: 'Github',
          icon: 'https://cdn1.iconfinder.com/data/icons/logotypes/32/github-512.png',
          createStrategy: strapi =>
            new GithubStrategy(
              {
                clientID: env('GITHUB_CLIENT_ID'),
                clientSecret: env('GITHUB_CLIENT_SECRET'),
                scope: ['user:email'],
                callbackURL: strapi.admin.services.passport.getStrategyCallbackURL('github'),
              },
              (accessToken, refreshToken, profile, done) => {
                done(null, {
                  email: profile.emails[0].value,
                  username: profile.username,
                });
              }
            ),
        },
      ],
    },
  },
});
```

:::::

::::: tab Discord

Using: [passport-discord](https://github.com/nicholastay/passport-discord#readme)

:::: tabs

::: tab yarn

```bash
yarn add passport-discord
```

:::

::: tab npm

```bash
npm install --save passport-discord
```

:::

::::

`/config/server.js`

```jsx
'use strict';

const DiscordStrategy = require('passport-discord');

module.exports = ({ env }) => ({
  // ...
  admin: {
    // ...
    auth: {
      // ...
      providers: [
        {
          uid: 'discord',
          displayName: 'Discord',
          icon: 'https://cdn0.iconfinder.com/data/icons/free-social-media-set/24/discord-512.png',
          createStrategy: strapi =>
            new DiscordStrategy(
              {
                clientID: env('DISCORD_CLIENT_ID'),
                clientSecret: env('DISCORD_SECRET'),
                callbackURL: strapi.admin.services.passport.getStrategyCallbackURL('discord'),
                scope: ['identify', 'email'],
              },
              (accessToken, refreshToken, profile, done) => {
                done(null, {
                  email: profile.email,
                  username: `${profile.username}#${profile.discriminator}`,
                });
              }
            ),
        },
      ],
    },
  },
});
```

:::::
::::: tab Microsoft

Using: [passport-azure-ad-oauth2](https://github.com/auth0/passport-azure-ad-oauth2#readme)

:::: tabs

::: tab yarn

```bash
yarn add passport-azure-ad-oauth2 jsonwebtoken
```

:::

::: tab npm

```bash
npm install --save passport-azure-ad-oauth2 jsonwebtoken
```

:::

::::

`/config/server.js`

```jsx
'use strict';

const AzureAdOAuth2Strategy = require('passport-azure-ad-oauth2');
const jwt = require('jsonwebtoken');

module.exports = ({ env }) => ({
  // ...
  admin: {
    // ...
    auth: {
      // ...
      providers: [
        {
          uid: 'azure_ad_oauth2',
          displayName: 'Microsoft',
          icon:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/320px-Microsoft_logo_%282012%29.svg.png',
          createStrategy: strapi =>
            new AzureAdOAuth2Strategy(
              {
                clientID: env('MICROSOFT_CLIENT_ID', ''),
                clientSecret: env('MICROSOFT_CLIENT_SECRET', ''),
                scope: ['user:email'],
                tenant: env('MICROSOFT_TENANT_ID', ''),
                callbackURL: strapi.admin.services.passport.getStrategyCallbackURL(
                  'azure_ad_oauth2'
                ),
              },
              (accessToken, refreshToken, params, profile, done) => {
                var waadProfile = jwt.decode(params.id_token, '', true);
                done(null, {
                  email: waadProfile.upn,
                  username: waadProfile.upn,
                });
              }
            ),
        },
      ],
    },
  },
});
```

:::::
::::::

##### Advanced Customization

###### Admin Panel URL

If your administration panel lives on a different host/port than your Strapi server, you will need to modify the admin URL.
To do so, head to your `/config/server.js` configuration file and tweak the `admin.url` field.

For example, if your admin application has been started on `https://api.example.com`, your configuration will look like the following:

`/config/server.js`

```javascript
module.exports = () => ({
  // ...
  admin: {
    // ...
    url: 'https://api.example.com/admin',
  },
});
```

###### Custom Logic

In some scenarios, you will want to write additional logic for your connection workflow such as:

- Restricting connection and registration for a specific domain
- Triggering actions on connection attempt
- Analytics

The easiest way to do so is to plug into the verify function of your strategy and write some code.

For example, if you want to allow only people with an official strapi.io email address, you can instantiate your strategy like this:

```javascript
const strategyInstance = new Strategy(configuration, ({ email, username }, done) => {
  // If the email ends with @strapi.io
  if (email.endsWith('@strapi.io')) {
    // Then we continue with the data given by the provider
    return done(null, { email, username });
  }

  // Otherwise, we continue by sending an error to the done function
  done(new Error('Forbidden email address'));
});
```

###### Authentication Events

The SSO feature adds a new [authentication event](/developer-docs/latest/setup-deployment-guides/configurations.md#available-options): `onSSOAutoRegistration`.

This event is triggered whenever a user is created using the auto-register feature added by SSO.
It contains the created user (`event.user`), and the provider used to make the registration (`event.provider`).

Example:

`/config/server.js`

```javascript
module.exports = () => ({
  // ...
  admin: {
    // ...
    auth: {
      // ...
      events: {
        onConnectionSuccess(e) {},
        onConnectionError(e) {},
        // ...
        onSSOAutoRegistration(e) {
          const { user, provider } = e;

          console.log(
            `A new user (${user.id}) has been automatically registered using ${provider}`
          );
        },
      },
    },
  },
});
```
