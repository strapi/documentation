---
title: Migrate from 4.7.0 to 4.11.4
displayed_sidebar: devDocsSidebar
description: Learn how you can migrate your Strapi application from 4.7.0 to 4.11.4.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/migration-guide-4.7.0-to-4.11.4.html
---

import PluginsCaution from '/docs/snippets/migrate-plugins-extension-caution.md'
import BuildCommand from '/docs/snippets/build-npm-yarn.md'
import DevelopCommand from '/docs/snippets/develop-npm-yarn.md'
import InstallCommand from '/docs/snippets/install-npm-yarn.md'

# v4.7.0 to v4.11.4 migration guide

The Strapi v4.7.0 to v4.11.4 migration guide upgrades v4.7.0 to v4.11.4. We updated how images are fetched in the Media Library, and some people had database records in the wrong state from old migrations. The migration guide consists of:

- Upgrading the application dependencies
- Installing database migration script (Optional)
- Reinitializing the application

<PluginsCaution components={props.components} />

<!-- TODO: explain what the migration focuses on (i.e. what breaking changes it fixes). -->

## Upgrading the application dependencies to 4.11.4

:::prerequisites
Stop the server before starting the upgrade.
:::

<!-- TODO: update version numbers below 👇 -->

1. Upgrade all of the Strapi packages in `package.json` to `4.11.4`:

   ```json title="path: package.json"
   {
     // ...
     "dependencies": {
       "@strapi/strapi": "4.11.4",
       "@strapi/plugin-users-permissions": "4.11.4",
       "@strapi/plugin-i18n": "4.11.4"
       // ...
     }
   }
   ```

2. Save the edited `package.json` file.

3. Run the install command:
   <InstallCommand components={props.components} />

## Installing database migration script (Optional)

Skip this step if you can see all images in your Media Library after updating to `4.11.4` or greater.

The issue with missing images in the Media Library is documented [here](https://github.com/strapi/strapi/issues/17228). In version `4.11.4`, the Media Library fetches files by their folder path. Root files should have a `/` path. Some users migrating from older versions had `NULL` values for root files' folder paths, causing the Media Library to appear empty. This migration updates those files folder paths to `/`.

To prepare the migration:

1. Make a backup of the database in case something unexpected happens.
2. In the `./database/migrations` folder, create a file named `2023.06.14T00.00.00.update-file-paths.js`.
3. Copy and paste the following code into the previously created file:

```jsx
"use strict";

const FILE_TABLE = "files";

async function up(trx) {
  // Updates file
  await trx
    .from(FILE_TABLE)
    .whereNull("folder_path")
    .update({ folder_path: "/" });
}

async function down() {}

module.exports = { up, down };
```

5. Save the file.

## Rebuild the application

<BuildCommand components={props.components} />

## Restart the application

<DevelopCommand components={props.components} />
