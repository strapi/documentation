---
title: Lifecycle functions configuration
sidebar_label: Lifecycle functions
displayed_sidebar: devDocsConfigSidebar
description: Strapi includes lifecycle functions (e.g. register, bootstrap and destroy) that control the flow of your application.

---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# Lifecycle functions

<NotV5 />

The `./src/index.js` file (or `./src/index.ts` file in a [TypeScript-based](/dev-docs/typescript) project) includes global [register](#register), [bootstrap](#bootstrap) and [destroy](#destroy) functions that can be used to add dynamic and logic-based configurations.

The functions can be synchronous, asynchronous, or return a promise.

## Synchronous function

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

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

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts
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

</TabItem>

</Tabs>

## Asynchronous function

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

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

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts
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

</TabItem>

</Tabs>

## Function returning a promise

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

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

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts
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

</TabItem>

</Tabs>

## Register

The `register` lifecycle function, found in `./src/index.js` (or in `./src/index.ts`), is an asynchronous function that runs before the application is initialized.
It can be used to:

- [extend plugins](/dev-docs/plugins-extension#extending-a-plugin-s-interface)
- extend [content-types](/dev-docs/backend-customization/models) programmatically
- load some [environment variables](/dev-docs/configurations/environment)
- register a [custom field](/dev-docs/custom-fields) that would be used only by the current Strapi application.

## Bootstrap

The `bootstrap` lifecycle function, found in `./src/index.js` (or in `./src/index.ts`), is called at every server start.

It can be used to:

- create an admin user if there isn't one
- fill the database with some necessary data
- declare custom conditions for the [Role-Based Access Control (RBAC)](/dev-docs/configurations/guides/rbac) feature

## Destroy

The `destroy` function, found in `./src/index.js` (or in `./src/index.ts`), is an asynchronous function that runs before the application gets shut down.

It can be used to gracefully:

- stop [services](/dev-docs/backend-customization/services) that are running
- [clean up plugin actions](/dev-docs/plugins/server-api#destroy) (e.g. close connections, remove listeners, etc.)
