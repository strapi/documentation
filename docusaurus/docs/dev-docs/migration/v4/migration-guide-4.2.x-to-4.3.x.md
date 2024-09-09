---
title: Migrate from 4.2.x to 4.3.x
displayed_sidebar: devDocsSidebar
description: Learn how you can migrate your Strapi application from 4.2.x to 4.3.x.

---

import PluginsCaution from '/docs/snippets/migrate-plugins-extension-caution.md'
import BuildCommand from '/docs/snippets/build-npm-yarn.md'
import DevelopCommand from '/docs/snippets/develop-npm-yarn.md'
import InstallCommand from '/docs/snippets/install-npm-yarn.md'

# v4.2.x to v4.3.x migration guide

The Strapi v4.2.x to v4.3.x migration guide upgrades versions of v4.2.x and above to v4.3.x. This migration guide is needed for all TypeScript users who are using the default SQLite database configuration in their application. The migration to 4.3.3 consists of 3 steps:

- Upgrading the application dependencies
- Updating the database configuration script
- Reinitializing the application

<PluginsCaution components={props.components} />

## Upgrading the application dependencies to 4.3.x

:::prerequisites
Stop the server before starting the upgrade. At the time of writing this, the latest version of Strapi is v4.3.3.
:::

1. Upgrade all of the Strapi packages in the `package.json` to `4.3.3` or higher:

```json title="path: ./package.json"

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

3. <InstallCommand components={props.components} />

  :::note
  If you are on a Node <=16.x version, you might get an error stating that the `cheerio` sub-dependency of of `@strapi/plugin-documentation` requires node >=18.17.

  The reason is that the version specifier for `cheerio` in Strapi >=4.2.x is `^1.0.0-rc.12`, which used to resolve to the version `1.0.0-rc.12` that supported Node v16, but now it resolves to `1.0.0` (non-rc) which has a requirement for Node >=18.17.
  
  As a workaround in yarn, you can add a resolution to your `package.json` that pins cheerio at the exact release candidate that still supports Node v16:

  ```json title="path: ./package.json"
  {
    // ...
    "resolutions": {
      "@strapi/plugin-documentation/**/cheerio": "1.0.0-rc.12"
    },
    // ...
  }
  ```
  Next, run `yarn` again. When you upgrade to a later Strapi version that supports Node 18, remove this resolution.
  :::

## Updating the database configuration script

This step is only required if you use the default SQLite database configuration in a TypeScript project.

To make sure you don't lose your data every time the development server restarts, you need to make a modification to the `./config/database.ts` file. This modification tells Strapi to use the correct file for your database.

To change the script:

1. In the `./config/database.ts` file, Identify the default SQLite database configuration.
2. Copy and paste the following line to the replace the `filename` key of the SQLite configuration:

```ts title="path: ./config/database.ts"
filename: path.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')),
```

## Rebuild the application

<BuildCommand components={props.components} />

## Restart the application

<DevelopCommand components={props.components} />
