---
title: Environment variables configuration
sidebar_label: Environment variables
displayed_sidebar: devDocsConfigSidebar
tags:
- additional configuration
- configuration
- environment
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# Environment configuration and variables

<NotV5 />

Strapi provides specific environment variable names. Defining them in an environment file (e.g., `.env`) will make these variables and their values available in your code.

:::tip
An `env()` utility can be used to [retrieve the value of environment variables](/dev-docs/configurations/guides/access-cast-environment-variables#accessing-environment-variables) and [cast variables to different types](/dev-docs/configurations/guides/access-cast-environment-variables).
:::

Additionally, specific [configurations for different environments](#environment-configurations) can be created.

## Strapi's environment variables {#strapi}

Strapi provides the following environment variables:

 Setting                                                    | Description                                                                                                                                                                                                                                                                   | Type      | Default value   |
|------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|-----------------|
| `STRAPI_TELEMETRY_DISABLED`                                | Don't send telemetry usage data to Strapi                                                                                                                                                                                                                                     | `Boolean` | `false`         |
| `STRAPI_LICENSE`                                           | The license key to activate the Enterprise Edition                                                                                                                                                                                                                            | `String`  | `undefined`     |
| `NODE_ENV` | Type of environment where the application is running.<br/><br/>`production` enables specific behaviors (see [Node.js documentation](https://nodejs.org/en/learn/getting-started/nodejs-the-difference-between-development-and-production) for details) | `String` | `'development'` |
| `BROWSER`                                                  | Open the admin panel in the browser after startup                                                                                                                                                                                                                             | `Boolean` | `true`          |
| `ENV_PATH`                                                 | Path to the file that contains your environment variables                                                                                                                                                                                                                     | `String`  | `'./.env'`      |
| `STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE` <br/><br/>_Optional_ | Initialization locale for the application, if the [Internationalization (i18n) plugin](/dev-docs/i18n) is installed and enabled on Content-Types (see [Configuration of i18n in production environments](/dev-docs/i18n#configuration-of-the-default-locale)) | `String`  | `'en'`          |
| `STRAPI_ENFORCE_SOURCEMAPS`                                | Forces the bundler to emit source-maps, which is helpful for debugging errors in the admin app.  | `boolean` | `false`          |
| `FAST_REFRESH`                                             | _(Only applies to webpack)_<br/>Use [react-refresh](https://github.com/pmmmwh/react-refresh-webpack-plugin) to enable "Fast Refresh" for near-instant feedback while developing the Strapi admin panel.                                                                                                       | `boolean` | `true`          |

:::tip
Prefixing an environment variable name with `STRAPI_ADMIN_` exposes the variable to the admin front end (e.g., `STRAPI_ADMIN_MY_PLUGIN_VARIABLE` is accessible through `process.env.STRAPI_ADMIN_MY_PLUGIN_VARIABLE`).
:::

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
