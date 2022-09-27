---
title: Functions - Strapi Developer Docs
description: Strapi includes lifecycle functions (e.g. register, bootstrap and destroy) that control the flow of your application.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/optional/functions.html
---

# Functions

The `./src/index.js` file (or `./src/index.ts` file in a [TypeScript-based](/developer-docs/latest/development/typescript.md) project) includes global [register](#register), [bootstrap](#bootstrap) and [destroy](#destroy) functions that can be used to add dynamic and logic-based configurations.

The functions can be synchronous, asynchronous, or return a promise.

**Synchronous function**

<code-group>
<code-block title="JAVASCRIPT">

```js
module.exports = {
  register() {
    // some sync code
  },
  bootstrap() {
    // some sync code
  },
  destroy() {
    // some sync code
  }
};
```

</code-block>

<code-block title="TYPESCRIPT">

```js
export default {
  register() {
    // some sync code
  },
  bootstrap() {
    // some sync code
  },
  destroy() {
    // some sync code
  }
};
```

</code-block>
</code-group>

**Asynchronous function**

<code-group>
<code-block title="JAVASCRIPT">

```js
module.exports = {
  async register() {
    // some async code
  },
  async bootstrap() {
    // some async code
  },
  async destroy() {
    // some async code
  }
};
```

</code-block>

<code-block title="TYPESCRIPT">

```js
export default {
  async register() {
    // some async code
  },
  async bootstrap() {
    // some async code
  },
  async destroy() {
    // some async code
  }
};
```

</code-block>
</code-group>

**Function returning a promise**

<code-group>
<code-block title="JAVASCRIPT">

```js
module.exports = {
  register() {
    return new Promise(/* some code */);
  },
  bootstrap() {
    return new Promise(/* some code */);
  },
  destroy() {
    return new Promise(/* some code */);
  }
};
```

</code-block>

<code-block title="TYPESCRIPT">

```js
export default {
  register() {
    return new Promise(/* some code */);
  },
  bootstrap() {
    return new Promise(/* some code */);
  },
  destroy() {
    return new Promise(/* some code */);
  }
};
```
  
</code-block>
</code-group>

## Register

The `register` lifecycle function, found in `./src/index.js` (or in `./src/index.ts`), is an asynchronous function that runs before the application is initialized.
It can be used to:

- [extend plugins](/developer-docs/latest/development/plugins-extension.md#extending-a-plugin-s-interface)
- extend [content-types](/developer-docs/latest/development/backend-customization/models.md) programmatically
- load some [environment variables](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md)
- register a [custom field](/developer-docs/latest/development/custom-fields.md) that would be used only by the current Strapi application.

## Bootstrap

The `bootstrap` lifecycle function, found in `./src/index.js` (or in `./src/index.ts`), is called at every server start.

It can be used to:

- create an admin user if there isn't one
- fill the database with some necessary data
- declare custom conditions for the [Role-Based Access Control (RBAC)](/developer-docs/latest/setup-deployment-guides/configurations/optional/rbac.md) feature

## Destroy

The `destroy` function, found in `./src/index.js` (or in `./src/index.ts`), is an asynchronous function that runs before the application gets shut down.

It can be used to gracefully:

- stop [services](/developer-docs/latest/development/backend-customization/services.md) that are running
- [clean up plugin actions](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#destroy) (e.g. close connections, remove listeners, etc.)
