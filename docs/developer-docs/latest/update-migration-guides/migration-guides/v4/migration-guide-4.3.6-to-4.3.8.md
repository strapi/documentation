---
title: Migrate from 4.3.6 to 4.3.8 - Strapi Developer Docs
description: Learn how you can migrate your Strapi application from 4.3.6 to 4.3.8.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/migration-guide-4.3.6-to-4.3.8.html
---

# v4.3.6 to v4.3.8 migration guide

The Strapi v4.3.6 to v4.3.8 migration guide upgrades v4.3.6 to v4.3.8. The migration changes the SQLite database package from `sqlite3`  to `better-sqlite3`. The migration guide consists of:

- upgrading the application dependencies,
- changing the `sqlite3` package to `better-sqlite3`,
- reinitializing the application.

:::caution
 - This migration guide skips v4.3.7, which introduced an error in the SQLite database.
 
- [Plugins extension](/developer-docs/latest/plugins/users-permissions.md) that create custom code or modify existing code, will need to be updated and compared to the changes in the repository. Not updating the plugin extensions could break the application.
:::

## Upgrading the application dependencies

:::prerequisites
Stop the server before starting the upgrade.
:::

1. Upgrade all of the Strapi packages in `package.json` to `4.3.8`:

```json
// path: package.json

{
  // ...
  "dependencies": {
    "@strapi/strapi": "4.3.8",
    "@strapi/plugin-users-permissions": "4.3.8",
    "@strapi/plugin-i18n": "4.3.8",
    // ...
  }
}
```

2. Change the `sqlite3` package to `better-sqlite3` version `7.4.6` in `package.json`:

```json{9}
// path: package.json

{
  // ...
  "dependencies": {
    "@strapi/strapi": "4.3.8",
    "@strapi/plugin-users-permissions": "4.3.8",
    "@strapi/plugin-i18n": "4.3.8",
    "better-sqlite3": "7.4.6"
    // ...
  }
}

```

3. Save the edited `package.json` file.

4. Run either `yarn` or `npm install` to install the new version.

::: tip
If the operation doesn't work, try removing your `yarn.lock` or `package-lock.json`. If that doesn't help, remove the `node_modules` folder as well and try again.
:::

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/Rebuild-and-start-snippet.md)!!!
