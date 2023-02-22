---
title: CRON jobs
displayed_sidebar: devDocsSidebar
description: Strapi allows you to configure cron jobs for execution at specific dates and times, with optional reoccurrence rules.

---

# Cron jobs

<!--TODO fix the link in the prereq-->
:::prerequisites
The `cron.enabled` configuration option should be set to `true` in the `./config/server.js` (or `./config/server.ts` for TypeScript projects)  [file](/dev-docs/configurations/server).
:::

`cron` allows scheduling arbitrary functions for execution at specific dates, with optional recurrence rules. These functions are named cron jobs. `cron` only uses a single timer at any given time, rather than reevaluating upcoming jobs every second/minute.

This feature is powered by the [`node-schedule`](https://www.npmjs.com/package/node-schedule) package.

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
Optionally, cron jobs can be directly created in the `cron.tasks` key of the [server configuration file](/dev-docs/configurations/server).
:::

## Creating a cron job

To define a cron job, create a file with the following structure:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/cron-tasks.js"

module.exports = {
  /**
   * Simple example.
   * Every monday at 1am.
   */

  '0 0 1 * * 1': ({ strapi }) => {
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

  '0 0 1 * * 1': ({ strapi }) => {
    // Add your own logic here (e.g. send a queue of email, create a database backup, etc.).
  },
};
```

</TabItem>

</Tabs>

If the cron job requires running on a specific timezone:

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
     task: ({ strapi }) => {/* Add your own logic here */ },
     options: {
        rule: '0 0 1 * * 1',
        tz: 'Asia/Dhaka',
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
     task: ({ strapi }) => {/* Add your own logic here */ },
     options: {
        rule: '0 0 1 * * 1',
        tz: 'Asia/Dhaka',
     },
   },
 };
```

</TabItem>

</Tabs>

## Enabling cron jobs

To enable cron jobs, set `cron.enabled` to `true` in the [server configuration file](/dev-docs/configurations/server) and declare the jobs:

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
