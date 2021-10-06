---
title: Configurations - Strapi Developer Documentation
description: Learn how you can manage and customize the configuration of your Strapi application.
sidebarDepth: auto
---

# Configurations

The application configuration lives in the `./config` folder (see [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md)). All the configuration files are loaded on startup and can be accessed through the configuration provider.

If the `./config/server.js` file has the following config:

```js
module.exports = {
  host: '0.0.0.0',
};
```

The `server.host` key can be accessed as:

```js
strapi.config.get('server.host', 'defaultValueIfUndefined');
```

Nested keys are accessible with the [dot notation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors#dot_notation).

:::note
The filename is used as a prefix to access the configurations.
:::

Configuration files can either be `.js` or `.json` files.

When using a `.js` file, the configuration can be exported:

- either as an object:

  ```js
  module.exports = {
    mySecret: 'someValue',
  };
  ```

- or as a function returning a configuration object (recommended usage). The function will get access to the [`env` utility](#casting-environment-variables):

  ```js
  module.exports = ({ env }) => {
    return {
      mySecret: 'someValue',
    };
  };
  ```

## Required configurations

Some parts of Strapi must be configured for the Strapi application to work properly:

- the [database](/developer-docs/latest/setup-deployment-guides/configurations/required/databases.md)
- and the [server](/developer-docs/latest/setup-deployment-guides/configurations/required/server.md).

## Optional configurations

Strapi also offers the following optional configuration options for specific features:


