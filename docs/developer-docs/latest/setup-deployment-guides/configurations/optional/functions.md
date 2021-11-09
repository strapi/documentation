---
title: Functions - Strapi Developer Documentation
description: Strapi includes life cycle functions (e.g. register, bootstrap and destroy) that control the flow of your application.
---

# Functions

The `./src/index.js` file includes global [register](#register), [bootstrap](#bootstrap) and [destroy](#destroy) functions that can be used to add dynamic and logic-based configurations.

## Register

**Path —** `./src/index.js`.

The `register` lifecycle function is an asynchronous function that runs before the application is initialized.
It can be used to:

- [extend plugins](/developer-docs/latest/development/plugins-extension.md#extending-a-plugin-s-interface)
- extend [content-types](/developer-docs/latest/development/backend-customization/models.md) programmatically
- load some [environment variables](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md).

## Bootstrap

**Path —** `./src/index.js`

The `bootstrap` lifecycle function is called at every server start.

It can be used to:

- create an admin user if there isn't one.
- fill the database with some necessary data.

The bootstrap function can be synchronous or asynchronous.

**Synchronous**

```js
module.exports = () => {
  // some sync code
};
```

**Return a promise**

```js
module.exports = () => {
  return new Promise(/* some code */);
};
```

**Asynchronous**

```js
module.exports = async () => {
  await someSetup();
};
```

## Destroy

The `destroy` function is an asynchronous function that runs before the application gets shut down.

It can be used to gracefully:

- stop [services](/developer-docs/latest/development/backend-customization/services.md) that are running
- [clean up plugin actions](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#destroy) (e.g. close connections, remove listeners, etc.).
