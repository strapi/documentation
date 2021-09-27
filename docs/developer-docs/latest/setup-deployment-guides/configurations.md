---
title: Configurations - Strapi Developer Documentation
description: Learn how you can manage and customize the configuration of your Strapi application.
sidebarDepth: auto
---

# Configurations

Your application configuration lives in the `config` folder. All the configuration files are loaded on startup and can be accessed through the configuration provider.

When you have a file `./config/server.js` with the following config:

```js
module.exports = {
  host: '0.0.0.0',
};
```

You can access it as:

```js
strapi.config.get('server.host', 'defaultValueIfUndefined');
```

Nested keys are accessible with the [dot notation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors#dot_notation).

:::note
Notice that the filename is used as a prefix to access the configurations.
:::

You can either use `.js` or `.json` files to configure your application.

When using a `.js` you can either export an object:

```js
module.exports = {
  mySecret: 'someValue',
};
```

or a function returning a configuration object (recommended usage). The function will get access to the [`env` utility](#casting-environment-variables):

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
- and the [server](/developer-docs/latest/setup-deployment-guides/configurations/required/server.md)

## Optional configurations

Strapi also offers some optional configuration options for specific features, such as:

- [middlewares](/developer-docs/latest/setup-deployment-guides/configurations/optional/middlewares.md)
- [functions](/developer-docs/latest/setup-deployment-guides/configurations/optional/functions.md)
- [public assets](/developer-docs/latest/setup-deployment-guides/configurations/optional/public-assets.md)
- the [API](/developer-docs/latest/setup-deployment-guides/configurations/optional/api.md)
- the [environment and its variables](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md)
- [Single Sign-On](/developer-docs/latest/setup-deployment-guides/configurations/optional/sso.md) <GoldBadge link="https://strapi.io/pricing-self-hosted/" withLinkIcon />
- [Role-Based Access Control](/developer-docs/latest/setup-deployment-guides/configurations/optional/rbac.md) <BronzeBadge link="https://strapi.io/pricing-self-hosted"/> <SilverBadge link="https://strapi.io/pricing-self-hosted"/> <GoldBadge link="https://strapi.io/pricing-self-hosted" withLinkIcon/>
