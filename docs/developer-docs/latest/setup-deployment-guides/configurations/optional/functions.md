---
title: Functions - Strapi Developer Documentation
description: 
---

<!-- TODO: update SEO -->

# Functions

The `./src/index.js` file includes global [register](#register), [bootstrap](#bootstrap) and [destroy](#destroy) functions that can be used to add dynamic and logic based configurations.

## Register

**Path —** `./src/index.js`.

The `register` lifecycle function is an asynchronous function that runs before the application is initialized.
It can be used to:

- [extend plugins](/developer-docs/latest/development/plugins-extension.md#extending-a-plugin-s-interface)
- extend [content-types](/developer-docs/latest/development/backend-customization/models.md) programmatically

<!-- TODO: add example here -->

## Bootstrap

**Path —** `./src/index.js`

The `bootstrap` lifecycle function is called at every server start.

It can be used to:

- create an admin user if there isn't one.
- fill the database with some necessary data.
- load some [environment variables](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md).

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

It can be used to gracefully stop [services](/developer-docs/latest/development/backend-customization/services.md) that are running or [clean up plugin actions](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#destroy) (e.g. close connections, remove listeners, etc.).

## CRON tasks

CRON tasks allow you to schedule jobs (arbitrary functions) for execution at specific dates, with optional recurrence rules. It only uses a single timer at any given time (rather than reevaluating upcoming jobs every second/minute).

This feature is powered by the [`node-schedule`](https://www.npmjs.com/package/node-schedule) package.

:::caution
Make sure the `enabled` cron config is set to `true` in `./config/server.js` file.
:::

The cron format consists of:

```
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)
```

To define a CRON job, add your logic like below:

```js
// path: ./config/functions/cron.js

module.exports = {
  /**
   * Simple example.
   * Every monday at 1am.
   */

  '0 0 1 * * 1': () => {
    // Add your own logic here (e.g. send a queue of email, create a database backup, etc.).
  },
};
```

If your CRON task is required to run based on a specific timezone then you can configure the task like below:

```js
module.exports = {
  /**
   * CRON task with timezone example.
   * Every monday at 1am for Asia/Dhaka timezone.
   * List of valid timezones: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List
   */

  '0 0 1 * * 1': {
    task: () => {
      // Add your own logic here (e.g. send a queue of email, create a database backup, etc.).
    },
    options: {
      tz: 'Asia/Dhaka',
    },
  },
};
```
