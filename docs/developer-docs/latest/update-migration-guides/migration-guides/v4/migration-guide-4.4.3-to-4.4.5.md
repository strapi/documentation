---
title: Migrate from 4.4.3 to 4.4.5 - Strapi Developer Docs
description: Learn how you can migrate your Strapi application from 4.4.3 to 4.4.5.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/migration-guide-4.4.3-to-4.4.5.html
---

# v4.4.3 to v4.4.5 migration guide

The Strapi v4.4.3 to v4.4.5 migration guide upgrades v4.4.3 to v4.4.5. The migration changes the name of the favicon from `favicon.ico` to `favicon.png`.

:::caution
This migration guide skips v4.4.4, which introduced a problem in `koa/cors` due to a missing dependency update.
:::

## Upgrading the application dependencies

:::prerequisites
Stop the server before starting the upgrade.
:::

1. Upgrade all of the Strapi packages in `package.json` to `4.4.5`:

    ```json
    // path: package.json

    {
      // ...
      "dependencies": {
        "@strapi/strapi": "4.4.5",
        "@strapi/plugin-users-permissions": "4.4.5",
        "@strapi/plugin-i18n": "4.4.5",
        // ...
      }
    }
    ```

2. Save the edited `package.json` file.

3. Replace the existing `favicon.ico` with [`favicon.png`](https://user-images.githubusercontent.com/8593673/198366643-7261700d-c8c4-4ebb-83c8-792a330ab4a5.png):

4. Run either `yarn` or `npm install` to install the new version.

::: tip
If the operation doesn't work, try removing your `yarn.lock` or `package-lock.json`. If that doesn't help, remove the `node_modules` folder as well and try again.
:::

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/Rebuild-and-start-snippet.md)!!!
