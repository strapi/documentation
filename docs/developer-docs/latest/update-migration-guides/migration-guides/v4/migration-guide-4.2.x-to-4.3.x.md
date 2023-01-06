---
title: Migrate from 4.2.x to 4.3.x - Strapi Developer Docs
description: Learn how you can migrate your Strapi application from 4.2.x to 4.3.x.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/migration-guide-4.2.x+-to-4.3.x.html
---

# v4.2.x to v4.3.x migration guide

The Strapi v4.2.x to v4.3.x migration guide upgrades versions of v4.2.x and above to v4.3.x. This migration guide is needed for all TypeScript users who are using the default SQLite database configuration in their application. The migration to 4.3.3 consists of 3 steps:

- Upgrading the application dependencies
- Updating the database configuration script
- Reinitializing the application

## Upgrading the application dependencies to 4.3.x (x is the latest minor version of v4.3)

:::prerequisites
Stop the server before starting the upgrade. At the time of writing this, the latest version of Strapi is v4.3.3.
:::

1. Upgrade all of the Strapi packages in the `package.json` to `4.3.3` or higher:

```json
// path: package.json

{
  // ...
  "dependencies": {
    "@strapi/strapi": "4.3.3",
    "@strapi/plugin-users-permissions": "4.3.3",
    "@strapi/plugin-i18n": "4.3.3",
    // ...
  }
}

```

2. Save the edited `package.json` file.

3. Run either `yarn` or `npm install` to install the new version.

::: tip
If the operation doesn't work, try removing your `yarn.lock` or `package-lock.json`. If that doesn't help, remove the `node_modules` folder as well and try again.
:::

## Updating the database configuration script

This step is only required if you use the default SQLite database configuration in a TypeScript project.

To make sure you don't lose your data every time the development server restarts, you need to make a modification to the `./config/database.ts` file. This modification tells Strapi to use the correct file for your database.

To change the script:

1. In the `./config/database.ts` file, Identify the default SQLite database configuration.
2. Copy and paste the following line to the replace the `filename` key of the SQLite configuration:

```ts
filename: path.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')),
```

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/Rebuild-and-start-snippet.md)!!!
