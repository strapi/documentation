---
title: Migrate from 3.0.0-beta.20 to 3.0.0 - Strapi Developer Documentation
description: Learn how you can migrate your Strapi application from 3.0.0-beta.20 to 3.0.0.
---

# Migration guide from 3.0.0-beta.20 to 3.0.0

Upgrading your Strapi application to `3.0.0`.

**Make sure your server is not running until the end of the migration**

## Upgrading your dependencies

Start by upgrading your dependencies. Make sure to use exact versions, however please note that the version listed below may not be the current "latest" release.

Update your package.json accordingly:

```json
{
  // ...
  "dependencies": {
    "strapi": "3.0.0",
    "strapi-admin": "3.0.0",
    "strapi-connector-bookshelf": "3.0.0",
    "strapi-plugin-content-manager": "3.0.0",
    "strapi-plugin-content-type-builder": "3.0.0",
    "strapi-plugin-email": "3.0.0",
    "strapi-plugin-graphql": "3.0.0",
    "strapi-plugin-upload": "3.0.0",
    "strapi-plugin-users-permissions": "3.0.0",
    "strapi-utils": "3.0.0"
  }
}
```

Then run either `yarn install` or `npm install`.

## New configuration loader

We have reworked the way a Strapi project is configured to make it simpler yet more powerful.

Some of the improvements are:

- `.env` support.
- Less files.
- Environment overwrites.

Before migrating, you should first read the new [configuration documentation](/developer-docs/latest/setup-deployment-guides/configurations.md) to fully understand the changes.

### Migrating

#### Server

Your server configuration should move from `./config/environments/{env}/server.json` to `./config/server.js` like shown [here](/developer-docs/latest/setup-deployment-guides/configurations.md#server).

#### Database configuration

Your database configuration should move from `./config/environments/{env}/database.json` to `./config/database.js` like shown [here](/developer-docs/latest/setup-deployment-guides/configurations.md#database).

#### Middlewares

We have moved all the middleware related configurations into one place: `./config/middleware.js`.

The middlewares were previously configured in mutliple files:

- `./config/middleware.json`
- `./config/application.json`
- `./config/language.json`
- `./config/environments/{env}/request.json`
- `./config/environments/{env}/response.json`
- `./config/environments/{env}/security.json`

First you should create a file `./config/middleware.js`.

```js
// This is just an example, and is not required
module.exports = {
  timeout: 100,
  load: {
    before: ['responseTime', 'logger', 'cors', 'responses', 'gzip'],
    order: [
      "Define the middlewares' load order by putting their name in this array is the right order",
    ],
    after: ['parser', 'router'],
  },
  settings: {
    public: {
      path: './public',
      maxAge: 60000,
    },
  },
};
```

You can now move the middleware configurations from `application.json`, `language.json`, `security.json`, `request.json` and `response.json` files directly into the `settings` property.

You can review all possible options in the [middleware documentation](/developer-docs/latest/setup-deployment-guides/configurations.md#configuration-and-activation-2).

<!-- This hash link above generates an error with the check-links plugins but everything seems to be fine 🤷  So it's been added to the files to ignore, see config.js. -->

::: tip
If you never configured any middlewares you can delete this file all together. You can also only set the configurations you want to customize and leave the others out.
:::

#### Hook

We applied the same logic from the `middleware` configuration to the `hook` configuration.

First you should create a file `./config/hook.js`, and you can move the content of `./config/hook.json` into it. Hooks should be placed under settings key eg:

```js
module.exports = {
  timeout: 10000,
  load: {
    before: ['hook-1', 'hook-2'],
    order: ["Define the hooks' load order by putting their names in this array in the right order"],
    after: ['hook-3', 'hook4'],
  },
  settings: {
    'hook-1': {
      enabled: true,
    },
    'hook-2': {
      enabled: true,
    },
    'hook-3': {
      enabled: true,
    },
    hook4: {
      enabled: true,
    },
  },
};
```

::: tip
If you never configured any hook you can delete the file all together. You can also only set the configurations you want to customize and leave the others out.
:::

#### Functions

You can leave your functions as is, we didn't change how they work.

#### Policies

You can leave your policies as is, we didn't change how they work.

#### Custom

Any custom configuration you have can still be used. You can read the [configuration documentation](/developer-docs/latest/setup-deployment-guides/configurations.md) to know more.

#### Plugin

From now on, you will set your plugin configurations in `./config/plugins.js` or `./config/env/{env}/plugins.js`. Instead of using the extensions system to directly modify the plugin configuration.

**Example**

```js
module.exports = {
  graphql: {
    depthLimit: 5,
  },
};
```

### Final structure

Here is an example of the structure you could have after migrating:

**Before**

```
config
├── application.json
├── custom.json
├── environments
│   ├── development
│   │   ├── custom.json
│   │   ├── database.json
│   │   ├── request.json
│   │   ├── response.json
│   │   ├── security.json
│   │   └── server.json
│   ├── production
│   │   ├── custom.json
│   │   ├── database.json
│   │   ├── request.json
│   │   ├── response.json
│   │   ├── security.json
│   │   └── server.json
│   └── staging
│       ├── custom.json
│       ├── database.json
│       ├── request.json
│       ├── response.json
│       ├── security.json
│       └── server.json
├── functions
│   ├── bootstrap.js
│   ├── cron.js
│   └── responses
│       └── 404.js
├── hook.json
├── language.json
├── locales
│   ├── cs_cz.json
│   ├── de_de.json
│   ├── en_us.json
│   ├── es_es.json
│   ├── fr_fr.json
│   ├── it_it.json
│   ├── ja_jp.json
│   ├── ru_ru.json
│   └── tr_tr.json
└── middleware.json
```

**After**

```
config
├── functions
│   ├── bootstrap.js
│   ├── cron.js
│   └── responses
│       └── 404.js
├── env
│   └── production
│       └── database.js
├── database.js
├── middleware.js
└── server.js
```

## Database lifecycles

We have replaced the old lifecycles that had a lot of issues with a new simpler lifecycle layer.

You can read more [here](/developer-docs/latest/development/backend-customization.md#lifecycle-hooks).

## Email plugin settings

Email plugin settings have been moved to files. Now you can configure your email provider directly in files.

You can read the documentation [here](/developer-docs/latest/development/plugins/email.md#configure-the-plugin) to update.

Once you have setup your configuration, you can cleanup your database by deleting in the `core_store` model the data with the `key` equal to `plugin_email_provider`.

## GraphQL changes

If you are using the graphql `register` mutation, the input and response types have changed. You can check the code [here](https://github.com/strapi/strapi/pull/6047).

The `changePassword` mutation got renamed to `resetPassword` to reflect what it does. You can check the code [here](https://github.com/strapi/strapi/pull/5655).

## Remove `idAttribute` and `idAttributeType` options

Currently using the idAttribute and idAttributeType options can break strapi in many ways. Fixing this is going to require a lot of work on the database and content management layer.

In an effort to make Strapi more stable we have decided to remove those broken options for the time being. For users who want unique uuid fields for examples we recommend you create a uuid attribute and use the lifecycles function to populate it.

## Proxy configuration

In order to support hosting strapi with more flexibility, we have changed the way you configure the server proxy options and the admin panel path.

### Proxy

We replaced the `proxy` option found in `./config/server.json` by the `url` option.

This option also makes the `admin.build.backend` option obsolete.

This option tells strapi where it is hosted and is useful for generating links or telling the admin panel where the API is available.

**Before**

**Path —** `./config/server.json`

```json
{
  "proxy": {
    "enabled": true,
    "ssl": true,
    "host": "domain.com",
    "port": "1337"
  }
}
```

**After**

**Path —** `./config/server.js`

```js
module.exports = {
  //...
  url: `https://domain.com:1337`,
};
```

What you can now do is add a path to the url to host strapi in a sub path of your domain.

```js
module.exports = {
  //...
  url: `https://domain.com:1337/my-strapi-api`,
};
```

::: warning
Adding a sub path to the url doesn't mean your api is going to be prefixed. You will need to host your app behind a proxy and remove the prefix so strapi receives request like if they where made on the root `/` path.
:::

You can see this option in action in the following [deployment guides](/developer-docs/latest/setup-deployment-guides/deployment.md#optional-software-guides).

### Admin path

We replaced the `admin.path` option by the `admin.url` option to offer more flexibility of deployment.

The `url` option can either be a relative path: `/admin-panel` or an absolute url.

**Before**

**Path —** `./config/server.json`

```json
{
  "admin": {
    "path": "/dashboard"
  }
}
```

**After**

**Path —** `./config/server.js`

```js
module.exports = {
  //...
  admin: {
    url: '/dashboard',
  },
};
```

You can see this option in action in the following [deployment guides](/developer-docs/latest/setup-deployment-guides/deployment.md#optional-software-guides).

## Rebuilding your administration panel

You can run `yarn build --clean` or `npm run build -- --clean` to rebuild your admin panel with the newly installed version of strapi.

Finally restart your server: `yarn develop` or `npm run develop`.
