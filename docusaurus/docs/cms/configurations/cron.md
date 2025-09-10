---
title: CRON jobs
displayed_sidebar: cmsSidebar
description: Strapi allows you to configure cron jobs for execution at specific dates and times, with optional reoccurrence rules.
tags:
- additional configuration
- configuration
- cron job
---

# Cron jobs

> Cron jobs schedule custom functions at specific times via `node-schedule`, activated through server config and optional task files.
<br/>

:::prerequisites
The `cron.enabled` configuration option should be set to `true` in the `./config/server.js` (or `./config/server.ts` for TypeScript projects) [file](/cms/configurations/server).
:::

`cron` allows scheduling arbitrary functions for execution at specific dates, with optional recurrence rules. These functions are named cron jobs. `cron` only uses a single timer at any given time, rather than reevaluating upcoming jobs every second/minute.

This feature is powered by the <ExternalLink to="https://www.npmjs.com/package/node-schedule" text="`node-schedule`"/> package.

The `cron` format consists of:

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

To define cron jobs and have them run at the required times:

1. [Create](#creating-a-cron-job) the appropriate file.
2. [Enable](#enabling-cron-jobs) the cron jobs in the server configuration file.

:::tip
Optionally, cron jobs can be directly created in the `cron.tasks` key of the [server configuration file](/cms/configurations/server).
:::

## Creating a cron job

A cron job can be created using the [object format](#using-the-object-format) or [key format](#using-the-key-format).

### Using the object format

To define a cron job with the object format, create a file with the following structure:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/cron-tasks.js"
module.exports = {
  /**
   * Simple example.
   * Every monday at 1am.
   */

  myJob: {
    task: ({ strapi }) => {
      // Add your own logic here (e.g. send a queue of email, create a database backup, etc.).
    },
    options: {
      rule: "0 0 1 * * 1",
    },
  },
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/cron-tasks.ts"
export default {
  /**
   * Simple example.
   * Every monday at 1am.
   */

  myJob: {
    task: ({ strapi }) => {
      // Add your own logic here (e.g. send a queue of email, create a database backup, etc.).
    },
    options: {
      rule: "0 0 1 * * 1",
    },
  },
};
```

</TabItem>

</Tabs>

<details>
<summary>Advanced example #1: Timezones</summary>

The following cron job runs on a specific timezone:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/cron-tasks.js"
module.exports = {
  /**
   * Cron job with timezone example.
   * Every Monday at 1am for Asia/Dhaka timezone.
   * List of valid timezones: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List
   */

  myJob: {
    task: ({ strapi }) => {
      /* Add your own logic here */
    },
    options: {
      rule: "0 0 1 * * 1",
      tz: "Asia/Dhaka",
    },
  },
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/cron-tasks.ts"
export default {
  /**
   * Cron job with timezone example.
   * Every Monday at 1am for Asia/Dhaka timezone.
   * List of valid timezones: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List
   */

  myJob: {
    task: ({ strapi }) => {
      /* Add your own logic here */
    },
    options: {
      rule: "0 0 1 * * 1",
      tz: "Asia/Dhaka",
    },
  },
};
```

</TabItem>

</Tabs>

</details>

<details>
<summary>Advanced example #2: One-off cron jobs</summary>
The following cron job is run only once at a given time:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/cron-tasks.js"
module.exports = {
  myJob: {
    task: ({ strapi }) => {
      /* Add your own logic here */
    },
    // only run once after 10 seconds
    options: new Date(Date.now() + 10000),
  },
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/cron-tasks.ts"
export default {
  myJob: {
    task: ({ strapi }) => {
      /* Add your own logic here */
    },
    // only run once after 10 seconds
    options: new Date(Date.now() + 10000),
  },
};
```

</TabItem>

</Tabs>

</details>

<details>
<summary>Advanced example #3: Start and end times</summary>

The following cron job uses start and end times:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/cron-tasks.js"
module.exports = {
  myJob: {
    task: ({ strapi }) => {
      /* Add your own logic here */
    },
    options: {
      rule: "* * * * * *",
      // start 10 seconds from now
      start: new Date(Date.now() + 10000),
      // end 20 seconds from now
      end: new Date(Date.now() + 20000),
    },
  },
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/cron-tasks.ts"
export default {
  myJob: {
    task: ({ strapi }) => {
      /* Add your own logic here */
    },
    // only run once after 10 seconds
    options: {
      rule: "* * * * * *",
      // start 10 seconds from now
      start: new Date(Date.now() + 10000),
      // end 20 seconds from now
      end: new Date(Date.now() + 20000),
    },
  },
};
```

</TabItem>

</Tabs>

</details>

### Using the key format

:::warning
Using the key format creates an anonymous cron job which may cause issues when trying to disable the cron job or with some plugins. It is recommended to use the object format.
:::

To define a cron job with the key format, create a file with the following structure:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/cron-tasks.js"
module.exports = {
  /**
   * Simple example.
   * Every monday at 1am.
   */

  "0 0 1 * * 1": ({ strapi }) => {
    // Add your own logic here (e.g. send a queue of email, create a database backup, etc.).
  },
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/cron-tasks.ts"
export default {
  /**
   * Simple example.
   * Every monday at 1am.
   */

  "0 0 1 * * 1": ({ strapi }) => {
    // Add your own logic here (e.g. send a queue of email, create a database backup, etc.).
  },
};
```

</TabItem>

</Tabs>

## Enabling cron jobs

To enable cron jobs, set `cron.enabled` to `true` in the [server configuration file](/cms/configurations/server) and declare the jobs:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/server.js"
const cronTasks = require("./cron-tasks");

module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  cron: {
    enabled: true,
    tasks: cronTasks,
  },
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/server.ts"
import cronTasks from "./cron-tasks";

export default ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  cron: {
    enabled: true,
    tasks: cronTasks,
  },
});
```

</TabItem>

</Tabs>

## Adding or removing cron jobs

Use `strapi.cron.add` anywhere in your custom code add CRON jobs to the Strapi instance:

```js title="./src/plugins/my-plugin/strapi-server.js"
module.exports = () => ({
  bootstrap({ strapi }) {
    strapi.cron.add({
      // runs every second
      myJob: {
        task: ({ strapi }) => {
          console.log("hello from plugin");
        },
        options: {
          rule: "* * * * * *",
        },
      },
    });
  },
});
```

Use `strapi.cron.remove` anywhere in your custom code to remove CRON jobs from the Strapi instance, passing in the key corresponding to the CRON job you want to remove:

```js
strapi.cron.remove("myJob");
```

:::note
Cron jobs that are using the [key as the rule](/cms/configurations/cron#using-the-key-format) can not be removed.
:::


## Listing cron jobs

Use `strapi.cron.jobs` anywhere in your custom code to list all the cron jobs that are currently running:

```js
strapi.cron.jobs
```
