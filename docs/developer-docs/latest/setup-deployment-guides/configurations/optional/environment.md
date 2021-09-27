---
title: Environment configuration and environment variables - Strapi Developer Documentation
description:
---

<!-- TODO: update SEO -->

# Environment configuration and environment variables

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

## Environment variables

### List of Strapi's environment variables

Some settings can only be modified through environment variables. Here is a list of those settings are associated environment variable names:

| name                                  | description                                                                                                                                                                                                                                                                                                                         | type    | default         |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | --------------- |
| `STRAPI_DISABLE_UPDATE_NOTIFICATION`  | Don't show the notification message about updating strapi in the terminal                                                                                                                                                                                                                                                           | boolean | `false`         |
| `STRAPI_HIDE_STARTUP_MESSAGE`         | Don't show the startup message in the terminal                                                                                                                                                                                                                                                                                      | boolean | `false`         |
| `STRAPI_TELEMETRY_DISABLED`           | Don't send telemetry usage data to Strapi                                                                                                                                                                                                                                                                                           | boolean | `false`         |
| `STRAPI_LICENSE`                      | The license key to activate the Enterprise Edition                                                                                                                                                                                                                                                                                  | string  | `undefined`     |
| `NODE_ENV`                            | Type of environment where the app is running                                                                                                                                                                                                                                                                                        | string  | `'development'` |
| `BROWSER`                             | Open the admin panel in the browser after startup                                                                                                                                                                                                                                                                                   | boolean | `true`          |
| `ENV_PATH`                            | Path to the file that contains your environment variables                                                                                                                                                                                                                                                                           | string  | `'./.env'`      |
| `STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE` | Initialization locale for the app, if [Internationalization (i18n) plugin](/developer-docs/latest/development/plugins/i18n.md) is installed and enabled on your content types (see [Configuration of i18n in production environments](/developer-docs/latest/development/plugins/i18n.md#configuration-in-production-environments)) | string  | `'en'`          |

### Configuration using environment variables

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

### Casting environment variables

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
