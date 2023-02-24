---
title: Configurations
description: Learn how you can manage and customize the configuration of your Strapi application.
displayed_sidebar: devDocsSidebar

---

# Configurations

The application configuration lives in the `./config` folder (see [project structure](/dev-docs/project-structure)). All the configuration files are loaded on startup and can be accessed through the configuration provider.

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

- the [database](/dev-docs/configurations/database),
- the [server](/dev-docs/configurations/server),
- the [admin panel](/dev-docs/configurations/admin-panel),
- and the [middlewares](/dev-docs/configurations/middlewares).

## Optional configurations

Strapi also offers the following optional configuration options for specific features:

- [API tokens](/dev-docs/configurations/api-tokens)
- [functions](/dev-docs/configurations/functions)
- [cron jobs](/dev-docs/configurations/cron)
- [API calls](/dev-docs/configurations/api)
- [plugins](/dev-docs/configurations/plugins)
- the [environment and its variables](/dev-docs/configurations/environment)
- [public assets](/dev-docs/configurations/public-assets)
- [Single Sign-On](/dev-docs/configurations/sso) <EntrepriseBadge />
- [Role-Based Access Control](/dev-docs/configurations/rbac) <EntrepriseBadge />
