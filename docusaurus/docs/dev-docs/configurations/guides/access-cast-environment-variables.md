---
title: Access and cast environment variables
description: Learn how to cast environment variables in Strapi 5 with the env() utility.
displayed_sidebar: devDocsConfigSidebar
tags:
- casting values
- configuration
- configuration guide
- database credentials
- environment 
---

# How to access and cast environment variables

In most use cases there will be different configurations between environments (e.g. database credentials).

Instead of writing those credentials into configuration files, variables can be defined in a `.env` file at the root of the application:

```sh
# path: .env

DATABASE_PASSWORD=acme
```

To customize the path of the `.env` file to load, set an environment variable called `ENV_PATH` before starting the application:

```sh
ENV_PATH=/absolute/path/to/.env npm run start
```

## Accessing environment variables

Variables defined in the `.env` file are accessible using `process.env.{variableName}` anywhere in configuration and application files.

In configuration files, a `env()` utility allows defining defaults and [casting values](#casting-environment-variables):

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/database.js"

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

</TabItem>

<TabItem value="typescript" label="TypeScript">

```js title="./config/database.ts"

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

</TabItem>

</Tabs>

:::note
The syntax `property-name: env('VAR', 'default-value')` uses the value stored in the `.env` file. If there is no specified value in the `.env` file the default value is used.
:::

## Casting environment variables

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

// Returns the env matching oneOf union types
env.oneOf('UPLOAD_PROVIDER', ['local', 'aws'], 'local')
```
