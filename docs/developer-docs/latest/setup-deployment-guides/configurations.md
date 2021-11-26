---
title: Configurations - Strapi Developer Docs
description: Learn how you can manage and customize the configuration of your Strapi application.
sidebarDepth: auto
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations.html
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

- the [database](/developer-docs/latest/setup-deployment-guides/configurations/required/databases.md),
- the [server](/developer-docs/latest/setup-deployment-guides/configurations/required/server.md),
- the [admin panel](/developer-docs/latest/setup-deployment-guides/configurations/required/admin-panel.md),
- and the [middlewares](/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.md).

## Optional configurations

Strapi also offers the following optional configuration options for specific features:

- [API tokens](/developer-docs/latest/setup-deployment-guides/configurations/optional/api-tokens.md)
- [functions](/developer-docs/latest/setup-deployment-guides/configurations/optional/functions.md)
- [cron jobs](/developer-docs/latest/setup-deployment-guides/configurations/optional/cronjobs.md)
- [API calls](/developer-docs/latest/setup-deployment-guides/configurations/optional/api.md)
- [plugins](/developer-docs/latest/setup-deployment-guides/configurations/optional/plugins.md)
- the [environment and its variables](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md)
- [public assets](/developer-docs/latest/setup-deployment-guides/configurations/optional/public-assets.md)
- [Single Sign-On](/developer-docs/latest/setup-deployment-guides/configurations/optional/sso.md) <GoldBadge link="https://strapi.io/pricing-self-hosted/" withLinkIcon />
- [Role-Based Access Control](/developer-docs/latest/setup-deployment-guides/configurations/optional/rbac.md) <BronzeBadge link="https://strapi.io/pricing-self-hosted"/> <SilverBadge link="https://strapi.io/pricing-self-hosted"/> <GoldBadge link="https://strapi.io/pricing-self-hosted" withLinkIcon/>
