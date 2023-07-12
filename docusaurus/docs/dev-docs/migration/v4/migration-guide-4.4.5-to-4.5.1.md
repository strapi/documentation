---
title: Migrate from 4.4.5 to 4.5.1
displayed_sidebar: devDocsSidebar
description: Learn how you can migrate your Strapi application from 4.4.5 to 4.5.1.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/migration-guide-4.4.5-to-4.5.1.html
---
import PluginsCaution from '/docs/snippets/migrate-plugins-extension-caution.md'
import BuildCommand from '/docs/snippets/build-npm-yarn.md'
import DevelopCommand from '/docs/snippets/develop-npm-yarn.md'
import InstallCommand from '/docs/snippets/install-npm-yarn.md'

# v4.4.5 to v4.5.1 migration guide

The Strapi v4.4.5 to v4.5.1 migration guide upgrades v4.4.5 to v4.5.1. We introduced unique indexes on relationship tables and the application will not start if there are duplicated relationships. The migration guide consists of:

- Upgrading the application dependencies
- Installing database migration script (optional)
- Reinitializing the application

<PluginsCaution components={props.components} />

<!-- TODO: explain what the migration focuses on (i.e. what breaking changes it fixes). -->

## Upgrading the application dependencies to 4.5.1

:::prerequisites
Stop the server before starting the upgrade.
:::

<!-- TODO: update version numbers below 👇 -->

1. Upgrade all of the Strapi packages in `package.json` to `4.5.1`:

   ```json title="path: package.json"

   {
     // ...
     "dependencies": {
       "@strapi/strapi": "4.5.1",
       "@strapi/plugin-users-permissions": "4.5.1",
       "@strapi/plugin-i18n": "4.5.1"
       // ...
     }
   }
   ```

2. Save the edited `package.json` file.

3. Run the install command:
<InstallCommand components={props.components} />


## Installing database migration script (optional)

This step is only required if you have relationship duplicates in your application. If you have them, the application will not start and you will see an error message in the terminal similar to:

```
error: alter table <SOME_TABLE> add constraint <SOME_TABLE_INDEX>
unique (<COLUMN_NAME>, <COLUMN_NAME>) - could not create unique index <SOME_TABLE>
```

To remove the duplicated relationships easily, the following migration script file was created. It will automatically remove duplicates of any relationship in the database and will be executed only once at the next launch of Strapi.

To prepare the migration:

1. Make a backup of the database in case something unexpected happens.
2. Make sure you are migrating from a version greater than or equal to 4.4.5. If not, please migrate to the 4.4.5 version first, otherwise this script will not work.
3. In the `./database/migrations` folder, create a file named `2022.11.16T00.00.00.remove_duplicated_relationships.js`.
4. Copy and paste the following code into the previously created file:

```jsx
'use strict';

/**
 * Get the link tables names that need to be updated
 */
const getLinkTables = ({ strapi }) => {
  const contentTypes = strapi.db.metadata;
  const tablesToUpdate = {};

  contentTypes.forEach((contentType) => {
    // Get attributes
    const attributes = contentType.attributes;

    // For each relation type, add the joinTable name to tablesToUpdate
    Object.values(attributes).forEach((attribute) => {
      if (
        attribute.type === 'relation' &&
        attribute.joinTable &&
        !attribute.relation.startsWith('morph') // Ignore polymorphic relations
      ) {
        tablesToUpdate[attribute.joinTable.name] = attribute.joinTable;
      }
    });
  });

  return Object.values(tablesToUpdate);
};

async function up(trx) {
  const linkTablesToUpdate = getLinkTables({ strapi });

  // Remove duplicates from link tables
  for (const table of linkTablesToUpdate) {
    const tableExists = await trx.schema.hasTable(table.name);
    if (!tableExists) continue;

    strapi.log.info(`Deleting duplicates of table ${table.name}...`);

    try {
      // Query to delete duplicates from a link table
      let query = `
        CREATE TEMPORARY TABLE tmp as SELECT DISTINCT t2.id as id
        FROM ?? as t1 JOIN ?? as t2
        ON t1.id < t2.id
      `;
      const pivotWhereParams = [];

      // For each pivot column, add a on condition to the query
      table.pivotColumns.forEach(column => {
        query += ` AND t1.?? = t2.??`;
        pivotWhereParams.push(column, column);
      });

      // Create temporary table with the ids of the repeated rows
      await trx.raw(query, [table.name, table.name, ...pivotWhereParams]);

      // Delete repeated rows from the original table
      await trx.raw(`DELETE FROM ?? WHERE id in (SELECT * FROM tmp)`, [table.name]);
    } finally {
      // Drop temporary table
      await trx.raw(`DROP TABLE IF EXISTS tmp `);
    }
  }
}

async function down() {}

module.exports = { up, down };
```
5. Save the file. 

## Rebuild the application

<BuildCommand components={props.components} />

## Restart the application

<DevelopCommand components={props.components} />
