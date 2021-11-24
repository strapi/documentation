---
title: Environment configuration and variables - Strapi Developer Docs
description: In case you need specific static configurations for specific environments, configurations can be created per environment.
sidebarDepth: 3
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.html
---

# Environment configuration and variables

## Environment configurations

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

Some settings can only be modified through environment variables:

| Setting                                  | Type | Description | Default value |
|---|---|---|---|
| `STRAPI_DISABLE_UPDATE_NOTIFICATION`  | Boolean | Don't show the notification message about updating strapi in the terminal                 |                                                                                                                                                                                                                                           `false`         |
| `STRAPI_HIDE_STARTUP_MESSAGE`         | Boolean | Don't show the startup message in the terminal                                                                                                                                                                                                                                                                                      | `false`         |
| `STRAPI_TELEMETRY_DISABLED`           | Boolean | Don't send telemetry usage data to Strapi                                                                                                                                                                                                                                                                                           | `false`         |
| `STRAPI_LICENSE`                      | String | The license key to activate the Enterprise Edition                                                                                                                                                                                                                                                                                  | `undefined`     |
| `NODE_ENV`                            | String | Type of environment where the app is running                                                                                                                                                                                                                                                                                        | `'development'` |
| `BROWSER`                             | Boolean | Open the admin panel in the browser after startup                                                                                                                                                                                                                                                                                   | `true`          |
| `ENV_PATH`                            | String | Path to the file that contains your environment variables                                                                                                                                                                                                                                                                           | `'./.env'`      |
| `STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE` <br/><br/>_Optional_| String | Initialization locale for the app, if the [Internationalization (i18n) plugin](/developer-docs/latest/plugins/i18n.md) is installed and enabled on Content-Types (see [Configuration of i18n in production environments](/developer-docs/latest/plugins/i18n.md#configuration-in-production-environments)) | `'en'`          |
| `API_TOKEN_SALT`<br/><br/>_Optional_   | String | Salt to use to generate [API tokens](/developer-docs/latest/setup-deployment-guides/configurations/required/admin-panel.md#api-tokens) | - |

### Configuration using environment variables

In most use cases there will be different configurations between environments (e.g. database credentials).

Instead of writing those credentials into configuration files, variables can be defined in a `.env` file at the root of the application:

```sh
# path: .env

DATABASE_PASSWORD=acme
```

To customize the path of the `.env` file to load, set an environment variable called `ENV_PATH` before starting the application:

```sh
$ ENV_PATH=/absolute/path/to/.env npm run start
```

Variables defined in the `.env` file are accessible using `process.env.{variableName}` anywhere in configuration and application files.

In configuration files, a `env()` utility allows defining defaults and [casting values](#casting-environment-variables):

```js
// path: ./config/database.js

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
