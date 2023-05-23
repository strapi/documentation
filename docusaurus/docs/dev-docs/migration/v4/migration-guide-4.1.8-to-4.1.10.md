---
title: Migrate from 4.1.8+ to 4.1.10
displayed_sidebar: devDocsSidebar
description: Learn how you can migrate your Strapi application from 4.1.8+ to 4.1.10.

---
import PluginsCaution from '/docs/snippets/migrate-plugins-extension-caution.md'
import BuildCommand from '/docs/snippets/build-npm-yarn.md'
import DevelopCommand from '/docs/snippets/develop-npm-yarn.md'
import InstallCommand from '/docs/snippets/install-npm-yarn.md'

# v4.1.8+ to v4.1.10 migration guide

The Strapi v4.1.8+ to v4.1.10 migration guide upgrades versions of v4.1.8 and above to v4.1.10. This migration guide is needed only for users who experienced missing MIME types on their media when uploading media through the Content API (see [GitHub issue #12761](https://github.com/strapi/strapi/issues/12761)). The migration to 4.1.10 consists of 3 steps:

- Upgrading the application dependencies
- Installing database migration script (optional)
- Reinitializing the application

<PluginsCaution components={props.components} />

## Upgrading the application dependencies to 4.1.10

:::prerequisites
Stop the server before starting the upgrade.
:::

1. Upgrade all of the Strapi packages in the `package.json` to `4.1.10`:

```jsx title="path: ./package.json"

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

3. <InstallCommand components={props.components} />


## Installing database migration script (optional)

This step is only required if some files in your database have their MIME type set to `null` (see GitHub issue [#12761](https://github.com/strapi/strapi/issues/12761)).

To make sure Strapi can load the Media Library, the following migration script file must be added to `./database/migrations`. The script automatically sets MIME types for files that miss one, based on their filename. The script will be automatically executed only once at the next launch of Strapi.

To add the script:

1. In the `./database/migrations` folder, create a file named `2022.05.10T00.00.00.fill-files-mime-type.js`.
2. Copy and paste the following code into the previously created file:

```jsx title="path: ./database/migrations"
'use strict'

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

## Rebuild the application

<BuildCommand components={props.components} />

## Restart the application

<DevelopCommand components={props.components} />
