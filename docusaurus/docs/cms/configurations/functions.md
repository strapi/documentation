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

## Available modes

Lifecycle functions support 3 execution patterns/modes so you can align them with the dependencies they manage. Strapi waits for each function to finish, whether it returns normally, resolves an `async` function, or resolves a promise, before moving on with startup or shutdown.

Return values aren't used by Strapi, so the functions should resolve (or return) only when their setup or cleanup is complete and throw or reject to signal a failure.

### Synchronous

Synchronous functions run logic that completes immediately without awaiting other asynchronous tasks.

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js
module.exports = {
  register({ strapi }) {
    strapi.log.info('Registering static configuration');
  },
  bootstrap({ strapi }) {
    strapi.log.info('Bootstrap finished without awaiting tasks');
  },
  destroy({ strapi }) {
    strapi.log.info('Server shutdown started');
  }
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts
export default {
  register({ strapi }) {
    strapi.log.info('Registering static configuration');
  },
  bootstrap({ strapi }) {
    strapi.log.info('Bootstrap finished without awaiting tasks');
  },
  destroy({ strapi }) {
    strapi.log.info('Server shutdown started');
  }
};
```

</TabItem>

</Tabs>

### Asynchronous

Asynchronous functions use the `async` keyword to `await` tasks such as API calls or database queries before Strapi continues.

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js
module.exports = {
  async register({ strapi }) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    strapi.log.info('Async register finished after a short delay');
  },
  async bootstrap({ strapi }) {
    const articles = await strapi.entityService.findMany('api::article.article', {
      filters: { publishedAt: { $notNull: true } },
      fields: ['id'],
    });
    strapi.log.info(`Indexed ${articles.length} published articles`);
  },
  async destroy({ strapi }) {
    await strapi.entityService.deleteMany('api::temporary-cache.temporary-cache');
  }
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts
export default {
  async register({ strapi }) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    strapi.log.info('Async register finished after a short delay');
  },
  async bootstrap({ strapi }) {
    const articles = await strapi.entityService.findMany('api::article.article', {
      filters: { publishedAt: { $notNull: true } },
      fields: ['id'],
    });
    strapi.log.info(`Indexed ${articles.length} published articles`);
  },
  async destroy({ strapi }) {
    await strapi.entityService.deleteMany('api::temporary-cache.temporary-cache');
  }
};
```

</TabItem>

</Tabs>

### Returning a promise

Promise-returning functions hand back a promise so Strapi can wait for its resolution before continuing.

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js
module.exports = {
  register({ strapi }) {
    return new Promise((resolve) => {
      strapi.log.info('Registering with a delayed startup task');
      setTimeout(resolve, 200);
    });
  },
  bootstrap({ strapi }) {
    return new Promise((resolve, reject) => {
      strapi.db.query('api::category.category')
        .findOne({ where: { slug: 'general' } })
        .then((entry) => {
          if (!entry) {
            return strapi.db.query('api::category.category').create({
              data: { name: 'General', slug: 'general' },
            });
          }

          return entry;
        })
        .then(() => {
          strapi.log.info('Ensured default category exists');
          resolve();
        })
        .catch(reject);
    });
  },
  destroy({ strapi }) {
    return new Promise((resolve, reject) => {
      strapi.db.query('api::temporary-cache.temporary-cache')
        .deleteMany()
        .then(() => {
          strapi.log.info('Cleared temporary cache before shutdown');
          resolve();
        })
        .catch(reject);
    });
  }
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts
export default {
  register({ strapi }) {
    return new Promise((resolve) => {
      strapi.log.info('Registering with a delayed startup task');
      setTimeout(resolve, 200);
    });
  },
  bootstrap({ strapi }) {
    return new Promise((resolve, reject) => {
      strapi.db.query('api::category.category')
        .findOne({ where: { slug: 'general' } })
        .then((entry) => {
          if (!entry) {
            return strapi.db.query('api::category.category').create({
              data: { name: 'General', slug: 'general' },
            });
          }

          return entry;
        })
        .then(() => {
          strapi.log.info('Ensured default category exists');
          resolve();
        })
        .catch(reject);
    });
  },
  destroy({ strapi }) {
    return new Promise((resolve, reject) => {
      strapi.db.query('api::temporary-cache.temporary-cache')
        .deleteMany()
        .then(() => {
          strapi.log.info('Cleared temporary cache before shutdown');
          resolve();
        })
        .catch(reject);
    });
  }
};
```

</TabItem>

</Tabs>

## Lifecycle functions

Lifecycle functions let you place code at specific phases of Strapi's startup and shutdown.

- The `register()` function is for configuration-time setup before services start.
- The `bootstrap()` function is for initialization that needs Strapi's APIs.
- The `destroy()` function is for teardown when the application stops.

### Register

The `register` lifecycle function, found in `./src/index.js` (or in `./src/index.ts`), is an asynchronous function that runs before the application is initialized.

`register()` is the very first thing that happens when a Strapi application is starting. This happens _before_ any setup process and you don't have any access to database, routes, policies, or any other backend server elements within the `register()` function.

The `register()` function can be used to:

- [extend plugins](/cms/plugins-development/plugins-extension#extending-a-plugins-interface)
- extend [content-types](/cms/backend-customization/models) programmatically
- load some [environment variables](/cms/configurations/environment)
- register a [custom field](/cms/features/custom-fields) that would be used only by the current Strapi application,
- register a [custom provider for the Users & Permissions plugin](/cms/configurations/users-and-permissions-providers/new-provider-guide).

More specifically, typical use-cases for `register()` include front-load security tasks such as loading secrets, rotating API keys, or registering authentication providers before the app finishes initializing.

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js
module.exports = {
  register({ strapi }) {
    strapi.customFields.register({
      name: 'color',
      plugin: 'my-color-picker',
      type: 'string',
    });
  },
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts
export default {
  register({ strapi }) {
    strapi.customFields.register({
      name: 'color',
      plugin: 'my-color-picker',
      type: 'string',
    });
  },
};
```

</TabItem>

</Tabs>

### Bootstrap

The `bootstrap` lifecycle function, found in `./src/index.js` (or in `./src/index.ts`), is called at every server start.

`bootstrap()` is run _before_ the back-end server starts but _after_ the Strapi application has setup, so you have access to anything from the `strapi` object.

The `bootstrap` function can be used to:

- create an admin user if there isn't one
- fill the database with some necessary data
- declare custom conditions for the [Role-Based Access Control (RBAC)](/cms/configurations/guides/rbac) feature

More specifically, a typical use-case for `bootstrap()` is supporting editorial workflows. For example by seeding starter content, attaching webhooks, or scheduling cron jobs at startup.

:::tip
You can run `yarn strapi console` (or `npm run strapi console`) in the terminal and interact with the `strapi` object.
:::

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js
module.exports = {
  async bootstrap({ strapi }) {
    const existingCategory = await strapi.db
      .query('api::category.category')
      .findOne({ where: { slug: 'general' } });

    if (!existingCategory) {
      await strapi.db.query('api::category.category').create({
        data: { name: 'General', slug: 'general' },
      });
      strapi.log.info('Created default category');
    }
  },
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts
export default {
  async bootstrap({ strapi }) {
    const existingCategory = await strapi.db
      .query('api::category.category')
      .findOne({ where: { slug: 'general' } });

    if (!existingCategory) {
      await strapi.db.query('api::category.category').create({
        data: { name: 'General', slug: 'general' },
      });
      strapi.log.info('Created default category');
    }
  },
};
```

</TabItem>

</Tabs>

### Destroy

The `destroy` function, found in `./src/index.js` (or in `./src/index.ts`), is an asynchronous function that runs before the application gets shut down.

The `destroy` function can be used to gracefully:

- stop [services](/cms/backend-customization/services) that are running
- [clean up plugin actions](/cms/plugins-development/server-api#destroy) (e.g. close connections, remove listeners, etc.)

More specifically, a typical use-case for `destroy()` is to handle operational clean-up, such as closing database or queue connections and removing listeners so the application can shut down cleanly.

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js
let heartbeat;

module.exports = {
  async bootstrap({ strapi }) {
    heartbeat = setInterval(() => {
      strapi.log.debug('Heartbeat interval running');
    }, 60_000);
  },

  async destroy() {
    clearInterval(heartbeat);
  },
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts
let heartbeat: ReturnType<typeof setInterval>;

export default {
  async bootstrap({ strapi }) {
    heartbeat = setInterval(() => {
      strapi.log.debug('Heartbeat interval running');
    }, 60_000);
  },

  async destroy() {
    clearInterval(heartbeat);
  },
};
```

</TabItem>

</Tabs>

## Usage

<br/>

### Combined usage

All 3 lifecycle functions can be put together to configure custom behavior during application startup and shutdown.

1. Decide when your logic should run.
   - Add initialization-only tasks (e.g. registering a custom field or provider) in `register()`.
   - Add startup tasks that need full Strapi access (e.g. seeding or attaching webhooks) in `bootstrap()`.
   - Add cleanup logic (e.g. closing external connections) in `destroy()`.
2. Place the code in `src/index.js|ts`. Keep `register()` lean because it runs before Strapi is fully set up.
3. Restart Strapi to confirm each lifecycle executes in sequence.

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

:::strapi Additional information
You might find additional information in <ExternalLink to="https://strapi.io/blog/how-to-use-register-function-to-customize-your-strapi-app" text="this blog article"/> about registering lifecycle functions.
:::