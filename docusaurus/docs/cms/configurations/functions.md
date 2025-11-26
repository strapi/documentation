---
title: Lifecycle functions
displayed_sidebar: cmsSidebar
description: Strapi includes lifecycle functions (e.g. register, bootstrap and destroy) that control the flow of your application.
tags:
- additional configuration
- asynchronous function
- bootstrap function
- configuration
- destroy function
- lifecycle function
- register function
- synchronous function

---

# Functions

<Tldr>
`src/index` hosts global register, bootstrap, and destroy functions to run logic during application lifecycle.
</Tldr>

<div className="dont_hide_secondary_bar">

The `./src/index.js` file (or `./src/index.ts` file in a [TypeScript-based](/cms/typescript) project) includes global [register](#register), [bootstrap](#bootstrap) and [destroy](#destroy) functions that can be used to add dynamic and logic-based configurations.

The functions can be synchronous, asynchronous, or return a promise.

<MermaidWithFallback
    chartFile="/diagrams/functions.mmd"
    fallbackImage="/img/assets/diagrams/functions.png"
    fallbackImageDark="/img/assets/diagrams/functions_DARK.png"
    alt="Lifecycle functions diagram"
/>

</div>

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

- [extend plugins](/cms/plugins-development/plugins-extension#extending-a-plugins-interface)
- extend [content-types](/cms/backend-customization/models) programmatically
- load some [environment variables](/cms/configurations/environment)
- register a [custom field](/cms/features/custom-fields) that would be used only by the current Strapi application,
- register a [custom provider for the Users & Permissions plugin](/cms/configurations/users-and-permissions-providers/new-provider-guide).

`register()` is the very first thing that happens when a Strapi application is starting. This happens _before_ any setup process and you don't have any access to database, routes, policies, or any other backend server elements within the `register()` function.

You can use `register()` to front-load security tasks such as loading secrets, rotating API keys, or registering authentication providers before the app finishes initializing.

## Bootstrap

The `bootstrap` lifecycle function, found in `./src/index.js` (or in `./src/index.ts`), is called at every server start.

It can be used to:

- create an admin user if there isn't one
- fill the database with some necessary data
- declare custom conditions for the [Role-Based Access Control (RBAC)](/cms/configurations/guides/rbac) feature

The `bootstrap()` function is run _before_ the back-end server starts but _after_ the Strapi application has setup, so you have access to anything from the `strapi` object.

You can use `bootstrap()` to support editorial workflows, for example by seeding starter content, attaching webhooks, or scheduling cron jobs at startup.

:::tip
You can run `yarn strapi console` (or `npm run strapi console`) in the terminal and interact with the `strapi` object.
:::

## Destroy

The `destroy` function, found in `./src/index.js` (or in `./src/index.ts`), is an asynchronous function that runs before the application gets shut down.

It can be used to gracefully:

- stop [services](/cms/backend-customization/services) that are running
- [clean up plugin actions](/cms/plugins-development/server-api#destroy) (e.g. close connections, remove listeners, etc.)

You can use `destroy()` to handle operational clean-up, such as closing database or queue connections and removing listeners so the application can shut down cleanly.

:::tip
All 3 lifecycle functions can be put together to configure custom behavior during application startup and shutdown.

1. Decide when your logic should run.
   - Add initialization-only tasks (e.g. registering a custom field or provider) in `register()`.
   - Add startup tasks that need full Strapi access (e.g. seeding or attaching webhooks) in `bootstrap()`.
   - Add cleanup logic (e.g. closing external connections) in `destroy()`.
2. Place the code in `src/index.js|ts`. Keep `register()` lean because it runs before Strapi is fully set up.
3. Restart Strapi to confirm each lifecycle executes in sequence.

<details>
<summary>Example to register a custom field, seed content and clean up</summary>
```ts title="src/index.ts"
export default {
  register({ strapi }) {
    strapi.customFields.register({
      name: 'color',
      type: 'string',
      plugin: 'color-picker',
    });
  },

  async bootstrap({ strapi }) {
    const entryCount = await strapi.db.query('api::palette.palette').count();
    if (entryCount === 0) {
      await strapi.db.query('api::palette.palette').create({
        data: { name: 'Default palette', primary: '#4945FF' },
      });
    }
  },

  async destroy({ strapi }) {
    await strapi.db.connection?.destroy?.();
  },
};
```
</details>
:::

:::strapi Additional information
You might find additional information in <ExternalLink to="https://strapi.io/blog/how-to-use-register-function-to-customize-your-strapi-app" text="this blog article"/> about registering lifecycle functions.
:::