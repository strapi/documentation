---
title: Functions - Strapi Developer Documentation
description: 
---

<!-- TODO: update SEO -->

# Functions

The `./src/index.js` file contains some functions that can be used to add dynamic and logic based configurations.

## Register

**Path —** `./src/index.js`.

The `register` function is an asynchronous function that runs before the application is initialized.
It can be used to:

- [extend plugins](/developer-docs/latest/development/plugins-extension.md#extending-a-plugin-s-interface)
- extend content-types programmatically

<!-- TODO: add example here -->

## Bootstrap

**Path —** `./src/index.js`

The `bootstrap` function is called at every server start. You can use it to add a specific logic at this moment of your server's lifecycle.

Here are some use cases:

- Create an admin user if there isn't one.
- Fill the database with some necessary data.
- Load some environment variables.

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
