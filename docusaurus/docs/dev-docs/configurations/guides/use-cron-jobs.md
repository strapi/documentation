---
title: Use cron jobs in your code
description: Learn how to use the strapi.cron object to list, add, or remove cron jobs from your code.
tags:
- configuration
- guides
- configuration guides
- cron

---

The `strapi.cron` object allows you to interact with CRON jobs (see [configuration reference](/dev-docs/configurations/cron) for more details).

## Add or remove cron jobs

The `cron` object allows you to add cron jobs to the Strapi instance.

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

To remove a CRON job you can call the remove function on the `strapi.cron` object and pass in the key corresponding to the CRON job you want to remove.

:::note
Cron jobs that are using the [key as the rule](/dev-docs/configurations/cron#using-the-key-format) can not be removed.
:::

```js
strapi.cron.remove("myJob");
```

## List cron jobs

To list all the cron jobs that are currently running you can call the `jobs` array on the `strapi.cron` object.

```js
strapi.cron.jobs
```
