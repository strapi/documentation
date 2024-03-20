---
title: Lifecycle Functions
displayed_sidebar: devDocsConfigSidebar
description: Strapi includes lifecycle functions (e.g. register, bootstrap and destroy) that control the flow of your application.

---

# Functions

The `./src/index.js` file (or `./src/index.ts` file in a [TypeScript-based](/dev-docs/typescript) project) includes global [register](#register), [bootstrap](#bootstrap) and [destroy](#destroy) functions that can be used to add dynamic and logic-based configurations.

The functions can be synchronous, asynchronous, or return a promise.

``` mermaid
flowchart TB
    A([The Strapi application starts.]) --> B{"register()"} 
    B -- The Strapi application is setup. --> C
    C{"bootstrap()"} -- The Strapi back-end server starts. --> D
    D(Request)
    D
    click B "#register"
    click C "#bootstrap"
    click D "/dev-docs/backend-customization/requests-responses"
```

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

`register()` is the very first thing that happens when a Strapi application is starting. This happens _before_ any setup process and you don't have any access to database, routes, policies, or any other backend server elements within the `register()` function.

## Bootstrap

The `bootstrap` lifecycle function, found in `./src/index.js` (or in `./src/index.ts`), is called at every server start.

It can be used to:

- create an admin user if there isn't one
- fill the database with some necessary data
- declare custom conditions for the [Role-Based Access Control (RBAC)](/dev-docs/configurations/rbac) feature

The `bootstrapi()` function is run _before_ the back-end server starts but _after_ the Strapi application has setup, so you have access to anything from the `strapi` object.

:::tip
You can run `yarn strapi console` (or `npm run strapi console`) in the terminal and interact with the `strapi` object.
:::

## Destroy

The `destroy` function, found in `./src/index.js` (or in `./src/index.ts`), is an asynchronous function that runs before the application gets shut down.

It can be used to gracefully:

- stop [services](/dev-docs/backend-customization/services) that are running
- [clean up plugin actions](/dev-docs/api/plugins/server-api#destroy) (e.g. close connections, remove listeners, etc.)
