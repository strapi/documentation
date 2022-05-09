---
title: Migrate from 4.1.8+ to 4.1.10 - Strapi Developer Docs
description: Learn how you can migrate your Strapi application from 4.1.8+ to 4.1.10.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/migration-guide-4.1.8+-to-4.1.10.html
---

# v4.1.8+ to v4.1.10 migration guide

The Strapi v4.1.8+ to v4.1.10 migration guide upgrades versions of v4.1.8 and above to v4.1.10. This migration guide is needed only for users who experienced missing mime-types on their media when uploading media through the content-api. Related GitHub issue [#12761](https://github.com/strapi/strapi/issues/12761). The migration to 4.1.10 consits of 3 steps:

- Upgrading the application dependencies
- Installing database migration script (optional)
- Reinitializing the application

## Upgrading the application dependencies to 4.1.10

:::prerequisites
Stop the server before starting the upgrade.
:::

1. Upgrade all of the Strapi packages in the `package.json` to `4.1.10`:

```jsx
// path: package.json

{
  // ...
  "dependencies": {
    "@strapi/strapi": "4.1.10",
    "@strapi/plugin-users-permissions": "4.1.10",
    "@strapi/plugin-i18n": "4.1.10",
    // ...
  }
}

```

2. Save the edited `package.json` file.

3. Run either `yarn` or `npm install` to install the new version.

::: tip
If the operation doesn't work, try removing your `yarn.lock` or `package-lock.json`. If that doesn't help, remove the `node_modules` folder as well and try again.
:::

## Installing database migration script (optional)

This step is only needed if you have files in your database that have the mime-type set to `null` (see GitHub issue [#12761](https://github.com/strapi/strapi/issues/12761)).

Based on the file names, the migration script will set the correct mime-type of each file in the database that currently don't have a mime-type. The script will automatically be executed by Strapi, only once, at the next launch of Strapi.

1. Create a file named `202205110000.fill-files-mime-type.js` in `database/migrations`
2. Copy paste the following code in the created file:

```jsx
'use strict'

// path: database/migrations

const mimeTypes = require('mime-types');

const BATCH_SIZE = 1000;
const FILE_TABLE = 'files';

async function up(trx) {
  let lastId = 0;
  while (true) {
    const files = await trx
      .select(['id', 'name'])
      .from(FILE_TABLE)
      .where('mime', null)
      .andWhere('id', '>', lastId)
      .orderBy('id', 'asc')
      .limit(BATCH_SIZE);

    const mimesMap = {};
    for (let file of files) {
      const mime = mimeTypes.lookup(file.name) || 'application/octet-stream';
      mimesMap[mime] = mimesMap[mime] || [];
      mimesMap[mime].push(file.id);
    }

    for (let mime of Object.keys(mimesMap)) {
      await trx.update({ mime }).from(FILE_TABLE).whereIn('id', mimesMap[mime]);
    }

    if (files.length < BATCH_SIZE) {
      break;
    }

    lastId = files[files.length - 1].id;
  }
}

async function down() {}

module.exports = { up, down };
```

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/Rebuild-and-start-snippet.md)!!!
