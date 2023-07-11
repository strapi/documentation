---
title: Migrate v4.0.0+ to v4.0.6 
displayed_sidebar: devDocsSidebar
description: Learn how you can migrate your Strapi application from 4.0.0+ to 4.0.6.

---

import PluginsCaution from '/docs/snippets/migrate-plugins-extension-caution.md'
import BuildCommand from '/docs/snippets/build-npm-yarn.md'
import DevelopCommand from '/docs/snippets/develop-npm-yarn.md'
import InstallCommand from '/docs/snippets/install-npm-yarn.md'

# v4.0.0+ to v4.0.6 migration guide

The Strapi v4.0.0+ to v4.0.6 migration guide upgrades versions of v4.0.0 and above to v4.0.6. The migration adds the `session` middleware to the middleware array and configures the `session` middleware. The `session` middleware is based on [koa-session](/dev-docs/configurations/middlewares#session) and is necessary to fix the login provider feature of the [Users & Permissions plugin](/dev-docs/plugins/users-permissions). Additionally, password protection in the [Documentation plugin](/dev-docs/plugins/documentation) uses the `session` middleware. The migration guide consists of 3 sections:

- upgrading the application dependencies
- migrating the breaking changes to the middleware
- reinitializing the application

<PluginsCaution components={props.components} />

## Upgrading the application dependencies

Upgrade all of the Strapi packages in the `package.json` to `4.0.6`:

```jsx title="path: ./package.json"

{
  // ...
  "dependencies": {
    "@strapi/strapi": "4.0.6",
    "@strapi/plugin-users-permissions": "4.0.6",
    "@strapi/plugin-i18n": "4.0.6",
    "sqlite3": "5.0.2"
    // ...
  }
}

```

2. Save the edited `package.json` file.

3. <InstallCommand components={props.components} />


## Fixing the breaking changes

1. Add the `strapi::session` middleware to the array in the middleware configuration file `./config/middlewares.js`:

```jsx title="path: ./config/middlewares.js"

module.exports = [
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

2. Configure the session middleware by adding the key settings to the `server.js` configuration file (see [session middleware](/dev-docs/configurations/middlewares#session) for more information). The secrets are typically stored in `.env` during development. In most use cases the keys will be different for each environment. For example, a different set of keys should be used for the production and the development environments. Storing default keys in the configuration file is not recommended.

```jsx title="path: ./config/server.js"

  // ...
  app: {
    keys: env.array("APP_KEYS"),
  },
// ...
```

<details>
<summary> Example of the updated file</summary>

```jsx title="path: ./config/server.js"

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array("APP_KEYS"),
  },
  // ...
});

```

</details>

:::warning
It is a security risk to expose static session middleware keys in a deployed environment. An `.env` file or environment variables should be used instead.

<details>
<summary> Example: sessions keys in .env file</summary>

```js
APP_KEYS=[someSecret, anotherSecret, additionalSecrets]

or

APP_KEYS=someSecret,anotherSecret,additionalSecrets
```

</details>
:::

## Rebuild the application

<BuildCommand components={props.components} />

## Restart the application

<DevelopCommand components={props.components} />
