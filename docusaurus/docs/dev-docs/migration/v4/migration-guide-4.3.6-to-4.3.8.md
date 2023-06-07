---
title: Migrate from 4.3.6 to 4.3.8
displayed_sidebar: devDocsSidebar
description: Learn how you can migrate your Strapi application from 4.3.6 to 4.3.8.

---

import BuildCommand from '/docs/snippets/build-npm-yarn.md'
import DevelopCommand from '/docs/snippets/develop-npm-yarn.md'
import InstallCommand from '/docs/snippets/install-npm-yarn.md'

# v4.3.6 to v4.3.8 migration guide

The Strapi v4.3.6 to v4.3.8 migration guide upgrades v4.3.6 to v4.3.8. The migration changes the SQLite database package from `sqlite3`  to `better-sqlite3`. The migration guide consists of:

- upgrading the application dependencies,
- changing the `sqlite3` package to `better-sqlite3`,
- reinitializing the application.

:::caution
 - This migration guide skips v4.3.7, which introduced an error in the SQLite database.
 
- [Plugins extension](/dev-docs/plugins/users-permissions) that create custom code or modify existing code, will need to be updated and compared to the changes in the repository. Not updating the plugin extensions could break the application.
:::

## Upgrading the application dependencies

:::prerequisites
Stop the server before starting the upgrade.
:::

1. Upgrade all of the Strapi packages in `package.json` to `4.3.8`:

```json title="path: ./package.json"

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

```json title="path: ./package.json"

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

4. <InstallCommand components={props.components} />

## Rebuild the application

<BuildCommand components={props.components} />

## Restart the application

<DevelopCommand components={props.components} />

