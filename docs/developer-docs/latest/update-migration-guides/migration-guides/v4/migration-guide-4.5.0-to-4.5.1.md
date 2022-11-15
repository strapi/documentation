---
title: Migrate from 4.5.0 to 4.5.1 - Strapi Developer Docs
description: Learn how you can migrate your Strapi application from 4.5.0 to 4.5.1.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/migration-guide-4.5.0-to-4.5.1.html
---

# v4.5.0 to v4.5.1 migration guide

The Strapi v4.5.0 to v4.5.1 migration guide upgrades v4.5.0 to v4.5.1. The migration … 

<!-- TODO: explain what the migration focuses on (i.e. what breaking changes it fixes). -->

## Upgrading the application dependencies

:::prerequisites
Stop the server before starting the upgrade.
:::

<!-- TODO: update version numbers below 👇 -->
1. Upgrade all of the Strapi packages in `package.json` to `4.5.1`:

    ```json
    // path: package.json

    {
      // ...
      "dependencies": {
        "@strapi/strapi": "4.5.1",
        "@strapi/plugin-users-permissions": "4.5.1",
        "@strapi/plugin-i18n": "4.5.1",
        // ...
      }
    }
    ```

2. Save the edited `package.json` file.

<!-- TODO: add additional steps if required -->
3. …

4. Run either `yarn` or `npm install` to install the new version.

::: tip
If the operation doesn't work, try removing your `yarn.lock` or `package-lock.json`. If that doesn't help, remove the `node_modules` folder as well and try again.
:::

## Fixing the breaking changes

<!-- TODO: complete this part -->

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/Rebuild-and-start-snippet.md)!!!
