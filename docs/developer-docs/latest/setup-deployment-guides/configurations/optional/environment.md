---
title: Environment configuration and variables - Strapi Developer Docs
description: In case you need specific static configurations for specific environments, configurations can be created per environment.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.html
---

# Environment configuration and variables

Strapi provides environment variables that can be used in configuration files.  An `env()` utility can be used to [retrieve the value of environment variables](#configuration-using-environment-variables) and [cast variables to different types](#casting-environment-variables), and  specific [configurations for different environments](#environment-configurations) can be created.

## Strapi's environment variables

Strapi provides the following environment variables:

| Setting                                                    | Description                                                                                                                                                                                                                                                                                                | Type    | Default value   |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | --------------- |
| `STRAPI_DISABLE_UPDATE_NOTIFICATION`                       | Don't show the notification message about updating strapi in the terminal                                                                                                                                                                                                                                  | `Boolean` | `false`         |
| `STRAPI_HIDE_STARTUP_MESSAGE`                              | Don't show the startup message in the terminal                                                                                                                                                                                                                                                             | `Boolean` | `false`         |
| `STRAPI_TELEMETRY_DISABLED`                                | Don't send telemetry usage data to Strapi                                                                                                                                                                                                                                                                  | `Boolean` | `false`         |
| `STRAPI_LICENSE`                                           | The license key to activate the Enterprise Edition                                                                                                                                                                                                                                                         | `String`  | `undefined`     |
| `NODE_ENV`                                                 | Type of environment where the application is running.<br/><br/>`production` enables specific behaviors (see  [Node.js documentation](https://nodejs.dev/en/learn/nodejs-the-difference-between-development-and-production) for details)                                                                               | `String`  | `'development'` |
| `BROWSER`                                                  | Open the admin panel in the browser after startup                                                                                                                                                                                                                                                          | `Boolean` | `true`          |
| `ENV_PATH`                                                 | Path to the file that contains your environment variables                                                                                                                                                                                                                                                  | `String`  | `'./.env'`      |
| `STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE` <br/><br/>_Optional_ | Initialization locale for the application, if the [Internationalization (i18n) plugin](/developer-docs/latest/plugins/i18n.md) is installed and enabled on Content-Types (see [Configuration of i18n in production environments](/developer-docs/latest/plugins/i18n.md#configuration-of-the-default-locale))      | `String`  | `'en'`          |
| `FAST_REFRESH`                                             | Use [react-refresh](https://github.com/pmmmwh/react-refresh-webpack-plugin) to enable "Fast Refresh" for near-instant feedback while developing the Strapi admin panel.                                                                                                                                       | `boolean` | `true`          |


## Configuration using environment variables

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

<code-group>

<code-block title="JAVASCRIPT">

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

</code-block>

<code-block title="TYPESCRIPT">

```js
// path: ./config/database.ts

export default ({ env }) => ({
  connections: {
    default: {
      settings: {
        password: env('DATABASE_PASSWORD'),
      },
    },
  },
});
```

</code-block>

</code-group>

### Casting environment variables

The `env()` utility can be used to cast environment variables to different types:

```js
// Returns the env if defined without casting it
env('VAR', 'default');

// Cast to integer (using parseInt)
env.int('VAR', 0);

// Cast to float (using parseFloat)
env.float('VAR', 3.14);

// Cast to boolean (check if the value is equal to 'true')
env.bool('VAR', true);

// Cast to JS object (using JSON.parse)
env.json('VAR', { key: 'value' });

// Cast to array (syntax: ENV_VAR=[value1, value2, value3] | ENV_VAR=["value1", "value2", "value3"])
env.array('VAR', [1, 2, 3]);

// Cast to date (using new Date(value))
env.date('VAR', new Date());
```

## Environment configurations

Configurations can be created with the following naming and structure conventions: `./config/env/{environment}/{filename}`. This is useful when you need specific static configurations for specific environments and using environment variables is not the best solution.

These configurations will be merged into the base configurations defined in the `./config` folder.
The environment is based on the `NODE_ENV` environment variable, which defaults to `development`.

When starting Strapi with `NODE_ENV=production` it will load the configuration from `./config/*` and `./config/env/production/*`. Everything defined in the production configuration will override the default configuration. In combination with environment variables this pattern becomes really powerful.

For instance, using the following configuration files will give you various options to start the server:

<code-group>
<code-block title="JAVASCRIPT">

```js
// path: ./config/server.js

module.exports = {
  host: '127.0.0.1',
};


// path: ./config/env/production/server.js

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
});
```

</code-block>

<code-block title="TYPESCRIPT">

```js
// path: ./config/server.ts

export default ({ env }) => ({
  host: '127.0.0.1',
});


// path: ./config/env/production/server.ts

export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
});
```

</code-block>
</code-group>

With these configuration files the server will start on various ports depending on the environment variables passed:

```bash
yarn start                                   # uses host 127.0.0.1
NODE_ENV=production yarn start               # uses host defined in .env. If not defined, uses 0.0.0.0
HOST=10.0.0.1 NODE_ENV=production yarn start # uses host 10.0.0.1
```
