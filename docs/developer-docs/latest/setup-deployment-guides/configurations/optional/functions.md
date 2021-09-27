---
title: Functions - Strapi Developer Documentation
description: 
---

<!-- TODO: update SEO -->

# Functions

The `./config/functions/` folder contains a set of JavaScript files in order to add dynamic and logic based configurations.

All functions that are exposed in this folder are accessible via `strapi.config.functions['fileName']();`

<!-- The text above will be identified as a broken link by the check-links VuePress plugin, because its syntax looks like an empty link. You can safely ignore the error. -->

## Bootstrap

**Path —** `./config/functions/bootstrap.js`.

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

## CRON tasks

CRON tasks allow you to schedule jobs (arbitrary functions) for execution at specific dates, with optional recurrence rules. It only uses a single timer at any given time (rather than reevaluating upcoming jobs every second/minute).

This feature is powered by [`node-schedule`](https://www.npmjs.com/package/node-schedule) node modules. Check it for more information.

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

**Path —** `./config/functions/cron.js`.

```js
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

## Database ORM customization

When present, they are loaded to let you customize your database connection instance, for example for adding some plugin, customizing parameters, etc.

You will need to install the plugin using the normal `npm install the-plugin-name` or any of the other supported package tools such as yarn then follow the below examples to load them.

:::: tabs card

::: tab Mongoose

As an example, for using the `mongoose-simple-random` plugin for MongoDB, you can register it like this:

**Path —** `./config/functions/mongoose.js`.

```js
'use strict';

const random = require('mongoose-simple-random');

module.exports = (mongoose, connection) => {
  mongoose.plugin(random);
};
```

:::

::: tab Bookshelf

Another example would be using the `bookshelf-uuid` plugin for MySQL, you can register it like this:

**Path —** `./config/functions/bookshelf.js`.

```js
'use strict';

module.exports = (bookshelf, connection) => {
  bookshelf.plugin('bookshelf-uuid');
};
```

:::

::::

