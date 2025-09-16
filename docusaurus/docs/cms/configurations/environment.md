---
title: Environment variables configuration
sidebar_label: Environment variables
displayed_sidebar: cmsSidebar
tags:
- additional configuration
- configuration
- environment
---

import SampleEnv from '/docs/snippets/sample-env.md'

# Environment configuration and variables

<Tldr>
Strapi-specific environment variables and `.env usage` enable per-environment configs, with `env()` helpers for casting values.
</Tldr>

Strapi provides specific environment variable names. Defining them in an environment file (e.g., `.env`) will make these variables and their values available in your code.

:::tip
An `env()` utility can be used to [retrieve the value of environment variables](/cms/configurations/guides/access-cast-environment-variables#accessing-environment-variables) and [cast variables to different types](/cms/configurations/guides/access-cast-environment-variables).
:::

Additionally, specific [configurations for different environments](#environment-configurations) can be created.

## Strapi's environment variables {#strapi}

Strapi provides the following environment variables:

 Setting                                                    | Description                                                                                                                                                                                                                                                                   | Type      | Default value   |
|------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|-----------------|
| `STRAPI_TELEMETRY_DISABLED`                                | Don't send telemetry usage data to Strapi                                                                                                                                                                                                                                     | `Boolean` | `false`         |
| `STRAPI_LICENSE`                                           | The license key to activate the Enterprise Edition                                                                                                                                                                                                                            | `String`  | `undefined`     |
| `NODE_ENV` | Type of environment where the application is running.<br/><br/>`production` enables specific behaviors (see <ExternalLink to="https://nodejs.org/en/learn/getting-started/nodejs-the-difference-between-development-and-production" text="Node.js documentation"/> for details) | `String` | `'development'` |
| `BROWSER`                                                  | Open the admin panel in the browser after startup                                                                                                                                                                                                                             | `Boolean` | `true`          |
| `ENV_PATH`                                                 | Path to the file that contains your environment variables                                                                                                                                                                                                                     | `String`  | `'./.env'`      |
| `STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE` <br/><br/>_Optional_ | Initialization locale for the application, if the [Internationalization (i18n) feature](/cms/features/internationalization) is installed and enabled on Content-Types (see [Configuration of i18n in production environments](/cms/features/internationalization#configuration)) | `String`  | `'en'`          |
| `STRAPI_ENFORCE_SOURCEMAPS`                                | Forces the bundler to emit source-maps, which is helpful for debugging errors in the admin app.  | `boolean` | `false`          |
| `FAST_REFRESH`                                             | _(Only applies to webpack)_<br/>Use <ExternalLink to="https://github.com/pmmmwh/react-refresh-webpack-plugin" text="react-refresh"/> to enable "Fast Refresh" for near-instant feedback while developing the Strapi admin panel.                                                                                                       | `boolean` | `true`          |
| `HOST` | Address the Strapi server listens on | `String` | `0.0.0.0` |
| `PORT` | Port used by the Strapi server | `Number` | `1337` |
| `APP_KEYS` | Comma-separated keys used to sign cookies and other secrets | `String` | `auto-generated` |
| `API_TOKEN_SALT` | Salt used when creating [API tokens](/cms/features/api-tokens) | `String` | `auto-generated` |
| `ADMIN_JWT_SECRET` | Secret for JWT tokens used in the admin panel | `String` | `auto-generated` |
| `JWT_SECRET` | Secret for JWT tokens generated by the [Users & Permissions](/cms/features/users-permissions) feature | `String` | `auto-generated` |
| `TRANSFER_TOKEN_SALT` | Salt used for transfer tokens by the [Data Management](/cms/features/data-management) feature | `String` | `auto-generated` |
| `DATABASE_CLIENT` | Database client to use (e.g., `sqlite`) | `String` | `sqlite` |
| `DATABASE_FILENAME` | Location of the SQLite database file | `String` | `.tmp/data.db` |

:::tip
Prefixing an environment variable name with `STRAPI_ADMIN_` exposes the variable to the admin front end (e.g., `STRAPI_ADMIN_MY_PLUGIN_VARIABLE` is accessible through `process.env.STRAPI_ADMIN_MY_PLUGIN_VARIABLE`).
:::

### Example `.env` file

<SampleEnv />

## Environment configurations

Configurations can be created with the following naming and structure conventions: `./config/env/{environment}/{filename}`. This is useful when you need specific static configurations for specific environments and using environment variables is not the best solution.

These configurations will be merged into the base configurations defined in the `./config` folder.
The environment is based on the `NODE_ENV` environment variable, which defaults to `development`.

When starting Strapi with `NODE_ENV=production` it will load the configuration from `./config/*` and `./config/env/production/*`. Everything defined in the production configuration will override the default configuration. In combination with environment variables this pattern becomes really powerful.

For instance, using the following configuration files will give you various options to start the server:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/server.js"

module.exports = {
  host: '127.0.0.1',
};
```

```js title="./config/env/production/server.js"

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/server.ts"

export default ({ env }) => ({
  host: '127.0.0.1',
});
```

```js title="./config/env/production/server.ts"

export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
});
```

</TabItem>

</Tabs>

With these configuration files the server will start on various ports depending on the environment variables passed:

```bash
yarn start                                   # uses host 127.0.0.1
NODE_ENV=production yarn start               # uses host defined in .env. If not defined, uses 0.0.0.0
HOST=10.0.0.1 NODE_ENV=production yarn start # uses host 10.0.0.1
```

<br/>

To learn deeper about how to use environment variables in your code, please refer to the following guide:

<CustomDocCardsWrapper>
<CustomDocCard icon="chalkboard-simple" title="Access and cast variables" description="Learn how to access and cast environment variables with the env() utility." link="/cms/configurations/guides/access-cast-environment-variables" />
</CustomDocCardsWrapper>
