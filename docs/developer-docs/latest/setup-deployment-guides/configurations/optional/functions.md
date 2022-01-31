---
title: Functions - Strapi Developer Docs
description: Strapi includes lifecycle functions (e.g. register, bootstrap and destroy) that control the flow of your application.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/optional/functions.html
---

# Functions

The `./src/index.js` file includes global [register](#register), [bootstrap](#bootstrap) and [destroy](#destroy) functions that can be used to add dynamic and logic-based configurations.

## Register

The `register` found in `./src/index.js` lifecycle function is an asynchronous function that runs before the application is initialized.
It can be used to:

- [extend plugins](/developer-docs/latest/development/plugins-extension.md#extending-a-plugin-s-interface)
- extend [content-types](/developer-docs/latest/development/backend-customization/models.md) programmatically
- load some [environment variables](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md).

## Bootstrap

The `bootstrap` lifecycle function found in `./src/index.js` is called at every server start.

It can be used to:

- create an admin user if there isn't one
- fill the database with some necessary data
- declare custom conditions for the [Role-Based Access Control (RBAC)](/developer-docs/latest/setup-deployment-guides/configurations/optional/rbac.md) feature

The bootstrap function can be synchronous, asynchronous, or return a promise:

**Synchronous function**

```js
module.exports = () => {
  // some sync code
};
```

**Asynchronous function**

```js
module.exports = async () => {
  await someSetup();
};
```

**Function returning a promise**

```js
module.exports = () => {
  return new Promise(/* some code */);
};
```


## Destroy

The `destroy` function found in `./src/index.js` is an asynchronous function that runs before the application gets shut down.

It can be used to gracefully:

- stop [services](/developer-docs/latest/development/backend-customization/services.md) that are running
- [clean up plugin actions](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#destroy) (e.g. close connections, remove listeners, etc.).
